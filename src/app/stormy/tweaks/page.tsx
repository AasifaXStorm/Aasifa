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
        show_footer_links: tweaksShowFooter
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
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '30px', letterSpacing: '0.05em', color: '#fff' }}>
        SITE TWEAKS
      </h1>

      {errorMsg && (
        <div style={{ padding: '15px', background: 'rgba(255,0,0,0.05)', border: '1px solid #ff3333', color: '#ffaaaa', marginBottom: '30px', fontSize: '0.9rem' }}>
          {errorMsg}
        </div>
      )}

      {loading ? (
        <p style={{ color: '#888', textAlign: 'center', marginTop: '50px' }}>Loading tweaks...</p>
      ) : (
        <div className="glass-panel" style={{ padding: '30px', border: '1px solid #1a1a1a', background: '#121212', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Lightning Interval (ms)</label>
              <input
                type="number"
                min="1000"
                max="30000"
                className="form-input"
                style={{ width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #222', color: '#fff', borderRadius: '4px' }}
                value={tweaksInterval}
                onChange={(e) => setTweaksInterval(Number(e.target.value))}
              />
              <span style={{ fontSize: '0.75rem', color: '#666', marginTop: '8px', display: 'block' }}>
                How often the lightning strikes. e.g. 5000 = 5 seconds.
              </span>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Lightning Bolt Color</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="color"
                  style={{ width: '42px', height: '42px', padding: 0, border: '1px solid #222', background: 'transparent', cursor: 'pointer', borderRadius: '4px' }}
                  value={tweaksColor}
                  onChange={(e) => setTweaksColor(e.target.value)}
                />
                <input
                  type="text"
                  className="form-input"
                  value={tweaksColor}
                  onChange={(e) => setTweaksColor(e.target.value)}
                  style={{ flex: 1, padding: '10px', background: '#0a0a0a', border: '1px solid #222', color: '#fff', borderRadius: '4px' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Lightning Glow Color</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="color"
                  style={{ width: '42px', height: '42px', padding: 0, border: '1px solid #222', background: 'transparent', cursor: 'pointer', borderRadius: '4px' }}
                  value={tweaksGlow}
                  onChange={(e) => setTweaksGlow(e.target.value)}
                />
                <input
                  type="text"
                  className="form-input"
                  value={tweaksGlow}
                  onChange={(e) => setTweaksGlow(e.target.value)}
                  style={{ flex: 1, padding: '10px', background: '#0a0a0a', border: '1px solid #222', color: '#fff', borderRadius: '4px' }}
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
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>Show footer links in bolt menu</span>
              </label>
              <span style={{ fontSize: '0.8rem', color: '#666', marginTop: '8px', display: 'block', paddingLeft: '30px' }}>
                Display quick navigation links (About, Contact, Shop, etc.) in the bottom-left fixed lightning bolt flyout menu.
              </span>
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
              background: '#fff', 
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
