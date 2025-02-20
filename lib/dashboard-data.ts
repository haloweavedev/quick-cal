import { db } from "./db";
import { CalendarAccount, Meeting } from "@prisma/client";
import {
  addDays,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  format,
} from "date-fns";

/**
 * Get dashboard statistics for a user
 * @param userId User ID
 * @returns Dashboard statistics
 */
export async function getDashboardStats(userId: string) {
  const now = new Date();
  const startOfToday = startOfDay(now);
  const endOfToday = endOfDay(now);
  const nextWeekEnd = endOfDay(addDays(now, 7));

  // Get accounts count
  const accountsCount = await db.calendarAccount.count({
    where: { userId },
  });

  // Get upcoming meetings (next 7 days)
  const upcomingMeetings = await db.meeting.findMany({
    where: {
      userId,
      startTime: {
        gte: startOfToday,
        lte: nextWeekEnd,
      },
    },
    orderBy: {
      startTime: "asc",
    },
    include: {
      calendarAccount: true,
    },
    take: 5, // Limit to 5 upcoming meetings
  });

  // Get today's meetings
  const todayMeetings = await db.meeting.findMany({
    where: {
      userId,
      startTime: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
    orderBy: {
      startTime: "asc",
    },
    include: {
      calendarAccount: true,
    },
  });

  // Calculate meeting hours this week
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Week starts on Monday
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const weekMeetings = await db.meeting.findMany({
    where: {
      userId,
      startTime: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
  });

  let meetingHoursThisWeek = 0;
  for (const meeting of weekMeetings) {
    // Skip all-day events from hour calculation or use a flat rate (e.g., 1 hour)
    if (meeting.allDay) {
      meetingHoursThisWeek += 1; // Count all-day events as 1 hour for stats
    } else {
      const durationMs = meeting.endTime.getTime() - meeting.startTime.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);
      meetingHoursThisWeek += durationHours;
    }
  }

  // Get pending tasks count (if we add tasks in the future)
  const pendingTasksCount = await db.task.count({
    where: {
      userId,
      status: {
        not: "done",
      },
    },
  });

  return {
    accountsCount,
    upcomingMeetingsCount: upcomingMeetings.length,
    upcomingMeetings,
    todayMeetings,
    meetingHoursThisWeek: Math.round(meetingHoursThisWeek * 10) / 10, // Round to 1 decimal place
    pendingTasksCount,
  };
}

/**
 * Get calendar accounts for a user with sync status
 * @param userId User ID
 * @returns Calendar accounts with sync status
 */
export async function getCalendarAccountsWithStatus(userId: string) {
  console.log(`[DASHBOARD-DATA] Fetching accounts for user ${userId}`);
  const accounts = await db.calendarAccount.findMany({
    where: { userId },
    orderBy: [
      { isPrimary: "desc" }, // Primary accounts first
      { createdAt: "asc" }, // Then by creation date
    ],
  });

  if (accounts.length > 0) {
    console.log(
      `[DASHBOARD-DATA] Found ${accounts.length} accounts. Primary status:`,
      accounts.map((a) => ({ id: a.id, email: a.email, isPrimary: a.isPrimary }))
    );
  } else {
    console.log(`[DASHBOARD-DATA] No accounts found for user ${userId}`);
  }

  // Enhance with additional status information
  return Promise.all(
    accounts.map(async (account) => {
      const meetingsCount = await db.meeting.count({
        where: { calendarAccountId: account.id },
      });

      const syncStatus = getSyncStatus(account);

      const result = {
        ...account,
        meetingsCount,
        syncStatus,
      };

      return result;
    })
  );
}

/**
 * Determine sync status based on lastSynced timestamp
 * @param account Calendar account
 * @returns Sync status object
 */
function getSyncStatus(account: CalendarAccount) {
  if (!account.lastSynced) {
    return {
      status: "never",
      label: "Never synced",
      needsSync: true,
    };
  }

  const hoursSinceSync =
    (Date.now() - account.lastSynced.getTime()) / (1000 * 60 * 60);

  if (hoursSinceSync < 1) {
    return {
      status: "recent",
      label: "Recently synced",
      needsSync: false,
    };
  } else if (hoursSinceSync < 24) {
    return {
      status: "today",
      label: `Synced ${Math.round(hoursSinceSync)} hours ago`,
      needsSync: false,
    };
  } else {
    return {
      status: "outdated",
      label: `Last synced ${Math.floor(hoursSinceSync / 24)} days ago`,
      needsSync: true,
    };
  }
}

/**
 * Format meeting time for display
 * @param meeting Meeting object
 * @returns Formatted time string
 */
export function formatMeetingTime(meeting: Meeting) {
  if (meeting.allDay) {
    return "All day";
  }

  const startTime = format(meeting.startTime, "h:mm a");
  const endTime = format(meeting.endTime, "h:mm a");
  return `${startTime} - ${endTime}`;
}

/**
 * Get calendar events organized into a calendar grid
 * @param userId User ID
 * @param year Year
 * @param month Month (1-12)
 * @returns Calendar grid with events
 */
export async function getCalendarMonthEvents(userId: string, year: number, month: number) {
  // Get first day of the month
  const firstDay = new Date(year, month - 1, 1);
  // Get last day of the month
  const lastDay = new Date(year, month, 0);
  
  // Calculate week day of first day (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = firstDay.getDay();
  // Calculate total days in the month
  const totalDays = lastDay.getDate();
  
  // Get events for this month
  const events = await db.meeting.findMany({
    where: {
      userId,
      startTime: {
        gte: firstDay,
        lte: lastDay,
      },
    },
    include: {
      calendarAccount: true,  // Include the calendar account info
    },
    orderBy: {
      startTime: 'asc',
    },
  });
  
  // Organize events by day
  const eventsByDay: { [day: number]: any[] } = {};
  events.forEach(event => {
    const day = event.startTime.getDate();
    if (!eventsByDay[day]) {
      eventsByDay[day] = [];
    }
    eventsByDay[day].push(event);
  });
  
  // Organize calendar into grid (6 weeks x 7 days)
  const grid = [];
  let dayCounter = 1;
  let daysInPreviousMonth = new Date(year, month - 1, 0).getDate();
  
  // Calculate how many days from previous month to show
  const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Adjust for Monday start
  
  for (let week = 0; week < 6; week++) {
    const weekDays = [];
    
    for (let day = 0; day < 7; day++) {
      if (week === 0 && day < daysFromPrevMonth) {
        // Show days from previous month
        const prevMonthDay = daysInPreviousMonth - daysFromPrevMonth + day + 1;
        weekDays.push({
          date: prevMonthDay,
          isCurrentMonth: false,
          events: [],
        });
      } else if (dayCounter > totalDays) {
        // Show days from next month
        const nextMonthDay = dayCounter - totalDays;
        weekDays.push({
          date: nextMonthDay,
          isCurrentMonth: false,
          events: [],
        });
        dayCounter++;
      } else {
        // Current month days
        weekDays.push({
          date: dayCounter,
          isCurrentMonth: true,
          events: eventsByDay[dayCounter] || [],
          isToday: isToday(year, month, dayCounter),
        });
        dayCounter++;
      }
    }
    
    grid.push(weekDays);
    
    // If we've reached the end of the month and filled the grid, stop
    if (dayCounter > totalDays && week >= 4) break;
  }
  
  return {
    year,
    month,
    grid,
    totalEvents: events.length,
  };
}

/**
 * Check if a date is today
 * @param year Year
 * @param month Month (1-12)
 * @param day Day
 * @returns Boolean indicating if the date is today
 */
function isToday(year: number, month: number, day: number) {
  const today = new Date();
  return (
    today.getFullYear() === year &&
    today.getMonth() === month - 1 &&
    today.getDate() === day
  );
}
