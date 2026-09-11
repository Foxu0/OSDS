'use client';

import React, { useState, useEffect } from 'react';
import {
  getAdminOverview,
  searchStudentRecords,
  getOfficers,
  addOfficer,
  getCertificates,
  revokeCertificate,
  getEvents,
  getAttendanceLogs,
  updateEvent,
  ALLOWED_VENUES,
  getEventRegistrationStatus,
  getEffectiveRegistrationWindow,
  formatClassDisplay,
} from '@/lib/dataService';
import { OfficerAccount, CertificateRecord, CampusEvent, AttendanceRecord, EventStatus } from '@/types';
import { formatManilaDate, formatManilaTime, formatManilaDateTime } from '@/lib/timezone';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'officers' | 'certificates' | 'history'>('overview');

  // Metrics
  const [overview, setOverview] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    totalAttendees: 0,
    activeOfficers: 0,
    totalCertificates: 0,
  });

  // Student Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Officers State
  const [officers, setOfficers] = useState<OfficerAccount[]>([]);
  const [newOfficerName, setNewOfficerName] = useState('');
  const [newOfficerEmail, setNewOfficerEmail] = useState('');
  const [newOfficerDept, setNewOfficerDept] = useState('');
  const [addingOfficer, setAddingOfficer] = useState(false);
  const [officerMsg, setOfficerMsg] = useState('');

  // Certificates State
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [certSearch, setCertSearch] = useState('');
  const [certTypeFilter, setCertTypeFilter] = useState<string>('ALL');
  const [revokeCode, setRevokeCode] = useState('');
  const [revokeReason, setRevokeReason] = useState('');
  const [revokeMsg, setRevokeMsg] = useState('');
  const [revoking, setRevoking] = useState(false);

  // Events & Attendance State
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);

  // Admin Event Editing State
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CampusEvent | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editVenue, setEditVenue] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editRegOpens, setEditRegOpens] = useState('');
  const [editRegCloses, setEditRegCloses] = useState('');
  const [editStatus, setEditStatus] = useState<EventStatus>('UPCOMING');
  const [editRegistrationOpen, setEditRegistrationOpen] = useState(true);
  const [editProcessing, setEditProcessing] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    setLoading(true);
    const [ov, ofs, certs, evts, logs] = await Promise.all([
      getAdminOverview(),
      getOfficers(),
      getCertificates(),
      getEvents(),
      getAttendanceLogs(),
    ]);

    setOverview(ov);
    setOfficers(ofs);
    setCertificates(certs);
    setEvents(evts);
    setAttendanceLogs(logs);
    setLoading(false);
  }

  // Open Edit Event Modal for Admin
  const openEditEventModal = (evt: CampusEvent) => {
    setEditingEvent(evt);
    setEditTitle(evt.title);
    setEditDesc(evt.description);
    setEditVenue(evt.venue);
    const toLocalInput = (isoStr: string) => {
      try {
        const d = new Date(isoStr);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      } catch {
        return '';
      }
    };
    setEditStartDate(toLocalInput(evt.startDate));
    setEditEndDate(toLocalInput(evt.endDate));

    const { opensAt, closesAt } = getEffectiveRegistrationWindow(evt);
    setEditRegOpens(toLocalInput(opensAt.toISOString()));
    setEditRegCloses(toLocalInput(closesAt.toISOString()));

    setEditStatus(evt.status);
    setEditRegistrationOpen(evt.registrationOpen !== false);
    setShowEditEventModal(true);
  };

  // Handle Admin Update Event
  const handleAdminUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || !editTitle || !editVenue || !editStartDate || !editEndDate) return;
    setEditProcessing(true);

    await updateEvent(editingEvent.id, {
      title: editTitle,
      description: editDesc,
      venue: editVenue,
      startDate: new Date(editStartDate).toISOString(),
      endDate: new Date(editEndDate).toISOString(),
      registrationOpensAt: editRegOpens ? new Date(editRegOpens).toISOString() : undefined,
      registrationClosesAt: editRegCloses ? new Date(editRegCloses).toISOString() : undefined,
      status: editStatus,
      registrationOpen: editRegistrationOpen,
    });

    setEditProcessing(false);
    setShowEditEventModal(false);
    setEditingEvent(null);
    await loadAdminData();
  };

  // Handle Student Record Search
  const handleStudentSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const results = await searchStudentRecords(searchQuery.trim());
    setSearchResults(results);
    setSearching(false);
  };

  // Handle Add Officer
  const handleAddOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfficerName || !newOfficerEmail || !newOfficerDept) return;
    setAddingOfficer(true);
    setOfficerMsg('');
    try {
      await addOfficer({
        name: newOfficerName,
        email: newOfficerEmail,
        department: newOfficerDept,
      });
      setOfficerMsg(`Officer "${newOfficerName}" added successfully.`);
      setNewOfficerName('');
      setNewOfficerEmail('');
      setNewOfficerDept('');
      const updated = await getOfficers();
      setOfficers(updated);
    } catch (err: any) {
      setOfficerMsg('Failed to add officer: ' + err.message);
    } finally {
      setAddingOfficer(false);
    }
  };

  // Handle Revoke Certificate
  const handleRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokeCode.trim() || !revokeReason.trim()) return;
    setRevoking(true);
    setRevokeMsg('');

    const res = await revokeCertificate(revokeCode.trim(), revokeReason.trim());
    setRevokeMsg(res.message);
    setRevokeCode('');
    setRevokeReason('');

    const updatedCerts = await getCertificates();
    setCertificates(updatedCerts);
    setRevoking(false);
  };

  // Helper to get human-readable cert type label
  const certTypeLabel = (type: string) => {
    if (type === 'RECOGNITION' || type === 'WINNER') return 'Recognition';
    if (type === 'PARTICIPATION' || type === 'ATTENDANCE') return 'Participation';
    if (type === 'APPRECIATION') return 'Appreciation';
    return type;
  };

  const filteredCerts = certificates.filter((c) => {
    const searchTarget = [
      c.verificationCode.toLowerCase(),
      c.recipientName.toLowerCase(),
      c.eventTitle.toLowerCase(),
      (c.recipientIdentifier || '').toLowerCase(),
    ].join(' ');
    const matchesSearch = certSearch.trim() === '' || searchTarget.includes(certSearch.toLowerCase());
    const matchesType = certTypeFilter === 'ALL' ||
      (certTypeFilter === 'RECOGNITION' && (c.certificateType === 'RECOGNITION' || c.certificateType === 'WINNER')) ||
      (certTypeFilter === 'PARTICIPATION' && (c.certificateType === 'PARTICIPATION' || c.certificateType === 'ATTENDANCE')) ||
      (certTypeFilter === 'APPRECIATION' && c.certificateType === 'APPRECIATION');
    return matchesSearch && matchesType;
  });

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
      
      {/* Admin Title */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="badge badge-admin">Campus Administration</span>
          <span style={{ fontSize: '13px', color: '#64748B' }}>• URS Cainta Central Control</span>
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A' }}>
          System Administration & Records
        </h1>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '2px solid #E2E8F0',
        marginBottom: '28px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: '700',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: activeTab === 'overview' ? '#2563EB' : '#64748B',
            borderBottom: activeTab === 'overview' ? '3px solid #2563EB' : '3px solid transparent',
            marginBottom: '-2px',
          }}
        >
          📊 System Overview
        </button>

        <button
          onClick={() => setActiveTab('students')}
          style={{
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: '700',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: activeTab === 'students' ? '#2563EB' : '#64748B',
            borderBottom: activeTab === 'students' ? '3px solid #2563EB' : '3px solid transparent',
            marginBottom: '-2px',
          }}
        >
          🔍 Student Record Search
        </button>

        <button
          onClick={() => setActiveTab('officers')}
          style={{
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: '700',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: activeTab === 'officers' ? '#2563EB' : '#64748B',
            borderBottom: activeTab === 'officers' ? '3px solid #2563EB' : '3px solid transparent',
            marginBottom: '-2px',
          }}
        >
          👥 Officer Accounts
        </button>

        <button
          onClick={() => setActiveTab('certificates')}
          style={{
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: '700',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: activeTab === 'certificates' ? '#2563EB' : '#64748B',
            borderBottom: activeTab === 'certificates' ? '3px solid #2563EB' : '3px solid transparent',
            marginBottom: '-2px',
          }}
        >
          📜 Certificate History & Revocation
        </button>

        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: '700',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: activeTab === 'history' ? '#2563EB' : '#64748B',
            borderBottom: activeTab === 'history' ? '3px solid #2563EB' : '3px solid transparent',
            marginBottom: '-2px',
          }}
        >
          📁 Master Events & Scans
        </button>
      </div>

      {/* TAB 1: SYSTEM OVERVIEW */}
      {activeTab === 'overview' && (
        <div>
          {/* 5 Core Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            <div className="card" style={{ padding: '20px', borderLeft: '4px solid #2563EB' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Campus Events</div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#0F172A', marginTop: '6px' }}>{overview.totalEvents}</div>
              <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px' }}>Active in System</div>
            </div>

            <div className="card" style={{ padding: '20px', borderLeft: '4px solid #F59E0B' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Total Registrations</div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#0F172A', marginTop: '6px' }}>{overview.totalRegistrations}</div>
              <div style={{ fontSize: '12px', color: '#2563EB', marginTop: '4px' }}>Public Attendees</div>
            </div>

            <div className="card" style={{ padding: '20px', borderLeft: '4px solid #10B981' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Checked-in Attendees</div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#0F172A', marginTop: '6px' }}>{overview.totalAttendees}</div>
              <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px' }}>Scanned by QR</div>
            </div>

            <div className="card" style={{ padding: '20px', borderLeft: '4px solid #6366F1' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Active Officers</div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#0F172A', marginTop: '6px' }}>{overview.activeOfficers}</div>
              <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>Authorized Staff</div>
            </div>

            <div className="card" style={{ padding: '20px', borderLeft: '4px solid #EC4899' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Issued Certificates</div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#0F172A', marginTop: '6px' }}>{overview.totalCertificates}</div>
              <div style={{ fontSize: '12px', color: '#D97706', marginTop: '4px' }}>Tamper-proof Records</div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
                🔍 Search Student Activity
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
                Look up any attendee by student number to view all event registrations, check-in timestamps, and received e-certificates.
              </p>
              <button onClick={() => setActiveTab('students')} className="btn btn-primary" style={{ fontSize: '13px' }}>
                Open Student Search →
              </button>
            </div>

            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
                📜 Certificate Registry & Audit
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
                Inspect all issued digital certificates or revoke a certificate with a documented official audit reason.
              </p>
              <button onClick={() => setActiveTab('certificates')} className="btn btn-navy" style={{ fontSize: '13px' }}>
                Inspect Certificates →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT RECORD SEARCH */}
      {activeTab === 'students' && (
        <div>
          <div className="card" style={{ padding: '28px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
              Attendee & Student Record Search
            </h2>
            <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '20px' }}>
              Students do not require accounts. Search by Student ID Number or Name to retrieve complete registration history, check-in timestamps, and issued certificates across all campus events.
            </p>

            <form onSubmit={handleStudentSearch} style={{ display: 'flex', gap: '12px', maxWidth: '620px' }}>
              <input
                type="text"
                placeholder="Search by Student ID (e.g. C2024_00179), Name, Course, or Section (e.g. BSE 3B)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
              />
              <button
                type="submit"
                disabled={searching || !searchQuery.trim()}
                className="btn btn-primary"
                style={{ whiteSpace: 'nowrap' }}
              >
                {searching ? 'Searching...' : 'Search Records'}
              </button>
            </form>
          </div>

          {/* Search Results Display */}
          {searchResults.length === 0 && searchQuery && !searching && (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
              <h3>No attendee records found for "{searchQuery}"</h3>
              <p style={{ fontSize: '13px', marginTop: '6px' }}>Try searching with Student ID (e.g. C2024_00179), Name, Course (e.g. BSIT), or Class (e.g. 3B).</p>
            </div>
          )}

          {searchResults.map((student) => (
            <div key={student.studentNumber} className="card" style={{ padding: '28px', marginBottom: '24px' }}>
              {/* Header Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A' }}>{student.studentName}</h3>
                  <div style={{ fontFamily: 'monospace', fontSize: '15px', color: '#2563EB', fontWeight: '700', marginTop: '2px' }}>
                    Student ID: {student.studentNumber}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                    <span className="badge badge-student" style={{ fontWeight: '700' }}>
                      🏫 {student.classDisplay || formatClassDisplay(student.department, student.yearLevel || student.yearSection, student.section || student.yearSection)}
                    </span>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>
                      • {student.email}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <span className="badge badge-student">{student.events.length} Event(s) Registered</span>
                  <span className="badge badge-officer">{student.events.filter((e: any) => e.attended).length} Attended</span>
                  <span className="badge badge-gold">{student.certificates.length} Certificate(s)</span>
                </div>
              </div>

              {/* Event History Table */}
              <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', marginBottom: '10px' }}>
                Registered Events History:
              </h4>
              <div className="table-container" style={{ marginBottom: '20px' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Event Title</th>
                      <th>Registration Date (Server)</th>
                      <th>Attendance Status</th>
                      <th>Check-in Time (PST)</th>
                      <th>Scanned By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.events.map((e: any) => (
                      <tr key={e.eventId}>
                        <td style={{ fontWeight: '700', color: '#0F172A' }}>{e.eventTitle}</td>
                        <td style={{ fontSize: '12px', color: '#64748B' }}>
                          {formatManilaDateTime(e.registrationDate)}
                        </td>
                        <td>
                          <span className={`badge ${e.attended ? 'badge-officer' : 'badge-gold'}`}>
                            {e.attended ? 'Attended' : 'No Check-in'}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', color: e.attended ? '#059669' : '#94A3B8', fontWeight: e.attended ? '600' : 'normal' }}>
                          {e.checkInTime ? formatManilaDateTime(e.checkInTime) : '—'}
                        </td>
                        <td style={{ fontSize: '12px', color: '#64748B' }}>
                          {e.scannedBy || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Certificates Received */}
              {student.certificates.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', marginBottom: '10px' }}>
                    Earned E-Certificates:
                  </h4>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {student.certificates.map((c: CertificateRecord) => (
                      <div
                        key={c.id}
                        style={{
                          background: c.status === 'REVOKED' ? '#FEF2F2' : '#F0F9FF',
                          border: `1px solid ${c.status === 'REVOKED' ? '#FECACA' : '#BAE6FD'}`,
                          padding: '12px 16px',
                          borderRadius: '8px',
                          fontSize: '13px'
                        }}
                      >
                        <div style={{ fontWeight: '700', color: c.status === 'REVOKED' ? '#991B1B' : '#0369A1' }}>
                          {c.certificateType} • {c.awardTitle || c.eventTitle}
                        </div>
                        <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                          Code: {c.verificationCode}
                        </div>
                        <div style={{ fontSize: '11px', color: c.status === 'REVOKED' ? '#DC2626' : '#059669', marginTop: '4px', fontWeight: '600' }}>
                          Status: {c.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: OFFICER ACCOUNTS */}
      {activeTab === 'officers' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          
          {/* Existing Officers List */}
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '16px' }}>
              Authorized Officer & Facilitator Accounts
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {officers.map((o) => (
                <div
                  key={o.id}
                  style={{
                    padding: '14px 16px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    background: '#F8FAFC',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '700', color: '#0F172A' }}>{o.name}</div>
                    <div style={{ fontSize: '13px', color: '#2563EB' }}>{o.email}</div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{o.department}</div>
                  </div>
                  <span className="badge badge-officer">{o.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Add Officer Form */}
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '16px' }}>
              Add Officer / Facilitator
            </h2>

            {officerMsg && (
              <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
                {officerMsg}
              </div>
            )}

            <form onSubmit={handleAddOfficer}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Juan Perez"
                  value={newOfficerName}
                  onChange={(e) => setNewOfficerName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Official Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. facilitator@urs.edu.ph"
                  value={newOfficerEmail}
                  onChange={(e) => setNewOfficerEmail(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department / Council Unit *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. College of Computer Studies Student Council"
                  value={newOfficerDept}
                  onChange={(e) => setNewOfficerDept(e.target.value)}
                  className="form-input"
                />
              </div>

              <button
                type="submit"
                disabled={addingOfficer}
                className="btn btn-primary"
                style={{ width: '100%', padding: '10px' }}
              >
                {addingOfficer ? 'Adding...' : 'Create Officer Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: CERTIFICATES & REVOCATION */}
      {activeTab === 'certificates' && (
        <div>
          {/* Revocation Panel */}
          <div className="card" style={{ padding: '24px', marginBottom: '28px', borderLeft: '4px solid #EF4444' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
              🛡️ Official Certificate Revocation Station
            </h2>
            <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '16px' }}>
              Revoking a certificate immediately renders its unique verification code and QR link as <strong>REVOKED</strong> on the public verification portal.
            </p>

            {revokeMsg && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '12px 16px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', fontWeight: '600' }}>
                {revokeMsg}
              </div>
            )}

            <form onSubmit={handleRevoke} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Verification Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. URS-2026-CERT-8F3A91"
                  value={revokeCode}
                  onChange={(e) => setRevokeCode(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Official Revocation Reason *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Attendance falsification / Invalid issuance"
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  className="form-input"
                />
              </div>

              <button
                type="submit"
                disabled={revoking}
                className="btn btn-outline-danger"
                style={{ height: '42px', whiteSpace: 'nowrap' }}
              >
                {revoking ? 'Revoking...' : 'Revoke Certificate'}
              </button>
            </form>
          </div>

          {/* Certificate Search & Filter Bar */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search by code, recipient, student ID, or event..."
              value={certSearch}
              onChange={(e) => setCertSearch(e.target.value)}
              className="form-input"
              style={{ flex: 1, minWidth: '200px' }}
            />
            <select
              value={certTypeFilter}
              onChange={(e) => setCertTypeFilter(e.target.value)}
              className="form-select"
              style={{ width: '200px' }}
            >
              <option value="ALL">All Types</option>
              <option value="RECOGNITION">Recognition</option>
              <option value="PARTICIPATION">Participation</option>
              <option value="APPRECIATION">Appreciation</option>
            </select>
            <span style={{ fontSize: '13px', color: '#64748B', whiteSpace: 'nowrap' }}>
              {filteredCerts.length} of {certificates.length} certificates
            </span>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Verification Code</th>
                  <th>Recipient Name</th>
                  <th>Type</th>
                  <th>Event / Award</th>
                  <th>Signatory</th>
                  <th>Issue Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCerts.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: '700', color: '#2563EB', fontSize: '12px' }}>
                      {c.verificationCode}
                    </td>
                    <td>
                      <div style={{ fontWeight: '700', color: '#0F172A' }}>{c.recipientName}</div>
                      {c.recipientIdentifier && (
                        <div style={{ fontSize: '11px', color: '#64748B' }}>{c.recipientIdentifier}</div>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-student">{certTypeLabel(c.certificateType)}</span>
                    </td>
                    <td style={{ color: '#334155', fontSize: '13px' }}>
                      <div>{c.awardTitle || c.eventTitle}</div>
                      {c.competitionTitle && (
                        <div style={{ fontSize: '11px', color: '#64748B' }}>{c.competitionTitle}</div>
                      )}
                    </td>
                    <td style={{ fontSize: '12px', color: '#475569' }}>
                      <div>{c.issuedByName || '—'}</div>
                      {c.signatoryPosition && (
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>{c.signatoryPosition}</div>
                      )}
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748B' }}>
                      {formatManilaDateTime(c.issuedAt)}
                    </td>
                    <td>
                      <span className={`badge ${c.status === 'ISSUED' ? 'badge-officer' : 'badge-admin'}`}>
                        {c.status}
                      </span>
                      {c.status === 'REVOKED' && c.revokedAt && (
                        <div style={{ fontSize: '10px', color: '#DC2626', marginTop: '2px' }}>
                          {formatManilaDate(c.revokedAt)}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexDirection: 'column' }}>
                        {c.status !== 'REVOKED' && (
                          <a
                            href={`/api/certificates/download/${c.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary"
                            style={{ fontSize: '11px', padding: '4px 8px', textDecoration: 'none', textAlign: 'center' }}
                          >
                            📄 Download
                          </a>
                        )}
                        <a
                          href={`/verify/${c.verificationCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                          style={{ fontSize: '11px', padding: '4px 8px', textDecoration: 'none', textAlign: 'center' }}
                        >
                          🔗 Verify
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: MASTER EVENTS & SCANS */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Events Overview Table */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '16px' }}>
              All Campus Events Master Registry
            </h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Official Venue</th>
                    <th>Event Schedule</th>
                    <th>Registration Window</th>
                    <th>Registration Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((evt) => {
                    const regStatus = getEventRegistrationStatus(evt);
                    return (
                      <tr key={evt.id}>
                        <td style={{ fontWeight: '700', color: '#0F172A' }}>{evt.title}</td>
                        <td>
                          <span style={{ fontWeight: '600', color: '#1E40AF' }}>📍 {evt.venue}</span>
                        </td>
                        <td style={{ fontSize: '12px' }}>
                          <div>{formatManilaDate(evt.startDate)}</div>
                          <div style={{ color: '#64748B' }}>{formatManilaTime(evt.startDate)} – {formatManilaTime(evt.endDate)}</div>
                        </td>
                        <td style={{ fontSize: '12px', color: regStatus.canRegister ? '#059669' : '#B91C1C', fontWeight: '600' }}>
                          <div>{formatManilaTime(regStatus.opensAt.toISOString())} – {formatManilaTime(regStatus.closesAt.toISOString())}</div>
                        </td>
                        <td>
                          <span className={`badge ${regStatus.badgeClass}`}>{regStatus.label}</span>
                        </td>
                        <td>
                          <button
                            onClick={() => openEditEventModal(evt)}
                            className="btn btn-secondary"
                            style={{ fontSize: '11px', padding: '4px 8px' }}
                          >
                            ✏️ Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Master Attendance Scans */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '16px' }}>
              Master Scanned Attendance Feed
            </h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Attendee</th>
                    <th>Student ID</th>
                    <th>Event</th>
                    <th>Check-in Timestamp</th>
                    <th>Officer</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontWeight: '700' }}>{log.studentName}</td>
                      <td style={{ fontFamily: 'monospace', color: '#2563EB' }}>{log.studentNumber}</td>
                      <td>{log.eventTitle || 'Campus Event'}</td>
                      <td style={{ fontSize: '12px', color: '#059669' }}>{formatManilaDateTime(log.checkInTime)}</td>
                      <td><span className="badge badge-officer">{log.scannedByOfficerName}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN EDIT EVENT MODAL */}
      {showEditEventModal && editingEvent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '580px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '2px' }}>
                  ✏️ Admin Event Management
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B' }}>
                  Update official venue, status, and event schedules.
                </p>
              </div>
              <button
                onClick={() => setShowEditEventModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94A3B8' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdminUpdateEvent}>
              <div className="form-group">
                <label className="form-label">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Event Title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Official Campus Venue *</label>
                <select
                  required
                  value={editVenue}
                  onChange={(e) => setEditVenue(e.target.value)}
                  className="form-select"
                >
                  <option value="" disabled>-- Select Campus Venue --</option>
                  {editVenue && !ALLOWED_VENUES.includes(editVenue as any) && (
                    <option value={editVenue}>{editVenue} (Current Legacy Venue)</option>
                  )}
                  {ALLOWED_VENUES.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Event Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Event End Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Admin Registration Window Settings */}
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '10px' }}>
                  ⏳ Registration Window Schedule (Asia/Manila)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '12px' }}>Registration Opens At *</label>
                    <input
                      type="datetime-local"
                      required
                      value={editRegOpens}
                      onChange={(e) => setEditRegOpens(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '12px' }}>Registration Closes At (Deadline) *</label>
                    <input
                      type="datetime-local"
                      required
                      value={editRegCloses}
                      onChange={(e) => setEditRegCloses(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Event Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as EventStatus)}
                    className="form-select"
                  >
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="ONGOING">ONGOING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Registration Open</label>
                  <select
                    value={editRegistrationOpen ? 'OPEN' : 'CLOSED'}
                    onChange={(e) => setEditRegistrationOpen(e.target.value === 'OPEN')}
                    className="form-select"
                  >
                    <option value="OPEN">Open</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowEditEventModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editProcessing}
                  className="btn btn-primary"
                >
                  {editProcessing ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
