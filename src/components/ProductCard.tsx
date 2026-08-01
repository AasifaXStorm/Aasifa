import React from 'react';
import Link from 'next/link';

export interface ProductVariant {
  id: string;
  size: string;
  stock_quantity: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  product_variants?: ProductVariant[];
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80'; // fallback placeholder image from unsplash
  
  // Calculate total stock
  const totalStock = product.product_variants?.reduce((sum, v) => sum + v.stock_quantity, 0) ?? 0;
  const isOutOfStock = totalStock === 0;

  // Get list of available sizes
  const sizes = product.product_variants?.map(v => v.size) || [];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '0px', // minimal sharp corners
      overflow: 'hidden',
      transition: 'var(--transition-smooth)',
      position: 'relative',
    }} className="product-card-hover">
      {/* Product Image Link */}
      <Link href={`/products/${product.id}`} style={{ display: 'block', position: 'relative', width: '100%', aspectRatio: '3/4', overflow: 'hidden' }}>
        <img
          src={primaryImage}
          alt={product.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.85) contrast(1.1)',
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="product-card-img"
        />

        {/* Badges */}
        {isOutOfStock ? (
          <div style={{
            position: 'absolute',
            top: '15px',
            left: '15px',
            background: 'rgba(0,0,0,0.85)',
            border: '1px solid #555555',
            color: '#888888',
            fontSize: '0.7rem',
            padding: '4px 10px',
            fontWeight: 'bold',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            zIndex: 10,
          }}>
            Sold Out
          </div>
        ) : null}
      </Link>

      {/* Info Info */}
      <div style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        borderTop: '1px solid #121212',
      }}>
        {/* Category */}
        <span style={{ fontSize: '0.75rem', color: '#555555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {product.category || 'Apparel'}
        </span>

        {/* Title */}
        <Link href={`/products/${product.id}`} style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.02em' }}>
          {product.name}
        </Link>

        {/* Price */}
        <span style={{ color: '#e5e5e5', fontSize: '0.95rem', fontWeight: 500 }}>
          {product.price} EGP
        </span>

        {/* Sizes preview */}
        {sizes.length > 0 && !isOutOfStock && (
          <div style={{
            display: 'flex',
            gap: '6px',
            marginTop: '8px',
            fontSize: '0.75rem',
            color: '#666666',
          }}>
            <span>Sizes:</span>
            <span style={{ color: '#888888' }}>{sizes.join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
