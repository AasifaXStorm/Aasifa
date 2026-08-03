'use client';

import { useEffect } from 'react';

export default function ShippingPage() {
  useEffect(() => {
    window.dispatchEvent(new Event('storm_data_loaded'));
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '30px' }}>SHIPPING</h1>
      <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', padding: '24px', borderRadius: '6px', color: '#666', fontSize: '0.8rem' }}>
        Shipping couriers, integrations, and fee models.
      </div>
    </div>
  );
}
