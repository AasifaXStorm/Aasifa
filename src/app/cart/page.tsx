'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Trash2, 
  ShoppingBag, 
  CheckCircle, 
  ChevronLeft, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Tag, 
  Lock 
} from 'lucide-react';
import { 
  getCart, 
  removeFromCart, 
  updateCartQuantity, 
  getCartTotalPrice, 
  clearCart, 
  CartItem 
} from '@/lib/cart';
import { processCheckout, saveAbandonedCartAction, ShippingDetails } from '../actions/checkout';
import { validatePromoCodeAction } from '../actions/supabaseActions';
import { useTranslation } from '@/context/LanguageContext';

const EGYPT_GOVERNORATES = [
  'Cairo', 'Giza', 'Alexandria', 'Dakahlia', 'Red Sea', 'Beheira', 'Fayoum',
  'Gharbiya', 'Ismailia', 'Menofia', 'Minya', 'Qaliubiya', 'New Valley', 'Suez',
  'Aswan', 'Assiut', 'Beni Suef', 'Port Said', 'Damietta', 'Sharkia', 'South Sinai',
  'Kafr El Sheikh', 'Matrouh', 'Luxor', 'Qena', 'North Sinai', 'Sohag'
];

export default function CartPage() {
  const { t } = useTranslation();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  
  // Form State
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('Egypt');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [apartment, setApartment] = useState('');
  const [landmark, setLandmark] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [saveAddress, setSaveAddress] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<string | null>(null);

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

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

  // Debounced Cart Abandonment Logging
  useEffect(() => {
    if (!email || cart.length === 0) return;
    const delayDebounce = setTimeout(() => {
      saveAbandonedCartAction(email, JSON.stringify(cart))
        .catch(err => console.error('Failed to log abandoned cart:', err));
    }, 2000);

    return () => clearTimeout(delayDebounce);
  }, [email, cart]);

  if (!mounted) {
    return (
      <div style={{ background: '#050505', minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 5%' }}>
        <p style={{ color: '#888', fontFamily: 'monospace', letterSpacing: '0.1em' }}>LOADING CART...</p>
      </div>
    );
  }

  const handleQuantityChange = (item: CartItem, newQty: number) => {
    updateCartQuantity(item.id, newQty);
  };

  const handleRemoveItem = (item: CartItem) => {
    removeFromCart(item.id);
  };

  const subtotal = getCartTotalPrice();
  const shippingFee = governorate ? 60 : 0;
  const discountAmount = appliedPromo ? subtotal * (discountPercentage / 100) : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return;
    const { valid, discountPercentage, message } = await validatePromoCodeAction(promoCodeInput.trim());
    if (valid) {
      setAppliedPromo(promoCodeInput.trim().toUpperCase());
      setDiscountPercentage(discountPercentage);
      setPromoMessage({ text: `${discountPercentage}% DISCOUNT APPLIED`, type: 'success' });
    } else {
      setAppliedPromo(null);
      setDiscountPercentage(0);
      setPromoMessage({ text: message || 'Invalid promo code', type: 'error' });
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !email.trim() || !firstName.trim() || !detailedAddress.trim() || !governorate) {
      setErrorMessage('Please fill in all required contact and shipping details.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const checkoutItems = cart.map(i => ({
      variantId: i.id,
      quantity: i.quantity
    }));

    const shippingPayload: ShippingDetails = {
      phone,
      email,
      country,
      firstName,
      lastName,
      detailedAddress,
      building,
      floor,
      apartment,
      landmark,
      governorate,
      postalCode,
      shippingFee,
      promoCode: appliedPromo || undefined,
    };

    try {
      const response = await processCheckout(shippingPayload, checkoutItems);

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

  // SUCCESS SCREEN
  if (successOrder) {
    return (
      <div style={{
        background: '#050505',
        minHeight: 'calc(100vh - 70px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 5%',
      }}>
        <div className="glass-panel" style={{
          maxWidth: '580px',
          width: '100%',
          padding: 'clamp(30px, 6vw, 50px)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
          }}>
            <CheckCircle size={42} style={{ color: '#ffffff' }} />
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#888888', display: 'block', marginBottom: '8px' }}>
              TRANSACTION CONFIRMED
            </span>
            <h1 className="brand-title" style={{ fontSize: 'clamp(1.4rem, 5vw, 2.2rem)', fontWeight: 900, color: '#ffffff', margin: 0 }}>
              ORDER RECEIVED
            </h1>
          </div>

          <p style={{ color: '#aaaaaa', fontSize: '0.92rem', lineHeight: '1.7', margin: 0 }}>
            Thank you for selecting <strong style={{ color: '#ffffff' }}>AASIFA</strong>. Your order has been registered in our system. Our customer support team will contact you within <strong style={{ color: '#ffffff' }}>2 business days</strong> to confirm delivery details.
          </p>

          <div style={{
            background: '#0d0d0d',
            border: '1px solid #222222',
            padding: '16px 24px',
            width: '100%',
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.85rem',
            fontFamily: 'monospace',
          }}>
            <span style={{ color: '#888888' }}>ORDER REFERENCE:</span>
            <span style={{ color: '#ffffff', fontWeight: 'bold', letterSpacing: '0.05em' }}>
              #{successOrder.split('-')[0].toUpperCase()}
            </span>
          </div>

          <Link 
            href="/" 
            className="btn-primary" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: '#ffffff',
              color: '#000000',
              padding: '16px 32px',
              fontWeight: 900,
              fontSize: '0.85rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              borderRadius: '4px',
              marginTop: '10px',
            }}
          >
            {t('explore.collection')} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#050505',
      color: '#ffffff',
      minHeight: 'calc(100vh - 60px)',
      padding: 'clamp(20px, 4vw, 50px) 5% 100px 5%',
      fontFamily: 'var(--font-inter)',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* PROMINENT TOP BAR: BACK TO SHOP LINK */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'clamp(24px, 4vw, 40px)',
          borderBottom: '1px solid #1a1a1a',
          paddingBottom: '18px'
        }}>
          <Link 
            href="/" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '6px',
              transition: 'var(--transition-smooth)'
            }}
            className="back-btn-hover"
          >
            <ChevronLeft size={18} /> BACK TO SHOP
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <ShoppingBag size={16} style={{ color: '#fff' }} />
            <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} ITEMS IN BAG</span>
          </div>
        </div>

        {cart.length === 0 ? (
          /* EMPTY CART STATE */
          <div className="glass-panel" style={{
            padding: 'clamp(60px, 10vw, 100px) 20px',
            textAlign: 'center',
            borderRadius: '12px',
            border: '1px dashed rgba(255,255,255,0.15)',
            maxWidth: '650px',
            margin: '40px auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShoppingBag size={40} style={{ color: '#666666' }} />
            </div>

            <div>
              <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', fontWeight: 900, letterSpacing: '0.1em', margin: '0 0 10px 0', textTransform: 'uppercase' }}>
                YOUR BAG IS EMPTY
              </h2>
              <p style={{ color: '#888888', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto', lineHeight: '1.6' }}>
                Explore our latest streetwear collection and select your signature pieces.
              </p>
            </div>

            <Link 
              href="/" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: '#ffffff',
                color: '#000000',
                padding: '16px 36px',
                fontWeight: 900,
                fontSize: '0.85rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                borderRadius: '4px',
                marginTop: '10px'
              }}
            >
              {t('explore.collection')} <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          /* SPLIT 2-COLUMN LUXURY CHECKOUT GRID */
          <form onSubmit={handleCheckoutSubmit} style={{
            display: 'grid',
            gridTemplateColumns: '1.15fr 0.85fr',
            gap: 'clamp(24px, 5vw, 60px)',
            alignItems: 'start',
          }} className="cart-grid-layout">
            
            {/* LEFT COLUMN: Customer & Delivery Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {errorMessage && (
                <div style={{
                  padding: '14px 18px',
                  border: '1px solid #ef4444',
                  background: 'rgba(239, 68, 68, 0.08)',
                  color: '#f87171',
                  fontSize: '0.82rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span>⚠️</span> {errorMessage}
                </div>
              )}

              {/* SECTION 1: CONTACT */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#ffffff', color: '#000000', fontSize: '0.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    1
                  </span>
                  <h2 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                    CONTACT INFORMATION
                  </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }} className="grid-responsive-2col">
                  <div>
                    <label className="input-label">PHONE NUMBER (EGYPT 01XXXXXXXXX) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="01XXXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="styled-input"
                    />
                  </div>
                  <div>
                    <label className="input-label">EMAIL ADDRESS (FOR RECEIPT) *</label>
                    <input
                      type="email"
                      required
                      placeholder="your.email@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="styled-input"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: DELIVERY ADDRESS */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#ffffff', color: '#000000', fontSize: '0.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    2
                  </span>
                  <h2 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                    DELIVERY ADDRESS
                  </h2>
                </div>

                {/* Country Selection */}
                <div>
                  <label className="input-label">COUNTRY</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="styled-input"
                  >
                    <option value="Egypt">EGYPT 🇪🇬</option>
                  </select>
                </div>

                {/* Name */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }} className="grid-responsive-2col">
                  <div>
                    <label className="input-label">FIRST NAME *</label>
                    <input
                      type="text"
                      required
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="styled-input"
                    />
                  </div>
                  <div>
                    <label className="input-label">LAST NAME</label>
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="styled-input"
                    />
                  </div>
                </div>

                {/* Detailed Street Address */}
                <div>
                  <label className="input-label">DETAILED STREET ADDRESS *</label>
                  <input
                    type="text"
                    required
                    placeholder="Street name, building number, district..."
                    value={detailedAddress}
                    onChange={(e) => setDetailedAddress(e.target.value)}
                    className="styled-input"
                  />
                </div>

                {/* Building & Floor */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }} className="grid-responsive-2col">
                  <div>
                    <label className="input-label">BUILDING NAME / NO</label>
                    <input
                      type="text"
                      placeholder="e.g. Bldg 42"
                      value={building}
                      onChange={(e) => setBuilding(e.target.value)}
                      className="styled-input"
                    />
                  </div>
                  <div>
                    <label className="input-label">FLOOR NO</label>
                    <input
                      type="text"
                      placeholder="e.g. Floor 3"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      className="styled-input"
                    />
                  </div>
                </div>

                {/* Apt & Landmark */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }} className="grid-responsive-2col">
                  <div>
                    <label className="input-label">APARTMENT NO</label>
                    <input
                      type="text"
                      placeholder="e.g. Apt 12"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      className="styled-input"
                    />
                  </div>
                  <div>
                    <label className="input-label">LANDMARK</label>
                    <input
                      type="text"
                      placeholder="e.g. Near Mall / Station"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="styled-input"
                    />
                  </div>
                </div>

                {/* Governorate & Postal Code */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '14px' }} className="grid-responsive-2col">
                  <div>
                    <label className="input-label">GOVERNORATE / CITY *</label>
                    <select
                      required
                      value={governorate}
                      onChange={(e) => setGovernorate(e.target.value)}
                      className="styled-input"
                    >
                      <option value="">-- SELECT GOVERNORATE --</option>
                      {EGYPT_GOVERNORATES.map(g => (
                        <option key={g} value={g}>{g.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">POSTAL CODE</label>
                    <input
                      type="text"
                      placeholder="Optional"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="styled-input"
                    />
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', color: '#888888', cursor: 'pointer', marginTop: '6px' }}>
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    style={{ accentColor: '#ffffff', width: '16px', height: '16px' }}
                  />
                  Save address details for future orders
                </label>
              </div>

              {/* SECTION 3: PAYMENT METHOD */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#ffffff', color: '#000000', fontSize: '0.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    3
                  </span>
                  <h2 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                    PAYMENT METHOD
                  </h2>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#0a0a0a',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '18px 20px',
                  borderRadius: '6px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <input
                      type="radio"
                      readOnly
                      checked
                      style={{ accentColor: '#ffffff', width: '18px', height: '18px' }}
                    />
                    <div>
                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff', display: 'block', letterSpacing: '0.05em' }}>
                        CASH ON DELIVERY (COD)
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#888888' }}>
                        Pay cash directly to courier upon package arrival.
                      </span>
                    </div>
                  </div>
                  <ShieldCheck size={20} style={{ color: '#ffffff' }} />
                </div>
              </div>

              {/* SUBMIT BUTTON (DESKTOP) */}
              <button
                type="submit"
                disabled={loading}
                className="desktop-submit-btn"
                style={{
                  width: '100%',
                  padding: '20px',
                  background: '#ffffff',
                  color: '#000000',
                  border: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 900,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease',
                  opacity: loading ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}
              >
                <Lock size={18} />
                {loading ? 'PROCESSING ORDER...' : `COMPLETE ORDER (${grandTotal.toFixed(2)} EGP)`}
              </button>

            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY & ITEM LIST */}
            <div className="glass-panel" style={{
              padding: '28px',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              position: 'sticky',
              top: '90px',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
              
              <h3 style={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0, borderBottom: '1px solid #1c1c1c', paddingBottom: '16px' }}>
                ORDER SUMMARY
              </h3>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '360px', overflowY: 'auto', paddingRight: '4px' }}>
                {cart.map((item) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {/* Image Thumbnail */}
                      <div style={{ position: 'relative', width: '60px', height: '75px', background: '#111111', borderRadius: '4px', overflow: 'hidden', border: '1px solid #222222', flexShrink: 0 }}>
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="60px"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>

                      {/* Info */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.02em' }}>
                          {item.name}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.7rem', background: '#222222', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                            {item.size}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#888888' }}>
                            {item.price} EGP / item
                          </span>
                        </div>
                        
                        {/* Stepper & Trash */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #333333', background: '#0a0a0a', borderRadius: '4px' }}>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              style={{ width: '26px', height: '24px', fontSize: '0.8rem', cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer', color: '#aaaaaa' }}
                            >
                              -
                            </button>
                            <span style={{ width: '28px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 'bold', color: '#ffffff' }}>
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item, item.quantity + 1)}
                              disabled={item.quantity >= item.maxStock}
                              style={{ width: '26px', height: '24px', fontSize: '0.8rem', cursor: item.quantity >= item.maxStock ? 'not-allowed' : 'pointer', color: '#aaaaaa' }}
                            >
                              +
                            </button>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item)}
                            style={{ color: '#666666', cursor: 'pointer', transition: 'color 0.2s' }}
                            className="trash-btn-hover"
                            title="Remove item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Total item price */}
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', whiteSpace: 'nowrap' }}>
                      {(item.price * item.quantity).toFixed(2)} EGP
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ width: '100%', height: '1px', background: '#1c1c1c' }} />

              {/* Promo Code Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Tag size={12} /> PROMO CODE
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                    placeholder="ENTER DISCOUNT CODE"
                    className="styled-input"
                    style={{ flex: 1, textTransform: 'uppercase' }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    style={{
                      background: '#ffffff',
                      color: '#000000',
                      border: 'none',
                      padding: '0 18px',
                      fontSize: '0.75rem',
                      fontWeight: 900,
                      letterSpacing: '0.05em',
                      cursor: 'pointer',
                      borderRadius: '4px'
                    }}
                  >
                    APPLY
                  </button>
                </div>
                {promoMessage && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: promoMessage.type === 'success' ? '#4ade80' : '#f87171', marginTop: '4px' }}>
                    {promoMessage.text}
                  </span>
                )}
              </div>

              <div style={{ width: '100%', height: '1px', background: '#1c1c1c' }} />

              {/* Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888888' }}>
                  <span>SUBTOTAL</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{subtotal.toFixed(2)} EGP</span>
                </div>

                {appliedPromo && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4ade80', fontWeight: 600 }}>
                    <span>DISCOUNT ({discountPercentage}%)</span>
                    <span>- {discountAmount.toFixed(2)} EGP</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888888' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Truck size={14} /> SHIPPING
                  </span>
                  <span style={{ color: governorate ? '#ffffff' : '#888888', fontWeight: 600 }}>
                    {governorate ? `${shippingFee.toFixed(2)} EGP` : 'SELECT GOVERNORATE'}
                  </span>
                </div>

                <div style={{ width: '100%', height: '1px', background: '#1c1c1c', margin: '4px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 900, color: '#ffffff' }}>
                  <span>TOTAL</span>
                  <span>{grandTotal.toFixed(2)} EGP</span>
                </div>
              </div>

            </div>

            {/* MOBILE FLOATING STICKY BOTTOM BAR */}
            <div className="mobile-sticky-bar">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.7rem', color: '#888888', textTransform: 'uppercase' }}>TOTAL DUE</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff' }}>{grandTotal.toFixed(2)} EGP</span>
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: '#ffffff',
                  color: '#000000',
                  padding: '14px 24px',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'PROCESSING...' : 'COMPLETE ORDER'}
              </button>
            </div>

          </form>
        )}

      </div>

      <style jsx>{`
        .input-label {
          display: block;
          font-size: 0.72rem;
          font-weight: 800;
          color: #888888;
          letter-spacing: 0.08em;
          margin-bottom: 6px;
          text-transform: uppercase;
        }

        .styled-input {
          width: 100%;
          padding: 14px 16px;
          background: #0a0a0a;
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #ffffff;
          font-size: 0.85rem;
          border-radius: 6px;
          font-family: inherit;
          transition: border-color 0.2s ease, background 0.2s ease;
          outline: none;
        }

        .styled-input:focus {
          border-color: #ffffff;
          background: #0f0f0f;
        }

        .styled-input::placeholder {
          color: #444444;
        }

        .back-btn-hover:hover {
          background: rgba(255, 255, 255, 0.15) !important;
          border-color: #ffffff !important;
        }

        .trash-btn-hover:hover {
          color: #ef4444 !important;
        }

        .mobile-sticky-bar {
          display: none;
        }

        @media (max-width: 900px) {
          .cart-grid-layout {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
          }
          .grid-responsive-2col {
            grid-template-columns: 1fr !important;
          }
          .desktop-submit-btn {
            display: none !important;
          }
          .mobile-sticky-bar {
            display: flex !important;
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background: #0a0a0a;
            border-top: 1px solid rgba(255,255,255,0.15);
            padding: 16px 5%;
            justify-content: space-between;
            align-items: center;
            z-index: 99;
            box-shadow: 0 -10px 30px rgba(0,0,0,0.8);
          }
        }
      `}</style>
    </div>
  );
}
