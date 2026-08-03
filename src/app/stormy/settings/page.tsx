'use client';

import React, { useState, useEffect } from 'react';
import { getSiteConfig, updateSiteConfig } from '@/app/actions/supabaseActions';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingMode, setTestingMode] = useState(false);
  const [fullConfig, setFullConfig] = useState<any>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const configItem = await getSiteConfig();
      if (configItem && configItem.description) {
        const parsed = JSON.parse(configItem.description);
        setFullConfig(parsed);
        if (parsed.testing_mode !== undefined) {
          setTestingMode(!!parsed.testing_mode);
        }
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    } finally {
      setLoading(false);
      window.dispatchEvent(new Event('storm_data_loaded'));
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const updatedConfig = {
        ...fullConfig,
        testing_mode: testingMode
      };
      await updateSiteConfig(JSON.stringify(updatedConfig));
      setFullConfig(updatedConfig);
      window.dispatchEvent(new CustomEvent('storm_toast', { detail: { message: 'Settings saved successfully!', type: 'success' } }));
      window.dispatchEvent(new Event('aasifa_config_updated'));
    } catch (e) {
      console.error(e);
      window.dispatchEvent(new CustomEvent('storm_toast', { detail: { message: 'Failed to save settings.', type: 'error' } }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '30px' }}>
        SETTINGS
      </h1>

      {loading ? (
        <p style={{ color: '#555', fontFamily: 'monospace' }}>Loading settings...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
          
          <div style={{
            background: '#0d0d0d',
            border: '1px solid #1a1a1a',
            padding: '24px',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>
              ⚡ SYSTEM CONFIGURATION
            </h3>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#050505', border: '1px solid #1a1a1a', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff', display: 'block' }}>Testing Mode</span>
                <span style={{ fontSize: '0.7rem', color: '#888' }}>If enabled, storefront checkout operates in sandbox test mode.</span>
              </div>
              <input
                type="checkbox"
                checked={testingMode}
                onChange={(e) => setTestingMode(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#fff' }}
              />
            </label>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="btn-primary"
            style={{
              alignSelf: 'flex-start',
              padding: '12px 24px',
              fontSize: '0.8rem',
              background: '#ffffff',
              color: '#000',
              border: 'none',
              fontWeight: 800,
              cursor: 'pointer',
              borderRadius: '4px',
              opacity: saving ? 0.7 : 1
            }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>

        </div>
      )}
    </div>
  );
}
