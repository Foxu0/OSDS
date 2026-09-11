'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const role = user?.role || 'OFFICER';

  return (
    <header style={{
      height: '64px',
      background: '#0F172A', // Deep Navy Branding
      color: '#FFFFFF',
      borderBottom: '3px solid #F59E0B',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* Brand Heading */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link href={role === 'ADMIN' ? '/admin' : '/officer'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1E3A8A 0%, #D97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            color: '#FFF',
            fontSize: '15px'
          }}>
            URS
          </div>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#FFFFFF', lineHeight: 1.1 }}>
              URS Cainta
            </h2>
            <span style={{ fontSize: '11px', color: '#FBBF24', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
              Paperless Campus Portal
            </span>
          </div>
        </Link>
      </div>

      {/* User Actions & Session Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        
        {/* View Public Campus Site - DOES NOT LOG OUT */}
        <Link
          href="/"
          target="_blank"
          style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#93C5FD',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.08)',
            padding: '6px 12px',
            borderRadius: '6px',
            transition: 'all 0.2s ease',
          }}
        >
          🌐 View Public Campus Site ↗
        </Link>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF' }}>{user.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', marginTop: '2px' }}>
                <span className={`badge ${role === 'ADMIN' ? 'badge-admin' : 'badge-officer'}`} style={{ fontSize: '10px', padding: '1px 8px' }}>
                  {role === 'OFFICER' ? 'OFFICER / FACILITATOR' : 'CAMPUS ADMIN'}
                </span>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px', background: '#1E293B', color: '#E2E8F0', borderColor: '#334155' }}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
