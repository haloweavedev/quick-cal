'use server';

import { signOut } from '@/auth';

export async function signOutUser() {
  return signOut({ redirectTo: "/" });
}