import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCalendarAccountsWithStatus } from "@/lib/dashboard-data";
import { db } from "@/lib/db";
import SyncButton from "./SyncButton";

export default async function DebugCalendarPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Fetch connected calendar accounts for the logged-in user
  const accounts = await getCalendarAccountsWithStatus(session.user.id);

  // Also fetch all meetings associated with the user (for debugging)
  const meetings = await db.meeting.findMany({
    where: { userId: session.user.id },
    orderBy: { startTime: "asc" },
  });

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Debug Calendar Data</h1>
      <p>
        <strong>User:</strong> {session.user.email}
      </p>

      <section style={{ marginTop: "20px" }}>
        <h2>Connected Calendar Accounts</h2>
        {accounts.length === 0 ? (
          <p>No calendar accounts connected.</p>
        ) : (
          accounts.map((account) => (
            <div
              key={account.id}
              style={{
                border: "1px solid black",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              <p>
                <strong>Email:</strong> {account.email}
              </p>
              <p>
                <strong>Label:</strong> {account.label}
              </p>
              <p>
                <strong>Meetings Count:</strong> {account.meetingsCount}
              </p>
              <p>
                <strong>Sync Status:</strong> {account.syncStatus.label}
              </p>
              {/* Optional: display raw token info (for debugging only; remove in production) */}
              <pre style={{ background: "#f9f9f9", padding: "5px", fontSize: "12px" }}>
                {JSON.stringify(
                  {
                    access_token: account.access_token,
                    refresh_token: account.refresh_token,
                    lastSynced: account.lastSynced,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          ))
        )}
      </section>

      <section style={{ marginTop: "20px" }}>
        <h2>Meetings</h2>
        {meetings.length === 0 ? (
          <p>No meetings found.</p>
        ) : (
          meetings.map((meeting) => (
            <div
              key={meeting.id}
              style={{
                border: "1px solid gray",
                padding: "8px",
                marginBottom: "8px",
              }}
            >
              <p>
                <strong>Title:</strong> {meeting.title}
              </p>
              <p>
                <strong>Start:</strong> {meeting.startTime.toString()}
              </p>
              <p>
                <strong>End:</strong> {meeting.endTime.toString()}
              </p>
              <p>
                <strong>All Day:</strong> {meeting.allDay ? "Yes" : "No"}
              </p>
              <p>
                <strong>External ID:</strong> {meeting.externalId}
              </p>
            </div>
          ))
        )}
      </section>

      {accounts.length > 0 && (
        <section style={{ marginTop: "30px" }}>
          <h2>Sync Calendar Data (Test)</h2>
          {/* Use the first connected account for syncing */}
          <SyncButton accountId={accounts[0].id} />
        </section>
      )}
    </div>
  );
}
