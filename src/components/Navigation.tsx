'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, X } from 'lucide-react';
import { LightningIcon } from './LightningIcon';
import { getCartTotalItems } from '@/lib/cart';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

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

  return (
    <>
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
        <Link href="/" className="brand-title" style={{ fontSize: '1.2rem', textDecoration: 'none' }}>
          AASIFA
        </Link>

        {/* Right Nav Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Cart Icon */}
          <Link href="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: '#e5e5e5' }}>
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: '#ffffff',
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

          {/* Lightning Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
            style={{
              color: '#e5e5e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
            }}
          >
            <LightningIcon size={22} className="lightning-hover" style={{
              filter: isOpen ? 'drop-shadow(0 0 8px rgba(255,255,255,0.8))' : 'none',
              transform: isOpen ? 'scale(1.1)' : 'scale(1)',
              transition: 'var(--transition-smooth)',
            }} />
          </button>
        </div>
      </header>

      {/* Slide-out Menu Overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            zIndex: 999,
          }}
        />
      )}

      {/* Drawer */}
      <div 
        className="glass-panel"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '100%',
          maxWidth: '400px',
          height: '100vh',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '40px 30px',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div>
          {/* Header of Drawer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
            <span className="brand-title" style={{ fontSize: '1rem' }}>AASIFA</span>
            <button onClick={() => setIsOpen(false)} style={{ color: '#888' }}>
              <X size={24} />
            </button>
          </div>

          {/* Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <Link href="/" onClick={() => setIsOpen(false)} style={{ fontSize: '1.8rem', fontWeight: 300, letterSpacing: '0.05em' }}>
              HOME
            </Link>
            <Link href="/#shop" onClick={() => setIsOpen(false)} style={{ fontSize: '1.8rem', fontWeight: 300, letterSpacing: '0.05em' }}>
              SHOP
            </Link>
            <Link href="/about" onClick={() => setIsOpen(false)} style={{ fontSize: '1.8rem', fontWeight: 300, letterSpacing: '0.05em' }}>
              ABOUT THE BRAND
            </Link>
            <Link href="/contact" onClick={() => setIsOpen(false)} style={{ fontSize: '1.8rem', fontWeight: 300, letterSpacing: '0.05em' }}>
              CONTACT US
            </Link>
            <Link href="/admin" onClick={() => setIsOpen(false)} style={{ fontSize: '1rem', fontWeight: 500, letterSpacing: '0.1em', marginTop: '20px', color: '#888' }}>
              ADMIN PORTAL
            </Link>
          </nav>
        </div>

        {/* Footer info in Drawer */}
        <div style={{ borderTop: '1px solid #222', paddingTop: '30px' }}>
          <p style={{ fontSize: '0.85rem', color: '#888', lineHeight: '1.6', marginBottom: '20px' }}>
            Inspired by the cinematic force of nature. Dark, moody, minimal streetwear designed to withstand the storm.
          </p>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <a href="https://www.instagram.com/aasifa.eg/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg> Instagram
            </a>
            <span style={{ color: '#333' }}>|</span>
            {/* TODO: add TikTok URL */}
            <span style={{ color: '#555', fontSize: '0.85rem' }}>TikTok (TBD)</span>
          </div>
        </div>
      </div>
    </>
  );
}
