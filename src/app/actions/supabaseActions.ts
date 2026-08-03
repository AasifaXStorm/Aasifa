'use server';

import { supabaseAdmin } from '@/lib/supabaseServer';
import { verifyAdminSession } from '@/app/actions/auth';
import { SUPPORTED_SIZES } from '@/lib/constants';
import { sendEmailViaBrevo } from '@/lib/brevo';

export async function getSiteConfig() {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('name', '_SITE_CONFIG_')
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
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
  
  const testHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 40px 10px; background-color: #030305; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 560px; margin: 0 auto; background: #0a0a0e; border: 1px solid #1c1c28; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.9);">
        <div style="background: linear-gradient(180deg, #14141f 0%, #0a0a0e 100%); padding: 32px 20px; text-align: center; border-bottom: 1px solid #1c1c28;">
          <div style="display: inline-flex; align-items: center; justify-content: center; gap: 12px;">
            <span style="font-size: 20px; color: #e5b842;">⚡</span>
            <span style="font-size: 26px; color: #ffffff; font-weight: 900; letter-spacing: 0.35em; text-transform: uppercase;">AASIFA</span>
            <span style="font-size: 20px; color: #e5b842;">⚡</span>
          </div>
          <div style="margin-top: 10px; font-size: 11px; letter-spacing: 0.25em; color: #e5b842; text-transform: uppercase; font-weight: 700;">SYSTEM TEST EMAIL</div>
        </div>
        <div style="padding: 32px 28px; text-align: center;">
          <p style="font-size: 16px; color: #ffffff; font-weight: 600; margin-top: 0;">Test Email Successful!</p>
          <p style="font-size: 14px; color: #a0a0b0; line-height: 1.6;">
            If you are reading this, your Brevo email integration for <strong style="color: #ffffff;">AASIFA</strong> is fully active and working smoothly.
          </p>
        </div>
        <div style="background: #07070a; border-top: 1px solid #14141f; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 11px; color: #555566; letter-spacing: 0.15em; text-transform: uppercase; font-weight: 600;">⚡ AASIFA STREETWEAR ⚡</p>
        </div>
      </div>
    </body>
    </html>
  `;

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
