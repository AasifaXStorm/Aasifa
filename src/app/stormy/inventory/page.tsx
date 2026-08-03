'use client';

import React, { useState, useEffect } from 'react';
import { getProducts, updateInventory } from '@/app/actions/supabaseActions';
import { SUPPORTED_SIZES } from '@/lib/constants';

interface Variant {
  id?: string;
  size: string;
  stock_quantity: number;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  product_variants?: Variant[];
}

export default function InventoryPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      // Remove configurations/lockouts (which start with '_')
      const filtered = (data || []).filter((p: any) => !p.name.startsWith('_'));
      
      // Ensure S, M, L, XL variants exist for every product for UI ease
      const normalized = filtered.map((p: any) => {
        const variants = p.product_variants || [];
        const fullVariants = SUPPORTED_SIZES.map(size => {
          const match = variants.find((v: any) => v.size === size);
          return {
            size,
            stock_quantity: match ? match.stock_quantity : 0
          };
        });
        return {
          ...p,
          product_variants: fullVariants
        };
      });

      setProducts(normalized);
    } catch (e) {
      console.error(e);
      window.dispatchEvent(new CustomEvent('storm_toast', { detail: { message: 'Failed to load inventory.', type: 'error' } }));
    } finally {
      setLoading(false);
      window.dispatchEvent(new Event('storm_data_loaded'));
    }
  };

  const handleStockChange = (productId: string, size: string, newStock: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      return {
        ...p,
        product_variants: p.product_variants?.map(v => {
          if (v.size !== size) return v;
          return { ...v, stock_quantity: Math.max(0, newStock) };
        })
      };
    }));
  };

  const handleSave = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product || !product.product_variants) return;

    setSavingId(productId);
    try {
      await updateInventory(productId, product.product_variants);
      window.dispatchEvent(new CustomEvent('storm_toast', { detail: { message: `Inventory saved for ${product.name}!`, type: 'success' } }));
    } catch (err: any) {
      console.error(err);
      window.dispatchEvent(new CustomEvent('storm_toast', { detail: { message: 'Failed to update stock.', type: 'error' } }));
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#666', fontFamily: 'monospace' }}>
        Loading inventory...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '30px', borderBottom: '1px solid #1a1a1a', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '0.05em', margin: 0, textTransform: 'uppercase' }}>
          STOCK INVENTORY MANAGER
        </h1>
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666', marginTop: '6px', display: 'block' }}>
          Configure size quantities of products in real-time.
        </span>
      </div>

      {products.length === 0 ? (
        <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', padding: '30px', borderRadius: '6px', textAlign: 'center', color: '#666' }}>
          No active products found to configure.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {products.map(product => (
            <div
              key={product.id}
              style={{
                background: '#0d0d0d',
                border: '1px solid #1a1a1a',
                borderRadius: '6px',
                padding: '20px',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                alignItems: 'center',
                gap: '20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }}
            >
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {product.category}
                </span>
                <h3 style={{ margin: '4px 0 15px 0', fontSize: '1.05rem', fontWeight: 800 }}>
                  {product.name}
                </h3>

                {/* Sizing Stock Inputs */}
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  {product.product_variants?.map(v => (
                    <div
                      key={v.size}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        background: '#050505',
                        border: '1px solid #222',
                        borderRadius: '4px',
                        padding: '8px 12px',
                        alignItems: 'center',
                        minWidth: '70px'
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#888' }}>{v.size}</span>
                      <input
                        type="number"
                        min="0"
                        value={v.stock_quantity}
                        onChange={(e) => handleStockChange(product.id, v.size, parseInt(e.target.value) || 0)}
                        style={{
                          width: '50px',
                          background: 'transparent',
                          border: 'none',
                          color: '#fff',
                          textAlign: 'center',
                          fontSize: '0.9rem',
                          fontWeight: 'bold',
                          outline: 'none'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div>
                <button
                  onClick={() => handleSave(product.id)}
                  disabled={savingId === product.id}
                  style={{
                    background: '#ffffff',
                    color: '#000',
                    border: 'none',
                    padding: '12px 24px',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    boxShadow: '0 0 10px rgba(255,255,255,0.1)',
                    transition: 'opacity 0.2s'
                  }}
                >
                  {savingId === product.id ? 'SAVING...' : 'SAVE STOCK'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
