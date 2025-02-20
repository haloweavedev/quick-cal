// app/api/auth/callback/google/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth, handlers } from "@/auth";
import { db } from "@/lib/db";
import { GoogleCalendarService } from "@/lib/google-calendar";
import { getCalendarAccountCount, getRandomColor, isLikelyWorkspaceEmail } from "@/lib/account-utils";

export async function GET(request: NextRequest) {
  console.log("[CALLBACK] Starting Google OAuth callback");
  
  // Let NextAuth handle the standard Google OAuth callback first.
  const nextAuthResponse = await handlers.GET(request);

  // Read the custom query parameters from the callback URL.
  const { searchParams } = new URL(request.url);
  const labelParam = searchParams.get("label") || "";
  const userIdParam = searchParams.get("userId") || "";
  const isPrimaryParam = searchParams.get("isPrimary") === "true";
  
  console.log(`[CALLBACK] Params - Label: "${labelParam}", isPrimary: ${isPrimaryParam}, userId: "${userIdParam}"`);

  // Get the session to access user info and tokens.
  const session = await auth();
  if (!session?.user) {
    console.error("[CALLBACK] No session found in callback");
    return nextAuthResponse;
  }
  
  // Use either the passed userId or the one from the session
  const userId = userIdParam || session.user.id;
  console.log(`[CALLBACK] Using User ID: ${userId}`);
  
  const token = session as any;
  const accessToken = token?.accessToken;
  const refreshToken = token?.refreshToken;
  const expiresAt = token?.accessTokenExpires;
  
  if (!accessToken) {
    console.error("[CALLBACK] No access token in session");
    return NextResponse.redirect(
      new URL("/dashboard/accounts?error=token_missing", request.url)
    );
  }

  // Fetch the user's Google profile to get their email.
  console.log("[CALLBACK] Fetching Google profile");
  const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  if (!profileRes.ok) {
    console.error("[CALLBACK] Failed to fetch Google profile");
    return NextResponse.redirect(
      new URL("/dashboard/accounts?error=profile_fetch_failed", request.url)
    );
  }
  
  const profile = await profileRes.json();
  console.log(`[CALLBACK] Profile email: ${profile.email}`);

  // Check if user already has accounts
  const accountCount = await getCalendarAccountCount(userId);
  console.log(`[CALLBACK] Existing account count: ${accountCount}`);
  
  // Determine the label
  let label = labelParam;
  if (!label) {
    // Fallback if no label was passed
    label = accountCount === 0
      ? (isLikelyWorkspaceEmail(profile.email) ? "Work Calendar" : "Primary Calendar")
      : (isLikelyWorkspaceEmail(profile.email) ? "Work Calendar" : "Personal Calendar");
  }
  
  // Logic for determining primary status
  // If it's the first account or explicitly set as primary
  let isPrimary = accountCount === 0 || isPrimaryParam;
  console.log(`[CALLBACK] Setting isPrimary = ${isPrimary}`);

  try {
    // Get calendar metadata (timezone, etc.)
    console.log("[CALLBACK] Fetching calendar metadata");
    const calendarMetadata = await GoogleCalendarService.getCalendarMetadata(accessToken);
    
    // Check if this account already exists
    const existingAccount = await db.calendarAccount.findUnique({
      where: { 
        userId_email: { 
          userId, 
          email: profile.email 
        } 
      },
    });
    
    if (existingAccount) {
      console.log(`[CALLBACK] Account already exists, updating: ${existingAccount.id}`);
      // If existing is primary, keep it primary unless explicitly changing
      isPrimary = isPrimaryParam ? isPrimary : existingAccount.isPrimary;
    }

    // Upsert the CalendarAccount record in the database.
    console.log(`[CALLBACK] Upserting calendar account (isPrimary=${isPrimary})`);
    
    const calendarAccount = await db.calendarAccount.upsert({
      where: { 
        userId_email: { 
          userId, 
          email: profile.email 
        } 
      },
      update: {
        access_token: accessToken,
        refresh_token: refreshToken || existingAccount?.refresh_token || "",
        expires_at: expiresAt || null,
        label,
        isPrimary,
        updatedAt: new Date(),
      },
      create: {
        userId,
        label,
        provider: "google",
        email: profile.email,
        access_token: accessToken,
        refresh_token: refreshToken || "",
        expires_at: expiresAt || null,
        color: getRandomColor(),
        isPrimary,
        settings: {
          timeZone: calendarMetadata.timeZone || "UTC",
          backgroundColor: calendarMetadata.backgroundColor || null,
          foregroundColor: calendarMetadata.foregroundColor || null,
        },
      },
    });
    console.log(`[CALLBACK] Calendar account created/updated: id=${calendarAccount.id}, isPrimary=${calendarAccount.isPrimary}`);

    // If this is a primary account, ensure all other accounts are not primary
    if (isPrimary) {
      console.log("[CALLBACK] Setting other accounts to non-primary");
      const result = await db.calendarAccount.updateMany({
        where: {
          userId,
          id: { not: calendarAccount.id },
        },
        data: {
          isPrimary: false,
        },
      });
      console.log(`[CALLBACK] Updated ${result.count} other accounts to non-primary`);
    }

    // Trigger an immediate sync of events.
    try {
      console.log("[CALLBACK] Starting calendar sync");
      await GoogleCalendarService.syncEvents(calendarAccount);
      console.log("[CALLBACK] Calendar sync completed");
    } catch (syncError) {
      console.error("[CALLBACK] Error syncing events:", syncError);
      // Continue even if sync fails - we'll retry later
    }

    // Redirect to the Calendar Accounts page with a success message
    console.log("[CALLBACK] Redirecting to success page");
    return NextResponse.redirect(
      new URL("/dashboard/accounts?success=account_connected", request.url)
    );
  } catch (error) {
    console.error("[CALLBACK] Error in OAuth callback:", error);
    return NextResponse.redirect(
      new URL("/dashboard/accounts?error=unknown", request.url)
    );
  }
}