'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import QRCode from 'qrcode';
import {
  getEventById,
  registerStudentForEvent,
  getCompetitionWinners,
  getEventRegistrationStatus,
  getEventPublicUrl,
  ALLOWED_COURSES,
  COURSE_SECTION_MAP,
  getYearSectionOptionsForCourse,
  parseYearAndSection,
  getYearDigit,
  formatClassDisplay,
  isValidStudentId,
  normalizeStudentId,
  AllowedCourse,
} from '@/lib/dataService';
import { CampusEvent, StudentRegistration, CompetitionWinner } from '@/types';
import { formatManilaDate, formatManilaTime, formatManilaDateTime } from '@/lib/timezone';

const IconQrCode = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const IconPrinter = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
  </svg>
);
const IconLock = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconCheck = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconDownload = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

export default function PublicEventPage() {
  const params = useParams();
  const eventId = (params?.id as string) || '';
  const { data: session } = useSession();
  const user = session?.user as any;

  const [event, setEvent] = useState<CampusEvent | null>(null);
  const [winners, setWinners] = useState<CompetitionWinner[]>([]);
  const [loading, setLoading] = useState(true);

  // URS Cainta Registration Form State
  const [studentName, setStudentName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [course, setCourse] = useState<AllowedCourse | ''>('');
  const [yearSectionCode, setYearSectionCode] = useState<string>('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Auto-populate logged-in student info
  useEffect(() => {
    if (user && user.role === 'STUDENT') {
      if (user.name) setStudentName(user.name);
      if (user.studentNumber) setStudentNumber(user.studentNumber);
      if (user.email) setEmail(user.email);
      if (user.department && (ALLOWED_COURSES as readonly string[]).includes(user.department)) {
        const c = user.department as AllowedCourse;
        setCourse(c);
        const options = getYearSectionOptionsForCourse(c);
        setYearSectionCode(options[0]?.code || '');
      }
    }
  }, [user]);

  // Personal Attendance Ticket Result
  const [regResult, setRegResult] = useState<{
    registration: StudentRegistration;
    personalQrUrl: string;
    message: string;
  } | null>(null);

  // Officer Modal for Event Registration QR (for printing/displaying)
  const [showEventQrModal, setShowEventQrModal] = useState(false);
  const [eventQrUrl, setEventQrUrl] = useState('');

  useEffect(() => {
    async function loadEvent() {
      if (!eventId) return;
      const evt = await getEventById(eventId);
      if (evt) {
        setEvent(evt);
        const winList = await getCompetitionWinners(evt.id);
        setWinners(winList);

        // Pre-generate the Event Registration QR Code pointing to the public URL
        const eventUrl = getEventPublicUrl(evt.id);

        try {
          const qr = await QRCode.toDataURL(eventUrl, {
            width: 320,
            margin: 2,
            color: { dark: '#0F172A', light: '#FFFFFF' },
          });
          setEventQrUrl(qr);
        } catch (e) {
          console.error('Error generating event QR:', e);
        }
      }
      setLoading(false);
    }
    loadEvent();
  }, [eventId]);

  const handleCourseChange = (newCourseStr: string) => {
    const newCourse = newCourseStr as AllowedCourse;
    setCourse(newCourse);
    if (!newCourseStr) {
      setYearSectionCode('');
    } else {
      const options = getYearSectionOptionsForCourse(newCourse);
      if (yearSectionCode) {
        const digit = getYearDigit(yearSectionCode);
        const matching = options.find((opt) => opt.yearDigit === digit);
        setYearSectionCode(matching ? matching.code : options[0]?.code || '');
      } else {
        setYearSectionCode(options[0]?.code || '');
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanName = studentName.trim();
    const cleanId = studentNumber.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanId || !cleanEmail) {
      setFormError('Please fill out all required fields.');
      return;
    }

    if (!course) {
      setFormError('Please select your Course/Program.');
      return;
    }

    if (!yearSectionCode) {
      setFormError('Please select your Year & Section.');
      return;
    }

    if (!isValidStudentId(cleanId)) {
      const curYear = new Date().getFullYear();
      setFormError(`Invalid Student ID. Expected format: C + 4-digit enrollment year + "-" + 5-digit number (e.g. C${curYear}-00000).`);
      return;
    }

    setSubmitting(true);

    try {
      const parsed = parseYearAndSection(yearSectionCode, course);
      const derivedYearLevel = parsed.yearLevel;
      const derivedSection = COURSE_SECTION_MAP[course];
      const derivedYearSection = `${getYearDigit(yearSectionCode)}${derivedSection}`;

      const res = await registerStudentForEvent({
        eventId,
        studentName: cleanName,
        studentNumber: normalizeStudentId(cleanId),
        email: cleanEmail,
        course,
        department: course,
        yearLevel: derivedYearLevel,
        section: derivedSection,
        yearSection: derivedYearSection,
      });

      if (res.success && res.registration) {
        // Generate Personal Attendance QR Code from the unique token
        const personalQr = await QRCode.toDataURL(res.registration.qrToken, {
          width: 280,
          margin: 2,
          color: { dark: '#0F172A', light: '#FFFFFF' },
        });

        setRegResult({
          registration: res.registration,
          personalQrUrl: personalQr,
          message: res.message,
        });
      } else {
        setFormError(res.message || 'Registration could not be completed.');
      }
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadEventQr = () => {
    if (!eventQrUrl) return;
    const a = document.createElement('a');
    a.href = eventQrUrl;
    a.download = `Event_Registration_QR_${event?.title.replace(/\s+/g, '_')}.png`;
    a.click();
  };

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
          <p>Loading campus event details...</p>
          <style jsx>{` @keyframes spin { to { transform: rotate(360deg); } } `}</style>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', padding: '24px' }}>
        <div className="card" style={{ maxWidth: '500px', padding: '40px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '20px', color: '#0F172A', marginBottom: '8px' }}>Event Not Found</h2>
          <p style={{ color: '#64748B', marginBottom: '24px' }}>The requested campus event may have been removed or does not exist.</p>
          <Link href="/" className="btn btn-primary">
            ← Return to Upcoming Events
          </Link>
        </div>
      </div>
    );
  }

  const regStatus = event ? getEventRegistrationStatus(event) : null;
  const isOpen = regStatus?.canRegister ?? false;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      
      {/* Top Header */}
      <header style={{
        background: 'linear-gradient(90deg, #1E3A8A 0%, #1D4ED8 100%)',
        color: '#FFFFFF',
        borderBottom: '3px solid #F59E0B',
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <Image
              src="/urs_logo.png"
              alt="University of Rizal System Official Logo"
              width={36}
              height={46}
              style={{
                objectFit: 'contain',
                flexShrink: 0,
                filter: 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.35))'
              }}
              priority
            />
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
                fontSize: '10.5px',
                color: '#FDE68A',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginTop: '2px',
              }}>
                URS CAINTA CAMPUS • EVENTS PORTAL
              </div>
            </div>
          </Link>

          <div style={{ display: 'flex', gap: '10px' }}>
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
            <button
              onClick={() => setShowEventQrModal(true)}
              className="btn btn-secondary"
              style={{ fontSize: '13px', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <IconQrCode /> Event QR Flyer
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1100px', margin: '32px auto', width: '100%', padding: '0 24px' }}>
        
        {/* Event Header Banner */}
        <div className="card" style={{ padding: '32px', marginBottom: '32px', borderLeft: `6px solid ${
          regStatus?.status === 'OPEN FOR REGISTRATION'
            ? '#10B981'
            : regStatus?.status === 'REGISTRATION NOT YET OPEN'
            ? '#F59E0B'
            : '#DC2626'
        }` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <span className={`badge ${regStatus?.badgeClass || 'badge-gold'}`}>
              {regStatus?.label || 'Registration Closed'}
            </span>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>
              Status: {event.status}
            </span>
          </div>

          <h1 style={{ fontSize: '30px', fontWeight: '800', color: '#0F172A', marginBottom: '14px' }}>
            {event.title}
          </h1>

          <p style={{ color: '#475569', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
            {event.description}
          </p>

          {/* Quick Schedule Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            background: '#F8FAFC',
            padding: '16px 20px',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            fontSize: '13px'
          }}>
            <div>
              <div style={{ color: '#64748B', fontWeight: '600', marginBottom: '2px' }}>Official Venue</div>
              <div style={{ color: '#1E40AF', fontWeight: '700' }}>{event.venue}</div>
            </div>

            <div>
              <div style={{ color: '#64748B', fontWeight: '600', marginBottom: '2px' }}>Event Date</div>
              <div style={{ color: '#0F172A', fontWeight: '700' }}>{formatManilaDate(event.startDate)}</div>
            </div>

            <div>
              <div style={{ color: '#64748B', fontWeight: '600', marginBottom: '2px' }}>Event Time</div>
              <div style={{ color: '#0F172A', fontWeight: '700' }}>
                {formatManilaTime(event.startDate)} – {formatManilaTime(event.endDate)}
              </div>
            </div>

            {regStatus && (
              <div>
                <div style={{ color: '#64748B', fontWeight: '600', marginBottom: '2px' }}>⏳ Registration Window</div>
                <div style={{ color: regStatus.canRegister ? '#059669' : '#B91C1C', fontWeight: '700' }}>
                  {formatManilaTime(regStatus.opensAt.toISOString())} – {formatManilaTime(regStatus.closesAt.toISOString())}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 1: Registration Form OR Success Pass */}
        {regResult ? (
          /* PERSONAL ATTENDANCE QR PASS RESULT */
          <div className="card" style={{ padding: '36px', marginBottom: '40px', background: '#FFFFFF', border: '2px solid #2563EB' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#ECFDF5',
                color: '#059669',
                marginBottom: '12px'
              }}>
                <IconCheck />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
                Registration Confirmed!
              </h2>
              <p style={{ color: '#059669', fontWeight: '600', fontSize: '14px' }}>
                {regResult.message}
              </p>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: '#F8FAFC',
              padding: '28px',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              maxWidth: '500px',
              margin: '0 auto 28px auto',
              textAlign: 'center'
            }}>
              <span className="badge badge-student" style={{ marginBottom: '14px' }}>
                Personal Attendance QR Pass
              </span>

              {/* Secure Personal Attendance QR (Used only for check-in) */}
              <div style={{
                background: '#FFFFFF',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                marginBottom: '16px'
              }}>
                <img
                  src={regResult.personalQrUrl}
                  alt="Personal Attendance QR Code"
                  style={{ width: '220px', height: '220px', display: 'block' }}
                />
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>
                {regResult.registration.studentName}
              </h3>
              <p style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: '700', color: '#2563EB', marginBottom: '8px' }}>
                Student ID: {regResult.registration.studentNumber}
              </p>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                color: '#1E40AF',
                padding: '4px 14px',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: '700',
                marginBottom: '12px'
              }}>
                <span>{formatClassDisplay(
                  regResult.registration.department,
                  regResult.registration.yearLevel || regResult.registration.yearSection,
                  regResult.registration.section || regResult.registration.yearSection
                )}</span>
              </div>
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #CBD5E1', width: '100%', fontSize: '12px', color: '#334155', textAlign: 'center' }}>
                <div><strong>Event:</strong> {event.title}</div>
                <div style={{ marginTop: '2px' }}><strong>Venue:</strong> <span style={{ fontWeight: '700', color: '#1E40AF' }}>{event.venue}</span></div>
              </div>
              <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '8px' }}>
                Official Server Registration Time: {formatManilaDateTime(regResult.registration.registrationDate)}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <Link
                href={`/ticket/${regResult.registration.qrToken}`}
                className="btn btn-primary"
                style={{ padding: '12px 24px' }}
              >
                Open Fullscreen Ticket Page →
              </Link>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-secondary"
                style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <IconPrinter /> Print / Save PDF
              </button>
            </div>
          </div>
        ) : isOpen ? (
          /* PUBLIC REGISTRATION FORM */
          <div className="card" style={{ padding: '36px', marginBottom: '40px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
                Public Event Registration
              </h2>
              <p style={{ color: '#64748B', fontSize: '14px' }}>
                Enter your official URS Cainta student details to generate your Personal Attendance QR Pass. No account login required.
              </p>
            </div>

            {formError && (
              <div style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '20px'
              }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleRegister}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Juan C. Dela Cruz"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Student ID *</label>
                  <input
                    type="text"
                    required
                    placeholder={`e.g. C${new Date().getFullYear()}-00000`}
                    value={studentNumber}
                    onChange={(e) => setStudentNumber(e.target.value.toUpperCase())}
                    className="form-input"
                    style={{ fontFamily: 'monospace', fontWeight: '600' }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                    Based on enrollment year (e.g. C{new Date().getFullYear()}-00000). Does not change when advancing in year.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Course / Program *</label>
                  <select
                    value={course}
                    onChange={(e) => handleCourseChange(e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="">-- Select Course / Program --</option>
                    {ALLOWED_COURSES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                    Available: BSIT, BSED, BEED, BTLED, BT-Auto
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Year &amp; Section *</label>
                  {!course ? (
                    <select
                      disabled
                      value=""
                      className="form-select"
                      style={{ background: '#F1F5F9', cursor: 'not-allowed', color: '#64748B' }}
                    >
                      <option value="">Select Course/Program first</option>
                    </select>
                  ) : (
                    <select
                      value={yearSectionCode}
                      onChange={(e) => setYearSectionCode(e.target.value)}
                      className="form-select"
                      required
                    >
                      <option value="">-- Select Year &amp; Section --</option>
                      {getYearSectionOptionsForCourse(course).map((opt) => (
                        <option key={opt.code} value={opt.code}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}
                  <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                    {course ? `Section ${COURSE_SECTION_MAP[course]} is automatically assigned to ${course}` : 'Section is automatically determined by your Course'}
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. student@urs.edu.ph"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                  />
                </div>

                {/* Class Info Display Preview */}
                <div style={{
                  gridColumn: '1 / -1',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div style={{ fontSize: '13px', color: '#475569' }}>
                    <strong>Class Designation Preview:</strong>
                  </div>
                  <div style={{
                    background: '#1E3A8A',
                    color: '#FFFFFF',
                    fontWeight: '800',
                    fontSize: '14px',
                    padding: '4px 14px',
                    borderRadius: '6px'
                  }}>
                    {course && yearSectionCode ? (
                      formatClassDisplay(course, yearSectionCode)
                    ) : (
                      <span style={{ color: '#93C5FD', fontWeight: '500', fontStyle: 'italic', fontSize: '13px' }}>
                        {course ? 'Select Year & Section' : 'Select Course/Program first'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ padding: '12px 32px', fontSize: '15px' }}
                >
                  {submitting ? 'Registering with Server...' : 'Submit Registration & Generate QR Pass →'}
                </button>
              </div>
            </form>
          </div>
        ) : regStatus?.status === 'REGISTRATION EXPIRED' ? (
          /* REGISTRATION EXPIRED ALERT */
          <div className="card" style={{
            padding: '40px 32px',
            marginBottom: '40px',
            textAlign: 'center',
            background: '#FEF2F2',
            border: '2px solid #FECACA',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.05)'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#FEE2E2',
              color: '#DC2626',
              fontSize: '30px',
              marginBottom: '16px'
            }}>
              ⏱️
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#991B1B', marginBottom: '8px' }}>
              Registration Closed
            </h2>
            <p style={{ fontSize: '16px', fontWeight: '600', color: '#B91C1C', marginBottom: '10px' }}>
              This event registration period has expired.
            </p>
            <p style={{ fontSize: '13px', color: '#7F1D1D' }}>
              Official Registration Deadline: <strong>{formatManilaDateTime(regStatus.closesAt.toISOString())}</strong> (Asia/Manila)
            </p>
            <div style={{ marginTop: '20px' }}>
              <Link href="/" className="btn btn-secondary" style={{ fontSize: '13px', padding: '8px 20px' }}>
                ← Browse Other Upcoming Events
              </Link>
            </div>
          </div>
        ) : regStatus?.status === 'REGISTRATION NOT YET OPEN' ? (
          /* REGISTRATION NOT YET OPEN ALERT */
          <div className="card" style={{
            padding: '40px 32px',
            marginBottom: '40px',
            textAlign: 'center',
            background: '#FFFBEB',
            border: '2px solid #FDE68A',
            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.05)'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#FEF3C7',
              color: '#D97706',
              fontSize: '30px',
              marginBottom: '16px'
            }}>
              ⏳
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#92400E', marginBottom: '8px' }}>
              Registration Not Yet Open
            </h2>
            <p style={{ fontSize: '16px', fontWeight: '600', color: '#B45309', marginBottom: '10px' }}>
              Registration opens on {formatManilaDateTime(regStatus.opensAt.toISOString())} (Asia/Manila).
            </p>
            <p style={{ fontSize: '13px', color: '#78350F' }}>
              Please check back once the registration window officially opens.
            </p>
          </div>
        ) : (
          /* REGISTRATION MANUALLY CLOSED ALERT */
          <div className="card" style={{
            padding: '40px 32px',
            marginBottom: '40px',
            textAlign: 'center',
            background: '#F8FAFC',
            border: '2px solid #E2E8F0'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#E2E8F0',
              color: '#64748B',
              marginBottom: '16px'
            }}>
              <IconLock />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#334155', marginBottom: '8px' }}>
              Registration Closed
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B' }}>
              Registration for this event has been closed by the event organizers.
            </p>
          </div>
        )}

        {/* Permanent Competition Winners / Recognitions Section */}
        {winners.length > 0 && (
          <div className="card" style={{ padding: '32px', marginBottom: '40px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '16px' }}>
              Official Competition Results & Recognitions
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {winners.map((win) => (
                <div
                  key={win.id}
                  style={{
                    background: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    borderRadius: '10px',
                    padding: '16px 20px'
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#D97706', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Rank {win.rank} • {win.awardTitle}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>
                    {win.participantName}
                  </div>
                  {win.finalScore && (
                    <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                      Final Tabulated Score: <strong>{win.finalScore}%</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL: Event Registration QR Code (For Officers/Facilitators to print/display) */}
      {showEventQrModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 100
        }}>
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '32px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
              Event Registration QR Flyer
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>
              Share, project, or print this QR Code. When students scan it with their phone camera, it immediately opens this public registration page.
            </p>

            {eventQrUrl && (
              <div style={{
                background: '#FFFFFF',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                display: 'inline-block',
                marginBottom: '20px'
              }}>
                <img src={eventQrUrl} alt="Event Registration QR" style={{ width: '240px', height: '240px', display: 'block' }} />
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={downloadEventQr} className="btn btn-primary" style={{ padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconDownload /> Download Image
              </button>
              <button onClick={() => setShowEventQrModal(false)} className="btn btn-secondary" style={{ padding: '8px 18px' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
        University of Rizal System Cainta Campus • Paperless Event Management
      </footer>
    </div>
  );
}
