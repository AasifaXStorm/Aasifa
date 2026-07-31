import React from 'react';
import { supabase } from '@/lib/supabase';
import { StormHero } from '@/components/StormHero';
import { ProductCard, Product } from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let products: Product[] = [];
  let fetchError = null;

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_variants(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      fetchError = error;
    } else {
      products = (data as any[]) || [];
    }
  } catch (err: any) {
    console.error('Catch fetching products:', err);
    fetchError = err;
  }

  return (
    <div style={{ background: '#030303', minHeight: '100vh' }}>
      {/* Cinematic Storm Hero */}
      <StormHero />

      {/* Shop Section Anchor */}
      <section id="shop" style={{
        background: '#030303',
        padding: '100px 5%',
        borderTop: '1px solid #111111',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Section Header */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '60px',
            textAlign: 'center',
          }}>
            <span style={{ fontSize: '0.8rem', color: '#666666', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '10px' }}>
              Selected Pieces
            </span>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              The Storm Collection
            </h2>
            <div style={{ width: '40px', height: '1px', background: '#333333', marginTop: '20px' }}></div>
          </div>

          {/* Error fallback */}
          {fetchError && (
            <div style={{
              padding: '30px',
              border: '1px solid #ff3333',
              background: 'rgba(255,51,51,0.05)',
              textAlign: 'center',
              color: '#ffaaaa',
              fontSize: '0.9rem',
              marginBottom: '40px',
            }}>
              <p>Failed to connect to the store database. Please check your Supabase credentials.</p>
            </div>
          )}

          {/* Empty Grid State */}
          {!fetchError && products.length === 0 ? (
            <div style={{
              padding: '80px 20px',
              textAlign: 'center',
              border: '1px dashed #222222',
              background: '#050505',
            }}>
              <span style={{ fontSize: '1.5rem', color: '#444444', display: 'block', marginBottom: '15px' }}>
                OUT OF STORM
              </span>
              <p style={{ color: '#888888', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto', marginBottom: '25px', lineHeight: '1.6' }}>
                We are currently preparing the next drop. Access the admin portal to manage inventory and list new items.
              </p>
              <a href="/admin" className="btn-secondary" style={{ display: 'inline-block' }}>
                Manage Inventory
              </a>
            </div>
          ) : (
            /* Products Grid */
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '40px 30px',
            }}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
