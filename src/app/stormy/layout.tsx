import type { Metadata } from 'next';

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
    <div style={{ background: '#030303', minHeight: '100vh' }}>
      {children}
    </div>
  );
}
