'use client';

import React, { Suspense } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

// --- SVG Icon Library ---
const IconLayoutDashboard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconAward = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);
const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconClipboardList = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/>
  </svg>
);
const IconCheckCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconBarChart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);
const IconArchive = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>
  </svg>
);
const IconInbox = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
);

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const NAV_CONFIG: Record<string, NavItem[]> = {
  STUDENT: [
    { label: 'My Dashboard', href: '/dashboard', icon: <IconLayoutDashboard /> },
  ],
  ORG_OFFICER: [
    { label: 'My Events', href: '/org-officer', icon: <IconCalendar /> },
  ],
  OSDS_OFFICER: [
    { label: 'Event Requests', href: '/osds?tab=pending', icon: <IconInbox /> },
    { label: 'All Events', href: '/osds?tab=all', icon: <IconCalendar /> },
    { label: 'Org Officers', href: '/osds?tab=organizations', icon: <IconUsers /> },
  ],
  ADMIN: [
    { label: 'Records Vault', href: '/admin?view=records', icon: <IconArchive /> },
    { label: 'OSDS Officers', href: '/admin?view=officers', icon: <IconUsers /> },
  ],
};

function SidebarContent() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const role = (session?.user as any)?.role || 'STUDENT';
  const currentNav = NAV_CONFIG[role] || NAV_CONFIG.STUDENT;

  const isActive = (href: string) => {
    if (href.includes('?')) {
      const [targetPath, queryString] = href.split('?');
      if (pathname !== targetPath) return false;

      const targetSearch = new URLSearchParams(queryString);
      for (const [key, expectedVal] of targetSearch.entries()) {
        const actualVal = searchParams.get(key);

        // Special case: /admin?view=records is active by default when view is unset or 'records'
        if (targetPath === '/admin' && key === 'view') {
          const effectiveVal = actualVal || 'records';
          if (effectiveVal !== expectedVal) return false;
          continue;
        }

        // Special case: /osds?tab=pending is active by default when tab is unset or 'pending'
        if (targetPath === '/osds' && key === 'tab') {
          const effectiveVal = actualVal || 'pending';
          if (effectiveVal !== expectedVal) return false;
          continue;
        }

        if (actualVal !== expectedVal) return false;
      }
      return true;
    }

    if (href === '/admin') {
      const view = searchParams.get('view');
      return pathname === '/admin' && (!view || view === 'records');
    }

    if (pathname.startsWith('/org-officer/events')) {
      if (role === 'ORG_OFFICER' && href === '/org-officer') return true;
      if (role === 'OSDS_OFFICER' && href === '/osds?tab=all') return true;
    }

    if (href === '/dashboard' || href === '/org-officer' || href === '/osds') {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  return (
    <aside style={{
      width: '230px',
      background: '#FFFFFF',
      borderRight: '1px solid #E2E8F0',
      padding: '16px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      minHeight: 'calc(100vh - 64px)',
      boxShadow: '1px 0 4px rgba(0,0,0,0.02)',
      flexShrink: 0
    }}>
      {/* Section label */}
      <div style={{
        padding: '0 10px 10px',
        fontSize: '10px', fontWeight: '700', color: '#94A3B8',
        textTransform: 'uppercase', letterSpacing: '1px',
        borderBottom: '1px solid #F1F5F9', marginBottom: '6px'
      }}>
        Navigation
      </div>

      {/* Nav Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {currentNav.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '9px',
                fontSize: '14px',
                fontWeight: active ? '700' : '500',
                color: active ? '#1E3A8A' : '#475569',
                background: active ? '#EFF6FF' : 'transparent',
                border: active ? '1px solid #BFDBFE' : '1px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = '#F8FAFC';
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ color: active ? '#2563EB' : '#94A3B8', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                {item.icon}
              </span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontSize: '10px', fontWeight: '700', color: '#DC2626',
                  background: '#FEF2F2', border: '1px solid #FECACA',
                  padding: '1px 6px', borderRadius: '20px'
                }}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

export default function Sidebar() {
  return (
    <Suspense fallback={
      <aside style={{
        width: '230px',
        background: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        minHeight: 'calc(100vh - 64px)',
        flexShrink: 0
      }} />
    }>
      <SidebarContent />
    </Suspense>
  );
}
