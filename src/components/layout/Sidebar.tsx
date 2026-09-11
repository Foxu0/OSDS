'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = (session?.user as any)?.role || 'OFFICER';

  // Final two-tier role navigation items (NO dead links)
  const navItems = {
    OFFICER: [
      { label: 'Events Hub', href: '/officer', icon: '📅' },
      { label: 'Scanned Attendance Logs', href: '/officer/attendance', icon: '📋' },
    ],
    ADMIN: [
      { label: 'System Overview & Records', href: '/admin', icon: '🛡️' },
      { label: 'Officer Operations Hub', href: '/officer', icon: '⚙️' },
      { label: 'Attendance Audit Trail', href: '/officer/attendance', icon: '📋' },
    ],
  };

  const currentNav = navItems[role as keyof typeof navItems] || navItems.OFFICER;

  return (
    <aside style={{
      width: '250px',
      background: '#FFFFFF',
      borderRight: '1px solid #E2E8F0',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      minHeight: 'calc(100vh - 67px)',
      boxShadow: '1px 0 3px rgba(0,0,0,0.02)'
    }}>
      <div style={{
        padding: '0 12px 12px 12px',
        fontSize: '11px',
        fontWeight: '700',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        borderBottom: '1px solid #F1F5F9'
      }}>
        {role === 'ADMIN' ? 'Administrator' : 'Officer / Facilitator'} Navigation
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
        {currentNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: isActive ? '700' : '500',
                color: isActive ? '#2563EB' : '#475569',
                background: isActive ? '#EFF6FF' : 'transparent',
                border: isActive ? '1px solid #BFDBFE' : '1px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: '17px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom Shortcuts */}
      <div style={{
        marginTop: 'auto',
        paddingTop: '20px',
        borderTop: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <Link
          href="/"
          target="_blank"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#2563EB',
            fontSize: '13px',
            textDecoration: 'none',
            fontWeight: '600',
            padding: '8px 12px',
            borderRadius: '6px',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0'
          }}
        >
          <span>🌐</span>
          <span>View Public Site ↗</span>
        </Link>

        <Link
          href="/verify/code"
          target="_blank"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#D97706',
            fontSize: '13px',
            textDecoration: 'none',
            fontWeight: '600',
            padding: '8px 12px',
            borderRadius: '6px',
            background: '#FFFBEB',
            border: '1px solid #FDE68A'
          }}
        >
          <span>🔍</span>
          <span>Verify E-Certificate ↗</span>
        </Link>
      </div>
    </aside>
  );
}
