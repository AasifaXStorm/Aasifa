'use client';

import React, { useState } from 'react';
import { ProductCard, Product } from './ProductCard';
import { useTranslation } from '@/context/LanguageContext';

interface ProductCatalogProps {
  products: Product[];
}

const CATEGORIES = ['ALL', 'SHIRTS', 'HOODIES', 'PANTS', 'ACCESSORIES'];

export function ProductCatalog({ products }: ProductCatalogProps) {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const { t } = useTranslation();

  // Filter products based on selected tab
  const filteredProducts = activeCategory === 'ALL'
    ? products
    : products.filter(p => (p.category || 'Shirts').toUpperCase() === activeCategory);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      
      {/* Section Header */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '40px',
        textAlign: 'center',
      }}>
        <span style={{ fontSize: '0.8rem', color: '#666666', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '10px' }}>
          {t('home.selected')}
        </span>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 800,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          {t('home.collection_title')}
        </h2>
        <div style={{ width: '40px', height: '1px', background: '#2a2a2a', marginTop: '20px' }}></div>
      </div>

      {products.length === 0 ? (
        /* Empty Drop State */
        <div style={{
          padding: '80px 20px',
          textAlign: 'center',
          border: '1px dashed #2a2a2a',
          background: '#121212',
          maxWidth: '600px',
          margin: '0 auto',
          width: '100%',
        }}>
          <span style={{ fontSize: '1.5rem', color: '#444444', display: 'block', marginBottom: '15px', fontWeight: 'bold', letterSpacing: '0.1em' }}>
            {t('home.out_of_stock')}
          </span>
          <p style={{ color: '#888888', fontSize: '0.9rem', marginBottom: '25px', lineHeight: '1.6' }}>
            {t('home.preparing')}
          </p>
          <a href="/stormy" className="btn-secondary" style={{ display: 'inline-block' }}>
            {t('home.manage')}
          </a>
        </div>
      ) : (
        <>
          {/* Category Filter Tabs */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            flexWrap: 'wrap',
            marginBottom: '20px',
          }}>
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              const label = t(`home.cat.${cat.toLowerCase()}`);
              
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--accent-color)' : '#222222',
                    background: isActive ? 'var(--accent-color)' : 'transparent',
                    color: isActive ? '#030303' : '#888888',
                    transition: 'var(--transition-smooth)',
                  }}
                  className="category-tab-btn"
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Grid Empty State for category */}
          {filteredProducts.length === 0 ? (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              border: '1px dashed #222222',
              background: '#050505',
              color: '#666',
            }}>
              {t('home.no_items')}
            </div>
          ) : (
            /* Products Grid */
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '40px 30px',
            }}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </>
      )}

      <style jsx global>{`
        .category-tab-btn:hover {
          border-color: var(--accent-color) !important;
          color: var(--accent-color);
        }
      `}</style>
    </div>
  );
}
