import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CalendarDays, Plus, Filter, ArrowLeft, ArrowRight } from "lucide-react";
import { format, getMonth, getYear } from "date-fns";
import { getCalendarMonthEvents, formatMeetingTime } from "@/lib/dashboard-data";
import { getCalendarAccountCount } from "@/lib/account-utils";

export const metadata = {
  title: "Calendar",
  description: "View and manage your events - if you have any",
};

export default async function CalendarPage({
  searchParams
}: {
  searchParams: { year?: string; month?: string }
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Get current date or date from query params
  const today = new Date();
  const currentYear = parseInt(searchParams.year || getYear(today).toString());
  const currentMonth = parseInt(searchParams.month || (getMonth(today) + 1).toString());
  
  // Format for display
  const currentMonthName = format(new Date(currentYear, currentMonth - 1), 'MMMM yyyy');

  // Get calendar data
  const calendarData = await getCalendarMonthEvents(session.user.id, currentYear, currentMonth);
  const accountsCount = await getCalendarAccountCount(session.user.id);
  const hasEvents = calendarData.totalEvents > 0;
  const hasAccounts = accountsCount > 0;

  // Calculate previous and next month links
  let prevMonth = currentMonth - 1;
  let prevYear = currentYear;
  if (prevMonth < 1) {
    prevMonth = 12;
    prevYear--;
  }

  let nextMonth = currentMonth + 1;
  let nextYear = currentYear;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear++;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="heading-lg">Calendar</h1>
          <p className="text-muted-foreground">
            View all your meetings in one judgmental place.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="brutalist-button-small inline-flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <Link href="/dashboard/calendar/new" className="brutalist-button-small inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Event
          </Link>
        </div>
      </div>

      {hasAccounts ? (
        <div className="brutalist-box">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <Link 
                href={`/dashboard/calendar?year=${prevYear}&month=${prevMonth}`} 
                className="brutalist-button-small p-1.5" 
                aria-label="Previous month"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <h2 className="text-xl font-bold">{currentMonthName}</h2>
              <Link 
                href={`/dashboard/calendar?year=${nextYear}&month=${nextMonth}`} 
                className="brutalist-button-small p-1.5" 
                aria-label="Next month"
              >
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link href={`/dashboard/calendar?year=${getYear(today)}&month=${getMonth(today) + 1}`} className="brutalist-button-small">Today</Link>
              <div className="flex border-2 border-black">
                <button className="px-3 py-1 font-bold border-r-2 border-black hover:bg-black hover:text-white transition-colors">Day</button>
                <button className="px-3 py-1 font-bold border-r-2 border-black bg-black text-white">Week</button>
                <button className="px-3 py-1 font-bold hover:bg-black hover:text-white transition-colors">Month</button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Calendar days header */}
              <div className="grid grid-cols-7 border-b-2 border-black">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="p-2 text-center font-bold">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 grid-rows-[auto]">
                {calendarData.grid.map((week, weekIndex) => (
                  week.map((day, dayIndex) => (
                    <div 
                      key={`${weekIndex}-${dayIndex}`} 
                      className={`border-b border-r border-black p-2 min-h-[120px] relative ${
                        dayIndex === 6 ? 'border-r-0' : ''
                      } ${
                        weekIndex === calendarData.grid.length - 1 ? 'border-b-0' : ''
                      } ${
                        !day.isCurrentMonth ? 'bg-gray-50' : ''
                      } ${
                        day.isToday ? 'bg-yellow-50' : ''
                      }`}
                    >
                      <span className={`text-sm ${day.isCurrentMonth ? 'font-bold' : 'opacity-40'} ${day.isToday ? 'brutalist-highlight' : ''}`}>
                        {day.date}
                      </span>
                      
                      <div className="mt-1 space-y-1 max-h-[90px] overflow-y-auto">
                        {day.events.map((event) => (
                          <div 
                            key={event.id}
                            className="text-xs p-1 truncate rounded"
                            style={{
                              backgroundColor: `${event.calendarAccount.color}30`,
                              borderLeft: `3px solid ${event.calendarAccount.color}`
                            }}
                            title={`${event.title} - ${formatMeetingTime(event)}`}
                          >
                            {event.allDay ? '● ' : `${format(event.startTime, 'HH:mm')} `}
                            {event.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="brutalist-box text-center py-12">
          <CalendarDays className="h-16 w-16 mx-auto mb-4 opacity-40" />
          <h3 className="heading-md mb-4">No Connected Calendars</h3>
          <p className="max-w-md mx-auto mb-6">
            Your calendar is as empty as your social life. Connect your Google Calendar so we have something to judge.
          </p>
          <Link href="/dashboard/accounts/add" className="brutalist-button inline-block">
            Connect Google Calendar
          </Link>
        </div>
      )}

      {hasAccounts && !hasEvents && (
        <div className="brutalist-box bg-[#f4f4f4]">
          <h3 className="heading-sm mb-4">Your Calendar is Empty</h3>
          <p className="mb-4">
            We've connected to your calendar, but it seems you have no events. Either you're:
          </p>
          <ul className="space-y-2 mb-6">
            <li className="flex gap-2 items-start">
              <span className="font-bold">1.</span>
              <p>Incredibly efficient and don't need meetings (unlikely)</p>
            </li>
            <li className="flex gap-2 items-start">
              <span className="font-bold">2.</span>
              <p>Completely irrelevant and nobody invites you to anything (more likely)</p>
            </li>
            <li className="flex gap-2 items-start">
              <span className="font-bold">3.</span>
              <p>Using another calendar we haven't connected yet (easily fixable)</p>
            </li>
          </ul>
          <div className="flex justify-center">
            <Link href="/dashboard/accounts/add" className="brutalist-button-small">
              Connect Another Calendar
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}