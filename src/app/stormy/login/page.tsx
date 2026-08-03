'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { verifyAdminLogin } from '@/app/actions/auth';
import { Shield, Key, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await verifyAdminLogin(username, password);
      if (res.success) {
        window.location.href = '/stormy';
      } else {
        setError(res.error || 'Authentication failed.');
      }
    } catch (err: any) {
      setError('An unexpected error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#050505',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'monospace',
      color: '#fff',
      padding: '20px'
    }}>
      <form onSubmit={handleLogin} style={{
        background: '#0d0d0d',
        border: '1px solid #1a1a1a',
        borderRadius: '8px',
        padding: '35px 30px',
        width: '100%',
        maxWidth: '380px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: '0 15px 50px rgba(0,0,0,0.9)'
      }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Image src="/images/WhiteStorm.png" alt="AASIFA" width={180} height={40} style={{ height: '24px', width: 'auto', marginBottom: '12px' }} />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#888', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            <Shield size={14} color="#fff" />
            ADMIN PORTAL
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(255,85,85,0.1)', border: '1px solid #ff5555', padding: '10px 12px', borderRadius: '4px', textAlign: 'center' }}>
            <p style={{ color: '#ff6666', fontSize: '0.75rem', margin: 0 }}>{error}</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.65rem', color: '#666', letterSpacing: '0.1em' }}>USERNAME</label>
          <input
            type="text"
            required
            placeholder="ENTER USERNAME"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              background: '#000',
              border: '1px solid #222',
              color: '#fff',
              padding: '12px',
              fontSize: '0.85rem',
              borderRadius: '4px',
              fontFamily: 'monospace',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.65rem', color: '#666', letterSpacing: '0.1em' }}>PASSWORD</label>
          <input
            type="password"
            required
            placeholder="ENTER PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              background: '#000',
              border: '1px solid #222',
              color: '#fff',
              padding: '12px',
              fontSize: '0.85rem',
              borderRadius: '4px',
              fontFamily: 'monospace',
              outline: 'none'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: '#fff',
            color: '#000',
            border: 'none',
            padding: '12px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            borderRadius: '4px',
            cursor: loading ? 'wait' : 'pointer',
            letterSpacing: '0.15em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'LOGGING IN...' : 'LOG IN'}
          {!loading && <ArrowRight size={14} />}
        </button>
      </form>
    </div>
  );
}
