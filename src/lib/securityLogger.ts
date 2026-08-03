import { supabaseAdmin } from './supabaseServer';

export interface SecurityEvent {
  event: string;
  userId?: string;
  ip?: string;
  details?: Record<string, any> | string;
  status?: 'success' | 'failure' | 'warning' | 'info';
}

/**
 * Logs security-relevant events server-side for auditing.
 */
export async function logSecurityEvent(eventPayload: SecurityEvent): Promise<void> {
  const { event, userId = 'system', ip = 'unknown', details = {}, status = 'info' } = eventPayload;
  const timestamp = new Date().toISOString();

  // Print structured audit log to server console
  console.log(`[SECURITY AUDIT] [${timestamp}] [${status.toUpperCase()}] Event: ${event} | IP: ${ip} | User: ${userId}`, details);

  // Best effort log into Supabase audit_logs table if accessible
  try {
    const detailString = typeof details === 'string' ? details : JSON.stringify(details);
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        event,
        user_id: userId,
        ip_address: ip,
        details: detailString,
        status,
        created_at: timestamp,
      });
  } catch (err) {
    // If audit_logs table does not exist or fails, fallback cleanly without throwing
  }
}
