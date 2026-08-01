'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/context/LanguageContext';

export function StormHero() {
  const { t } = useTranslation();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{
      position: 'relative',
      height: '100vh',
      minHeight: '600px',
      width: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'var(--bg-base)',
    }}>
      {/* Background Image with Next.js Image and Parallax */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '120%', // Extra height for parallax
        transform: `translateY(${scrollY * 0.3}px)`,
        zIndex: 0,
      }}>
        <Image
          src="/images/storm-clouds.png"
          alt="Storm Clouds Background"
          fill
          priority
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
          }}
          className="hero-zoom-in"
        />
      </div>

      {/* Cinematic Gradient Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(to top, var(--bg-base) 10%, rgba(10, 10, 10, 0.2) 100%)',
        zIndex: 1,
      }} />

      {/* Hero Content Overlay */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 20px',
      }}>
        {/* Brand Title */}
        <h1 className="brand-title" style={{
          fontSize: 'clamp(2.5rem, 8vw, 5.5rem)',
          lineHeight: '1.1',
          marginBottom: '30px',
        }}>
          {t('brand.title')}
        </h1>

        {/* Moody subtitle */}
        <p style={{
          fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
          color: 'var(--text-muted)',
          maxWidth: '500px',
          lineHeight: '1.6',
          marginBottom: '40px',
          fontWeight: 300,
          letterSpacing: '0.05em',
        }}>
          {t('brand.slogan')}
        </p>

        {/* CTA Button */}
        <a href="#shop" className="btn-primary">
          {t('explore.collection')}
        </a>
      </div>

      <style jsx>{`
        @keyframes subtleZoom {
          0% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        :global(.hero-zoom-in) {
          animation: subtleZoom 8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
