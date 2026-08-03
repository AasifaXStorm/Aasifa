'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { getCartTotalItems } from '@/lib/cart';
import { useTranslation } from '@/context/LanguageContext';

import { getSiteConfig } from '@/app/actions/supabaseActions';

export function Navigation() {
  const [cartCount, setCartCount] = useState(0);
  const { t } = useTranslation();
  const pathname = usePathname();

  const [marquee, setMarquee] = useState<{ text: string; speed: number; visible: boolean }>({
    text: 'ꜱᴛᴏʀᴍ ɪɴ ʏᴏᴜʀ ꜱᴛʏʟᴇ',
    speed: 120,
    visible: true
  });

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
            text: parsed.marquee_text || 'DROP 01 OUT NOW · FAST HOME DELIVERY ALL OVER EGYPT',
            speed: parsed.marquee_speed || 120,
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

  if (pathname.startsWith('/stormy')) return null;

  return (
    <>
      {marquee.visible && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '32px',
          background: '#0d0d0d',
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
        top: marquee.visible ? '32px' : 0,
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
      <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <Image
          src="/images/WhiteStorm.png"
          alt="WhiteStorm"
          width={120}
          height={32}
          priority
          style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
        />
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
    </>
  );
}
