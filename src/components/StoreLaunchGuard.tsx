'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Lock, Zap, KeyRound, AlertTriangle } from 'lucide-react';
import { getPublicSiteConfig, verifyStorePasswordAction, isStoreUnlockedAction } from '@/app/actions/supabaseActions';

interface StoreLaunchGuardProps {
  children: React.ReactNode;
}

export function StoreLaunchGuard({ children }: StoreLaunchGuardProps) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Config States
  const [launchingMode, setLaunchingMode] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [testingMode, setTestingMode] = useState(false);
  const [launchDateStr, setLaunchDateStr] = useState('2026-08-15T00:00:00.000Z');

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Countdown state
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });

  useEffect(() => {
    const initGuard = async () => {
      try {
        // Check server-side signed session cookie for unlock state
        const unlocked = await isStoreUnlockedAction();
        setIsUnlocked(unlocked);

        // Fetch non-sensitive public site config
        const config = await getPublicSiteConfig();
        if (config) {
          setLaunchingMode(config.launching_mode);
          setMaintenanceMode(config.maintenance_mode);
          setTestingMode(config.testing_mode);
          if (config.launch_date) setLaunchDateStr(config.launch_date);
        }
      } catch (e) {
        console.error('Error fetching launch config:', e);
      } finally {
        setLoading(false);
      }
    };

    initGuard();
  }, []);

  // Ticking countdown timer logic
  useEffect(() => {
    const calculateTime = () => {
      const targetTime = new Date(launchDateStr || '2026-08-15T00:00:00').getTime();
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [launchDateStr]);

  // Exclude admin panel route (/stormy) from lock screens
  if (pathname.startsWith('/stormy')) {
    return <>{children}</>;
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setVerifying(true);

    try {
      const res = await verifyStorePasswordAction(inputPassword);
      if (res.success) {
        setIsUnlocked(true);
        setShowPasswordModal(false);
        setInputPassword('');
      } else {
        setPasswordError(res.error || 'Incorrect store password. Try again.');
      }
    } catch (err: any) {
      setPasswordError('Verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  const isLocked = (launchingMode || maintenanceMode) && !isUnlocked;

  if (loading) {
    return (
      <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Zap size={30} style={{ color: '#fff', animation: 'spin 1.5s infinite linear' }} />
      </div>
    );
  }

  if (isLocked) {
    return (
      <div style={{
        background: '#000000',
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px',
        color: '#ffffff',
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        fontFamily: 'var(--font-inter)',
        overflowY: 'auto'
      }}>
        {/* Background Image / Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, rgba(20,20,20,0.8) 0%, rgba(0,0,0,0.98) 100%)',
          zIndex: 0,
        }} />

        <div style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '650px',
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '30px'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Image
              src="/images/WhiteStorm.png"
              alt="AASIFA"
              width={260}
              height={80}
              priority
              style={{ width: '220px', height: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.2))' }}
            />
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.25em', color: '#888888', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
              {maintenanceMode ? '⚡ STORE UNDER MAINTENANCE' : '⚡ EXCLUSIVE STREETWEAR DROP'}
            </span>
            <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.5rem)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
              {maintenanceMode ? 'WE ARE BACK SOON' : 'LAUNCHING AUGUST 15, 2026'}
            </h1>
          </div>

          {/* Countdown Clock */}
          {!maintenanceMode && (
            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center',
              width: '100%',
              marginTop: '10px'
            }}>
              {[
                { label: 'DAYS', val: timeLeft.days },
                { label: 'HOURS', val: timeLeft.hours },
                { label: 'MINUTES', val: timeLeft.minutes },
                { label: 'SECONDS', val: timeLeft.seconds },
              ].map((item, idx) => (
                <div key={idx} style={{
                  background: '#0a0a0a',
                  border: '1px solid #1c1c1c',
                  padding: '16px 12px',
                  borderRadius: '6px',
                  minWidth: '75px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 900, color: '#ffffff', fontFamily: 'monospace' }}>
                    {String(item.val).padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#666666', letterSpacing: '0.1em', marginTop: '4px' }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Enter Store Button */}
          <button
            onClick={() => setShowPasswordModal(true)}
            className="btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: '#ffffff',
              color: '#000000',
              padding: '14px 28px',
              fontSize: '0.85rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              borderRadius: '2px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            <Lock size={16} /> ENTER STORE
          </button>
        </div>

        {/* Password Modal */}
        {showPasswordModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.92)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000000,
            padding: '20px'
          }}>
            <form onSubmit={handlePasswordSubmit} style={{
              background: '#0a0a0a',
              border: '1px solid #222222',
              borderRadius: '8px',
              padding: '35px 30px',
              maxWidth: '400px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0,0,0,0.9)'
            }}>
              <div style={{ margin: '0 auto', background: '#151515', padding: '12px', borderRadius: '50%', border: '1px solid #252525' }}>
                <KeyRound size={24} color="#ffffff" />
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#ffffff', margin: 0 }}>
                  ENTER STORE PASSWORD
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#888888', marginTop: '6px', margin: 0 }}>
                  Enter authorization password to access the storefront.
                </p>
              </div>

              {passwordError && (
                <span style={{ fontSize: '0.75rem', color: '#ff5555', fontWeight: 600 }}>
                  {passwordError}
                </span>
              )}

              <input
                type="password"
                required
                autoFocus
                placeholder="ENTER PASSWORD"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: '#000000',
                  border: '1px solid #222222',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  letterSpacing: '0.1em',
                  textAlign: 'center',
                  borderRadius: '4px',
                  outline: 'none'
                }}
              />

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'transparent',
                    border: '1px solid #333333',
                    color: '#888888',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={verifying}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#ffffff',
                    color: '#000000',
                    border: 'none',
                    fontWeight: 900,
                    fontSize: '0.8rem',
                    letterSpacing: '0.08em',
                    borderRadius: '4px',
                    cursor: verifying ? 'wait' : 'pointer',
                    opacity: verifying ? 0.7 : 1
                  }}
                >
                  {verifying ? 'VERIFYING...' : 'UNLOCK'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {testingMode && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: 'rgba(255, 170, 0, 0.15)',
          border: '1px solid #ffaa00',
          color: '#ffaa00',
          fontSize: '0.65rem',
          fontWeight: 800,
          letterSpacing: '0.15em',
          padding: '4px 10px',
          borderRadius: '4px',
          zIndex: 99999,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <AlertTriangle size={12} /> TEST MODE ACTIVE
        </div>
      )}
      {children}
    </>
  );
}
