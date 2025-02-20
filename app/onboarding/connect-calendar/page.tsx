import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import AddAccountForm from "@/components/dashboard/add-account-form";
import { getCalendarAccountsWithStatus } from "@/lib/dashboard-data";

export default async function ConnectCalendarPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Check if user already has accounts
  const accounts = await getCalendarAccountsWithStatus(session.user.id);

  // If user already has a primary account, redirect to dashboard
  if (accounts.some((acc) => acc.isPrimary)) {
    redirect("/dashboard");
  }

  return (
    <div className="brutalist-box">
      <div className="mb-8">
        <Link 
          href="/onboarding/welcome" 
          className="brutalist-button-small inline-flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="text-center">
          <h1 className="heading-md mb-2">Connect Your Primary Calendar</h1>
          <p className="max-w-lg mx-auto">
            Connect your main Google Calendar to get started with QuickCal.
            This will be set as your primary calendar.
          </p>
        </div>
      </div>

      <div className="brutalist-box bg-white mb-8">
        <h2 className="heading-sm mb-4">Connect Your Google Calendar</h2>
        <AddAccountForm 
          userId={session.user.id} 
          isPrimary={true}
        />
      </div>

      <div className="brutalist-box bg-[#f4f4f4] mb-8">
        <h3 className="heading-sm mb-4">What happens next?</h3>
        <ol className="space-y-4">
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
              1
            </div>
            <div>
              <p className="font-bold">Google authentication</p>
              <p className="text-sm">
                You&apos;ll be redirected to Google to approve QuickCal&apos;s access to your calendar.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
              2
            </div>
            <div>
              <p className="font-bold">Initial synchronization</p>
              <p className="text-sm">
                We&apos;ll sync your calendar events (this may take a moment for large calendars).
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
              3
            </div>
            <div>
              <p className="font-bold">Ready to use</p>
              <p className="text-sm">
                You&apos;ll be taken to your dashboard where you can start using QuickCal&apos;s features.
              </p>
            </div>
          </li>
        </ol>
      </div>

      <div className="text-center">
        <Link href="/dashboard" className="brutalist-button-small text-center">
          Skip for now
        </Link>
        <p className="mt-4 text-sm text-muted-foreground">
          You can always connect your calendar later from the dashboard.
        </p>
      </div>
    </div>
  );
}