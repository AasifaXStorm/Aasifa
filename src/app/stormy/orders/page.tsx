'use client';

import React, { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '@/app/actions/supabaseActions';

export default function OrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateOrderStatus(id, status);
      setOrders(orders.map((o: any) => o.id === id ? { ...o, status } : o));
    } catch (e) {
      alert('Failed to update status.');
    }
  };

  const tabs = ['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  const filteredOrders = orders.filter((o: any) => {
    if (activeTab === 'ALL') return true;
    return o.status?.toUpperCase() === activeTab;
  });

  return (
    <div>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '30px' }}>
        ORDERS
      </h1>

      {/* Horizontal Tabs */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '25px' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              background: activeTab === tab ? '#ffffff' : '#0d0d0d',
              color: activeTab === tab ? '#000000' : '#888888',
              border: '1px solid #1a1a1a',
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              letterSpacing: '0.05em'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', padding: '24px', borderRadius: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Search name, phone..."
            style={{
              flex: 1,
              padding: '10px 14px',
              background: '#000',
              border: '1px solid #222',
              color: '#fff',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontFamily: 'monospace'
            }}
          />
          <button style={{ background: '#1a1a1a', border: '1px solid #333', color: '#ccc', padding: '10px 16px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>EXPORT SHIPBLU</button>
          <button style={{ background: '#1a1a1a', border: '1px solid #333', color: '#ccc', padding: '10px 16px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>EXPORT MYLERZ</button>
        </div>

        {loading ? (
          <p style={{ color: '#666' }}>Loading orders...</p>
        ) : filteredOrders.length === 0 ? (
          <p style={{ color: '#444', textAlign: 'center', padding: '20px 0', fontSize: '0.8rem' }}>NO MATCHING ORDERS</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1a1a1a', color: '#666' }}>
                <th style={{ padding: '12px' }}>CUSTOMER</th>
                <th style={{ padding: '12px' }}>CONTACT</th>
                <th style={{ padding: '12px' }}>TOTAL</th>
                <th style={{ padding: '12px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o: any, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #111' }}>
                  <td style={{ padding: '12px', color: '#fff', fontWeight: 'bold' }}>{o.customer_name}</td>
                  <td style={{ padding: '12px', color: '#888' }}>{o.customer_email}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{o.total_amount} EGP</td>
                  <td style={{ padding: '12px' }}>
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      style={{
                        background: '#000',
                        border: '1px solid #333',
                        color: '#fff',
                        padding: '6px',
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        fontSize: '0.75rem'
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
