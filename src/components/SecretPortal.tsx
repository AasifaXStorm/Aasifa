'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { fetchTweak } from '@/app/actions/tweaks';

export function SecretPortal() {
  const { language, toggleLanguage, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showFooterLinks, setShowFooterLinks] = useState(true);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Fetch Tweaks dynamic settings using Server Action (checks KV + database fallback)
    const fetchTweakConfig = async () => {
      try {
        const val = await fetchTweak('show_footer_links', true);
        setShowFooterLinks(val);
      } catch (e) {
        console.error('Error loading flyout settings:', e);
      }
    };

    fetchTweakConfig();

    // Event listener to reload if config changes in admin dashboard
    const handleReload = () => fetchTweakConfig();
    window.addEventListener('aasifa_config_updated', handleReload);
    return () => {
      window.removeEventListener('aasifa_config_updated', handleReload);
    };
  }, []);

  // Click outside detection to close flyout
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        isOpen &&
        flyoutRef.current &&
        !flyoutRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <>
      {/* Floating fixed single lightning bolt portal button in the bottom-left */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'rgba(25,25,25,0.85)',
          border: '1px solid rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isOpen ? 'var(--accent)' : '#888',
          cursor: 'pointer',
          zIndex: 9999,
          backdropFilter: 'blur(5px)',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        }}
        className="secret-portal-btn"
        aria-label="Access Tweak Settings"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px' }}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      </button>

      {/* Flyout Panel */}
      {isOpen && (
        <div
          ref={flyoutRef}
          className="glass-panel"
          style={{
            position: 'fixed',
            bottom: '72px',
            left: '24px',
            zIndex: 99998,
            width: '240px',
            padding: '24px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.8), 0 0 20px rgba(207,224,255,0.02)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            animation: 'flyout-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          {/* Conditional Footer Links */}
          {showFooterLinks && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid #1a1a1a', paddingBottom: '16px' }}>
              <Link 
                href="/" 
                onClick={() => setIsOpen(false)}
                style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', color: '#888', textTransform: 'uppercase' }}
                className="flyout-link-hover"
              >
                {t('nav.home')}
              </Link>
              <Link 
                href="/#shop" 
                onClick={() => setIsOpen(false)}
                style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', color: '#888', textTransform: 'uppercase' }}
                className="flyout-link-hover"
              >
                {t('nav.shop')}
              </Link>
              <Link 
                href="/about" 
                onClick={() => setIsOpen(false)}
                style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', color: '#888', textTransform: 'uppercase' }}
                className="flyout-link-hover"
              >
                {t('nav.about')}
              </Link>
              <a 
                href="mailto:aasifa.storm.eg@gmail.com?subject=Aasifa%20Inquiry"
                onClick={() => setIsOpen(false)}
                style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', color: '#888', textTransform: 'uppercase' }}
                className="flyout-link-hover"
              >
                {t('nav.contact')}
              </a>
              <a 
                href="https://www.instagram.com/aasifa.eg/" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', color: '#888', textTransform: 'uppercase' }}
                className="flyout-link-hover"
              >
                {t('nav.instagram')}
              </a>
            </div>
          )}

          {/* Translation Control */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.05em', color: '#555', textTransform: 'uppercase' }}>
              Translate
            </span>
            <button
              onClick={() => {
                toggleLanguage();
              }}
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: 'var(--accent)',
                border: '1px solid var(--accent)',
                padding: '4px 10px',
                background: 'rgba(207, 224, 255, 0.05)',
                cursor: 'pointer',
              }}
              className="translate-toggle-btn"
            >
              {language === 'en' ? 'عربي' : 'EN'}
            </button>
          </div>

          {/* Hidden Admin Portal Entry */}
          <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '12px', display: 'flex', justifyContent: 'flex-start' }}>
            <Link
              href="/stormy"
              onClick={() => setIsOpen(false)}
              style={{ fontSize: '0.65rem', color: '#333333', letterSpacing: '0.05em', textTransform: 'uppercase', textDecoration: 'none' }}
              className="secret-console-link"
            >
              Console
            </Link>
          </div>
        </div>
      )}

      {/* Flyout CSS Animation and hover styling */}
      <style jsx global>{`
        @keyframes flyout-in {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .flyout-link-hover:hover {
          color: var(--accent) !important;
        }
        
        .translate-toggle-btn:hover {
          background: var(--accent) !important;
          color: #030303 !important;
          box-shadow: 0 0 10px rgba(207, 224, 255, 0.3);
        }
        
        .secret-portal-btn:hover {
          color: var(--accent) !important;
          border-color: var(--accent) !important;
          box-shadow: 0 0 15px rgba(207, 224, 255, 0.45) !important;
        }

        .secret-console-link:hover {
          color: #555555 !important;
        }
      `}</style>
    </>
  );
}
