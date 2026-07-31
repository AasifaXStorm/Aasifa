import type { Metadata } from 'next';
import { AdminSidebar } from '@/components/AdminSidebar';

export const metadata: Metadata = {
  title: 'Aasifa | Portal Access',
  description: 'Internal administration panel.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="admin-layout" style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <AdminSidebar />
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
