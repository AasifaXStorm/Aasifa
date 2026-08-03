'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProducts, deleteProduct } from '@/app/actions/supabaseActions';

export default function ProductsPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts((data || []).filter((p: any) => !p.name.startsWith('_')));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      window.dispatchEvent(new Event('storm_data_loaded'));
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete product "${name}"?`)) return;
    try {
      await deleteProduct(id);
      setProducts(products.filter((p: any) => p.id !== id));
    } catch (e) {
      alert('Delete failed.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.05em' }}>
          PRODUCTS
        </h1>
        <Link href="/stormy/products/new" style={{
          background: '#ffffff',
          color: '#000000',
          padding: '10px 20px',
          borderRadius: '4px',
          fontWeight: 'bold',
          fontSize: '0.75rem',
          textDecoration: 'none',
          letterSpacing: '0.1em'
        }}>
          + ADD PRODUCT
        </Link>
      </div>

      <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', padding: '24px', borderRadius: '6px', marginBottom: '35px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#888', display: 'block', marginBottom: '20px' }}>
          ALL PRODUCTS
        </span>

        {loading ? (
          <p style={{ color: '#666' }}>Loading products...</p>
        ) : products.length === 0 ? (
          <p style={{ color: '#444', textAlign: 'center', padding: '20px 0', fontSize: '0.8rem' }}>NO PRODUCTS FOUND</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1a1a1a', color: '#666' }}>
                <th style={{ padding: '12px' }}>NAME</th>
                <th style={{ padding: '12px' }}>PRICE</th>
                <th style={{ padding: '12px' }}>STATUS</th>
                <th style={{ padding: '12px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: any, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #111' }}>
                  <td style={{ padding: '12px', color: '#fff', fontWeight: 'bold' }}>{p.name}</td>
                  <td style={{ padding: '12px' }}>{p.price} EGP</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      background: p.is_active ? 'rgba(61, 220, 132, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      color: p.is_active ? '#3DDC84' : '#666',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 'bold'
                    }}>
                      {p.is_active ? 'ACTIVE' : 'HIDDEN'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <Link href={`/stormy/products/${p.id}`} style={{ color: '#aaa', textDecoration: 'none' }}>EDIT</Link>
                      <button onClick={() => handleDelete(p.id, p.name)} style={{ background: 'transparent', border: 'none', color: '#ff6666', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}>DELETE</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* DROP TEASER BLOCK */}
      <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', padding: '24px', borderRadius: '6px' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 800, margin: '0 0 15px 0' }}>
          DROP TEASER
        </h3>
        <p style={{ color: '#555', fontSize: '0.75rem', margin: '0 0 20px 0' }}>
          CONFIGURE A BLURRED/BLACKED-OUT TEASER GRID WITH TWO PRODUCTS AND A COUNTDOWN RELEASE TIMER.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label style={{ fontSize: '0.7rem', color: '#666', display: 'block', marginBottom: '8px' }}>TEASER SECTION STATUS</label>
            <select style={{ width: '100%', padding: '12px', background: '#000', border: '1px solid #222', color: '#fff', borderRadius: '4px', fontFamily: 'monospace' }}>
              <option>Active (Visible on Storefront)</option>
              <option>Hidden</option>
            </select>
          </div>

          <div className="form-group">
            <label style={{ fontSize: '0.7rem', color: '#666', display: 'block', marginBottom: '8px' }}>TARGET RELEASE DATE & TIME (ISO FORMAT)</label>
            <input type="text" defaultValue="2026-07-15T20:00:00" style={{ width: '100%', padding: '12px', background: '#000', border: '1px solid #222', color: '#fff', borderRadius: '4px', fontFamily: 'monospace' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
