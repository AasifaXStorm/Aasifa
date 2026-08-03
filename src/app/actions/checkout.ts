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

export async function processCheckout(
  customerName: string,
  customerEmail: string,
  items: CheckoutItem[],
  promoCode?: string
): Promise<CheckoutResponse> {
  if (!customerName || !customerEmail || !items || items.length === 0) {
    return { success: false, error: 'Customer information and items are required.' };
  }

  try {
    // 1. Validate stock and calculate total price on the server (prevents price manipulation)
    let totalAmount = 0;
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
      totalAmount += itemTotal;

      validatedItems.push({
        variantId: variant.id,
        quantity: item.quantity,
        unitPrice: Number(product.price),
        currentStock: variant.stock_quantity,
      });
    }

    // Apply discount code if valid
    if (promoCode === 'STORM10') {
      totalAmount = totalAmount * 0.90; // 10% discount
    }

    // 2. Create the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_name: customerName,
        customer_email: customerEmail,
        total_amount: totalAmount,
        status: 'completed', // auto-completed for mockup, could be pending
      })
      .select('id')
      .single();

    if (orderError || !order) {
      console.error('Order creation error:', orderError);
      return { success: false, error: 'Failed to record the order. Please try again.' };
    }

    // 3. Create order items and update stock quantities
    for (const item of validatedItems) {
      // Insert order item
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
        // Continue to record as much as possible but log the error
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

    // Trigger transactional order confirmation email asynchronously
    const orderItemsHtml = validatedItems.map(item => `
      <li style="margin-bottom: 8px;">Quantity: ${item.quantity} | Price: ${item.unitPrice} EGP</li>
    `).join('');

    const emailHtmlContent = `
      <div style="font-family: sans-serif; background: #050505; color: #f5f5f5; padding: 40px 20px; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #222;">
        <h2 style="text-align: center; border-bottom: 1px solid #222; padding-bottom: 20px; text-transform: uppercase; letter-spacing: 0.1em;">⚡ ORDER RECEIVED</h2>
        <p>Hi ${customerName},</p>
        <p>Thanks for ordering with STORM. We have received your order and our sales team will call you within 2 days at varying times to confirm your order by phone. Please stay reachable.</p>
        <div style="background: #111; padding: 20px; border: 1px solid #222; border-radius: 4px; margin: 20px 0;">
          <h4 style="margin-top: 0; text-transform: uppercase; color: #888; letter-spacing: 0.05em;">Order Details</h4>
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Total:</strong> ${totalAmount} EGP</p>
          <ul style="padding-left: 20px; color: #ccc;">
            ${orderItemsHtml}
          </ul>
        </div>
        <p style="color: #666; font-size: 0.8rem; text-align: center; margin-top: 30px;">STORM AASIFA STREETWEAR</p>
      </div>
    `;

    sendEmailViaBrevo(customerEmail, `STORM Order #${order.id} Confirmation`, emailHtmlContent, 'order_confirmation')
      .catch(err => console.error('Async order confirmation trigger failure:', err));

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
