'use client';

import React, { useState, useEffect } from 'react';
import { getSiteConfig, updateSiteConfig } from '@/app/actions/supabaseActions';
import { fetchTweak, updateTweak } from '@/app/actions/tweaks';

export default function AdminTweaksPage() {
  const [loading, setLoading] = useState(true);
  const [savingTweaks, setSavingTweaks] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [tweaksInterval, setTweaksInterval] = useState(5000);
  const [tweaksColor, setTweaksColor] = useState('#ffffff');
  const [tweaksGlow, setTweaksGlow] = useState('#e8f4fd');
  const [tweaksShowFooter, setTweaksShowFooter] = useState(true);

  // Promotion Marquee State
  const [marqueeText, setMarqueeText] = useState('DROP 01 OUT NOW · FAST HOME DELIVERY ALL OVER EGYPT');
  const [marqueeSpeed, setMarqueeSpeed] = useState(120);
  const [marqueeRepetition, setMarqueeRepetition] = useState(1);
  const [marqueeVisibility, setMarqueeVisibility] = useState('Active');

  useEffect(() => {
    loadTweaks();
  }, []);

  const loadTweaks = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const productsData = await getSiteConfig();

      if (productsData && productsData.description) {
        try {
          const parsed = JSON.parse(productsData.description);
          if (parsed.interval) setTweaksInterval(parsed.interval);
          if (parsed.color) setTweaksColor(parsed.color);
          if (parsed.glow) setTweaksGlow(parsed.glow);
          if (parsed.marquee_text !== undefined) setMarqueeText(parsed.marquee_text);
          if (parsed.marquee_speed !== undefined) setMarqueeSpeed(parsed.marquee_speed);
          if (parsed.marquee_repetition !== undefined) setMarqueeRepetition(parsed.marquee_repetition);
          if (parsed.marquee_visibility !== undefined) setMarqueeVisibility(parsed.marquee_visibility);
        } catch (e) {
          console.error('Failed parsing site configuration:', e);
        }
      }

      const showLinksVal = await fetchTweak('show_footer_links', true);
      setTweaksShowFooter(showLinksVal);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to load tweaks.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTweaks = async () => {
    setSavingTweaks(true);
    try {
      const configJson = JSON.stringify({
        interval: Number(tweaksInterval),
        color: tweaksColor,
        glow: tweaksGlow,
        show_footer_links: tweaksShowFooter,
        marquee_text: marqueeText,
        marquee_speed: Number(marqueeSpeed),
        marquee_repetition: Number(marqueeRepetition),
        marquee_visibility: marqueeVisibility
      });

      await updateSiteConfig(configJson);
      await updateTweak('show_footer_links', tweaksShowFooter);

      alert('Tweaks saved successfully!');
      window.dispatchEvent(new Event('aasifa_config_updated'));
    } catch (e: any) {
      console.error(e);
      alert('Failed to save tweaks.');
    } finally {
      setSavingTweaks(false);
    }
  };

  return (
    <div style={{ padding: '40px 5%', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '30px', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
        SITE TWEAKS
      </h1>

      {errorMsg && (
        <div style={{ padding: '15px', background: 'rgba(255,0,0,0.05)', border: '1px solid #ff3333', color: '#ffaaaa', marginBottom: '30px', fontSize: '0.9rem' }}>
          {errorMsg}
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '50px' }}>Loading tweaks...</p>
      ) : (
        <div className="glass-panel" style={{ padding: '30px', border: '1px solid var(--border-color)', background: 'var(--bg-elevated)', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Lightning Interval (ms)</label>
              <input
                type="number"
                min="1000"
                max="30000"
                className="form-input"
                style={{ width: '100%', padding: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px' }}
                value={tweaksInterval}
                onChange={(e) => setTweaksInterval(Number(e.target.value))}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', display: 'block' }}>
                How often the lightning strikes. e.g. 5000 = 5 seconds.
              </span>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Lightning Bolt Color</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="color"
                  style={{ width: '42px', height: '42px', padding: 0, border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', borderRadius: '4px' }}
                  value={tweaksColor}
                  onChange={(e) => setTweaksColor(e.target.value)}
                />
                <input
                  type="text"
                  className="form-input"
                  value={tweaksColor}
                  onChange={(e) => setTweaksColor(e.target.value)}
                  style={{ flex: 1, padding: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Lightning Glow Color</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="color"
                  style={{ width: '42px', height: '42px', padding: 0, border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', borderRadius: '4px' }}
                  value={tweaksGlow}
                  onChange={(e) => setTweaksGlow(e.target.value)}
                />
                <input
                  type="text"
                  className="form-input"
                  value={tweaksGlow}
                  onChange={(e) => setTweaksGlow(e.target.value)}
                  style={{ flex: 1, padding: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={tweaksShowFooter}
                  onChange={(e) => setTweaksShowFooter(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: '#cfe0ff',
                  }}
                />
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>Show footer links in bolt menu</span>
              </label>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px', display: 'block', paddingLeft: '30px' }}>
                Display quick navigation links (About, Contact, Shop, etc.) in the bottom-left fixed lightning bolt flyout menu.
              </span>
            </div>
          </div>

          {/* Promotion Marquee & Announcement Card (Matching Screenshot 1) */}
          <div style={{
            background: '#121212',
            border: '1px solid #1a1a1a',
            borderRadius: '6px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <h3 style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: 0
            }}>
              <span>📢</span> PROMOTION MARQUEE & ANNOUNCEMENT
            </h3>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '8px' }}>
                MARQUEE PROMOTION TEXT
              </label>
              <input
                type="text"
                className="form-input"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#0a0a0a',
                  border: '1px solid #222',
                  color: '#fff',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem'
                }}
                value={marqueeText}
                onChange={(e) => setMarqueeText(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '8px' }}>
                  SCROLLING SPEED (SECONDS)
                </label>
                <input
                  type="number"
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#0a0a0a',
                    border: '1px solid #222',
                    color: '#fff',
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem'
                  }}
                  value={marqueeSpeed}
                  onChange={(e) => setMarqueeSpeed(Number(e.target.value))}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '8px' }}>
                  TEXT REPETITION COUNT
                </label>
                <input
                  type="number"
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#0a0a0a',
                    border: '1px solid #222',
                    color: '#fff',
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem'
                  }}
                  value={marqueeRepetition}
                  onChange={(e) => setMarqueeRepetition(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '8px' }}>
                STOREFRONT MARQUEE VISIBILITY
              </label>
              <select
                className="form-input"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#0a0a0a',
                  border: '1px solid #222',
                  color: '#fff',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem'
                }}
                value={marqueeVisibility}
                onChange={(e) => setMarqueeVisibility(e.target.value)}
              >
                <option value="Active">Active (Visible)</option>
                <option value="Hidden">Hidden</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSaveTweaks}
            disabled={savingTweaks}
            className="btn-primary"
            style={{ 
              alignSelf: 'flex-start', 
              padding: '12px 25px', 
              fontSize: '0.9rem', 
              background: 'var(--text-primary)', 
              color: '#000', 
              border: 'none', 
              fontWeight: 600, 
              cursor: 'pointer',
              borderRadius: '4px',
              opacity: savingTweaks ? 0.7 : 1
            }}
          >
            {savingTweaks ? 'Saving...' : 'Save Tweak Config'}
          </button>
        </div>
      )}
    </div>
  );
}
