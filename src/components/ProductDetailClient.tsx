'use client';

import React, { useState } from 'react';
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
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
  const [calcHeight, setCalcHeight] = useState('');
  const [calcWeight, setCalcWeight] = useState('');
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
        color: '#888888',
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
          <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '3/4',
            background: '#0a0a0a',
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
                    background: '#0a0a0a',
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
            <span style={{ fontSize: '0.8rem', color: '#666666', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {product.category || 'Apparel'}
            </span>
            <h1 style={{ fontSize: '2.2rem', marginTop: '10px', marginBottom: '15px', fontWeight: 800 }}>
              {product.name}
            </h1>
            <div style={{ fontSize: '1.4rem', color: '#ffffff', fontWeight: 600 }}>
              {product.price} EGP
            </div>
          </div>

          {/* Description */}
          <div style={{ borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a', padding: '20px 0' }}>
            <p style={{ color: '#b0b0b0', fontSize: '0.95rem', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
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
                  onClick={() => setShowCalculator(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent)',
                    fontSize: '0.8rem',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    padding: 0,
                    fontWeight: 'bold'
                  }}
                >
                  Find your size (Calculator)
                </button>
              </div>
              {selectedSize && (
                <span style={{ fontSize: '0.85rem', color: maxStock > 0 ? '#888' : '#ff4444' }}>
                  {maxStock > 0 ? t('product.only_left').replace('{qty}', String(maxStock)) : t('product.out_of_stock')}
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
                            ? '1px solid #222222' 
                            : '1px dashed #222222',
                        background: isSelected 
                          ? 'var(--accent)' 
                          : 'transparent',
                        color: isSelected 
                          ? '#030303' 
                          : isAvailable 
                            ? '#ffffff' 
                            : '#444444',
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
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #222' }}>
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
                  background: feedback ? '#22c55e' : '#ffffff',
                  borderColor: feedback ? '#22c55e' : '#ffffff',
                  color: feedback ? '#ffffff' : '#030303',
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
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
                color: '#666666',
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
            background: '#0d0d0d',
            border: '1px solid #222',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '450px',
            width: '100%',
            color: '#fff',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #222', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                📏 STORM SIZE RECOMMENDER
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowCalculator(false);
                  setCalcResult(null);
                }}
                style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            {!calcResult ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                const h = parseFloat(calcHeight);
                const w = parseFloat(calcWeight);
                if (isNaN(h) || isNaN(w)) return;

                if (h > 185 || w > 95) {
                  setCalcResult({
                    size: 'XL (Over Limit)',
                    note: "You are above our standard size guide. Don't worry! Our XL features an extreme oversized streetwear cut, so you'll fit perfectly. Go ahead and rock the XL!"
                  });
                } else if (h > 175 || w > 78) {
                  setCalcResult({
                    size: 'XL',
                    note: 'Oversized aesthetic fit. Fits perfectly.'
                  });
                } else if (h > 168 || w > 65) {
                  setCalcResult({
                    size: 'L',
                    note: 'Streetwear slouchy fit.'
                  });
                } else if (h > 158 || w > 52) {
                  setCalcResult({
                    size: 'M',
                    note: 'Relaxed standard fit.'
                  });
                } else {
                  setCalcResult({
                    size: 'S',
                    note: 'Perfect casual fit.'
                  });
                }
              }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#888', letterSpacing: '0.05em' }}>YOUR HEIGHT (CM)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 180"
                    value={calcHeight}
                    onChange={(e) => setCalcHeight(e.target.value)}
                    style={{ padding: '12px', background: '#050505', border: '1px solid #222', color: '#fff', borderRadius: '4px' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#888', letterSpacing: '0.05em' }}>YOUR WEIGHT (KG)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 80"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(e.target.value)}
                    style={{ padding: '12px', background: '#050505', border: '1px solid #222', color: '#fff', borderRadius: '4px' }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    background: '#ffffff',
                    color: '#000',
                    padding: '14px',
                    border: 'none',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    marginTop: '10px'
                  }}
                >
                  CALCULATE RECOMMENDED SIZE
                </button>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center', padding: '10px 0' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>RECOMMENDED SIZE</span>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent)', marginTop: '8px' }}>
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
                      const cleanSize = calcResult.size.split(' ')[0]; // Extract S/M/L/XL
                      setSelectedSize(cleanSize);
                      setShowCalculator(false);
                      setCalcResult(null);
                    }}
                    style={{ flex: 1, padding: '12px', background: 'var(--accent)', color: '#000', border: 'none', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    SELECT THIS SIZE
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcResult(null)}
                    style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid #333', color: '#888', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}
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
