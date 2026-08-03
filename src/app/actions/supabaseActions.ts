'use server';

import { supabaseAdmin } from '@/lib/supabaseServer';
import { verifyAdminSession } from '@/app/actions/auth';
import { SUPPORTED_SIZES } from '@/lib/constants';
import { sendEmailViaBrevo } from '@/lib/brevo';

import { cookies } from 'next/headers';
import { createSignedToken, verifySignedToken } from '@/lib/sessionToken';

export async function getSiteConfig() {
  if (!(await verifyAdminSession())) throw new Error('Unauthorized');

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('name', '_SITE_CONFIG_')
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

/**
 * Public server action returning non-sensitive site configuration fields only.
 * Strips out store passwords, API keys, and sensitive admin settings.
 */
export async function getPublicSiteConfig() {
  try {
    const { data } = await supabaseAdmin
      .from('products')
      .select('description')
      .eq('name', '_SITE_CONFIG_')
      .maybeSingle();

    if (data?.description) {
      const parsed = JSON.parse(data.description);
      return {
        launching_mode: parsed.launching_mode !== undefined ? !!parsed.launching_mode : true,
        maintenance_mode: parsed.maintenance_mode !== undefined ? !!parsed.maintenance_mode : false,
        testing_mode: parsed.testing_mode !== undefined ? !!parsed.testing_mode : false,
        launch_date: parsed.launch_date || '2026-08-15T00:00:00.000Z',
        show_footer_links: parsed.show_footer_links !== undefined ? !!parsed.show_footer_links : true,
      };
    }
  } catch (e) {
    console.error('Failed to load public config:', e);
  }

  return {
    launching_mode: true,
    maintenance_mode: false,
    testing_mode: false,
    launch_date: '2026-08-15T00:00:00.000Z',
    show_footer_links: true,
  };
}

/**
 * Server action to verify storefront unlock password and issue an HTTP-only signed session cookie.
 */
export async function verifyStorePasswordAction(inputPassword: string): Promise<{ success: boolean; error?: string }> {
  if (!inputPassword || !inputPassword.trim()) {
    return { success: false, error: 'Password required.' };
  }

  try {
    let targetPassword = 'stormydormy';

    const { data } = await supabaseAdmin
      .from('products')
      .select('description')
      .eq('name', '_SITE_CONFIG_')
      .maybeSingle();

    if (data?.description) {
      const parsed = JSON.parse(data.description);
      if (parsed.store_password) {
        targetPassword = parsed.store_password;
      }
    }

    if (inputPassword.trim() === targetPassword) {
      const signedToken = await createSignedToken({ userId: 'store_visitor', role: 'store_user' }, 86400 * 7); // 7 days
      const cookieStore = await cookies();
      cookieStore.set('aasifa_store_unlocked_session', signedToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 86400 * 7,
        path: '/',
        sameSite: 'strict',
      });

      return { success: true };
    }

    return { success: false, error: 'Incorrect store password. Try again.' };
  } catch (err: any) {
    console.error('Store password verification error:', err);
    return { success: false, error: 'Verification error.' };
  }
}

/**
 * Server action to check if the store unlock session is active and valid.
 */
export async function isStoreUnlockedAction(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('aasifa_store_unlocked_session')?.value;
    const verified = await verifySignedToken(token);
    return verified?.role === 'store_user';
  } catch (e) {
    return false;
  }
}

/**
 * Server action to re-lock the storefront
 */
export async function lockStoreAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('aasifa_store_unlocked_session');
}

export async function updateSiteConfig(configJson: string) {
  if (!(await verifyAdminSession())) throw new Error('Unauthorized');

  const { data: existing } = await supabaseAdmin
    .from('products')
    .select('id')
    .eq('name', '_SITE_CONFIG_')
    .maybeSingle();

  if (existing) {
    const { error } = await supabaseAdmin
      .from('products')
      .update({ description: configJson })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabaseAdmin
      .from('products')
      .insert({
        name: '_SITE_CONFIG_',
        description: configJson,
        price: 0,
        category: 'Config'
      });
    if (error) throw error;
  }
}

export async function getDashboardStats() {
  if (!(await verifyAdminSession())) throw new Error('Unauthorized');

  const { data: ordersData, error: ordError } = await supabaseAdmin
    .from('orders')
    .select('*');
  if (ordError) throw ordError;

  const { data: itemsData, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .select(`
      quantity,
      unit_price,
      product_variants (
        size,
        products (
          category
        )
      )
    `);
  if (itemsError) throw itemsError;

  return { ordersData, itemsData };
}

export async function getOrders() {
  if (!(await verifyAdminSession())) throw new Error('Unauthorized');

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
  if (!(await verifyAdminSession())) throw new Error('Unauthorized');

  const { error } = await supabaseAdmin
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId);
  if (error) throw error;
  return true;
}

