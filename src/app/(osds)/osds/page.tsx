'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getOrgOfficers, registerOrgOfficer, toggleOrgOfficerStatus } from '@/lib/dataService';
import { OfficerAccount } from '@/types';

// --- SVG Icons ---
const IconCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconX = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconMapPin = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconClock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconFileText = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
  </svg>
);
const IconInbox = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
);
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconSettings = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
const IconToggleOn = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="5" width="22" height="14" rx="7" ry="7"/>
    <circle cx="16" cy="12" r="3" fill="currentColor"/>
  </svg>
);
const IconToggleOff = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="5" width="22" height="14" rx="7" ry="7"/>
    <circle cx="8" cy="12" r="3"/>
  </svg>
);
const IconBuilding = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="22.01"/><line x1="15" y1="22" x2="15" y2="22.01"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><line x1="9" y1="18" x2="9" y2="18.01"/><line x1="15" y1="18" x2="15" y2="18.01"/>
  </svg>
);
const IconClipboardList = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/>
  </svg>
);
const IconScan = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/>
    <path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
    <line x1="7" y1="12" x2="17" y2="12"/>
  </svg>
);
const IconStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconAward = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);
const IconUserPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
  </svg>
);
const IconUsers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

function getInitials(name?: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

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
  organizationName?: string;
}

