'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getCertificateByCode } from '@/lib/dataService';
import { CertificateRecord } from '@/types';
import { formatManilaDateTime } from '@/lib/timezone';

export default function CertificateVerificationDetailPage() {
  const params = useParams();
  const code = (params?.code as string) || '';

  const [cert, setCert] = useState<CertificateRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      if (code) {
        const found = await getCertificateByCode(code);
        setCert(found);
      }
      setLoading(false);
    }
    verify();
  }, [code]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ textAlign: 'center', color: '#64748B' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '3px solid #E2E8F0',
            borderTopColor: '#2563EB',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px auto'
          }} />
          <p>Verifying certificate code against URS Cainta Registry...</p>
          <style jsx>{` @keyframes spin { to { transform: rotate(360deg); } } `}</style>
        </div>
      </div>
    );
  }

  const isAuthentic = cert && cert.status === 'ISSUED';
  const isRevoked = cert && cert.status === 'REVOKED';

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#0F172A', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
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
                Certificate Verification
              </div>
            </div>
          </Link>

          <Link href="/verify/code" className="btn btn-secondary" style={{ fontSize: '13px', padding: '6px 14px' }}>
            🔍 Search Another Code
          </Link>
        </div>
      </header>

      {/* Verification Result Card */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '36px 24px' }}>
        <div style={{ width: '100%', maxWidth: '640px' }}>
          
          {!cert ? (
            /* NOT FOUND */
            <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>❌</div>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#DC2626', marginBottom: '8px' }}>
                Invalid or Unrecognized Certificate
              </h2>
              <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '24px' }}>
                The verification code <strong>"{code}"</strong> was not found in the official University of Rizal System registry. This document may be fraudulent or unissued.
              </p>
              <Link href="/verify/code" className="btn btn-primary">
                Try Another Verification Code
              </Link>
            </div>
          ) : isRevoked ? (
            /* REVOKED ALERT */
            <div className="card" style={{ padding: '36px', border: '2px solid #DC2626' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: '#FEF2F2',
                  border: '2px solid #FECACA',
                  fontSize: '28px',
                  marginBottom: '12px',
                  color: '#DC2626'
                }}>
                  ⚠️
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#DC2626', marginBottom: '4px' }}>
                  OFFICIALLY REVOKED CERTIFICATE
                </h2>
                <p style={{ color: '#991B1B', fontSize: '14px', fontWeight: '600' }}>
                  This certificate has been declared invalid and revoked by University Administration.
                </p>
              </div>

              {/* Revocation Details */}
              <div style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px',
                fontSize: '13px'
              }}>
                <div style={{ fontWeight: '700', color: '#991B1B', marginBottom: '4px' }}>
                  Revocation Audit Reason:
                </div>
                <p style={{ color: '#7F1D1D' }}>{cert.revocationReason || 'Administrative revocation'}</p>
                {cert.revokedAt && (
                  <div style={{ fontSize: '11px', color: '#B91C1C', marginTop: '6px' }}>
                    Revoked On: {formatManilaDateTime(cert.revokedAt)}
                  </div>
                )}
              </div>

              {/* Recipient Snapshot */}
              <div style={{ fontSize: '13px', color: '#475569' }}>
                <div>Original Recipient: <strong>{cert.recipientName}</strong></div>
                <div>Code: <strong style={{ fontFamily: 'monospace' }}>{cert.verificationCode}</strong></div>
              </div>
            </div>
          ) : (
            /* AUTHENTIC AND VALID */
            <div className="card" style={{ padding: '36px', border: '2px solid #10B981' }}>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#ECFDF5',
                  border: '2px solid #A7F3D0',
                  fontSize: '32px',
                  marginBottom: '12px',
                  color: '#059669'
                }}>
                  ✓
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#065F46', marginBottom: '4px' }}>
                  Official Authentic E-Certificate
                </h2>
                <p style={{ color: '#047857', fontSize: '14px', fontWeight: '600' }}>
                  Verified Record in University of Rizal System Institutional Registry
                </p>
              </div>

              {/* Certificate Details Card */}
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                marginBottom: '24px',
                fontSize: '14px'
              }}>
                <div>
                  <span style={{ color: '#64748B', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Certificate Type</span>
                  <div style={{ fontWeight: '700', color: '#2563EB', fontSize: '16px' }}>
                    Certificate of {
                      cert.certificateType === 'RECOGNITION' || cert.certificateType === 'WINNER'
                        ? 'Recognition'
                        : cert.certificateType === 'APPRECIATION'
                        ? 'Appreciation'
                        : 'Participation'
                    }
                  </div>
                </div>

                <div>
                  <span style={{ color: '#64748B', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Recipient Name</span>
                  <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '20px' }}>
                    {cert.recipientName}
                  </div>
                  {cert.recipientIdentifier && (
                    <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
                      Identifier: {cert.recipientIdentifier}
                    </div>
                  )}
                </div>

                {cert.awardTitle && (
                  <div>
                    <span style={{ color: '#64748B', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                      {cert.certificateType === 'RECOGNITION' || cert.certificateType === 'WINNER'
                        ? 'Award / Achievement'
                        : cert.certificateType === 'APPRECIATION'
                        ? 'Contribution / Role'
                        : 'Award'}
                    </span>
                    <div style={{ fontWeight: '700', color: '#D97706', fontSize: '15px' }}>
                      {cert.awardTitle}
                    </div>
                    {cert.competitionTitle && (
                      <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                        {cert.competitionTitle}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <span style={{ color: '#64748B', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Activity / Event</span>
                  <div style={{ fontWeight: '700', color: '#0F172A' }}>
                    {cert.eventTitle}
                  </div>
                  {cert.eventDescription && (
                    <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', lineHeight: 1.5 }}>
                      {cert.eventDescription}
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <span style={{ color: '#64748B', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Verification Code</span>
                    <div style={{ fontFamily: 'monospace', fontWeight: '700', color: '#0F172A' }}>
                      {cert.verificationCode}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#64748B', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Date Issued</span>
                    <div style={{ color: '#0F172A', fontWeight: '600' }}>
                      {formatManilaDateTime(cert.issuedAt)}
                    </div>
                  </div>
                </div>

                <div>
                  <span style={{ color: '#64748B', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Authorized Signatory</span>
                  <div style={{ fontWeight: '700', color: '#0F172A' }}>
                    {cert.issuedByName || 'URS Cainta Event Facilitator'}
                  </div>
                  {cert.signatoryPosition && (
                    <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                      {cert.signatoryPosition}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a
                  href={`/api/certificates/download/${cert.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ textDecoration: 'none' }}
                >
                  📄 Download PDF Certificate
                </a>
                <Link href="/verify/code" className="btn btn-secondary">
                  ← Verify Another
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', padding: '20px', textAlign: 'center', color: '#64748B', fontSize: '12px' }}>
        University of Rizal System Cainta Campus • Public Certificate Verification
      </footer>
    </div>
  );
}
