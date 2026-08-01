'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { uploadImageAction, saveProduct } from '@/app/actions/supabaseActions';
import { ArrowLeft, Upload, Loader2, Image as ImageIcon } from 'lucide-react';

export default function NewProductPage() {
  const router = useRouter();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Shirts');
  
  // Sizing stock state
  const [stockS, setStockS] = useState('0');
  const [stockM, setStockM] = useState('0');
  const [stockL, setStockL] = useState('0');
  const [stockXL, setStockXL] = useState('0');
  const [stockXXL, setStockXXL] = useState('0');

  // Image handling
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState(''); // Text fallback URLs
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  useEffect(() => {
    // Session is validated server-side by Next.js middleware
    setSessionChecked(true);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price.trim()) {
      setErrorMsg('Product name and price are required.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setUploadProgress('Starting product creation...');

    try {
      const uploadedUrls: string[] = [];

      // 1. Upload files to Supabase Storage if files selected
      if (imageFiles.length > 0) {
        setUploadProgress(`Uploading ${imageFiles.length} file(s)...`);
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `products/${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;

          const formData = new FormData();
          formData.append('file', file);
          formData.append('filePath', fileName);

          const publicUrl = await uploadImageAction(formData);
          uploadedUrls.push(publicUrl);
        }
      }

      // Add text fallback URLs if provided
      if (imageUrlInput.trim()) {
        const urls = imageUrlInput
          .split(',')
          .map(u => u.trim())
          .filter(u => u.length > 0);
        uploadedUrls.push(...urls);
      }

      // If no images uploaded or provided, add a default unsplash fallback
      if (uploadedUrls.length === 0) {
        uploadedUrls.push('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80');
      }

      setUploadProgress('Saving product details...');

      const productData = {
        name,
        description,
        price: parseFloat(price),
        category,
        images: uploadedUrls,
        is_active: true
      };

      const variantsToInsert = [
        { size: 'S', stock_quantity: parseInt(stockS) || 0 },
        { size: 'M', stock_quantity: parseInt(stockM) || 0 },
        { size: 'L', stock_quantity: parseInt(stockL) || 0 },
        { size: 'XL', stock_quantity: parseInt(stockXL) || 0 },
        { size: 'XXL', stock_quantity: parseInt(stockXXL) || 0 },
      ];

      await saveProduct(productData, variantsToInsert, true);

      setUploadProgress('Success!');
      router.push('/stormy');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An unexpected error occurred during creation.');
      setLoading(false);
    }
  };

  if (!sessionChecked) {
    return (
      <div style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888' }}>Verifying authorization...</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', padding: '40px 5%' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Back Link */}
        <Link href="/stormy" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: '#888888',
          fontSize: '0.85rem',
          marginBottom: '35px',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '35px' }}>
          Add New Product
        </h1>

        {errorMsg && (
          <div style={{ padding: '15px', background: 'rgba(255,0,0,0.05)', border: '1px solid #ff3333', color: '#ffaaaa', marginBottom: '30px', fontSize: '0.9rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '40px 30px', border: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Main Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888', borderBottom: '1px solid #121212', paddingBottom: '10px' }}>
              General Information
            </h3>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Storm Drop-Shoulder Tee"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Price (EGP) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  className="form-input"
                  placeholder="950"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={loading}
                >
                  <option value="Shirts">Shirts</option>
                  <option value="Hoodies">Hoodies</option>
                  <option value="Pants">Pants</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Description</label>
              <textarea
                rows={5}
                className="form-textarea"
                placeholder="Describe this piece (cuts, sizing, washing instructions)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                style={{ resize: 'none' }}
              />
            </div>
          </div>

          {/* Size Inventory */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888', borderBottom: '1px solid #121212', paddingBottom: '10px' }}>
              Stock Inventory per Size
            </h3>

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {[
                { label: 'S', state: stockS, setter: setStockS },
                { label: 'M', state: stockM, setter: setStockM },
                { label: 'L', state: stockL, setter: setStockL },
                { label: 'XL', state: stockXL, setter: setStockXL },
                { label: 'XXL', state: stockXXL, setter: setStockXXL },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', flexDirection: 'column', width: '90px', gap: '8px' }}>
                  <label style={{ fontSize: '0.8rem', color: '#555', textAlign: 'center', fontWeight: 'bold' }}>{s.label}</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={s.state}
                    onChange={(e) => s.setter(e.target.value)}
                    disabled={loading}
                    style={{ textAlign: 'center' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Image Handling */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888', borderBottom: '1px solid #121212', paddingBottom: '10px' }}>
              Images
            </h3>

            {/* Option A: Upload files */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Upload Product Images (To Supabase Storage)</label>
              <div style={{
                border: '1px dashed #222',
                background: 'rgba(15,15,15,0.4)',
                padding: '30px 20px',
                textAlign: 'center',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}>
                <Upload size={24} style={{ color: '#555' }} />
                <span style={{ fontSize: '0.85rem', color: '#888' }}>
                  {imageFiles.length > 0 
                    ? `${imageFiles.length} file(s) selected: ${imageFiles.map(f => f.name).join(', ')}`
                    : 'Select image files (JPG, PNG, WEBP)'
                  }
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={loading}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                  }}
                />
              </div>
            </div>

            {/* Option B: Fallback URL text */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">
                Or Provide Image URLs (Comma separated links fallback)
              </label>
              <div style={{ position: 'relative' }}>
                <ImageIcon size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  disabled={loading}
                  style={{ paddingLeft: '42px' }}
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: '#444', display: 'block', marginTop: '6px' }}>
                Use this if you haven&rsquo;t configured the storage bucket yet. Leave empty to fallback to a placeholder shirt.
              </span>
            </div>
          </div>

          {/* Submit */}
          <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#888', fontSize: '0.85rem' }}>
              {loading && (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{uploadProgress}</span>
                </>
              )}
            </div>
            <button
              type="submit"
              className="btn-primary"
              style={{ minWidth: '180px', padding: '14px' }}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>

        </form>
      </div>

      {/* Spinner animation keyframe style */}
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
