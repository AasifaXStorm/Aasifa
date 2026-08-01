'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, X, ShoppingBag, Info, Mail, Ruler, Calculator } from 'lucide-react';

export function BottomLeftLightningBolt() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [showCalc, setShowCalc] = useState(false);

  // Calculator state
  const [weight, setWeight] = useState('');
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);
  const [calcError, setCalcError] = useState('');

  if (pathname.startsWith('/stormy')) return null;

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setCalcError('');
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) {
      setCalcError('Please enter a valid weight.');
      setRecommendedSize(null);
      return;
    }

    if (w < 55) {
      setRecommendedSize('S');
    } else if (w >= 55 && w <= 65) {
      setRecommendedSize('S');
    } else if (w >= 66 && w <= 75) {
      setRecommendedSize('M');
    } else if (w >= 76 && w <= 85) {
      setRecommendedSize('L');
    } else if (w >= 86 && w <= 100) {
      setRecommendedSize('XL');
    } else {
      setRecommendedSize('XL');
    }
  };

  const chartData = [
    { size: 'S', chest: '55', length: '69', weight: '55 - 65' },
    { size: 'M', chest: '57', length: '70', weight: '65 - 75' },
    { size: 'L', chest: '61', length: '73', weight: '75 - 85' },
    { size: 'XL', chest: '64', length: '77', weight: '85 - 100' },
  ];

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
          minWidth: '200px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
          animation: 'fadeInUp 0.2s ease-out'
        }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.15em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
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

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => { setShowChart(true); setOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', background: 'transparent', border: 'none', fontSize: '0.85rem', cursor: 'pointer', padding: 0, textAlign: 'left' }}
            >
              <Ruler size={16} color="var(--accent)" /> Size Chart
            </button>

            <button
              onClick={() => { setShowCalc(true); setOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', background: 'transparent', border: 'none', fontSize: '0.85rem', cursor: 'pointer', padding: 0, textAlign: 'left' }}
            >
              <Calculator size={16} color="var(--accent)" /> Size Calculator
            </button>
          </div>
        </div>
      )}

      {/* Size Chart Modal */}
      {showChart && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#000000',
            border: '1px solid #222222',
            borderRadius: '8px',
            padding: '30px',
            width: '100%',
            maxWidth: '480px',
            position: 'relative',
            boxShadow: '0 20px 50px rgba(0,0,0,0.9)'
          }}>
            <button
              onClick={() => setShowChart(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '0.05em', color: '#fff', textTransform: 'uppercase', marginBottom: '25px', fontFamily: 'monospace', fontStyle: 'italic' }}>
              SIZE CHART
            </h3>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'center', color: '#fff', border: '1px solid #333', fontFamily: 'monospace' }}>
              <thead>
                <tr style={{ background: '#0d0d0d', borderBottom: '1px solid #333' }}>
                  <th style={{ padding: '12px', borderRight: '1px solid #333' }}>SIZE</th>
                  <th style={{ padding: '12px', borderRight: '1px solid #333' }}>CHEST</th>
                  <th style={{ padding: '12px', borderRight: '1px solid #333' }}>LENGTH</th>
                  <th style={{ padding: '12px' }}>WEIGHT</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: idx !== chartData.length - 1 ? '1px solid #333' : 'none' }}>
                    <td style={{ padding: '12px', borderRight: '1px solid #333', fontWeight: 'bold' }}>{row.size}</td>
                    <td style={{ padding: '12px', borderRight: '1px solid #333' }}>{row.chest}</td>
                    <td style={{ padding: '12px', borderRight: '1px solid #333' }}>{row.length}</td>
                    <td style={{ padding: '12px' }}>{row.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <img src="/images/WhiteStorm.png" alt="storm" style={{ height: '14px', width: 'auto', opacity: 0.8 }} />
            </div>
          </div>
        </div>
      )}

      {/* Size Calculator Modal */}
      {showCalc && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#000000',
            border: '1px solid #222222',
            borderRadius: '8px',
            padding: '30px',
            width: '100%',
            maxWidth: '400px',
            position: 'relative',
            boxShadow: '0 20px 50px rgba(0,0,0,0.9)'
          }}>
            <button
              onClick={() => { setShowCalc(false); setWeight(''); setRecommendedSize(null); setCalcError(''); }}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '0.05em', color: '#fff', textTransform: 'uppercase', marginBottom: '25px', fontFamily: 'monospace' }}>
              SIZE CALCULATOR
            </h3>

            <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                  YOUR WEIGHT (KG)
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 70"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  style={{
                    background: '#0d0d0d',
                    border: '1px solid #333',
                    color: '#fff',
                    padding: '12px',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              {calcError && (
                <p style={{ color: '#ff6666', fontSize: '0.75rem', margin: 0 }}>{calcError}</p>
              )}

              <button
                type="submit"
                style={{
                  background: '#fff',
                  color: '#000',
                  border: 'none',
                  padding: '12px',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  letterSpacing: '0.05em',
                  fontFamily: 'monospace'
                }}
              >
                FIND MY SIZE
              </button>
            </form>

            {recommendedSize && (
              <div style={{
                marginTop: '25px',
                padding: '20px',
                background: '#0d0d0d',
                border: '1px solid #222',
                borderRadius: '4px',
                textAlign: 'center',
                fontFamily: 'monospace'
              }}>
                <span style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: '5px' }}>RECOMMENDED SIZE</span>
                <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff', display: 'block' }}>{recommendedSize}</span>
                <span style={{ fontSize: '0.7rem', color: '#666', marginTop: '10px', display: 'block' }}>
                  Fits chest: {recommendedSize === 'S' ? '55' : recommendedSize === 'M' ? '57' : recommendedSize === 'L' ? '61' : '64'}cm · Length: {recommendedSize === 'S' ? '69' : recommendedSize === 'M' ? '70' : recommendedSize === 'L' ? '73' : '77'}cm
                </span>
              </div>
            )}
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
