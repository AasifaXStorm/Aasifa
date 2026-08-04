'use client';

import React, { useState, useEffect } from 'react';
import { getSiteConfig, updateSiteConfig, sendTestEmailAction } from '@/app/actions/supabaseActions';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingMode, setTestingMode] = useState(false);
  const [brevoApiKey, setBrevoApiKey] = useState('');
  const [brevoSenderEmail, setBrevoSenderEmail] = useState('');
  const [brevoSenderName, setBrevoSenderName] = useState('');
  const [fullConfig, setFullConfig] = useState<any>({});
  
  // Test Email state
  const [testRecipient, setTestRecipient] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

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
        if (parsed.brevo_api_key !== undefined) {
          setBrevoApiKey(parsed.brevo_api_key);
        }
        if (parsed.brevo_sender_email !== undefined) {
          setBrevoSenderEmail(parsed.brevo_sender_email);
          setTestRecipient(parsed.brevo_sender_email);
        }
        if (parsed.brevo_sender_name !== undefined) {
          setBrevoSenderName(parsed.brevo_sender_name);
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
        testing_mode: testingMode,
        brevo_api_key: brevoApiKey.trim(),
        brevo_sender_email: brevoSenderEmail.trim(),
        brevo_sender_name: brevoSenderName.trim()
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

  const handleSendTestEmail = async () => {
    if (!testRecipient || !testRecipient.includes('@')) {
      setTestResult({ success: false, message: 'Please enter a valid recipient email.' });
      return;
    }
    setSendingTest(true);
    setTestResult(null);
    try {
      const res = await sendTestEmailAction(testRecipient.trim());
      if (res.success) {
        setTestResult({ success: true, message: `✅ Test email successfully sent to ${testRecipient}!` });
      } else {
        setTestResult({ success: false, message: `❌ Failed: ${res.error}` });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: `❌ Exception: ${err.message || 'Unknown error'}` });
    } finally {
      setSendingTest(false);
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

          <div style={{
            background: '#0d0d0d',
            border: '1px solid #1a1a1a',
            padding: '24px',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>
              ✉️ BREVO EMAIL SETTINGS
            </h3>

            <div style={{ padding: '12px', background: 'rgba(255,170,0,0.08)', border: '1px solid rgba(255,170,0,0.2)', borderRadius: '4px', fontSize: '0.75rem', color: '#ffaa00', lineHeight: '1.6' }}>
              <strong>⚠️ Important Brevo Gmail Requirement:</strong> Brevo will only send emails from an email address (e.g. <code>aasifa.storm.eg@gmail.com</code>) after you add & verify that email under <strong>Senders & IPs</strong> in your Brevo Dashboard (<a href="https://app.brevo.com/senders" target="_blank" rel="noreferrer" style={{ color: '#fff', textDecoration: 'underline' }}>app.brevo.com/senders</a>).
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#888' }}>BREVO API KEY</label>
              <input
                type="password"
                placeholder="xkeysib-..."
                value={brevoApiKey}
                onChange={(e) => setBrevoApiKey(e.target.value)}
                style={{
                  background: '#000',
                  border: '1px solid #222',
                  color: '#fff',
                  padding: '12px',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#888' }}>SENDER EMAIL (Verified on Brevo)</label>
              <input
                type="email"
                placeholder="e.g. aasifa.storm.eg@gmail.com"
                value={brevoSenderEmail}
                onChange={(e) => setBrevoSenderEmail(e.target.value)}
                style={{
                  background: '#000',
                  border: '1px solid #222',
                  color: '#fff',
                  padding: '12px',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#888' }}>SENDER NAME</label>
              <input
                type="text"
                placeholder="e.g. Storm Aasifa"
                value={brevoSenderName}
                onChange={(e) => setBrevoSenderName(e.target.value)}
                style={{
                  background: '#000',
                  border: '1px solid #222',
                  color: '#fff',
                  padding: '12px',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Test Email tool */}
            <div style={{ borderTop: '1px solid #222', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#fff' }}>TEST EMAIL DISPATCH</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="email"
                  placeholder="Recipient Email"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  style={{
                    flex: 1,
                    background: '#000',
                    border: '1px solid #222',
                    color: '#fff',
                    padding: '10px',
                    borderRadius: '4px',
                    fontSize: '0.8rem'
                  }}
                />
                <button
                  type="button"
                  onClick={handleSendTestEmail}
                  disabled={sendingTest}
                  style={{
                    padding: '10px 16px',
                    background: '#222',
                    color: '#fff',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    opacity: sendingTest ? 0.6 : 1
                  }}
                >
                  {sendingTest ? 'Sending...' : 'Send Test Email'}
                </button>
              </div>

              {testResult && (
                <div style={{
                  padding: '10px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  background: testResult.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${testResult.success ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  color: testResult.success ? '#4ade80' : '#f87171'
                }}>
                  {testResult.message}
                </div>
              )}
            </div>
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
