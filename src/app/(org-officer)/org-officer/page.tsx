'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

// --- SVG Icons ---
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconEdit = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconFileText = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
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
const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconToggleOn = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="5" width="22" height="14" rx="7" ry="7"/>
    <circle cx="16" cy="12" r="3" fill="currentColor"/>
  </svg>
);
const IconToggleOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="5" width="22" height="14" rx="7" ry="7"/>
    <circle cx="8" cy="12" r="3" fill="currentColor"/>
  </svg>
);
const IconClipboardList = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/>
  </svg>
);
const IconScan = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/>
    <path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
    <line x1="7" y1="12" x2="17" y2="12"/>
  </svg>
);
const IconStar = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconAward = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);

interface CampusEvent {
  id: string;
  title: string;
  description: string;
  venue: string;
  startDate: string;
  endDate: string;
  status: string;
  registrationOpen?: boolean;
  evaluationOpen?: boolean;
  createdById?: string;
}

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  DRAFT: { bg: '#F1F5F9', color: '#475569', label: 'Draft' },
  PENDING_APPROVAL: { bg: '#FFF7ED', color: '#C2410C', label: 'Pending Approval' },
  UPCOMING: { bg: '#EFF6FF', color: '#2563EB', label: 'Upcoming' },
  ONGOING: { bg: '#ECFDF5', color: '#059669', label: 'Ongoing' },
  COMPLETED: { bg: '#F1F5F9', color: '#475569', label: 'Completed' },
  CANCELLED: { bg: '#FEF2F2', color: '#DC2626', label: 'Cancelled' },
};

const VENUES = [
  'Laboratory Room', 'Room 301', 'Karangalan Court',
  'Computer Laboratory 404', 'AVR – Audio Visual Room', 'Gymnasium', 'Open Court',
];

