'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data: ordersData, error: ordError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordError) throw ordError;

      setOrders(ordersData || []);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
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
        const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
        setOrders(updatedOrders);
      }
    } catch (err: any) {
      console.error(err);
      alert('An error occurred while updating the order status.');
    }
  };

  return (
    <div style={{ padding: '40px 5%', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '30px', letterSpacing: '0.05em', color: '#fff' }}>
        RECENT ORDERS
      </h1>

      {errorMsg && (
        <div style={{ padding: '15px', background: 'rgba(255,0,0,0.05)', border: '1px solid #ff3333', color: '#ffaaaa', marginBottom: '30px', fontSize: '0.9rem' }}>
          {errorMsg}
        </div>
      )}

      {loading ? (
        <p style={{ color: '#888', textAlign: 'center', marginTop: '50px' }}>Loading orders...</p>
      ) : orders.length === 0 ? (
        <div style={{ padding: '40px', background: '#121212', border: '1px solid #1a1a1a', textAlign: 'center', color: '#666', borderRadius: '4px' }}>
          No orders placed yet.
        </div>
      ) : (
        <div className="glass-panel" style={{ overflowX: 'auto', border: '1px solid #1a1a1a', background: '#121212', borderRadius: '4px' }}>
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
                <tr key={o.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ padding: '15px', fontFamily: 'monospace', color: '#888', fontSize: '0.8rem' }}>{o.id}</td>
                  <td style={{ padding: '15px', color: '#bbb' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ display: 'block', fontWeight: 600, color: '#fff' }}>{o.customer_name}</span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#555' }}>{o.customer_email}</span>
                  </td>
                  <td style={{ padding: '15px', fontWeight: 600, color: '#fff' }}>{o.total_amount} EGP</td>
                  <td style={{ padding: '15px' }}>
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
                        borderRadius: '4px'
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
  );
}
