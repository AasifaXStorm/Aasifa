import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80';
  
  // Calculate total stock
  const totalStock = product.product_variants?.reduce((sum, v) => sum + v.stock_quantity, 0) ?? 0;
  const isOutOfStock = totalStock === 0;

  // Get list of available sizes
  const sizes = product.product_variants?.map(v => v.size) || [];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-color)',
      borderRadius: '0px',
      overflow: 'hidden',
      transition: 'var(--transition-smooth)',
      position: 'relative',
    }} className="product-card-hover">
      {/* Product Image Link */}
      <Link href={`/products/${product.id}`} className={`image-skeleton-loader ${isOutOfStock ? 'oos-card' : ''}`} style={{ display: 'block', position: 'relative', width: '100%', aspectRatio: '3/4', overflow: 'hidden' }}>
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
          style={{
            objectFit: 'cover',
            filter: isOutOfStock ? 'brightness(0.5) contrast(1.1)' : 'brightness(0.85) contrast(1.1)',
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.4s ease',
          }}
          className="product-card-img"
        />

        {/* Small corner badge — always visible for OOS */}
        {isOutOfStock && (
          <div style={{
            position: 'absolute',
            top: '15px',
            left: '15px',
            background: 'rgba(0,0,0,0.85)',
            border: '1px solid #555555',
            color: '#cc3333',
            fontSize: '0.7rem',
            padding: '4px 10px',
            fontWeight: 'bold',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            zIndex: 10,
          }}>
            Out of Storm
          </div>
        )}

        {/* Full hover overlay — appears on hover for OOS items */}
        {isOutOfStock && (
          <div className="oos-overlay" style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.35s ease',
            zIndex: 5,
          }}>
            <span style={{
              fontSize: 'clamp(1.2rem, 4vw, 1.8rem)',
              fontWeight: 900,
              color: '#cc3333',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontStyle: 'italic',
              textShadow: '0 2px 20px rgba(204, 51, 51, 0.4)',
            }}>
              OUT OF STORM
            </span>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div 
        className="product-card-info"
        style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          borderTop: '1px solid var(--border-color)',
        }}
      >
        {/* Category */}
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {product.category || 'Apparel'}
        </span>

        {/* Title */}
        <Link href={`/products/${product.id}`} className="product-card-title" style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.02em' }}>
          {product.name}
        </Link>

        {/* Price */}
        <span className="product-card-price" style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 500 }}>
          {product.price} EGP
        </span>

        {/* Sizes preview */}
        {sizes.length > 0 && !isOutOfStock && (
          <div style={{
            display: 'flex',
            gap: '6px',
            marginTop: '8px',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}>
            <span>Sizes:</span>
            <span style={{ color: 'var(--text-muted)' }}>{sizes.join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
