'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/AdminSidebar';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    // Check if there is a pending toast in localStorage
    if (typeof window !== 'undefined') {
      const pendingToast = localStorage.getItem('storm_pending_toast');
      if (pendingToast) {
        try {
          const parsed = JSON.parse(pendingToast);
          const newToast: Toast = {
            id: crypto.randomUUID(),
            message: parsed.message,
            type: parsed.type || 'success'
          };
          setToasts(prev => [...prev, newToast]);
          setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== newToast.id));
          }, 3500);
        } catch (e) {}
        localStorage.removeItem('storm_pending_toast');
      }
    }

    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type?: 'success' | 'error' | 'info' }>;
      if (customEvent.detail && customEvent.detail.message) {
        const newToast: Toast = {
          id: crypto.randomUUID(),
          message: customEvent.detail.message,
          type: customEvent.detail.type || 'success'
        };
        setToasts(prev => [...prev, newToast]);

        // Auto remove after 3.5 seconds
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== newToast.id));
        }, 3500);
      }
    };

    window.addEventListener('storm_toast', handleToastEvent);
    return () => {
      window.removeEventListener('storm_toast', handleToastEvent);
    };
  }, []);

  if (pathname === '/stormy/login') {
    return <>{children}</>;
  }

  return (
    <div className="admin-layout" style={{ 
      display: 'grid',
      gridTemplateColumns: '260px 1fr',
      minHeight: '100vh',
      background: '#040404',
      color: '#f5f5f5',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <AdminSidebar />
      <main style={{ 
        padding: '50px 5%', 
        overflowY: 'auto', 
        maxHeight: '100vh',
        background: 'radial-gradient(circle at top right, rgba(20,20,20,0.8) 0%, rgba(4,4,4,1) 70%)'
      }}>
        {children}
      </main>

      {/* Floating Toast Containers (Bottom Right) */}
      <div style={{
        position: 'fixed',
        bottom: '25px',
        right: '25px',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none'
      }}>
        {toasts.map(toast => {
          const borderGlowColor = toast.type === 'error' ? 'rgba(255, 50, 50, 0.4)' : toast.type === 'info' ? 'rgba(50, 150, 255, 0.4)' : 'rgba(255, 255, 255, 0.4)';
          const textColor = toast.type === 'error' ? '#ff9999' : toast.type === 'info' ? '#99ccff' : '#ffffff';
          const icon = toast.type === 'error' ? '🛑' : toast.type === 'info' ? 'ℹ️' : '⚡';

          return (
            <div
              key={toast.id}
              style={{
                background: 'rgba(15, 15, 15, 0.95)',
                border: `1px solid ${borderGlowColor}`,
                color: textColor,
                padding: '14px 22px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                boxShadow: `0 8px 32px rgba(0, 0, 0, 0.5), 0 0 15px ${borderGlowColor}`,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                pointerEvents: 'auto',
                minWidth: '220px',
                maxWidth: '350px',
                animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <span>{icon}</span>
              <span style={{ flex: 1 }}>{toast.message}</span>
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
