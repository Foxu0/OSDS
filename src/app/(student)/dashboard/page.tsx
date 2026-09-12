'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

// --- SVG Icons ---
const IconCalendar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconList = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);
const IconAward = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);
const IconMapPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconDownload = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const IconStar = ({ filled }: { filled?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconChevronLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const IconChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

type TabId = 'calendar' | 'events' | 'certificates';

interface Event {
  id: string;
  title: string;
  venue: string;
  startDate: string;
  endDate: string;
  status: string;
  registrationOpen?: boolean;
  evaluationOpen?: boolean;
  description: string;
}

interface Certificate {
  id: string;
  verificationCode: string;
  certificateType: string;
  eventTitle: string;
  issuedAt: string;
  status: string;
}

// Rating modal state
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

  const [activeTab, setActiveTab] = useState<TabId>('calendar');
  const [events, setEvents] = useState<Event[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar state
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  // Registration feedback state
  const [registeringEventId, setRegisteringEventId] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsRes = await fetch('/api/events');
        if (eventsRes.ok) {
          const data = await eventsRes.json();
          setEvents(data.events || []);
        }

        const certsRes = await fetch('/api/student/certificates');
        if (certsRes.ok) {
          const data = await certsRes.json();
          setCertificates(data.certificates || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calendar helpers
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  const eventDays = new Set(
    events
      .filter(e => {
        const d = new Date(e.startDate);
        return d.getFullYear() === calYear && d.getMonth() === calMonth;
      })
      .map(e => new Date(e.startDate).getDate())
  );

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };

  const handleRegister = async (eventId: string) => {
    setRegisteringEventId(eventId);
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          studentName: user?.name || 'Demo Student',
          studentNumber: user?.studentNumber || 'C2024-00001',
          email: user?.email || 'student@urs.edu.ph',
          department: user?.department || 'Computing',
          yearSection: '3B',
        }),
      });
      if (res.ok) {
        setRegSuccess(eventId);
        setTimeout(() => setRegSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Registration failed', err);
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
          setEvalModal(prev => ({
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
    setEvalModal(prev => ({ ...prev, loadingForm: false }));
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
          studentId: user?.id || 'demo-student-1',
          studentName: user?.name || 'Demo Student',
          studentNumber: user?.studentNumber || 'C2024-00001',
          studentEmail: user?.email || '',
          responses: responsesPayload,
        }),
      });
      const data = await res.json();
      setEvalModal(prev => ({
        ...prev,
        submitted: true,
        certIssued: !!data.certificateIssued,
      }));

      // Refresh student certificates so the newly issued certificate appears immediately
      const certsRes = await fetch('/api/student/certificates');
      if (certsRes.ok) {
        const cData = await certsRes.json();
        setCertificates(cData.certificates || []);
      }
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

  const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'calendar', label: 'Event Calendar', icon: <IconCalendar /> },
    { id: 'events', label: 'Event List', icon: <IconList /> },
    { id: 'certificates', label: 'My E-Certificates', icon: <IconAward /> },
  ];

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* Welcome Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>
          Welcome back, {user?.name?.split(' ')[0] || 'Student'}
        </h1>
        <p style={{ color: '#64748B', fontSize: '14px' }}>
          {user?.studentNumber && <span style={{ fontWeight: '600', color: '#475569' }}>{user.studentNumber} · </span>}
          {user?.department || 'URS Cainta Campus'}
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '4px', background: '#F1F5F9',
        borderRadius: '12px', padding: '4px', marginBottom: '24px',
        width: 'fit-content'
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '9px 18px', borderRadius: '9px', border: 'none', cursor: 'pointer',
              fontWeight: activeTab === tab.id ? '700' : '500',
              fontSize: '13px',
              background: activeTab === tab.id ? '#FFFFFF' : 'transparent',
              color: activeTab === tab.id ? '#1E3A8A' : '#64748B',
              boxShadow: activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s ease', fontFamily: 'inherit'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          Loading...
        </div>
      ) : (
        <>
          {/* CALENDAR TAB */}
          {activeTab === 'calendar' && (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '24px', maxWidth: '540px' }}>
              {/* Calendar Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px', display: 'flex', borderRadius: '6px' }}>
                  <IconChevronLeft />
                </button>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>
                  {MONTHS[calMonth]} {calYear}
                </h2>
                <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px', display: 'flex', borderRadius: '6px' }}>
                  <IconChevronRight />
                </button>
              </div>

              {/* Day Labels */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
                {DAYS.map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: '700', color: '#94A3B8', padding: '4px 0' }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
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
                        transition: 'background 0.15s ease'
                      }}
                    >
                      {day}
                      {hasEvent && !isToday && (
                        <div style={{
                          width: '4px', height: '4px', borderRadius: '50%',
                          background: '#2563EB', marginTop: '2px'
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '16px', fontSize: '12px', color: '#64748B' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563EB' }} />
                  Today
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EFF6FF', border: '1px solid #BFDBFE' }} />
                  Event day
                </div>
              </div>
            </div>
          )}

          {/* EVENTS TAB */}
          {activeTab === 'events' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {events.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                  No events available at the moment.
                </div>
              ) : events.map(event => {
                const st = getStatusStyle(event.status);
                const canRegister = event.registrationOpen && event.status !== 'COMPLETED' && event.status !== 'CANCELLED';
                const canEvaluate = event.status === 'COMPLETED' || event.evaluationOpen;
                return (
                  <div key={event.id} style={{
                    background: '#FFFFFF', borderRadius: '14px',
                    border: '1px solid #E2E8F0', padding: '20px 22px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                    gap: '16px', flexWrap: 'wrap'
                  }}>
                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: st.color, background: st.bg, padding: '2px 9px', borderRadius: '20px' }}>
                          {st.label}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '8px', lineHeight: '1.3' }}>
                        {event.title}
                      </h3>
                      <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '10px', lineHeight: '1.5' }}>
                        {event.description?.slice(0, 120)}...
                      </p>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#94A3B8', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <IconClock />
                          {formatDate(event.startDate)} · {formatTime(event.startDate)}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <IconMapPin />
                          {event.venue}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                      {canRegister && (
                        <button
                          onClick={() => handleRegister(event.id)}
                          disabled={registeringEventId === event.id || regSuccess === event.id}
                          style={{
                            padding: '9px 18px',
                            background: regSuccess === event.id ? '#ECFDF5' : 'linear-gradient(135deg, #1E3A8A, #2563EB)',
                            color: regSuccess === event.id ? '#059669' : '#FFFFFF',
                            border: regSuccess === event.id ? '1px solid #A7F3D0' : 'none',
                            borderRadius: '9px', fontWeight: '700', fontSize: '13px',
                            cursor: registeringEventId === event.id ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit', transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {regSuccess === event.id ? 'Registered!' : registeringEventId === event.id ? 'Registering...' : 'Register'}
                        </button>
                      )}
                      {canEvaluate && (
                        <button
                          onClick={() => openEval(event)}
                          style={{
                            padding: '9px 18px',
                            background: '#FFFFFF',
                            color: '#D97706',
                            border: '1px solid #FDE68A',
                            borderRadius: '9px', fontWeight: '700', fontSize: '13px',
                            cursor: 'pointer', fontFamily: 'inherit',
                            transition: 'all 0.15s ease', whiteSpace: 'nowrap'
                          }}
                        >
                          Evaluate
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CERTIFICATES TAB */}
          {activeTab === 'certificates' && (
            <div>
              {certificates.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '64px 32px',
                  background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0'
                }}>
                  <div style={{ color: '#CBD5E1', marginBottom: '12px' }}>
                    <IconAward />
                  </div>
                  <p style={{ color: '#94A3B8', fontSize: '14px' }}>
                    No e-certificates issued yet. Attend events to earn certificates!
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
                  {certificates.map(cert => (
                    <div key={cert.id} style={{
                      background: 'linear-gradient(135deg, #FFFBEB 0%, #FFF 60%)',
                      border: '1px solid #FDE68A', borderRadius: '14px',
                      padding: '20px', boxShadow: '0 2px 8px rgba(217,119,6,0.08)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <span style={{ color: '#D97706' }}><IconAward /></span>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {cert.certificateType}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', marginBottom: '6px', lineHeight: '1.3' }}>
                        {cert.eventTitle}
                      </h3>
                      <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '14px' }}>
                        Issued: {formatDate(cert.issuedAt)}
                      </p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <a
                          href={`/api/certificates/download/${cert.verificationCode}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 14px',
                            background: '#F59E0B', color: '#FFFFFF',
                            borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                            textDecoration: 'none', transition: 'all 0.15s ease'
                          }}
                        >
                          <IconDownload /> Download PDF
                        </a>
                        <a
                          href={`/verify/${cert.verificationCode}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 14px',
                            background: '#FFFFFF', color: '#64748B',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                            textDecoration: 'none', transition: 'all 0.15s ease'
                          }}
                        >
                          Verify
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Evaluation Modal */}
      {evalModal.open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: '20px', backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '18px', padding: '32px',
            maxWidth: '500px', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            {evalModal.submitted ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" style={{ margin: '0 auto', display: 'block' }}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
                  Evaluation Submitted!
                </h3>
                <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '16px' }}>
                  Thank you for your feedback on {evalModal.event?.title}.
                </p>
                {evalModal.certIssued && (
                  <div style={{
                    background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px',
                    padding: '14px 16px', marginBottom: '20px', fontSize: '13px', color: '#065F46',
                    textAlign: 'left', lineHeight: '1.5'
                  }}>
                    <div style={{ fontWeight: '700', marginBottom: '3px' }}>E-Certificate Issued!</div>
                    Your Certificate of Participation has been automatically generated and is now ready under the <strong>E-Certificates Received</strong> tab.
                  </div>
                )}
                <button onClick={() => setEvalModal(s => ({ ...s, open: false }))} style={{
                  padding: '10px 24px', background: '#2563EB', color: '#fff',
                  border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit'
                }}>
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
                  <p style={{ color: '#64748B', fontSize: '13px' }}>{evalModal.event?.title}</p>
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
                            {[1, 2, 3, 4, 5].map(star => {
                              const currentVal = evalModal.customResponses?.[field.id] || 0;
                              return (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setEvalModal(prev => ({
                                    ...prev,
                                    customResponses: { ...prev.customResponses, [field.id]: star }
                                  }))}
                                  style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: star <= currentVal ? '#F59E0B' : '#CBD5E1',
                                    transition: 'color 0.15s ease', padding: '2px'
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
                            onChange={e => setEvalModal(prev => ({
                              ...prev,
                              customResponses: { ...prev.customResponses, [field.id]: e.target.value }
                            }))}
                            placeholder="Your feedback..."
                            style={{
                              width: '100%', padding: '9px 12px', border: '1px solid #E2E8F0',
                              borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit',
                              resize: 'vertical', outline: 'none', boxSizing: 'border-box'
                            }}
                          />
                        )}
                        {field.type === 'SHORT_TEXT' && (
                          <input
                            type="text"
                            value={evalModal.customResponses?.[field.id] || ''}
                            onChange={e => setEvalModal(prev => ({
                              ...prev,
                              customResponses: { ...prev.customResponses, [field.id]: e.target.value }
                            }))}
                            placeholder="Your response..."
                            style={{
                              width: '100%', padding: '9px 12px', border: '1px solid #E2E8F0',
                              borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit',
                              outline: 'none', boxSizing: 'border-box'
                            }}
                          />
                        )}
                        {(field.type === 'RADIO' || field.type === 'DROPDOWN') && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {(field.options || ['Strongly Agree', 'Agree', 'Neutral', 'Disagree']).map((opt: string) => (
                              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                                <input
                                  type="radio"
                                  name={`field-${field.id}`}
                                  value={opt}
                                  checked={evalModal.customResponses?.[field.id] === opt}
                                  onChange={e => setEvalModal(prev => ({
                                    ...prev,
                                    customResponses: { ...prev.customResponses, [field.id]: e.target.value }
                                  }))}
                                />
                                {opt}
                              </label>
                            ))}
                          </div>
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
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setEvalModal(prev => {
                                  const r = [...prev.ratings];
                                  r[qi] = star;
                                  return { ...prev, ratings: r };
                                })}
                                style={{
                                  background: 'none', border: 'none', cursor: 'pointer',
                                  color: star <= evalModal.ratings[qi] ? '#F59E0B' : '#CBD5E1',
                                  transition: 'color 0.15s ease', padding: '2px'
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
                          onChange={e => setEvalModal(prev => ({ ...prev, comments: e.target.value }))}
                          placeholder="Share your thoughts about the event..."
                          rows={3}
                          style={{
                            width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0',
                            borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit',
                            resize: 'vertical', outline: 'none', boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                  <button
                    onClick={() => setEvalModal(s => ({ ...s, open: false }))}
                    style={{
                      flex: 1, padding: '11px', background: '#F8FAFC', color: '#64748B',
                      border: '1px solid #E2E8F0', borderRadius: '10px', fontWeight: '600',
                      cursor: 'pointer', fontFamily: 'inherit'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitEval}
                    disabled={
                      evalModal.fields && evalModal.fields.length > 0
                        ? evalModal.fields.some((f: any) => f.required && f.type === 'RATING' && !evalModal.customResponses?.[f.id])
                        : evalModal.ratings.some(r => r === 0)
                    }
                    style={{
                      flex: 2, padding: '11px',
                      background: (
                        evalModal.fields && evalModal.fields.length > 0
                          ? evalModal.fields.some((f: any) => f.required && f.type === 'RATING' && !evalModal.customResponses?.[f.id])
                          : evalModal.ratings.some(r => r === 0)
                      ) ? '#CBD5E1' : 'linear-gradient(135deg, #1E3A8A, #2563EB)',
                      color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: '700',
                      cursor: 'pointer', fontFamily: 'inherit'
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
