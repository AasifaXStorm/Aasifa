'use server';

import { supabaseAdmin } from '@/lib/supabaseServer';
import { verifyAdminSession } from '@/app/actions/auth';

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
  const variantsToUpsert = variantsData.map((v: any) => ({
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

  const variantsToUpsert = variants.map(v => ({
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

