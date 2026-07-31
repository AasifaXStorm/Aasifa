'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Upload, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Product } from '@/components/ProductCard';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const router = useRouter();
  const { id } = use(params); // resolve params Promise using React's use hook on client

  const [sessionChecked, setSessionChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
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

  // Existing product images
  const [existingImages, setExistingImages] = useState<string[]>([]);
  // Newly selected files to upload
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState(''); 
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/admin/login');
        return;
      }
      setSessionChecked(true);
      await fetchProductData();
    };

    checkAuthAndLoad();
  }, [id, router]);

  const fetchProductData = async () => {
    setFetching(true);
    setErrorMsg(null);
    try {
      const { data: product, error } = await supabase
        .from('products')
        .select('*, product_variants(*)')
        .eq('id', id)
        .single();

      if (error || !product) {
        throw error || new Error('Product not found.');
      }

      setName(product.name);
      setDescription(product.description || '');
      setPrice(product.price.toString());
      setCategory(product.category || 'Shirts');
      setExistingImages(product.images || []);

      // Populate variants
      const variants = product.product_variants || [];
      const sVar = variants.find((v: any) => v.size === 'S');
      const mVar = variants.find((v: any) => v.size === 'M');
      const lVar = variants.find((v: any) => v.size === 'L');
      const xlVar = variants.find((v: any) => v.size === 'XL');
      const xxlVar = variants.find((v: any) => v.size === 'XXL');

      if (sVar) setStockS(sVar.stock_quantity.toString());
      if (mVar) setStockM(mVar.stock_quantity.toString());
      if (lVar) setStockL(lVar.stock_quantity.toString());
      if (xlVar) setStockXL(xlVar.stock_quantity.toString());
      if (xxlVar) setStockXXL(xxlVar.stock_quantity.toString());

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to fetch product data.');
    } finally {
      setFetching(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImageFiles(Array.from(e.target.files));
    }
  };

  const handleRemoveExistingImage = (idx: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price.trim()) {
      setErrorMsg('Product name and price are required.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setUploadProgress('Starting product update...');

    try {
      const finalImagesList = [...existingImages];

      // 1. Upload files to Supabase Storage if files selected
      if (newImageFiles.length > 0) {
        setUploadProgress(`Uploading ${newImageFiles.length} file(s)...`);
        for (let i = 0; i < newImageFiles.length; i++) {
          const file = newImageFiles[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `products/${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, file);

          if (uploadError) {
            console.error('File upload error:', uploadError);
            throw new Error(`Failed to upload file "${file.name}": ${uploadError.message}. Make sure your bucket is set up.`);
          }

          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);

          finalImagesList.push(publicUrl);
        }
      }

      // Add text input URLs
      if (imageUrlInput.trim()) {
        const urls = imageUrlInput
          .split(',')
          .map(u => u.trim())
          .filter(u => u.length > 0);
        finalImagesList.push(...urls);
      }

      // Ensure at least one image exists
      if (finalImagesList.length === 0) {
        finalImagesList.push('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80');
      }

      setUploadProgress('Updating product details...');

      // 2. Update product
      const { error: prodError } = await supabase
        .from('products')
        .update({
          name,
          description,
          price: parseFloat(price),
          category,
          images: finalImagesList
        })
        .eq('id', id);

      if (prodError) throw prodError;

      setUploadProgress('Updating size variants stock...');

      // 3. Upsert variants
      const variantsToUpsert = [
        { size: 'S', stock: parseInt(stockS) || 0 },
        { size: 'M', stock: parseInt(stockM) || 0 },
        { size: 'L', stock: parseInt(stockL) || 0 },
        { size: 'XL', stock: parseInt(stockXL) || 0 },
        { size: 'XXL', stock: parseInt(stockXXL) || 0 },
      ].map(v => ({
        product_id: id,
        size: v.size,
        stock_quantity: v.stock
      }));

      const { error: variantError } = await supabase
        .from('product_variants')
        .upsert(variantsToUpsert, { onConflict: 'product_id, size' });

      if (variantError) throw variantError;

      setUploadProgress('Success!');
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An unexpected error occurred during update.');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete product "${name}"?`)) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        if (error.message.includes('violates foreign key constraint')) {
          alert('Cannot delete this product because it is referenced in past orders. Please set all size variant stock quantities to 0 instead to deactivate.');
          setLoading(false);
        } else {
          throw error;
        }
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to delete product.');
      setLoading(false);
    }
  };

  if (!sessionChecked || fetching) {
    return (
      <div style={{ background: '#030303', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888' }}>{fetching ? 'Fetching product info...' : 'Checking session...'}</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#030303', minHeight: '100vh', padding: '40px 5%' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Back Link */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
          <Link href="/admin" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#888888',
            fontSize: '0.85rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <button
            onClick={handleDelete}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#ff4444',
              fontSize: '0.85rem',
              fontWeight: 'bold',
            }}
          >
            <Trash2 size={16} /> Delete Product
          </button>
        </div>

        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '35px' }}>
          Edit Product: {name}
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
                placeholder="Describe this piece..."
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

            {/* Existing image list with delete option */}
            {existingImages.length > 0 && (
              <div>
                <label className="form-label">Current Images</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                  {existingImages.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '70px', height: '90px', border: '1px solid #222' }}>
                      <img src={img} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(idx)}
                        style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          background: 'rgba(0,0,0,0.8)',
                          color: '#ff4444',
                          border: 'none',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.65rem',
                          cursor: 'pointer',
                          padding: 0
                        }}
                        title="Remove image reference"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Option A: Upload files */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Upload Additional Images</label>
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
                  {newImageFiles.length > 0 
                    ? `${newImageFiles.length} file(s) selected: ${newImageFiles.map(f => f.name).join(', ')}`
                    : 'Select new image files to append'
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
                Or Append Image URLs (Comma separated links)
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
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>

        </form>
      </div>

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
