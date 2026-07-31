'use server';

import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabaseServer';

export interface AuthResponse {
  success: boolean;
  error?: string;
}

/**
 * Server action to verify login credentials and establish a secure HTTP-only cookie session.
 * Implements database-backed rate-limiting lockout after 5 failed attempts.
 */
export async function verifyAdminLogin(
  usernameInput: string,
  passwordInput: string
): Promise<AuthResponse> {
  const adminUser = process.env.ADMIN_USERNAME || 'aasifa_admin';
  const adminHash = process.env.ADMIN_PASSWORD_HASH || '';

  if (!usernameInput || !passwordInput) {
    return { success: false, error: 'Please enter both username and password.' };
  }

  try {
    // 1. Fetch current login lockout state from Supabase
    const { data: lockoutRow } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('name', '_LOGIN_LOCKOUT_')
      .maybeSingle();

    let lockoutData = { attempts: 0, lockoutUntil: 0 };
    if (lockoutRow?.description) {
      try {
        lockoutData = JSON.parse(lockoutRow.description);
      } catch (e) {
        console.error('Failed to parse lockout JSON:', e);
      }
    }

    const now = Date.now();
    if (lockoutData.lockoutUntil > now) {
      const waitMinutes = Math.ceil((lockoutData.lockoutUntil - now) / 1000 / 60);
      return { 
        success: false, 
        error: `Too many failed attempts. Console locked. Try again in ${waitMinutes} minutes.` 
      };
    }

    // 2. Validate username and password using bcrypt
    const isUsernameMatch = usernameInput === adminUser;
    const isPasswordMatch = adminHash ? bcrypt.compareSync(passwordInput, adminHash) : false;

    if (!isUsernameMatch || !isPasswordMatch) {
      // Increment failed attempts
      lockoutData.attempts += 1;
      if (lockoutData.attempts >= 5) {
        lockoutData.lockoutUntil = Date.now() + 15 * 60 * 1000; // 15-minute lockout
        lockoutData.attempts = 0; // reset counter
      }

      // Update lockout record in Supabase
      if (lockoutRow?.id) {
        await supabaseAdmin
          .from('products')
          .update({ description: JSON.stringify(lockoutData) })
          .eq('id', lockoutRow.id);
      } else {
        await supabaseAdmin.from('products').insert({
          name: '_LOGIN_LOCKOUT_',
          description: JSON.stringify(lockoutData),
          price: 0,
          category: 'System',
          images: []
        });
      }

      const attemptsRemaining = 5 - lockoutData.attempts;
      return { 
        success: false, 
        error: `Invalid credentials. ${attemptsRemaining} attempts remaining before temporary lockout.` 
      };
    }

    // 3. Login successful - Reset failed attempts
    if (lockoutData.attempts > 0 || lockoutData.lockoutUntil > 0) {
      lockoutData.attempts = 0;
      lockoutData.lockoutUntil = 0;
      if (lockoutRow?.id) {
        await supabaseAdmin
          .from('products')
          .update({ description: JSON.stringify(lockoutData) })
          .eq('id', lockoutRow.id);
      }
    }

    // 4. Set secure session cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 4, // 4 hours
      path: '/',
      sameSite: 'lax'
    });

    return { success: true };
  } catch (err: any) {
    console.error('Login action error:', err);
    return { success: false, error: 'Internal verification server error. Please try again.' };
  }
}

/**
 * Server action to clear the authenticated cookie session
 */
export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
}

/**
 * Server side check to determine if the admin session cookie is active
 */
export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  return session?.value === 'authenticated';
}
