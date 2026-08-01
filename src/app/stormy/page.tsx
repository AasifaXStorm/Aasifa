'use client';

import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '@/app/actions/supabaseActions';
import { DollarSign, ShoppingBag, Package, BarChart3 } from 'lucide-react';

export default function AdminDashboardPage() {
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

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { ordersData, itemsData } = await getDashboardStats();

      const revenue = (ordersData || []).reduce((sum, o) => {
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

      setStats({ revenue, ordersCount, unitsSold });
      setCategorySales(salesMap);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const salesValues = Object.values(categorySales);
  const maxSalesValue = Math.max(...salesValues, 1000);

  return (
    <div style={{ padding: '40px 5%', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '30px', letterSpacing: '0.05em', color: '#fff' }}>
        DASHBOARD OVERVIEW
      </h1>

      {errorMsg && (
        <div style={{ padding: '15px', background: 'rgba(255,0,0,0.05)', border: '1px solid #ff3333', color: '#ffaaaa', marginBottom: '30px', fontSize: '0.9rem' }}>
          {errorMsg}
        </div>
      )}

      {loading ? (
        <p style={{ color: '#888', textAlign: 'center', marginTop: '50px' }}>Loading overview metrics...</p>
      ) : (
        <>
          {/* Stats grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
            marginBottom: '40px',
          }}>
            {/* Revenue card */}
            <div className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '4px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
              <div style={{ padding: '15px', background: 'var(--accent-glow)', border: `1px solid var(--accent-color)`, borderRadius: '4px' }}>
                <DollarSign size={24} style={{ color: 'var(--accent-color)' }} />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--gray-light)', textTransform: 'uppercase' }}>Total Revenue</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--primary)', textShadow: '0 0 10px var(--accent-glow)' }}>{stats.revenue.toLocaleString()} EGP</span>
              </div>
            </div>

            {/* Orders card */}
            <div className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '4px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
              <div style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-highlight)', borderRadius: '4px' }}>
                <ShoppingBag size={24} style={{ color: 'var(--status-pending)' }} />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--gray-light)', textTransform: 'uppercase' }}>Total Orders</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.ordersCount}</span>
              </div>
            </div>

            {/* Units sold card */}
            <div className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '4px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
              <div style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-highlight)', borderRadius: '4px' }}>
                <Package size={24} style={{ color: 'var(--status-shipped)' }} />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--gray-light)', textTransform: 'uppercase' }}>Units Sold</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.unitsSold}</span>
              </div>
            </div>
          </div>

          {/* Analytics bar chart section */}
          <div className="glass-panel" style={{ padding: '30px', marginBottom: '50px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '4px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}>
              <BarChart3 size={18} style={{ color: 'var(--accent-color)' }} /> Category Revenue Distribution
            </h3>

            {/* Custom SVG/HTML Bar Chart */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'flex-end',
              height: '200px',
              paddingBottom: '20px',
              borderBottom: '1px solid var(--border-color)',
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
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', marginBottom: '8px', fontWeight: 600 }}>
                      {value > 0 ? `${value} EGP` : '—'}
                    </span>
                    {/* Bar */}
                    <div style={{
                      width: '32px',
                      height: `${Math.max(heightPercentage, 2)}%`,
                      background: 'linear-gradient(to top, var(--bg-card) 0%, var(--accent-color) 100%)',
                      border: '1px solid var(--accent-color)',
                      boxShadow: '0 0 15px var(--accent-glow)',
                      transition: 'height 1s ease',
                    }} />
                    {/* Category Label */}
                    <span style={{ fontSize: '0.75rem', color: '#888', marginTop: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {category}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
