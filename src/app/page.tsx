import React from 'react';
import { supabase } from '@/lib/supabase';
import { StormHero } from '@/components/StormHero';
import { ProductCatalog } from '@/components/ProductCatalog';
import { Product } from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let products: Product[] = [];
  let fetchError = null;
  let enabledCategories = ['SHIRTS']; // default Shirts only

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_variants(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      fetchError = error;
    } else {
      // Extract active products
      products = ((data as any[]) || [])
        .filter(p => !p.name.startsWith('_') && !p.category?.endsWith(' (Hidden)'))
        .map(p => ({
          ...p,
          category: p.category ? p.category.replace(' (Hidden)', '') : 'Shirts'
        }));

      // Find site config inside fetched products to avoid extra query
      const configItem = (data as any[] || []).find(p => p.name === '_SITE_CONFIG_');
      if (configItem?.description) {
        try {
          const parsed = JSON.parse(configItem.description);
          const cats = [];
          if (parsed.show_category_shirts !== false) cats.push('SHIRTS');
          if (parsed.show_category_hoodies === true) cats.push('HOODIES');
          if (parsed.show_category_pants === true) cats.push('PANTS');
          if (parsed.show_category_accessories === true) cats.push('ACCESSORIES');
          
          if (cats.length > 0) {
            enabledCategories = cats;
          }
        } catch (e) {}
      }
    }
  } catch (err: any) {
    console.error('Catch fetching products:', err);
    fetchError = err;
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-void)', minHeight: '100vh' }}>
      {/* Cinematic Storm Hero */}
      <StormHero />

      {/* Shop Section Anchor */}
      <section id="shop" style={{
        backgroundColor: 'var(--bg-base)',
        padding: '100px 5%',
        borderTop: '1px solid var(--border-color)',
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
              <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                Failed to connect to the store database. Please check your Supabase credentials.
              </p>
              {fetchError && (
                <p style={{ fontSize: '0.8rem', opacity: 0.8, fontFamily: 'monospace' }}>
                  Detail: {fetchError.message || fetchError.error_description || JSON.stringify(fetchError)}
                </p>
              )}
            </div>
          )}

          {/* Interactive Catalog Grid with Filters & Titles */}
          {!fetchError && (
            <ProductCatalog products={products} enabledCategories={enabledCategories} />
          )}
        </div>
      </section>
    </div>
  );
}
