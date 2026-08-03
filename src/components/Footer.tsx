'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/context/LanguageContext';

export function Footer() {
  const { t } = useTranslation();
  const pathname = usePathname();

  if (pathname.startsWith('/stormy')) return null;

  return (
    <footer style={{
      background: 'var(--bg-base)',
      borderTop: '1px solid var(--border-color)',
      padding: 'clamp(30px, 8vw, 50px) 5% clamp(20px, 5vw, 30px) 5%',
      color: 'var(--text-muted)',
      fontSize: '0.9rem',
      position: 'relative',
      zIndex: 2,
    }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: '40px',
        maxWidth: '1200px',
        margin: '0 auto',
        marginBottom: '40px',
      }}>
        {/* Brand column */}
        <div style={{ flex: '1 1 300px' }}>
          <h3 className="brand-title" style={{ fontSize: 'clamp(1rem, 3vw, 1.2rem)', marginBottom: '20px', color: 'var(--text-primary)' }}>
            {t('brand.title')}
          </h3>
          <p style={{ lineHeight: '1.6', maxWidth: '280px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {t('about.blurb')}
          </p>
        </div>

        {/* Links column */}
        <div style={{ flex: '1 1 200px' }}>
          <h4 style={{ color: 'var(--text-primary)', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px' }}>
            {t('nav.shop')}
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0 }}>
            <li><Link href="/#shop" className="footer-link-hover">{t('nav.shop')}</Link></li>
            <li><Link href="/shipping-policy" className="footer-link-hover">Shipping & Returns</Link></li>
          </ul>
        </div>

        {/* Social column */}
        <div style={{ flex: '1 1 200px' }}>
          <h4 style={{ color: 'var(--text-primary)', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px' }}>
            {t('contact.connect')}
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0 }}>
            <li>
              <a 
                href="https://www.instagram.com/aasifa.eg/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                className="footer-link-hover"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg> {t('nav.instagram')}
              </a>
            </li>
            <li>
              <a 
                href="https://www.tiktok.com/@aasifa.eg?_r=1&_t=ZS-98VVbacHgoh" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                className="footer-link-hover"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.8-5.46-.4-2.51.33-5.13 2.01-6.94 1.51-1.61 3.73-2.45 5.92-2.31v4.06c-1.07-.1-2.19.16-3.03.88-.85.74-1.31 1.84-1.28 2.98.01 1.25.68 2.45 1.77 3.06 1.48.83 3.42.66 4.67-.62 1.05-1.06 1.47-2.6 1.47-4.08.01-4.88-.01-9.76.01-14.46h-.01z" />
                </svg> TikTok
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright row */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '20px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
      }}>
        <p>© 2026 Aasifa. All rights reserved.</p>
      </div>

      <style jsx>{`
        .footer-link-hover:hover {
          color: var(--accent) !important;
        }
      `}</style>
    </footer>
  );
}
