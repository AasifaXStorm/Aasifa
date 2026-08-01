'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { uploadImageAction, saveProduct } from '@/app/actions/supabaseActions';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';

export default function NewProductPage() {
  const router = useRouter();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form fields matching Screenshot 2
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [price, setPrice] = useState('');
  const [badge, setBadge] = useState('');
  const [fabric, setFabric] = useState('');
  const [fit, setFit] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Active');

  // Front & Back image inputs & files
  const [frontImageUrl, setFrontImageUrl] = useState('');
  const [backImageUrl, setBackImageUrl] = useState('');
  const [extraFiles, setExtraFiles] = useState<File[]>([]);

  const handleExtraFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setExtraFiles(prev => [...prev, ...filesArray]);
    }
  };

  useEffect(() => {
    setSessionChecked(true);
  }, []);

  const handleFrontFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFrontFile(file);
      setFrontImageUrl(file.name);
    }
  };

  const handleBackFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBackFile(file);
      setBackImageUrl(file.name);
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

      // Upload Front File
      if (frontFile) {
        setUploadProgress('Uploading front image...');
        const fileExt = frontFile.name.split('.').pop();
        const fileName = `products/front-${Date.now()}.${fileExt}`;
        const formData = new FormData();
        formData.append('file', frontFile);
        formData.append('filePath', fileName);
        const urls = JSON.parse(await uploadImageAction(formData));
        uploadedUrls.push(...urls);
      } else if (frontImageUrl.trim()) {
        uploadedUrls.push(frontImageUrl.trim());
      }

      // Upload extra files (Instagram‑style unlimited photos)
      if (extraFiles.length > 0) {
        setUploadProgress('Uploading extra images...');
        // upload each file individually via the same action
        for (const file of extraFiles) {
          const filePath = `products/extra-${Date.now()}-${crypto.randomUUID()}.${file.name.split('.').pop()}`;
          const singleForm = new FormData();
          singleForm.append('file', file);
          singleForm.append('filePath', filePath);
          const urls = JSON.parse(await uploadImageAction(singleForm));
          uploadedUrls.push(...urls);
        }
      }

      // Upload Back File
      setUploadProgress('Uploading back image...');
      if (backFile) {
        const fileExt = backFile.name.split('.').pop();
        const fileName = `products/back-${Date.now()}.${fileExt}`;
        const formData = new FormData();
        formData.append('file', backFile);
        formData.append('filePath', fileName);
        const urls = JSON.parse(await uploadImageAction(formData));
        uploadedUrls.push(...urls);
      } else if (backImageUrl.trim()) {
        uploadedUrls.push(backImageUrl.trim());
      }

      if (uploadedUrls.length === 0) {
        uploadedUrls.push('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80');
      }

      setUploadProgress('Saving product details...');

      // Combine extra details into description / category
      const fullDescription = `${description}\n\nFabric: ${fabric}\nFit: ${fit}\nColor: ${color}\nBadge: ${badge}`;

      const productData = {
        name,
        description: fullDescription,
        price: parseFloat(price),
        category: 'Shirts',
        images: uploadedUrls,
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
      router.push('/stormy/products');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred during product creation.');
      setLoading(false);
    }
  };

  if (!sessionChecked) {
    return (
      <div style={{ background: '#080808', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#080808', minHeight: '100vh', padding: '40px 5%' }}>
      <div style={{ maxWidth: '650px', margin: '0 auto' }}>
        
        <Link href="/stormy/products" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: '#888',
          fontSize: '0.85rem',
          marginBottom: '25px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          <ArrowLeft size={16} /> Back to Products
        </Link>

        {errorMsg && (
          <div style={{ padding: '15px', background: 'rgba(255,0,0,0.05)', border: '1px solid #ff3333', color: '#ffaaaa', marginBottom: '25px', fontSize: '0.85rem', borderRadius: '4px' }}>
            {errorMsg}
          </div>
        )}

        {/* Modal / Card matching Screenshot 2 */}
        <div style={{
          background: '#111111',
          border: '1px solid #1c1c1c',
          borderRadius: '8px',
          padding: '30px',
          color: '#fff',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
        }}>
          <div style={{ marginBottom: '25px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              ADD PRODUCT
            </h2>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666', marginTop: '4px', display: 'block' }}>
              PRODUCT DETAILS AND DESCRIPTION
            </span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* PRODUCT NAME */}
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', display: 'block', marginBottom: '8px' }}>
                PRODUCT NAME
              </label>
              <input
                type="text"
                required
                placeholder="Onyx Graphic Tee"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#0a0a0a',
                  border: '1px solid #222',
                  color: '#fff',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            {/* COLOR & PRICE */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', display: 'block', marginBottom: '8px' }}>
                  COLOR
                </label>
                <input
                  type="text"
                  placeholder="Onyx Black"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#0a0a0a',
                    border: '1px solid #222',
                    color: '#fff',
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', display: 'block', marginBottom: '8px' }}>
                  PRICE (EGP)
                </label>
                <input
                  type="number"
                  required
                  placeholder="520"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#0a0a0a',
                    border: '1px solid #222',
                    color: '#fff',
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    fontWeight: 700
                  }}
                />
              </div>
            </div>

            {/* PRODUCT BADGE / LABEL */}
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', display: 'block', marginBottom: '8px' }}>
                PRODUCT BADGE / LABEL
              </label>
              <input
                type="text"
                placeholder="e.g. Limited Drop, Collab, 1 of 1"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#0a0a0a',
                  border: '1px solid #222',
                  color: '#fff',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            {/* FABRIC & FIT */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', display: 'block', marginBottom: '8px' }}>
                  FABRIC
                </label>
                <input
                  type="text"
                  placeholder="Heavyweight Cotton"
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#0a0a0a',
                    border: '1px solid #222',
                    color: '#fff',
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', display: 'block', marginBottom: '8px' }}>
                  FIT
                </label>
                <input
                  type="text"
                  placeholder="Premium Oversized"
                  value={fit}
                  onChange={(e) => setFit(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#0a0a0a',
                    border: '1px solid #222',
                    color: '#fff',
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', display: 'block', marginBottom: '8px' }}>
                DESCRIPTION
              </label>
              <textarea
                rows={4}
                placeholder="Describe the product in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#0a0a0a',
                  border: '1px solid #222',
                  color: '#fff',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  resize: 'none'
                }}
              />
            </div>

            {/* FRONT & BACK IMAGE URL + UPLOAD BUTTONS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              
              {/* Front Image */}
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', display: 'block', marginBottom: '8px' }}>
                  FRONT IMAGE URL
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="blackinfront.jpg"
                    value={frontImageUrl}
                    onChange={(e) => setFrontImageUrl(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      background: '#0a0a0a',
                      border: '1px solid #222',
                      color: '#fff',
                      borderRadius: '6px',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem'
                    }}
                  />
                  <label style={{
                    padding: '10px 14px',
                    background: '#1a1a1a',
                    border: '1px solid #333',
                    color: '#ccc',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    UPLOAD
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFrontFileSelect}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              {/* Back Image */}
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', display: 'block', marginBottom: '8px' }}>
                  BACK IMAGE URL
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Blackback.jpg"
                    value={backImageUrl}
                    onChange={(e) => setBackImageUrl(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      background: '#0a0a0a',
                      border: '1px solid #222',
                      color: '#fff',
                      borderRadius: '6px',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem'
                    }}
                  />
                  <label style={{
                    padding: '10px 14px',
                    background: '#1a1a1a',
                    border: '1px solid #333',
                    color: '#ccc',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    UPLOAD
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBackFileSelect}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

            </div>

            {/* STATUS */}
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', display: 'block', marginBottom: '8px' }}>
                STATUS
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#0a0a0a',
                  border: '1px solid #222',
                  color: '#fff',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem'
                }}
              >
                <option value="Active">Active</option>
                <option value="Hidden">Hidden</option>
              </select>
            </div>

            {uploadProgress && (
              <p style={{ color: '#b8ff00', fontSize: '0.8rem', margin: 0 }}>{uploadProgress}</p>
            )}

            {/* BUTTONS MATCHING SCREENSHOT 2 */}
            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '14px 28px',
                  background: '#b8ff00',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  boxShadow: '0 0 15px rgba(184, 255, 0, 0.4)'
                }}
              >
                {loading ? 'SAVING...' : 'SAVE PRODUCT'}
              </button>

              <Link
                href="/stormy/products"
                style={{
                  padding: '14px 28px',
                  background: 'transparent',
                  border: '1px solid #333',
                  color: '#888',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  letterSpacing: '0.1em',
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
    </div>
  );
}
