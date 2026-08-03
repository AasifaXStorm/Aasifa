'use client';

import React, { useState } from 'react';
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { LOW_STOCK_THRESHOLD } from '@/lib/constants';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from './ProductCard';
import { addToCart } from '@/lib/cart';

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { t } = useTranslation();
  const images = product.images?.length ? product.images : [
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80'
  ];
  
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState(false);

  // Size Calculator states
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcStep, setCalcStep] = useState(1);
  const [calcHeight, setCalcHeight] = useState(175);
  const [calcWeight, setCalcWeight] = useState(70);
  const [fitPreference, setFitPreference] = useState<'Slim' | 'Regular' | 'Oversized'>('Regular');
  const [calcResult, setCalcResult] = useState<{ size: string; note: string } | null>(null);

  // Find active variant
  const activeVariant = product.product_variants?.find(v => v.size === selectedSize);
  const maxStock = activeVariant ? activeVariant.stock_quantity : 0;

  // Calculate total stock across all variants
  const totalStock = product.product_variants?.reduce((sum, v) => sum + v.stock_quantity, 0) ?? 0;
  const isFullyOutOfStock = totalStock === 0;

  const handleNextImage = () => {
    setActiveImgIdx((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setActiveImgIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleAddToCart = () => {
    if (!selectedSize || !activeVariant) return;

    addToCart({
      id: activeVariant.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      image: images[0],
      maxStock: maxStock
    }, quantity);

    setFeedback(true);
    setTimeout(() => setFeedback(false), 2000);
  };

  return (
    <div style={{
      maxWidth: '1100px',
      width: '90%',
      margin: '0 auto',
      padding: '50px 0',
    }}>
      {/* Back to collection */}
      <Link href="/#shop" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        marginBottom: '40px',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }}>
        <ChevronLeft size={16} /> Back to Collection
      </Link>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '50px',
      }}>
        {/* Left Column: Image Slider */}
        <div style={{
          flex: '1 1 500px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
        }}>
          {/* Main Display Image */}
          <div className="image-skeleton-loader" style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '3/4',
            border: '1px solid #1a1a1a',
            overflow: 'hidden',
          }}>
            <Image
              src={images[activeImgIdx]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 550px"
              priority={activeImgIdx === 0}
              loading={activeImgIdx === 0 ? undefined : 'lazy'}
              style={{
                objectFit: 'cover',
                filter: 'brightness(0.9) contrast(1.05)',
              }}
            />

            {/* Slider arrows if multiple images */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '15px',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #222',
                  }}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={handleNextImage}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '15px',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #222',
                  }}
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImgIdx(idx)}
                  style={{
                    width: '70px',
                    height: '90px',
                    border: activeImgIdx === idx ? '1px solid var(--accent)' : '1px solid #222222',
                    padding: 0,
                    overflow: 'hidden',
                    background: 'var(--bg-base)',
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <Image
                      src={img}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      fill
                      sizes="70px"
                      loading="lazy"
                      style={{ objectFit: 'cover', filter: 'brightness(0.7)' }}
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: details & purchasing */}
        <div style={{
          flex: '1 1 400px',
          display: 'flex',
          flexDirection: 'column',
          gap: '25px',
        }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {product.category || 'Apparel'}
            </span>
            <h1 style={{ fontSize: '2.2rem', marginTop: '10px', marginBottom: '15px', fontWeight: 800 }}>
              {product.name}
            </h1>
            <div style={{ fontSize: '1.4rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              {product.price} EGP
            </div>
          </div>

          {/* Description */}
          <div style={{ borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a', padding: '20px 0' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
              {product.description || 'No description available for this premium piece.'}
            </p>
          </div>

          {/* Size Selector */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888' }}>
                  {t('product.select_size')}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCalcStep(1);
                    setCalcResult(null);
                    setShowCalculator(true);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    opacity: 0.8,
                    fontSize: '0.8rem',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    padding: 0,
                    fontWeight: 'bold',
                    letterSpacing: '0.05em'
                  }}
                >
                  Find your size (Calculator)
                </button>
              </div>
              {selectedSize && (
                <span style={{ 
                  fontSize: '0.85rem', 
                  color: maxStock === 0 ? '#ff4444' : maxStock <= LOW_STOCK_THRESHOLD ? '#ffaa00' : '#888',
                  fontWeight: maxStock <= LOW_STOCK_THRESHOLD ? 'bold' : 'normal'
                }}>
                  {maxStock === 0 
                    ? t('product.out_of_stock') 
                    : maxStock <= LOW_STOCK_THRESHOLD 
                      ? `Low Stock: Only ${maxStock} left` 
                      : 'In Stock'
                  }
                </span>
              )}
            </div>

            {isFullyOutOfStock ? (
              <div style={{ color: '#ff4444', fontSize: '0.95rem', fontWeight: 'bold' }}>
                {t('product.out_of_stock')}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {product.product_variants?.map((v) => {
                  const isAvailable = v.stock_quantity > 0;
                  const isSelected = selectedSize === v.size;
                  
                  return (
                    <button
                      key={v.id}
                      disabled={!isAvailable}
                      onClick={() => {
                        setSelectedSize(v.size);
                        setQuantity(1); // reset quantity to 1 when changing size
                      }}
                      style={{
                        padding: '12px 20px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        border: isSelected 
                          ? '1px solid var(--accent)' 
                          : isAvailable 
                            ? '1px solid var(--border-highlight)' 
                            : '1px dashed var(--border-color)',
                        background: isSelected 
                          ? 'var(--accent)' 
                          : 'transparent',
                        color: isSelected 
                          ? '#030303' 
                          : isAvailable 
                            ? 'var(--text-primary)' 
                            : 'var(--text-muted)',
                        cursor: isAvailable ? 'pointer' : 'not-allowed',
                        opacity: isAvailable ? 1 : 0.4,
                      }}
                    >
                      {v.size}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quantity and Checkout */}
          {selectedSize && maxStock > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888' }}>
                  Quantity
                </span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-highlight)' }}>
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    -
                  </button>
                  <span style={{ width: '40px', textAlign: 'center', fontSize: '0.95rem' }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(maxStock, q + 1))}
                    style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart button */}
              <button
                onClick={handleAddToCart}
                className="btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '15px',
                  background: feedback ? '#22c55e' : 'var(--text-primary)',
                  borderColor: feedback ? '#22c55e' : 'var(--text-primary)',
                  color: feedback ? '#ffffff' : 'var(--bg-base)',
                }}
              >
                <ShoppingBag size={18} />
                {feedback ? t('product.added').toUpperCase() : t('product.add_to_cart').toUpperCase()}
              </button>
            </div>
          )}

          {!selectedSize && !isFullyOutOfStock && (
            <button
              disabled
              className="btn-primary"
              style={{
                width: '100%',
                padding: '15px',
                background: 'var(--bg-elevated-2)',
                borderColor: 'var(--bg-elevated-2)',
                color: 'var(--text-muted)',
                cursor: 'not-allowed',
              }}
            >
              {t('product.select_size')}
            </button>
          )}
        </div>
      </div>

      {/* SIZING CALCULATOR MODAL */}
      {showCalculator && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: '#0a0a0a',
            border: '1px solid #222',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '450px',
            width: '100%',
            color: '#fff',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #222', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fff' }}>
                ⚡ STORM SIZE CALCULATOR
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowCalculator(false);
                  setCalcResult(null);
                }}
                style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            {/* STEP 1: HEIGHT & WEIGHT SLIDERS */}
            {calcStep === 1 && !calcResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Height */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 900, color: '#888', letterSpacing: '0.05em' }}>
                    <span>HEIGHT</span>
                    <span style={{ color: '#fff' }}>{calcHeight} CM</span>
                  </div>
                  <input
                    type="range"
                    min="140"
                    max="210"
                    value={calcHeight}
                    onChange={(e) => setCalcHeight(parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: '#ffffff',
                      height: '4px',
                      background: '#222',
                      borderRadius: '2px',
                      cursor: 'pointer'
                    }}
                  />
                </div>

                {/* Weight */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 900, color: '#888', letterSpacing: '0.05em' }}>
                    <span>WEIGHT</span>
                    <span style={{ color: '#fff' }}>{calcWeight} KG</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="120"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: '#ffffff',
                      height: '4px',
                      background: '#222',
                      borderRadius: '2px',
                      cursor: 'pointer'
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setCalcStep(2)}
                  style={{
                    background: '#ffffff',
                    color: '#000',
                    padding: '14px',
                    border: 'none',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    letterSpacing: '0.05em',
                    marginTop: '10px'
                  }}
                >
                  NEXT STEP
                </button>
              </div>
            )}

            {/* STEP 2: FIT PREFERENCE */}
            {calcStep === 2 && !calcResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#888', letterSpacing: '0.05em' }}>
                  SELECT FIT PREFERENCE
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  {(['Slim', 'Regular', 'Oversized'] as const).map((fit) => (
                    <button
                      key={fit}
                      type="button"
                      onClick={() => setFitPreference(fit)}
                      style={{
                        padding: '12px 6px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        background: fitPreference === fit ? '#fff' : 'transparent',
                        color: fitPreference === fit ? '#000' : '#888',
                        border: `1px solid ${fitPreference === fit ? '#fff' : '#222'}`,
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {fit.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setCalcStep(1)}
                    style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid #333', color: '#888', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    BACK
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      let baseSize = 'S';
                      if (calcHeight > 185 || calcWeight > 95) {
                        baseSize = 'XL (Over Limit)';
                      } else {
                        // Estimate size index based on weight & height
                        const score = (calcHeight - 150) + (calcWeight - 40);
                        if (score > 105) baseSize = 'XL';
                        else if (score > 75) baseSize = 'L';
                        else if (score > 40) baseSize = 'M';
                        else baseSize = 'S';
                      }

                      // Adjust based on fit preference
                      let finalSize = baseSize;
                      if (baseSize !== 'XL (Over Limit)') {
                        if (fitPreference === 'Oversized') {
                          if (baseSize === 'S') finalSize = 'M';
                          else if (baseSize === 'M') finalSize = 'L';
                          else if (baseSize === 'L') finalSize = 'XL';
                        } else if (fitPreference === 'Slim') {
                          if (baseSize === 'XL') finalSize = 'L';
                          else if (baseSize === 'L') finalSize = 'M';
                          else if (baseSize === 'M') finalSize = 'S';
                        }
                      }

                      let note = '';
                      if (finalSize.startsWith('XL')) {
                        note = "You are above our standard size guide. Don't worry! Our XL features an extreme oversized streetwear cut, so you'll fit perfectly. Go ahead and rock the XL!";
                      } else {
                        note = `This selection offers the perfect ${fitPreference.toLowerCase()} style fit for your dimensions.`;
                      }

                      setCalcResult({
                        size: finalSize.split(' ')[0], // Capped strictly to S-XL
                        note
                      });
                    }}
                    style={{ flex: 1, padding: '12px', background: '#fff', color: '#000', border: 'none', fontWeight: 900, borderRadius: '4px', cursor: 'pointer' }}
                  >
                    CALCULATE
                  </button>
                </div>
              </div>
            )}

            {/* RESULT VIEW */}
            {calcResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center', padding: '10px 0' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>RECOMMENDED SIZE</span>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', marginTop: '8px' }}>
                    {calcResult.size}
                  </div>
                </div>
                <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                  {calcResult.note}
                </p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSize(calcResult.size);
                      setShowCalculator(false);
                      setCalcResult(null);
                    }}
                    style={{ flex: 1, padding: '12px', background: '#fff', color: '#000', border: 'none', fontWeight: 900, borderRadius: '4px', cursor: 'pointer' }}
                  >
                    SELECT THIS SIZE
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCalcResult(null);
                      setCalcStep(1);
                    }}
                    style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid #333', color: '#888', fontWeight: 700, borderRadius: '4px', cursor: 'pointer' }}
                  >
                    RE-CALCULATE
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
