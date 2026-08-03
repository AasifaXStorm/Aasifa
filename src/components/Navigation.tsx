'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { getCartTotalItems } from '@/lib/cart';
import { useTranslation } from '@/context/LanguageContext';

import { getSiteConfig } from '@/app/actions/supabaseActions';
import { DEFAULT_TICKER_TEXT, DEFAULT_TICKER_SPEED } from '@/lib/constants';

export function Navigation() {
  const [cartCount, setCartCount] = useState(0);
  const { t } = useTranslation();
  const pathname = usePathname();

  const stored = typeof window !== 'undefined' ? localStorage.getItem('aasifa_theme') : null;
  const initialTheme = stored === 'light' ? 'light' : 'dark';
  const [theme, setTheme] = useState(initialTheme);
  useEffect(() => {
    document.documentElement.classList.toggle('dark-theme', theme === 'dark');
    document.documentElement.classList.toggle('light-theme', theme === 'light');
  }, [theme]);

  const [marquee, setMarquee] = useState<{ text: string; speed: number; visible: boolean }>({
    text: DEFAULT_TICKER_TEXT,
    speed: DEFAULT_TICKER_SPEED,
    visible: true
  });

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('aasifa_theme', newTheme);
    setTheme(newTheme);
  };

  useEffect(() => {
    // Set initial cart count
    setCartCount(getCartTotalItems());

    // Fetch site config for marquee
    const fetchConfig = async () => {
      try {
        const config = await getSiteConfig();
        if (config && config.description) {
          const parsed = JSON.parse(config.description);
          setMarquee({
            text: parsed.marquee_text || DEFAULT_TICKER_TEXT,
            speed: parsed.marquee_speed || DEFAULT_TICKER_SPEED,
            visible: parsed.marquee_visibility !== 'Hidden'
          });
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchConfig();

    // Listen for cart update events
    const handleCartUpdate = () => {
      setCartCount(getCartTotalItems());
    };

    window.addEventListener('aasifa_cart_updated', handleCartUpdate);
    return () => {
      window.removeEventListener('aasifa_cart_updated', handleCartUpdate);
    };
  }, []);

  if (pathname.startsWith('/stormy')) return null; // keep admin routes hidden

  return (
    <>
      {marquee.visible && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '32px',
          background: 'var(--panel-bg, #0a0a0a)',
          borderBottom: '1px solid #222',
          overflow: 'hidden',
          zIndex: 101,
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            width: 'max-content',
            animation: `marqueeAnim ${marquee.speed}s linear infinite`,
          }}>
            <div style={{
              display: 'inline-flex',
              paddingRight: '50px',
              fontSize: '0.75rem',
              letterSpacing: '0.15em',
              fontWeight: 700,
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap'
            }}>
              {marquee.text} &nbsp; · &nbsp; {marquee.text} &nbsp; · &nbsp; {marquee.text} &nbsp; · &nbsp; {marquee.text} &nbsp; · &nbsp;
            </div>
            <div style={{
              display: 'inline-flex',
              paddingRight: '50px',
              fontSize: '0.75rem',
              letterSpacing: '0.15em',
              fontWeight: 700,
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap'
            }}>
              {marquee.text} &nbsp; · &nbsp; {marquee.text} &nbsp; · &nbsp; {marquee.text} &nbsp; · &nbsp; {marquee.text} &nbsp; · &nbsp;
            </div>
          </div>
          <style jsx>{`
            @keyframes marqueeAnim {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
        </div>
      )}
      <header className="glass-nav" style={{
        position: 'fixed',
        left: 0,
        width: '100%',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 5%',
        zIndex: 100,
      }}>
      <Link 
        href="/" 
        onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
        style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
      >
        <Image
          src="/images/WhiteStorm.png"
          alt="WhiteStorm"
          width={120}
          height={32}
          priority
          style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
          className="storm-logo-hover"
        />
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button
          onClick={toggleTheme}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          className="theme-toggle-btn"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px', transform: 'rotate(0deg)' }}>
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px', transform: 'rotate(15deg)' }}>
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </button>

        <Link href="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: 'var(--text-primary)' }} className="cart-nav-hover">
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
        .glass-nav {
          background: var(--nav-bg, rgba(3, 3, 3, 0.8));
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-color);
        }
        .cart-nav-hover:hover {
          color: var(--accent) !important;
          filter: drop-shadow(0 0 5px var(--accent));
        }
      `}</style>
    </header>
    </>
  );
}
