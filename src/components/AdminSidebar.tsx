'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, ShoppingBag, Tag, Warehouse, 
  Truck, Sliders, Settings, LogOut, Trash2 
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
      background: '#0d0d0d',
      borderRight: '1px solid #1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100vh',
      padding: '25px 0',
      boxSizing: 'border-box'
    }}>
      <div>
        {/* Brand Header */}
        <div style={{ padding: '0 25px 25px 25px', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/images/WhiteStorm.png" alt="AASIFA" style={{ height: '22px', width: 'auto', objectFit: 'contain' }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.15em', color: '#888' }}>
            CONSOLE
          </span>
        </div>

        {/* Menu Navigation */}
        <nav style={{ padding: '20px 0' }}>
          {menuGroups.map((group, gIdx) => (
            <div key={gIdx} style={{ marginBottom: '25px' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.15em', color: '#555', padding: '0 25px', display: 'block', marginBottom: '10px' }}>
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
                        padding: '12px 25px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        color: isActive ? '#ffffff' : '#888888',
                        background: isActive ? 'rgba(255,255,255,0.03)' : 'transparent',
                        borderLeft: isActive ? '3px solid #ffffff' : '3px solid transparent',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Icon size={14} />
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
      <div style={{ padding: '0 25px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.65rem', color: '#666' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3DDC84' }}></span>
          {syncedTime}
        </div>
        
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'transparent',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            fontSize: '0.75rem',
            padding: '10px 0',
            textAlign: 'left'
          }}
        >
          <LogOut size={14} /> LOG OUT
        </button>

        <button
          onClick={handleLogout}
          style={{
            background: 'rgba(255, 50, 50, 0.1)',
            border: '1px solid rgba(255, 50, 50, 0.2)',
            color: '#ff6666',
            borderRadius: '4px',
            fontSize: '0.7rem',
            padding: '8px 12px',
            cursor: 'pointer',
            fontWeight: 'bold',
            textAlign: 'center'
          }}
        >
          FORGET DEVICE
        </button>
      </div>
    </div>
  );
}
