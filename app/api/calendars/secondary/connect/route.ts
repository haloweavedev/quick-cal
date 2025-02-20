import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sign } from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  console.log('[SECONDARY-CONNECT] Starting connection process');
  
  // 1. Check user is authenticated
  const session = await auth();
  if (!session?.user) {
    console.error('[SECONDARY-CONNECT] No authenticated user');
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // 2. Get label from query params
  const url = new URL(request.url);
  const label = url.searchParams.get('label') || 'Secondary Calendar';
  
  console.log(`[SECONDARY-CONNECT] Connecting calendar with label: ${label} for user: ${session.user.id}`);

  // 3. Generate a secure state param to store userId + label
  const statePayload = {
    userId: session.user.id,
    label,
    timestamp: Date.now(),
  };
  
  // Security note: In production, use a strong secret from env vars
  const stateSecret = process.env.NEXTAUTH_SECRET || 'oauth-state-secret';
  const state = sign(statePayload, stateSecret, { expiresIn: '15m' });

  // 4. Build the Google OAuth URL manually
  // IMPORTANT: Use the exact client ID and redirect URI configured in Google Cloud Console
  const params = new URLSearchParams({
    client_id: process.env.AUTH_GOOGLE_ID!,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/calendars/secondary/callback`,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar',
    access_type: 'offline',
    prompt: 'consent', // Force consent screen to ensure we get refresh token
    state,
  });

  const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  console.log(`[SECONDARY-CONNECT] Redirecting to: ${googleOAuthUrl}`);

  // 5. Redirect user to Google
  return NextResponse.redirect(googleOAuthUrl);
}