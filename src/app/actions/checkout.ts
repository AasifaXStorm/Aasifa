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
  shortId?: string;
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
    const shortOrderId = `#${order.id.split('-')[0].toUpperCase()}`;

    const orderItemsHtml = validatedItems.map(item => `
      <tr style="border-bottom: 1px solid #1a1a22;">
        <td style="padding: 12px 0; color: #ffffff; font-weight: 600; font-size: 14px;">
          ${item.name}
          <span style="display: inline-block; margin-left: 6px; padding: 2px 6px; background: #1a1a24; border: 1px solid #2a2a38; border-radius: 4px; font-size: 11px; color: #aaa;">${item.size}</span>
        </td>
        <td style="padding: 12px 0; color: #888899; text-align: center; font-size: 14px;">&times; ${item.quantity}</td>
        <td style="padding: 12px 0; color: #ffffff; text-align: right; font-weight: 700; font-size: 14px;">${item.unitPrice * item.quantity} EGP</td>
      </tr>
    `).join('');

    const emailHtmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin: 0; padding: 0; background-color: #030305; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
        </style>
      </head>
      <body style="margin: 0; padding: 40px 10px; background-color: #030305;">
        <div style="max-width: 560px; margin: 0 auto; background: #0a0a0e; border: 1px solid #1c1c28; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.9);">
          
          <!-- Header Banner with Flanking Lightning Bolts -->
          <div style="background: linear-gradient(180deg, #14141f 0%, #0a0a0e 100%); padding: 32px 20px; text-align: center; border-bottom: 1px solid #1c1c28;">
            <div style="display: inline-flex; align-items: center; justify-content: center; gap: 12px;">
              <span style="font-size: 20px; color: #e5b842; text-shadow: 0 0 10px rgba(229,184,66,0.6);">⚡</span>
              <span style="font-size: 26px; color: #ffffff; font-weight: 900; letter-spacing: 0.35em; text-transform: uppercase;">AASIFA</span>
              <span style="font-size: 20px; color: #e5b842; text-shadow: 0 0 10px rgba(229,184,66,0.6);">⚡</span>
            </div>
            <div style="margin-top: 10px; font-size: 11px; letter-spacing: 0.25em; color: #e5b842; text-transform: uppercase; font-weight: 700;">ORDER CONFIRMATION</div>
          </div>

          <!-- Body Content -->
          <div style="padding: 32px 28px;">
            <p style="font-size: 16px; color: #ffffff; margin-top: 0; font-weight: 600;">Hi ${customerName},</p>
            <p style="font-size: 14px; color: #a0a0b0; line-height: 1.6; margin-bottom: 28px;">
              Thank you for ordering with <strong style="color: #ffffff;">AASIFA</strong>. Your order has been placed successfully. Our customer care team will call you within 2 business days to confirm your delivery details.
            </p>

            <!-- Order Details Box -->
            <div style="background: #101016; border: 1px solid #1a1a26; border-radius: 12px; padding: 22px; margin-bottom: 28px;">
              
              <!-- Order Header Meta -->
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #1a1a24; padding-bottom: 14px; margin-bottom: 16px;">
                <div>
                  <span style="font-size: 11px; color: #666677; text-transform: uppercase; letter-spacing: 0.1em; display: block;">ORDER NUMBER</span>
                  <span style="font-size: 16px; color: #e5b842; font-weight: 800; font-family: monospace;">${shortOrderId}</span>
                </div>
                <div style="text-align: right;">
                  <span style="font-size: 11px; color: #666677; text-transform: uppercase; letter-spacing: 0.1em; display: block;">PAYMENT</span>
                  <span style="font-size: 13px; color: #ffffff; font-weight: 600;">Cash on Delivery (COD)</span>
                </div>
              </div>

              <!-- Shipping Address -->
              <div style="margin-bottom: 20px;">
                <span style="font-size: 11px; color: #666677; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 4px;">DELIVERY ADDRESS</span>
                <span style="font-size: 13px; color: #cccccc; line-height: 1.5; display: block;">${fullAddress}</span>
              </div>

              <!-- Purchased Items Table -->
              <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
                <thead>
                  <tr style="border-bottom: 1px solid #222230;">
                    <th style="text-align: left; font-size: 11px; color: #666677; text-transform: uppercase; letter-spacing: 0.1em; padding-bottom: 8px;">ITEM</th>
                    <th style="text-align: center; font-size: 11px; color: #666677; text-transform: uppercase; letter-spacing: 0.1em; padding-bottom: 8px;">QTY</th>
                    <th style="text-align: right; font-size: 11px; color: #666677; text-transform: uppercase; letter-spacing: 0.1em; padding-bottom: 8px;">PRICE</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItemsHtml}
                </tbody>
              </table>

              <!-- Total Row -->
              <div style="border-top: 1px solid #222230; margin-top: 16px; padding-top: 16px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 14px; color: #ffffff; font-weight: 700;">TOTAL AMOUNT</span>
                <span style="font-size: 20px; color: #e5b842; font-weight: 900;">${totalAmount} EGP</span>
              </div>

            </div>

            <!-- Action / Support Note -->
            <div style="text-align: center; background: rgba(229,184,66,0.05); border: 1px solid rgba(229,184,66,0.15); border-radius: 8px; padding: 14px; margin-bottom: 10px;">
              <span style="font-size: 12px; color: #d4af37;">Need to modify your order? Contact us anytime with <strong>${shortOrderId}</strong></span>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #07070a; border-top: 1px solid #14141f; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 11px; color: #555566; letter-spacing: 0.15em; text-transform: uppercase; font-weight: 600;">
              ⚡ AASIFA STREETWEAR ⚡
            </p>
          </div>

        </div>
      </body>
      </html>
    `;

    sendEmailViaBrevo(customerEmail, `AASIFA Order ${shortOrderId} Confirmation`, emailHtmlContent, 'order_confirmation')
      .catch(err => console.error('Async Brevo order confirmation error:', err));

    return { success: true, orderId: order.id, shortId: shortOrderId };
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

