'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/AdminSidebar';

export function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If on the login page, render children without the grid layout or sidebar
  if (pathname === '/stormy/login') {
    return <>{children}</>;
  }

  return (
    <div className="admin-layout" style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <AdminSidebar />
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
