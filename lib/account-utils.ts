// lib/account-utils.ts
import { db } from "./db";

/**
 * Find primary calendar account for a user
 * @param userId User ID to find primary account for
 * @returns Primary calendar account or null
 */
export async function findPrimaryCalendarAccount(userId: string) {
  return db.calendarAccount.findFirst({
    where: { 
      userId,
      isPrimary: true 
    },
  });
}

/**
 * Check if an email is associated with any account in the system
 * @param email Email to check
 * @returns Information about the account if found
 */
export async function checkEmailInUse(email: string) {
  // Check if this email is already associated with any account
  const calendarAccount = await db.calendarAccount.findFirst({
    where: { email },
    include: { user: true },
  });
  
  if (!calendarAccount) return null;
  
  // Return information about the associated account
  return {
    accountExists: true,
    isPrimary: calendarAccount.isPrimary,
    ownerEmail: calendarAccount.user.email,
    userId: calendarAccount.userId,
  };
}

/**
 * Get the number of calendar accounts for a user
 * @param userId User ID
 * @returns Number of connected calendar accounts
 */
export async function getCalendarAccountCount(userId: string) {
  return await db.calendarAccount.count({
    where: { userId },
  });
}

/**
 * Determine if email belongs to a Google Workspace
 * This is a simple heuristic, not foolproof
 * @param email Email to check
 * @returns boolean indicating if likely a workspace email
 */
export function isLikelyWorkspaceEmail(email: string) {
  if (!email) return false;
  
  // If it's gmail.com, it's likely personal
  if (email.endsWith('@gmail.com')) return false;
  
  // If it has a custom domain, it might be a workspace
  return true;
}

/**
 * Get a random color for a calendar
 * @returns Random color as hex string 
 */
export function getRandomColor(): string {
  const colors = [
    "#4285F4", // Google Blue
    "#EA4335", // Google Red
    "#FBBC05", // Google Yellow
    "#34A853", // Google Green
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#F59E0B", // Amber
    "#10B981", // Emerald
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Get account sync statistics for dashboard display
 * @param userId User ID
 * @returns Statistics about account sync status
 */
export async function getAccountSyncStats(userId: string) {
  console.log(`[ACCOUNT-UTILS] Getting sync stats for user ${userId}`);
  
  const accounts = await db.calendarAccount.findMany({
    where: { userId },
    select: {
      id: true,
      isPrimary: true,
      lastSynced: true,
      isActive: true,
      syncEnabled: true,
      email: true,
    }
  });
  
  console.log(`[ACCOUNT-UTILS] Found ${accounts.length} accounts for user ${userId}`);
  accounts.forEach(acc => {
    console.log(`[ACCOUNT-UTILS] Account: id=${acc.id}, email=${acc.email}, isPrimary=${acc.isPrimary}`);
  });
  
  const totalAccounts = accounts.length;
  const activeSyncs = accounts.filter(acc => acc.isActive && acc.syncEnabled).length;
  const recentlySynced = accounts.filter(acc => {
    if (!acc.lastSynced) return false;
    const hoursSinceSync = (Date.now() - acc.lastSynced.getTime()) / (1000 * 60 * 60);
    return hoursSinceSync < 24;
  }).length;
  
  // Check if any account is marked as primary
  const hasPrimary = accounts.some(acc => acc.isPrimary === true);
  console.log(`[ACCOUNT-UTILS] Has primary account: ${hasPrimary}`);
  
  if (!hasPrimary && accounts.length > 0) {
    console.log("[ACCOUNT-UTILS] No account is marked as primary, fixing...");
    // Make the first account primary
    await db.calendarAccount.update({
      where: { id: accounts[0].id },
      data: { isPrimary: true }
    });
    
    console.log(`[ACCOUNT-UTILS] Set account ${accounts[0].id} as primary`);
  }
  
  return {
    totalAccounts,
    activeSyncs,
    recentlySynced,
    hasPrimary: hasPrimary || accounts.length > 0, // Will be true if we fixed it
    needsAttention: accounts.some(acc => !acc.lastSynced || !acc.isActive),
  };
}

/**
 * Ensure only one primary account exists for a user
 * @param userId User ID
 * @param primaryAccountId ID of the account that should be primary
 */
export async function ensureSinglePrimaryAccount(userId: string, primaryAccountId: string) {
  // Update the specified account to be primary
  await db.calendarAccount.update({
    where: { id: primaryAccountId },
    data: { isPrimary: true },
  });
  
  // Update all other accounts to be non-primary
  await db.calendarAccount.updateMany({
    where: {
      userId,
      id: { not: primaryAccountId },
    },
    data: { isPrimary: false },
  });
}