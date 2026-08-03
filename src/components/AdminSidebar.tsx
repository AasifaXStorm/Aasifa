'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, ShoppingBag, Tag, Warehouse, 
  Truck, Sliders, Settings, LogOut, Ticket, X
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [syncedTime, setSyncedTime] = useState('Synced 05:04 AM');

  useEffect(() => {
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setSyncedTime(`Synced ${time}`);
  }, []);

  const handleLogout = () => {
    document.cookie = 'admin_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/stormy/login');
  };

  const menuGroups = [
    {
      title: 'STORE',
      items: [
        { name: 'OVERVIEW', href: '/stormy', icon: LayoutDashboard },
        { name: 'ORDERS', href: '/stormy/orders', icon: ShoppingBag },
      ]
    },
    {
      title: 'CATALOG',
      items: [
        { name: 'PRODUCTS', href: '/stormy/products', icon: Tag },
        { name: 'INVENTORY', href: '/stormy/inventory', icon: Warehouse },
      ]
    },
    {
      title: 'MARKETING',
      items: [
        { name: 'PROMO CODES', href: '/stormy/promos', icon: Ticket },
      ]
    },
    {
      title: 'SETTINGS',
      items: [
        { name: 'SHIPPING', href: '/stormy/shipping', icon: Truck },
        { name: 'TWEAKS', href: '/stormy/tweaks', icon: Sliders },
        { name: 'SETTINGS', href: '/stormy/settings', icon: Settings },
      ]
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="admin-sidebar-overlay"
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 99,
            backdropFilter: 'blur(4px)'
          }}
        />
      )}

      <div className={`admin-sidebar ${isOpen ? 'open' : ''}`} style={{
        background: 'linear-gradient(180deg, #070707 0%, #121212 100%)',
        borderRight: '1px solid #222222',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100vh',
        width: '260px',
        padding: '30px 0',
        boxSizing: 'border-box',
        boxShadow: '4px 0 25px rgba(0,0,0,0.5)',
        flexShrink: 0
      }}>
        <div style={{ overflowY: 'auto' }}>
          {/* Brand Header */}
          <div style={{ padding: '0 25px 25px 25px', borderBottom: '1px solid #222222', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/images/WhiteStorm.png" alt="AASIFA" style={{ height: '26px', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.4))' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.2em', color: '#ffffff', textShadow: '0 0 8px rgba(255,255,255,0.3)' }}>
                CONSOLE
              </span>
            </div>
            
            {/* Mobile close button */}
            <button className="admin-sidebar-close-btn" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          {/* Menu Navigation */}
          <nav style={{ padding: '25px 0' }}>
            {menuGroups.map((group, gIdx) => (
              <div key={gIdx} style={{ marginBottom: '25px' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.2em', color: '#555555', padding: '0 25px', display: 'block', marginBottom: '12px' }}>
                  {group.title}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {group.items.map((item, iIdx) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={iIdx}
                        href={item.href}
                        onClick={onClose}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 25px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          color: isActive ? '#ffffff' : '#888888',
                          background: isActive ? 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)' : 'transparent',
                          borderLeft: isActive ? '3px solid #ffffff' : '3px solid transparent',
                          boxShadow: isActive ? 'inset 4px 0 15px rgba(255,255,255,0.05)' : 'none',
                          textShadow: isActive ? '0 0 10px rgba(255,255,255,0.4)' : 'none',
                          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                        className="sidebar-link"
                      >
                        <Icon size={15} style={{ filter: isActive ? 'drop-shadow(0 0 5px #fff)' : 'none' }} />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer controls */}
        <div style={{ padding: '20px 25px 0', borderTop: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.65rem', color: '#888', fontWeight: 600, letterSpacing: '0.05em' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3DDC84', boxShadow: '0 0 8px #3DDC84', display: 'inline-block' }}></span>
            {syncedTime}
          </div>
          
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'transparent',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '10px 0',
              textAlign: 'left',
              transition: 'color 0.2s',
            }}
            className="logout-btn"
          >
            <LogOut size={15} /> LOG OUT
          </button>
        </div>
        
        <style jsx global>{`
          .sidebar-link:hover {
            color: #ffffff !important;
            background: rgba(255,255,255,0.03) !important;
            padding-left: 28px !important;
          }
          .logout-btn:hover {
            color: #ffffff !important;
          }
          .forget-btn:hover {
            background: rgba(255, 50, 50, 0.15) !important;
            border-color: rgba(255, 50, 50, 0.4) !important;
            box-shadow: 0 0 10px rgba(255, 50, 50, 0.1) !important;
          }

          .admin-sidebar-close-btn { display: none !important; }
          .admin-sidebar-overlay { display: none !important; }

          @media (max-width: 900px) {
            .admin-sidebar {
              position: fixed;
              top: 0;
              left: -280px;
              z-index: 100;
              transition: left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .admin-sidebar.open {
              left: 0;
            }
            .admin-sidebar-close-btn { display: block !important; }
            .admin-sidebar-overlay { display: block !important; }
          }
        `}</style>
      </div>
    </>
  );
}