function OSDSOfficerContent() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const searchParams = useSearchParams();

  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [pendingEvents, setPendingEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'organizations'>(
    searchParams.get('tab') === 'organizations'
      ? 'organizations'
      : searchParams.get('tab') === 'all'
      ? 'all'
      : 'pending'
  );

  // Sync activeTab when query param changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'organizations' || tab === 'all' || tab === 'pending') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Organization Officers State (OSDS registers Org Officers)
  const [orgOfficers, setOrgOfficers] = useState<OfficerAccount[]>([]);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgEmail, setNewOrgEmail] = useState('');
  const [newOrgDept, setNewOrgDept] = useState('');
  const [newOrgPassword, setNewOrgPassword] = useState('password123');
  const [addingOrg, setAddingOrg] = useState(false);
  const [orgMsg, setOrgMsg] = useState('');
  const [showAddOrgModal, setShowAddOrgModal] = useState(false);
  const [orgSearch, setOrgSearch] = useState('');
  const [orgStatusFilter, setOrgStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [toastNotice, setToastNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadOrgOfficers = async () => {
    try {
      const list = await getOrgOfficers();
      setOrgOfficers(list);
    } catch (e) {
      console.error('Failed to load Org officers', e);
    }
  };

  // Create event modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    venue: '',
    startDate: '',
    endDate: '',
  });

  const loadEvents = async () => {
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        const all = data.events || [];
        setEvents(all);
        setPendingEvents(all.filter((e: CampusEvent) => e.status === 'PENDING_APPROVAL'));
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    loadOrgOfficers();
  }, []);

  const handleRegisterOrgOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName || !newOrgEmail || !newOrgDept) return;
    setAddingOrg(true);
    setOrgMsg('');
    try {
      const res = await registerOrgOfficer({
        name: newOrgName,
        email: newOrgEmail,
        department: newOrgDept,
        password: newOrgPassword,
      });
      const savedName = newOrgName;
      setOrgMsg(res.message);
      setNewOrgName('');
      setNewOrgEmail('');
      setNewOrgDept('');
      setNewOrgPassword('password123');
      await loadOrgOfficers();
      setToastNotice({ text: `Officer ${savedName} registered and accredited successfully.`, type: 'success' });
      setTimeout(() => {
        setShowAddOrgModal(false);
        setOrgMsg('');
      }, 1000);
      setTimeout(() => {
        setToastNotice(null);
      }, 4000);
    } catch (err: any) {
      setOrgMsg('Failed to register Organization Officer: ' + err.message);
    } finally {
      setAddingOrg(false);
    }
  };

  const handleToggleOrgOfficer = async (id: string) => {
    await toggleOrgOfficerStatus(id);
    await loadOrgOfficers();
    setToastNotice({ text: 'Officer status updated.', type: 'success' });
    setTimeout(() => setToastNotice(null), 3000);
  };

  const filteredOrgOfficers = orgOfficers.filter((o) => {
    const matchesStatus =
      orgStatusFilter === 'ALL'
        ? true
        : orgStatusFilter === 'ACTIVE'
        ? o.status === 'ACTIVE'
        : o.status !== 'ACTIVE';
    const q = orgSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      o.name.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q) ||
      o.department.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const handleApprove = async (eventId: string) => {
    setProcessing(eventId);
    try {
      await fetch(`/api/events/${eventId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APPROVE', approvedById: user?.id }),
      });
      await loadEvents();
    } catch (err) { console.error(err); }
    finally { setProcessing(null); }
  };

  const handleReject = async (eventId: string) => {
    setProcessing(eventId);
    try {
      await fetch(`/api/events/${eventId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REJECT', reason: rejectReason, rejectedById: user?.id }),
      });
      setRejectingId(null);
      setRejectReason('');
      await loadEvents();
    } catch (err) { console.error(err); }
    finally { setProcessing(null); }
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
      console.error('Registration toggle failed:', err);
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
      console.error('Evaluation toggle failed:', err);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');

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
          createdById: user?.id || 'demo-osds-1',
          status: 'UPCOMING',
          registrationOpen: true,
        }),
      });
      if (res.ok) {
        setShowCreateModal(false);
        setForm({ title: '', description: '', venue: '', startDate: '', endDate: '' });
        await loadEvents();
        setActiveTab('all');
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

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Manila'
  });
  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('en-PH', {
    hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Manila'
  });

  const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
    DRAFT: { bg: '#F1F5F9', color: '#475569', label: 'Draft' },
    PENDING_APPROVAL: { bg: '#FFF7ED', color: '#C2410C', label: 'Pending Approval' },
    UPCOMING: { bg: '#EFF6FF', color: '#2563EB', label: 'Upcoming' },
    ONGOING: { bg: '#ECFDF5', color: '#059669', label: 'Ongoing' },
    COMPLETED: { bg: '#F1F5F9', color: '#475569', label: 'Completed' },
    CANCELLED: { bg: '#FEF2F2', color: '#DC2626', label: 'Cancelled' },
  };

  const displayEvents = activeTab === 'pending' ? pendingEvents : events;

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* Toast Notification */}
      {toastNotice && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
          background: toastNotice.type === 'success' ? '#065F46' : '#991B1B',
          color: '#FFFFFF', padding: '12px 20px', borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)', fontSize: '13px', fontWeight: '600',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <IconCheck />
          <span>{toastNotice.text}</span>
        </div>
      )}

      {/* Header with Create Event button */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>
            {user?.role === 'ADMIN' ? 'System Event Management' : 'OSDS Event Management'}
          </h1>
          <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
            {user?.department || 'Office of Student Development Services'} · Review approvals, create events, and accredit student organizations
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
            color: '#FFFFFF', border: 'none', borderRadius: '10px',
            fontWeight: '700', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)', transition: 'all 0.15s ease'
          }}
        >
          <IconPlus /> Create Event
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Pending Approval', value: pendingEvents.length, color: '#C2410C', bg: '#FFF7ED', border: '#FED7AA' },
          { label: 'Total Events', value: events.length, color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
          { label: 'Upcoming', value: events.filter(e => e.status === 'UPCOMING').length, color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
          { label: 'Completed', value: events.filter(e => e.status === 'COMPLETED').length, color: '#475569', bg: '#F1F5F9', border: '#CBD5E1' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '12px', padding: '14px 16px' }}>
            <div style={{ fontSize: '26px', fontWeight: '800', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', borderRadius: '10px', padding: '4px', width: 'fit-content', marginBottom: '20px' }}>
        {[
          { id: 'pending', label: `Event Requests (${pendingEvents.length})` },
          { id: 'all', label: `All Events (${events.length})` },
          { id: 'organizations', label: `Organization Officers (${orgOfficers.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: activeTab === tab.id ? '1px solid #CBD5E1' : '1px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? '700' : '500',
              fontSize: '13px',
              fontFamily: 'inherit',
              background: activeTab === tab.id ? '#FFFFFF' : 'transparent',
              color: activeTab === tab.id ? '#1E3A8A' : '#64748B',
              boxShadow: activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Organization Officers Management */}
      {activeTab === 'organizations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Header Card with Action */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{
                  fontSize: '11px', fontWeight: '800', letterSpacing: '0.6px',
                  textTransform: 'uppercase', background: '#EFF6FF',
                  color: '#2563EB', padding: '3px 8px', borderRadius: '4px'
                }}>
                  Student Leadership Accreditation
                </span>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                  URS Cainta Campus
                </span>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Accredited Organization Officers
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '6px', marginBottom: 0, maxWidth: '680px', lineHeight: 1.5 }}>
                Accredit and manage official student organization leaders (e.g. Supreme Student Council, Academic Societies, Sports Clubs). Accredited officers can create campus events, manage registration rosters, and release event completion evaluations.
              </p>
            </div>

            <button
              onClick={() => {
                setOrgMsg('');
                setShowAddOrgModal(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                transition: 'all 0.15s ease',
                flexShrink: 0
              }}
            >
              <IconUserPlus />
              <span>Register Org Officer</span>
            </button>
          </div>

          {/* Metric Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px'
          }}>
            <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '16px 20px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Total Accredited Leaders</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A' }}>{orgOfficers.length}</div>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconUsers />
              </div>
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '16px 20px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Active Officer Accounts</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#059669' }}>{orgOfficers.filter(o => o.status === 'ACTIVE').length}</div>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconCheck />
              </div>
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '16px 20px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Inactive / Suspended</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#DC2626' }}>{orgOfficers.filter(o => o.status !== 'ACTIVE').length}</div>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconShield />
              </div>
            </div>
          </div>

          {/* Officers Table Container with Search & Filter */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            {/* Toolbar */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              {/* Filter Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginRight: '4px' }}>Filter:</span>
                {[
                  { key: 'ALL', label: `All (${orgOfficers.length})` },
                  { key: 'ACTIVE', label: `Active (${orgOfficers.filter(o => o.status === 'ACTIVE').length})` },
                  { key: 'INACTIVE', label: `Inactive (${orgOfficers.filter(o => o.status !== 'ACTIVE').length})` },
                ].map(f => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setOrgStatusFilter(f.key as any)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: orgStatusFilter === f.key ? '700' : '500',
                      border: orgStatusFilter === f.key ? '1px solid #2563EB' : '1px solid #E2E8F0',
                      background: orgStatusFilter === f.key ? '#EFF6FF' : '#FFFFFF',
                      color: orgStatusFilter === f.key ? '#1E3A8A' : '#64748B',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div style={{ position: 'relative', width: '280px' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', display: 'flex' }}>
                  <IconSearch />
                </span>
                <input
                  type="text"
                  placeholder="Search by name, email, org..."
                  value={orgSearch}
                  onChange={(e) => setOrgSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 12px 7px 32px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Table or Empty State */}
            {filteredOrgOfficers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', color: '#64748B', fontSize: '13px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F1F5F9', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <IconUsers />
                </div>
                <div style={{ fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>No Organization Officers Found</div>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '12px' }}>
                  {orgSearch ? 'No officers matched your search criteria.' : 'Click "Register Org Officer" above to add your first student organization leader.'}
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                      <th style={{ padding: '12px 20px', fontWeight: '700' }}>Officer Leader</th>
                      <th style={{ padding: '12px 20px', fontWeight: '700' }}>Student Organization / Council</th>
                      <th style={{ padding: '12px 20px', fontWeight: '700' }}>Status</th>
                      <th style={{ padding: '12px 20px', fontWeight: '700', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrgOfficers.map((o) => (
                      <tr key={o.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s ease' }}>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '36px', height: '36px', borderRadius: '50%',
                              background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
                              color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: '800', fontSize: '12px', flexShrink: 0
                            }}>
                              {getInitials(o.name)}
                            </div>
                            <div>
                              <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '14px' }}>{o.name}</div>
                              <div style={{ fontSize: '12px', color: '#2563EB', fontWeight: '500' }}>{o.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#334155', fontWeight: '600', fontSize: '13px' }}>
                            <span style={{ color: '#64748B' }}><IconBuilding /></span>
                            <span>{o.department}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            fontSize: '11px', fontWeight: '700', padding: '3px 10px',
                            borderRadius: '9999px',
                            background: o.status === 'ACTIVE' ? '#ECFDF5' : '#FEF3C7',
                            color: o.status === 'ACTIVE' ? '#059669' : '#D97706',
                            border: `1px solid ${o.status === 'ACTIVE' ? '#A7F3D0' : '#FDE68A'}`
                          }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: o.status === 'ACTIVE' ? '#10B981' : '#F59E0B' }} />
                            {o.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleOrgOfficer(o.id)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '7px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              border: o.status === 'ACTIVE' ? '1px solid #FECACA' : '1px solid #A7F3D0',
                              background: o.status === 'ACTIVE' ? '#FEF2F2' : '#ECFDF5',
                              color: o.status === 'ACTIVE' ? '#DC2626' : '#059669',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {o.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content for Events */}
      {activeTab !== 'organizations' && (
        <>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>
              <div style={{ width: '36px', height: '36px', border: '3px solid #E2E8F0', borderTopColor: '#7C3AED', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
              Loading events...
            </div>
          ) : displayEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ color: '#CBD5E1', margin: '0 auto 16px', display: 'flex', justifyContent: 'center' }}>
                <IconInbox />
              </div>
              <p style={{ color: '#94A3B8', fontSize: '15px' }}>
                {activeTab === 'pending' ? 'No pending event requests at this time.' : 'No events found.'}
              </p>
            </div>
          ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {displayEvents.map(event => {
            const st = STATUS_STYLE[event.status] || STATUS_STYLE.DRAFT;
            const isPending = event.status === 'PENDING_APPROVAL';
            return (
              <div key={event.id} style={{
                background: '#FFFFFF', borderRadius: '14px',
                border: isPending ? '1.5px solid #FED7AA' : '1px solid #E2E8F0',
                padding: '20px 22px', boxShadow: isPending ? '0 2px 8px rgba(194,65,12,0.08)' : '0 1px 4px rgba(0,0,0,0.04)'
              }}>
                {isPending && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: '#FFF7ED', border: '1px solid #FED7AA',
                    borderRadius: '8px', padding: '8px 12px', marginBottom: '14px',
                    fontSize: '12px', color: '#9A3412', fontWeight: '600'
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    Awaiting OSDS Approval — review and approve or decline this event request
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: st.color, background: st.bg, padding: '2px 9px', borderRadius: '20px' }}>
                        {st.label}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>{event.title}</h3>
                    <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '10px', lineHeight: '1.5' }}>
                      {event.description?.slice(0, 140)}...
                    </p>
                    <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: '#94A3B8', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <IconClock /> {formatDate(event.startDate)} · {formatTime(event.startDate)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <IconMapPin /> {event.venue}
                      </span>
                    </div>

                    {/* Registration & Evaluation Status badges */}
                    {!isPending && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => toggleRegistration(event.id, !!event.registrationOpen)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '4px 10px', borderRadius: '20px', border: 'none', cursor: 'pointer',
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
                            padding: '4px 10px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                            fontSize: '12px', fontWeight: '600', fontFamily: 'inherit',
                            background: event.evaluationOpen ? '#FFF7ED' : '#F1F5F9',
                            color: event.evaluationOpen ? '#D97706' : '#64748B',
                          }}
                        >
                          {event.evaluationOpen ? <IconToggleOn /> : <IconToggleOff />}
                          Evaluation {event.evaluationOpen ? 'Open' : 'Closed'}
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', flexShrink: 0 }}>
                    {isPending ? (
                      rejectingId === event.id ? (
                        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '14px', minWidth: '220px' }}>
                          <p style={{ fontSize: '12px', fontWeight: '700', color: '#991B1B', marginBottom: '8px' }}>Reason for Decline</p>
                          <textarea
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="Briefly explain the reason..."
                            rows={2}
                            style={{ width: '100%', padding: '8px', border: '1px solid #FECACA', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', resize: 'none', outline: 'none', boxSizing: 'border-box' }}
                          />
                          <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                            <button onClick={() => { setRejectingId(null); setRejectReason(''); }} style={{ flex: 1, padding: '7px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>Cancel</button>
                            <button onClick={() => handleReject(event.id)} disabled={!rejectReason.trim() || processing === event.id} style={{ flex: 1, padding: '7px', background: '#DC2626', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', fontFamily: 'inherit' }}>Confirm</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleApprove(event.id)}
                            disabled={processing === event.id}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '7px',
                              padding: '10px 18px', background: '#ECFDF5',
                              color: '#059669', border: '1.5px solid #A7F3D0',
                              borderRadius: '9px', fontWeight: '700', fontSize: '13px',
                              cursor: processing === event.id ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <IconCheck />
                            {processing === event.id ? 'Approving...' : 'Approve Event'}
                          </button>
                          <button
                            onClick={() => setRejectingId(event.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '7px',
                              padding: '10px 18px', background: '#FEF2F2',
                              color: '#DC2626', border: '1.5px solid #FECACA',
                              borderRadius: '9px', fontWeight: '700', fontSize: '13px',
                              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s ease'
                            }}
                          >
                            <IconX /> Decline
                          </button>
                        </>
                      )
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '160px' }}>
                        <Link href={`/org-officer/events/${event.id}`} style={{
                          display: 'flex', alignItems: 'center', gap: '7px',
                          padding: '7px 12px', background: '#F8FAFC', color: '#334155',
                          border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '12px',
                          fontWeight: '700', textDecoration: 'none'
                        }}>
                          <IconFileText /> Event Hub
                        </Link>
                        <Link href={`/org-officer/events/${event.id}/registration-form`} style={{
                          display: 'flex', alignItems: 'center', gap: '7px',
                          padding: '7px 12px', background: '#EFF6FF', color: '#2563EB',
                          border: '1px solid #BFDBFE', borderRadius: '8px', fontSize: '12px',
                          fontWeight: '700', textDecoration: 'none'
                        }}>
                          <IconClipboardList /> Reg. Form
                        </Link>

                        <Link href={`/org-officer/events/${event.id}/evaluation-form`} style={{
                          display: 'flex', alignItems: 'center', gap: '7px',
                          padding: '7px 12px', background: '#FFFBEB', color: '#D97706',
                          border: '1px solid #FDE68A', borderRadius: '8px', fontSize: '12px',
                          fontWeight: '700', textDecoration: 'none'
                        }}>
                          <IconStar /> Eval. Form
                        </Link>
                        <Link href={`/org-officer/events/${event.id}?tab=document`} style={{
                          display: 'flex', alignItems: 'center', gap: '7px',
                          padding: '7px 12px', background: '#F0FDF4', color: '#15803D',
                          border: '1px solid #BBF7D0', borderRadius: '8px', fontSize: '12px',
                          fontWeight: '700', textDecoration: 'none'
                        }}>
                          <IconFileText /> Document
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
          )}
        </>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: '20px', backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '18px', padding: '28px',
            maxWidth: '520px', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>
              Create New Campus Event
            </h2>
            <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '20px' }}>
              Create and set an event directly as OSDS Officer.
            </p>

            {createError && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#DC2626', marginBottom: '16px' }}>
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Event Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. URS Innovation Day 2026"
                  value={form.title}
                  onChange={e => setForm(s => ({ ...s, title: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Venue *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Karangalan Court"
                  value={form.venue}
                  onChange={e => setForm(s => ({ ...s, venue: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Brief description of the event..."
                  value={form.description}
                  onChange={e => setForm(s => ({ ...s, description: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>Start Date & Time *</label>
                  <input
                    required
                    type="datetime-local"
                    value={form.startDate}
                    onChange={e => setForm(s => ({ ...s, startDate: e.target.value }))}
                    style={{ width: '100%', padding: '9px 10px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>End Date & Time *</label>
                  <input
                    required
                    type="datetime-local"
                    value={form.endDate}
                    onChange={e => setForm(s => ({ ...s, endDate: e.target.value }))}
                    style={{ width: '100%', padding: '9px 10px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ flex: 1, padding: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '9px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  style={{
                    flex: 2, padding: '10px', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                    color: '#FFFFFF', border: 'none', borderRadius: '9px', fontWeight: '700',
                    fontSize: '13px', cursor: creating ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
                  }}
                >
                  {creating ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Organization Officer Modal */}
      {showAddOrgModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '16px', maxWidth: '500px', width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #E2E8F0', overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px', borderBottom: '1px solid #E2E8F0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#F8FAFC'
            }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  Register Organization Officer
                </h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                  Assign credentials to an accredited student leader or event committee representative.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddOrgModal(false)}
                style={{
                  background: 'transparent', border: 'none', color: '#94A3B8',
                  cursor: 'pointer', padding: '4px', display: 'flex', borderRadius: '6px'
                }}
              >
                <IconX />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleRegisterOrgOfficer} style={{ padding: '24px' }}>
              {orgMsg && (
                <div style={{
                  background: orgMsg.includes('Failed') ? '#FEF2F2' : '#ECFDF5',
                  border: `1px solid ${orgMsg.includes('Failed') ? '#FECACA' : '#A7F3D0'}`,
                  color: orgMsg.includes('Failed') ? '#DC2626' : '#065F46',
                  padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
                  marginBottom: '16px', fontWeight: '600'
                }}>
                  {orgMsg}
                </div>
              )}

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px' }}>
                  Officer Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Santos"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  style={{
                    width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1',
                    borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px' }}>
                  Official Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. maria.santos@urs.edu.ph"
                  value={newOrgEmail}
                  onChange={(e) => setNewOrgEmail(e.target.value)}
                  style={{
                    width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1',
                    borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px' }}>
                  Student Organization / Council Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Supreme Student Council – Events Committee"
                  value={newOrgDept}
                  onChange={(e) => setNewOrgDept(e.target.value)}
                  style={{
                    width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1',
                    borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px' }}>
                  Initial Password *
                </label>
                <input
                  type="text"
                  required
                  value={newOrgPassword}
                  onChange={(e) => setNewOrgPassword(e.target.value)}
                  style={{
                    width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1',
                    borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box'
                  }}
                />
                <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                  The officer will use this password to sign in at the Staff / Officer login tab.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddOrgModal(false)}
                  style={{
                    padding: '9px 16px', background: '#FFFFFF', color: '#475569',
                    border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px',
                    fontWeight: '600', cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingOrg}
                  style={{
                    padding: '9px 18px', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                    color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px',
                    fontWeight: '700', cursor: addingOrg ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(37,99,235,0.25)'
                  }}
                >
                  {addingOrg ? 'Registering...' : 'Register Officer'}
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

export default function OSDSOfficerDashboard() {
  return (
    <Suspense fallback={
      <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        Loading dashboard...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <OSDSOfficerContent />
    </Suspense>
  );
}
