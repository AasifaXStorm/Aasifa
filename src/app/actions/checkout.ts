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

function sanitizeText(str: string): string {
  if (!str) return '';
  return str.replace(/<[^>]*>?/gm, '').trim();
}

export async function processCheckout(
  shippingDetails: ShippingDetails,
  items: CheckoutItem[]
): Promise<CheckoutResponse> {
  if (!shippingDetails || !shippingDetails.email || !shippingDetails.phone || !shippingDetails.firstName || !shippingDetails.detailedAddress || !items || items.length === 0) {
    return { success: false, error: 'Complete contact, shipping address, and cart items are required.' };
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(shippingDetails.email.trim())) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  // Validate items
  for (const item of items) {
    if (!item.variantId || typeof item.quantity !== 'number' || item.quantity <= 0 || item.quantity > 50 || !Number.isInteger(item.quantity)) {
      return { success: false, error: 'Invalid cart item quantity.' };
    }
  }

  const firstName = sanitizeText(shippingDetails.firstName);
  const lastName = sanitizeText(shippingDetails.lastName || '');
  const customerName = `${firstName} ${lastName}`.trim();
  const customerEmail = shippingDetails.email.trim().toLowerCase();
  const shippingFee = typeof shippingDetails.shippingFee === 'number' && shippingDetails.shippingFee >= 0 ? shippingDetails.shippingFee : 0;

  const detailedAddress = sanitizeText(shippingDetails.detailedAddress);
  const governorate = sanitizeText(shippingDetails.governorate);
  const phone = sanitizeText(shippingDetails.phone);

  const fullAddress = [
    detailedAddress,
    shippingDetails.building ? `Bldg: ${sanitizeText(shippingDetails.building)}` : null,
    shippingDetails.floor ? `Floor: ${sanitizeText(shippingDetails.floor)}` : null,
    shippingDetails.apartment ? `Apt: ${sanitizeText(shippingDetails.apartment)}` : null,
    shippingDetails.landmark ? `Landmark: ${sanitizeText(shippingDetails.landmark)}` : null,
    governorate,
    shippingDetails.country ? sanitizeText(shippingDetails.country) : 'Egypt',
    shippingDetails.postalCode ? `Postal: ${sanitizeText(shippingDetails.postalCode)}` : null,
    `Phone: ${phone}`
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
      <tr>
        <td style="padding:8px 26px 12px 26px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:15px; font-weight:600; color:#f5f0e8; vertical-align:middle;">
                ${item.name}
                <span style="display:inline-block; margin-left:8px; padding:2px 9px; background-color:#2a2318; border:1px solid #3a3226; border-radius:5px; font-size:11px; font-weight:700; color:#D4A64A; vertical-align:middle;">${item.size}</span>
              </td>
              <td align="center" style="font-size:14px; color:#a8a096; vertical-align:middle;">&times; ${item.quantity}</td>
              <td align="right" style="font-size:15px; font-weight:700; color:#f5f0e8; vertical-align:middle;">${item.unitPrice * item.quantity} EGP</td>
            </tr>
          </table>
        </td>
      </tr>
    `).join('');

    const formattedAddressLines = [
      detailedAddress,
      [
        shippingDetails.building ? `Bldg: ${sanitizeText(shippingDetails.building)}` : null,
        shippingDetails.floor ? `Floor: ${sanitizeText(shippingDetails.floor)}` : null,
        shippingDetails.apartment ? `Apt: ${sanitizeText(shippingDetails.apartment)}` : null,
      ].filter(Boolean).join(', '),
      [
        shippingDetails.landmark ? `Landmark: ${sanitizeText(shippingDetails.landmark)}` : null,
        governorate,
        shippingDetails.country ? sanitizeText(shippingDetails.country) : 'Egypt'
      ].filter(Boolean).join(', ')
    ].filter(Boolean).join('<br>');

    const emailHtmlContent = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Order Confirmation</title>
<style>
  body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
  body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; background-color: #050505; }

  @media screen and (max-width: 600px) {
    .email-container { width: 100% !important; }
    .fluid-padding { padding-left: 22px !important; padding-right: 22px !important; }
    .stack-col { display: block !important; width: 100% !important; text-align: left !important; }
    .stack-col-right { text-align: left !important; padding-top: 10px !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background-color:#050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

  <div style="display:none; max-height:0; overflow:hidden; mso-hide:all;">
    Your AASIFA order ${shortOrderId} has been confirmed — total ${totalAmount} EGP, Cash on Delivery.
  </div>

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
                  <td style="padding:0 12px; font-size:11px; font-weight:700; letter-spacing:3px; color:#D4A64A; text-transform:uppercase; white-space:nowrap;">Order Confirmation</td>
                  <td style="height:1px; width:36px; background-color:#D4A64A; opacity:0.6;"></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr><td style="border-top:1px solid #2a251d;"></td></tr>
          <tr>
            <td class="fluid-padding" style="padding: 34px 44px 8px 44px;">
              <p style="margin:0 0 14px 0; font-size:19px; font-weight:700; color:#f5f0e8; font-family: Georgia, 'Times New Roman', serif;">Hi ${customerName},</p>
              <p style="margin:0; font-size:14px; line-height:23px; color:#a8a096;">
                Thank you for ordering with <strong style="color:#e8e0d4;">AASIFA</strong>. Your order has been placed successfully. Our customer care team will call you within
                <strong style="color:#e8e0d4;">2 business days</strong> to confirm your delivery details.
              </p>
            </td>
          </tr>
          <tr>
            <td class="fluid-padding" style="padding: 26px 44px 8px 44px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#1b1712; border-radius:14px; border:1px solid #34291c;">
                <tr>
                  <td style="padding:26px 26px 18px 26px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td class="stack-col" width="50%" style="vertical-align:top;">
                          <div style="font-size:10px; font-weight:700; letter-spacing:1.5px; color:#8a8378; text-transform:uppercase; margin-bottom:7px;">Order Number</div>
                          <div style="font-size:16px; font-weight:700; color:#F5C463;">${shortOrderId}</div>
                        </td>
                        <td class="stack-col stack-col-right" width="50%" style="vertical-align:top;">
                          <div style="font-size:10px; font-weight:700; letter-spacing:1.5px; color:#8a8378; text-transform:uppercase; margin-bottom:7px;">Payment</div>
                          <div style="font-size:16px; font-weight:700; color:#f5f0e8;">Cash on Delivery</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="padding:0 26px;"><div style="border-top:1px solid #34291c;"></div></td></tr>
                <tr>
                  <td style="padding:20px 26px;">
                    <div style="font-size:10px; font-weight:700; letter-spacing:1.5px; color:#8a8378; text-transform:uppercase; margin-bottom:14px;">Delivery Address</div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="30%" valign="top" style="padding-bottom:10px; font-size:12px; color:#6b6459;">Address</td>
                        <td valign="top" style="padding-bottom:10px; font-size:14px; color:#d8d0c4; line-height:21px;">${formattedAddressLines}</td>
                      </tr>
                      ${shippingDetails.postalCode ? `
                      <tr>
                        <td width="30%" valign="top" style="padding-bottom:10px; font-size:12px; color:#6b6459;">Postal Code</td>
                        <td valign="top" style="padding-bottom:10px; font-size:14px; color:#d8d0c4;">${sanitizeText(shippingDetails.postalCode)}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td width="30%" valign="top" style="font-size:12px; color:#6b6459;">Phone</td>
                        <td valign="top" style="font-size:14px; color:#d8d0c4;">${phone}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="padding:0 26px;"><div style="border-top:1px solid #34291c;"></div></td></tr>
                <tr>
                  <td style="padding:18px 26px 10px 26px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:10px; font-weight:700; letter-spacing:1.5px; color:#8a8378; text-transform:uppercase;">Item</td>
                        <td align="center" style="font-size:10px; font-weight:700; letter-spacing:1.5px; color:#8a8378; text-transform:uppercase;">Qty</td>
                        <td align="right" style="font-size:10px; font-weight:700; letter-spacing:1.5px; color:#8a8378; text-transform:uppercase;">Price</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ${orderItemsHtml}
                <tr><td style="padding:0 26px;"><div style="border-top:1px solid #34291c;"></div></td></tr>
                <tr>
                  <td style="padding:22px 26px 26px 26px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:12px; font-weight:700; letter-spacing:1px; color:#a8a096; text-transform:uppercase; vertical-align:middle;">Total Amount</td>
                        <td align="right" style="font-size:27px; font-weight:800; color:#F5C463; vertical-align:middle;">${totalAmount} EGP</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="fluid-padding" style="padding: 22px 44px 8px 44px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:rgba(212,166,74,0.07); border:1px solid rgba(212,166,74,0.28); border-radius:12px;">
                <tr>
                  <td align="center" style="padding:17px 20px; font-size:13px; font-weight:600; color:#F5C463;">
                    Need to modify your order? Contact us anytime with <strong>${shortOrderId}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr><td style="padding-top:34px; border-top:1px solid #2a251d;"></td></tr>
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

    sendEmailViaBrevo(customerEmail, `AASIFA Order ${shortOrderId} Confirmation`, emailHtmlContent, 'order_confirmation')
      .catch(err => console.error('Async Brevo order confirmation error:', err));

    return { success: true, orderId: order.id, shortId: shortOrderId };
  } catch (err: any) {
    console.error('Checkout processing exception:', err);
    return { success: false, error: 'An error occurred while processing your checkout. Please try again.' };
  }
}

export async function saveAbandonedCartAction(email: string, cartPayload: string) {
  const { trackAbandonedCart } = await import('@/lib/brevo');
  const sanitizedEmail = sanitizeText(email).toLowerCase();
  return trackAbandonedCart(sanitizedEmail, cartPayload);
}

export async function trackOrdersByEmail(email: string) {
  if (!email || !email.trim() || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const cleanEmail = sanitizeText(email).toLowerCase();

  try {
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('id, created_at, status, total_amount')
      .eq('customer_email', cleanEmail)
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
    return { success: false, error: 'Failed to retrieve order history.' };
  }
}

