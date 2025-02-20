// actions/auth.ts
"use server";

import { signIn } from "@/auth";

/**
 * Sign in with Google (primary login)
 */
export async function signInWithGoogle() {
  return signIn("google", {
    redirectTo: "/dashboard",
  });
}

/**
 * Connect Google Calendar as a primary account
 * Uses the built-in NextAuth flow
 * @param userId User ID
 * @param label Label for the calendar
 * @param isPrimary Whether this is the primary account
 */
export async function connectGoogleCalendar(
  userId: string, 
  label: string, 
  isPrimary: boolean = false
) {
  // Pass params to our custom callback handler
  return signIn("google", {
    callbackUrl: `/api/auth/callback/google?userId=${encodeURIComponent(userId)}&label=${encodeURIComponent(label)}&isPrimary=${isPrimary}`,
  });
}