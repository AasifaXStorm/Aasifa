'use client';

import React, { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '@/app/actions/supabaseActions';

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
      const ordersData = await getOrders();
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
      await updateOrderStatus(orderId, newStatus);
      const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
      setOrders(updatedOrders);
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
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '50px' }}>Loading orders...</p>
      ) : orders.length === 0 ? (
        <div style={{ padding: '40px', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '4px' }}>
          No orders placed yet.
        </div>
      ) : (
        <div className="glass-panel" style={{ overflowX: 'auto', border: '1px solid var(--border-color)', background: 'var(--bg-elevated)', borderRadius: '4px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '15px' }}>Order ID</th>
                <th style={{ padding: '15px' }}>Date</th>
                <th style={{ padding: '15px' }}>Customer</th>
                <th style={{ padding: '15px' }}>Total Amount</th>
                <th style={{ padding: '15px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => {
                const getStatusColor = (s: string) => {
                  if (s === 'completed' || s === 'confirmed') return 'var(--status-confirmed)';
                  if (s === 'shipped') return 'var(--status-shipped)';
                  if (s === 'cancelled') return 'var(--status-cancelled)';
                  return 'var(--status-pending)';
                };
                const statusColor = getStatusColor(o.status);

                return (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '15px', fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{o.id}</td>
                    <td style={{ padding: '15px', color: 'var(--text-muted)' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ display: 'block', fontWeight: 600, color: 'var(--text-primary)' }}>{o.customer_name}</span>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.customer_email}</span>
                    </td>
                    <td style={{ padding: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{o.total_amount} EGP</td>
                    <td style={{ padding: '15px' }}>
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        style={{
                          padding: '6px 10px',
                          background: 'transparent',
                          border: `1px solid ${statusColor}`,
                          color: statusColor,
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          outline: 'none',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          boxShadow: `0 0 10px ${statusColor}40`
                        }}
                      >
                        <option value="pending" style={{ background: 'var(--bg-elevated)', color: 'var(--status-pending)' }}>Pending</option>
                        <option value="confirmed" style={{ background: 'var(--bg-elevated)', color: 'var(--status-confirmed)' }}>Confirmed</option>
                        <option value="shipped" style={{ background: 'var(--bg-elevated)', color: 'var(--status-shipped)' }}>Shipped</option>
                        <option value="completed" style={{ background: 'var(--bg-elevated)', color: 'var(--status-confirmed)' }}>Completed</option>
                        <option value="cancelled" style={{ background: 'var(--bg-elevated)', color: 'var(--status-cancelled)' }}>Cancelled</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
