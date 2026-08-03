'use client';

import React, { useState, useEffect } from 'react';
import { getSiteConfig, updateSiteConfig } from '@/app/actions/supabaseActions';

export default function AdminTweaksPage() {
  const [loading, setLoading] = useState(true);
  const [savingTweaks, setSavingTweaks] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Lightning Bolt State
  const [tweaksInterval, setTweaksInterval] = useState(2000);
  const [tweaksColor, setTweaksColor] = useState('#ffffff');
  const [tweaksGlow, setTweaksGlow] = useState('#e8f4fd');
  const [tweaksShowFooter, setTweaksShowFooter] = useState(true);

  // Promotion Marquee State
  const [marqueeText, setMarqueeText] = useState('ꜱᴛᴏʀᴍ ɪɴ ʏᴏᴜʀ ꜱᴛʏʟᴇ');
  const [marqueeSpeed, setMarqueeSpeed] = useState(120);
  const [marqueeRepetition, setMarqueeRepetition] = useState(1);
  const [marqueeVisibility, setMarqueeVisibility] = useState('Active');

  // Category Toggles State (Shirts active by default, others false)
  const [showShirts, setShowShirts] = useState(true);
  const [showHoodies, setShowHoodies] = useState(false);
  const [showPants, setShowPants] = useState(false);
  const [showAccessories, setShowAccessories] = useState(false);

  useEffect(() => {
    loadTweaks();
  }, []);

  const isValidHex = (val: string) => /^#[0-9A-F]{6}$/i.test(val);

  const loadTweaks = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const configItem = await getSiteConfig();

      if (configItem && configItem.description) {
        try {
          const parsed = JSON.parse(configItem.description);
          if (parsed.interval) setTweaksInterval(parsed.interval);
          if (parsed.color && isValidHex(parsed.color)) setTweaksColor(parsed.color);
          if (parsed.glow && isValidHex(parsed.glow)) setTweaksGlow(parsed.glow);
          if (parsed.marquee_text !== undefined) setMarqueeText(parsed.marquee_text);
          if (parsed.marquee_speed !== undefined) setMarqueeSpeed(parsed.marquee_speed);
          if (parsed.marquee_repetition !== undefined) setMarqueeRepetition(parsed.marquee_repetition);
          if (parsed.marquee_visibility !== undefined) setMarqueeVisibility(parsed.marquee_visibility);
          if (parsed.show_footer_links !== undefined) setTweaksShowFooter(!!parsed.show_footer_links);

          // Parse Category visibility toggles
          if (parsed.show_category_shirts !== undefined) setShowShirts(!!parsed.show_category_shirts);
          if (parsed.show_category_hoodies !== undefined) setShowHoodies(!!parsed.show_category_hoodies);
          if (parsed.show_category_pants !== undefined) setShowPants(!!parsed.show_category_pants);
          if (parsed.show_category_accessories !== undefined) setShowAccessories(!!parsed.show_category_accessories);
        } catch (e) {
          console.error('Failed parsing site configuration:', e);
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to load tweaks from Supabase config.');
    } finally {
      setLoading(false);
      window.dispatchEvent(new Event('storm_data_loaded'));
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
        marquee_visibility: marqueeVisibility,
        show_category_shirts: showShirts,
        show_category_hoodies: showHoodies,
        show_category_pants: showPants,
        show_category_accessories: showAccessories
      });

      await updateSiteConfig(configJson);

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
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '0.05em', color: '#fff', textShadow: '0 0 15px rgba(255,255,255,0.25)' }}>
            SITE TWEAKS
          </h1>
          <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '6px', fontWeight: 500 }}>
            Fine-tune layout features, lightning bolts, and promotion settings instantly.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div style={{ padding: '15px', background: 'rgba(255,50,50,0.1)', border: '1px solid #ff3333', color: '#ffaaaa', marginBottom: '30px', fontSize: '0.85rem', borderRadius: '4px' }}>
          {errorMsg}
        </div>
      )}

      {loading ? (
        <p style={{ color: '#555', fontFamily: 'monospace', textAlign: 'center', marginTop: '50px' }}>Loading configuration...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Main Grid Panels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            
            {/* Panel 1: Lightning Bolt Config */}
            <div style={{
              background: '#0d0d0d',
              border: '1px solid #222222',
              borderRadius: '6px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                ⚡ LIGHTNING SYSTEM
              </h3>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.7rem', color: '#888' }}>Lightning Interval (ms)</label>
                <input
                  type="number"
                  min="1000"
                  max="30000"
                  className="form-input"
                  style={{ width: '100%', padding: '12px', background: '#050505', border: '1px solid #222', color: '#fff', borderRadius: '4px', fontSize: '0.85rem' }}
                  value={tweaksInterval}
                  onChange={(e) => setTweaksInterval(Number(e.target.value))}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.7rem', color: '#888' }}>Bolt Color</label>
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
                    style={{ flex: 1, padding: '12px', background: '#050505', border: '1px solid #222', color: '#fff', borderRadius: '4px', fontSize: '0.85rem', fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.7rem', color: '#888' }}>Glow Color</label>
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
                    style={{ flex: 1, padding: '12px', background: '#050505', border: '1px solid #222', color: '#fff', borderRadius: '4px', fontSize: '0.85rem', fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={tweaksShowFooter}
                    onChange={(e) => setTweaksShowFooter(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#fff' }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Show footer links in bolt menu</span>
                </label>
              </div>
            </div>

            {/* Panel 2: Storefront Category Visibility (Dynamic Toggles) */}
            <div style={{
              background: '#0d0d0d',
              border: '1px solid #222222',
              borderRadius: '6px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                👕 CATEGORY VISIBILITY
              </h3>
              <p style={{ color: '#666', fontSize: '0.75rem', margin: 0 }}>
                Toggle which product categories are visible to customers on the storefront.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#050505', border: '1px solid #1a1a1a', borderRadius: '4px', cursor: 'pointer' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>Shirts Category</span>
                  <input
                    type="checkbox"
                    checked={showShirts}
                    onChange={(e) => setShowShirts(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#fff' }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#050505', border: '1px solid #1a1a1a', borderRadius: '4px', cursor: 'pointer' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>Hoodies Category</span>
                  <input
                    type="checkbox"
                    checked={showHoodies}
                    onChange={(e) => setShowHoodies(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#fff' }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#050505', border: '1px solid #1a1a1a', borderRadius: '4px', cursor: 'pointer' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>Pants Category</span>
                  <input
                    type="checkbox"
                    checked={showPants}
                    onChange={(e) => setShowPants(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#fff' }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#050505', border: '1px solid #1a1a1a', borderRadius: '4px', cursor: 'pointer' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>Accessories Category</span>
                  <input
                    type="checkbox"
                    checked={showAccessories}
                    onChange={(e) => setShowAccessories(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#fff' }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Panel 3: Marquee config (Span full width) */}
          <div style={{
            background: '#0d0d0d',
            border: '1px solid #222222',
            borderRadius: '6px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              📢 PROMOTION MARQUEE & ANNOUNCEMENT
            </h3>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.7rem', color: '#888', display: 'block', marginBottom: '8px' }}>MARQUEE PROMOTION TEXT</label>
              <input
                type="text"
                className="form-input"
                style={{ width: '100%', padding: '12px', background: '#050505', border: '1px solid #222', color: '#fff', borderRadius: '4px', fontSize: '0.85rem' }}
                value={marqueeText}
                onChange={(e) => setMarqueeText(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.7rem', color: '#888', display: 'block', marginBottom: '8px' }}>SCROLLING SPEED (SECONDS)</label>
                <input
                  type="number"
                  className="form-input"
                  style={{ width: '100%', padding: '12px', background: '#050505', border: '1px solid #222', color: '#fff', borderRadius: '4px', fontSize: '0.85rem' }}
                  value={marqueeSpeed}
                  onChange={(e) => setMarqueeSpeed(Number(e.target.value))}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.7rem', color: '#888', display: 'block', marginBottom: '8px' }}>TEXT REPETITION COUNT</label>
                <input
                  type="number"
                  className="form-input"
                  style={{ width: '100%', padding: '12px', background: '#050505', border: '1px solid #222', color: '#fff', borderRadius: '4px', fontSize: '0.85rem' }}
                  value={marqueeRepetition}
                  onChange={(e) => setMarqueeRepetition(Number(e.target.value))}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.7rem', color: '#888', display: 'block', marginBottom: '8px' }}>VISIBILITY</label>
                <select
                  className="form-input"
                  style={{ width: '100%', padding: '12px', background: '#050505', border: '1px solid #222', color: '#fff', borderRadius: '4px', fontSize: '0.85rem' }}
                  value={marqueeVisibility}
                  onChange={(e) => setMarqueeVisibility(e.target.value)}
                >
                  <option value="Active">Active (Visible)</option>
                  <option value="Hidden">Hidden</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={handleSaveTweaks}
            disabled={savingTweaks}
            className="btn-primary"
            style={{ 
              alignSelf: 'flex-start', 
              padding: '14px 30px', 
              fontSize: '0.9rem', 
              background: '#ffffff', 
              color: '#000', 
              border: 'none', 
              fontWeight: 800, 
              cursor: 'pointer',
              borderRadius: '4px',
              boxShadow: '0 0 15px rgba(255,255,255,0.2)',
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
