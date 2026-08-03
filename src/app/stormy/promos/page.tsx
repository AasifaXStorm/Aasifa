'use client';

import React, { useState, useEffect } from 'react';
import { getSiteConfig, updateSiteConfig } from '@/app/actions/supabaseActions';
import { Trash2, Plus, Percent } from 'lucide-react';

interface PromoCode {
  id: string;
  code: string;
  discount_percentage: number;
  is_active: boolean;
}

export default function PromosPage() {
  const [loading, setLoading] = useState(true);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [siteConfigRaw, setSiteConfigRaw] = useState<any>({});
  
  // New promo form state
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState('10');

  useEffect(() => {
    loadPromos();
  }, []);

  const loadPromos = async () => {
    setLoading(true);
    try {
      const config = await getSiteConfig();
      if (config?.description) {
        const parsed = JSON.parse(config.description);
        setSiteConfigRaw(parsed);
        setPromos(parsed.promo_codes || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      window.dispatchEvent(new Event('storm_data_loaded'));
    }
  };

  const savePromos = async (updatedPromos: PromoCode[]) => {
    try {
      const updatedConfig = { ...siteConfigRaw, promo_codes: updatedPromos };
      await updateSiteConfig(JSON.stringify(updatedConfig));
      setSiteConfigRaw(updatedConfig);
      setPromos(updatedPromos);
      window.dispatchEvent(new CustomEvent('storm_toast', { detail: { message: 'Promo codes updated successfully!', type: 'success' } }));
    } catch (e) {
      alert('Failed to save promo codes');
    }
  };

  const handleAddPromo = async () => {
    if (!newCode.trim()) return alert('Code cannot be empty');
    if (promos.find(p => p.code.toUpperCase() === newCode.trim().toUpperCase())) {
      return alert('Promo code already exists');
    }

    const discount = parseInt(newDiscount);
    if (isNaN(discount) || discount <= 0 || discount > 100) {
      return alert('Discount must be a valid percentage (1-100)');
    }

    const newPromo: PromoCode = {
      id: crypto.randomUUID(),
      code: newCode.trim().toUpperCase(),
      discount_percentage: discount,
      is_active: true
    };

    const updated = [...promos, newPromo];
    await savePromos(updated);
    setNewCode('');
    setNewDiscount('10');
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const updated = promos.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p);
    await savePromos(updated);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;
    const updated = promos.filter(p => p.id !== id);
    await savePromos(updated);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.05em', margin: 0 }}>
          MARKETING & PROMO CODES
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
        
        {/* Create New Promo */}
        <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', padding: '24px', borderRadius: '6px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#888', display: 'block', marginBottom: '20px', letterSpacing: '0.05em' }}>
            CREATE NEW PROMO CODE
          </span>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', color: '#666', marginBottom: '8px', fontWeight: 'bold' }}>CODE (e.g. STORM10)</label>
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                placeholder="STORM10"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: '#000',
                  border: '1px solid #222',
                  color: '#fff',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase'
                }}
              />
            </div>
            <div style={{ width: '150px' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', color: '#666', marginBottom: '8px', fontWeight: 'bold' }}>DISCOUNT (%)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={newDiscount}
                  onChange={(e) => setNewDiscount(e.target.value)}
                  min="1"
                  max="100"
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 35px',
                    background: '#000',
                    border: '1px solid #222',
                    color: '#fff',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    fontFamily: 'monospace'
                  }}
                />
                <Percent size={14} style={{ position: 'absolute', left: '12px', top: '14px', color: '#666' }} />
              </div>
            </div>
            <button
              onClick={handleAddPromo}
              disabled={!newCode || !newDiscount}
              style={{
                background: '#fff',
                color: '#000',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: (!newCode || !newDiscount) ? 'not-allowed' : 'pointer',
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                height: '45px',
                opacity: (!newCode || !newDiscount) ? 0.5 : 1
              }}
            >
              <Plus size={16} /> ADD CODE
            </button>
          </div>
        </div>

        {/* Active Promos List */}
        <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', padding: '24px', borderRadius: '6px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#888', display: 'block', marginBottom: '20px', letterSpacing: '0.05em' }}>
            ACTIVE PROMO CODES
          </span>
          {loading ? (
            <p style={{ color: '#666' }}>Loading codes...</p>
          ) : promos.length === 0 ? (
            <p style={{ color: '#444', textAlign: 'center', padding: '30px 0', fontSize: '0.8rem' }}>NO PROMO CODES ACTIVE</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {promos.map((promo) => (
                <div key={promo.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#070707',
                  border: '1px solid #1a1a1a',
                  padding: '16px 20px',
                  borderRadius: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', letterSpacing: '0.05em', fontFamily: 'monospace' }}>
                      {promo.code}
                    </span>
                    <span style={{
                      background: 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Percent size={12} /> {promo.discount_percentage} OFF
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={promo.is_active} 
                        onChange={() => handleToggleActive(promo.id, promo.is_active)}
                        style={{ accentColor: '#fff' }}
                      />
                      <span style={{ fontSize: '0.7rem', color: promo.is_active ? '#fff' : '#666', fontWeight: 'bold' }}>
                        {promo.is_active ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </label>
                    
                    <button
                      onClick={() => handleDelete(promo.id)}
                      title="Delete Promo Code"
                      style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', padding: '4px' }}
                      onMouseOver={(e) => e.currentTarget.style.color = '#ff4444'}
                      onMouseOut={(e) => e.currentTarget.style.color = '#666'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
