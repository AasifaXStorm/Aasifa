'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, User } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Check if already logged in via hardcoded session
    const session = localStorage.getItem('aasifa_admin_session');
    if (session === 'y.storm1_session') {
      router.push('/stormy');
    }
  }, [router]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter username and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    // Hardcoded credentials verification
    if (username === 'y.storm1' && password === 'aasifabaskotaaaaatt1_Stotm') {
      localStorage.setItem('aasifa_admin_session', 'y.storm1_session');
      router.push('/stormy');
      router.refresh();
    } else {
      setErrorMsg('Invalid username or password.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#030303',
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div className="glass-panel" style={{
        maxWidth: '450px',
        width: '100%',
        padding: '50px 30px',
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#555', letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
            Portal Access
          </span>
          <h1 className="brand-title" style={{ fontSize: '1.6rem', fontWeight: 900 }}>
            STORMY LOGIN
          </h1>
        </div>

        {errorMsg && (
          <div style={{
            padding: '12px',
            border: '1px solid #ff3333',
            background: 'rgba(255,51,51,0.05)',
            color: '#ffaaaa',
            fontSize: '0.8rem',
            textAlign: 'center',
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Username */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
              <input
                type="text"
                required
                className="form-input"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                style={{ paddingLeft: '42px', paddingRight: '42px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#555',
                  padding: 0,
                  display: 'flex',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '14px', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
