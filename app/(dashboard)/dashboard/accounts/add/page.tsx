import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ArrowLeft, Calendar, Shield, AlertCircle } from "lucide-react";
import AddAccountForm from "@/components/dashboard/add-account-form";
import { getCalendarAccountsWithStatus } from "@/lib/dashboard-data";

export const metadata = {
  title: "Connect Calendar",
  description: "Connect your Google Calendar to QuickCal",
};

export default async function AddAccountPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }
  
  // Check if user already has a primary account
  const accounts = await getCalendarAccountsWithStatus(session.user.id);
  const hasPrimaryAccount = accounts.some(acc => acc.isPrimary);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <Link 
          href="/dashboard/accounts" 
          className="brutalist-button-small inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="heading-md">Connect Calendar</h1>
      </div>

      <div className="brutalist-box">
        <h2 className="heading-sm mb-4">
          {hasPrimaryAccount 
            ? "Add an Additional Google Calendar" 
            : "Connect Your Primary Google Calendar"}
        </h2>
        
        {hasPrimaryAccount ? (
          <p className="mb-6">
            Add another Google Calendar account to consolidate all your events in one place. 
            Each additional calendar will be synchronized separately.
          </p>
        ) : (
          <p className="mb-6">
            To get started with QuickCal, connect your main Google Calendar account.
            This will be set as your primary calendar for scheduling and AI features.
          </p>
        )}

        <AddAccountForm 
          userId={session.user.id} 
          isPrimary={!hasPrimaryAccount}
        />
      </div>

      <div className="brutalist-box bg-[#f4f4f4]">
        <h3 className="heading-sm mb-4">What to Expect</h3>
        <div className="space-y-5">
          <div className="flex gap-3 items-start">
            <Calendar className="h-5 w-5 shrink-0 mt-1" />
            <div>
              <strong>View all your calendars in one place</strong>
              <p className="text-sm">After connecting, we'll sync your events and display them in your QuickCal dashboard.</p>
            </div>
          </div>
          
          <div className="flex gap-3 items-start">
            <Shield className="h-5 w-5 shrink-0 mt-1" />
            <div>
              <strong>Privacy & Permissions</strong>
              <p className="text-sm">QuickCal only reads your calendar data. We'll never modify or delete your events without explicit permission.</p>
            </div>
          </div>
          
          <div className="flex gap-3 items-start">
            <AlertCircle className="h-5 w-5 shrink-0 mt-1" />
            <div>
              <strong>Google OAuth Permission</strong>
              <p className="text-sm">You'll be redirected to Google to grant QuickCal access to your calendar. You can revoke this access anytime.</p>
            </div>
          </div>
        </div>
      </div>
      
      {hasPrimaryAccount && (
        <div className="brutalist-box border-2 border-dashed">
          <h3 className="heading-sm mb-2">About Additional Calendars</h3>
          <p className="mb-4">
            Additional calendars are displayed alongside your primary calendar, making it easy to see all your events in one view.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span>✓</span>
              <span>Events appear in your unified calendar view</span>
            </li>
            <li className="flex gap-2">
              <span>✓</span>
              <span>AI insights work across all connected calendars</span>
            </li>
            <li className="flex gap-2">
              <span>✓</span>
              <span>Each calendar gets a unique color for easy identification</span>
            </li>
            <li className="flex gap-2">
              <span>✓</span>
              <span>Sync settings can be configured individually per calendar</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}