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
    setCartCount(getCartTotalItems());

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
    <>
      {/* Promo Marquee Ticker */}
      {marquee.visible && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '32px',
          background: 'var(--bg-elevated)',
          overflow: 'hidden',
          zIndex: 101,
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            width: 'max-content',
            willChange: 'transform',
            animation: `marqueeAnim ${marquee.speed}s linear infinite`,
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: '0.75rem',
              letterSpacing: '0.15em',
              fontWeight: 700,
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap'
            }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <React.Fragment key={i}>
                  <span>{marquee.text}</span>
                  <span style={{ margin: '0 25px', opacity: 0.5 }}>·</span>
                </React.Fragment>
              ))}
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: '0.75rem',
              letterSpacing: '0.15em',
              fontWeight: 700,
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap'
            }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <React.Fragment key={i}>
                  <span>{marquee.text}</span>
                  <span style={{ margin: '0 25px', opacity: 0.5 }}>·</span>
                </React.Fragment>
              ))}
            </div>
          </div>
          <style jsx>{`
            @keyframes marqueeAnim {
              0% { transform: translate3d(0, 0, 0); }
              100% { transform: translate3d(-50%, 0, 0); }
            }
          `}</style>
        </div>
      )}

      {/* Main Nav Bar — NO border-bottom */}
      <header style={{
        position: 'fixed',
        top: marquee.visible ? '32px' : 0,
        left: 0,
        width: '100%',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 5%',
        zIndex: 100,
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}>
        {/* Left: STORM logo */}
        <Link 
          href="/" 
          onClick={(e) => {
            if (pathname === '/') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
        >
          <Image
            src="/images/WhiteStorm.png"
            alt="Storm"
            width={120}
            height={32}
            priority
            style={{ height: 'clamp(24px, 6vw, 32px)', width: 'auto', objectFit: 'contain' }}
            className={`storm-logo-hover ${theme === 'light' ? 'storm-logo-invert' : ''}`}
          />
        </Link>

        {/* Right: Theme toggle + Cart */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <button
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="theme-toggle-btn"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              /* Moon — click to switch to light */
              <svg className="theme-icon-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            ) : (
              /* Sun — click to switch to dark */
              <svg className="theme-icon-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
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
                color: 'var(--bg-base)',
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
          .theme-icon-spin {
            transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .theme-toggle-btn:hover .theme-icon-spin {
            transform: rotate(30deg) scale(1.2);
          }
        `}</style>
      </header>
    </>
  );
}
