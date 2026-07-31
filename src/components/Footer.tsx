'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer style={{
      background: '#0a0a0a',
      borderTop: '1px solid #1a1a1a',
      padding: '50px 5% 30px 5%',
      color: '#888888',
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
          <h3 className="brand-title" style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#ffffff' }}>
            {t('brand.title')}
          </h3>
          <p style={{ lineHeight: '1.6', maxWidth: '280px', fontSize: '0.85rem', color: '#888888' }}>
            {t('about.blurb')}
          </p>
        </div>

        {/* Links column */}
        <div style={{ flex: '1 1 200px' }}>
          <h4 style={{ color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px' }}>
            {t('nav.shop')}
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0 }}>
            <li><Link href="/about" className="footer-link-hover">{t('nav.about')}</Link></li>
            <li><a href="mailto:aasifa.storm.eg@gmail.com?subject=Aasifa%20Inquiry" className="footer-link-hover">{t('nav.contact')}</a></li>
            <li><Link href="/#shop" className="footer-link-hover">{t('nav.shop')}</Link></li>
          </ul>
        </div>

        {/* Social column */}
        <div style={{ flex: '1 1 200px' }}>
          <h4 style={{ color: '#ffffff', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px' }}>
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
              <span style={{ fontSize: '0.85rem', color: '#444444' }}>
                TikTok (TBD)
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright row */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        borderTop: '1px solid #1a1a1a',
        paddingTop: '20px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: '#444444',
      }}>
        <p>© 2026 Aasifa. All rights reserved.</p>
      </div>

      <style jsx>{`
        .footer-link-hover:hover {
          color: var(--accent-color) !important;
        }
      `}</style>
    </footer>
  );
}