export default function OrgOfficerEventsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Create form state
  const [form, setForm] = useState({
    title: '', description: '', venue: '',
    startDate: '', endDate: '', regOpens: '', regCloses: '',
  });

  const loadEvents = async () => {
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        // Filter to events created by this officer
        const mine = data.events?.filter((e: CampusEvent) =>
          !user?.role || e.createdById === user?.id ||
          user?.role === 'OSDS_OFFICER' || user?.role === 'ADMIN'
        ) || [];
        setEvents(mine);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEvents(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          venue: form.venue,
          startDate: new Date(form.startDate).toISOString(),
          endDate: new Date(form.endDate).toISOString(),
          registrationOpensAt: form.regOpens ? new Date(form.regOpens).toISOString() : undefined,
          registrationClosesAt: form.regCloses ? new Date(form.regCloses).toISOString() : undefined,
          status: user?.role === 'OSDS_OFFICER' || user?.role === 'ADMIN' ? 'UPCOMING' : 'PENDING_APPROVAL',
        }),
      });
      if (res.ok) {
        setShowCreateModal(false);
        setForm({ title: '', description: '', venue: '', startDate: '', endDate: '', regOpens: '', regCloses: '' });
        await loadEvents();
      } else {
        const data = await res.json();
        setCreateError(data.error || 'Failed to create event.');
      }
    } catch {
      setCreateError('Network error. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const toggleRegistration = async (eventId: string, current: boolean) => {
    try {
      await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationOpen: !current }),
      });
      await loadEvents();
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  const toggleEvaluation = async (eventId: string, current: boolean) => {
    try {
      await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evaluationOpen: !current }),
      });
      await loadEvents();
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Manila'
  });
  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('en-PH', {
    hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Manila'
  });

  const roleLabel = user?.role === 'OSDS_OFFICER' ? 'OSDS Officer' : user?.role === 'ADMIN' ? 'Admin' : 'Org. Officer';

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>
            {user?.role === 'OSDS_OFFICER' ? 'All Events' : 'My Events'}
          </h1>
          <p style={{ color: '#64748B', fontSize: '14px' }}>
            {roleLabel} · {user?.department || 'URS Cainta'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #1E3A8A, #2563EB)',
            color: '#FFFFFF', border: 'none', borderRadius: '10px',
            fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
          }}
        >
          <IconPlus /> Create Event
        </button>
      </div>

      {/* Events List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          Loading events...
        </div>
      ) : events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <p style={{ color: '#94A3B8', fontSize: '15px', marginBottom: '16px' }}>
            No events yet. Create your first event to get started.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '10px 24px', background: '#2563EB', color: '#FFFFFF',
              border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit'
            }}
          >
            Create Event
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {events.map(event => {
            const st = STATUS_STYLE[event.status] || STATUS_STYLE.DRAFT;
            return (
              <div key={event.id} style={{
                background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0',
                padding: '20px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: st.color, background: st.bg, padding: '2px 9px', borderRadius: '20px' }}>
                        {st.label}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                      {event.title}
                    </h3>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#94A3B8', flexWrap: 'wrap', marginBottom: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <IconClock /> {formatDate(event.startDate)} · {formatTime(event.startDate)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <IconMapPin /> {event.venue}
                      </span>
                    </div>

                    {/* Toggle Switches */}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => toggleRegistration(event.id, !!event.registrationOpen)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '5px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                          fontSize: '12px', fontWeight: '600', fontFamily: 'inherit',
                          background: event.registrationOpen ? '#ECFDF5' : '#F1F5F9',
                          color: event.registrationOpen ? '#059669' : '#64748B',
                        }}
                      >
                        {event.registrationOpen ? <IconToggleOn /> : <IconToggleOff />}
                        Registration {event.registrationOpen ? 'Open' : 'Closed'}
                      </button>
                      <button
                        onClick={() => toggleEvaluation(event.id, !!event.evaluationOpen)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '5px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                          fontSize: '12px', fontWeight: '600', fontFamily: 'inherit',
                          background: event.evaluationOpen ? '#FFF7ED' : '#F1F5F9',
                          color: event.evaluationOpen ? '#D97706' : '#64748B',
                        }}
                      >
                        {event.evaluationOpen ? <IconToggleOn /> : <IconToggleOff />}
                        Evaluation {event.evaluationOpen ? 'Open' : 'Closed'}
                      </button>
                    </div>
                  </div>

                  {/* Event Options Suite */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0, minWidth: '170px' }}>
                    <Link
                      href={`/org-officer/events/${event.id}`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '7px',
                        padding: '7px 12px', background: '#F8FAFC',
                        color: '#334155', border: '1px solid #CBD5E1', borderRadius: '8px',
                        fontSize: '12px', fontWeight: '700', textDecoration: 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <IconFileText /> Event Hub
                    </Link>
                    <Link
                      href={`/org-officer/events/${event.id}/registration-form`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '7px',
                        padding: '7px 12px', background: '#EFF6FF',
                        color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: '8px',
                        fontSize: '12px', fontWeight: '700', textDecoration: 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <IconClipboardList /> Reg. Form
                    </Link>

                    <Link
                      href={`/org-officer/events/${event.id}/evaluation-form`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '7px',
                        padding: '7px 12px', background: '#FFFBEB',
                        color: '#D97706', border: '1px solid #FDE68A', borderRadius: '8px',
                        fontSize: '12px', fontWeight: '700', textDecoration: 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <IconStar /> Eval. Form
                    </Link>
                    <Link
                      href={`/org-officer/events/${event.id}?tab=document`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '7px',
                        padding: '7px 12px', background: '#F0FDF4',
                        color: '#15803D', border: '1px solid #BBF7D0', borderRadius: '8px',
                        fontSize: '12px', fontWeight: '700', textDecoration: 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <IconFileText /> Document
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: '20px', backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '18px', padding: '32px',
            maxWidth: '560px', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            maxHeight: '92vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>Create New Event</h2>
              <button onClick={() => setShowCreateModal(false)} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '4px', display: 'flex'
              }}>
                <IconX />
              </button>
            </div>

            {user?.role === 'ORG_OFFICER' && (
              <div style={{
                background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '10px',
                padding: '10px 14px', marginBottom: '18px', fontSize: '13px', color: '#9A3412'
              }}>
                Your event will be submitted for OSDS Officer approval before going live.
              </div>
            )}

            {createError && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                {createError}
              </div>
            )}

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Event Title', key: 'title', type: 'text', placeholder: 'e.g. BSIT Innovation Summit 2026' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '5px' }}>{field.label}</label>
                  <input
                    type={field.type}
                    required
                    placeholder={field.placeholder}
                    value={(form as any)[field.key]}
                    onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '9px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '5px' }}>Description</label>
                <textarea
                  required
                  placeholder="Describe the event, its goals and activities..."
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '9px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '5px' }}>Venue</label>
                <select
                  required
                  value={form.venue}
                  onChange={e => setForm(prev => ({ ...prev, venue: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '9px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                >
                  <option value="">Select a venue...</option>
                  {VENUES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Start Date & Time', key: 'startDate' },
                  { label: 'End Date & Time', key: 'endDate' },
                  { label: 'Registration Opens', key: 'regOpens' },
                  { label: 'Registration Closes', key: 'regCloses' },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '5px' }}>{field.label}</label>
                    <input
                      type="datetime-local"
                      required={field.key === 'startDate' || field.key === 'endDate'}
                      value={(form as any)[field.key]}
                      onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #E2E8F0', borderRadius: '9px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ flex: 1, padding: '11px', background: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  style={{
                    flex: 2, padding: '11px',
                    background: creating ? '#93C5FD' : 'linear-gradient(135deg, #1E3A8A, #2563EB)',
                    color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: '700',
                    cursor: creating ? 'not-allowed' : 'pointer', fontFamily: 'inherit'
                  }}
                >
                  {creating ? 'Creating...' : user?.role === 'ORG_OFFICER' ? 'Submit for Approval' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
