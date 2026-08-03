'use client';

import React, { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus, deleteOrder, deleteAllOrders } from '@/app/actions/supabaseActions';
import { Trash2 } from 'lucide-react';

export default function OrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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
      window.dispatchEvent(new Event('storm_data_loaded'));
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

  const handleDeleteSingleOrder = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this order?')) return;
    try {
      await deleteOrder(id);
      setOrders(orders.filter(o => o.id !== id));
      window.dispatchEvent(new CustomEvent('storm_toast', { detail: { message: 'Order deleted successfully!', type: 'success' } }));
    } catch (e) {
      alert('Failed to delete order.');
    }
  };

  const handlePurgeAllOrders = async () => {
    if (!confirm('WARNING: Are you sure you want to DELETE ALL ORDERS and reset all test data? This action cannot be undone.')) return;
    try {
      await deleteAllOrders();
      setOrders([]);
      window.dispatchEvent(new CustomEvent('storm_toast', { detail: { message: 'All orders purged successfully!', type: 'success' } }));
    } catch (e) {
      alert('Failed to purge orders.');
    }
  };

  const tabs = ['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'COMPLETED', 'CANCELLED'];

  const filteredOrders = orders.filter((o: any) => {
    const matchesTab = activeTab === 'ALL' || o.status?.toUpperCase() === activeTab;
    const matchesSearch = !searchQuery || 
      (o.customer_name && o.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.customer_email && o.customer_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.id && o.id.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.05em', margin: 0 }}>
          ORDERS
        </h1>
        {orders.length > 0 && (
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
            DELETE ALL ORDERS
          </button>
        )}
      </div>

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
            placeholder="Search customer name, email, order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
          <p style={{ color: '#444', textAlign: 'center', padding: '30px 0', fontSize: '0.8rem' }}>NO MATCHING ORDERS FOUND</p>
        ) : (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1a1a1a', color: '#666' }}>
                  <th style={{ padding: '12px' }}>ORDER ID</th>
                  <th style={{ padding: '12px' }}>CUSTOMER</th>
                  <th style={{ padding: '12px' }}>CONTACT</th>
                  <th style={{ padding: '12px' }}>TOTAL</th>
                  <th style={{ padding: '12px' }}>STATUS</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o: any, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #111' }}>
                    <td style={{ padding: '12px', color: '#aaa', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      #{o.id.split('-')[0].toUpperCase()}
                    </td>
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
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteSingleOrder(o.id)}
                        title="Delete Order"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#666666',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = '#ff4444'}
                        onMouseOut={(e) => e.currentTarget.style.color = '#666666'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

