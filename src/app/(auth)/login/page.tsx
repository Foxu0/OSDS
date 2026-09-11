'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DEMO_USERS } from '@/lib/demoUsers';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid staff credentials. Only authorized Officers and Administrators can sign in.');
        setLoading(false);
      } else {
        router.replace('/dashboard-redirect');
      }
    } catch {
      setError('An unexpected error occurred during sign-in.');
      setLoading(false);
    }
  };

  const handleSelectDemoUser = (demoUser: typeof DEMO_USERS[0]) => {
    setEmail(demoUser.email);
    setPassword(demoUser.password);
    setError('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#F8FAFC' }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>

        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1E3A8A 0%, #D97706 100%)',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.2)',
            marginBottom: '14px',
            fontSize: '24px',
            fontWeight: '800',
            color: '#FFFFFF'
          }}>
            URS
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>
            University of Rizal System
          </h1>
          <p style={{ color: '#D97706', fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Cainta Campus • Staff & Officer Portal
          </p>
        </div>

        {/* White Card */}
        <div className="card" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', marginBottom: '4px', textAlign: 'center' }}>
            Authorized Personnel Sign In
          </h2>
          <p style={{ color: '#64748B', fontSize: '13px', textAlign: 'center', marginBottom: '20px' }}>
            Students, faculty, and guests do not need accounts. Sign in below for administrative and operational tasks.
          </p>

          {error && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Official Staff Email</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="officer@urs.edu.ph or admin@urs.edu.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '14px' }}
            >
              {loading ? 'Verifying Credentials...' : 'Sign In to Campus Workspace'}
            </button>
          </form>

          {/* 1-Click Demo Accounts for testing */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #E2E8F0' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', textAlign: 'center' }}>
              ⚡ 1-Click Demo Staff Accounts
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {DEMO_USERS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelectDemoUser(u)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: email === u.email ? '2px solid #2563EB' : '1px solid #E2E8F0',
                    background: email === u.email ? '#EFF6FF' : '#F8FAFC',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: '800', color: u.role === 'ADMIN' ? '#DC2626' : '#059669', textTransform: 'uppercase' }}>
                    {u.role === 'ADMIN' ? 'Admin' : 'Officer'}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {u.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link href="/" style={{ fontSize: '13px', color: '#2563EB', fontWeight: '600' }}>
            ← Return to Public Campus Events Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
