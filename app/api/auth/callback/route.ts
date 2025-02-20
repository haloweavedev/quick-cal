// app/api/auth/callback/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { GoogleCalendarService } from "@/lib/google-calendar";
import { getCalendarAccountCount, isLikelyWorkspaceEmail } from "@/lib/account-utils";

export async function GET(request: NextRequest) {
  try {
    // Ensure the user is authenticated
    const session = await auth();
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    
    // Read query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const labelParam = searchParams.get("label") || "";

    if (!userId) {
      return NextResponse.redirect(
        new URL("/dashboard/accounts?error=missing_userid", request.url)
      );
    }

    // Retrieve tokens from the session (populated via your NextAuth jwt/session callbacks)
    const token = session as any;
    const accessToken = token?.accessToken;
    const refreshToken = token?.refreshToken;
    const expiresAt = token?.accessTokenExpires;
    if (!accessToken) {
      console.error("No access token found in session");
      return NextResponse.redirect(
        new URL("/dashboard/accounts?error=token_missing", request.url)
      );
    }

    // Fetch the user's Google profile to get email, etc.
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!profileRes.ok) {
      console.error("Failed to fetch user info from Google");
      return NextResponse.redirect(
        new URL("/dashboard/accounts?error=profile_fetch_failed", request.url)
      );
    }
    const profile = await profileRes.json();

    // Determine a label for the calendar account
    const accountCount = await getCalendarAccountCount(userId);
    let label = labelParam;
    if (!label) {
      label = accountCount === 0
        ? (isLikelyWorkspaceEmail(profile.email) ? "Work Calendar" : "Primary Calendar")
        : (isLikelyWorkspaceEmail(profile.email) ? "Work Calendar" : "Personal Calendar");
    }

    // (Optional) Fetch calendar metadata (timezone, etc.)
    const calendarMetadata = await GoogleCalendarService.getCalendarMetadata(accessToken);

    // Upsert the CalendarAccount record
    const calendarAccount = await db.calendarAccount.upsert({
      where: {
        userId_email: { userId, email: profile.email },
      },
      update: {
        access_token: accessToken,
        refresh_token: refreshToken || "",
        expires_at: expiresAt || null,
        label,
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
        settings: {
          timeZone: calendarMetadata.timeZone || "UTC",
          backgroundColor: calendarMetadata.backgroundColor || null,
          foregroundColor: calendarMetadata.foregroundColor || null,
        },
      },
    });

    // (Optional) Trigger a sync of events immediately
    try {
      await GoogleCalendarService.syncEvents(calendarAccount);
    } catch (error) {
      console.error("Error syncing events during account creation:", error);
    }

    // Redirect to the Calendar Accounts page with a success message
    return NextResponse.redirect(
      new URL("/dashboard/accounts?success=account_connected", request.url)
    );

  } catch (error) {
    console.error("Error in OAuth callback:", error);
    return NextResponse.redirect(
      new URL("/dashboard/accounts?error=unknown", request.url)
    );
  }
}

// Helper to generate a random color for the calendar
function getRandomColor(): string {
  const colors = [
    "#4285F4", // Google Blue
    "#EA4335", // Google Red
    "#FBBC05", // Google Yellow
    "#34A853", // Google Green
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#F59E0B", // Amber
    "#10B981", // Emerald
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
