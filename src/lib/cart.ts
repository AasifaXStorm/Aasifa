export interface CartItem {
  id: string; // product_variant_id
  productId: string;
  name: string;
  price: number;
  size: string;
  image: string;
  quantity: number;
  maxStock: number;
}

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('aasifa_cart');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error loading cart', e);
    return [];
  }
}

export function saveCart(cart: CartItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('aasifa_cart', JSON.stringify(cart));
    // Dispatch a custom event to notify all components
    window.dispatchEvent(new Event('aasifa_cart_updated'));
  } catch (e) {
    console.error('Error saving cart', e);
  }
}

export function addToCart(item: Omit<CartItem, 'quantity'>, quantity: number = 1) {
  const cart = getCart();
  const existing = cart.find(i => i.id === item.id);
  
  if (existing) {
    // Cap at stock limit
    existing.quantity = Math.min(existing.quantity + quantity, item.maxStock);
  } else {
    cart.push({ ...item, quantity: Math.min(quantity, item.maxStock) });
  }
  
  saveCart(cart);
}

export function updateCartQuantity(variantId: string, quantity: number) {
  let cart = getCart();
  const item = cart.find(i => i.id === variantId);
  if (item) {
    item.quantity = Math.max(1, Math.min(quantity, item.maxStock));
    saveCart(cart);
  }
}

export function removeFromCart(variantId: string) {
  let cart = getCart();
  cart = cart.filter(i => i.id !== variantId);
  saveCart(cart);
}

export function clearCart() {
  saveCart([]);
}

export function getCartTotalItems(): number {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotalPrice(): number {
  return getCart().reduce((sum, item) => sum + (item.price * item.quantity), 0);
}
