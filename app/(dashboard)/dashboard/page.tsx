import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CalendarDays, ListTodo, Calendar, Plus, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getDashboardStats } from "@/lib/dashboard-data";
import { format } from "date-fns";
import { formatMeetingTime } from "@/lib/dashboard-data";
import { getAccountSyncStats } from "@/lib/account-utils";

export const metadata = {
  title: "Dashboard",
  description: "Your QuickCal dashboard - where productivity meets brutal honesty",
};

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  // Get dashboard stats
  const stats = await getDashboardStats(session.user.id);
  const accountStats = await getAccountSyncStats(session.user.id);
  const hasEvents = stats.upcomingMeetingsCount > 0;
  const hasAccounts = accountStats.totalAccounts > 0;
  
  // Add debug logging
  console.log(`[DASHBOARD] Account stats:`, JSON.stringify(accountStats));
  
  // Check if there's at least one primary account
  const hasPrimaryAccount = accountStats.hasPrimary;
  console.log(`[DASHBOARD] Has primary account: ${hasPrimaryAccount}`);

  // Show onboarding banner only if no primary account exists
  const showOnboardingBanner = !hasPrimaryAccount;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="heading-lg">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user.name || "Calendar Enthusiast"}. Let's judge your schedule.
          </p>
        </div>
        
        <Link href="/dashboard/accounts/add" className="brutalist-button-small inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Connect Calendar
        </Link>
      </div>
      
      {/* Onboarding Banner */}
      {showOnboardingBanner && (
        <div className="brutalist-box brutalist-purple">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-2">
              <h2 className="heading-sm text-white">Complete Your Setup</h2>
              <p className="text-white/90">
                Connect your primary calendar to unlock all QuickCal features.
              </p>
            </div>
            <Link href="/onboarding/connect-calendar" className="brutalist-button bg-white text-black whitespace-nowrap">
              Connect Primary Calendar
            </Link>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="brutalist-box">
          <CalendarDays className="h-8 w-8 mb-2" />
          <h2 className="text-2xl font-bold">{stats.upcomingMeetingsCount}</h2>
          <p className="text-sm">Upcoming meetings</p>
          <p className="text-xs italic mt-2">
            {stats.upcomingMeetingsCount === 0 
              ? "There are no meetings. Is that good... or sad?"
              : stats.upcomingMeetingsCount > 5 
                ? "That's a lot of meetings. Do you actually do any work?"
                : "Just a few meetings. Maintaining the illusion of productivity."}
          </p>
        </div>
        
        <div className="brutalist-box">
          <ListTodo className="h-8 w-8 mb-2" />
          <h2 className="text-2xl font-bold">{stats.pendingTasksCount}</h2>
          <p className="text-sm">Pending tasks</p>
          <p className="text-xs italic mt-2">
            {stats.pendingTasksCount === 0
              ? "Your task list is as empty as your social calendar."
              : stats.pendingTasksCount > 10
                ? "Overachiever or just bad at finishing things?"
                : "A manageable number of tasks. We're all impressed."}
          </p>
        </div>
        
        <div className="brutalist-box">
          <Calendar className="h-8 w-8 mb-2" />
          <h2 className="text-2xl font-bold">{accountStats.totalAccounts}</h2>
          <p className="text-sm">Connected calendars</p>
          <p className="text-xs italic mt-2">
            {accountStats.totalAccounts === 0
              ? "Add a calendar so I can judge your life choices."
              : accountStats.totalAccounts === 1
                ? "Just one calendar? Keeping it simple or hiding something?"
                : "Multiple calendars. Impressively complicated life."}
          </p>
        </div>
        
        <div className="brutalist-box">
          <Clock className="h-8 w-8 mb-2" />
          <h2 className="text-2xl font-bold">{stats.meetingHoursThisWeek} hrs</h2>
          <p className="text-sm">Meeting time this week</p>
          <p className="text-xs italic mt-2">
            {stats.meetingHoursThisWeek === 0
              ? "Impressive! You're completely unproductive."
              : stats.meetingHoursThisWeek > 20
                ? "Meetings: where work goes to die."
                : "A reasonable amount of meeting time. Are you actually getting things done?"}
          </p>
        </div>
      </div>
      
      <div className="brutalist-box">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="heading-md">Coming Up Next</h2>
            <p>Your upcoming events, judged accordingly.</p>
          </div>
          <Link href="/dashboard/calendar" className="brutalist-button-small mt-2 md:mt-0 inline-flex items-center gap-2">
            View Calendar <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        
        {hasEvents ? (
          <div className="space-y-4">
            {stats.upcomingMeetings.map((meeting) => (
              <div 
                key={meeting.id} 
                className="calendar-event" 
                style={{
                  borderLeftWidth: '6px', 
                  borderLeftColor: meeting.calendarAccount?.color || '#000'
                }}
              >
                <div className="flex justify-between">
                  <div><span className="font-bold">{meeting.title}</span></div>
                  <div className="text-xs">
                    {format(meeting.startTime, 'EEE, MMM d')} • {formatMeetingTime(meeting)}
                  </div>
                </div>
                {meeting.location && (
                  <div className="text-sm mt-1">📍 {meeting.location}</div>
                )}
                <div className="text-xs italic mt-1 text-red-600">
                  {meeting.title.toLowerCase().includes('meet') ? 
                    "AI NOTE: This meeting could've been an email." :
                  meeting.title.toLowerCase().includes('catch') ?
                    "AI NOTE: 'Catch-up' is code for 'waste time chatting'." :
                  meeting.allDay ?
                    "AI NOTE: All-day event? Planning to actually work at some point?" :
                    "AI NOTE: Another chance to pretend you're listening while checking emails."}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Calendar className="h-16 w-16 mx-auto mb-4 opacity-40" />
            <h3 className="heading-sm mb-2">No Upcoming Events</h3>
            <p className="max-w-md mx-auto mb-6">
              {hasAccounts ? 
                "Your calendar is emptier than a politician's promises. Either you're incredibly efficient or completely irrelevant." :
                "Your calendar is empty because you haven't connected any accounts. Connect your Google Calendar to get started."}
            </p>
            <Link href={hasAccounts ? "/dashboard/calendar" : "/dashboard/accounts/add"} className="brutalist-button-small">
              {hasAccounts ? "View Calendar" : "Connect Google Calendar"}
            </Link>
          </div>
        )}
      </div>
      
      {hasAccounts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="brutalist-box">
            <h2 className="heading-md mb-4">Quick Tasks</h2>
            <div className="py-8 text-center">
              <ListTodo className="h-10 w-10 mx-auto mb-4 opacity-40" />
              <h3 className="text-lg font-bold mb-2">Nothing to do</h3>
              <p className="max-w-md mx-auto">
                {hasEvents ?
                  "We could extract tasks from your meetings, but we don't think you'd do them anyway." :
                  "Either you're incredibly efficient or completely lazy. We're betting on the latter."}
              </p>
            </div>
          </div>
          
          <div className="brutalist-box">
            <h2 className="heading-md mb-4">Productivity Insights</h2>
            <div className="py-8 text-center">
              <svg className="w-10 h-10 mx-auto mb-4 opacity-40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 16V8C21 7.46957 20.7893 6.96086 20.4142 6.58579C20.0391 6.21071 19.5304 6 19 6H5C4.46957 6 3.96086 6.21071 3.58579 6.58579C3.21071 6.96086 3 7.46957 3 8V16C3 16.5304 3.21071 17.0391 3.58579 17.4142C3.96086 17.7893 4.46957 18 5 18H19C19.5304 18 20.0391 17.7893 20.4142 17.4142C20.7893 17.0391 21 16.5304 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 6V4C16 3.46957 15.7893 2.96086 15.4142 2.58579C15.0391 2.21071 14.5304 2 14 2H10C9.46957 2 8.96086 2.21071 8.58579 2.58579C8.21071 2.96086 8 3.46957 8 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 18V20C8 20.5304 8.21071 21.0391 8.58579 21.4142C8.96086 21.7893 9.46957 22 10 22H14C14.5304 22 15.0391 21.7893 15.4142 21.4142C15.7893 21.0391 16 20.5304 16 20V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3 className="text-lg font-bold mb-2">
                {hasEvents ? "Preliminary Analysis" : "No data available"}
              </h3>
              <p className="max-w-md mx-auto">
                {hasEvents ? 
                  `Based on your ${stats.upcomingMeetingsCount} upcoming meetings, you spend about ${stats.meetingHoursThisWeek} hours per week in meetings. That's ${stats.meetingHoursThisWeek > 10 ? "way too much" : "surprisingly reasonable"}.` :
                  "We need actual calendar data to judge your productivity. It's currently looking... non-existent."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}