'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DEMO_USERS } from '@/lib/demoUsers';

// --- SVG Icons ---
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const ROLE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  STUDENT: { label: 'Student', color: '#2563EB', bg: '#EFF6FF' },
  ORG_OFFICER: { label: 'Org. Officer', color: '#059669', bg: '#ECFDF5' },
  OSDS_OFFICER: { label: 'OSDS Officer', color: '#7C3AED', bg: '#F5F3FF' },
  ADMIN: { label: 'Admin', color: '#DC2626', bg: '#FEF2F2' },
};

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email: identifier,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid credentials. Please check your Student ID or Email and password.');
        setLoading(false);
      } else {
        router.replace('/dashboard-redirect');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleDemoSelect = (user: typeof DEMO_USERS[0]) => {
    setIdentifier(user.studentNumber || user.email);
    setPassword(user.password);
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #1E40AF 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      {/* Left Panel - Branding (Desktop) */}
      <div style={{
        display: 'none',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        color: '#fff',
        flexDirection: 'column',
        gap: '24px',
        position: 'relative',
        zIndex: 1
      }} className="login-left-panel">
        <div style={{
          width: '80px', height: '80px', borderRadius: '20px',
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px', fontWeight: '900', color: '#fff',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>URS</div>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
            Paperless Campus
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', lineHeight: '1.6' }}>
            University of Rizal System<br />Cainta Campus
          </p>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%', maxWidth: '320px'
        }}>
          {[
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, label: 'Event Management' },
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>, label: 'E-Certificates' },
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></svg>, label: 'Attendance Tracking' },
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, label: 'Event Approvals' },
          ].map(f => (
            <div key={f.label} style={{
              background: 'rgba(255,255,255,0.08)', borderRadius: '12px',
              padding: '14px', border: '1px solid rgba(255,255,255,0.1)',
              textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.8)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>{f.icon}</div>
              {f.label}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Unified Login Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        minHeight: '100vh',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          width: '100%',
          maxWidth: '440px',
          background: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
          overflow: 'hidden'
        }}>
          {/* Form Header */}
          <div style={{
            padding: '32px 32px 20px',
            borderBottom: '1px solid #F1F5F9'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #1E3A8A, #2563EB)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', fontWeight: '800', color: '#fff',
                flexShrink: 0
              }}>URS</div>
              <div>
                <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  Paperless Campus
                </h1>
                <p style={{ fontSize: '12px', color: '#D97706', fontWeight: '600', margin: 0 }}>
                  URS Cainta Campus
                </p>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: '1.5' }}>
              Sign in with your <strong>Student ID</strong> (for students) or <strong>Campus Email</strong> (for officers & administration).
            </p>
          </div>

          {/* Form Body */}
          <div style={{ padding: '24px 32px 28px' }}>
            {error && (
              <div style={{
                background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626',
                padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
                marginBottom: '16px', fontWeight: '500'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{
                  display: 'block', fontSize: '13px', fontWeight: '600',
                  color: '#334155', marginBottom: '6px'
                }}>
                  Student ID or Email
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                    color: '#94A3B8', display: 'flex', alignItems: 'center'
                  }}>
                    <IconUser />
                  </span>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="C2024-00179 or user@urs.edu.ph"
                    style={{
                      width: '100%', padding: '11px 14px 11px 42px',
                      border: '1px solid #E2E8F0', borderRadius: '10px',
                      fontSize: '14px', color: '#0F172A', background: '#FAFAFA',
                      outline: 'none', fontFamily: 'inherit',
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = '#2563EB';
                      e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)';
                      e.target.style.background = '#FFFFFF';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = '#E2E8F0';
                      e.target.style.boxShadow = 'none';
                      e.target.style.background = '#FAFAFA';
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block', fontSize: '13px', fontWeight: '600',
                  color: '#334155', marginBottom: '6px'
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                    color: '#94A3B8', display: 'flex', alignItems: 'center'
                  }}>
                    <IconLock />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={{
                      width: '100%', padding: '11px 42px 11px 42px',
                      border: '1px solid #E2E8F0', borderRadius: '10px',
                      fontSize: '14px', color: '#0F172A', background: '#FAFAFA',
                      outline: 'none', fontFamily: 'inherit',
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = '#2563EB';
                      e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)';
                      e.target.style.background = '#FFFFFF';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = '#E2E8F0';
                      e.target.style.boxShadow = 'none';
                      e.target.style.background = '#FAFAFA';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#94A3B8', display: 'flex', alignItems: 'center', padding: '4px'
                    }}
                  >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '13px',
                  background: loading ? '#93C5FD' : 'linear-gradient(135deg, #1E3A8A, #2563EB)',
                  color: '#FFFFFF', border: 'none', borderRadius: '10px',
                  fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'all 0.2s ease', fontFamily: 'inherit',
                  boxShadow: loading ? 'none' : '0 4px 12px rgba(37,99,235,0.3)'
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '16px', height: '16px',
                      border: '2px solid rgba(255,255,255,0.4)',
                      borderTopColor: '#fff', borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                    Verifying...
                  </>
                ) : (
                  <>
                    Sign In
                    <IconChevronRight />
                  </>
                )}
              </button>
            </form>

            {/* 1-Click Demo Accounts */}
            <div style={{ marginTop: '22px', paddingTop: '18px', borderTop: '1px solid #F1F5F9' }}>
              <p style={{
                fontSize: '11px', fontWeight: '700', color: '#94A3B8',
                textTransform: 'uppercase', letterSpacing: '0.8px',
                marginBottom: '10px', textAlign: 'center'
              }}>
                Quick Access — Demo Accounts
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {DEMO_USERS.map((u) => {
                  const roleStyle = ROLE_LABELS[u.role] || ROLE_LABELS.STUDENT;
                  const isSelected = identifier === (u.studentNumber || u.email);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleDemoSelect(u)}
                      style={{
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: isSelected ? `1.5px solid ${roleStyle.color}` : '1px solid #E2E8F0',
                        background: isSelected ? roleStyle.bg : '#FAFAFA',
                        cursor: 'pointer', textAlign: 'left',
                        display: 'flex', flexDirection: 'column', gap: '2px',
                        transition: 'all 0.15s ease', fontFamily: 'inherit'
                      }}
                    >
                      <div style={{
                        fontSize: '9px', fontWeight: '800', color: roleStyle.color,
                        textTransform: 'uppercase', letterSpacing: '0.5px'
                      }}>
                        {roleStyle.label}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {u.name}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {u.studentNumber || u.email}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (min-width: 900px) {
          .login-left-panel { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
