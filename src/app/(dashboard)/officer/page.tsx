'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  getEvents,
  createEvent,
  updateEvent,
  ALLOWED_VENUES,
  getEventRegistrationStatus,
  getEffectiveRegistrationWindow,
  getEventPublicUrl,
  processQRScan,
  getLiveAttendanceMonitoring,
  issueParticipationCertificatesBatch,
  issueRecognitionCertificate,
  issueGuestSpeakerCertificate,
  getCertificates,
  formatClassDisplay,
  ALLOWED_COURSES,
  ALLOWED_YEAR_LEVELS,
  ALLOWED_SECTIONS,
} from '@/lib/dataService';
import { CampusEvent, EventStatus } from '@/types';
import { formatManilaDate, formatManilaTime, formatManilaDateTime } from '@/lib/timezone';

export default function OfficerDashboard() {
  const { data: session } = useSession();
  const officer = session?.user as any;

  // Active Tab
  const [activeTab, setActiveTab] = useState<'events' | 'scanner' | 'live' | 'certificates'>('events');

  // Events State
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newVenue, setNewVenue] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newRegOpens, setNewRegOpens] = useState('');
  const [newRegCloses, setNewRegCloses] = useState('');

  // Event Editing State
  const [showEditModal, setShowEditModal] = useState(false);
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

  // Event Registration QR Modal
  const [selectedEventForQr, setSelectedEventForQr] = useState<CampusEvent | null>(null);
  const [eventQrDataUrl, setEventQrDataUrl] = useState('');

  // Scanner State
  const [manualToken, setManualToken] = useState('');
  const [scanProcessing, setScanProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    isDuplicate: boolean;
    message: string;
    registration?: any;
    attendance?: any;
  } | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Live Attendance State
  const [selectedEventIdForLive, setSelectedEventIdForLive] = useState('');
  const [liveData, setLiveData] = useState<{
    totalRegistered: number;
    totalCheckedIn: number;
    notCheckedIn: number;
    records: Array<{ registration: any; attendance?: any; checkedIn: boolean }>;
  } | null>(null);
  const [liveSearch, setLiveSearch] = useState('');
  const [liveFilter, setLiveFilter] = useState<'all' | 'checkedIn' | 'pending'>('all');

  // E-Certificate Station State
  const [certTypeTab, setCertTypeTab] = useState<'participation' | 'recognition' | 'speaker'>('participation');
  const [certEventId, setCertEventId] = useState('');
  const [certMsg, setCertMsg] = useState('');
  const [certProcessing, setCertProcessing] = useState(false);
  const [lastIssuedCert, setLastIssuedCert] = useState<{ id: string; code: string; type: string } | null>(null);

  // Signatory (shared across all cert forms)
  const [signatoryPosition, setSignatoryPosition] = useState('');

  // Recognition Cert Form
  const [winnerName, setWinnerName] = useState('');
  const [winnerAward, setWinnerAward] = useState('Grand Champion');
  const [winnerCompetition, setWinnerCompetition] = useState('');
  const [winnerIdNumber, setWinnerIdNumber] = useState('');

  // Speaker / Appreciation Cert Form
  const [speakerName, setSpeakerName] = useState('');
  const [speakerTopic, setSpeakerTopic] = useState('');
  const [speakerEmail, setSpeakerEmail] = useState('');
  const [speakerRole, setSpeakerRole] = useState('Resource Speaker');

  // Load Initial Events
  useEffect(() => {
    loadAllEvents();
  }, []);

  async function loadAllEvents() {
    setLoadingEvents(true);
    const data = await getEvents();
    setEvents(data);
    if (data.length > 0) {
      if (!selectedEventIdForLive) setSelectedEventIdForLive(data[0].id);
      if (!certEventId) setCertEventId(data[0].id);
    }
    setLoadingEvents(false);
  }

  // Load Live Attendance when event changes
  useEffect(() => {
    if (selectedEventIdForLive && activeTab === 'live') {
      loadLiveMonitoring(selectedEventIdForLive);
    }
  }, [selectedEventIdForLive, activeTab]);

  async function loadLiveMonitoring(eventId: string) {
    const data = await getLiveAttendanceMonitoring(eventId);
    setLiveData(data);
  }

  // Camera Scanner Setup
  useEffect(() => {
    let html5QrcodeScanner: any = null;
    if (cameraActive && activeTab === 'scanner') {
      import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
        html5QrcodeScanner = new Html5QrcodeScanner(
          'reader-container',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );
        html5QrcodeScanner.render(
          (tokenText: string) => {
            handleScanToken(tokenText);
          },
          () => {}
        );
      });
    }

    return () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch((e: any) => console.error(e));
      }
    };
  }, [cameraActive, activeTab]);

  // Process QR Scan
  const handleScanToken = async (tokenStr: string) => {
    if (!tokenStr || scanProcessing) return;
    setScanProcessing(true);
    setScanResult(null);

    const officerId = officer?.id || 'demo-officer-1';
    const officerName = officer?.name || 'Maria Santos';

    const res = await processQRScan(tokenStr.trim(), officerId, officerName);
    setScanResult(res);
    setScanProcessing(false);
    setManualToken('');

    // Refresh live monitoring if active
    if (selectedEventIdForLive) {
      loadLiveMonitoring(selectedEventIdForLive);
    }
  };

  // Auto-calculate 1-hour default registration window when start date changes
  const handleNewStartDateChange = (val: string) => {
    setNewStartDate(val);
    if (val) {
      try {
        const d = new Date(val);
        const pad = (n: number) => n.toString().padStart(2, '0');
        const toLocalStr = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
        const oneHourBefore = new Date(d.getTime() - 60 * 60 * 1000);
        setNewRegOpens(toLocalStr(oneHourBefore));
        setNewRegCloses(toLocalStr(d));
      } catch {
        // ignore invalid date typing
      }
    }
  };

  // Create Event Handler
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newVenue || !newStartDate || !newEndDate) return;

    await createEvent({
      title: newTitle,
      description: newDesc,
      venue: newVenue,
      startDate: new Date(newStartDate).toISOString(),
      endDate: new Date(newEndDate).toISOString(),
      registrationOpensAt: newRegOpens ? new Date(newRegOpens).toISOString() : undefined,
      registrationClosesAt: newRegCloses ? new Date(newRegCloses).toISOString() : undefined,
      createdById: officer?.id || 'demo-officer-1',
    });

    setShowCreateModal(false);
    setNewTitle('');
    setNewDesc('');
    setNewVenue('');
    setNewStartDate('');
    setNewEndDate('');
    setNewRegOpens('');
    setNewRegCloses('');
    await loadAllEvents();
  };

  // Open Edit Event Modal
  const openEditModal = (evt: CampusEvent) => {
    setEditingEvent(evt);
    setEditTitle(evt.title);
    setEditDesc(evt.description);
    setEditVenue(evt.venue);
    // Format ISO string to datetime-local format YYYY-MM-DDTHH:mm
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
    setShowEditModal(true);
  };

  // Handle Update Event
  const handleUpdateEvent = async (e: React.FormEvent) => {
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
    setShowEditModal(false);
    setEditingEvent(null);
    await loadAllEvents();
  };

  // Open Event Registration QR Flyer (Dynamic Production URL)
  const openEventQr = async (evt: CampusEvent) => {
    setSelectedEventForQr(evt);
    const eventUrl = getEventPublicUrl(evt.id);

    const qr = await QRCode.toDataURL(eventUrl, {
      width: 320,
      margin: 2,
      color: { dark: '#0F172A', light: '#FFFFFF' },
    });
    setEventQrDataUrl(qr);
  };

  // Certificate Handlers
  const handleBatchParticipation = async () => {
    if (!certEventId) return;
    setCertProcessing(true);
    setCertMsg('');
    setLastIssuedCert(null);
    const res = await issueParticipationCertificatesBatch(
      certEventId,
      officer?.id || 'demo-officer-1',
      officer?.name || 'Maria Santos',
      signatoryPosition || undefined
    );
    setCertMsg(res.message);
    setCertProcessing(false);
  };

  const handleIssueWinnerCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certEventId || !winnerName || !winnerAward) return;
    setCertProcessing(true);
    setCertMsg('');
    setLastIssuedCert(null);
    const res = await issueRecognitionCertificate({
      eventId: certEventId,
      recipientName: winnerName,
      awardTitle: winnerAward,
      competitionTitle: winnerCompetition,
      recipientIdentifier: winnerIdNumber,
      officerId: officer?.id || 'demo-officer-1',
      officerName: officer?.name || 'Maria Santos',
      signatoryPosition: signatoryPosition || undefined,
    });
    if (res.success && res.certificate) {
      setLastIssuedCert({ id: res.certificate.id, code: res.certificate.verificationCode, type: 'Recognition' });
      setCertMsg(`✅ Certificate of Recognition issued! Code: ${res.certificate.verificationCode}`);
    } else {
      setCertMsg(res.message || 'Error issuing certificate.');
    }
    setWinnerName('');
    setWinnerCompetition('');
    setWinnerIdNumber('');
    setCertProcessing(false);
  };

  const handleIssueSpeakerCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certEventId || !speakerName || !speakerTopic) return;
    setCertProcessing(true);
    setCertMsg('');
    setLastIssuedCert(null);
    const res = await issueGuestSpeakerCertificate({
      eventId: certEventId,
      speakerName,
      keynoteTopic: speakerTopic,
      recipientRole: speakerRole,
      speakerEmail,
      officerId: officer?.id || 'demo-officer-1',
      officerName: officer?.name || 'Maria Santos',
      signatoryPosition: signatoryPosition || undefined,
    });
    if (res.success && res.certificate) {
      setLastIssuedCert({ id: res.certificate.id, code: res.certificate.verificationCode, type: 'Appreciation' });
      setCertMsg(`✅ Certificate of Appreciation issued for ${speakerName}! Code: ${res.certificate.verificationCode}`);
    } else {
      setCertMsg(res.message || 'Error issuing certificate.');
    }
    setSpeakerName('');
    setSpeakerTopic('');
    setSpeakerEmail('');
    setSpeakerRole('Resource Speaker');
    setCertProcessing(false);
  };

  // Filtered Live Records
  const filteredLiveRecords = (liveData?.records || []).filter((item) => {
    const formattedClass = formatClassDisplay(
      item.registration.department,
      item.registration.yearLevel || item.registration.yearSection,
      item.registration.section || item.registration.yearSection
    ).toLowerCase();

    const searchTarget = [
      item.registration.studentName.toLowerCase(),
      item.registration.studentNumber.toLowerCase(),
      item.registration.department.toLowerCase(),
      item.registration.yearSection.toLowerCase(),
      (item.registration.yearLevel || '').toLowerCase(),
      (item.registration.section || '').toLowerCase(),
      formattedClass,
    ].join(' ');

    const terms = liveSearch.trim().toLowerCase().split(/[\s—\-–]+/).filter(Boolean);
    const matchesSearch = terms.length === 0 || terms.every((t) => searchTarget.includes(t));

    if (!matchesSearch) return false;
    if (liveFilter === 'checkedIn') return item.checkedIn;
    if (liveFilter === 'pending') return !item.checkedIn;
    return true;
  });

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
      
      {/* Workspace Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-officer">Officer & Facilitator Portal</span>
            <span style={{ fontSize: '13px', color: '#64748B' }}>
              • {officer?.department || 'Supreme Student Council'}
            </span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A' }}>
            Campus Event Operations Hub
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
            style={{ fontSize: '13px' }}
          >
            + Create New Event
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '2px solid #E2E8F0',
        marginBottom: '28px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setActiveTab('events')}
          style={{
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: '700',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: activeTab === 'events' ? '#2563EB' : '#64748B',
            borderBottom: activeTab === 'events' ? '3px solid #2563EB' : '3px solid transparent',
            marginBottom: '-2px',
            transition: 'all 0.2s ease',
          }}
        >
          📅 Events & Registration QR
        </button>

        <button
          onClick={() => setActiveTab('scanner')}
          style={{
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: '700',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: activeTab === 'scanner' ? '#2563EB' : '#64748B',
            borderBottom: activeTab === 'scanner' ? '3px solid #2563EB' : '3px solid transparent',
            marginBottom: '-2px',
            transition: 'all 0.2s ease',
          }}
        >
          📷 QR Attendance Scanner
        </button>

        <button
          onClick={() => setActiveTab('live')}
          style={{
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: '700',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: activeTab === 'live' ? '#2563EB' : '#64748B',
            borderBottom: activeTab === 'live' ? '3px solid #2563EB' : '3px solid transparent',
            marginBottom: '-2px',
            transition: 'all 0.2s ease',
          }}
        >
          📊 Live Attendance Monitor
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
            transition: 'all 0.2s ease',
          }}
        >
          🎓 E-Certificate Station
        </button>
      </div>

      {/* TAB 1: EVENTS HUB & REGISTRATION QR FLYERS */}
      {activeTab === 'events' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
            {events.map((evt) => {
              const regStatus = getEventRegistrationStatus(evt);
              return (
                <div key={evt.id} className="card card-hover" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '6px' }}>
                    <span className={`badge ${regStatus.badgeClass}`}>{regStatus.label}</span>
                    <span style={{ fontSize: '12px', color: '#1E40AF', fontWeight: '700' }}>📍 {evt.venue}</span>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
                    {evt.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px', flex: 1, lineHeight: 1.5 }}>
                    {evt.description}
                  </p>

                  <div style={{ fontSize: '12px', color: '#475569', background: '#F8FAFC', padding: '12px', borderRadius: '6px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>📅 <strong>Date:</strong> {formatManilaDate(evt.startDate)}</div>
                    <div>⏰ <strong>Event:</strong> {formatManilaTime(evt.startDate)} – {formatManilaTime(evt.endDate)}</div>
                    <div style={{ color: regStatus.canRegister ? '#059669' : '#B91C1C', fontWeight: '600', paddingTop: '4px', borderTop: '1px dashed #E2E8F0' }}>
                      ⏳ <strong>Reg Window:</strong> {formatManilaTime(regStatus.opensAt.toISOString())} – {formatManilaTime(regStatus.closesAt.toISOString())}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => openEditModal(evt)}
                      className="btn btn-secondary"
                      style={{ fontSize: '12px', padding: '8px 12px' }}
                    >
                      ✏️ Edit Event
                    </button>
                    <button
                      onClick={() => openEventQr(evt)}
                      className="btn btn-primary"
                      style={{ flex: 1, fontSize: '12px', padding: '8px' }}
                    >
                      📢 Event QR Flyer
                    </button>
                    <Link
                      href={`/events/${evt.id}`}
                      target="_blank"
                      className="btn btn-secondary"
                      style={{ fontSize: '12px', padding: '8px 12px' }}
                    >
                      View Public Page ↗
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: QR ATTENDANCE SCANNER */}
      {activeTab === 'scanner' && (
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          
          {/* Duplicate Attendance Warning or Success Alert */}
          {scanResult && (
            <div style={{
              background: scanResult.isDuplicate
                ? '#FEF2F2'
                : scanResult.success
                ? '#ECFDF5'
                : '#FFFBEB',
              border: `2px solid ${
                scanResult.isDuplicate
                  ? '#EF4444'
                  : scanResult.success
                  ? '#10B981'
                  : '#F59E0B'
              }`,
              color: scanResult.isDuplicate
                ? '#991B1B'
                : scanResult.success
                ? '#065F46'
                : '#92400E',
              padding: '18px 20px',
              borderRadius: '12px',
              marginBottom: '24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800', fontSize: '16px', marginBottom: '4px' }}>
                <span>{scanResult.isDuplicate ? '⚠️ DUPLICATE CHECK-IN PREVENTED' : scanResult.success ? '✓ ATTENDANCE RECORDED' : '❌ SCAN FAILED'}</span>
              </div>
              <p style={{ fontSize: '14px', lineHeight: 1.5 }}>{scanResult.message}</p>
              {scanResult.registration && (
                <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.9 }}>
                  Attendee: <strong>{scanResult.registration.studentName}</strong> (ID: {scanResult.registration.studentNumber})
                </div>
              )}
            </div>
          )}

          {/* Scanner Control Card */}
          <div className="card" style={{ padding: '32px', textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
              Personal Attendance QR Scanner
            </h2>
            <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '20px' }}>
              Scan student attendance QR passes via camera or enter the QR pass token below.
            </p>

            <button
              onClick={() => setCameraActive(!cameraActive)}
              className={cameraActive ? 'btn btn-outline-danger' : 'btn btn-primary'}
              style={{ marginBottom: '24px', padding: '10px 24px' }}
            >
              {cameraActive ? '⏹ Stop Device Camera' : '📷 Start Device Camera Scanner'}
            </button>

            {cameraActive && (
              <div style={{
                maxWidth: '380px',
                margin: '0 auto 24px auto',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '2px solid #CBD5E1'
              }}>
                <div id="reader-container" />
              </div>
            )}

            {/* Manual Token Form */}
            <div style={{ maxWidth: '440px', margin: '0 auto', borderTop: '1px solid #E2E8F0', paddingTop: '20px' }}>
              <label className="form-label" style={{ textAlign: 'left' }}>
                Manual QR Pass Token Entry
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Paste or type qr_token_..."
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  className="form-input"
                />
                <button
                  onClick={() => handleScanToken(manualToken)}
                  disabled={!manualToken.trim() || scanProcessing}
                  className="btn btn-navy"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {scanProcessing ? 'Checking...' : 'Check In →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE ATTENDANCE MONITORING */}
      {activeTab === 'live' && (
        <div>
          {/* Event Selector & Metrics Bar */}
          <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ flex: 1, minWidth: '260px' }}>
                <label className="form-label">Select Event for Live Monitoring</label>
                <select
                  value={selectedEventIdForLive}
                  onChange={(e) => setSelectedEventIdForLive(e.target.value)}
                  className="form-select"
                >
                  {events.map((evt) => (
                    <option key={evt.id} value={evt.id}>{evt.title} ({evt.venue})</option>
                  ))}
                </select>
                {events.find((e) => e.id === selectedEventIdForLive) && (
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px', fontWeight: '600' }}>
                    📍 Venue: <span style={{ color: '#0F172A', fontWeight: '700' }}>{events.find((e) => e.id === selectedEventIdForLive)?.venue}</span>
                  </div>
                )}
              </div>

              {/* Metrics */}
              {liveData && (
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '10px 18px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#1E40AF', fontWeight: '700', textTransform: 'uppercase' }}>Total Registered</div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#1E3A8A' }}>{liveData.totalRegistered}</div>
                  </div>

                  <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '10px 18px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#065F46', fontWeight: '700', textTransform: 'uppercase' }}>Checked In</div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#059669' }}>{liveData.totalCheckedIn}</div>
                  </div>

                  <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '10px 18px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#92400E', fontWeight: '700', textTransform: 'uppercase' }}>Pending Check-in</div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#D97706' }}>{liveData.notCheckedIn}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Filter by student name or student number..."
              value={liveSearch}
              onChange={(e) => setLiveSearch(e.target.value)}
              className="form-input"
              style={{ maxWidth: '360px' }}
            />

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setLiveFilter('all')}
                className={`btn ${liveFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '8px 14px', fontSize: '12px' }}
              >
                All ({liveData?.records.length || 0})
              </button>
              <button
                onClick={() => setLiveFilter('checkedIn')}
                className={`btn ${liveFilter === 'checkedIn' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '8px 14px', fontSize: '12px' }}
              >
                Checked In ({liveData?.totalCheckedIn || 0})
              </button>
              <button
                onClick={() => setLiveFilter('pending')}
                className={`btn ${liveFilter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '8px 14px', fontSize: '12px' }}
              >
                Pending ({liveData?.notCheckedIn || 0})
              </button>
            </div>
          </div>

          {/* Live Records Table */}
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Student ID</th>
                  <th>Department / Section</th>
                  <th>Registration Time</th>
                  <th>Attendance Status</th>
                  <th>Check-in Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredLiveRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                      No attendee records found matching the current filter.
                    </td>
                  </tr>
                ) : (
                  filteredLiveRecords.map((item) => (
                    <tr key={item.registration.id}>
                      <td style={{ fontWeight: '700', color: '#0F172A' }}>{item.registration.studentName}</td>
                      <td style={{ fontFamily: 'monospace', color: '#2563EB', fontWeight: '700' }}>
                        {item.registration.studentNumber}
                      </td>
                      <td>
                        <span className="badge badge-student" style={{ fontWeight: '700' }}>
                          {formatClassDisplay(
                            item.registration.department,
                            item.registration.yearLevel || item.registration.yearSection,
                            item.registration.section || item.registration.yearSection
                          )}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: '#64748B' }}>
                        {formatManilaDateTime(item.registration.registrationDate)}
                      </td>
                      <td>
                        <span className={`badge ${item.checkedIn ? 'badge-officer' : 'badge-gold'}`}>
                          {item.checkedIn ? 'Checked In' : 'Not Yet'}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: item.checkedIn ? '#059669' : '#94A3B8', fontWeight: item.checkedIn ? '600' : 'normal' }}>
                        {item.attendance ? formatManilaDateTime(item.attendance.checkInTime) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: E-CERTIFICATE STATION */}
      {activeTab === 'certificates' && (
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>

          {/* Success Message + Download Button */}
          {certMsg && (
            <div style={{
              background: certMsg.startsWith('✅') ? '#ECFDF5' : '#FEF3C7',
              border: `1px solid ${certMsg.startsWith('✅') ? '#A7F3D0' : '#FDE68A'}`,
              color: certMsg.startsWith('✅') ? '#065F46' : '#92400E',
              padding: '14px 18px',
              borderRadius: '8px',
              marginBottom: lastIssuedCert ? '8px' : '20px',
              fontWeight: '600',
              fontSize: '14px',
            }}>
              {certMsg}
            </div>
          )}

          {/* Download Certificate Button after issuance */}
          {lastIssuedCert && (
            <div style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '10px',
              padding: '16px 20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
            }}>
              <div>
                <div style={{ fontWeight: '700', color: '#065F46', fontSize: '14px' }}>
                  Certificate of {lastIssuedCert.type} Ready
                </div>
                <div style={{ fontSize: '12px', color: '#047857', marginTop: '2px' }}>
                  Code: {lastIssuedCert.code}
                </div>
              </div>
              <a
                href={`/api/certificates/download/${lastIssuedCert.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ fontSize: '13px', padding: '10px 20px', textDecoration: 'none' }}
              >
                📄 Download PDF Certificate
              </a>
            </div>
          )}

          {/* Sub-Tabs for Certificate Types */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <button
              onClick={() => { setCertTypeTab('participation'); setCertMsg(''); setLastIssuedCert(null); }}
              className={`btn ${certTypeTab === 'participation' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, fontSize: '13px' }}
            >
              1. Participation (Batch)
            </button>
            <button
              onClick={() => { setCertTypeTab('recognition'); setCertMsg(''); setLastIssuedCert(null); }}
              className={`btn ${certTypeTab === 'recognition' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, fontSize: '13px' }}
            >
              2. Recognition
            </button>
            <button
              onClick={() => { setCertTypeTab('speaker'); setCertMsg(''); setLastIssuedCert(null); }}
              className={`btn ${certTypeTab === 'speaker' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, fontSize: '13px' }}
            >
              3. Appreciation
            </button>
          </div>

          {/* Shared Signatory Section */}
          <div className="card" style={{ padding: '18px 24px', marginBottom: '20px', background: '#F8FAFC' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Signatory Information (appears on all certificates)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '12px' }}>Signatory Name</label>
                <input
                  type="text"
                  placeholder={officer?.name || 'Campus Director Name'}
                  value={officer?.name || ''}
                  readOnly
                  className="form-input"
                  style={{ fontSize: '13px', background: '#F1F5F9', cursor: 'not-allowed' }}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '12px' }}>Signatory Position / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Dean, College of Computer Studies"
                  value={signatoryPosition}
                  onChange={(e) => setSignatoryPosition(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '13px' }}
                />
              </div>
            </div>
          </div>

          {/* Form 1: Batch Participation */}
          {certTypeTab === 'participation' && (
            <div className="card" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
                Issue Certificates of Participation
              </h2>
              <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '24px' }}>
                Generates tamper-proof e-certificates for all verified attendees who were checked in via QR scan.
              </p>

              <div className="form-group">
                <label className="form-label">Select Event</label>
                <select
                  value={certEventId}
                  onChange={(e) => setCertEventId(e.target.value)}
                  className="form-select"
                >
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>{e.title}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleBatchParticipation}
                disabled={certProcessing || !certEventId}
                className="btn btn-primary"
                style={{ padding: '12px 28px' }}
              >
                {certProcessing ? 'Generating Batch...' : '⚡ Generate Certificates for Verified Attendees'}
              </button>
            </div>
          )}

          {/* Form 2: Certificate of Recognition */}
          {certTypeTab === 'recognition' && (
            <div className="card" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
                Issue Certificate of Recognition
              </h2>
              <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '24px' }}>
                Record competition winners or honor recipients permanently and issue their digital certificate.
              </p>

              <form onSubmit={handleIssueWinnerCert}>
                <div className="form-group">
                  <label className="form-label">Event</label>
                  <select
                    value={certEventId}
                    onChange={(e) => setCertEventId(e.target.value)}
                    className="form-select"
                  >
                    {events.map((e) => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Recipient Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Juan Dela Cruz (or Team Alpha)"
                    value={winnerName}
                    onChange={(e) => setWinnerName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Award / Rank *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Grand Champion, 1st Runner-Up"
                      value={winnerAward}
                      onChange={(e) => setWinnerAward(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Student ID / Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. C2024_00179"
                      value={winnerIdNumber}
                      onChange={(e) => setWinnerIdNumber(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Competition / Category Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Web Development Innovation Challenge"
                    value={winnerCompetition}
                    onChange={(e) => setWinnerCompetition(e.target.value)}
                    className="form-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={certProcessing}
                  className="btn btn-gold"
                  style={{ padding: '12px 28px' }}
                >
                  {certProcessing ? 'Issuing...' : '🏆 Issue Certificate of Recognition'}
                </button>
              </form>
            </div>
          )}

          {/* Form 3: Certificate of Appreciation */}
          {certTypeTab === 'speaker' && (
            <div className="card" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
                Issue Certificate of Appreciation
              </h2>
              <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '24px' }}>
                Recipients do not require a student account. Enter their details to stamp a verified Certificate of Appreciation.
              </p>

              <form onSubmit={handleIssueSpeakerCert}>
                <div className="form-group">
                  <label className="form-label">Event</label>
                  <select
                    value={certEventId}
                    onChange={(e) => setCertEventId(e.target.value)}
                    className="form-select"
                  >
                    {events.map((e) => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Recipient Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Maria Clara Ramos, PE"
                      value={speakerName}
                      onChange={(e) => setSpeakerName(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Recipient Role *</label>
                    <select
                      value={speakerRole}
                      onChange={(e) => setSpeakerRole(e.target.value)}
                      className="form-select"
                    >
                      <option>Resource Speaker</option>
                      <option>Keynote Speaker</option>
                      <option>Panelist</option>
                      <option>Event Judge</option>
                      <option>Facilitator</option>
                      <option>Workshop Trainer</option>
                      <option>Special Guest</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Topic / Contribution *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Emerging Trends in AI and Cyber Resilience"
                    value={speakerTopic}
                    onChange={(e) => setSpeakerTopic(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="e.g. speaker@organization.com"
                    value={speakerEmail}
                    onChange={(e) => setSpeakerEmail(e.target.value)}
                    className="form-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={certProcessing}
                  className="btn btn-primary"
                  style={{ padding: '12px 28px' }}
                >
                  {certProcessing ? 'Issuing...' : '📜 Issue Certificate of Appreciation'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* MODAL: Event Registration QR Code */}
      {selectedEventForQr && (
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
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
              Event Registration QR Code
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>
              {selectedEventForQr.title}
            </p>

            {eventQrDataUrl && (
              <div style={{
                background: '#FFFFFF',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                display: 'inline-block',
                marginBottom: '20px'
              }}>
                <img src={eventQrDataUrl} alt="Event QR" style={{ width: '240px', height: '240px', display: 'block' }} />
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <a
                href={eventQrDataUrl}
                download={`QR_${selectedEventForQr.title.replace(/\s+/g, '_')}.png`}
                className="btn btn-primary"
                style={{ fontSize: '13px' }}
              >
                💾 Download Flyer QR
              </a>
              <button
                onClick={() => setSelectedEventForQr(null)}
                className="btn btn-secondary"
                style={{ fontSize: '13px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create Event */}
      {showCreateModal && (
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
          <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '16px' }}>
              Create New Campus Activity
            </h3>

            <form onSubmit={handleCreateEvent}>
              <div className="form-group">
                <label className="form-label">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. URS Innovation Conference 2026"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide activity overview and instructions..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Venue *</label>
                <select
                  required
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  className="form-select"
                >
                  <option value="" disabled>-- Select Campus Venue --</option>
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
                    value={newStartDate}
                    onChange={(e) => handleNewStartDateChange(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Event End Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Strict Registration Window Settings */}
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
                    ⏳ Official Registration Window (Strict Expiration)
                  </span>
                  <span style={{ fontSize: '11px', color: '#2563EB', fontWeight: '600' }}>
                    Default: 1-Hour Window Prior to Start
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '12px' }}>Registration Opens At *</label>
                    <input
                      type="datetime-local"
                      required
                      value={newRegOpens}
                      onChange={(e) => setNewRegOpens(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '12px' }}>Registration Closes At (Deadline) *</label>
                    <input
                      type="datetime-local"
                      required
                      value={newRegCloses}
                      onChange={(e) => setNewRegCloses(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
                <p style={{ fontSize: '11px', color: '#64748B', marginTop: '8px' }}>
                  ⚠️ The server will reject all registration attempts once the Registration Closes At timestamp is reached.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Event & Generate QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT EVENT MODAL */}
      {showEditModal && editingEvent && (
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
                  ✏️ Edit Campus Event
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B' }}>
                  Update event details, official venue, and schedule.
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94A3B8' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateEvent}>
              <div className="form-group">
                <label className="form-label">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. URS Innovation Conference 2026"
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
                  placeholder="Provide activity overview and instructions..."
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Venue * (Official Campus Venue)</label>
                <select
                  required
                  value={editVenue}
                  onChange={(e) => setEditVenue(e.target.value)}
                  className="form-select"
                >
                  <option value="" disabled>-- Select Campus Venue --</option>
                  {/* Keep legacy venue visible if event was created previously with custom text */}
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

              {/* Edit Strict Registration Window */}
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
                <p style={{ fontSize: '11px', color: '#64748B', marginTop: '8px' }}>
                  Review and confirm the closing time before saving. Students scanning the QR after this time will see "Registration Closed".
                </p>
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
                  <label className="form-label">Registration Access</label>
                  <select
                    value={editRegistrationOpen ? 'OPEN' : 'CLOSED'}
                    onChange={(e) => setEditRegistrationOpen(e.target.value === 'OPEN')}
                    className="form-select"
                  >
                    <option value="OPEN">Public Registration Open</option>
                    <option value="CLOSED">Registration Closed</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
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
