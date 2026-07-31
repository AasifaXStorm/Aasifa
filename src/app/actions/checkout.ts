'use server';

import { supabaseAdmin } from '@/lib/supabaseServer';

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

    return { success: true, orderId: order.id };
  } catch (err: any) {
    console.error('Checkout processing exception:', err);
    return { success: false, error: err.message || 'An unexpected error occurred.' };
  }
}
