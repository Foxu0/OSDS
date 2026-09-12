'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import { getRegistrationByToken, formatClassDisplay } from '@/lib/dataService';
import { StudentRegistration, CampusEvent } from '@/types';
import { formatManilaDate, formatManilaTime, formatManilaDateTime } from '@/lib/timezone';

const IconPrinter = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
  </svg>
);

export default function PersonalAttendanceTicketPage() {
  const params = useParams();
  const token = (params?.token as string) || '';

  const [data, setData] = useState<{ registration: StudentRegistration; event: CampusEvent } | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTicket() {
      if (!token) return;
      const res = await getRegistrationByToken(token);
      if (res) {
        setData(res);
        try {
          // Zero-PII QR code: only the unique token string is embedded inside the QR payload
          const qr = await QRCode.toDataURL(res.registration.qrToken, {
            width: 300,
            margin: 2,
            color: { dark: '#0F172A', light: '#FFFFFF' },
          });
          setQrDataUrl(qr);
        } catch (err) {
          console.error('Error generating QR:', err);
        }
      }
      setLoading(false);
    }
    loadTicket();
  }, [token]);

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
          <p>Retrieving your official URS attendance pass...</p>
          <style jsx>{` @keyframes spin { to { transform: rotate(360deg); } } `}</style>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', padding: '24px' }}>
        <div className="card" style={{ maxWidth: '480px', padding: '36px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '20px', color: '#0F172A', marginBottom: '8px' }}>Attendance Pass Not Found</h2>
          <p style={{ color: '#64748B', marginBottom: '24px' }}>
            The QR ticket token is invalid or does not correspond to an active event registration.
          </p>
          <Link href="/" className="btn btn-primary">
            ← Return to Campus Events
          </Link>
        </div>
      </div>
    );
  }

  const { registration, event } = data;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      
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
                Official Attendance Pass • URS Cainta
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

      {/* Main Pass Container */}
      <main style={{ flex: 1, maxWidth: '640px', margin: '36px auto', width: '100%', padding: '0 20px' }}>
        
        {/* Printable Ticket Card */}
        <div className="card" style={{
          overflow: 'hidden',
          border: '2px solid #2563EB',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)'
        }}>
          
          {/* Ticket Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)',
            color: '#FFFFFF',
            padding: '24px',
            textAlign: 'center',
            position: 'relative'
          }}>
            <span style={{
              background: 'rgba(245, 158, 11, 0.2)',
              color: '#FDE68A',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'inline-block',
              marginBottom: '10px'
            }}>
              Official Event Pass
            </span>
            <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF', marginBottom: '4px' }}>
              {event.title}
            </h1>
            <p style={{ color: '#93C5FD', fontSize: '13px' }}>
              Present this QR Code to Staff / Facilitators at Entrance
            </p>
          </div>

          {/* Ticket Body */}
          <div style={{ padding: '32px', textAlign: 'center' }}>
            
            {/* Scannable Attendance QR Code */}
            {qrDataUrl && (
              <div style={{
                display: 'inline-block',
                background: '#FFFFFF',
                padding: '16px',
                borderRadius: '12px',
                border: '2px solid #E2E8F0',
                boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                marginBottom: '20px'
              }}>
                <img
                  src={qrDataUrl}
                  alt="Personal Attendance QR Pass"
                  style={{ width: '220px', height: '220px', display: 'block' }}
                />
              </div>
            )}

            {/* Attendee Details */}
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>
              {registration.studentName}
            </h2>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '16px',
              fontWeight: '700',
              color: '#2563EB',
              marginBottom: '10px'
            }}>
              Student ID: {registration.studentNumber}
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              color: '#1E40AF',
              padding: '6px 16px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: '700',
              marginBottom: '24px'
            }}>
              <span>{formatClassDisplay(
                registration.department,
                registration.yearLevel || registration.yearSection,
                registration.section || registration.yearSection
              )}</span>
            </div>

            {/* Event Details Grid */}
            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '16px',
              textAlign: 'left',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              fontSize: '13px',
              marginBottom: '24px'
            }}>
              <div>
                <span style={{ color: '#64748B', fontWeight: '600' }}>Venue:</span>
                <div style={{ color: '#1E40AF', fontWeight: '700' }}>{event.venue}</div>
              </div>

              <div>
                <span style={{ color: '#64748B', fontWeight: '600' }}>Event Date:</span>
                <div style={{ color: '#0F172A', fontWeight: '700' }}>{formatManilaDate(event.startDate)}</div>
              </div>

              <div>
                <span style={{ color: '#64748B', fontWeight: '600' }}>Time:</span>
                <div style={{ color: '#0F172A', fontWeight: '700' }}>
                  {formatManilaTime(event.startDate)} – {formatManilaTime(event.endDate)}
                </div>
              </div>

              <div>
                <span style={{ color: '#64748B', fontWeight: '600' }}>Registered On:</span>
                <div style={{ color: '#0F172A', fontWeight: '700' }}>
                  {formatManilaDateTime(registration.registrationDate)}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '24px' }}>
              Tip: Take a screenshot or bookmark this URL on your mobile phone for fast scanning.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-primary"
                style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <IconPrinter /> Print / Save Pass
              </button>
              <Link href="/" className="btn btn-secondary" style={{ padding: '10px 24px' }}>
                Return to Campus Events
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', padding: '20px', textAlign: 'center', color: '#64748B', fontSize: '12px' }}>
        University of Rizal System Cainta Campus • Authorized Event Check-in System
      </footer>
    </div>
  );
}
