'use client';

import React from 'react';
import { Mail, Clock } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

export default function ContactPage() {
  const { t } = useTranslation();

  return (
    <div style={{
      background: '#0a0a0a',
      minHeight: 'calc(100vh - 70px)',
      padding: '80px 5%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        maxWidth: '750px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#555555', letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
            {t('contact.connect')}
          </span>
          <h1 className="brand-title" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '20px', letterSpacing: '0.1em' }}>
            {t('contact.title')}
          </h1>
          <div style={{ width: '40px', height: '1px', background: '#2a2a2a', margin: '0 auto' }}></div>
        </div>

        {/* Info Box */}
        <div className="glass-panel" style={{ padding: '40px 30px', border: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <p style={{ color: '#b0b0b0', lineHeight: '1.8', fontSize: '1rem', fontWeight: 300, textAlign: 'center' }}>
            {t('contact.blurb')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '400px', margin: '0 auto', width: '100%' }}>
            
            {/* Email mailto button */}
            <a 
              href="mailto:aasifa.storm.eg@gmail.com?subject=Aasifa%20Inquiry"
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '16px',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              <Mail size={18} /> {t('contact.send_email')}
            </a>

            {/* Instagram Link */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#121212', border: '1px solid #1a1a1a', padding: '12px 20px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
              <div>
                <span style={{ display: 'block', fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('contact.instagram_dm')}</span>
                <a href="https://www.instagram.com/aasifa.eg/" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 600 }}>
                  @aasifa.eg
                </a>
              </div>
            </div>

            {/* Support Hours */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#121212', border: '1px solid #1a1a1a', padding: '12px 20px' }}>
              <Clock size={18} style={{ color: 'var(--accent)' }} />
              <div>
                <span style={{ display: 'block', fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('contact.hours')}</span>
                <span style={{ fontSize: '0.85rem', color: '#b0b0b0' }}>
                  {t('contact.days')}
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
