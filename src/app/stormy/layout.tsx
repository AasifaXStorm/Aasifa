'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminLayoutWrapper } from '@/components/AdminLayoutWrapper';

export default function StormyLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (pathname === '/stormy/login') return;

    const checkAuth = () => {
      const cookies = document.cookie.split(';');
      const sessionCookie = cookies.find(c => c.trim().startsWith('admin_session='));
      if (sessionCookie && sessionCookie.split('=')[1] === 'authenticated') {
        setAuthorized(true);
      } else {
        router.push('/stormy/login');
      }
    };
    checkAuth();
  }, [router, pathname]);

  if (pathname === '/stormy/login') {
    return <>{children}</>;
  }

  if (!authorized) {
    return (
      <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontFamily: 'monospace' }}>
        Authenticating...
      </div>
    );
  }

  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
