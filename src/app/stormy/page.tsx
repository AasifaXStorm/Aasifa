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
  ExternalLink,
  BarChart3
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
  const [categorySales, setCategorySales] = useState<Record<string, number>>({
    Shirts: 0,
    Hoodies: 0,
    Pants: 0,
    Accessories: 0
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Lightning tweaks state
  const [tweaksInterval, setTweaksInterval] = useState(5000);
  const [tweaksColor, setTweaksColor] = useState('#ffffff');
  const [tweaksGlow, setTweaksGlow] = useState('#e8f4fd');
  const [savingTweaks, setSavingTweaks] = useState(false);

  useEffect(() => {
    // Hardcoded authentication check
    const session = localStorage.getItem('aasifa_admin_session');
    if (session !== 'y.storm1_session') {
      router.push('/stormy/login');
      return;
    }
    
    setSessionChecked(true);
    loadDashboardData();
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

      // 3. Fetch order items with nested product categories to compile analytics
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          quantity,
          unit_price,
          product_variants (
            size,
            products (
              category
            )
          )
        `);

      if (itemsError) throw itemsError;

      // Compute statistics
      const revenue = (ordersData || []).reduce((sum, o) => {
        // Only sum completed orders for revenue, pending/canceled can be excluded or added
        if (o.status !== 'cancelled') {
          return sum + Number(o.total_amount);
        }
        return sum;
      }, 0);
      const ordersCount = (ordersData || []).length;
      
      let unitsSold = 0;
      const salesMap: Record<string, number> = {
        Shirts: 0,
        Hoodies: 0,
        Pants: 0,
        Accessories: 0
      };

      if (itemsData) {
        for (const item of itemsData) {
          unitsSold += item.quantity;
          
          // Traverse relations safely
          const parentVariant = item.product_variants as any;
          const parentProduct = parentVariant?.products;
          const category = parentProduct?.category || 'Shirts';
          const itemRevenue = Number(item.unit_price) * item.quantity;

          if (salesMap[category] !== undefined) {
            salesMap[category] += itemRevenue;
          } else {
            salesMap[category] = itemRevenue;
          }
        }
      }

      // Filter out the configuration record from standard catalog view
      const filteredProds = (productsData || []).filter(p => !p.name.startsWith('_'));
      setProducts(filteredProds);
      setOrders(ordersData || []);
      setStats({ revenue, ordersCount, unitsSold });
      setCategorySales(salesMap);

      // Retrieve existing lightning tweaks configuration
      const configRecord = (productsData || []).find(p => p.name === '_SITE_CONFIG_');
      if (configRecord && configRecord.description) {
        try {
          const parsed = JSON.parse(configRecord.description);
          if (parsed.interval) setTweaksInterval(parsed.interval);
          if (parsed.color) setTweaksColor(parsed.color);
          if (parsed.glow) setTweaksGlow(parsed.glow);
        } catch (e) {
          console.error('Failed parsing site configuration:', e);
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('aasifa_admin_session');
    router.push('/stormy/login');
  };

  const handleSaveTweaks = async () => {
    setSavingTweaks(true);
    try {
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('name', '_SITE_CONFIG_')
        .maybeSingle();

      const configPayload = {
        name: '_SITE_CONFIG_',
        description: JSON.stringify({
          interval: Number(tweaksInterval),
          color: tweaksColor,
          glow: tweaksGlow
        }),
        price: 0,
        category: 'System',
        images: []
      };

      let saveError = null;
      if (existing?.id) {
        const { error } = await supabase
          .from('products')
          .update(configPayload)
          .eq('id', existing.id);
        saveError = error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert(configPayload);
        saveError = error;
      }

      if (saveError) {
        alert(`Error saving tweaks: ${saveError.message}`);
      } else {
        alert('Site tweaks updated successfully!');
      }
    } catch (e: any) {
      console.error(e);
      alert('Failed to save tweaks.');
    } finally {
      setSavingTweaks(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) {
        alert(`Error updating order status: ${error.message}`);
      } else {
        // Update local state to reflect new status
        const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
        setOrders(updatedOrders);

        // Recalculate revenue if order was cancelled or restored
        const revenue = updatedOrders.reduce((sum, o) => {
          if (o.status !== 'cancelled') {
            return sum + Number(o.total_amount);
          }
          return sum;
        }, 0);
        setStats(prev => ({ ...prev, revenue }));
      }
    } catch (err: any) {
      console.error(err);
      alert('An error occurred while updating the order status.');
    }
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
          alert('Cannot delete this product because it is referenced in past orders. Please set all size variant stock quantities to 0 in the editor to deactivate it instead.');
        } else {
          alert(`Error deleting product: ${error.message}`);
        }
      } else {
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

  // Find max value in category sales for chart scaling
  const salesValues = Object.values(categorySales);
  const maxSalesValue = Math.max(...salesValues, 1000); // default minimum scale at 1000 EGP

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
            <span style={{ fontSize: '0.8rem', color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Storm Console</span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '5px', letterSpacing: '0.05em' }}>STORM CONSOLE</h1>
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

        {/* Analytics bar chart section */}
        {!loading && !errorMsg && (
          <div className="glass-panel" style={{ padding: '30px', marginBottom: '50px', border: '1px solid #1a1a1a' }}>
            <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BarChart3 size={18} style={{ color: '#a855f7' }} /> Category Revenue Distribution
            </h3>

            {/* Custom SVG/HTML Bar Chart */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'flex-end',
              height: '200px',
              paddingBottom: '20px',
              borderBottom: '1px solid #222',
            }}>
              {Object.entries(categorySales).map(([category, value]) => {
                const heightPercentage = (value / maxSalesValue) * 100;
                return (
                  <div key={category} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '60px',
                    height: '100%',
                    justifyContent: 'flex-end',
                  }}>
                    {/* Value indicator */}
                    <span style={{ fontSize: '0.75rem', color: '#fff', marginBottom: '8px', fontWeight: 600 }}>
                      {value > 0 ? `${value} EGP` : '—'}
                    </span>
                    {/* Bar */}
                    <div style={{
                      width: '32px',
                      height: `${Math.max(heightPercentage, 2)}%`,
                      background: 'linear-gradient(to top, #1a1a1a 0%, #ffffff 100%)',
                      border: '1px solid #333',
                      boxShadow: '0 0 10px rgba(255,255,255,0.05)',
                      transition: 'height 1s ease',
                    }} />
                    {/* Category Label */}
                    <span style={{ fontSize: '0.75rem', color: '#666', marginTop: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {category}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {loading ? (
          <p style={{ color: '#888', textAlign: 'center' }}>Loading dashboard details...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
            
            {/* Section Tweaks */}
            <div>
              <h2 style={{ fontSize: '1.3rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px' }}>Section Tweaks</h2>
              <div className="glass-panel" style={{ padding: '30px', border: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                  
                  {/* Lightning Interval */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Lightning Interval (milliseconds)</label>
                    <input
                      type="number"
                      min="1000"
                      max="30000"
                      className="form-input"
                      value={tweaksInterval}
                      onChange={(e) => setTweaksInterval(Number(e.target.value))}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#555', marginTop: '5px', display: 'block' }}>
                      How often the lightning strikes. e.g. 5000 = 5 seconds.
                    </span>
                  </div>

                  {/* Core Strike Color */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Lightning Bolt Color</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="color"
                        style={{ width: '40px', height: '40px', padding: 0, border: '1px solid #222', background: 'transparent', cursor: 'pointer' }}
                        value={tweaksColor}
                        onChange={(e) => setTweaksColor(e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-input"
                        value={tweaksColor}
                        onChange={(e) => setTweaksColor(e.target.value)}
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>

                  {/* Glow Color */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Lightning Glow Color</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="color"
                        style={{ width: '40px', height: '40px', padding: 0, border: '1px solid #222', background: 'transparent', cursor: 'pointer' }}
                        value={tweaksGlow}
                        onChange={(e) => setTweaksGlow(e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-input"
                        value={tweaksGlow}
                        onChange={(e) => setTweaksGlow(e.target.value)}
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>

                </div>

                <button
                  onClick={handleSaveTweaks}
                  disabled={savingTweaks}
                  className="btn-primary"
                  style={{ alignSelf: 'flex-start', padding: '10px 25px', fontSize: '0.8rem' }}
                >
                  {savingTweaks ? 'Saving...' : 'Save Tweak Config'}
                </button>
              </div>
            </div>

            {/* Products management section */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Catalog & Stock</h2>
                <Link href="/stormy/products/new" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '0.8rem' }}>
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
                                <Link href={`/stormy/products/${p.id}`} style={{ color: '#bbb', padding: '6px' }} title="Edit Product">
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
                            {/* Order Status Switcher Dropdown */}
                            <select
                              value={o.status}
                              onChange={(e) => handleStatusChange(o.id, e.target.value)}
                              style={{
                                padding: '4px 8px',
                                background: o.status === 'completed' 
                                  ? 'rgba(34,197,94,0.1)' 
                                  : o.status === 'cancelled'
                                    ? 'rgba(239,68,68,0.1)'
                                    : 'rgba(234,179,8,0.1)',
                                border: '1px solid',
                                borderColor: o.status === 'completed' 
                                  ? '#22c55e' 
                                  : o.status === 'cancelled'
                                    ? '#ef4444'
                                    : '#eab308',
                                color: o.status === 'completed' 
                                  ? '#22c55e' 
                                  : o.status === 'cancelled'
                                    ? '#ef4444'
                                    : '#eab308',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                outline: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              <option value="pending" style={{ background: '#0a0a0a', color: '#eab308' }}>Pending</option>
                              <option value="completed" style={{ background: '#0a0a0a', color: '#22c55e' }}>Completed</option>
                              <option value="cancelled" style={{ background: '#0a0a0a', color: '#ef4444' }}>Cancelled</option>
                            </select>
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
