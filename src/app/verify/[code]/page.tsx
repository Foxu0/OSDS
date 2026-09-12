'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getCertificateByCode } from '@/lib/dataService';
import { CertificateRecord } from '@/types';
import { formatManilaDateTime } from '@/lib/timezone';

const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconXCircle = ({ size = 36 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);
const IconAlertTriangle = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconCheckCircle = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
  </svg>
);
const IconDownload = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const IconPrinter = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
  </svg>
);
const IconArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);

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
                Certificate Verification • URS Cainta
              </div>
            </div>
          </Link>

          <Link href="/verify/code" style={{
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
            <IconSearch /> Search Another Code
          </Link>
        </div>
      </header>

      {/* Verification Result Card */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '36px 24px' }}>
        <div style={{ width: '100%', maxWidth: '820px' }}>
          
          {!cert ? (
            /* NOT FOUND */
            <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
                <IconXCircle size={44} />
              </div>
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
                  marginBottom: '12px',
                }}>
                  <IconAlertTriangle size={30} />
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
                  marginBottom: '12px',
                }}>
                  <IconCheckCircle size={36} />
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

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '28px' }}>
                <a
                  href={`/api/certificates/download/${cert.verificationCode || cert.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ textDecoration: 'none', padding: '10px 20px', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <IconDownload /> Download PDF Certificate
                </a>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn"
                  style={{
                    padding: '10px 18px', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px',
                    background: '#F1F5F9', color: '#1E293B', border: '1px solid #CBD5E1', borderRadius: '8px', cursor: 'pointer'
                  }}
                >
                  <IconPrinter /> Print Official Event Document
                </button>
                <Link href="/verify/code" className="btn btn-secondary" style={{ padding: '10px 18px', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IconArrowLeft /> Verify Another
                </Link>
              </div>

              {/* ── THE OFFICIAL EVENT DOCUMENT SHEET (Scanned from Certificate QR) ── */}
              <div
                id="official-event-document"
                style={{
                  background: '#FFFFFF',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                  padding: '48px 56px',
                  boxSizing: 'border-box',
                  color: '#0F172A',
                  marginTop: '16px',
                }}
              >
                {/* Institutional Letterhead */}
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '1px', color: '#475569', textTransform: 'uppercase' }}>
                    Republic of the Philippines
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#1E3A8A', letterSpacing: '0.8px', marginTop: '2px' }}>
                    UNIVERSITY OF RIZAL SYSTEM
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>
                    Cainta Campus • Cainta, Rizal
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A', marginTop: '4px' }}>
                    OFFICE OF STUDENT DEVELOPMENT SERVICES & STUDENT ORGANIZATIONS
                  </div>
                </div>

                {/* University Double Divider */}
                <div style={{ borderTop: '3px solid #1E3A8A', borderBottom: '1.5px solid #F59E0B', height: '2px', margin: '14px 0 20px 0' }} />

                {/* Document Header & Title */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '0.6px', margin: 0 }}>
                    Official Event Compilation & Attendance Record
                  </h3>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                    DOC REF: <span style={{ fontFamily: 'monospace', color: '#2563EB', fontWeight: '700' }}>URS-CC-VERIF-{cert.verificationCode}</span> • VERIFIED ON: {formatManilaDateTime(new Date().toISOString())}
                  </div>
                </div>

                {/* PART I: EVENT DETAILS ("Event Deets") */}
                <div style={{
                  background: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '10px',
                  padding: '20px', marginBottom: '26px'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px' }}>
                    I. Official Event Details ("Event Deets")
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Event Title</span>
                      <strong style={{ fontSize: '15px', color: '#0F172A' }}>{(cert as any).dossier?.event?.title || cert.eventTitle}</strong>
                    </div>

                    {((cert as any).dossier?.event?.description || cert.eventDescription) && (
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Event Briefing / Description</span>
                        <p style={{ color: '#334155', margin: '2px 0 0 0', lineHeight: 1.5, fontSize: '12.5px' }}>
                          {(cert as any).dossier?.event?.description || cert.eventDescription}
                        </p>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Campus Venue</span>
                        <span style={{ color: '#0F172A', fontWeight: '600' }}>{(cert as any).dossier?.event?.venue || 'URS Cainta Campus'}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', display: 'block' }}>Event Schedule</span>
                        <span style={{ color: '#0F172A', fontWeight: '600' }}>
                          {(cert as any).dossier?.event?.startDate ? formatManilaDateTime((cert as any).dossier.event.startDate) : 'Official University Record'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', background: '#EFF6FF', color: '#2563EB' }}>
                        Status: {(cert as any).dossier?.event?.status || 'COMPLETED'}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748B' }}>
                        Compiled Headcount: <strong>{((cert as any).dossier?.attendees?.length || 0)} Total Registered</strong> • <strong style={{ color: '#059669' }}>{((cert as any).dossier?.stats?.totalCheckedIn || 0)} Verified Attended</strong> • <strong>{((cert as any).dossier?.facilitators?.length || 0)} Facilitators</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* PART II: LIST OF FACILITATORS */}
                <div style={{ marginBottom: '28px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    II. List of Facilitators & Committee ({((cert as any).dossier?.facilitators?.length || 0)})
                  </div>
                  {((cert as any).dossier?.facilitators?.length > 0) ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                      <thead>
                        <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                          <th style={{ padding: '8px 12px', textAlign: 'left', width: '35px', color: '#64748B' }}>#</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left', color: '#64748B', textTransform: 'uppercase' }}>Facilitator / Resource Person</th>
                          <th style={{ padding: '8px 12px', textAlign: 'left', color: '#64748B', textTransform: 'uppercase' }}>Role / Designation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(cert as any).dossier.facilitators.map((fac: any, idx: number) => (
                          <tr key={idx} style={{ borderBottom: idx < (cert as any).dossier.facilitators.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                            <td style={{ padding: '8px 12px', color: '#94A3B8', fontWeight: '700' }}>{idx + 1}</td>
                            <td style={{ padding: '8px 12px', fontWeight: '700', color: '#0F172A' }}>{fac.name}</td>
                            <td style={{ padding: '8px 12px', color: '#475569' }}>{fac.role || fac.department || 'Facilitator'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '6px', color: '#94A3B8', fontSize: '12px', textAlign: 'center' }}>
                      No separate facilitators recorded on file.
                    </div>
                  )}
                </div>

                {/* PART III: LIST OF PARTICIPANTS & ATTENDEES */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      III. List of Participants & Attendees ({((cert as any).dossier?.attendees?.length || 0)})
                    </div>
                    <span style={{ fontSize: '11px', color: '#059669', fontWeight: '700' }}>
                      {((cert as any).dossier?.stats?.totalCheckedIn || 0)} Verified Attended
                    </span>
                  </div>

                  {((cert as any).dossier?.attendees?.length > 0) ? (
                    <div style={{ maxHeight: '380px', overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                          <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 1 }}>
                            <th style={{ padding: '8px 10px', textAlign: 'left', width: '35px', color: '#64748B' }}>#</th>
                            <th style={{ padding: '8px 10px', textAlign: 'left', color: '#64748B', textTransform: 'uppercase' }}>Participant Full Name</th>
                            <th style={{ padding: '8px 10px', textAlign: 'left', color: '#64748B', textTransform: 'uppercase' }}>Student ID</th>
                            <th style={{ padding: '8px 10px', textAlign: 'left', color: '#64748B', textTransform: 'uppercase' }}>Dept / Section</th>
                            <th style={{ padding: '8px 10px', textAlign: 'center', color: '#64748B', textTransform: 'uppercase' }}>Attendance Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(cert as any).dossier.attendees.map((att: any, idx: number) => {
                            const isCertHolder = att.studentName?.toLowerCase().trim() === cert.recipientName?.toLowerCase().trim();
                            const isAttended = att.checkedIn || att.status === 'ATTENDED';
                            return (
                              <tr
                                key={att.id || idx}
                                style={{
                                  borderBottom: '1px solid #F1F5F9',
                                  background: isCertHolder ? '#FEF9C3' : 'transparent',
                                  fontWeight: isCertHolder ? '700' : 'normal',
                                }}
                              >
                                <td style={{ padding: '8px 10px', color: '#94A3B8' }}>{idx + 1}</td>
                                <td style={{ padding: '8px 10px', color: '#0F172A' }}>
                                  {att.studentName}
                                  {isCertHolder && (
                                    <span style={{
                                      marginLeft: '8px', fontSize: '10px', background: '#D97706', color: '#FFFFFF',
                                      padding: '2px 6px', borderRadius: '4px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.4px'
                                    }}>
                                      Certificate Holder
                                    </span>
                                  )}
                                </td>
                                <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: '#475569' }}>
                                  {att.studentNumber || 'N/A'}
                                </td>
                                <td style={{ padding: '8px 10px', color: '#64748B' }}>
                                  {att.department} {att.yearSection ? `• ${att.yearSection}` : ''}
                                </td>
                                <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                  <span style={{
                                    fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px',
                                    background: isAttended ? '#ECFDF5' : '#EFF6FF',
                                    color: isAttended ? '#059669' : '#2563EB',
                                    display: 'inline-flex', alignItems: 'center', gap: '4px'
                                  }}>
                                    {isAttended ? (
                                      <>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                        Attended (Verified)
                                      </>
                                    ) : 'Registered'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '6px', color: '#94A3B8', fontSize: '12px', textAlign: 'center' }}>
                      No attendee roster recorded for this event conferment.
                    </div>
                  )}
                </div>

                {/* Institutional Footer */}
                <div style={{ marginTop: '30px', paddingTop: '16px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94A3B8' }}>
                  <span>University of Rizal System Cainta Campus • Office of Student Development Services</span>
                  <span>Official Event Compilation Document • Scanned & Verified via Certificate QR Code</span>
                </div>
              </div>

              {/* Print CSS Injection */}
              <style>{`
                @media print {
                  header, footer, .card > div:first-child, .card > div:nth-child(2), .card > div:nth-child(3) {
                    display: none !important;
                  }
                  body * {
                    visibility: hidden !important;
                  }
                  #official-event-document, #official-event-document * {
                    visibility: visible !important;
                  }
                  #official-event-document {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    box-shadow: none !important;
                    border: none !important;
                    padding: 24px !important;
                  }
                }
              `}</style>
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
