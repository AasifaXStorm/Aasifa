'use client';

import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '@/app/actions/supabaseActions';

export default function OverviewPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ revenue: 0, ordersCount: 0, unitsSold: 0 });
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { ordersData } = await getDashboardStats();
        const revenue = (ordersData || []).reduce((sum, o) => o.status !== 'cancelled' ? sum + Number(o.total_amount) : sum, 0);
        setStats({
          revenue,
          ordersCount: (ordersData || []).length,
          unitsSold: (ordersData || []).reduce((sum, o) => sum + 1, 0) // Mock count of units sold
        });
        setOrders((ordersData || []).slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const cards = [
    { title: 'TOTAL ORDERS', value: stats.ordersCount, sub: 'ALL TIME' },
    { title: 'REVENUE', value: `${stats.revenue} EGP`, sub: 'EGP BEFORE SHIPPING' },
    { title: 'PENDING', value: '0', sub: 'AWAITING FULFILLMENT' },
    { title: 'UNITS SOLD', value: stats.unitsSold, sub: 'ACROSS ALL PRODUCTS' }
  ];

  return (
    <div>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '30px' }}>
        OVERVIEW
      </h1>

      {loading ? (
        <p style={{ color: '#666' }}>Loading metrics...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Row of Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {cards.map((card, idx) => (
              <div key={idx} style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', padding: '24px', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.65rem', color: '#555', fontWeight: 800, letterSpacing: '0.1em', display: 'block', marginBottom: '10px' }}>
                  {card.title}
                </span>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#fff' }}>
                  {card.value}
                </span>
                <span style={{ fontSize: '0.6rem', color: '#666', fontWeight: 600 }}>
                  {card.sub}
                </span>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', padding: '24px', borderRadius: '6px', minHeight: '240px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#888', display: 'block', marginBottom: '20px' }}>
                SALES TREND (LAST 30 DAYS)
              </span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '150px', borderBottom: '1px solid #222', color: '#333', fontSize: '0.8rem' }}>
                [ Sales Trend Chart Data ]
              </div>
            </div>
            <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', padding: '24px', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#888', display: 'block', marginBottom: '20px' }}>
                SIZE POPULARITY
              </span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '150px', color: '#333', fontSize: '0.8rem' }}>
                [ Size Data Grid ]
              </div>
            </div>
          </div>

          {/* Recent Orders table */}
          <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', padding: '24px', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#888', display: 'block', marginBottom: '20px' }}>
              RECENT ORDERS
            </span>
            {orders.length === 0 ? (
              <p style={{ color: '#444', textAlign: 'center', padding: '20px 0', fontSize: '0.8rem' }}>NO ORDERS FOUND</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1a1a1a', color: '#666' }}>
                    <th style={{ padding: '12px' }}>CUSTOMER</th>
                    <th style={{ padding: '12px' }}>TOTAL</th>
                    <th style={{ padding: '12px' }}>STATUS</th>
                    <th style={{ padding: '12px' }}>DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o: any, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #111' }}>
                      <td style={{ padding: '12px', color: '#fff' }}>{o.customer_name}</td>
                      <td style={{ padding: '12px' }}>{o.total_amount} EGP</td>
                      <td style={{ padding: '12px', textTransform: 'uppercase', color: '#aaa' }}>{o.status}</td>
                      <td style={{ padding: '12px', color: '#666' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
