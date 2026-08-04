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

  // Get list of available sizes (only S, M, L, XL, sorted smallest to biggest)
  const sizeOrder = ['S', 'M', 'L', 'XL'];
  const rawSizes = product.product_variants?.map(v => v.size) || [];
  const sizes = Array.from(new Set(rawSizes))
    .filter(size => sizeOrder.includes(size))
    .sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b));

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      overflow: 'hidden',
      transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
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
            filter: isOutOfStock ? 'brightness(0.5) contrast(1.1)' : 'brightness(0.9) contrast(1.05)',
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.4s ease',
          }}
          className="product-card-img"
        />

        {/* Small corner badge — always visible for OOS */}
        {isOutOfStock && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#ef4444',
            fontSize: '0.68rem',
            padding: '4px 10px',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            borderRadius: '4px',
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
              color: '#ef4444',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontStyle: 'italic',
              textShadow: '0 2px 20px rgba(239, 68, 68, 0.4)',
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
          padding: '18px 20px 22px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          borderTop: '1px solid var(--border-color)',
          background: 'rgba(18, 18, 18, 0.8)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Category */}
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
          {product.category || 'Apparel'}
        </span>

        {/* Title */}
        <Link href={`/products/${product.id}`} className="product-card-title" style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.02em', lineHeight: '1.3' }}>
          {product.name}
        </Link>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
          <span className="product-card-price" style={{ color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: 800 }}>
            {product.price} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>EGP</span>
          </span>

          {/* Available Sizes Pills */}
          {sizes.length > 0 && !isOutOfStock && (
            <div style={{ display: 'flex', gap: '4px' }}>
              {sizes.map(size => (
                <span 
                  key={size}
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '3px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {size}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
