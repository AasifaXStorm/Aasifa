'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'aasifabaskotaaaaatt1_Stotm') {
      // Set session cookie
      document.cookie = 'admin_session=authenticated; Path=/; Max-Age=86400;';
      window.location.href = '/stormy';
    } else {
      setError('Invalid system key.');
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
        borderRadius: '6px',
        padding: '30px',
        width: '100%',
        maxWidth: '360px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <img src="/images/WhiteStorm.png" alt="AASIFA" style={{ height: '24px', width: 'auto', marginBottom: '10px' }} />
          <span style={{ fontSize: '0.7rem', display: 'block', color: '#555', letterSpacing: '0.1em' }}>
            PORTAL ACCESS LOCK
          </span>
        </div>

        {error && (
          <p style={{ color: '#ff6666', fontSize: '0.75rem', margin: 0, textAlign: 'center' }}>{error}</p>
        )}

        <input
          type="password"
          required
          placeholder="ENTER SYSTEM KEY"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            background: '#000',
            border: '1px solid #222',
            color: '#fff',
            padding: '12px',
            fontSize: '0.9rem',
            textAlign: 'center',
            borderRadius: '4px',
            fontFamily: 'monospace',
            outline: 'none'
          }}
        />

        <button
          type="submit"
          style={{
            background: '#fff',
            color: '#000',
            border: 'none',
            padding: '12px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            borderRadius: '4px',
            cursor: 'pointer',
            letterSpacing: '0.15em'
          }}
        >
          AUTHENTICATE
        </button>
      </form>
    </div>
  );
}
