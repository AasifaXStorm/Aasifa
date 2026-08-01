'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { getCartTotalItems } from '@/lib/cart';
import { useTranslation } from '@/context/LanguageContext';

export function Navigation() {
  const [cartCount, setCartCount] = useState(0);
  const { t } = useTranslation();
  const pathname = usePathname();

  useEffect(() => {
    // Set initial cart count
    setCartCount(getCartTotalItems());

    // Listen for cart update events
    const handleCartUpdate = () => {
      setCartCount(getCartTotalItems());
    };

    window.addEventListener('aasifa_cart_updated', handleCartUpdate);
    return () => {
      window.removeEventListener('aasifa_cart_updated', handleCartUpdate);
    };
  }, []);

  if (pathname.startsWith('/stormy')) return null;

  return (
    <header className="glass-nav" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '70px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 5%',
      zIndex: 100,
    }}>
      {/* Brand Logo */}
      <Link href="/" className="brand-title" style={{ fontSize: '1.2rem', textDecoration: 'none', letterSpacing: '0.4em' }}>
        {t('brand.title')}
      </Link>

      {/* Right Nav Icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Cart Icon */}
        <Link href="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: '#e5e5e5' }} className="cart-nav-hover">
          <ShoppingCart size={20} />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: 'var(--accent)',
              color: '#030303',
              fontSize: '0.65rem',
              fontWeight: 'bold',
              borderRadius: '50%',
              width: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {cartCount}
            </span>
          )}
        </Link>
      </div>

      <style jsx>{`
        .cart-nav-hover:hover {
          color: var(--accent) !important;
          filter: drop-shadow(0 0 5px var(--accent));
        }
      `}</style>
    </header>
  );
}
