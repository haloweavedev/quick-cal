import { NextRequest, NextResponse } from "next/server";
import { GoogleCalendarService } from "@/lib/google-calendar";

/**
 * This endpoint is designed to be called by a scheduled job/cron
 * to sync all active calendar accounts in the background
 */
export async function POST(request: NextRequest) {
  try {
    // Verify the request is authorized (in production, use a secure token)
    const authHeader = request.headers.get('authorization');
    const jobSecret = process.env.JOB_SECRET;
    
    // Simple authorization check - improve in production
    if (jobSecret && (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== jobSecret)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Run the background sync
    const syncCount = await GoogleCalendarService.syncAllAccounts();
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully synced ${syncCount} accounts`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error in background sync job:", error);
    return NextResponse.json(
      { 
        error: "Background sync failed", 
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}