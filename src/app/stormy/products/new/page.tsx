'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Plus } from 'lucide-react';
import { saveProduct, uploadImageAction } from '@/app/actions/supabaseActions';

export default function NewProductPage() {
  const router = useRouter();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [color, setColor] = useState('');
  const [badge, setBadge] = useState('');
  const [fabric, setFabric] = useState('');
  const [fit, setFit] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Shirts');
  const [status, setStatus] = useState('Active');

  // Instagram-style Infinite Images list
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [manualImageUrl, setManualImageUrl] = useState('');

  useEffect(() => {
    setSessionChecked(true);
    window.dispatchEvent(new Event('storm_data_loaded'));
  }, []);

  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadProgress('Uploading image(s)...');
      try {
        const filesArray = Array.from(e.target.files);
        for (const file of filesArray) {
          const filePath = `products/${crypto.randomUUID()}_${file.name}`;
          const formData = new FormData();
          formData.append('file', file);
          formData.append('filePath', filePath);
          
          const result = await uploadImageAction(formData);
          const urls = JSON.parse(result);
          setImagesList(prev => [...prev, ...urls]);
        }
        setUploadProgress('Uploaded successfully!');
        setTimeout(() => setUploadProgress(null), 3000);
      } catch (err: any) {
        console.error(err);
        setErrorMsg('Failed to upload image(s): ' + (err.message || err));
        setUploadProgress(null);
      }
    }
  };

  const handleAddManualUrl = () => {
    if (manualImageUrl.trim()) {
      setImagesList(prev => [...prev, manualImageUrl.trim()]);
      setManualImageUrl('');
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImagesList(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price.trim()) {
      setErrorMsg('Product name and price are required.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setUploadProgress('Saving product details...');

    try {
      const finalImages = imagesList.length > 0 ? imagesList : [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80'
      ];

      // Combine extra details into description
      const extraDetails = [];
      if (fabric.trim()) extraDetails.push(`Fabric: ${fabric.trim()}`);
      if (fit.trim()) extraDetails.push(`Fit: ${fit.trim()}`);
      if (color.trim()) extraDetails.push(`Color: ${color.trim()}`);
      if (badge.trim()) extraDetails.push(`Badge: ${badge.trim()}`);

      const fullDescription = extraDetails.length > 0
        ? `${description}\n\n${extraDetails.join('\n')}`
        : description;

      const productData = {
        name,
        description: fullDescription,
        price: parseFloat(price),
        category: category,
        images: finalImages,
        is_active: status === 'Active'
      };

      const defaultVariants = [
        { size: 'S', stock_quantity: 10 },
        { size: 'M', stock_quantity: 10 },
        { size: 'L', stock_quantity: 10 },
        { size: 'XL', stock_quantity: 10 },
        { size: 'XXL', stock_quantity: 10 },
      ];

      await saveProduct(productData, defaultVariants, true);

      setUploadProgress('Success!');
      window.location.href = '/stormy/products';
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred during product creation.');
      setLoading(false);
    }
  };

  if (!sessionChecked) {
    return (
      <div style={{ background: '#040404', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#666', fontFamily: 'monospace' }}>Verifying session...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
      <div style={{
        background: '#0d0d0d',
        border: '1px solid #222222',
        borderRadius: '8px',
        padding: '35px',
        color: '#fff',
        boxShadow: '0 15px 45px rgba(0,0,0,0.5)'
      }}>
        
        {/* Header */}
        <div style={{ marginBottom: '30px', borderBottom: '1px solid #222222', paddingBottom: '20px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
            ADD NEW PRODUCT
          </h2>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666', marginTop: '6px', display: 'block' }}>
            Create a new apparel drop and stage its images.
          </span>
        </div>

        {errorMsg && (
          <div style={{ padding: '15px', background: 'rgba(255,50,50,0.1)', border: '1px solid #ff3333', color: '#ffaaaa', marginBottom: '25px', fontSize: '0.85rem', borderRadius: '4px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* PRODUCT NAME */}
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#888', display: 'block', marginBottom: '8px', fontWeight: 700 }}>
              PRODUCT NAME
            </label>
            <input
              type="text"
              required
              placeholder="Onyx Oversized Hoodie"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '14px', background: '#050505', border: '1px solid #222', color: '#fff', borderRadius: '6px', fontSize: '0.9rem' }}
            />
          </div>

          {/* CATEGORY & PRICE */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#888', display: 'block', marginBottom: '8px', fontWeight: 700 }}>
                CATEGORY
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '14px', background: '#050505', border: '1px solid #222', color: '#fff', borderRadius: '6px', fontSize: '0.9rem' }}
              >
                <option value="Shirts">Shirts</option>
                <option value="Hoodies">Hoodies</option>
                <option value="Pants">Pants</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#888', display: 'block', marginBottom: '8px', fontWeight: 700 }}>
                PRICE (EGP)
              </label>
              <input
                type="number"
                required
                placeholder="650"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={{ width: '100%', padding: '14px', background: '#050505', border: '1px solid #222', color: '#fff', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 700 }}
              />
            </div>
          </div>

          {/* DETAILED PROPERTIES */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#888', display: 'block', marginBottom: '8px', fontWeight: 700 }}>
                COLOR
              </label>
              <input
                type="text"
                placeholder="Charcoal Black"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ width: '100%', padding: '14px', background: '#050505', border: '1px solid #222', color: '#fff', borderRadius: '6px', fontSize: '0.9rem' }}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#888', display: 'block', marginBottom: '8px', fontWeight: 700 }}>
                BADGE / LABEL
              </label>
              <input
                type="text"
                placeholder="NEW DROP / SOLD OUT"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                style={{ width: '100%', padding: '14px', background: '#050505', border: '1px solid #222', color: '#fff', borderRadius: '6px', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#888', display: 'block', marginBottom: '8px', fontWeight: 700 }}>
                FABRIC METADATA
              </label>
              <input
                type="text"
                placeholder="100% Premium Egyptian Cotton"
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                style={{ width: '100%', padding: '14px', background: '#050505', border: '1px solid #222', color: '#fff', borderRadius: '6px', fontSize: '0.9rem' }}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#888', display: 'block', marginBottom: '8px', fontWeight: 700 }}>
                FIT METADATA
              </label>
              <input
                type="text"
                placeholder="Cinematic Oversized Fit"
                value={fit}
                onChange={(e) => setFit(e.target.value)}
                style={{ width: '100%', padding: '14px', background: '#050505', border: '1px solid #222', color: '#fff', borderRadius: '6px', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#888', display: 'block', marginBottom: '8px', fontWeight: 700 }}>
              DESCRIPTION
            </label>
            <textarea
              rows={4}
              placeholder="Describe the product drop in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', padding: '14px', background: '#050505', border: '1px solid #222', color: '#fff', borderRadius: '6px', fontSize: '0.9rem', resize: 'none' }}
            />
          </div>

          {/* INSTAGRAM-STYLE IMAGE UPLOADER & LIST */}
          <div style={{ border: '1px solid #222', padding: '20px', borderRadius: '6px', background: '#050505', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#fff', fontWeight: 900, display: 'block' }}>
              📸 INSTAGRAM-STYLE PHOTO SLIDER (UNLIMITED)
            </label>

            {/* Existing Images Grid */}
            {imagesList.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '12px', borderBottom: '1px solid #222', paddingBottom: '15px' }}>
                {imagesList.map((imgUrl, idx) => (
                  <div key={idx} style={{ position: 'relative', aspectRatio: '3/4', border: '1px solid #333', borderRadius: '4px', overflow: 'hidden' }}>
                    <img src={imgUrl} alt={`Staged ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'rgba(255, 50, 50, 0.9)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '0.7rem'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Inputs & Add Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Paste direct photo URL..."
                  value={manualImageUrl}
                  onChange={(e) => setManualImageUrl(e.target.value)}
                  style={{ flex: 1, padding: '10px 12px', background: '#0d0d0d', border: '1px solid #222', color: '#fff', borderRadius: '4px', fontSize: '0.85rem' }}
                />
                <button
                  type="button"
                  onClick={handleAddManualUrl}
                  style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '10px 16px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ADD URL
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{
                  padding: '12px 20px',
                  background: '#ffffff',
                  color: '#000',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 0 10px rgba(255,255,255,0.1)'
                }}>
                  <Plus size={16} /> UPLOAD PHOTO(S)
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUploadImages}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* STATUS */}
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#888', display: 'block', marginBottom: '8px', fontWeight: 700 }}>
              STATUS
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ width: '100%', padding: '14px', background: '#050505', border: '1px solid #222', color: '#fff', borderRadius: '6px', fontSize: '0.9rem' }}
            >
              <option value="Active">Active</option>
              <option value="Hidden">Hidden</option>
            </select>
          </div>

          {uploadProgress && (
            <p style={{ color: '#b8ff00', fontSize: '0.8rem', margin: 0, fontWeight: 'bold', fontFamily: 'monospace' }}>{uploadProgress}</p>
          )}

          {/* ACTIONS */}
          <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '14px 28px',
                background: '#ffffff',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 800,
                fontSize: '0.85rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: '0 0 15px rgba(255,255,255,0.2)'
              }}
            >
              {loading ? 'SAVING...' : 'SAVE PRODUCT'}
            </button>

            <Link
              href="/stormy/products"
              style={{
                padding: '14px 28px',
                background: 'transparent',
                border: '1px solid #222',
                color: '#888',
                borderRadius: '4px',
                fontWeight: 700,
                fontSize: '0.85rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              CANCEL
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
}
