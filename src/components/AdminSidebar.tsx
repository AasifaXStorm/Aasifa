'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, ShoppingBag, Tag, Warehouse, 
  Truck, Sliders, Settings, LogOut
} from 'lucide-react';

export function AdminSidebar() {
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
      title: 'SETTINGS',
      items: [
        { name: 'SHIPPING', href: '/stormy/shipping', icon: Truck },
        { name: 'TWEAKS', href: '/stormy/tweaks', icon: Sliders },
        { name: 'SETTINGS', href: '/stormy/settings', icon: Settings },
      ]
    }
  ];

  return (
    <div style={{
      background: 'linear-gradient(180deg, #070707 0%, #121212 100%)',
      borderRight: '1px solid #222222',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100vh',
      padding: '30px 0',
      boxSizing: 'border-box',
      boxShadow: '4px 0 25px rgba(0,0,0,0.5)'
    }}>
      <div>
        {/* Brand Header */}
        <div style={{ padding: '0 25px 25px 25px', borderBottom: '1px solid #222222', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/images/WhiteStorm.png" alt="AASIFA" style={{ height: '26px', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.4))' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.2em', color: '#ffffff', textShadow: '0 0 8px rgba(255,255,255,0.3)' }}>
            CONSOLE
          </span>
        </div>

        {/* Menu Navigation */}
        <nav style={{ padding: '25px 0' }}>
          {menuGroups.map((group, gIdx) => (
            <div key={gIdx} style={{ marginBottom: '30px' }}>
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
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px 25px',
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
      <div style={{ padding: '0 25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
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

        <button
          onClick={handleLogout}
          style={{
            background: 'rgba(255, 50, 50, 0.08)',
            border: '1px solid rgba(255, 50, 50, 0.2)',
            color: '#ff6666',
            borderRadius: '4px',
            fontSize: '0.75rem',
            padding: '10px 14px',
            cursor: 'pointer',
            fontWeight: 'bold',
            textAlign: 'center',
            transition: 'all 0.2s',
            letterSpacing: '0.05em',
          }}
          className="forget-btn"
        >
          FORGET DEVICE
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
      `}</style>
    </div>
  );
}
