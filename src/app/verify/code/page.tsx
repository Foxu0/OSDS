'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
        background: '#0F172A',
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
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1E3A8A 0%, #D97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '15px',
              color: '#FFFFFF'
            }}>
              URS
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF', lineHeight: 1.1 }}>
                University of Rizal System
              </div>
              <div style={{ fontSize: '11px', color: '#FBBF24', fontWeight: '600', textTransform: 'uppercase' }}>
                Official E-Certificate Registry
              </div>
            </div>
          </Link>

          <Link href="/" className="btn btn-secondary" style={{ fontSize: '13px', padding: '6px 14px' }}>
            ← All Events
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
              fontSize: '26px',
            }}>
              🔍
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
                style={{ width: '100%', padding: '12px', fontSize: '15px' }}
              >
                🔍 Check Certificate Authenticity
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
