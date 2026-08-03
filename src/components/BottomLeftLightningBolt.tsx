'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, X, ShoppingBag, Info, Mail, Ruler, Calculator, Package, Lock, Search } from 'lucide-react';
import { trackOrdersByEmail } from '@/app/actions/checkout';

export function BottomLeftLightningBolt() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [showCalc, setShowCalc] = useState(false);

  // Track Order State
  const [showTrack, setShowTrack] = useState(false);
  const [trackEmail, setTrackEmail] = useState('');
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState('');
  const [trackedOrders, setTrackedOrders] = useState<any[] | null>(null);

  // Calculator state
  const [calcTab, setCalcTab] = useState<'kg' | 'cm'>('kg');
  const [weight, setWeight] = useState('');
  const [chest, setChest] = useState('');
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);
  const [calcError, setCalcError] = useState('');

  if (pathname.startsWith('/stormy')) return null;

  const handleTrackOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError('');
    setTrackLoading(true);
    setTrackedOrders(null);

    try {
      const res = await trackOrdersByEmail(trackEmail);
      if (res.success && res.orders) {
        if (res.orders.length === 0) {
          setTrackError('No orders found associated with this email address.');
        } else {
          setTrackedOrders(res.orders);
        }
      } else {
        setTrackError(res.error || 'Failed to retrieve order history.');
      }
    } catch (err: any) {
      setTrackError(err.message || 'An error occurred while fetching your order status.');
    } finally {
      setTrackLoading(false);
    }
  };

  const handleLockStore = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aasifa_store_unlocked');
      window.location.reload();
    }
  };

  const handleCalculateWeight = (e: React.FormEvent) => {
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
    } else {
      setRecommendedSize('XL');
    }
  };

  const handleCalculateChest = (e: React.FormEvent) => {
    e.preventDefault();
    setCalcError('');
    const c = parseFloat(chest);
    if (isNaN(c) || c <= 0) {
      setCalcError('Please enter a valid chest measurement.');
      setRecommendedSize(null);
      return;
    }

    if (c < 55) {
      setRecommendedSize('S');
    } else if (c >= 55 && c <= 56) {
      setRecommendedSize('S');
    } else if (c >= 57 && c <= 60) {
      setRecommendedSize('M');
    } else if (c >= 61 && c <= 63) {
      setRecommendedSize('L');
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
          background: 'var(--panel-bg, #0a0a0a)',
          backdropFilter: 'blur(15px)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '15px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          minWidth: '200px',
          boxShadow: '0 15px 35px rgba(0,0,0,0.95)',
          animation: 'fadeInUp 0.2s ease-out'
        }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.15em', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'monospace' }}>
            Quick Access
          </span>

          <Link href="/#shop" onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.8rem', fontFamily: 'monospace' }}>
            <ShoppingBag size={14} color="#ffffff" /> Shop Drops
          </Link>

          <button
            onClick={() => { setShowTrack(true); setOpen(false); setTrackedOrders(null); setTrackError(''); }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', background: 'transparent', border: 'none', fontSize: '0.8rem', cursor: 'pointer', padding: 0, textAlign: 'left', fontFamily: 'monospace' }}
          >
            <Package size={14} color="#ffffff" /> Track Order
          </button>

          <Link href="/about" onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.8rem', fontFamily: 'monospace' }}>
            <Info size={14} color="#ffffff" /> About AASIFA
          </Link>

          <Link href="/contact" onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.8rem', fontFamily: 'monospace' }}>
            <Mail size={14} color="#ffffff" /> Contact Support
          </Link>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => { setShowChart(true); setOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', background: 'transparent', border: 'none', fontSize: '0.8rem', cursor: 'pointer', padding: 0, textAlign: 'left', fontFamily: 'monospace' }}
            >
              <Ruler size={14} color="#ffffff" /> Size Chart
            </button>

            <button
              onClick={() => { setShowCalc(true); setOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', background: 'transparent', border: 'none', fontSize: '0.8rem', cursor: 'pointer', padding: 0, textAlign: 'left', fontFamily: 'monospace' }}
            >
              <Calculator size={14} color="#ffffff" /> Size Calculator
            </button>

            <button
              onClick={() => { handleLockStore(); setOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ff6666', background: 'transparent', border: 'none', fontSize: '0.8rem', cursor: 'pointer', padding: 0, textAlign: 'left', fontFamily: 'monospace', marginTop: '4px' }}
            >
              <Lock size={14} color="#ff6666" /> Lock The Store
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
          background: 'rgba(0,0,0,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-base)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '30px',
            width: '100%',
            maxWidth: '480px',
            position: 'relative',
            boxShadow: '0 25px 60px rgba(0,0,0,0.95)'
          }}>
            <button
              onClick={() => setShowChart(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '0.05em', color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '25px', fontFamily: 'monospace', fontStyle: 'italic' }}>
              SIZE CHART
            </h3>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'center', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontFamily: 'monospace' }}>
              <thead>
                <tr style={{ background: '#121212', borderBottom: '1px solid #222' }}>
                  <th style={{ padding: '12px', borderRight: '1px solid #222' }}>SIZE</th>
                  <th style={{ padding: '12px', borderRight: '1px solid #222' }}>CHEST</th>
                  <th style={{ padding: '12px', borderRight: '1px solid #222' }}>LENGTH</th>
                  <th style={{ padding: '12px' }}>WEIGHT</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: idx !== chartData.length - 1 ? '1px solid #222' : 'none' }}>
                    <td style={{ padding: '12px', borderRight: '1px solid #222', fontWeight: 'bold' }}>{row.size}</td>
                    <td style={{ padding: '12px', borderRight: '1px solid #222' }}>{row.chest}</td>
                    <td style={{ padding: '12px', borderRight: '1px solid #222' }}>{row.length}</td>
                    <td style={{ padding: '12px' }}>{row.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end' }}>
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
          background: 'rgba(0,0,0,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-base)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '30px',
            width: '100%',
            maxWidth: '400px',
            position: 'relative',
            boxShadow: '0 25px 60px rgba(0,0,0,0.95)',
            fontFamily: 'monospace'
          }}>
            <button
              onClick={() => { setShowCalc(false); setWeight(''); setChest(''); setRecommendedSize(null); setCalcError(''); }}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '0.05em', color: '#fff', textTransform: 'uppercase', marginBottom: '20px' }}>
              SIZE CALCULATOR
            </h3>

            {/* Slider/Tab Controls */}
            <div style={{ display: 'flex', borderBottom: '1px solid #222', marginBottom: '20px' }}>
              <button
                onClick={() => { setCalcTab('kg'); setRecommendedSize(null); setCalcError(''); }}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  background: 'transparent',
                  border: 'none',
                  color: calcTab === 'kg' ? '#ffffff' : '#666666',
                  borderBottom: calcTab === 'kg' ? '2px solid #ffffff' : '2px solid transparent',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace'
                }}
              >
                BY WEIGHT (KG)
              </button>
              <button
                onClick={() => { setCalcTab('cm'); setRecommendedSize(null); setCalcError(''); }}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  background: 'transparent',
                  border: 'none',
                  color: calcTab === 'cm' ? '#ffffff' : '#666666',
                  borderBottom: calcTab === 'cm' ? '2px solid #ffffff' : '2px solid transparent',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace'
                }}
              >
                BY CHEST (CM)
              </button>
            </div>

            {calcTab === 'kg' ? (
              <form onSubmit={handleCalculateWeight} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase' }}>
                    YOUR WEIGHT (KG)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 70"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    style={{
                      background: '#000',
                      border: '1px solid #222',
                      color: '#fff',
                      padding: '12px',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
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
                    fontSize: '0.75rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    letterSpacing: '0.05em',
                    fontFamily: 'monospace'
                  }}
                >
                  CALCULATE SIZE
                </button>
              </form>
            ) : (
              <form onSubmit={handleCalculateChest} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase' }}>
                    YOUR CHEST WIDTH (CM)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 57"
                    value={chest}
                    onChange={(e) => setChest(e.target.value)}
                    style={{
                      background: '#000',
                      border: '1px solid #222',
                      color: '#fff',
                      padding: '12px',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
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
                    fontSize: '0.75rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    letterSpacing: '0.05em',
                    fontFamily: 'monospace'
                  }}
                >
                  CALCULATE SIZE
                </button>
              </form>
            )}

            {recommendedSize && (
              <div style={{
                marginTop: '25px',
                padding: '20px',
                background: '#121212',
                border: '1px solid #222',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '0.7rem', color: '#666', display: 'block', marginBottom: '5px' }}>RECOMMENDED SIZE</span>
                <span style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#fff', display: 'block' }}>{recommendedSize}</span>
                <span style={{ fontSize: '0.7rem', color: '#888', marginTop: '10px', display: 'block' }}>
                  Fits chest: {recommendedSize === 'S' ? '55' : recommendedSize === 'M' ? '57' : recommendedSize === 'L' ? '61' : '64'}cm · Length: {recommendedSize === 'S' ? '69' : recommendedSize === 'M' ? '70' : recommendedSize === 'L' ? '73' : '77'}cm
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Track Order Modal */}
      {showTrack && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.92)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-base)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '30px',
            width: '100%',
            maxWidth: '450px',
            position: 'relative',
            boxShadow: '0 25px 60px rgba(0,0,0,0.95)',
            fontFamily: 'monospace'
          }}>
            <button
              onClick={() => { setShowTrack(false); setTrackedOrders(null); setTrackError(''); setTrackEmail(''); }}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '0.05em', color: '#fff', textTransform: 'uppercase', marginBottom: '8px' }}>
              TRACK YOUR ORDER
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '20px' }}>
              Enter your email address to check order status and updates.
            </p>

            <form onSubmit={handleTrackOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={trackEmail}
                  onChange={(e) => setTrackEmail(e.target.value)}
                  style={{
                    flex: 1,
                    background: '#000',
                    border: '1px solid #222',
                    color: '#fff',
                    padding: '12px',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={trackLoading}
                  style={{
                    background: '#fff',
                    color: '#000',
                    border: 'none',
                    padding: '12px 18px',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    borderRadius: '4px',
                    cursor: trackLoading ? 'not-allowed' : 'pointer',
                    letterSpacing: '0.05em',
                    fontFamily: 'monospace',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {trackLoading ? 'SEARCHING...' : 'TRACK'}
                </button>
              </div>
            </form>

            {trackError && (
              <p style={{ color: '#ff6666', fontSize: '0.75rem', marginTop: '15px', margin: '15px 0 0 0' }}>
                {trackError}
              </p>
            )}

            {trackedOrders && (
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto' }}>
                {trackedOrders.map((ord) => (
                  <div key={ord.id} style={{
                    background: '#0d0d0d',
                    border: '1px solid #222',
                    borderRadius: '4px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#ffffff' }}>
                        Order {ord.shortId}
                      </span>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '2px',
                        background: ord.status === 'completed' ? 'rgba(61,220,132,0.15)' : 'rgba(255,170,0,0.15)',
                        color: ord.status === 'completed' ? '#3DDC84' : '#F5A623',
                        border: `1px solid ${ord.status === 'completed' ? '#3DDC84' : '#F5A623'}`,
                        textTransform: 'uppercase'
                      }}>
                        {ord.status.toUpperCase()}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.75rem', color: '#aaa' }}>
                      Total: {ord.totalAmount} EGP
                    </span>

                    <span style={{ fontSize: '0.7rem', color: '#666' }}>
                      Status: Order received & pending phone confirmation call (within 2 business days).
                    </span>
                  </div>
                ))}
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
          background: 'var(--panel-bg, rgba(10, 10, 10, 0.95))',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 0 15px rgba(255,255,255,0.1)',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 0 20px rgba(255,255,255,0.3)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 0 15px rgba(255,255,255,0.1)';
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
