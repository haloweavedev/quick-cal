import { db } from "@/lib/db";
import { CalendarAccount } from "@prisma/client";

/**
 * Google Calendar API service
 * Handles interaction with Google Calendar API
 */
export class GoogleCalendarService {
  /**
   * Fetch events from Google Calendar
   * @param accessToken Google OAuth access token
   * @param timeMin Start date (ISO string)
   * @param timeMax End date (ISO string)
   * @returns Array of Google Calendar events
   */
  static async fetchEvents(
    accessToken: string,
    timeMin: string = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    timeMax: string = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days in future
  ) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime&maxResults=1000`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Google Calendar API error:", errorData);
        throw new Error(`Failed to fetch calendar events: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error("Error fetching Google Calendar events:", error);
      throw error;
    }
  }

  /**
   * Process and store events in database
   * @param calendarAccount The calendar account to fetch events for
   * @returns Number of events processed
   */
  static async syncEvents(calendarAccount: CalendarAccount) {
    try {
      // First, check if token refresh is needed
      const now = Math.floor(Date.now() / 1000);
      let accessToken = calendarAccount.access_token;

      if (calendarAccount.expires_at && calendarAccount.expires_at < now && calendarAccount.refresh_token) {
        try {
          console.log(`[CALENDAR-SERVICE] Refreshing token for account ${calendarAccount.id}`);
          const { accessToken: newToken, expiresAt } = 
            await this.refreshAccessToken(calendarAccount.refresh_token);
          
          // Update token in the database
          await db.calendarAccount.update({
            where: { id: calendarAccount.id },
            data: {
              access_token: newToken,
              expires_at: expiresAt,
            },
          });

          accessToken = newToken;
          console.log(`[CALENDAR-SERVICE] Token refreshed successfully`);
        } catch (refreshError) {
          console.error(`[CALENDAR-SERVICE] Token refresh failed:`, refreshError);
          // If refresh fails, we'll attempt to use the existing token
          // but it will likely fail as well
        }
      }
      
      // Fetch events from Google Calendar
      console.log(`[CALENDAR-SERVICE] Fetching events for account ${calendarAccount.id}`);
      const events = await this.fetchEvents(accessToken);
      console.log(`[CALENDAR-SERVICE] Fetched ${events.length} events`);
      
      // Process each event
      let eventCount = 0;
      for (const event of events) {
        // Skip events without a summary/title
        if (!event.summary) continue;
        
        // Format start/end times
        const startTime = event.start.dateTime || `${event.start.date}T00:00:00Z`;
        const endTime = event.end.dateTime || `${event.end.date}T23:59:59Z`;
        const allDay = !event.start.dateTime;
        
        // Create or update the meeting in database
        await db.meeting.upsert({
          where: {
            calendarAccountId_externalId: {
              calendarAccountId: calendarAccount.id,
              externalId: event.id,
            },
          },
          create: {
            calendarAccountId: calendarAccount.id,
            userId: calendarAccount.userId,
            externalId: event.id,
            title: event.summary,
            description: event.description || '',
            location: event.location || '',
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            allDay,
            recurringEventId: event.recurringEventId,
            attendees: event.attendees || [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          update: {
            title: event.summary,
            description: event.description || '',
            location: event.location || '',
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            allDay,
            recurringEventId: event.recurringEventId,
            attendees: event.attendees || [],
            updatedAt: new Date(),
          },
        });
        
        eventCount++;
      }
      
      // Update last synced timestamp
      await db.calendarAccount.update({
        where: { id: calendarAccount.id },
        data: { 
          lastSynced: new Date(),
          isActive: true, // Mark as active since sync succeeded
        },
      });
      
      console.log(`[CALENDAR-SERVICE] Synced ${eventCount} events for account ${calendarAccount.id}`);
      return eventCount;
    } catch (error) {
      console.error(`[CALENDAR-SERVICE] Error syncing events for account ${calendarAccount.id}:`, error);
      
      // If the error is related to authentication, mark the account as inactive
      if (error instanceof Error && 
          (error.message.includes('401') || 
           error.message.includes('403') || 
           error.message.includes('authentication'))) {
        await db.calendarAccount.update({
          where: { id: calendarAccount.id },
          data: { 
            isActive: false,
            // Don't update lastSynced since it failed
          },
        });
        console.log(`[CALENDAR-SERVICE] Marked account ${calendarAccount.id} as inactive due to authentication error`);
      }
      
      throw error;
    }
  }

  /**
   * Get calendar metadata (timezone, etc)
   * @param accessToken Google OAuth access token
   * @returns Calendar metadata
   */
  static async getCalendarMetadata(accessToken: string) {
    try {
      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch calendar metadata: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching calendar metadata:", error);
      throw error;
    }
  }

  /**
   * Refresh Google OAuth token
   * @param refreshToken Google OAuth refresh token
   * @returns New access token and expiry
   */
  static async refreshAccessToken(refreshToken: string) {
    try {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.AUTH_GOOGLE_ID!,
          client_secret: process.env.AUTH_GOOGLE_SECRET!,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
      });

      const tokens = await response.json();
      
      if (!response.ok) {
        throw new Error(`Failed to refresh token: ${tokens.error} - ${tokens.error_description || ''}`);
      }

      return {
        accessToken: tokens.access_token,
        expiresAt: Math.floor(Date.now() / 1000) + tokens.expires_in,
      };
    } catch (error) {
      console.error("Error refreshing access token:", error);
      throw error;
    }
  }
  
  /**
   * Background sync for all active accounts
   * Should be called from a scheduled job
   */
  static async syncAllAccounts() {
    console.log(`[CALENDAR-SERVICE] Starting background sync for all accounts`);
    
    try {
      // Get all active accounts that need syncing
      // Sync accounts that haven't been synced in the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const accounts = await db.calendarAccount.findMany({
        where: {
          isActive: true,
          syncEnabled: true,
          OR: [
            { lastSynced: null },
            { lastSynced: { lt: oneHourAgo } }
          ]
        },
      });
      
      console.log(`[CALENDAR-SERVICE] Found ${accounts.length} accounts to sync`);
      
      // Process each account
      for (const account of accounts) {
        try {
          await this.syncEvents(account);
          // Sleep briefly between accounts to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (accountError) {
          console.error(`[CALENDAR-SERVICE] Error syncing account ${account.id}:`, accountError);
          // Continue with other accounts even if one fails
        }
      }
      
      console.log(`[CALENDAR-SERVICE] Completed background sync for all accounts`);
      return accounts.length;
    } catch (error) {
      console.error(`[CALENDAR-SERVICE] Failed to run background sync:`, error);
      throw error;
    }
  }
}