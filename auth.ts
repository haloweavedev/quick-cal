// auth.ts - Full updated version
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { checkEmailInUse, getRandomColor, isLikelyWorkspaceEmail } from "@/lib/account-utils";
import { GoogleCalendarService } from "@/lib/google-calendar";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar",
        },
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/error',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Early return if account or profile is missing
      if (!account || !profile || !profile.email) return true;
      
      // For non-Google providers, just allow the sign-in
      if (account.provider !== 'google') return true;
      
      try {
        // Check if this email is already connected as a secondary account
        const emailCheck = await checkEmailInUse(profile.email);
        
        if (emailCheck && emailCheck.accountExists && !emailCheck.isPrimary) {
          // This email is being used as a secondary account
          // We'll redirect to an error page explaining that they should use their primary account
          const redirectErrorUrl = 
            `/error?error=secondary_account&primaryEmail=${encodeURIComponent(emailCheck.ownerEmail || '')}`;
          
          return redirectErrorUrl;
        }
        
        // Otherwise, continue with sign-in
        return true;
      } catch (error) {
        console.error("Error during sign-in check:", error);
        return true; // Allow the sign-in even if our check fails
      }
    },
    
    // Handle both session and JWT callbacks safely
    async session({ session, user, token }) {
      // For database sessions
      if (user) {
        session.user.id = user.id;
        session.user.isAdmin = Boolean(user.isAdmin);
      }
      // For JWT sessions
      else if (token) {
        session.user.id = token.sub || token.id as string;
        session.user.isAdmin = Boolean(token.isAdmin);
        
        // Add access token to session
        if (token.accessToken) {
          (session as any).accessToken = token.accessToken;
          (session as any).refreshToken = token.refreshToken;
          (session as any).accessTokenExpires = token.accessTokenExpires;
        }
      }
      return session;
    },
    
    async jwt({ token, user, account }) {
      // Safely handle user object which might be undefined after initial sign-in
      if (user) {
        token.id = user.id;
        token.isAdmin = Boolean(user.isAdmin);
      }
      
      // Store Google access tokens if present
      if (account && account.provider === "google") {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at;
      }
      
      // Check if token needs refreshing
      if (token.accessTokenExpires && Date.now() > (token.accessTokenExpires as number * 1000)) {
        try {
          if (token.refreshToken) {
            const refreshResult = await GoogleCalendarService.refreshAccessToken(token.refreshToken as string);
            
            token.accessToken = refreshResult.accessToken;
            token.accessTokenExpires = refreshResult.expiresAt;
            // Keep the existing refresh token
          }
        } catch (error) {
          console.error('Error refreshing access token:', error);
          // Return the existing token even if refresh fails
        }
      }
      
      return token;
    },
  },
  events: {
    // Auto-connect primary account on sign-in
    async signIn({ user, account, profile, isNewUser }) {
      if (user?.id && account && account.provider === "google" && profile?.email) {
        try {
          console.log(`[AUTH] User signin, checking primary account status: ${user.id}`);
          
          // Check if a calendar account already exists for this user
          const existingAccount = await db.calendarAccount.findFirst({
            where: { 
              userId: user.id,
              isPrimary: true
            }
          });
          
          // If no primary account exists and we have tokens, create one
          if (!existingAccount && account.access_token) {
            console.log(`[AUTH] Creating primary account for user: ${user.id}`);
            
            // Store the primary calendar account
            await connectPrimaryCalendarAccount({
              userId: user.id, 
              email: profile.email,
              accessToken: account.access_token,
              refreshToken: account.refresh_token,
              expiresAt: account.expires_at,
              isPrimary: true
            });
          }
        } catch (error) {
          console.error("[AUTH] Failed to handle primary account during sign-in:", error);
          // Continue sign-in process even if this fails
        }
      }
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
});

// Helper function to connect primary calendar account
async function connectPrimaryCalendarAccount({
  userId,
  email,
  accessToken,
  refreshToken,
  expiresAt,
  isPrimary = true
}: {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  isPrimary?: boolean;
}) {
  try {
    console.log(`[AUTH] Connecting primary calendar account for user: ${userId}, email: ${email}`);
    
    // Get calendar metadata (timezone, etc.)
    const calendarMetadata = await GoogleCalendarService.getCalendarMetadata(accessToken);
    
    // Generate a color for the calendar
    const color = getRandomColor();
    
    // Determine an appropriate label
    const label = isPrimary ? "Primary Calendar" : (
      isLikelyWorkspaceEmail(email) ? "Work Calendar" : "Personal Calendar"
    );
    
    console.log(`[AUTH] Upserting calendar account with isPrimary=${isPrimary}`);
    
    // Upsert the CalendarAccount record
    const calendarAccount = await db.calendarAccount.upsert({
      where: { 
        userId_email: { userId, email } 
      },
      update: {
        access_token: accessToken,
        refresh_token: refreshToken || "",
        expires_at: expiresAt || null,
        isPrimary: isPrimary,
        label,
        updatedAt: new Date(),
      },
      create: {
        userId,
        label,
        provider: "google",
        email,
        access_token: accessToken,
        refresh_token: refreshToken || "",
        expires_at: expiresAt || null,
        color,
        isPrimary: isPrimary,
        settings: {
          timeZone: calendarMetadata.timeZone || "UTC",
          backgroundColor: calendarMetadata.backgroundColor || null,
          foregroundColor: calendarMetadata.foregroundColor || null,
        },
      },
    });
    
    console.log(`[AUTH] Calendar account created/updated: ${calendarAccount.id}, isPrimary=${calendarAccount.isPrimary}`);
    
    // If this is a primary account, ensure all other accounts are not primary
    if (isPrimary) {
      console.log(`[AUTH] Ensuring all other accounts are not primary`);
      await db.calendarAccount.updateMany({
        where: {
          userId,
          id: { not: calendarAccount.id },
        },
        data: {
          isPrimary: false,
        },
      });
    }
    
    // Trigger a sync of events
    try {
      console.log(`[AUTH] Syncing events for new account`);
      await GoogleCalendarService.syncEvents(calendarAccount);
    } catch (syncError) {
      console.error(`[AUTH] Error syncing events for new account:`, syncError);
      // Continue even if sync fails
    }
    
    return calendarAccount;
  } catch (error) {
    console.error("[AUTH] Error connecting primary calendar account:", error);
    throw error;
  }
}