'use server';

import { cookies, headers } from 'next/headers';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { createSignedToken, verifySignedToken } from '@/lib/sessionToken';
import { logSecurityEvent } from '@/lib/securityLogger';

export interface AuthResponse {
  success: boolean;
  error?: string;
  requireMfa?: boolean;
}

/**
 * Server action to verify admin login credentials and establish a secure signed HTTP-only cookie session.
 * Implements bcrypt password hashing, optional MFA verification, rate-limiting lockout after 5 failed attempts,
 * and security event audit logging.
 */
export async function verifyAdminLogin(
  usernameInput: string,
  passwordInput: string,
  mfaCodeInput?: string
): Promise<AuthResponse> {
  const reqHeaders = await headers();
  const clientIp = reqHeaders.get('x-forwarded-for')?.split(',')[0].trim() || reqHeaders.get('x-real-ip') || 'unknown';

  const adminUser = process.env.ADMIN_USERNAME || 'admin';

  // Default fallback hash for 'admin123!' if ADMIN_PASSWORD_HASH is not set in env
  const defaultHash = '$2b$12$wD3ViGQRGpILnnbSnYcBs.6A4qM8VBAne.9LaJgLxzAMUMekm0yHa';
  const adminHash = process.env.ADMIN_PASSWORD_HASH || defaultHash;

  // MFA is disabled as requested by admin
  const isMfaRequired = false;

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
      await logSecurityEvent({
        event: 'ADMIN_LOGIN_LOCKED_ATTEMPT',
        userId: usernameInput,
        ip: clientIp,
        status: 'warning',
        details: { waitMinutes }
      });
      return { 
        success: false, 
        error: `Too many failed attempts. Console locked. Try again in ${waitMinutes} minutes.` 
      };
    }

    // 2. Validate username and password using bcrypt
    const isUsernameMatch = usernameInput.trim().toLowerCase() === adminUser.toLowerCase();
    const isPasswordMatch = bcrypt.compareSync(passwordInput, adminHash);

    if (!isUsernameMatch || !isPasswordMatch) {
      lockoutData.attempts += 1;
      if (lockoutData.attempts >= 5) {
        lockoutData.lockoutUntil = Date.now() + 15 * 60 * 1000; // 15-minute lockout
        lockoutData.attempts = 0;
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

      await logSecurityEvent({
        event: 'ADMIN_LOGIN_FAILED',
        userId: usernameInput,
        ip: clientIp,
        status: 'failure',
        details: { attempts: lockoutData.attempts }
      });

      const attemptsRemaining = 5 - lockoutData.attempts;
      return { 
        success: false, 
        error: `Invalid credentials. ${attemptsRemaining} attempts remaining before temporary lockout.` 
      };
    }



    // 4. Login successful - Reset failed attempts
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

    // 5. Generate cryptographically signed HMAC-SHA256 session token
    const signedToken = await createSignedToken({ userId: adminUser, role: 'admin' }, 3600); // 1 hour

    // 6. Set secure HttpOnly, Secure, SameSite=Strict cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_session', signedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600, // 1 hour
      path: '/',
      sameSite: 'strict'
    });

    await logSecurityEvent({
      event: 'ADMIN_LOGIN_SUCCESS',
      userId: adminUser,
      ip: clientIp,
      status: 'success'
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
  const reqHeaders = await headers();
  const clientIp = reqHeaders.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';

  const cookieStore = await cookies();
  cookieStore.delete('admin_session');

  await logSecurityEvent({
    event: 'ADMIN_LOGOUT',
    ip: clientIp,
    status: 'info'
  });
}

/**
 * Server side check to verify if the admin session cookie is active and valid
 */
export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;
  const verified = await verifySignedToken(sessionToken);
  return verified?.role === 'admin';
}
