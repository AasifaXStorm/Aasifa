'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/AdminSidebar';

export function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
    </div>
  );
}
