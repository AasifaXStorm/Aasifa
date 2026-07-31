'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, ShoppingBag, CheckCircle, ChevronLeft } from 'lucide-react';
import { 
  getCart, 
  removeFromCart, 
  updateCartQuantity, 
  getCartTotalPrice, 
  clearCart, 
  CartItem 
} from '@/lib/cart';
import { processCheckout } from '../actions/checkout';

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<string | null>(null);

  // Promo Code States
  const [promoInput, setPromoInput] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  useEffect(() => {
    setCart(getCart());
    setMounted(true);

    const handleCartUpdate = () => {
      setCart(getCart());
    };

    window.addEventListener('aasifa_cart_updated', handleCartUpdate);
    return () => {
      window.removeEventListener('aasifa_cart_updated', handleCartUpdate);
    };
  }, []);

  if (!mounted) {
    return (
      <div style={{ background: '#030303', minHeight: 'calc(100vh - 70px)', padding: '100px 5%' }}>
        <p style={{ color: '#888', textAlign: 'center' }}>Loading Cart...</p>
      </div>
    );
  }

  const handleQuantityChange = (item: CartItem, newQty: number) => {
    updateCartQuantity(item.id, newQty);
  };

  const handleRemoveItem = (item: CartItem) => {
    removeFromCart(item.id);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMessage('Please fill in your name and email.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const checkoutItems = cart.map(i => ({
      variantId: i.id,
      quantity: i.quantity
    }));

    try {
      const response = await processCheckout(name, email, checkoutItems, promoApplied ? 'STORM10' : undefined);

      if (response.success && response.orderId) {
        setSuccessOrder(response.orderId);
        clearCart();
      } else {
        setErrorMessage(response.error || 'Checkout failed. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success view
  if (successOrder) {
    return (
      <div style={{
        background: '#030303',
        minHeight: 'calc(100vh - 70px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px',
      }}>
        <div className="glass-panel" style={{
          maxWidth: '550px',
          width: '100%',
          padding: '50px 30px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}>
          <CheckCircle size={60} color="#22c55e" />
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ORDER CONFIRMED
          </h1>
          <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Thank you for shopping with Aasifa. Your order has been placed successfully and is currently being processed.
          </p>
          <div style={{
            background: '#0a0a0a',
            border: '1px solid #1a1a1a',
            padding: '15px',
            width: '100%',
            fontSize: '0.85rem',
            fontFamily: 'monospace',
            color: '#e5e5e5',
            margin: '10px 0',
          }}>
            Order ID: {successOrder}
          </div>
          <Link href="/#shop" className="btn-primary" style={{ marginTop: '10px', display: 'inline-block' }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotalPrice();

  return (
    <div style={{
      background: '#030303',
      minHeight: 'calc(100vh - 70px)',
      padding: '60px 5%',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '40px' }}>
          Your Cart
        </h1>

        {cart.length === 0 ? (
          /* Empty state */
          <div style={{
            padding: '80px 20px',
            textAlign: 'center',
            border: '1px dashed #222222',
            background: '#050505',
          }}>
            <ShoppingBag size={48} style={{ color: '#333', marginBottom: '20px' }} />
            <span style={{ fontSize: '1.2rem', color: '#888', display: 'block', marginBottom: '20px' }}>
              Your cart is empty.
            </span>
            <Link href="/#shop" className="btn-primary" style={{ display: 'inline-block' }}>
              Explore Collection
            </Link>
          </div>
        ) : (
          /* Cart content */
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '40px',
          }}>
            {/* Items Column */}
            <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {cart.map((item) => (
                <div 
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#0a0a0a',
                    border: '1px solid #1a1a1a',
                    padding: '20px',
                    gap: '20px',
                    position: 'relative',
                  }}
                >
                  {/* Thumbnail */}
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: '80px', height: '105px', objectFit: 'cover', border: '1px solid #222' }}
                  />

                  {/* Details */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <Link href={`/products/${item.productId}`} style={{ color: '#fff', fontSize: '1rem', fontWeight: 600 }}>
                      {item.name}
                    </Link>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>Size: {item.size}</span>
                    
                    {/* Quantity Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#888' }}>Qty:</span>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #222', background: '#030303' }}>
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          style={{ width: '28px', height: '28px', fontSize: '0.8rem', cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer', opacity: item.quantity <= 1 ? 0.3 : 1 }}
                        >
                          -
                        </button>
                        <span style={{ width: '30px', textAlign: 'center', fontSize: '0.85rem' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          style={{ width: '28px', height: '28px', fontSize: '0.8rem', cursor: item.quantity >= item.maxStock ? 'not-allowed' : 'pointer', opacity: item.quantity >= item.maxStock ? 0.3 : 1 }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <span style={{ fontSize: '1rem', color: '#fff', fontWeight: 500 }}>
                      {item.price * item.quantity} EGP
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#555' }}>
                      {item.price} EGP each
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveItem(item)}
                    style={{
                      position: 'absolute',
                      top: '15px',
                      right: '15px',
                      color: '#444',
                      padding: '4px',
                    }}
                    className="trash-btn"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Summary / Checkout Column */}
            <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Summary Block */}
              <div className="glass-panel" style={{ padding: '30px', border: '1px solid #1a1a1a' }}>
                <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px', borderBottom: '1px solid #1a1a1a', paddingBottom: '15px' }}>
                  Order Summary
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '0.9rem', color: '#888' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal</span>
                    <span style={{ color: '#fff' }}>{subtotal} EGP</span>
                  </div>
                  {promoApplied && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#22c55e' }}>
                      <span>Discount (STORM10 - 10%)</span>
                      <span>-{(subtotal * 0.10)} EGP</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Shipping</span>
                    <span style={{ color: '#22c55e', fontWeight: 600 }}>FREE</span>
                  </div>
                  <div style={{
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    borderTop: '1px solid #1a1a1a', 
                    paddingTop: '15px', 
                    fontSize: '1.1rem', 
                    color: '#fff',
                    fontWeight: 'bold'
                  }}>
                    <span>Total</span>
                    <span>{promoApplied ? subtotal * 0.90 : subtotal} EGP</span>
                  </div>
                </div>
              </div>

              {/* Promo Code Block */}
              <div className="glass-panel" style={{ padding: '25px', border: '1px solid #1a1a1a' }}>
                <label className="form-label" style={{ marginBottom: '10px' }}>Promo Code</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter code (e.g. STORM10)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    disabled={promoApplied}
                    style={{ textTransform: 'uppercase' }}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      if (promoInput.trim().toUpperCase() === 'STORM10') {
                        setPromoApplied(true);
                        setPromoError(null);
                      } else {
                        setPromoError('Invalid promo code.');
                      }
                    }}
                    disabled={promoApplied}
                    style={{ padding: '8px 15px', fontSize: '0.8rem' }}
                  >
                    {promoApplied ? 'Applied' : 'Apply'}
                  </button>
                </div>
                {promoError && <span style={{ color: '#ff4444', fontSize: '0.75rem', marginTop: '5px', display: 'block' }}>{promoError}</span>}
                {promoApplied && <span style={{ color: '#22c55e', fontSize: '0.75rem', marginTop: '5px', display: 'block', fontWeight: 600 }}>Code STORM10 applied successfully (10% off)!</span>}
              </div>

              {/* Checkout Form */}
              <form onSubmit={handleCheckoutSubmit} className="glass-panel" style={{ padding: '30px', border: '1px solid #1a1a1a' }}>
                <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px', borderBottom: '1px solid #1a1a1a', paddingBottom: '15px' }}>
                  Shipping Information
                </h3>

                {errorMessage && (
                  <div style={{
                    padding: '12px',
                    border: '1px solid #ff3333',
                    background: 'rgba(255,51,51,0.05)',
                    color: '#ffaaaa',
                    fontSize: '0.8rem',
                    marginBottom: '20px',
                  }}>
                    {errorMessage}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '25px' }}>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', padding: '15px' }}
                  disabled={loading}
                >
                  {loading ? 'Processing Order...' : 'Complete Order'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .trash-btn:hover {
          color: #ff4444 !important;
        }
      `}</style>
    </div>
  );
}
