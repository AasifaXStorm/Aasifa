'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, ShoppingBag, CheckCircle } from 'lucide-react';
import { 
  getCart, 
  removeFromCart, 
  updateCartQuantity, 
  getCartTotalPrice, 
  clearCart, 
  CartItem 
} from '@/lib/cart';
import { processCheckout, saveAbandonedCartAction, ShippingDetails } from '../actions/checkout';
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
      <div style={{ background: '#000000', minHeight: 'calc(100vh - 70px)', padding: '100px 5%' }}>
        <p style={{ color: '#888', textAlign: 'center' }}>Loading Checkout...</p>
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
  const grandTotal = subtotal + shippingFee;

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

  // Success view
  if (successOrder) {
    return (
      <div style={{
        background: '#000000',
        minHeight: 'calc(100vh - 70px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px',
      }}>
        <div style={{
          maxWidth: '550px',
          width: '100%',
          padding: '50px 30px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          background: '#090909',
          border: '1px solid #1c1c1c',
        }}>
          <CheckCircle size={60} color="#ffffff" />
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffffff' }}>
            ORDER CONFIRMED
          </h1>
          <p style={{ color: '#aaaaaa', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Thank you for shopping with AASIFA. We have received your order and our sales team will call you within 2 business days to confirm your order by phone.
          </p>
          <div style={{
            background: '#000000',
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
          <Link href="/#shop" className="btn-primary" style={{ marginTop: '10px', display: 'inline-block', background: '#fff', color: '#000', padding: '12px 24px', fontWeight: 800 }}>
            {t('explore.collection')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#000000',
      color: '#ffffff',
      minHeight: 'calc(100vh - 60px)',
      padding: '40px 5% 80px 5%',
      fontFamily: 'var(--font-inter)',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {cart.length === 0 ? (
          /* Empty state */
          <div style={{
            padding: '80px 20px',
            textAlign: 'center',
            border: '1px dashed #222222',
            background: '#050505',
            maxWidth: '600px',
            margin: '60px auto',
          }}>
            <ShoppingBag size={48} style={{ color: '#444', marginBottom: '20px' }} />
            <span style={{ fontSize: '1.2rem', color: '#888', display: 'block', marginBottom: '20px', letterSpacing: '0.05em' }}>
              {t('cart.empty')}
            </span>
            <Link href="/#shop" className="btn-primary" style={{ display: 'inline-block', background: '#fff', color: '#000', padding: '12px 24px', fontWeight: 800 }}>
              {t('explore.collection')}
            </Link>
          </div>
        ) : (
          /* Split 2-Column Luxury Checkout Layout */
          <form onSubmit={handleCheckoutSubmit} style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: '60px',
            alignItems: 'start',
          }} className="checkout-responsive-grid">
            
            {/* LEFT COLUMN: Contact, Address, Payment */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* Header: Title + Cancel Link */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #151515', paddingBottom: '20px' }}>
                <h1 className="brand-title" style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '0.25em', color: '#ffffff' }}>
                  AASIFA
                </h1>
                <Link href="/#shop" style={{ fontSize: '0.75rem', color: '#666666', letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'color 0.2s' }} className="cancel-link">
                  CANCEL
                </Link>
              </div>

              {errorMessage && (
                <div style={{
                  padding: '12px 16px',
                  border: '1px solid #ff3333',
                  background: 'rgba(255,51,51,0.05)',
                  color: '#ffaaaa',
                  fontSize: '0.8rem',
                }}>
                  {errorMessage}
                </div>
              )}

              {/* 1. CONTACT SECTION */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h2 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#ffffff', margin: 0 }}>
                  CONTACT
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="grid-2col-mobile">
                  <input
                    type="tel"
                    required
                    placeholder="MOBILE PHONE (01XXXXXXXXX)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="checkout-input"
                  />
                  <input
                    type="email"
                    required
                    placeholder="EMAIL ADDRESS (FOR RECEIPT)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="checkout-input"
                  />
                </div>
              </div>

              {/* 2. DELIVERY ADDRESS SECTION */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h2 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#ffffff', margin: 0 }}>
                  DELIVERY ADDRESS
                </h2>

                {/* Country */}
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="checkout-input"
                >
                  <option value="Egypt">EGYPT</option>
                </select>

                {/* First Name / Last Name */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="grid-2col-mobile">
                  <input
                    type="text"
                    required
                    placeholder="FIRST NAME"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="checkout-input"
                  />
                  <input
                    type="text"
                    placeholder="LAST NAME"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="checkout-input"
                  />
                </div>

                {/* Detailed Address */}
                <input
                  type="text"
                  required
                  placeholder="DETAILED ADDRESS (STREET NAME / NUMBER)"
                  value={detailedAddress}
                  onChange={(e) => setDetailedAddress(e.target.value)}
                  className="checkout-input"
                />

                {/* Building / Floor */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="grid-2col-mobile">
                  <input
                    type="text"
                    placeholder="BUILDING NAME/NO"
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="checkout-input"
                  />
                  <input
                    type="text"
                    placeholder="FLOOR NO (OPTIONAL)"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    className="checkout-input"
                  />
                </div>

                {/* Apartment / Landmark */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="grid-2col-mobile">
                  <input
                    type="text"
                    placeholder="APARTMENT NO (OPTIONAL)"
                    value={apartment}
                    onChange={(e) => setApartment(e.target.value)}
                    className="checkout-input"
                  />
                  <input
                    type="text"
                    placeholder="LANDMARK (OPTIONAL)"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="checkout-input"
                  />
                </div>

                {/* Governorate / Postal Code */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="grid-2col-mobile">
                  <select
                    required
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="checkout-input"
                  >
                    <option value="">SELECT GOVERNORATE / CITY</option>
                    {EGYPT_GOVERNORATES.map(g => (
                      <option key={g} value={g}>{g.toUpperCase()}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="POSTAL CODE (OPTIONAL)"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="checkout-input"
                  />
                </div>

                {/* Checkbox: Save Address */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.75rem', color: '#888888', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '5px' }}>
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    style={{ accentColor: '#ffffff' }}
                  />
                  SAVE ADDRESS FOR FUTURE ORDERS
                </label>
              </div>

              {/* 3. PAYMENT METHOD SECTION */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h2 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#ffffff', margin: 0 }}>
                  PAYMENT METHOD
                </h2>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#090909',
                  border: '1px solid #222222',
                  padding: '16px 20px',
                  borderRadius: '2px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="radio"
                      readOnly
                      checked
                      style={{ accentColor: '#ffffff' }}
                    />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.08em', color: '#ffffff', textTransform: 'uppercase' }}>
                      CASH ON DELIVERY (COD)
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    background: '#151515',
                    color: '#888888',
                    border: '1px solid #252525',
                    padding: '3px 8px',
                    borderRadius: '2px',
                    textTransform: 'uppercase',
                  }}>
                    LOCAL
                  </span>
                </div>
              </div>

              {/* 4. SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '18px',
                  background: '#ffffff',
                  color: '#000000',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 900,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: '10px',
                  transition: 'opacity 0.2s',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'PROCESSING ORDER...' : 'COMPLETE ORDER'}
              </button>

            </div>

            {/* RIGHT COLUMN: Order Summary */}
            <div style={{
              background: '#040404',
              border: '1px solid #141414',
              padding: '30px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              position: 'sticky',
              top: '90px',
            }}>
              
              {/* Product Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {cart.map((item) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      {/* Image Thumbnail with Badge */}
                      <div style={{ position: 'relative', width: '56px', height: '68px', background: '#111', border: '1px solid #222', flexShrink: 0 }}>
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="56px"
                          style={{ objectFit: 'cover' }}
                        />
                        {/* Quantity Badge */}
                        <span style={{
                          position: 'absolute',
                          top: '-7px',
                          left: '-7px',
                          background: '#333333',
                          color: '#ffffff',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid #000',
                          zIndex: 2,
                        }}>
                          {item.quantity}
                        </span>
                      </div>

                      {/* Info */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em', color: '#ffffff', textTransform: 'uppercase' }}>
                          {item.name}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#666666' }}>
                          SIZE: {item.size}
                        </span>
                        
                        {/* Remove / quantity controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #222', background: '#000' }}>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              style={{ width: '22px', height: '22px', fontSize: '0.75rem', cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer', color: '#888' }}
                            >
                              -
                            </button>
                            <span style={{ width: '24px', textAlign: 'center', fontSize: '0.75rem', color: '#fff' }}>
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item, item.quantity + 1)}
                              disabled={item.quantity >= item.maxStock}
                              style={{ width: '22px', height: '22px', fontSize: '0.75rem', cursor: item.quantity >= item.maxStock ? 'not-allowed' : 'pointer', color: '#888' }}
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item)}
                            style={{ color: '#555555', cursor: 'pointer' }}
                            title="Remove"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap' }}>
                      EGP {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ width: '100%', height: '1px', background: '#151515' }} />

              {/* Totals Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                
                {/* Subtotal */}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>SUBTOTAL</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>EGP {subtotal.toFixed(2)}</span>
                </div>

                {/* Shipping */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>SHIPPING</span>
                  <span style={{ color: governorate ? '#ffffff' : '#666666', fontWeight: 600 }}>
                    {governorate ? `EGP ${shippingFee.toFixed(2)}` : 'SELECT CITY'}
                  </span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#555555', textTransform: 'none', letterSpacing: '0.02em', marginTop: '-4px' }}>
                  2 - 5 business days after confirmation
                </span>

                <div style={{ width: '100%', height: '1px', background: '#151515', margin: '8px 0' }} />

                {/* Grand Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 900, color: '#ffffff' }}>
                  <span>TOTAL</span>
                  <span>EGP {grandTotal.toFixed(2)}</span>
                </div>

              </div>

            </div>

          </form>
        )}

      </div>

      <style jsx>{`
        .checkout-input {
          width: 100%;
          padding: 14px 16px;
          background: #090909;
          border: 1px solid #1a1a1a;
          color: #ffffff;
          font-size: 0.78rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-radius: 2px;
          font-family: inherit;
          transition: border-color 0.2s;
        }
        .checkout-input:focus {
          outline: none;
          border-color: #555555;
        }
        .checkout-input::placeholder {
          color: #444444;
        }
        .cancel-link:hover {
          color: #ffffff !important;
        }
        @media (max-width: 900px) {
          .checkout-responsive-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .grid-2col-mobile {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
