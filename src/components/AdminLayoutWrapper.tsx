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
      gridTemplateColumns: '240px 1fr',
      minHeight: '100vh',
      background: '#050505',
      color: '#f5f5f5',
      fontFamily: 'monospace'
    }}>
      <AdminSidebar />
      <main style={{ padding: '40px 5%', overflowY: 'auto', maxHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
