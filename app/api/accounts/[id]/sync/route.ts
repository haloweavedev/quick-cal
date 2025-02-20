import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { GoogleCalendarService } from "@/lib/google-calendar";

/**
 * POST handler to manually sync a calendar account's events
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const accountId = params.id;

    // Verify the account belongs to this user
    const account = await db.calendarAccount.findUnique({
      where: {
        id: accountId,
        userId: session.user.id,
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Calendar account not found" },
        { status: 404 }
      );
    }

    // Check if the access token is expired
    const now = Math.floor(Date.now() / 1000);
    let accessToken = account.access_token;

    if (account.expires_at && account.expires_at < now && account.refresh_token) {
      try {
        // Refresh the token
        const { accessToken: newToken, expiresAt } = 
          await GoogleCalendarService.refreshAccessToken(account.refresh_token);
        
        // Update the token in the database
        await db.calendarAccount.update({
          where: { id: accountId },
          data: {
            access_token: newToken,
            expires_at: expiresAt,
          },
        });

        accessToken = newToken;
      } catch (error) {
        console.error("Failed to refresh token:", error);
        return NextResponse.json(
          { error: "Failed to refresh authentication token" },
          { status: 401 }
        );
      }
    }

    // Sync the events
    try {
      const eventCount = await GoogleCalendarService.syncEvents({
        ...account,
        access_token: accessToken,
      });

      return NextResponse.json({
        success: true,
        message: `Successfully synced ${eventCount} events`,
        syncedAt: new Date(),
      });
    } catch (error) {
      console.error("Failed to sync events:", error);
      return NextResponse.json(
        { error: "Failed to sync events" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in sync API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Support GET requests for form submissions
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const response = await POST(request, { params });
  
  // Redirect back to accounts page after sync
  const redirectUrl = new URL("/dashboard/accounts", request.url);
  
  if (response.status === 200) {
    redirectUrl.searchParams.set("success", "sync_complete");
  } else {
    redirectUrl.searchParams.set("error", "sync_failed");
  }
  
  return NextResponse.redirect(redirectUrl);
}