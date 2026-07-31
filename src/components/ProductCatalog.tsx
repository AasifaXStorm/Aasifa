'use client';

import React, { useState } from 'react';
import { ProductCard, Product } from './ProductCard';

interface ProductCatalogProps {
  products: Product[];
}

const CATEGORIES = ['ALL', 'SHIRTS', 'HOODIES', 'PANTS', 'ACCESSORIES'];

export function ProductCatalog({ products }: ProductCatalogProps) {
  const [activeCategory, setActiveCategory] = useState('ALL');

  // Filter products based on selected tab
  const filteredProducts = activeCategory === 'ALL'
    ? products
    : products.filter(p => (p.category || 'Shirts').toUpperCase() === activeCategory);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
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
                borderColor: isActive ? '#ffffff' : '#222222',
                background: isActive ? '#ffffff' : 'transparent',
                color: isActive ? '#030303' : '#888888',
                transition: 'var(--transition-smooth)',
              }}
              className="category-tab-btn"
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid Empty State */}
      {filteredProducts.length === 0 ? (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          border: '1px dashed #222222',
          background: '#050505',
          color: '#666',
        }}>
          No items found in category "{activeCategory.toLowerCase()}".
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

      <style jsx global>{`
        .category-tab-btn:hover {
          border-color: #555555;
          color: #ffffff;
        }
      `}</style>
    </div>
  );
}
