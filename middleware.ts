import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getCalendarAccountsWithStatus } from "@/lib/dashboard-data";

export default auth(async (req) => {
  const { auth: session, nextUrl } = req;
  const isLoggedIn = !!session;
  
  const isAuthPage = nextUrl.pathname === "/login";
  const isDashboardPage = nextUrl.pathname.startsWith("/dashboard");
  const isOnboardingPage = nextUrl.pathname.startsWith("/onboarding");
  
  // Allow callback and API routes to proceed 
  if (nextUrl.pathname.startsWith("/api/auth/callback") || 
      nextUrl.pathname.startsWith("/api/calendars/secondary")) {
    return NextResponse.next();
  }
  
  // Redirect unauthenticated users from protected pages to login
  if ((isDashboardPage || isOnboardingPage) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }
  
  // Redirect authenticated users from login to appropriate page
  if (isAuthPage && isLoggedIn) {
    // Check if user needs onboarding (no primary account)
    try {
      const accounts = await getCalendarAccountsWithStatus(session.user.id);
      
      // If no primary account exists, redirect to onboarding
      if (!accounts.some(acc => acc.isPrimary)) {
        return NextResponse.redirect(new URL("/onboarding/welcome", nextUrl));
      }
      
      // Otherwise, redirect to dashboard
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    } catch (error) {
      console.error("Error checking accounts in middleware:", error);
      // Default to dashboard if we can't check accounts
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }
  
  return NextResponse.next();
});

// Protected routes plus auth callback routes and secondary calendar routes
export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/onboarding/:path*",
    "/login",
    "/api/auth/callback/:path*",
    "/api/calendars/secondary/:path*"
  ],
};