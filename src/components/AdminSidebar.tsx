'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { logoutAdmin } from '@/app/actions/auth';

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Don't render sidebar on login page
  if (pathname === '/stormy/login') return null;

  const handleLogout = async () => {
    await logoutAdmin();
    router.push('/stormy/login');
    router.refresh();
  };

  const navLinks = [
    { href: '/stormy', label: 'OVERVIEW', icon: LayoutDashboard },
    { href: '/stormy/products', label: 'PRODUCTS', icon: Package },
    { href: '/stormy/orders', label: 'ORDERS', icon: ShoppingBag },
    { href: '/stormy/tweaks', label: 'TWEAKS', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setMobileOpen(true)}
        style={{
          display: 'none',
          position: 'fixed',
          top: '15px',
          left: '15px',
          zIndex: 40,
          background: '#1a1a1a',
          border: '1px solid #333',
          color: '#fff',
          padding: '8px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
        className="mobile-toggle"
      >
        <Menu size={20} />
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 45
          }}
          className="sidebar-overlay"
        />
      )}

      {/* Sidebar Content */}
      <div 
        className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}
        style={{
          width: '240px',
          background: 'var(--bg-elevated)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 50,
          transition: 'transform 0.3s ease',
        }}
      >
        <div style={{ padding: '30px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.15em', color: 'var(--text-primary)', margin: 0 }}>
              AASIFA<br/>CONSOLE
            </h2>
            <div style={{ color: 'var(--accent)', opacity: 0.9 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
          </div>
          <button 
            className="mobile-close"
            onClick={() => setMobileOpen(false)}
            style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', display: 'none' }}
          >
            <X size={20} />
          </button>
        </div>

        <nav style={{ flex: 1, padding: '20px 0', overflowY: 'auto' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {navLinks.map((link) => {
              const Icon = link.icon;
              // Exact match for overview, prefix match for others
              const isActive = link.href === '/stormy' 
                ? pathname === link.href 
                : pathname.startsWith(link.href);
              
              return (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 20px',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      fontWeight: isActive ? 600 : 400,
                      letterSpacing: '0.05em',
                      borderLeft: `3px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                      background: isActive ? 'var(--accent-glow)' : 'transparent',
                      transition: 'var(--transition-smooth)',
                    }}
                  >
                    <Icon size={18} color={isActive ? 'var(--accent)' : 'var(--text-muted)'} />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link 
            href="/" 
            target="_blank"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#bbb',
              textDecoration: 'none',
              fontSize: '0.8rem',
              padding: '10px',
              borderRadius: '4px',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <ExternalLink size={16} /> View Store
          </Link>
          <button 
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#ff6666',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8rem',
              padding: '10px',
              borderRadius: '4px',
              transition: 'background 0.2s',
              textAlign: 'left',
              width: '100%',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(204,51,51,0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .mobile-toggle {
            display: block !important;
          }
          .mobile-close {
            display: block !important;
          }
          .admin-sidebar {
            transform: translateX(-100%);
          }
          .admin-sidebar.open {
            transform: translateX(0);
          }
          .sidebar-overlay {
            display: block;
          }
        }
      `}</style>
    </>
  );
}
