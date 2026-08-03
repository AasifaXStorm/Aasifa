'use client';

import React, { useState, useEffect } from 'react';
import { getDashboardStats, getProducts, deleteOrder, deleteAllOrders } from '@/app/actions/supabaseActions';
import { Trash2 } from 'lucide-react';

export default function OverviewPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ revenue: 0, ordersCount: 0, unitsSold: 0, pendingCount: 0 });
  const [orders, setOrders] = useState<any[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
  const [sizePopularity, setSizePopularity] = useState<Record<string, number>>({});
  const [salesTrend, setSalesTrend] = useState<{ day: string; amount: number }[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { ordersData, itemsData } = await getDashboardStats();
      const productsData = await getProducts();

      // Calculate general stats
      const activeOrders = (ordersData || []).filter(o => o.status !== 'cancelled');
      const revenue = activeOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
      const unitsSold = (itemsData || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
      const pendingCount = (ordersData || []).filter(o => o.status === 'pending').length;

      setStats({
        revenue,
        ordersCount: (ordersData || []).length,
        unitsSold,
        pendingCount
      });

      setOrders((ordersData || []).slice(0, 8));

      // Calculate low stock alerts (stock <= 5)
      const lowStock: any[] = [];
      (productsData || []).forEach((prod: any) => {
        (prod.product_variants || []).forEach((variant: any) => {
          if (variant.stock_quantity <= 5) {
            lowStock.push({
              productName: prod.name,
              size: variant.size,
              stock: variant.stock_quantity
            });
          }
        });
      });
      setLowStockAlerts(lowStock.slice(0, 6));

      // Calculate size popularity
      const sizes: Record<string, number> = {};
      (itemsData || []).forEach((item: any) => {
        const sz = item.product_variants?.size || 'Unknown';
        sizes[sz] = (sizes[sz] || 0) + (item.quantity || 0);
      });
      setSizePopularity(sizes);

      // Calculate sales trend for the last 7 days
      const trendMap: Record<string, number> = {};
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        trendMap[dateStr] = 0;
      }

      activeOrders.forEach(o => {
        const dateStr = new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (trendMap[dateStr] !== undefined) {
          trendMap[dateStr] += Number(o.total_amount);
        }
      });

      const trendList = Object.entries(trendMap).map(([day, amount]) => ({ day, amount }));
      setSalesTrend(trendList);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      window.dispatchEvent(new Event('storm_data_loaded'));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteSingleOrder = async (id: string) => {
    if (!confirm('Permanently delete this order?')) return;
    try {
      await deleteOrder(id);
      await loadData();
      window.dispatchEvent(new CustomEvent('storm_toast', { detail: { message: 'Order deleted!', type: 'success' } }));
    } catch (e) {
      alert('Failed to delete order.');
    }
  };

  const handlePurgeAllOrders = async () => {
    if (!confirm('WARNING: Are you sure you want to DELETE ALL ORDERS and reset statistics?')) return;
    try {
      await deleteAllOrders();
      await loadData();
      window.dispatchEvent(new CustomEvent('storm_toast', { detail: { message: 'All orders purged!', type: 'success' } }));
    } catch (e) {
      alert('Failed to purge orders.');
    }
  };

  const cards = [
    { title: 'TOTAL ORDERS', value: stats.ordersCount, sub: 'ALL TIME' },
    { title: 'REVENUE', value: `${stats.revenue.toLocaleString()} EGP`, sub: 'ACTIVE ORDERS' },
    { title: 'PENDING', value: stats.pendingCount, sub: 'AWAITING FULFILLMENT' },
    { title: 'UNITS SOLD', value: stats.unitsSold, sub: 'TOTAL ITEMS PURCHASED' }
  ];

  const maxSale = Math.max(...salesTrend.map(s => s.amount), 1);
  const maxSizeCount = Math.max(...Object.values(sizePopularity), 1);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '0.05em', margin: 0 }}>
          OVERVIEW
        </h1>
        {stats.ordersCount > 0 && (
          <button
            onClick={handlePurgeAllOrders}
            style={{
              background: 'rgba(255, 50, 50, 0.1)',
              border: '1px solid #ff3333',
              color: '#ffaaaa',
              padding: '8px 16px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              letterSpacing: '0.05em'
            }}
          >
            PURGE ALL ORDERS
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ color: '#666', fontFamily: 'monospace' }}>Loading metrics...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Row of Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {cards.map((card, idx) => (
              <div key={idx} style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', padding: '24px', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.7rem', color: '#666', fontWeight: 800, letterSpacing: '0.1em', display: 'block', marginBottom: '10px' }}>
                  {card.title}
                </span>
                <span style={{ fontSize: '1.8rem', fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#fff', letterSpacing: '-0.02em' }}>
                  {card.value}
                </span>
                <span style={{ fontSize: '0.65rem', color: '#444', fontWeight: 600, letterSpacing: '0.05em' }}>
                  {card.sub}
                </span>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Sales Trend Chart */}
            <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', padding: '24px', borderRadius: '6px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#888', display: 'block', marginBottom: '25px', letterSpacing: '0.05em' }}>
                DAILY SALES TREND (LAST 7 DAYS)
              </span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '180px', paddingBottom: '10px', borderBottom: '1px solid #1a1a1a', gap: '8px' }}>
                {salesTrend.map((s, idx) => {
                  const pctHeight = (s.amount / maxSale) * 100;
                  return (
                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '0.65rem', color: '#aaa', marginBottom: '6px', fontWeight: 'bold' }}>
                        {s.amount > 0 ? `${(s.amount / 1000).toFixed(1)}k` : ''}
                      </span>
                      <div style={{
                        width: '70%',
                        maxWidth: '24px',
                        height: `${pctHeight}%`,
                        background: '#ffffff',
                        borderRadius: '2px 2px 0 0',
                        transition: 'height 0.4s ease-out',
                        boxShadow: '0 0 10px rgba(255,255,255,0.15)'
                      }} />
                      <span style={{ fontSize: '0.6rem', color: '#555', marginTop: '8px', whiteSpace: 'nowrap' }}>
                        {s.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Size Popularity List */}
            <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', padding: '24px', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#888', display: 'block', marginBottom: '20px', letterSpacing: '0.05em' }}>
                SIZE POPULARITY (ITEMS SOLD)
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
                {Object.keys(sizePopularity).length === 0 ? (
                  <p style={{ color: '#444', fontSize: '0.8rem', textAlign: 'center', padding: '40px 0' }}>NO SALES DATA AVAILABLE</p>
                ) : (
                  Object.entries(sizePopularity)
                    .sort((a, b) => b[1] - a[1])
                    .map(([size, count], idx) => {
                      const pct = (count / maxSizeCount) * 100;
                      return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            <span style={{ color: '#fff' }}>{size}</span>
                            <span style={{ color: '#888' }}>{count} sold</span>
                          </div>
                          <div style={{ width: '100%', height: '8px', background: '#111', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: '#fff', borderRadius: '4px' }} />
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>

          {/* Low Stock & Recent Orders Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            
            {/* Low Stock Alerts */}
            <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', padding: '24px', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ff5555', letterSpacing: '0.05em' }}>
                  ⚠️ LOW STOCK ALERTS (≤ 5)
                </span>
              </div>
              {lowStockAlerts.length === 0 ? (
                <p style={{ color: '#444', fontSize: '0.8rem', padding: '20px 0', textAlign: 'center' }}>ALL STOCK QUANTITIES NORMAL</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {lowStockAlerts.map((alert, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#070707', border: '1px solid #151515', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 'bold' }}>{alert.productName}</span>
                        <span style={{ fontSize: '0.65rem', color: '#666' }}>Size: {alert.size}</span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: alert.stock === 0 ? '#ff3333' : '#ff9900', fontWeight: 'bold' }}>
                        {alert.stock === 0 ? 'OUT OF STOCK' : `${alert.stock} LEFT`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Orders table */}
            <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', padding: '24px', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#888', display: 'block', marginBottom: '20px', letterSpacing: '0.05em' }}>
                RECENT ORDERS
              </span>
              {orders.length === 0 ? (
                <p style={{ color: '#444', textAlign: 'center', padding: '20px 0', fontSize: '0.8rem' }}>NO ORDERS FOUND</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1a1a1a', color: '#666' }}>
                      <th style={{ padding: '10px 8px' }}>ORDER ID</th>
                      <th style={{ padding: '10px 8px' }}>CUSTOMER</th>
                      <th style={{ padding: '10px 8px' }}>TOTAL</th>
                      <th style={{ padding: '10px 8px' }}>STATUS</th>
                      <th style={{ padding: '10px 8px', textAlign: 'center' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o: any, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #111' }}>
                        <td style={{ padding: '10px 8px', color: '#aaa', fontFamily: 'monospace', fontSize: '0.7rem' }}>
                          #{o.id.split('-')[0].toUpperCase()}
                        </td>
                        <td style={{ padding: '10px 8px', color: '#fff', fontWeight: 'bold' }}>{o.customer_name}</td>
                        <td style={{ padding: '10px 8px' }}>{Number(o.total_amount).toLocaleString()} EGP</td>
                        <td style={{ padding: '10px 8px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '3px',
                            fontSize: '0.65rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            background: o.status === 'cancelled' ? '#222' : o.status === 'completed' ? 'rgba(61,220,132,0.1)' : 'rgba(245,166,35,0.1)',
                            color: o.status === 'cancelled' ? '#888' : o.status === 'completed' ? '#3DDC84' : '#F5A623'
                          }}>
                            {o.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleDeleteSingleOrder(o.id)}
                            title="Delete Order"
                            style={{ background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', padding: 0 }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#ff4444'}
                            onMouseOut={(e) => e.currentTarget.style.color = '#555'}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
