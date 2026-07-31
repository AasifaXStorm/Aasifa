'use client';

import React from 'react';
import { Mail, Clock } from 'lucide-react';

export default function ContactPage() {
  return (
    <div style={{
      background: '#030303',
      minHeight: 'calc(100vh - 70px)',
      padding: '80px 5%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        maxWidth: '900px',
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '60px',
      }}>
        {/* Info Column */}
        <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#555555', letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
              Connect
            </span>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Contact Us
            </h1>
          </div>

          <p style={{ color: '#b0b0b0', lineHeight: '1.6', fontSize: '0.95rem', fontWeight: 300 }}>
            Have queries regarding order tracking, size variants, or custom collaborations? Reach out and our team will get back to you within 24 hours.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
            {/* Email */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ background: '#0a0a0a', border: '1px solid #222', padding: '12px', display: 'flex' }}>
                <Mail size={18} style={{ color: '#ffffff' }} />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: '#555', textTransform: 'uppercase' }}>Email Support</span>
                <a href="mailto:support@aasifa.com" style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 600 }}>
                  support@aasifa.com
                </a>
              </div>
            </div>

            {/* Instagram */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ background: '#0a0a0a', border: '1px solid #222', padding: '12px', display: 'flex' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: '#555', textTransform: 'uppercase' }}>Instagram DM</span>
                <a href="https://www.instagram.com/aasifa.eg/" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 600 }}>
                  @aasifa.eg
                </a>
              </div>
            </div>

            {/* Support hours */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ background: '#0a0a0a', border: '1px solid #222', padding: '12px', display: 'flex' }}>
                <Clock size={18} style={{ color: '#ffffff' }} />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: '#555', textTransform: 'uppercase' }}>Support Hours</span>
                <span style={{ fontSize: '0.95rem', color: '#b0b0b0' }}>
                  Sunday &ndash; Thursday, 10 AM &ndash; 6 PM EST
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form Column */}
        <div style={{ flex: '1 1 400px' }}>
          <div className="glass-panel" style={{ padding: '40px 30px', border: '1px solid #1a1a1a' }}>
            <h3 style={{ fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '25px' }}>
              Send a Direct Message
            </h3>

            <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} onSubmit={(e) => e.preventDefault()}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Your Name</label>
                <input type="text" required className="form-input" placeholder="e.g. John Doe" />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email Address</label>
                <input type="email" required className="form-input" placeholder="e.g. name@example.com" />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Message</label>
                <textarea required rows={5} className="form-textarea" placeholder="Write your message here..." style={{ resize: 'none' }}></textarea>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px' }}>
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
