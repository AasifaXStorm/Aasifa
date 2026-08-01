import type { Metadata } from 'next';
import { AdminLayoutWrapper } from '@/components/AdminLayoutWrapper';

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
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
