'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

interface RoleStyle {
  label: string;
  portalSubtitle: string;
  homeHref: string;
  badgeBg: string;
  badgeBorder: string;
  badgeColor: string;
  dotColor: string;
}

const ROLE_CONFIG: Record<string, RoleStyle> = {
  ADMIN: {
    label: 'Administrator',
    portalSubtitle: 'Central Administration',
    homeHref: '/admin',
    badgeBg: 'rgba(245, 158, 11, 0.18)',
    badgeBorder: 'rgba(245, 158, 11, 0.4)',
    badgeColor: '#FDE68A',
    dotColor: '#F59E0B',
  },
  OSDS_OFFICER: {
    label: 'OSDS Officer',
    portalSubtitle: 'Student Affairs & Services',
    homeHref: '/osds',
    badgeBg: 'rgba(16, 185, 129, 0.18)',
    badgeBorder: 'rgba(16, 185, 129, 0.4)',
    badgeColor: '#A7F3D0',
    dotColor: '#10B981',
  },
  ORG_OFFICER: {
    label: 'Org Officer',
    portalSubtitle: 'Student Organization Hub',
    homeHref: '/org-officer',
    badgeBg: 'rgba(56, 189, 248, 0.18)',
    badgeBorder: 'rgba(56, 189, 248, 0.4)',
    badgeColor: '#BAE6FD',
    dotColor: '#38BDF8',
  },
  STUDENT: {
    label: 'Student',
    portalSubtitle: 'Student Portal',
    homeHref: '/dashboard',
    badgeBg: 'rgba(255, 255, 255, 0.15)',
    badgeBorder: 'rgba(255, 255, 255, 0.28)',
    badgeColor: '#FFFFFF',
    dotColor: '#93C5FD',
  },
};

const IconLogOut = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

function getInitials(name?: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const role = user?.role || 'STUDENT';
  const roleConfig = ROLE_CONFIG[role] || ROLE_CONFIG.STUDENT;

  return (
    <header style={{
      height: '64px',
      background: 'linear-gradient(90deg, #1E3A8A 0%, #1D4ED8 100%)',
      color: '#FFFFFF',
      borderBottom: '3px solid #F59E0B',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      flexShrink: 0,
      boxShadow: '0 4px 14px rgba(15, 23, 42, 0.15)'
    }}>
      {/* Brand Identity */}
      <Link href={roleConfig.homeHref} style={{
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transition: 'opacity 0.15s ease'
      }}>
        {/* URS Dark Blue Emblem */}
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: '#0F172A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '900',
          color: '#FFFFFF',
          fontSize: '14px',
          letterSpacing: '0.6px',
          flexShrink: 0,
          border: '1.5px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 3px 8px rgba(0, 0, 0, 0.3)'
        }}>
          URS
        </div>

        <div>
          <div style={{
            fontSize: '15px',
            fontWeight: '800',
            color: '#FFFFFF',
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
          }}>
            Paperless Campus
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '2px'
          }}>
            <span style={{
              fontSize: '10px',
              color: '#FDE68A',
              textTransform: 'uppercase',
              letterSpacing: '0.7px',
              fontWeight: '800',
            }}>
              URS Cainta
            </span>
            <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '9px' }}>•</span>
            <span style={{
              fontSize: '10px',
              color: 'rgba(255, 255, 255, 0.75)',
              fontWeight: '600',
              letterSpacing: '0.2px',
            }}>
              {roleConfig.portalSubtitle}
            </span>
          </div>
        </div>
      </Link>

      {/* Right Side: User Profile & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {user && (
          <>
            {/* User Profile Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '11px',
              padding: '4px 14px 4px 6px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: '30px',
              backdropFilter: 'blur(8px)',
            }}>
              {/* User Avatar Initials */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '11.5px',
                letterSpacing: '0.5px',
                flexShrink: 0,
              }}>
                {getInitials(user.name)}
              </div>

              {/* User Name & Role Status */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#FFFFFF',
                  lineHeight: 1.2,
                  letterSpacing: '-0.01em',
                }}>
                  {user.name}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '9.5px',
                    fontWeight: '700',
                    letterSpacing: '0.4px',
                    textTransform: 'uppercase',
                    color: roleConfig.badgeColor,
                  }}>
                    <span style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: roleConfig.dotColor,
                      display: 'inline-block'
                    }} />
                    {roleConfig.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Subtle Divider */}
            <div style={{
              width: '1px',
              height: '24px',
              background: 'rgba(255, 255, 255, 0.2)',
            }} />

            {/* Sign Out Button */}
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              title="Sign out of Paperless Campus"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                fontFamily: 'inherit',
                backdropFilter: 'blur(8px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.22)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.45)';
                e.currentTarget.style.color = '#FECACA';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.22)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
            >
              <IconLogOut />
              <span>Sign Out</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}
