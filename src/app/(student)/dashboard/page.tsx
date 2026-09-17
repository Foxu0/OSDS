'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { COURSE_SECTION_MAP, getYearDigit } from '@/lib/studentRules';

// --- SVG Icons ---
const IconCalendar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconList = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);
const IconTicket = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" />
    <line x1="13" y1="5" x2="13" y2="19" strokeDasharray="2 2" />
  </svg>
);
const IconCheckCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const IconAward = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);
const IconMapPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconDownload = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const IconStar = ({ filled }: { filled?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IconChevronLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IconChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const IconExternalLink = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

type TabId = 'calendar' | 'events' | 'registrations' | 'attendance' | 'certificates';

interface Event {
  id: string;
  title: string;
  venue: string;
  startDate: string;
  endDate: string;
  status: string;
  registrationOpen?: boolean;
  registrationOpensAt?: string;
  registrationClosesAt?: string;
  evaluationOpen?: boolean;
  description: string;
}

interface Registration {
  id: string;
  eventId: string;
  eventTitle?: string;
  studentName: string;
  studentNumber: string;
  email: string;
  department: string;
  yearSection: string;
  status: string;
  registrationDate: string;
  qrToken: string;
}

interface Attendance {
  id: string;
  registrationId: string;
  eventId: string;
  eventTitle?: string;
  studentName: string;
  studentNumber: string;
  checkInTime: string;
  scannedByOfficerName?: string;
}

interface Certificate {
  id: string;
  verificationCode: string;
  certificateType: string;
  eventTitle: string;
  issuedAt: string;
  status: string;
}

interface EvalModalState {
  open: boolean;
  event: Event | null;
  ratings: number[];
  comments: string;
  submitted: boolean;
  fields?: any[];
  customResponses?: Record<string, any>;
  certIssued?: boolean;
  loadingForm?: boolean;
}

export default function StudentDashboard() {
  const { data: session } = useSession();
  const user = session?.user as any;

  const [activeTab, setActiveTab] = useState<TabId>('events');
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar state
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  // Registration feedback state
  const [registeringEventId, setRegisteringEventId] = useState<string | null>(null);
  const [regFeedback, setRegFeedback] = useState<{ eventId: string; message: string; qrToken?: string; isError?: boolean } | null>(null);

  // Evaluation modal
  const [evalModal, setEvalModal] = useState<EvalModalState>({
    open: false,
    event: null,
    ratings: [0, 0, 0, 0, 0],
    comments: '',
    submitted: false,
    fields: [],
    customResponses: {},
    certIssued: false,
    loadingForm: false,
  });

  const loadData = async () => {
    try {
      const [eventsRes, dashRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/student/dashboard'),
      ]);

      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setEvents(data.events || []);
      }

      if (dashRes.ok) {
        const dData = await dashRes.json();
        setRegistrations(dData.registrations || []);
        setAttendances(dData.attendances || []);
        setCertificates(dData.certificates || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const registeredEventIds = new Set(registrations.map((r) => r.eventId));

  // Calendar helpers
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  const eventDays = new Set(
    events
      .filter((e) => {
        const d = new Date(e.startDate);
        return d.getFullYear() === calYear && d.getMonth() === calMonth;
      })
      .map((e) => new Date(e.startDate).getDate())
  );

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11); }
    else setCalMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0); }
    else setCalMonth((m) => m + 1);
  };

  const handleRegister = async (eventId: string) => {
    setRegisteringEventId(eventId);
    setRegFeedback(null);

    try {
      const studentCourse = user?.course || user?.department || 'BSIT';
      const studentYearLevel = user?.yearLevel || '1st Year';
      const studentSection = COURSE_SECTION_MAP[studentCourse] || user?.section || 'D';
      const studentYearSection = user?.yearSection || `${getYearDigit(studentYearLevel)}${studentSection}`;

      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          studentName: user?.name || 'Student',
          studentNumber: user?.studentNumber || '',
          email: user?.email || '',
          department: studentCourse,
          course: studentCourse,
          yearSection: studentYearSection,
          yearLevel: studentYearLevel,
          section: studentSection,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setRegFeedback({
          eventId,
          message: data.message || 'Registration successful! Personal QR ticket generated.',
          qrToken: data.registration?.qrToken,
          isError: false,
        });
        await loadData();
      } else {
        setRegFeedback({
          eventId,
          message: data.message || 'Registration failed.',
          isError: true,
        });
      }
    } catch (err: any) {
      setRegFeedback({
        eventId,
        message: err.message || 'Registration failed.',
        isError: true,
      });
    } finally {
      setRegisteringEventId(null);
    }
  };

  const openEval = async (event: Event) => {
    setEvalModal({
      open: true,
      event,
      ratings: [0, 0, 0, 0, 0],
      comments: '',
      submitted: false,
      fields: [],
      customResponses: {},
      certIssued: false,
      loadingForm: true,
    });
    try {
      const res = await fetch(`/api/events/${event.id}/forms?type=EVALUATION`);
      if (res.ok) {
        const data = await res.json();
        if (data.form?.fields && data.form.fields.length > 0) {
          const initialResponses: Record<string, any> = {};
          data.form.fields.forEach((f: any) => {
            if (f.type === 'RATING') initialResponses[f.id] = 0;
            else initialResponses[f.id] = '';
          });
          setEvalModal((prev) => ({
            ...prev,
            fields: data.form.fields,
            customResponses: initialResponses,
            loadingForm: false,
          }));
          return;
        }
      }
    } catch (err) {
      console.error('Failed to load evaluation form schema:', err);
    }
    setEvalModal((prev) => ({ ...prev, loadingForm: false }));
  };

  const submitEval = async () => {
    if (!evalModal.event) return;
    try {
      const hasCustom = evalModal.fields && evalModal.fields.length > 0;
      const responsesPayload = hasCustom
        ? evalModal.customResponses
        : {
            q1: evalModal.ratings[0],
            q2: evalModal.ratings[1],
            q3: evalModal.ratings[2],
            q4: evalModal.ratings[3],
            q5: evalModal.ratings[4],
            comments: evalModal.comments,
          };

      const res = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: evalModal.event.id,
          studentId: user?.id || 'student-1',
          studentName: user?.name || 'Student',
          studentNumber: user?.studentNumber || '',
          studentEmail: user?.email || '',
          responses: responsesPayload,
        }),
      });
      const data = await res.json();
      setEvalModal((prev) => ({
        ...prev,
        submitted: true,
        certIssued: !!data.certificateIssued,
      }));

      await loadData();
    } catch (err) {
      console.error('Evaluation failed', err);
    }
  };

  const EVAL_QUESTIONS = [
    'Overall Event Organization',
    'Quality of Content / Speakers',
    'Venue and Facilities',
    'Registration & Check-in Process',
    'Would Recommend to Others',
  ];

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Manila' });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Manila' });
  };

  const getStatusStyle = (status: string): { bg: string; color: string; label: string } => {
    switch (status) {
      case 'UPCOMING': return { bg: '#EFF6FF', color: '#2563EB', label: 'Upcoming' };
      case 'ONGOING': return { bg: '#ECFDF5', color: '#059669', label: 'Ongoing' };
      case 'COMPLETED': return { bg: '#F1F5F9', color: '#475569', label: 'Completed' };
      case 'CANCELLED': return { bg: '#FEF2F2', color: '#DC2626', label: 'Cancelled' };
      default: return { bg: '#F8FAFC', color: '#64748B', label: status };
    }
  };

  const TABS: { id: TabId; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'events', label: 'Upcoming Events', icon: <IconList />, count: events.length },
    { id: 'registrations', label: 'My Registered Events', icon: <IconTicket />, count: registrations.length },
    { id: 'attendance', label: 'Attendance History', icon: <IconCheckCircle />, count: attendances.length },
    { id: 'certificates', label: 'E-Certificates', icon: <IconAward />, count: certificates.length },
    { id: 'calendar', label: 'Event Calendar', icon: <IconCalendar /> },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Welcome Header */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '24px 28px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', margin: '0 0 6px 0', fontFamily: 'var(--font-heading)' }}>
            Welcome, {user?.name?.split(' ')[0] || 'Student'}
          </h1>
          <p style={{ color: '#64748B', fontSize: '13.5px', margin: 0 }}>
            {user?.studentNumber && (
              <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#1E40AF', background: '#EFF6FF', padding: '2px 8px', borderRadius: '6px', marginRight: '8px' }}>
                {user.studentNumber}
              </span>
            )}
            <span>{user?.department || 'University of Rizal System – Cainta Campus'}</span>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ textAlign: 'center', background: '#F8FAFC', padding: '10px 16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#2563EB' }}>{registrations.length}</div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Registered</div>
          </div>
          <div style={{ textAlign: 'center', background: '#F8FAFC', padding: '10px 16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#059669' }}>{attendances.length}</div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Attended</div>
          </div>
          <div style={{ textAlign: 'center', background: '#F8FAFC', padding: '10px 16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#D97706' }}>{certificates.length}</div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>E-Certs</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '6px',
        background: '#F1F5F9',
        borderRadius: '12px',
        padding: '5px',
        marginBottom: '24px',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '9px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: isActive ? '700' : '600',
                fontSize: '13px',
                background: isActive ? '#FFFFFF' : 'transparent',
                color: isActive ? '#1E3A8A' : '#64748B',
                boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  background: isActive ? '#EFF6FF' : '#E2E8F0',
                  color: isActive ? '#2563EB' : '#64748B',
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Area */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          Loading student portal...
        </div>
      ) : (
        <>
          {/* ================= TAB 1: UPCOMING EVENTS ================= */}
          {activeTab === 'events' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {events.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                  No campus events scheduled at this time.
                </div>
              ) : (
                events.map((event) => {
                  const st = getStatusStyle(event.status);
                  const isRegistered = registeredEventIds.has(event.id);
                  const canRegister = event.registrationOpen && event.status !== 'COMPLETED' && event.status !== 'CANCELLED';
                  const canEvaluate = event.status === 'COMPLETED' || event.evaluationOpen;
                  const feedback = regFeedback?.eventId === event.id ? regFeedback : null;

                  return (
                    <div
                      key={event.id}
                      style={{
                        background: '#FFFFFF',
                        borderRadius: '14px',
                        border: '1px solid #E2E8F0',
                        padding: '22px 24px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        transition: 'border-color 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '260px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: st.color, background: st.bg, padding: '3px 10px', borderRadius: '20px' }}>
                              {st.label}
                            </span>
                            {isRegistered && (
                              <span style={{ fontSize: '11px', fontWeight: '700', color: '#059669', background: '#ECFDF5', padding: '3px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <IconCheckCircle /> Registered
                              </span>
                            )}
                          </div>

                          <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', marginBottom: '8px', lineHeight: '1.3' }}>
                            <Link href={`/events/${event.id}`} style={{ color: '#0F172A', textDecoration: 'none' }}>
                              {event.title}
                            </Link>
                          </h3>

                          <p style={{ fontSize: '13.5px', color: '#64748B', marginBottom: '12px', lineHeight: '1.5' }}>
                            {event.description?.slice(0, 160)}...
                          </p>

                          <div style={{ display: 'flex', gap: '18px', fontSize: '12.5px', color: '#64748B', flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <IconClock />
                              {formatDate(event.startDate)} · {formatTime(event.startDate)}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <IconMapPin />
                              {event.venue}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0, minWidth: '140px' }}>
                          <Link
                            href={`/events/${event.id}`}
                            style={{
                              padding: '8px 14px',
                              background: '#F8FAFC',
                              color: '#334155',
                              border: '1px solid #CBD5E1',
                              borderRadius: '8px',
                              fontWeight: '600',
                              fontSize: '12.5px',
                              textAlign: 'center',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                            }}
                          >
                            <span>View Details</span>
                            <IconExternalLink />
                          </Link>

                          {canRegister && (
                            <button
                              onClick={() => handleRegister(event.id)}
                              disabled={registeringEventId === event.id || isRegistered}
                              style={{
                                padding: '9px 16px',
                                background: isRegistered ? '#ECFDF5' : 'linear-gradient(135deg, #1E3A8A, #2563EB)',
                                color: isRegistered ? '#059669' : '#FFFFFF',
                                border: isRegistered ? '1px solid #A7F3D0' : 'none',
                                borderRadius: '8px',
                                fontWeight: '700',
                                fontSize: '13px',
                                cursor: registeringEventId === event.id || isRegistered ? 'default' : 'pointer',
                                fontFamily: 'inherit',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {isRegistered ? 'Already Registered' : registeringEventId === event.id ? 'Registering...' : 'Register Now'}
                            </button>
                          )}

                          {canEvaluate && (
                            <button
                              onClick={() => openEval(event)}
                              style={{
                                padding: '9px 16px',
                                background: '#FFFFFF',
                                color: '#D97706',
                                border: '1px solid #FDE68A',
                                borderRadius: '8px',
                                fontWeight: '700',
                                fontSize: '13px',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Evaluate Event
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Live Feedback Banner */}
                      {feedback && (
                        <div style={{
                          background: feedback.isError ? '#FEF2F2' : '#ECFDF5',
                          border: `1px solid ${feedback.isError ? '#FECACA' : '#A7F3D0'}`,
                          color: feedback.isError ? '#DC2626' : '#065F46',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '8px',
                        }}>
                          <span>{feedback.message}</span>
                          {feedback.qrToken && (
                            <Link
                              href={`/ticket/${feedback.qrToken}`}
                              style={{
                                fontWeight: '700',
                                color: '#047857',
                                textDecoration: 'underline',
                              }}
                            >
                              View Personal Attendance QR Ticket →
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ================= TAB 2: MY REGISTERED EVENTS & TICKETS ================= */}
          {activeTab === 'registrations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {registrations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                  <div style={{ color: '#94A3B8', marginBottom: '12px' }}><IconTicket /></div>
                  <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>No Registered Events Yet</h3>
                  <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '18px' }}>Explore upcoming campus events and register to receive your Personal Attendance QR Ticket.</p>
                  <button
                    onClick={() => setActiveTab('events')}
                    style={{ padding: '9px 18px', background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                  >
                    Browse Upcoming Events →
                  </button>
                </div>
              ) : (
                registrations.map((reg) => (
                  <div
                    key={reg.id}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '14px',
                      border: '1px solid #E2E8F0',
                      padding: '20px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '16px',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#2563EB', background: '#EFF6FF', padding: '3px 9px', borderRadius: '12px' }}>
                        Registered Pass
                      </span>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: '6px 0 4px 0' }}>
                        {reg.eventTitle || 'Campus Event'}
                      </h3>
                      <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0 }}>
                        Registration Date: {formatDate(reg.registrationDate)} · Class: {reg.yearSection}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <Link
                        href={`/ticket/${reg.qrToken}`}
                        style={{
                          padding: '9px 16px',
                          background: 'linear-gradient(135deg, #1E3A8A, #2563EB)',
                          color: '#FFFFFF',
                          borderRadius: '8px',
                          fontWeight: '700',
                          fontSize: '13px',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>Open QR Ticket</span>
                        <IconExternalLink />
                      </Link>
                      <Link
                        href={`/events/${reg.eventId}`}
                        style={{
                          padding: '9px 14px',
                          background: '#F8FAFC',
                          color: '#475569',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          fontWeight: '600',
                          fontSize: '13px',
                          textDecoration: 'none',
                        }}
                      >
                        Event Page
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ================= TAB 3: ATTENDANCE HISTORY ================= */}
          {activeTab === 'attendance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {attendances.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                  <div style={{ color: '#94A3B8', marginBottom: '12px' }}><IconCheckCircle /></div>
                  <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>No Attendance Scans Yet</h3>
                  <p style={{ color: '#64748B', fontSize: '13px' }}>Your check-in records will appear here once an event officer scans your Personal QR Ticket at the venue.</p>
                </div>
              ) : (
                attendances.map((att) => (
                  <div
                    key={att.id}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '14px',
                      border: '1px solid #E2E8F0',
                      padding: '20px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '16px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#059669', background: '#ECFDF5', padding: '3px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <IconCheckCircle /> Verified Check-In
                        </span>
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: '4px 0' }}>
                        {att.eventTitle || 'Campus Event'}
                      </h3>
                      <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0 }}>
                        Check-in Time: {formatDate(att.checkInTime)} · {formatTime(att.checkInTime)}
                        {att.scannedByOfficerName && ` · Verified by: ${att.scannedByOfficerName}`}
                      </p>
                    </div>

                    <Link
                      href={`/events/${att.eventId}`}
                      style={{
                        padding: '8px 14px',
                        background: '#F8FAFC',
                        color: '#334155',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        fontSize: '12.5px',
                        fontWeight: '600',
                        textDecoration: 'none',
                      }}
                    >
                      View Event
                    </Link>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ================= TAB 4: MY E-CERTIFICATES ================= */}
          {activeTab === 'certificates' && (
            <div>
              {certificates.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 32px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                  <div style={{ color: '#CBD5E1', marginBottom: '12px' }}><IconAward /></div>
                  <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>No E-Certificates Issued Yet</h3>
                  <p style={{ color: '#94A3B8', fontSize: '13.5px' }}>Attend registered events and submit evaluations to receive your official tamper-proof e-certificates.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                  {certificates.map((cert) => (
                    <div
                      key={cert.id}
                      style={{
                        background: 'linear-gradient(135deg, #FFFBEB 0%, #FFFFFF 65%)',
                        border: '1px solid #FDE68A',
                        borderRadius: '14px',
                        padding: '22px',
                        boxShadow: '0 2px 8px rgba(217,119,6,0.08)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <span style={{ color: '#D97706' }}><IconAward /></span>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Certificate of {cert.certificateType}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '15.5px', fontWeight: '800', color: '#0F172A', marginBottom: '6px', lineHeight: '1.3' }}>
                        {cert.eventTitle}
                      </h3>
                      <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '14px' }}>
                        Issued: {formatDate(cert.issuedAt)} · Code: <code style={{ color: '#1E40AF', fontWeight: '700' }}>{cert.verificationCode}</code>
                      </p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <a
                          href={`/api/certificates/download/${cert.verificationCode}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            background: '#F59E0B',
                            color: '#FFFFFF',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '700',
                            textDecoration: 'none',
                          }}
                        >
                          <IconDownload /> Download PDF
                        </a>
                        <a
                          href={`/verify/${cert.verificationCode}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            background: '#FFFFFF',
                            color: '#64748B',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            textDecoration: 'none',
                          }}
                        >
                          Verify Online
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 5: EVENT CALENDAR ================= */}
          {activeTab === 'calendar' && (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '24px', maxWidth: '560px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px', display: 'flex', borderRadius: '6px' }}>
                  <IconChevronLeft />
                </button>
                <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  {MONTHS[calMonth]} {calYear}
                </h2>
                <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px', display: 'flex', borderRadius: '6px' }}>
                  <IconChevronRight />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
                {DAYS.map((d) => (
                  <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: '700', color: '#94A3B8', padding: '4px 0' }}>
                    {d}
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const isToday = day === now.getDate() && calMonth === now.getMonth() && calYear === now.getFullYear();
                  const hasEvent = eventDays.has(day);
                  return (
                    <div
                      key={day}
                      style={{
                        aspectRatio: '1',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: isToday ? '800' : '500',
                        color: isToday ? '#FFFFFF' : hasEvent ? '#1E3A8A' : '#334155',
                        background: isToday ? '#2563EB' : hasEvent ? '#EFF6FF' : 'transparent',
                        border: hasEvent && !isToday ? '1px solid #BFDBFE' : 'none',
                        position: 'relative',
                        cursor: hasEvent ? 'pointer' : 'default',
                      }}
                    >
                      {day}
                      {hasEvent && !isToday && (
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#2563EB', marginTop: '2px' }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Evaluation Modal */}
      {evalModal.open && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: '20px',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '18px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            {evalModal.submitted ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" style={{ margin: '0 auto', display: 'block' }}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                  Evaluation Submitted!
                </h3>
                <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '16px' }}>
                  Thank you for your feedback on {evalModal.event?.title}.
                </p>
                {evalModal.certIssued && (
                  <div style={{
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    marginBottom: '20px',
                    fontSize: '13px',
                    color: '#065F46',
                    textAlign: 'left',
                    lineHeight: '1.5',
                  }}>
                    <div style={{ fontWeight: '700', marginBottom: '3px' }}>E-Certificate Issued!</div>
                    Your Certificate of Participation has been automatically generated and is now ready under the <strong>E-Certificates</strong> tab.
                  </div>
                )}
                <button
                  onClick={() => setEvalModal((s) => ({ ...s, open: false }))}
                  style={{
                    padding: '10px 24px',
                    background: '#2563EB',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Close
                </button>
              </div>
            ) : evalModal.loadingForm ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                Loading evaluation form...
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>
                    Event Evaluation
                  </h2>
                  <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>{evalModal.event?.title}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {evalModal.fields && evalModal.fields.length > 0 ? (
                    evalModal.fields.map((field: any, fi: number) => (
                      <div key={field.id || fi}>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                          {fi + 1}. {field.label} {field.required && <span style={{ color: '#DC2626' }}>*</span>}
                        </p>
                        {field.type === 'RATING' && (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {[1, 2, 3, 4, 5].map((star) => {
                              const currentVal = evalModal.customResponses?.[field.id] || 0;
                              return (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setEvalModal((prev) => ({
                                    ...prev,
                                    customResponses: { ...prev.customResponses, [field.id]: star },
                                  }))}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: star <= currentVal ? '#F59E0B' : '#CBD5E1',
                                    transition: 'color 0.15s ease',
                                    padding: '2px',
                                  }}
                                >
                                  <IconStar filled={star <= currentVal} />
                                </button>
                              );
                            })}
                            <span style={{ fontSize: '12px', color: '#94A3B8', marginLeft: '4px' }}>
                              {(evalModal.customResponses?.[field.id] || 0) > 0 ? `${evalModal.customResponses?.[field.id]}/5` : 'Rate 1-5'}
                            </span>
                          </div>
                        )}
                        {field.type === 'LONG_TEXT' && (
                          <textarea
                            rows={3}
                            value={evalModal.customResponses?.[field.id] || ''}
                            onChange={(e) => setEvalModal((prev) => ({
                              ...prev,
                              customResponses: { ...prev.customResponses, [field.id]: e.target.value },
                            }))}
                            placeholder="Your feedback..."
                            style={{
                              width: '100%',
                              padding: '9px 12px',
                              border: '1px solid #E2E8F0',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontFamily: 'inherit',
                              resize: 'vertical',
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />
                        )}
                        {field.type === 'SHORT_TEXT' && (
                          <input
                            type="text"
                            value={evalModal.customResponses?.[field.id] || ''}
                            onChange={(e) => setEvalModal((prev) => ({
                              ...prev,
                              customResponses: { ...prev.customResponses, [field.id]: e.target.value },
                            }))}
                            placeholder="Your response..."
                            style={{
                              width: '100%',
                              padding: '9px 12px',
                              border: '1px solid #E2E8F0',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontFamily: 'inherit',
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    <>
                      {EVAL_QUESTIONS.map((q, qi) => (
                        <div key={qi}>
                          <p style={{ fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                            {qi + 1}. {q}
                          </p>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setEvalModal((prev) => {
                                  const r = [...prev.ratings];
                                  r[qi] = star;
                                  return { ...prev, ratings: r };
                                })}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: star <= evalModal.ratings[qi] ? '#F59E0B' : '#CBD5E1',
                                  transition: 'color 0.15s ease',
                                  padding: '2px',
                                }}
                              >
                                <IconStar filled={star <= evalModal.ratings[qi]} />
                              </button>
                            ))}
                            <span style={{ fontSize: '12px', color: '#94A3B8', marginLeft: '4px', alignSelf: 'center' }}>
                              {evalModal.ratings[qi] > 0 ? `${evalModal.ratings[qi]}/5` : 'No rating'}
                            </span>
                          </div>
                        </div>
                      ))}

                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                          Additional Comments (Optional)
                        </label>
                        <textarea
                          value={evalModal.comments}
                          onChange={(e) => setEvalModal((prev) => ({ ...prev, comments: e.target.value }))}
                          placeholder="Share your thoughts about the event..."
                          rows={3}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            border: '1px solid #E2E8F0',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontFamily: 'inherit',
                            resize: 'vertical',
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                  <button
                    onClick={() => setEvalModal((s) => ({ ...s, open: false }))}
                    style={{
                      flex: 1,
                      padding: '11px',
                      background: '#F8FAFC',
                      color: '#64748B',
                      border: '1px solid #E2E8F0',
                      borderRadius: '10px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitEval}
                    disabled={
                      evalModal.fields && evalModal.fields.length > 0
                        ? evalModal.fields.some((f: any) => f.required && f.type === 'RATING' && !evalModal.customResponses?.[f.id])
                        : evalModal.ratings.some((r) => r === 0)
                    }
                    style={{
                      flex: 2,
                      padding: '11px',
                      background: 'linear-gradient(135deg, #1E3A8A, #2563EB)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Submit Evaluation
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
