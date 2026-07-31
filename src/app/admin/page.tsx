'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  LogOut, 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink 
} from 'lucide-react';
import { Product } from '@/components/ProductCard';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    revenue: 0,
    ordersCount: 0,
    unitsSold: 0
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/admin/login');
        return;
      }
      
      setSessionChecked(true);
      await loadDashboardData();
    };

    checkAuthAndLoad();
  }, [router]);

  const loadDashboardData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Fetch products and variants
      const { data: productsData, error: prodError } = await supabase
        .from('products')
        .select('*, product_variants(*)')
        .order('created_at', { ascending: false });

      if (prodError) throw prodError;

      // 2. Fetch orders
      const { data: ordersData, error: ordError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordError) throw ordError;

      // 3. Fetch order items (to count units sold)
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('quantity');

      if (itemsError) throw itemsError;

      // Compute statistics
      const revenue = (ordersData || []).reduce((sum, o) => sum + Number(o.total_amount), 0);
      const ordersCount = (ordersData || []).length;
      const unitsSold = (itemsData || []).reduce((sum, item) => sum + item.quantity, 0);

      setProducts(productsData || []);
      setOrders(ordersData || []);
      setStats({ revenue, ordersCount, unitsSold });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete product "${name}"?`)) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        if (error.message.includes('violates foreign key constraint')) {
          alert('Cannot delete this product because it is referenced in past orders. Please update its stock quantities to 0 to deactivate it instead.');
        } else {
          alert(`Error deleting product: ${error.message}`);
        }
      } else {
        // Refresh local state
        setProducts(products.filter(p => p.id !== id));
      }
    } catch (err: any) {
      console.error(err);
      alert('An error occurred while attempting to delete the product.');
    }
  };

  if (!sessionChecked) {
    return (
      <div style={{ background: '#030303', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888' }}>Checking auth session...</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#030303', minHeight: '100vh', padding: '40px 5%' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #1a1a1a',
          paddingBottom: '20px',
          marginBottom: '40px',
        }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Management Console</span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '5px' }}>Aasifa Admin</h1>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <Link href="/" target="_blank" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', fontSize: '0.8rem' }}>
              View Store <ExternalLink size={14} />
            </Link>
            <button 
              onClick={handleLogout} 
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', fontSize: '0.8rem', borderColor: '#cc3333', color: '#ff6666' }}
            >
              Sign Out <LogOut size={14} />
            </button>
          </div>
        </div>

        {errorMsg && (
          <div style={{ padding: '15px', background: 'rgba(255,0,0,0.05)', border: '1px solid #ff3333', color: '#ffaaaa', marginBottom: '30px', fontSize: '0.9rem' }}>
            {errorMsg}
          </div>
        )}

        {/* Stats grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '40px',
        }}>
          {/* Revenue card */}
          <div className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid #222', borderRadius: '4px' }}>
              <DollarSign size={24} style={{ color: '#22c55e' }} />
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.8rem', color: '#555', textTransform: 'uppercase' }}>Total Revenue</span>
              <span style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#fff' }}>{stats.revenue.toLocaleString()} EGP</span>
            </div>
          </div>

          {/* Orders card */}
          <div className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid #222', borderRadius: '4px' }}>
              <ShoppingBag size={24} style={{ color: '#3b82f6' }} />
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.8rem', color: '#555', textTransform: 'uppercase' }}>Total Orders</span>
              <span style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#fff' }}>{stats.ordersCount}</span>
            </div>
          </div>

          {/* Units sold card */}
          <div className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid #222', borderRadius: '4px' }}>
              <Package size={24} style={{ color: '#a855f7' }} />
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.8rem', color: '#555', textTransform: 'uppercase' }}>Units Sold</span>
              <span style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#fff' }}>{stats.unitsSold}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#888', textAlign: 'center' }}>Loading dashboard details...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
            
            {/* Products management section */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Catalog & Stock</h2>
                <Link href="/admin/products/new" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '0.8rem' }}>
                  <Plus size={14} /> Add Product
                </Link>
              </div>

              {products.length === 0 ? (
                <div style={{ padding: '40px', background: '#0a0a0a', border: '1px solid #1a1a1a', textAlign: 'center', color: '#666' }}>
                  No products in database. Click &ldquo;Add Product&rdquo; to create your first apparel listing.
                </div>
              ) : (
                <div className="glass-panel" style={{ overflowX: 'auto', border: '1px solid #1a1a1a' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #222', background: '#0a0a0a', color: '#888' }}>
                        <th style={{ padding: '15px' }}>Image</th>
                        <th style={{ padding: '15px' }}>Product</th>
                        <th style={{ padding: '15px' }}>Category</th>
                        <th style={{ padding: '15px' }}>Price</th>
                        <th style={{ padding: '15px' }}>Sizes & Inventory</th>
                        <th style={{ padding: '15px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => {
                        const firstImg = p.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80';
                        const totalStock = p.product_variants?.reduce((sum, v) => sum + v.stock_quantity, 0) ?? 0;
                        
                        return (
                          <tr key={p.id} style={{ borderBottom: '1px solid #121212', verticalAlign: 'middle' }}>
                            <td style={{ padding: '15px' }}>
                              <img src={firstImg} alt={p.name} style={{ width: '40px', height: '52px', objectFit: 'cover', border: '1px solid #222' }} />
                            </td>
                            <td style={{ padding: '15px', fontWeight: 600, color: '#fff' }}>{p.name}</td>
                            <td style={{ padding: '15px', color: '#888' }}>{p.category}</td>
                            <td style={{ padding: '15px', color: '#fff' }}>{p.price} EGP</td>
                            <td style={{ padding: '15px' }}>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
                                {p.product_variants?.map(v => (
                                  <span key={v.id} style={{ fontSize: '0.75rem', background: '#121212', border: '1px solid #222', padding: '2px 6px', color: v.stock_quantity > 0 ? '#bbb' : '#ff5555' }}>
                                    {v.size}: {v.stock_quantity}
                                  </span>
                                ))}
                              </div>
                              <span style={{ fontSize: '0.75rem', color: totalStock > 0 ? '#22c55e' : '#ff4444' }}>
                                Total Stock: {totalStock}
                              </span>
                            </td>
                            <td style={{ padding: '15px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <Link href={`/admin/products/${p.id}`} style={{ color: '#bbb', padding: '6px' }} title="Edit Product">
                                  <Edit size={16} />
                                </Link>
                                <button onClick={() => handleDeleteProduct(p.id, p.name)} style={{ color: '#888', padding: '6px' }} className="delete-btn-hover" title="Delete Product">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Orders log section */}
            <div>
              <h2 style={{ fontSize: '1.3rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px' }}>Recent Orders</h2>
              
              {orders.length === 0 ? (
                <div style={{ padding: '40px', background: '#0a0a0a', border: '1px solid #1a1a1a', textAlign: 'center', color: '#666' }}>
                  No orders placed yet. Test checkout in the cart.
                </div>
              ) : (
                <div className="glass-panel" style={{ overflowX: 'auto', border: '1px solid #1a1a1a' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #222', background: '#0a0a0a', color: '#888' }}>
                        <th style={{ padding: '15px' }}>Order ID</th>
                        <th style={{ padding: '15px' }}>Date</th>
                        <th style={{ padding: '15px' }}>Customer</th>
                        <th style={{ padding: '15px' }}>Total Amount</th>
                        <th style={{ padding: '15px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id} style={{ borderBottom: '1px solid #121212' }}>
                          <td style={{ padding: '15px', fontFamily: 'monospace', color: '#888', fontSize: '0.8rem' }}>{o.id}</td>
                          <td style={{ padding: '15px', color: '#bbb' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                          <td style={{ padding: '15px' }}>
                            <span style={{ display: 'block', fontWeight: 600, color: '#fff' }}>{o.customer_name}</span>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: '#555' }}>{o.customer_email}</span>
                          </td>
                          <td style={{ padding: '15px', fontWeight: 600, color: '#fff' }}>{o.total_amount} EGP</td>
                          <td style={{ padding: '15px' }}>
                            <span style={{
                              fontSize: '0.75rem',
                              background: o.status === 'completed' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                              border: o.status === 'completed' ? '1px solid #22c55e' : '1px solid #ef4444',
                              color: o.status === 'completed' ? '#22c55e' : '#ef4444',
                              padding: '2px 8px',
                              textTransform: 'uppercase',
                              fontWeight: 'bold',
                            }}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      <style jsx global>{`
        .delete-btn-hover:hover {
          color: #ef4444 !important;
        }
      `}</style>
    </div>
  );
}
