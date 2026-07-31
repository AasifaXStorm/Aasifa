'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Product } from '@/components/ProductCard';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data: productsData, error: prodError } = await supabase
        .from('products')
        .select('*, product_variants(*)')
        .order('created_at', { ascending: false });

      if (prodError) throw prodError;

      const filteredProds = (productsData || []).filter(p => !p.name.startsWith('_'));
      setProducts(filteredProds);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete product "${name}"?`)) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        if (error.message.includes('violates foreign key constraint')) {
          alert('Cannot delete this product because it is referenced in past orders. Please set all size variant stock quantities to 0 in the editor to deactivate it instead.');
        } else {
          alert(`Error deleting product: ${error.message}`);
        }
      } else {
        setProducts(products.filter(p => p.id !== id));
      }
    } catch (err: any) {
      console.error(err);
      alert('An error occurred while attempting to delete the product.');
    }
  };

  return (
    <div style={{ padding: '40px 5%', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '0.05em', color: '#fff', margin: 0 }}>
          CATALOG & STOCK
        </h1>
        <Link href="/stormy/products/new" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '0.8rem' }}>
          <Plus size={14} /> Add Product
        </Link>
      </div>

      {errorMsg && (
        <div style={{ padding: '15px', background: 'rgba(255,0,0,0.05)', border: '1px solid #ff3333', color: '#ffaaaa', marginBottom: '30px', fontSize: '0.9rem' }}>
          {errorMsg}
        </div>
      )}

      {loading ? (
        <p style={{ color: '#888', textAlign: 'center', marginTop: '50px' }}>Loading products...</p>
      ) : products.length === 0 ? (
        <div style={{ padding: '40px', background: '#121212', border: '1px solid #1a1a1a', textAlign: 'center', color: '#666', borderRadius: '4px' }}>
          No products in database. Click &ldquo;Add Product&rdquo; to create your first apparel listing.
        </div>
      ) : (
        <div className="glass-panel" style={{ overflowX: 'auto', border: '1px solid #1a1a1a', background: '#121212', borderRadius: '4px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #222', background: '#0a0a0a', color: '#888' }}>
                <th style={{ padding: '15px' }}>Image</th>
                <th style={{ padding: '15px' }}>Product</th>
                <th style={{ padding: '15px' }}>Category</th>
                <th style={{ padding: '15px' }}>Price</th>
                <th style={{ padding: '15px' }}>Sizes & Inventory</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => {
                const firstImg = p.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80';
                const totalStock = p.product_variants?.reduce((sum, v) => sum + v.stock_quantity, 0) ?? 0;
                
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #1a1a1a', verticalAlign: 'middle' }}>
                    <td style={{ padding: '15px' }}>
                      <img src={firstImg} alt={p.name} style={{ width: '40px', height: '52px', objectFit: 'cover', border: '1px solid #222' }} />
                    </td>
                    <td style={{ padding: '15px', fontWeight: 600, color: '#fff' }}>{p.name}</td>
                    <td style={{ padding: '15px', color: '#888' }}>{p.category}</td>
                    <td style={{ padding: '15px', color: '#fff' }}>{p.price} EGP</td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
                        {p.product_variants?.map(v => (
                          <span key={v.id} style={{ fontSize: '0.75rem', background: '#0a0a0a', border: '1px solid #222', padding: '2px 6px', color: v.stock_quantity > 0 ? '#bbb' : '#ff5555' }}>
                            {v.size}: {v.stock_quantity}
                          </span>
                        ))}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: totalStock > 0 ? '#22c55e' : '#ff4444' }}>
                        Total Stock: {totalStock}
                      </span>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <Link href={`/stormy/products/${p.id}`} style={{ color: '#bbb', padding: '6px' }} title="Edit Product">
                          <Edit size={16} />
                        </Link>
                        <button onClick={() => handleDeleteProduct(p.id, p.name)} style={{ color: '#888', padding: '6px', background: 'none', border: 'none', cursor: 'pointer' }} title="Delete Product" onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'} onMouseOut={(e) => e.currentTarget.style.color = '#888'}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
