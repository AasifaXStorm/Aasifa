'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, X, ShoppingBag, Info, Mail, ShieldAlert } from 'lucide-react';

export function BottomLeftLightningBolt() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname.startsWith('/stormy')) return null;

  return (
    <div style={{ position: 'fixed', bottom: '25px', left: '25px', zIndex: 999 }}>
      {/* Flyout Menu */}
      {open && (
        <div style={{
          marginBottom: '15px',
          background: 'rgba(15, 15, 15, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '15px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          minWidth: '180px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
          animation: 'fadeInUp 0.2s ease-out'
        }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Quick Access
          </span>

          <Link href="/#shop" onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.85rem' }}>
            <ShoppingBag size={16} color="var(--accent)" /> Shop Drops
          </Link>

          <Link href="/about" onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.85rem' }}>
            <Info size={16} color="var(--accent)" /> About AASIFA
          </Link>

          <Link href="/contact" onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.85rem' }}>
            <Mail size={16} color="var(--accent)" /> Contact Support
          </Link>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
            <Link href="/stormy" onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.75rem' }}>
              <ShieldAlert size={14} color="var(--accent)" /> Admin Console
            </Link>
          </div>
        </div>
      )}

      {/* Floating Lightning Bolt Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        title="Quick Menu"
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--accent)',
          color: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 0 20px var(--accent-glow)',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 0 25px var(--accent)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 0 20px var(--accent-glow)';
        }}
      >
        {open ? <X size={22} /> : <Zap size={22} fill="currentColor" />}
      </button>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
