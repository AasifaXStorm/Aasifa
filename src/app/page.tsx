import React from 'react';
import { supabase } from '@/lib/supabase';
import { StormHero } from '@/components/StormHero';
import { ProductCatalog } from '@/components/ProductCatalog';
import { Product } from '@/components/ProductCard';

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
      products = ((data as any[]) || []).filter(p => !p.name.startsWith('_'));
    }
  } catch (err: any) {
    console.error('Catch fetching products:', err);
    fetchError = err;
  }

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      {/* Cinematic Storm Hero */}
      <StormHero />

      {/* Shop Section Anchor */}
      <section id="shop" style={{
        background: '#0a0a0a',
        padding: '100px 5%',
        borderTop: '1px solid #1a1a1a',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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

          {/* Interactive Catalog Grid with Filters & Titles */}
          {!fetchError && (
            <ProductCatalog products={products} />
          )}
        </div>
      </section>
    </div>
  );
}
