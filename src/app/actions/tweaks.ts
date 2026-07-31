'use server';

import { cookies } from 'next/headers';
import { getTweak, setTweak } from '@/lib/kv';

/**
 * Server Action to fetch a tweak setting
 */
export async function fetchTweak(key: string, defaultValue: boolean = true): Promise<boolean> {
  return await getTweak(key, defaultValue);
}

/**
 * Server Action to update a tweak setting. Gated to authenticated admin sessions.
 */
export async function updateTweak(key: string, value: boolean): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session')?.value;
  
  if (session !== 'authenticated') {
    throw new Error('Unauthorized access: missing session cookie.');
  }

  return await setTweak(key, value);
}
