// app/(dashboard)/dashboard/accounts/page.tsx

import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCalendarAccountsWithStatus } from "@/lib/dashboard-data";
import { 
  Calendar, 
  Plus, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Star
} from "lucide-react";
import { format } from "date-fns";

function getStatusMessage(params: { success?: string; error?: string }) {
  if (params.success === 'account_connected') {
    return {
      type: 'success',
      title: 'Calendar Connected Successfully',
      message: 'Your calendar has been connected and your events are being synced.',
    };
  }
  if (params.error === 'token_missing') {
    return {
      type: 'error',
      title: 'Authentication Failed',
      message: "We couldn't get authentication tokens from Google. Please try again.",
    };
  }
  if (params.error === 'profile_fetch_failed') {
    return {
      type: 'error',
      title: 'Profile Fetch Failed',
      message: "We couldn't fetch your Google profile. This could be a temporary issue. Please try again.",
    };
  }
  if (params.error === 'unknown') {
    return {
      type: 'error',
      title: 'Something Went Wrong',
      message: 'An unknown error occurred. Our hamsters are investigating the issue.',
    };
  }
  return null;
}

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: { success?: string; error?: string };
}) {
  // Await searchParams before using them.
  const params = await Promise.resolve(searchParams);

  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const accounts = await getCalendarAccountsWithStatus(session.user.id);
  console.log(`[ACCOUNTS-PAGE] Got ${accounts.length} accounts, isPrimary status:`, 
    accounts.map(acc => ({ 
      id: acc.id,
      email: acc.email,
      isPrimary: acc.isPrimary 
    }))
  );
  
  const statusMessage = getStatusMessage(params);
  
  // Separate primary from secondary accounts
  const primaryAccount = accounts.find(acc => acc.isPrimary);
  const secondaryAccounts = accounts.filter(acc => !acc.isPrimary);
  
  console.log(`[ACCOUNTS-PAGE] Primary account:`, primaryAccount?.id || 'none');
  console.log(`[ACCOUNTS-PAGE] Secondary accounts:`, secondaryAccounts.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="heading-lg">Calendar Accounts</h1>
          <p className="text-muted-foreground">
            Manage your connected calendars and their sync settings.
          </p>
        </div>
        
        <Link 
          href="/dashboard/accounts/add" 
          className="brutalist-button-small inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Connect Calendar
        </Link>
      </div>
      
      {statusMessage && (
        <div className={`brutalist-box ${statusMessage.type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-start gap-3">
            {statusMessage.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <div>
              <h3 className="font-bold">{statusMessage.title}</h3>
              <p>{statusMessage.message}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="brutalist-box">
          <h3 className="font-bold mb-1">Total Accounts</h3>
          <p className="text-2xl">{accounts.length}</p>
          <p className="text-sm text-muted-foreground">
            {accounts.length === 0 
              ? "Add your first calendar to get started" 
              : `${accounts.filter(a => a.isActive && a.syncEnabled).length} active sync${accounts.filter(a => a.isActive && a.syncEnabled).length !== 1 ? 's' : ''}`}
          </p>
        </div>
        
        <div className="brutalist-box">
          <h3 className="font-bold mb-1">Sync Status</h3>
          <p className="text-2xl">
            {accounts.filter(acc => {
              if (!acc.lastSynced) return false;
              const hoursSinceSync = (Date.now() - new Date(acc.lastSynced).getTime()) / (1000 * 60 * 60);
              return hoursSinceSync < 24;
            }).length}/{accounts.length}
          </p>
          <p className="text-sm text-muted-foreground">
            Calendars synced in the last 24 hours
          </p>
        </div>
        
        <div className="brutalist-box">
          <h3 className="font-bold mb-1">Plan Usage</h3>
          <p className="text-2xl">{accounts.length}/10</p>
          <p className="text-sm text-muted-foreground">
            Calendars used in your free plan
          </p>
        </div>
      </div>
      
      {accounts.length === 0 ? (
        <div className="brutalist-box text-center py-12">
          <Calendar className="h-16 w-16 mx-auto mb-4 opacity-40" />
          <h3 className="heading-md mb-4">No Connected Calendars</h3>
          <p className="max-w-md mx-auto mb-6">
            Connect your Google Calendar to start syncing events and accessing QuickCal&apos;s features.
          </p>
          <Link href="/dashboard/accounts/add" className="brutalist-button inline-block">
            Connect Google Calendar
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Primary Account Section */}
          {primaryAccount && (
            <div className="space-y-4">
              <h2 className="heading-sm flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                Primary Calendar
              </h2>
              
              <div className="brutalist-box" style={{borderLeftWidth: '6px', borderLeftColor: primaryAccount.color}}>
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{primaryAccount.label}</h3>
                      <span className="brutalist-tag">Primary</span>
                    </div>
                    <p>{primaryAccount.email}</p>
                    <div className="flex items-center gap-1 text-sm">
                      <span 
                        className="inline-block w-2 h-2 rounded-full"
                        style={{backgroundColor: primaryAccount.syncStatus.needsSync ? '#EF4444' : '#10B981'}}
                      ></span>
                      <span>{primaryAccount.syncStatus.label}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 md:text-right">
                    <p className="text-sm">
                      <strong>{primaryAccount.meetingsCount}</strong> events synced
                    </p>
                    <p className="text-sm">
                      Last synced: {primaryAccount.lastSynced 
                        ? format(new Date(primaryAccount.lastSynced), 'MMM d, yyyy h:mm a')
                        : 'Never'}
                    </p>
                    <form action={`/api/accounts/${primaryAccount.id}/sync`}>
                      <button type="submit" className="brutalist-button-small inline-flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" />
                        Sync Now
                      </button>
                    </form>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-200">
                  <h4 className="font-bold mb-2">Primary Account Permissions</h4>
                  <ul className="text-sm space-y-1">
                    <li>• View and synchronize calendar events</li>
                    <li>• Transcribe meeting audio and generate summaries</li>
                    <li>• Extract action items and tasks from meetings</li>
                    <li>• Provide AI-powered scheduling assistance</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* Secondary Accounts Section */}
          {secondaryAccounts.length > 0 && (
            <div className="space-y-4">
              <h2 className="heading-sm">Additional Calendars</h2>
              
              <div className="grid grid-cols-1 gap-4">
                {secondaryAccounts.map((account) => (
                  <div 
                    key={account.id} 
                    className="brutalist-box"
                    style={{borderLeftWidth: '6px', borderLeftColor: account.color}}
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg">{account.label}</h3>
                        <p>{account.email}</p>
                        <div className="flex items-center gap-1 text-sm">
                          <span 
                            className="inline-block w-2 h-2 rounded-full"
                            style={{backgroundColor: account.syncStatus.needsSync ? '#EF4444' : '#10B981'}}
                          ></span>
                          <span>{account.syncStatus.label}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 md:text-right">
                        <p className="text-sm">
                          <strong>{account.meetingsCount}</strong> events synced
                        </p>
                        <p className="text-sm">
                          Last synced: {account.lastSynced 
                            ? format(new Date(account.lastSynced), 'MMM d, yyyy h:mm a')
                            : 'Never'}
                        </p>
                        <div className="flex gap-2 justify-end">
                          <form action={`/api/accounts/${account.id}/sync`}>
                            <button type="submit" className="brutalist-button-small inline-flex items-center gap-1">
                              <RefreshCw className="h-3 w-3" />
                              Sync Now
                            </button>
                          </form>
                          <button className="brutalist-button-small">
                            Manage
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Connect More Accounts CTA */}
          <div className="brutalist-box bg-[#f4f4f4]">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="grow">
                <h3 className="heading-sm mb-2">Add Another Calendar</h3>
                <p className="mb-0">
                  Connect work, personal, or any other Google Calendar account to view all your events in one place.
                </p>
              </div>
              <Link href="/dashboard/accounts/add" className="brutalist-button shrink-0 whitespace-nowrap">
                Connect Calendar
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Information About Calendar Permissions */}
      <div className="brutalist-box">
        <h3 className="heading-sm mb-4">About Calendar Permissions</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 shrink-0 flex items-center justify-center bg-black text-white rounded-full font-bold">
              1
            </div>
            <div>
              <h4 className="font-bold">Read-Only Access</h4>
              <p className="text-sm">
                QuickCal only reads your calendar data. We never modify, delete, or create events without your permission.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 shrink-0 flex items-center justify-center bg-black text-white rounded-full font-bold">
              2
            </div>
            <div>
              <h4 className="font-bold">Secure Data Handling</h4>
              <p className="text-sm">
                Your calendar data is encrypted and stored securely. We never share your data with third parties.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 shrink-0 flex items-center justify-center bg-black text-white rounded-full font-bold">
              3
            </div>
            <div>
              <h4 className="font-bold">Revoke Access Anytime</h4>
              <p className="text-sm">
                You can disconnect any calendar account at any time. This will stop syncing and remove all associated data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}