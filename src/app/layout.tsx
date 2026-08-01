import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { LanguageProvider } from "@/context/LanguageContext";

import { BottomLeftLightningBolt } from "@/components/BottomLeftLightningBolt";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Aasifa | Premium Streetwear",
  description: "Exclusive oversized streetwear drops from Egypt.",
  metadataBase: new URL("https://aasifa.vercel.app"),
  robots: {
    index: true,
    follow: true,
  },
};

const BACKGROUND_BOLTS = [
  { top: '12%', left: '4%', right: undefined, size: 100, opacity: 0.06, rotate: 15, flicker: false },
  { top: '38%', left: undefined, right: '6%', size: 140, opacity: 0.09, rotate: -20, flicker: true },
  { top: '65%', left: '8%', right: undefined, size: 90, opacity: 0.05, rotate: 10, flicker: false },
  { top: '22%', left: undefined, right: '12%', size: 80, opacity: 0.08, rotate: 35, flicker: false },
  { top: '55%', left: '3%', right: undefined, size: 120, opacity: 0.07, rotate: -15, flicker: false },
  { top: '80%', left: undefined, right: '5%', size: 110, opacity: 0.11, rotate: 25, flicker: true },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", background: 'var(--bg-base)' }}>
        <div className="cinematic-noise" />
        <LanguageProvider>
          <Navigation />
          <main style={{ flex: 1, display: "flex", flexDirection: "column", position: 'relative', zIndex: 1 }}>
            {children}
          </main>
          <Footer />
          <BottomLeftLightningBolt />

          {/* Scattered Background Lightning Bolts (Subtle Background Texture) */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
            {BACKGROUND_BOLTS.map((bolt, idx) => (
              <div
                key={idx}
                className={bolt.flicker ? 'distant-flicker-bolt' : ''}
                style={{
                  position: 'absolute',
                  top: bolt.top,
                  left: bolt.left,
                  right: bolt.right,
                  width: `${bolt.size}px`,
                  height: `${bolt.size}px`,
                  opacity: bolt.opacity,
                  transform: `rotate(${bolt.rotate}deg)`,
                  color: 'var(--accent)',
                }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
            ))}
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
