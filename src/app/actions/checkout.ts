'use server';

import { supabaseAdmin } from '@/lib/supabaseServer';
import { sendEmailViaBrevo } from '@/lib/brevo';

export interface CheckoutItem {
  variantId: string;
  quantity: number;
}

export interface CheckoutResponse {
  success: boolean;
  orderId?: string;
  error?: string;
}

export interface ShippingDetails {
  phone: string;
  email: string;
  country?: string;
  firstName: string;
  lastName: string;
  detailedAddress: string;
  building?: string;
  floor?: string;
  apartment?: string;
  landmark?: string;
  governorate: string;
  postalCode?: string;
  shippingFee?: number;
}

export async function processCheckout(
  shippingDetails: ShippingDetails,
  items: CheckoutItem[]
): Promise<CheckoutResponse> {
  if (!shippingDetails || !shippingDetails.email || !shippingDetails.phone || !shippingDetails.firstName || !shippingDetails.detailedAddress || !items || items.length === 0) {
    return { success: false, error: 'Complete contact, shipping address, and cart items are required.' };
  }

  const customerName = `${shippingDetails.firstName.trim()} ${shippingDetails.lastName ? shippingDetails.lastName.trim() : ''}`.trim();
  const customerEmail = shippingDetails.email.trim();
  const shippingFee = shippingDetails.shippingFee || 0;

  const fullAddress = [
    shippingDetails.detailedAddress,
    shippingDetails.building ? `Bldg: ${shippingDetails.building}` : null,
    shippingDetails.floor ? `Floor: ${shippingDetails.floor}` : null,
    shippingDetails.apartment ? `Apt: ${shippingDetails.apartment}` : null,
    shippingDetails.landmark ? `Landmark: ${shippingDetails.landmark}` : null,
    shippingDetails.governorate,
    shippingDetails.country || 'Egypt',
    shippingDetails.postalCode ? `Postal: ${shippingDetails.postalCode}` : null,
    `Phone: ${shippingDetails.phone}`
  ].filter(Boolean).join(', ');

  try {
    // 1. Validate stock and calculate total price on the server (prevents price manipulation)
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      // Query variant along with its parent product details
      const { data: variant, error: variantError } = await supabaseAdmin
        .from('product_variants')
        .select(`
          id,
          size,
          stock_quantity,
          product_id,
          products (
            id,
            name,
            price
          )
        `)
        .eq('id', item.variantId)
        .single();

      if (variantError || !variant) {
        return { 
          success: false, 
          error: `Item variant not found in store catalog.` 
        };
      }

      const product = (variant as any).products;
      if (!product) {
        return { 
          success: false, 
          error: `Associated product not found.` 
        };
      }

      if (variant.stock_quantity < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for ${product.name} (Size: ${variant.size}). Only ${variant.stock_quantity} remaining.`
        };
      }

      const itemTotal = Number(product.price) * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        name: product.name,
        size: variant.size,
        variantId: variant.id,
        quantity: item.quantity,
        unitPrice: Number(product.price),
        currentStock: variant.stock_quantity,
      });
    }

    const totalAmount = subtotal + shippingFee;

    // 2. Create the order in Supabase
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_name: customerName,
        customer_email: customerEmail,
        total_amount: totalAmount,
        status: 'completed',
      })
      .select('id')
      .single();

    if (orderError || !order) {
      console.error('Order creation error:', orderError);
      return { success: false, error: 'Failed to record the order. Please try again.' };
    }

    // 3. Create order items and update stock quantities
    for (const item of validatedItems) {
      const { error: itemError } = await supabaseAdmin
        .from('order_items')
        .insert({
          order_id: order.id,
          product_variant_id: item.variantId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
        });

      if (itemError) {
        console.error('Order item insert error:', itemError);
      }

      // Decrement inventory stock
      const { error: stockError } = await supabaseAdmin
        .from('product_variants')
        .update({
          stock_quantity: item.currentStock - item.quantity,
        })
        .eq('id', item.variantId);

      if (stockError) {
        console.error('Stock decrement error:', stockError);
      }
    }

    // Trigger transactional order confirmation email via Brevo
    const orderItemsHtml = validatedItems.map(item => `
      <li style="margin-bottom: 8px;"><strong>${item.name}</strong> (Size: ${item.size}) &times; ${item.quantity} — ${item.unitPrice * item.quantity} EGP</li>
    `).join('');

    const emailHtmlContent = `
      <div style="font-family: Arial, sans-serif; background: #050505; color: #f5f5f5; padding: 40px 20px; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #222;">
        <h2 style="text-align: center; border-bottom: 1px solid #222; padding-bottom: 20px; text-transform: uppercase; letter-spacing: 0.1em; color: #ffffff;">⚡ ORDER RECEIVED</h2>
        <p>Hi ${customerName},</p>
        <p>Thank you for ordering with <strong>STORM AASIFA</strong>. We have received your order and our customer care team will call you within 2 business days to confirm your phone order.</p>
        
        <div style="background: #111; padding: 20px; border: 1px solid #222; border-radius: 4px; margin: 20px 0;">
          <h4 style="margin-top: 0; text-transform: uppercase; color: #888; letter-spacing: 0.05em;">Order Summary</h4>
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Delivery Address:</strong> ${fullAddress}</p>
          <p><strong>Payment Method:</strong> Cash on Delivery (COD)</p>
          <ul style="padding-left: 20px; color: #ccc;">
            ${orderItemsHtml}
          </ul>
          <p style="border-top: 1px solid #222; padding-top: 10px; font-size: 1.1rem; color: #fff;"><strong>Total:</strong> ${totalAmount} EGP</p>
        </div>
        <p style="color: #666; font-size: 0.8rem; text-align: center; margin-top: 30px;">STORM AASIFA STREETWEAR</p>
      </div>
    `;

    sendEmailViaBrevo(customerEmail, `STORM Order #${order.id} Confirmation`, emailHtmlContent, 'order_confirmation')
      .catch(err => console.error('Async Brevo order confirmation error:', err));

    return { success: true, orderId: order.id };
  } catch (err: any) {
    console.error('Checkout processing exception:', err);
    return { success: false, error: err.message || 'An unexpected error occurred.' };
  }
}

export async function saveAbandonedCartAction(email: string, cartPayload: string) {
  const { trackAbandonedCart } = await import('@/lib/brevo');
  return trackAbandonedCart(email, cartPayload);
}

export async function trackOrdersByEmail(email: string) {
  if (!email || !email.trim() || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  try {
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('id, created_at, status, total_amount')
      .eq('customer_email', email.trim())
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedOrders = (orders || []).map(o => ({
      id: o.id,
      shortId: `#${o.id.split('-')[0].toUpperCase()}`,
      createdAt: o.created_at,
      status: o.status || 'completed',
      totalAmount: o.total_amount
    }));

    return { success: true, orders: formattedOrders };
  } catch (err: any) {
    console.error('Error tracking order by email:', err);
    return { success: false, error: err.message || 'Failed to retrieve order history.' };
  }
}

