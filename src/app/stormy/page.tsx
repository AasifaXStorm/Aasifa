'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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
      const { data: ordersData, error: ordError } = await supabase
        .from('orders')
        .select('*');

      if (ordError) throw ordError;

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
            <div className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', background: '#121212', border: '1px solid #1a1a1a', borderRadius: '4px' }}>
              <div style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid #222', borderRadius: '4px' }}>
                <DollarSign size={24} style={{ color: '#22c55e' }} />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', color: '#555', textTransform: 'uppercase' }}>Total Revenue</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#fff' }}>{stats.revenue.toLocaleString()} EGP</span>
              </div>
            </div>

            {/* Orders card */}
            <div className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', background: '#121212', border: '1px solid #1a1a1a', borderRadius: '4px' }}>
              <div style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid #222', borderRadius: '4px' }}>
                <ShoppingBag size={24} style={{ color: '#3b82f6' }} />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', color: '#555', textTransform: 'uppercase' }}>Total Orders</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#fff' }}>{stats.ordersCount}</span>
              </div>
            </div>

            {/* Units sold card */}
            <div className="glass-panel" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', background: '#121212', border: '1px solid #1a1a1a', borderRadius: '4px' }}>
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
          <div className="glass-panel" style={{ padding: '30px', marginBottom: '50px', background: '#121212', border: '1px solid #1a1a1a', borderRadius: '4px' }}>
            <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
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
