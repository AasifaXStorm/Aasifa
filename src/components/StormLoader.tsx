'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function StormLoader({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [fadeout, setFadeout] = useState(false);

  useEffect(() => {
    const isAdmin = pathname?.startsWith('/stormy');

    const handleLoadComplete = () => {
      // Small timeout for smooth animation transition
      setTimeout(() => {
        setFadeout(true);
        setTimeout(() => {
          setLoading(false);
        }, 300);
      }, 400);
    };

    if (isAdmin) {
      // In Admin panel, wait for the page data to explicitly signal completion
      const handleDataLoaded = () => {
        handleLoadComplete();
      };
      window.addEventListener('storm_data_loaded', handleDataLoaded);
      
      // Fallback timeout in case event is missed or doesn't fire (max 3 seconds)
      const fallback = setTimeout(handleLoadComplete, 3000);

      return () => {
        window.removeEventListener('storm_data_loaded', handleDataLoaded);
        clearTimeout(fallback);
      };
    } else {
      // Storefront/Visitor pages: fade out after window finishes loading
      const handleLoad = () => {
        handleLoadComplete();
      };

      if (document.readyState === 'complete') {
        handleLoad();
      } else {
        window.addEventListener('load', handleLoad);
        const fallback = setTimeout(handleLoad, 1200);
        return () => {
          window.removeEventListener('load', handleLoad);
          clearTimeout(fallback);
        };
      }
    }
  }, [pathname]);

  if (!loading) {
    return <>{children}</>;
  }

  return (
    <>
      <div style={{
        position: 'fixed',
        inset: 0,
        background: '#040404',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        transition: 'opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: fadeout ? 0 : 1,
        pointerEvents: 'none',
        gap: '30px'
      }}>
        {/* Glowing Logo */}
        <div style={{
          animation: 'pulseGlow 1.5s ease-in-out infinite alternate',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <img 
            src="/images/WhiteStorm.png" 
            alt="STORM" 
            style={{ 
              height: '45px', 
              width: 'auto', 
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.4))'
            }} 
          />
        </div>

        {/* Loading progress bar */}
        <div style={{
          width: '180px',
          height: '2px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '2px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: '40%',
            background: '#ffffff',
            borderRadius: '2px',
            animation: 'loadProgress 1.2s infinite ease-in-out',
            boxShadow: '0 0 8px rgba(255,255,255,0.8)'
          }} />
        </div>

        {/* Context-aware loading message */}
        {pathname?.startsWith('/stormy') && (
          <div style={{
            fontSize: '0.75rem',
            color: '#888',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            marginTop: '-10px'
          }}>
            {(() => {
              if (pathname === '/stormy') return 'LOADING METRICS...';
              if (pathname.includes('/products/new')) return 'PREPARING PRODUCT CREATION...';
              if (pathname.includes('/products/')) return 'LOADING PRODUCT DETAILS...';
              if (pathname.includes('/products')) return 'LOADING PRODUCTS...';
              if (pathname.includes('/inventory')) return 'LOADING INVENTORY...';
              if (pathname.includes('/orders')) return 'LOADING ORDERS...';
              if (pathname.includes('/tweaks')) return 'LOADING TWEAKS...';
              if (pathname.includes('/settings')) return 'LOADING SETTINGS...';
              if (pathname.includes('/shipping')) return 'LOADING SHIPPING RULES...';
              return 'LOADING ADMIN PANEL...';
            })()}
          </div>
        )}
      </div>
      
      {/* Hide content visually during initial load to prevent layout shifts */}
      <div style={{ opacity: fadeout ? 1 : 0, transition: 'opacity 0.2s ease-in' }}>
        {children}
      </div>

      <style jsx global>{`
        @keyframes pulseGlow {
          0% {
            transform: scale(0.97);
            filter: drop-shadow(0 0 10px rgba(255,255,255,0.2));
          }
          100% {
            transform: scale(1.02);
            filter: drop-shadow(0 0 25px rgba(255,255,255,0.6));
          }
        }
        @keyframes loadProgress {
          0% {
            left: -40%;
          }
          50% {
            left: 60%;
            width: 50%;
          }
          100% {
            left: 100%;
            width: 30%;
          }
        }
      `}</style>
    </>
  );
}
