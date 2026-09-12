'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const IconSearch = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

export default function VerificationSearchPage() {
  const [code, setCode] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      router.push(`/verify/${code.trim().toUpperCase()}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#0F172A', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header */}
      <header style={{
        background: 'linear-gradient(90deg, #1E3A8A 0%, #1D4ED8 100%)',
        color: '#FFFFFF',
        borderBottom: '3px solid #F59E0B',
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              fontSize: '14px',
              color: '#FFFFFF',
              letterSpacing: '0.6px',
              border: '1.5px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 3px 8px rgba(0, 0, 0, 0.3)'
            }}>
              URS
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#FFFFFF', lineHeight: 1.15 }}>
                Paperless Campus
              </div>
              <div style={{ fontSize: '10.5px', color: '#FDE68A', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Official E-Certificate Registry • URS Cainta
              </div>
            </div>
          </Link>

          <Link href="/" style={{
            fontSize: '12px',
            fontWeight: '600',
            padding: '7px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.12)',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '8px',
            textDecoration: 'none',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.15s ease'
          }}>
            Home
          </Link>
        </div>
      </header>

      {/* Main Search Body */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '36px 24px' }}>
        <div style={{ width: '100%', maxWidth: '520px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#EFF6FF',
              border: '2px solid #BFDBFE',
              marginBottom: '14px',
              color: '#2563EB',
            }}>
              <IconSearch size={26} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
              Verify E-Certificate Authenticity
            </h1>
            <p style={{ color: '#64748B', fontSize: '14px' }}>
              Enter the unique verification code printed at the bottom of the official URS Cainta E-Certificate.
            </p>
          </div>

          <div className="card" style={{ padding: '32px' }}>
            <form onSubmit={handleSearch}>
              <div className="form-group">
                <label className="form-label">Certificate Verification Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. URS-2026-CERT-8F3A91"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="form-input"
                  style={{ fontFamily: 'monospace', fontSize: '15px', textTransform: 'uppercase' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <IconSearch size={16} /> Check Certificate Authenticity
              </button>
            </form>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #E2E8F0', textAlign: 'center', fontSize: '12px', color: '#64748B' }}>
              Instant tamper-proof check against the official URS Cainta institutional registry.
            </div>
          </div>
        </div>
      </main>

      <footer style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', padding: '20px', textAlign: 'center', color: '#64748B', fontSize: '12px' }}>
        University of Rizal System Cainta Campus • Public Certificate Verification
      </footer>
    </div>
  );
}