export async function deleteOrder(orderId: string) {
  if (!(await verifyAdminSession())) throw new Error('Unauthorized');

  // Delete order items first
  const { error: itemsErr } = await supabaseAdmin
    .from('order_items')
    .delete()
    .eq('order_id', orderId);
  if (itemsErr) console.error('Error deleting order items:', itemsErr);

  // Delete order
  const { error } = await supabaseAdmin
    .from('orders')
    .delete()
    .eq('id', orderId);
  if (error) throw error;
  return true;
}

export async function deleteAllOrders() {
  if (!(await verifyAdminSession())) throw new Error('Unauthorized');

  // Delete all order items
  const { error: itemsErr } = await supabaseAdmin
    .from('order_items')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (itemsErr) console.error('Error deleting all order items:', itemsErr);

  // Delete all orders
  const { error: ordersErr } = await supabaseAdmin
    .from('orders')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (ordersErr) throw ordersErr;

  // Clear abandoned carts & email logs if existing
  try {
    await supabaseAdmin.from('abandoned_carts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('email_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  } catch (e) {
    // Optional table cleanup failure ignore
  }

  return true;
}

export async function getProducts() {
  if (!(await verifyAdminSession())) throw new Error('Unauthorized');

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, product_variants(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  
  return (data || []).map((p: any) => ({
    ...p,
    is_active: !p.category?.endsWith(' (Hidden)'),
    category: p.category ? p.category.replace(' (Hidden)', '') : 'Shirts'
  }));
}

export async function getProduct(id: string) {
  if (!(await verifyAdminSession())) throw new Error('Unauthorized');

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, product_variants(*)')
    .eq('id', id)
    .single();
  if (error) throw error;

  if (data) {
    data.is_active = !data.category?.endsWith(' (Hidden)');
    data.category = data.category ? data.category.replace(' (Hidden)', '') : 'Shirts';
  }
  return data;
}

export async function deleteProduct(id: string) {
  if (!(await verifyAdminSession())) throw new Error('Unauthorized');

  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
}

export async function deleteProductVariant(variantId: string) {
  if (!(await verifyAdminSession())) throw new Error('Unauthorized');

  const { error } = await supabaseAdmin
    .from('product_variants')
    .delete()
    .eq('id', variantId);
  if (error) throw error;
  return true;
}

export async function saveProduct(productData: any, variantsData: any[], isNew: boolean) {
  if (!(await verifyAdminSession())) throw new Error('Unauthorized');

  let productId = productData.id;

  const categoryValue = productData.is_active ? productData.category : `${productData.category} (Hidden)`;

  if (isNew) {
    const { data: newProd, error: insertError } = await supabaseAdmin
      .from('products')
      .insert({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        images: productData.images,
        category: categoryValue
      })
      .select('id')
      .single();
    if (insertError) throw insertError;
    productId = newProd.id;
  } else {
    const { error: updateError } = await supabaseAdmin
      .from('products')
      .update({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        images: productData.images,
        category: categoryValue
      })
      .eq('id', productId);
    if (updateError) throw updateError;
  }

  // Handle variants via upsert to handle both new and existing variants cleanly
  const validSizes = SUPPORTED_SIZES as readonly string[];
  const variantsToUpsert = variantsData
    .filter((v: any) => validSizes.includes(v.size))
    .map((v: any) => ({
      product_id: productId,
      size: v.size,
      stock_quantity: v.stock_quantity
    }));

  const { error: variantError } = await supabaseAdmin
    .from('product_variants')
    .upsert(variantsToUpsert, { onConflict: 'product_id, size' });

  if (variantError) throw variantError;

  return productId;
}

// Since Storage requires a FormData payload or similar for server actions
export async function uploadImageAction(formData: FormData) {
  if (!(await verifyAdminSession())) throw new Error('Unauthorized');

  // Accept either a single file (legacy) or multiple files (new "Instagram" style)
  const files = (formData.getAll('file') as File[]);
  const urls: string[] = [];

  for (const file of files) {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `${crypto.randomUUID()}.${fileExt}`;
    const singleForm = new FormData();
    singleForm.append('file', file);
    singleForm.append('filePath', filePath);
    const url = await uploadImageActionSingle(singleForm);
    urls.push(url);
  }

  // Return JSON string of URLs (client will parse)
  return JSON.stringify(urls);
}

// Helper for a single file upload – kept separate for recursion safety
async function uploadImageActionSingle(formData: FormData): Promise<string> {
  const file = formData.get('file') as File;
  const filePath = formData.get('filePath') as string;

  if (!file || !filePath) throw new Error('Missing file or filePath');

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await supabaseAdmin.storage
    .from('product-images')
    .upload(filePath, buffer, {
      contentType: file.type || 'image/jpeg',
      duplex: 'half'
    });

  if (error) throw error;

  const { data } = supabaseAdmin.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function updateInventory(productId: string, variants: { size: string, stock_quantity: number }[]) {
  if (!(await verifyAdminSession())) throw new Error('Unauthorized');

  const validSizes = SUPPORTED_SIZES as readonly string[];
  const variantsToUpsert = variants
    .filter(v => validSizes.includes(v.size))
    .map(v => ({
      product_id: productId,
      size: v.size,
      stock_quantity: v.stock_quantity
    }));

  const { error } = await supabaseAdmin
    .from('product_variants')
    .upsert(variantsToUpsert, { onConflict: 'product_id, size' });

  if (error) throw error;
  return true;
}

export async function sendTestEmailAction(testEmail: string) {
  if (!(await verifyAdminSession())) return { success: false, error: 'Unauthorized' };
  
  const testHtml = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Order Confirmation</title>
<style>
  body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; background-color: #050505; }
  @media screen and (max-width: 600px) {
    .email-container { width: 100% !important; }
    .fluid-padding { padding-left: 22px !important; padding-right: 22px !important; }
    .stack-col { display: block !important; width: 100% !important; text-align: left !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background-color:#050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#050505;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px; max-width:600px;">
          <tr>
            <td width="600" style="width:600px;">
        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" style="width:600px; max-width:600px; background-color:#141210; border-radius:18px; overflow:hidden; border:1px solid #3a3226; box-shadow: 0 0 0 1px rgba(212,166,74,0.08);">
          <tr><td style="height:3px; background: linear-gradient(90deg, transparent, #D4A64A 20%, #F5C463 50%, #D4A64A 80%, transparent);"></td></tr>
          <tr>
            <td align="center" class="fluid-padding" style="padding: 44px 40px 26px 40px; background-color:#141210;">
              <div style="font-size:30px; font-weight:800; letter-spacing:6px; color:#f5f0e8; font-family: Georgia, 'Times New Roman', serif;">
                AASIFA
              </div>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:14px auto 0 auto;">
                <tr>
                  <td style="height:1px; width:36px; background-color:#D4A64A; opacity:0.6;"></td>
                  <td style="padding:0 12px; font-size:11px; font-weight:700; letter-spacing:3px; color:#D4A64A; text-transform:uppercase; white-space:nowrap;">Test Transmission</td>
                  <td style="height:1px; width:36px; background-color:#D4A64A; opacity:0.6;"></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr><td style="border-top:1px solid #2a251d;"></td></tr>
          <tr>
            <td class="fluid-padding" style="padding: 34px 44px 24px 44px; text-align: center;">
              <p style="margin:0 0 14px 0; font-size:19px; font-weight:700; color:#f5f0e8; font-family: Georgia, 'Times New Roman', serif;">System Integration Verified</p>
              <p style="margin:0; font-size:14px; line-height:23px; color:#a8a096;">
                Your Brevo transactional email engine for <strong style="color:#e8e0d4;">AASIFA</strong> is fully active, authenticated, and ready to dispatch customer receipts.
              </p>
            </td>
          </tr>
          <tr><td style="padding-top:20px; border-top:1px solid #2a251d;"></td></tr>
          <tr>
            <td align="center" style="padding: 26px 40px 42px 40px;">
              <div style="font-size:12px; font-weight:700; letter-spacing:3px; color:#8a8378;">AASIFA STREETWEAR</div>
              <p style="margin:16px 0 0 0; font-size:11px; color:#54503f;">
                © 2026 AASIFA. All rights reserved.
              </p>
            </td>
          </tr>
          <tr><td style="height:3px; background: linear-gradient(90deg, transparent, #D4A64A 20%, #F5C463 50%, #D4A64A 80%, transparent);"></td></tr>
        </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const result = await sendEmailViaBrevo(
    testEmail,
    'AASIFA - System Test Email',
    testHtml,
    'order_confirmation'
  );
  
  if (!result.success) {
    return { success: false, error: result.error || 'Failed to send test email' };
  }
  return { success: true };
}
