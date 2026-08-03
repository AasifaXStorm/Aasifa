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
    const orderNumberStr = order.id ? `#${order.id.split('-')[0].slice(0, 4).toUpperCase()}` : '#21';

    const orderItemsRows = validatedItems.map(item => `
      <tr style="border-bottom: 1px solid #1a1a22;">
        <td style="padding: 10px 0; color: #888; font-size: 13px;">Garment</td>
        <td style="padding: 10px 0; color: #fff; font-weight: 700; font-size: 13px; text-align: right;">${item.name} — ${item.size}</td>
      </tr>
    `).join('');

    const emailHtmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin: 0; padding: 0; background-color: #050507; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        </style>
      </head>
      <body style="margin: 0; padding: 30px 10px; background-color: #050507;">
        <div style="max-width: 520px; margin: 0 auto; background: #0a0a0d; border: 1px solid #181820; border-radius: 4px; overflow: hidden; padding: 35px 25px; box-shadow: 0 30px 60px rgba(0,0,0,0.95);">
          
          <!-- Top Logo & Arabic Calligraphy -->
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="font-size: 24px; font-weight: 900; letter-spacing: 0.45em; color: #ffffff; text-transform: uppercase;">A A S I F A</div>
            <div style="font-size: 13px; color: #d4af37; margin-top: 4px; letter-spacing: 0.1em; font-family: 'Amiri', 'Traditional Arabic', serif;">عاصفة</div>
          </div>

          <!-- Circular Monogram Badge -->
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 60px; height: 60px; border-radius: 50%; border: 1px solid #d4af37; background: #0f0f14;">
              <span style="font-size: 20px; font-weight: 800; color: #d4af37;">A</span>
            </div>
          </div>

          <!-- Transmission Header & Greeting -->
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.25em; color: #d4af37; text-transform: uppercase; margin-bottom: 12px;">TRANSMISSION RECEIVED</div>
            <h2 style="font-size: 20px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0;">Hi ${customerName},</h2>
            <p style="font-size: 13px; color: #9999a5; line-height: 1.6; margin: 0; max-width: 440px; margin: 0 auto;">
              Your pieces are being cut and printed in Cairo. This is your official receipt — keep it, it's also your boarding pass into the drop.
            </p>
          </div>

          <!-- Live Progress Bar -->
          <div style="margin-bottom: 35px; text-align: center;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="width: 25%; text-align: center;">
                  <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #d4af37;"></span>
                  <div style="font-size: 9px; font-weight: 800; color: #d4af37; letter-spacing: 0.1em; margin-top: 6px;">PLACED</div>
                </td>
                <td style="width: 25%; text-align: center;">
                  <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #d4af37;"></span>
                  <div style="font-size: 9px; font-weight: 800; color: #d4af37; letter-spacing: 0.1em; margin-top: 6px;">PROCESSING</div>
                </td>
                <td style="width: 25%; text-align: center;">
                  <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; border: 1px solid #444; background: transparent;"></span>
                  <div style="font-size: 9px; font-weight: 800; color: #444; letter-spacing: 0.1em; margin-top: 6px;">SHIPPED</div>
                </td>
                <td style="width: 25%; text-align: center;">
                  <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; border: 1px solid #444; background: transparent;"></span>
                  <div style="font-size: 9px; font-weight: 800; color: #444; letter-spacing: 0.1em; margin-top: 6px;">DELIVERED</div>
                </td>
              </tr>
            </table>
          </div>

          <!-- Order Summary Card with Barcode -->
          <div style="background: #101015; border: 1px solid #1c1c26; border-radius: 4px; padding: 20px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 10px; font-weight: 800; letter-spacing: 0.15em; color: #777; text-transform: uppercase;">ORDER REFERENCE</span>
              <span style="font-size: 14px; font-weight: 900; color: #d4af37; font-family: monospace;">#${orderNumberStr}</span>
            </div>

            <!-- Stylized Barcode -->
            <div style="letter-spacing: 3px; font-family: monospace; font-size: 16px; color: #333344; margin-bottom: 18px; line-height: 1;">
              ||| | |||| ||| || |||| | ||| | |||
            </div>

            <!-- Items Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
              <tbody>
                ${orderItemsRows}
                <tr style="border-bottom: 1px solid #1a1a22;">
                  <td style="padding: 10px 0; color: #888; font-size: 13px;">Payment</td>
                  <td style="padding: 10px 0; color: #fff; font-weight: 700; font-size: 13px; text-align: right;">COD</td>
                </tr>
                <tr style="border-bottom: 1px solid #1a1a22;">
                  <td style="padding: 10px 0; color: #888; font-size: 13px;">Phone</td>
                  <td style="padding: 10px 0; color: #fff; font-weight: 700; font-size: 13px; text-align: right;">${shippingDetails.phone}</td>
                </tr>
              </tbody>
            </table>

            <!-- Pricing Breakdown -->
            <div style="border-top: 1px solid #1f1f2a; padding-top: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 12px; color: #888; margin-bottom: 6px;">
                <span>Subtotal</span>
                <span>${totalAmount - shippingFee} EGP</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 12px; color: #888; margin-bottom: 12px;">
                <span>Shipping fee</span>
                <span>${shippingFee} EGP</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; color: #d4af37; border-top: 1px solid #222230; padding-top: 10px;">
                <span>Total</span>
                <span>${totalAmount} EGP</span>
              </div>
            </div>
          </div>

          <!-- Delivery Manifest Box -->
          <div style="background: #101015; border: 1px solid #1c1c26; border-radius: 4px; padding: 20px; margin-bottom: 30px;">
            <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.15em; color: #d4af37; text-transform: uppercase; margin-bottom: 14px;">DELIVERY MANIFEST</div>
            <div style="font-size: 12px; color: #aaa; line-height: 1.7;">
              <div><strong style="color: #666; width: 90px; display: inline-block;">Recipient:</strong> <span style="color: #fff;">${customerName}</span></div>
              <div><strong style="color: #666; width: 90px; display: inline-block;">Address:</strong> <span style="color: #fff;">${fullAddress}</span></div>
              <div><strong style="color: #666; width: 90px; display: inline-block;">City:</strong> <span style="color: #fff;">${shippingDetails.governorate}, Egypt</span></div>
            </div>
          </div>

          <!-- Track Order CTA Button -->
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="https://aasifastreetwear.com/stormy" style="display: inline-block; padding: 14px 36px; border: 1px solid #d4af37; color: #d4af37; text-decoration: none; font-size: 11px; font-weight: 800; letter-spacing: 0.25em; text-transform: uppercase; background: #08080b;">
              TRACK ORDER
            </a>
          </div>

          <!-- Footer -->
          <div style="text-align: center; border-top: 1px solid #14141d; padding-top: 20px;">
            <div style="font-size: 9px; color: #555; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 700;">
              EXCLUSIVELY CRAFTED IN CAIRO · EGYPT-WIDE SHIPPING
            </div>
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

