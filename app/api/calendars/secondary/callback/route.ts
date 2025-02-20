import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { db } from '@/lib/db';
import { GoogleCalendarService } from '@/lib/google-calendar';
import { getRandomColor } from '@/lib/account-utils';

export async function GET(request: NextRequest) {
  console.log("[SECONDARY-CALLBACK] Starting callback processing");
  
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  
  // Log the entire URL for debugging
  console.log(`[SECONDARY-CALLBACK] Received callback URL: ${request.url}`);
  
  // If user denied or error from Google
  if (error) {
    console.error(`[SECONDARY-CALLBACK] OAuth error: ${error}`);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/accounts?error=google_oauth_denied`);
  }
  
  // 1. Verify 'state' param
  if (!state) {
    console.error("[SECONDARY-CALLBACK] Missing state parameter");
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/accounts?error=missing_state`);
  }

  let payload;
  try {
    // Use the same secret that was used to sign the state
    const stateSecret = process.env.NEXTAUTH_SECRET || 'oauth-state-secret';
    payload = verify(state, stateSecret);
    if (typeof payload === 'object' && payload !== null) {
      console.log(`[SECONDARY-CALLBACK] State verified:`, 
        { userId: payload.userId, label: payload.label });
    } else {
      console.error('[SECONDARY-CALLBACK] Invalid payload:', payload);
    }
  } catch (err) {
    console.error('[SECONDARY-CALLBACK] Invalid state token:', err);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/accounts?error=invalid_state`);
  }
  
  const { userId, label } = payload as { userId: string; label: string };
  
  // 2. Exchange 'code' for tokens
  if (!code) {
    console.error("[SECONDARY-CALLBACK] Missing code parameter");
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/accounts?error=missing_code`);
  }

  try {
    console.log(`[SECONDARY-CALLBACK] Exchanging code for tokens`);
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.AUTH_GOOGLE_ID!,
        client_secret: process.env.AUTH_GOOGLE_SECRET!,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/calendars/secondary/callback`,
        grant_type: 'authorization_code',
      })
    });
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('[SECONDARY-CALLBACK] Token exchange failed:', errorData);
      throw new Error(`Token exchange failed: ${errorData.error}`);
    }
    
    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;
    const expires_at = Math.floor(Date.now() / 1000) + (expires_in || 3600);
    console.log(`[SECONDARY-CALLBACK] Tokens received, expires in ${expires_in} seconds`);
    
    // 3. Fetch the user's email from Google
    console.log(`[SECONDARY-CALLBACK] Fetching user profile`);
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    
    if (!profileRes.ok) {
      const profileError = await profileRes.json();
      console.error('[SECONDARY-CALLBACK] Profile fetch failed:', profileError);
      throw new Error('Failed to fetch Google profile');
    }
    
    const profile = await profileRes.json();
    const email = profile.email;
    console.log(`[SECONDARY-CALLBACK] Profile email: ${email}`);
    
    // 4. Verify this isn't already a primary account for another user
    const existingAccount = await db.calendarAccount.findFirst({
      where: { 
        email, 
        isPrimary: true,
      }
    });
    
    if (existingAccount && existingAccount.userId !== userId) {
      console.error(`[SECONDARY-CALLBACK] Email is already a primary account for user: ${existingAccount.userId}`);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard/accounts?error=email_in_use&email=${encodeURIComponent(email)}`
      );
    }
    
    // 5. Create or update CalendarAccount record
    const color = getRandomColor();
    console.log(`[SECONDARY-CALLBACK] Upserting calendar account with color ${color}`);
    
    const calendarAccount = await db.calendarAccount.upsert({
      where: { userId_email: { userId, email } },
      update: {
        access_token,
        refresh_token: refresh_token || existingAccount?.refresh_token, // Keep existing refresh token if no new one
        expires_at,
        label,
        isPrimary: false, // Always false for secondary accounts
        updatedAt: new Date(),
      },
      create: {
        userId,
        provider: 'google',
        email,
        access_token,
        refresh_token: refresh_token || '',
        expires_at,
        label,
        color,
        isPrimary: false, // Always false for secondary accounts
      },
    });
    
    console.log(`[SECONDARY-CALLBACK] Calendar account created/updated: ${calendarAccount.id}`);
    
    // 6. Fetch & store calendar metadata, sync events
    try {
      console.log(`[SECONDARY-CALLBACK] Syncing events for new account`);
      await GoogleCalendarService.syncEvents(calendarAccount);
      console.log(`[SECONDARY-CALLBACK] Sync completed successfully`);
    } catch (syncError) {
      console.error(`[SECONDARY-CALLBACK] Sync failed:`, syncError);
      // Continue even if sync fails
    }
    
    // 7. Redirect back to accounts page
    console.log(`[SECONDARY-CALLBACK] Redirecting to success page`);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/accounts?success=secondary_connected`);

  } catch (err) {
    console.error('[SECONDARY-CALLBACK] Error connecting secondary account:', err);
    const errorMessage = (err as Error).message || 'Unknown error'; // Type assertion
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/accounts?error=secondary_connect_failed&message=${encodeURIComponent(errorMessage)}`);
  }
}