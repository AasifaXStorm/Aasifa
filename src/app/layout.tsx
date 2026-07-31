import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Aasifa | Premium Streetwear",
  description: "Minimalist streetwear inspired by the force of nature. Arabic: عاصفة (meaning storm). Crafted to survive the storm.",
  metadataBase: new URL("https://aasifa.vercel.app"),
  robots: {
    index: true,
    follow: true,
  },
};

import Link from "next/link";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
        <Navigation />
        <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {children}
        </main>
        <Footer />

        {/* Secret bottom-left lightning bolt entry to /stormy */}
        <Link 
          href="/stormy" 
          className="secret-entrance"
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            zIndex: 99999,
            color: '#333333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'var(--transition-smooth)',
          }}
          title="Console"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        </Link>
      </body>
    </html>
  );
}
