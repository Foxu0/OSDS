'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  getAdminRecords,
  archiveAdminRecord,
  unarchiveAdminRecord,
  deleteAdminRecord,
  getOsdsOfficers,
  registerOsdsOfficer,
  toggleOsdsOfficerStatus,
  deleteOsdsOfficer,
  AdminEventRecord,
} from '@/lib/dataService';
import { OfficerAccount } from '@/types';
import { formatManilaDate, formatManilaDateTime } from '@/lib/timezone';

// --- Pure SVG Icons (STRICTLY NO EMOJIS) ---
const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const IconArchive = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>
  </svg>
);

const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);

const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
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

const IconCalendar = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const IconAward = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);

const IconFileText = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);

const IconStar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const IconRefresh = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);

const IconRotateCcw = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
  </svg>
);

const IconAlertTriangle = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const currentView = (searchParams.get('view') === 'officers' || searchParams.get('tab') === 'officers') ? 'officers' : 'records';

  // Events & Records State
  const [events, setEvents] = useState<AdminEventRecord[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({
    total: 0,
    events: 0,
    active: 0,
    archived: 0,
    evaluations: 0,
    registrations: 0,
    certificates: 0,
  });
  const [loadingRecords, setLoadingRecords] = useState(true);

  // Status Filter ('all' | 'active' | 'archived')
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Event Dossier Modal State (Defaults to 'evaluations' as proof of completed attendance)
  const [selectedEventForDossier, setSelectedEventForDossier] = useState<AdminEventRecord | null>(null);
  const [dossierActiveTab, setDossierActiveTab] = useState<'evaluations' | 'registrations' | 'certificates' | 'overview'>('evaluations');

  // OSDS Officers State
  const [osdsOfficers, setOsdsOfficers] = useState<OfficerAccount[]>([]);
  const [loadingOfficers, setLoadingOfficers] = useState(true);
  const [showAddOfficerModal, setShowAddOfficerModal] = useState(false);
  const [officerName, setOfficerName] = useState('');
  const [officerEmail, setOfficerEmail] = useState('');
  const [officerDept, setOfficerDept] = useState('Office of Student Development Services (OSDS)');
  const [officerPassword, setOfficerPassword] = useState('password123');
  const [submittingOfficer, setSubmittingOfficer] = useState(false);
  const [officerError, setOfficerError] = useState('');
  const [officerSuccess, setOfficerSuccess] = useState('');

  // Delete Confirmation State
  const [recordToDelete, setRecordToDelete] = useState<{ type: string; id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Load data based on view
  useEffect(() => {
    if (currentView === 'records') {
      loadRecordsData();
    } else {
      loadOfficersData();
    }
  }, [currentView]);

  // Reload records when filters change
  useEffect(() => {
    if (currentView === 'records') {
      loadRecordsData();
    }
  }, [selectedStatus]);

  async function loadRecordsData() {
    setLoadingRecords(true);
    const data = await getAdminRecords({
      status: selectedStatus,
      search: searchQuery,
    });
    const list = data.events || data.records || [];
    setEvents(list);
    if (data.counts) {
      setCounts(data.counts);
    }
    // If modal is open, refresh its content reference
    if (selectedEventForDossier) {
      const refreshed = list.find((e: AdminEventRecord) => e.id === selectedEventForDossier.id);
      if (refreshed) {
        setSelectedEventForDossier(refreshed);
      }
    }
    setLoadingRecords(false);
  }

  async function loadOfficersData() {
    setLoadingOfficers(true);
    const list = await getOsdsOfficers();
    setOsdsOfficers(list);
    setLoadingOfficers(false);
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadRecordsData();
  };

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setActionNotice({ text, type });
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Archive / Restore Handler
  const handleToggleArchive = async (type: string, id: string, isArchived: boolean) => {
    const res = isArchived
      ? await unarchiveAdminRecord(type.toLowerCase(), id)
      : await archiveAdminRecord(type.toLowerCase(), id);

    if (res.success) {
      showNotification(isArchived ? 'Record restored from archive.' : 'Record successfully archived.');
      await loadRecordsData();
    } else {
      showNotification(res.message || 'Operation failed.', 'error');
    }
  };

  // Confirm Delete Handler
  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    setDeleting(true);

    let res: { success: boolean; message: string };
    if (recordToDelete.type === 'officer') {
      res = await deleteOsdsOfficer(recordToDelete.id);
      if (res.success) {
        showNotification('OSDS Officer removed successfully.');
        loadOfficersData();
      } else {
        showNotification(res.message || 'Failed to delete officer.', 'error');
      }
    } else {
      res = await deleteAdminRecord(recordToDelete.type.toLowerCase(), recordToDelete.id);
      if (res.success) {
        showNotification('Record permanently deleted.');
        if (recordToDelete.type.toLowerCase() === 'event' && selectedEventForDossier?.id === recordToDelete.id) {
          setSelectedEventForDossier(null);
        }
        await loadRecordsData();
      } else {
        showNotification(res.message || 'Failed to delete record.', 'error');
      }
    }

    setDeleting(false);
    setRecordToDelete(null);
  };

  // Add OSDS Officer Handler
  const handleAddOfficerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOfficerError('');
    setOfficerSuccess('');
    setSubmittingOfficer(true);

    try {
      const res = await registerOsdsOfficer({
        name: officerName,
        email: officerEmail,
        department: officerDept,
        password: officerPassword,
      });

      if (res.success) {
        setOfficerSuccess(`OSDS Officer ${officerName} appointed successfully.`);
        setOfficerName('');
        setOfficerEmail('');
        setOfficerPassword('password123');
        loadOfficersData();
        setTimeout(() => {
          setShowAddOfficerModal(false);
          setOfficerSuccess('');
        }, 1500);
      }
    } catch (err: any) {
      setOfficerError(err.message || 'Failed to appoint OSDS officer.');
    } finally {
      setSubmittingOfficer(false);
    }
  };

  // Toggle OSDS Officer Status
  const handleToggleOfficerStatus = async (id: string) => {
    const success = await toggleOsdsOfficerStatus(id);
    if (success) {
      showNotification('Officer status updated.');
      loadOfficersData();
    } else {
      showNotification('Failed to update officer status.', 'error');
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '80px' }}>
      
      {/* Toast Notification */}
      {actionNotice && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
          background: actionNotice.type === 'success' ? '#065F46' : '#991B1B',
          color: '#FFFFFF', padding: '12px 20px', borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)', fontSize: '13px', fontWeight: '600',
          display: 'flex', alignItems: 'center', gap: '8px', animation: 'fadeIn 0.2s ease'
        }}>
          {actionNotice.type === 'success' ? <IconCheck /> : <IconAlertTriangle />}
          <span>{actionNotice.text}</span>
        </div>
      )}

      {/* Focused View Header & Contextual Metric Cards */}
      {currentView === 'records' ? (
        <>
          {/* Records Vault Header */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{
                  fontSize: '11px', fontWeight: '800', letterSpacing: '0.6px',
                  textTransform: 'uppercase', background: '#EFF6FF',
                  color: '#2563EB', padding: '3px 8px', borderRadius: '4px'
                }}>
                  Central Administration
                </span>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                  URS Cainta Campus
                </span>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Master Events Vault
              </h1>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', marginBottom: 0 }}>
                Institutional event governance. Click any event to inspect its completed evaluations (verified attendance), registration roster, and optional e-certificates.
              </p>
            </div>

            <button
              onClick={loadRecordsData}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', background: '#FFFFFF', color: '#334155',
                border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '12px',
                fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s ease'
              }}
            >
              <IconRefresh /> Refresh Vault
            </button>
          </div>

          {/* Contextual Metric Cards for Records */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
            marginBottom: '24px'
          }}>
            <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '16px 20px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Total Campus Events</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A' }}>{counts.events || events.length}</div>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconCalendar />
              </div>
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '16px 20px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Active Events</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#059669' }}>{counts.active || events.filter(e => !e.isArchived).length}</div>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconCheck />
              </div>
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '16px 20px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Archived Events</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#64748B' }}>{counts.archived || events.filter(e => e.isArchived).length}</div>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F1F5F9', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconArchive />
              </div>
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '16px 20px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Attendance Proof & Reg</div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#1E293B', marginTop: '4px' }}>
                  <span style={{ color: '#059669' }}>{counts.evaluations || 0} Attended (Evaluated)</span>
                  <span style={{ margin: '0 6px', color: '#CBD5E1' }}>•</span>
                  <span style={{ color: '#2563EB' }}>{counts.registrations || 0} Registered</span>
                </div>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconCheck />
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* OSDS Officers Header */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{
                  fontSize: '11px', fontWeight: '800', letterSpacing: '0.6px',
                  textTransform: 'uppercase', background: '#F5F3FF',
                  color: '#7C3AED', padding: '3px 8px', borderRadius: '4px'
                }}>
                  Administrative Staff
                </span>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                  Office of Student Development Services
                </span>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Authorized OSDS Officers
              </h1>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', marginBottom: 0 }}>
                Appoint and supervise administrative officers authorized to approve campus event proposals and register student organizations.
              </p>
            </div>

            <button
              onClick={() => setShowAddOfficerModal(true)}
              style={{
                padding: '9px 18px',
                background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '9px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <IconUserPlus />
              <span>Appoint OSDS Officer</span>
            </button>
          </div>

          {/* Contextual Metric Cards for Officers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px',
            marginBottom: '24px'
          }}>
            <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '16px 20px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Total Appointed Officers</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A' }}>{osdsOfficers.length}</div>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconUsers />
              </div>
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '16px 20px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Active Staff Accounts</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#059669' }}>{osdsOfficers.filter(o => o.status === 'ACTIVE').length}</div>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconCheck />
              </div>
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '16px 20px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Inactive / Suspended</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#DC2626' }}>{osdsOfficers.filter(o => o.status !== 'ACTIVE').length}</div>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconShield />
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================= */}
      {/* VIEW A: MASTER EVENTS VAULT (VIEW / ARCHIVE / DELETE)      */}
      {/* ========================================================= */}
      {currentView === 'records' && (
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          overflow: 'hidden'
        }}>
          {/* Records Vault Toolbar */}
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Top row: Status Filter Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginRight: '4px' }}>
                  Filter Events:
                </span>
                {[
                  { key: 'all', label: `All Events (${counts.events || events.length})` },
                  { key: 'active', label: `Active (${counts.active || 0})` },
                  { key: 'archived', label: `Archived (${counts.archived || 0})` },
                ].map((st) => (
                  <button
                    key={st.key}
                    onClick={() => setSelectedStatus(st.key)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: selectedStatus === st.key ? '700' : '500',
                      border: selectedStatus === st.key ? '1px solid #2563EB' : '1px solid #E2E8F0',
                      background: selectedStatus === st.key ? '#EFF6FF' : '#FAFAFA',
                      color: selectedStatus === st.key ? '#1D4ED8' : '#64748B',
                      cursor: 'pointer',
                      transition: 'all 0.1s ease'
                    }}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div style={{ fontSize: '12px', color: '#64748B' }}>
                Click any event to inspect completed evaluations, registrations, and e-certificates
              </div>
            </div>

            {/* Bottom row: Search Form & Reload */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '540px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', display: 'flex' }}>
                    <IconSearch />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search campus events by title, venue, or event ID..."
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 38px',
                      borderRadius: '9px',
                      border: '1px solid #E2E8F0',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    padding: '9px 16px',
                    borderRadius: '9px',
                    background: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Search
                </button>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setTimeout(loadRecordsData, 10); }}
                    style={{
                      padding: '9px 12px',
                      borderRadius: '9px',
                      background: '#F1F5F9',
                      color: '#64748B',
                      border: 'none',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Clear
                  </button>
                )}
              </form>

              <button
                onClick={loadRecordsData}
                style={{
                  padding: '9px 14px',
                  borderRadius: '9px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <IconRefresh />
                <span>Reload</span>
              </button>
            </div>
          </div>

          {/* Events Master Table */}
          {loadingRecords ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94A3B8' }}>
              <div style={{
                width: '32px', height: '32px', border: '3px solid #E2E8F0',
                borderTopColor: '#2563EB', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite', margin: '0 auto 12px'
              }} />
              <div style={{ fontSize: '14px', fontWeight: '500' }}>Loading events vault...</div>
            </div>
          ) : events.length === 0 ? (
            <div style={{ padding: '80px 24px', textAlign: 'center', color: '#94A3B8' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: '#CBD5E1' }}>
                <IconCalendar />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                No events found
              </h3>
              <p style={{ fontSize: '13px', margin: 0 }}>
                No active or archived campus events match your current filter.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    <th style={{ padding: '14px 20px' }}>Campus Event</th>
                    <th style={{ padding: '14px 20px' }}>Venue & Schedule</th>
                    <th style={{ padding: '14px 20px' }}>Lifecycle Status</th>
                    <th style={{ padding: '14px 20px' }}>Attendance & Records</th>
                    <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((evt) => {
                    const isArchived = evt.isArchived;
                    const evalCount = evt.stats?.evaluations ?? (evt.evaluations?.length || 0);
                    const regCount = evt.stats?.registrations ?? (evt.registrations?.length || 0);
                    const certCount = evt.stats?.certificates ?? (evt.certificates?.length || 0);

                    return (
                      <tr
                        key={evt.id}
                        onClick={() => {
                          setSelectedEventForDossier(evt);
                          setDossierActiveTab('evaluations');
                        }}
                        style={{
                          borderBottom: '1px solid #F1F5F9',
                          background: isArchived ? '#F8FAFC' : '#FFFFFF',
                          transition: 'background 0.15s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = isArchived ? '#F1F5F9' : '#F8FAFC';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = isArchived ? '#F8FAFC' : '#FFFFFF';
                        }}
                      >
                        {/* Event Title & ID */}
                        <td style={{ padding: '16px 20px', maxWidth: '320px' }}>
                          <div style={{ fontWeight: '800', color: isArchived ? '#64748B' : '#0F172A', fontSize: '14px', lineHeight: '1.4' }}>
                            {evt.title}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace', background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>
                              {evt.id}
                            </span>
                            <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                              Created {formatManilaDate(evt.createdAt)}
                            </span>
                          </div>
                        </td>

                        {/* Venue & Dates */}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ color: '#1E293B', fontWeight: '600' }}>
                            {evt.venue}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                            {formatManilaDate(evt.startDate)}
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                          {isArchived ? (
                            <span style={{
                              padding: '3px 9px', borderRadius: '6px',
                              background: '#E2E8F0', color: '#475569',
                              fontSize: '10px', fontWeight: '800', letterSpacing: '0.4px',
                              textTransform: 'uppercase'
                            }}>
                              Archived
                            </span>
                          ) : (
                            <span style={{
                              padding: '3px 9px', borderRadius: '6px',
                              background: evt.status === 'UPCOMING' ? '#EFF6FF' : evt.status === 'COMPLETED' ? '#F1F5F9' : '#ECFDF5',
                              color: evt.status === 'UPCOMING' ? '#1D4ED8' : evt.status === 'COMPLETED' ? '#475569' : '#047857',
                              border: evt.status === 'UPCOMING' ? '1px solid #BFDBFE' : evt.status === 'COMPLETED' ? '1px solid #E2E8F0' : '1px solid #A7F3D0',
                              fontSize: '10px', fontWeight: '800', letterSpacing: '0.4px',
                              textTransform: 'uppercase'
                            }}>
                              {evt.status}
                            </span>
                          )}
                        </td>

                        {/* Compiled Sub-Records (Attendance via Evaluation, Registration, Optional E-Certs) */}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            {/* Evaluation Attendance Badge */}
                            <span
                              title={`${evalCount} students verified attendance by completing the evaluation form`}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                padding: '4px 8px', borderRadius: '6px',
                                background: evalCount > 0 ? '#ECFDF5' : '#F8FAFC',
                                color: evalCount > 0 ? '#047857' : '#94A3B8',
                                border: evalCount > 0 ? '1px solid #A7F3D0' : '1px solid #E2E8F0',
                                fontSize: '11px', fontWeight: '700'
                              }}
                            >
                              <IconCheck />
                              <span>{evalCount} Attended (Evaluated)</span>
                            </span>

                            {/* Registrations Badge */}
                            <span
                              title={`${regCount} Registered Students at event start`}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                padding: '4px 8px', borderRadius: '6px',
                                background: regCount > 0 ? '#EFF6FF' : '#F8FAFC',
                                color: regCount > 0 ? '#1D4ED8' : '#94A3B8',
                                border: regCount > 0 ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                                fontSize: '11px', fontWeight: '700'
                              }}
                            >
                              <IconUsers />
                              <span>{regCount} Registered</span>
                            </span>

                            {/* Certificates Badge (Optional Digital E-Certs) */}
                            {certCount > 0 ? (
                              <span
                                title={`${certCount} Optional E-Certificates Issued`}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                                  padding: '4px 8px', borderRadius: '6px',
                                  background: '#FAF5FF',
                                  color: '#7C3AED',
                                  border: '1px solid #E9D5FF',
                                  fontSize: '11px', fontWeight: '700'
                                }}
                              >
                                <IconAward />
                                <span>{certCount} E-Certs</span>
                              </span>
                            ) : (
                              <span
                                title="No digital e-certificates issued yet (physical printing standard)"
                                style={{
                                  fontSize: '11px', color: '#94A3B8', fontStyle: 'italic'
                                }}
                              >
                                Physical / No E-Certs
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '16px 20px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Inspect Event Button */}
                            <button
                              onClick={() => {
                                setSelectedEventForDossier(evt);
                                setDossierActiveTab('evaluations');
                              }}
                              title="Inspect Event Records"
                              style={{
                                padding: '6px 12px', borderRadius: '7px',
                                background: '#EFF6FF', border: '1px solid #BFDBFE',
                                color: '#1D4ED8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                                fontSize: '11px', fontWeight: '700'
                              }}
                            >
                              <IconEye />
                              <span>Inspect Event</span>
                            </button>

                            {/* Archive / Restore Button */}
                            <button
                              onClick={() => handleToggleArchive('event', evt.id, isArchived)}
                              title={isArchived ? 'Restore Event' : 'Archive Event'}
                              style={{
                                padding: '6px 10px', borderRadius: '7px',
                                background: isArchived ? '#F1F5F9' : '#FFFBEB',
                                border: isArchived ? '1px solid #CBD5E1' : '1px solid #FDE68A',
                                color: isArchived ? '#475569' : '#B45309',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                                fontSize: '11px', fontWeight: '600'
                              }}
                            >
                              {isArchived ? <IconRotateCcw /> : <IconArchive />}
                              <span>{isArchived ? 'Restore' : 'Archive'}</span>
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => setRecordToDelete({ type: 'event', id: evt.id, title: evt.title })}
                              title="Permanently Delete Event"
                              style={{
                                padding: '6px 10px', borderRadius: '7px',
                                background: '#FEF2F2', border: '1px solid #FECACA',
                                color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                                fontSize: '11px', fontWeight: '600'
                              }}
                            >
                              <IconTrash />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW B: OSDS OFFICER MANAGEMENT (VIEW / ADD / DELETE)     */}
      {/* ========================================================= */}
      {currentView === 'officers' && (
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '24px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Appointed OSDS Officers Roster ({osdsOfficers.length})
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', marginBottom: 0 }}>
                Staff credentials and administrative access controls for URS Cainta campus operations.
              </p>
            </div>
          </div>

          {loadingOfficers ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94A3B8' }}>
              <div style={{
                width: '32px', height: '32px', border: '3px solid #E2E8F0',
                borderTopColor: '#2563EB', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite', margin: '0 auto 12px'
              }} />
              <div style={{ fontSize: '14px', fontWeight: '500' }}>Loading OSDS officers...</div>
            </div>
          ) : osdsOfficers.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94A3B8' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: '#CBD5E1' }}>
                <IconUsers />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                No OSDS Officers appointed yet
              </h3>
              <p style={{ fontSize: '13px', margin: 0 }}>
                Click "Appoint New Officer" to register an official OSDS staff account.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    <th style={{ padding: '14px 20px' }}>Officer Name</th>
                    <th style={{ padding: '14px 20px' }}>Official Campus Email</th>
                    <th style={{ padding: '14px 20px' }}>Department / Unit</th>
                    <th style={{ padding: '14px 20px' }}>Account Status</th>
                    <th style={{ padding: '14px 20px' }}>Appointed On</th>
                    <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {osdsOfficers.map((officer) => {
                    const isActive = officer.status === 'ACTIVE';
                    return (
                      <tr key={officer.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '14px 20px', fontWeight: '700', color: '#0F172A' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '8px',
                              background: '#F5F3FF', color: '#7C3AED',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '12px', fontWeight: '800'
                            }}>
                              {officer.name.charAt(0).toUpperCase()}
                            </div>
                            <span>{officer.name}</span>
                          </div>
                        </td>

                        <td style={{ padding: '14px 20px', color: '#334155' }}>
                          {officer.email}
                        </td>

                        <td style={{ padding: '14px 20px', color: '#64748B' }}>
                          {officer.department}
                        </td>

                        <td style={{ padding: '14px 20px' }}>
                          <span style={{
                            padding: '3px 9px', borderRadius: '6px',
                            background: isActive ? '#ECFDF5' : '#FEF2F2',
                            color: isActive ? '#047857' : '#DC2626',
                            border: isActive ? '1px solid #A7F3D0' : '1px solid #FECACA',
                            fontSize: '11px', fontWeight: '800'
                          }}>
                            {officer.status}
                          </span>
                        </td>

                        <td style={{ padding: '14px 20px', color: '#64748B', fontSize: '12px' }}>
                          {formatManilaDate(officer.createdAt)}
                        </td>

                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              onClick={() => handleToggleOfficerStatus(officer.id)}
                              style={{
                                padding: '6px 12px', borderRadius: '7px',
                                background: isActive ? '#FFFBEB' : '#ECFDF5',
                                border: isActive ? '1px solid #FDE68A' : '1px solid #A7F3D0',
                                color: isActive ? '#B45309' : '#047857',
                                cursor: 'pointer', fontSize: '11px', fontWeight: '700'
                              }}
                            >
                              {isActive ? 'Deactivate' : 'Activate'}
                            </button>

                            <button
                              onClick={() => setRecordToDelete({ type: 'officer', id: officer.id, title: officer.name })}
                              style={{
                                padding: '6px 10px', borderRadius: '7px',
                                background: '#FEF2F2', border: '1px solid #FECACA',
                                color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                                fontSize: '11px', fontWeight: '700'
                              }}
                            >
                              <IconTrash />
                              <span>Remove</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: EVENT DOSSIER (EVALUATION / REG / E-CERTS / INFO) */}
      {/* ========================================================= */}
      {selectedEventForDossier && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '880px',
            maxHeight: '92vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', animation: 'fadeIn 0.2s ease',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '24px 28px 18px',
              borderBottom: '1px solid #E2E8F0',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '16px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '11px', fontWeight: '800', letterSpacing: '0.6px',
                    textTransform: 'uppercase', background: '#EFF6FF',
                    color: '#2563EB', padding: '3px 8px', borderRadius: '5px'
                  }}>
                    Event Dossier & Audit
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace', background: '#F1F5F9', padding: '3px 8px', borderRadius: '5px' }}>
                    {selectedEventForDossier.id}
                  </span>
                  <span style={{
                    fontSize: '11px', fontWeight: '800',
                    background: selectedEventForDossier.isArchived ? '#F1F5F9' : '#ECFDF5',
                    color: selectedEventForDossier.isArchived ? '#64748B' : '#047857',
                    padding: '3px 8px', borderRadius: '5px'
                  }}>
                    {selectedEventForDossier.isArchived ? 'ARCHIVED' : selectedEventForDossier.status}
                  </span>
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px', lineHeight: '1.3' }}>
                  {selectedEventForDossier.title}
                </h2>
                <div style={{ fontSize: '13px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span>{selectedEventForDossier.venue}</span>
                  <span>•</span>
                  <span>{formatManilaDate(selectedEventForDossier.startDate)}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedEventForDossier(null)}
                style={{
                  background: '#F1F5F9', border: 'none', color: '#64748B',
                  cursor: 'pointer', padding: '8px', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <IconClose />
              </button>
            </div>

            {/* Dossier Tabs: Evaluations (Attendance Proof), Registrations, E-Certificates, Overview */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: '1px solid #E2E8F0',
              background: '#F8FAFC',
              padding: '0 24px',
              overflowX: 'auto'
            }}>
              {[
                { key: 'evaluations', label: `Completed & Attended (${selectedEventForDossier.evaluations?.length || 0})`, icon: <IconCheck /> },
                { key: 'registrations', label: `Registered Students (${selectedEventForDossier.registrations?.length || 0})`, icon: <IconUsers /> },
                { key: 'certificates', label: `E-Certificates (${selectedEventForDossier.certificates?.length || 0})`, icon: <IconAward /> },
                { key: 'overview', label: 'Event Details', icon: <IconCalendar /> },
              ].map((tab) => {
                const isActive = dossierActiveTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setDossierActiveTab(tab.key as any)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '14px 16px',
                      border: 'none',
                      borderBottom: isActive ? '2px solid #2563EB' : '2px solid transparent',
                      background: 'transparent',
                      color: isActive ? '#2563EB' : '#64748B',
                      fontSize: '13px',
                      fontWeight: isActive ? '700' : '600',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dossier Content Area */}
            <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1, maxHeight: '65vh' }}>
              
              {/* TAB 1: EVALUATIONS & COMPLETED ATTENDEES */}
              {dossierActiveTab === 'evaluations' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                        Official Event Completion & Attendance Verification
                      </h3>
                      <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>
                        Submitting the evaluation form at event end serves as official verification that the student attended to completion.
                      </p>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#059669', background: '#ECFDF5', padding: '4px 10px', borderRadius: '6px' }}>
                      {selectedEventForDossier.evaluations?.length || 0} Attended & Completed
                    </span>
                  </div>

                  {(!selectedEventForDossier.evaluations || selectedEventForDossier.evaluations.length === 0) ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', color: '#94A3B8' }}>
                        <IconFileText />
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>
                        No evaluation feedback submitted yet
                      </div>
                      <p style={{ fontSize: '12px', color: '#94A3B8', margin: '4px 0 0' }}>
                        When the evaluation form is released at the end of the event, completing students will be recorded here as verified attendees.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {selectedEventForDossier.evaluations.map((ev: any) => {
                        const responses = ev.responses || {};
                        const qKeys = Object.keys(responses).filter(k => k.startsWith('q'));
                        const avgRating = qKeys.length > 0
                          ? (qKeys.reduce((acc, k) => acc + (Number(responses[k]) || 0), 0) / qKeys.length).toFixed(1)
                          : null;

                        return (
                          <div
                            key={ev.id}
                            style={{
                              border: '1px solid #E2E8F0',
                              borderRadius: '12px',
                              padding: '16px 20px',
                              background: '#FFFFFF',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ color: '#059669', display: 'flex' }}>
                                    <IconCheck />
                                  </span>
                                  <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '14px' }}>
                                    {ev.studentName || 'Student Participant'}
                                  </div>
                                  <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
                                    {ev.studentId}
                                  </span>
                                </div>
                                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                                  Verified completed on {formatManilaDateTime(ev.submittedAt)}
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {avgRating && (
                                  <div style={{
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                    padding: '4px 8px', borderRadius: '6px',
                                    background: '#FFFBEB', color: '#B45309',
                                    border: '1px solid #FDE68A', fontSize: '12px', fontWeight: '800'
                                  }}>
                                    <IconStar />
                                    <span>{avgRating} / 5.0</span>
                                  </div>
                                )}

                                <button
                                  onClick={() => setRecordToDelete({ type: 'evaluation', id: ev.id, title: `Evaluation for ${ev.studentName}` })}
                                  title="Delete Evaluation Record"
                                  style={{
                                    padding: '5px 8px', borderRadius: '6px',
                                    background: '#FEF2F2', border: '1px solid #FECACA',
                                    color: '#DC2626', cursor: 'pointer', fontSize: '11px'
                                  }}
                                >
                                  <IconTrash />
                                </button>
                              </div>
                            </div>

                            {/* Ratings breakdown */}
                            {qKeys.length > 0 && (
                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                                gap: '8px',
                                background: '#F8FAFC',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                marginBottom: '10px'
                              }}>
                                {qKeys.map((qk, idx) => (
                                  <div key={qk} style={{ fontSize: '11px' }}>
                                    <span style={{ color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>
                                      Criterion {idx + 1}:
                                    </span>{' '}
                                    <strong style={{ color: '#0F172A' }}>
                                      {responses[qk]} / 5
                                    </strong>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Comments / Remarks */}
                            {responses.comments && (
                              <div style={{ fontSize: '12px', color: '#334155', fontStyle: 'italic', background: '#F1F5F9', padding: '8px 12px', borderRadius: '6px' }}>
                                &ldquo;{responses.comments}&rdquo;
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: REGISTRATIONS */}
              {dossierActiveTab === 'registrations' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                        Student Registration Roster
                      </h3>
                      <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>
                        Students registered at the start of the event.
                      </p>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#1D4ED8', background: '#EFF6FF', padding: '4px 10px', borderRadius: '6px' }}>
                      {selectedEventForDossier.registrations?.length || 0} Registered
                    </span>
                  </div>

                  {(!selectedEventForDossier.registrations || selectedEventForDossier.registrations.length === 0) ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', color: '#94A3B8' }}>
                        <IconUsers />
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>
                        No registrations recorded
                      </div>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                          <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <th style={{ padding: '10px 14px' }}>Student Name</th>
                            <th style={{ padding: '10px 14px' }}>Student ID</th>
                            <th style={{ padding: '10px 14px' }}>Program / Section</th>
                            <th style={{ padding: '10px 14px' }}>Email</th>
                            <th style={{ padding: '10px 14px' }}>Registered Date</th>
                            <th style={{ padding: '10px 14px', textAlign: 'right' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedEventForDossier.registrations.map((reg: any) => (
                            <tr key={reg.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                              <td style={{ padding: '10px 14px', fontWeight: '700', color: '#0F172A' }}>
                                {reg.studentName}
                              </td>
                              <td style={{ padding: '10px 14px', color: '#64748B', fontFamily: 'monospace' }}>
                                {reg.studentNumber}
                              </td>
                              <td style={{ padding: '10px 14px', color: '#334155' }}>
                                {reg.department || reg.course} {reg.yearSection}
                              </td>
                              <td style={{ padding: '10px 14px', color: '#64748B' }}>
                                {reg.email}
                              </td>
                              <td style={{ padding: '10px 14px', color: '#64748B' }}>
                                {formatManilaDate(reg.registrationDate || reg.createdAt)}
                              </td>
                              <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                                <button
                                  onClick={() => setRecordToDelete({ type: 'registration', id: reg.id, title: `Registration for ${reg.studentName}` })}
                                  title="Delete Registration"
                                  style={{
                                    padding: '4px 8px', borderRadius: '5px',
                                    background: '#FEF2F2', border: '1px solid #FECACA',
                                    color: '#DC2626', cursor: 'pointer', fontSize: '11px'
                                  }}
                                >
                                  <IconTrash />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: E-CERTIFICATES (ALTERNATIVE) */}
              {dossierActiveTab === 'certificates' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                        Optional E-Certificates Registry
                      </h3>
                      <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>
                        Digital certificate records issued as an alternative to physical paper certificates.
                      </p>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#7C3AED', background: '#F5F3FF', padding: '4px 10px', borderRadius: '6px' }}>
                      {selectedEventForDossier.certificates?.length || 0} E-Certs
                    </span>
                  </div>

                  {(!selectedEventForDossier.certificates || selectedEventForDossier.certificates.length === 0) ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', color: '#94A3B8' }}>
                        <IconAward />
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>
                        No digital e-certificates generated for this event
                      </div>
                      <p style={{ fontSize: '12px', color: '#94A3B8', margin: '4px 0 0' }}>
                        Certificates for this event may be physically printed and distributed. If the officer chooses to issue digital e-certificates, they will appear here.
                      </p>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                          <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <th style={{ padding: '10px 14px' }}>Verification Code</th>
                            <th style={{ padding: '10px 14px' }}>Recipient</th>
                            <th style={{ padding: '10px 14px' }}>Type</th>
                            <th style={{ padding: '10px 14px' }}>Award / Distinction</th>
                            <th style={{ padding: '10px 14px' }}>Issued Date</th>
                            <th style={{ padding: '10px 14px', textAlign: 'right' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedEventForDossier.certificates.map((cert: any) => (
                            <tr key={cert.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                              <td style={{ padding: '10px 14px', fontWeight: '700', color: '#0F172A', fontFamily: 'monospace' }}>
                                {cert.verificationCode}
                              </td>
                              <td style={{ padding: '10px 14px' }}>
                                <div style={{ fontWeight: '600', color: '#0F172A' }}>{cert.recipientName}</div>
                                <div style={{ color: '#64748B', fontSize: '11px' }}>{cert.recipientIdentifier}</div>
                              </td>
                              <td style={{ padding: '10px 14px' }}>
                                <span style={{
                                  padding: '2px 6px', borderRadius: '4px',
                                  background: '#FFFBEB', color: '#B45309',
                                  border: '1px solid #FDE68A', fontSize: '10px', fontWeight: '800'
                                }}>
                                  {cert.certificateType}
                                </span>
                              </td>
                              <td style={{ padding: '10px 14px', color: '#334155' }}>
                                {cert.awardTitle || 'Participation'}
                              </td>
                              <td style={{ padding: '10px 14px', color: '#64748B' }}>
                                {formatManilaDate(cert.issuedAt || cert.createdAt)}
                              </td>
                              <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                                <button
                                  onClick={() => setRecordToDelete({ type: 'certificate', id: cert.id, title: `Certificate ${cert.verificationCode}` })}
                                  title="Revoke / Delete Certificate"
                                  style={{
                                    padding: '4px 8px', borderRadius: '5px',
                                    background: '#FEF2F2', border: '1px solid #FECACA',
                                    color: '#DC2626', cursor: 'pointer', fontSize: '11px'
                                  }}
                                >
                                  <IconTrash />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: EVENT OVERVIEW & AUDIT */}
              {dossierActiveTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ background: '#F8FAFC', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Event Description & Scope
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.6' }}>
                      {selectedEventForDossier.description || 'No detailed scope provided.'}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={{ background: '#F8FAFC', padding: '14px 18px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Campus Venue</div>
                      <div style={{ fontWeight: '700', color: '#0F172A', marginTop: '4px', fontSize: '14px' }}>{selectedEventForDossier.venue}</div>
                    </div>

                    <div style={{ background: '#F8FAFC', padding: '14px 18px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Official Schedule</div>
                      <div style={{ fontWeight: '600', color: '#0F172A', marginTop: '4px', fontSize: '13px' }}>
                        {formatManilaDateTime(selectedEventForDossier.startDate)}
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '14px 18px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Event Governance Actions</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                      <button
                        onClick={() => handleToggleArchive('event', selectedEventForDossier.id, selectedEventForDossier.isArchived)}
                        style={{
                          padding: '8px 14px', borderRadius: '8px',
                          background: selectedEventForDossier.isArchived ? '#EFF6FF' : '#FFFBEB',
                          border: selectedEventForDossier.isArchived ? '1px solid #BFDBFE' : '1px solid #FDE68A',
                          color: selectedEventForDossier.isArchived ? '#1D4ED8' : '#B45309',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                          fontSize: '12px', fontWeight: '700'
                        }}
                      >
                        {selectedEventForDossier.isArchived ? <IconRotateCcw /> : <IconArchive />}
                        <span>{selectedEventForDossier.isArchived ? 'Restore Event from Archive' : 'Archive Entire Event'}</span>
                      </button>

                      <button
                        onClick={() => setRecordToDelete({ type: 'event', id: selectedEventForDossier.id, title: selectedEventForDossier.title })}
                        style={{
                          padding: '8px 14px', borderRadius: '8px',
                          background: '#FEF2F2', border: '1px solid #FECACA',
                          color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                          fontSize: '12px', fontWeight: '700'
                        }}
                      >
                        <IconTrash />
                        <span>Delete Event Permanently</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 28px',
              borderTop: '1px solid #E2E8F0',
              background: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                Event attendance verified via evaluation completion.
              </div>
              <button
                onClick={() => setSelectedEventForDossier(null)}
                style={{
                  padding: '8px 18px', borderRadius: '8px', border: '1px solid #E2E8F0',
                  background: '#FFFFFF', color: '#334155', fontSize: '13px', fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: APPOINT OSDS OFFICER                             */}
      {/* ========================================================= */}
      {showAddOfficerModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '18px', width: '100%', maxWidth: '480px',
            padding: '28px 32px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '10px',
                  background: '#F5F3FF', color: '#7C3AED',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <IconUserPlus />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                    Appoint OSDS Officer
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                    Create authorized account for student activity management
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddOfficerModal(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
              >
                <IconClose />
              </button>
            </div>

            {officerError && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '10px', borderRadius: '8px', fontSize: '12px', marginBottom: '14px', fontWeight: '600' }}>
                {officerError}
              </div>
            )}

            {officerSuccess && (
              <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#047857', padding: '10px', borderRadius: '8px', fontSize: '12px', marginBottom: '14px', fontWeight: '600' }}>
                {officerSuccess}
              </div>
            )}

            <form onSubmit={handleAddOfficerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Officer Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ana Reyes"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Official Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. osds.officer@urs.edu.ph"
                  value={officerEmail}
                  onChange={(e) => setOfficerEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Department / Office
                </label>
                <input
                  type="text"
                  required
                  value={officerDept}
                  onChange={(e) => setOfficerDept(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Initial Password
                </label>
                <input
                  type="text"
                  required
                  value={officerPassword}
                  onChange={(e) => setOfficerPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddOfficerModal(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#64748B', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOfficer}
                  style={{
                    padding: '9px 18px', borderRadius: '8px', border: 'none',
                    background: submittingOfficer ? '#93C5FD' : '#2563EB',
                    color: '#FFFFFF', fontSize: '13px', fontWeight: '700', cursor: submittingOfficer ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submittingOfficer ? 'Registering...' : 'Appoint Officer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: CONFIRM DELETE                                   */}
      {/* ========================================================= */}
      {recordToDelete && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '18px', width: '100%', maxWidth: '440px',
            padding: '28px 32px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease',
            textAlign: 'center'
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: '#FEE2E2', margin: '0 auto 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <IconAlertTriangle />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: '0 0 8px' }}>
              Permanently Delete Record?
            </h3>

            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.5', margin: '0 0 16px' }}>
              Are you sure you want to delete <strong style={{ color: '#0F172A' }}>{recordToDelete.title}</strong>? This action cannot be reversed and will remove the entry from all campus audits.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button
                onClick={() => setRecordToDelete(null)}
                disabled={deleting}
                style={{
                  padding: '9px 18px', borderRadius: '8px', border: '1px solid #E2E8F0',
                  background: '#F8FAFC', color: '#64748B', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                style={{
                  padding: '9px 20px', borderRadius: '8px', border: 'none',
                  background: deleting ? '#FCA5A5' : '#DC2626',
                  color: '#FFFFFF', fontSize: '13px', fontWeight: '700', cursor: deleting ? 'not-allowed' : 'pointer'
                }}
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div style={{ padding: '60px', textAlign: 'center', color: '#94A3B8' }}>
        Loading administration...
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}
