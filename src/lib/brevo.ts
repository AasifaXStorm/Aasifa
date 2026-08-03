import { supabaseAdmin } from './supabaseServer';

export interface BrevoSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Sends a transactional email via Brevo SMTP HTTP API and logs the attempt to Supabase
 */
export async function sendEmailViaBrevo(
  recipientEmail: string,
  subject: string,
  htmlContent: string,
  emailType: 'order_confirmation' | 'abandoned_cart'
): Promise<BrevoSendResult> {
  let apiKey = process.env.BREVO_API_KEY;
  let senderEmail = 'sales@aasifa.com';
  let senderName = 'Storm Aasifa';

  try {
    const { data: configItem } = await supabaseAdmin
      .from('products')
      .select('description')
      .eq('name', '_SITE_CONFIG_')
      .maybeSingle();

    if (configItem && configItem.description) {
      const parsed = JSON.parse(configItem.description);
      if (parsed.brevo_api_key) {
        apiKey = parsed.brevo_api_key;
      }
      if (parsed.brevo_sender_email) {
        senderEmail = parsed.brevo_sender_email;
      }
      if (parsed.brevo_sender_name) {
        senderName = parsed.brevo_sender_name;
      }
    }
  } catch (dbErr) {
    console.error('Failed to retrieve dynamic Brevo credentials:', dbErr);
  }

  if (!apiKey) {
    const errorMsg = 'BREVO_API_KEY is not defined in environment variables or settings.';
    console.error(errorMsg);
    
    // Log failure in Supabase
    await logEmailAttempt(recipientEmail, emailType, 'failed', errorMsg);
    return { success: false, error: errorMsg };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: recipientEmail }],
        subject: subject,
        htmlContent: htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.message || `Brevo responded with status ${response.status}`;
      console.error('Brevo API Error:', data);
      await logEmailAttempt(recipientEmail, emailType, 'failed', errorMsg);
      return { success: false, error: errorMsg };
    }

    console.log(`Email successfully sent to ${recipientEmail} (ID: ${data.messageId})`);
    await logEmailAttempt(recipientEmail, emailType, 'sent');
    return { success: true, messageId: data.messageId };

  } catch (err: any) {
    const errorMsg = err.message || 'Unknown network error';
    console.error('Network error during Brevo send:', err);
    await logEmailAttempt(recipientEmail, emailType, 'failed', errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Helper to log email attempt results in Supabase email_logs table
 */
async function logEmailAttempt(
  recipientEmail: string,
  emailType: string,
  status: 'sent' | 'failed',
  errorMessage?: string
) {
  try {
    const { error } = await supabaseAdmin
      .from('email_logs')
      .insert({
        recipient_email: recipientEmail,
        email_type: emailType,
        status: status,
        error_message: errorMessage || null
      });

    if (error) {
      console.error('Database logging error for email_logs:', error);
    }
  } catch (dbErr) {
    console.error('Exception writing to email_logs table:', dbErr);
  }
}

/**
 * Save abandoned cart data to Supabase abandoned_carts table
 */
export async function trackAbandonedCart(email: string, cartPayload: string): Promise<boolean> {
  if (!email || !cartPayload) return false;

  try {
    const { error } = await supabaseAdmin
      .from('abandoned_carts')
      .insert({
        customer_email: email,
        cart_payload: cartPayload
      });

    if (error) {
      console.error('Error logging to abandoned_carts table:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Exception logging to abandoned_carts table:', err);
    return false;
  }
}
