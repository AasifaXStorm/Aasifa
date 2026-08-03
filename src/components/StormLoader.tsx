'use client';

import React, { useState, useEffect } from 'react';

export function StormLoader({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [fadeout, setFadeout] = useState(false);

  useEffect(() => {
    // Wait for page load / mount
    const handleLoad = () => {
      setTimeout(() => {
        setFadeout(true);
        setTimeout(() => {
          setLoading(false);
        }, 300); // match transition duration
      }, 750); // aesthetic loading duration
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      // Fallback timeout in case window load event already fired
      const fallback = setTimeout(handleLoad, 1000);
      return () => {
        window.removeEventListener('load', handleLoad);
        clearTimeout(fallback);
      };
    }
  }, []);

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
