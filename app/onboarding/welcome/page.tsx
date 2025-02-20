import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Calendar, Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getCalendarAccountsWithStatus } from "@/lib/dashboard-data";

export default async function WelcomePage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }
  
  // Check if user already has accounts
  const accounts = await getCalendarAccountsWithStatus(session.user.id);
  
  // If user already has a primary account, redirect to dashboard
  if (accounts.some(acc => acc.isPrimary)) {
    redirect("/dashboard");
  }

  return (
    <div className="brutalist-box">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-black text-white rounded-full mb-4">
          <Calendar className="h-10 w-10" />
        </div>
        <h1 className="heading-lg mb-2">Welcome to QuickCal!</h1>
        <p className="text-lead max-w-lg mx-auto">
          Let&apos;s set up your account and connect your primary Google Calendar.
        </p>
      </div>
      
      <div className="space-y-6 mb-8">
        <div className="brutalist-box bg-[#f4f4f4]">
          <h2 className="heading-sm mb-4">Here&apos;s what we&apos;ll do:</h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold">Connect your primary Google Calendar</p>
                <p className="text-sm">This will be your main calendar in QuickCal.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold">Sync your events</p>
                <p className="text-sm">We&apos;ll pull in your existing calendar events so you can see them right away.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold">Set up your dashboard</p>
                <p className="text-sm">Customize your QuickCal experience with our AI-powered features.</p>
              </div>
            </li>
          </ul>
        </div>
        
        <div className="brutalist-box border-2 border-dashed">
          <h2 className="heading-sm mb-2">What permissions we need:</h2>
          <p className="mb-4 text-sm">
            QuickCal needs read access to your Google Calendar to provide our services. We&apos;ll never:
          </p>
          <ul className="space-y-1 text-sm">
            <li className="flex gap-2">
              <span>✓</span>
              <span>Create or delete your events without permission</span>
            </li>
            <li className="flex gap-2">
              <span>✓</span>
              <span>Share your calendar data with third parties</span>
            </li>
            <li className="flex gap-2">
              <span>✓</span>
              <span>Use your data for anything other than the features you see</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link 
          href="/onboarding/connect-calendar" 
          className="brutalist-purple brutalist-button inline-flex items-center justify-center gap-2"
        >
          Get Started
          <ArrowRight className="h-5 w-5" />
        </Link>
        
        <Link href="/dashboard" className="brutalist-button-small text-center">
          Skip for now
        </Link>
      </div>
      
      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>
          By proceeding, you agree to our{" "}
          <Link href="/terms" className="brutalist-underline">Terms of Service</Link> and{" "}
          <Link href="/privacy" className="brutalist-underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}