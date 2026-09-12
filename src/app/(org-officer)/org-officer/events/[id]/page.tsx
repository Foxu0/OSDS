'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { getEventPublicUrl } from '@/lib/appUrl';

// --- Pure SVG Icon Library (Strictly No Emojis) ---
const IconFileText = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);
const IconQrCode = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const IconRefresh = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);
const IconArrowLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconClipboardList = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/>
  </svg>
);
const IconStar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconAward = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);
const IconDownload = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const IconExternalLink = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);
const IconCopy = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
const IconCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconSave = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
);
const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const IconUserPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
    <line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
  </svg>
);
const IconCheckCircle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IconToggleOn = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="5" width="22" height="14" rx="7" ry="7"/>
    <circle cx="16" cy="12" r="3" fill="currentColor"/>
  </svg>
);
const IconToggleOff = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="5" width="22" height="14" rx="7" ry="7"/>
    <circle cx="8" cy="12" r="3"/>
  </svg>
);
const IconPrinter = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
  </svg>
);

interface FacilitatorItem {
  name: string;
  role: string;
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
  facilitators?: (string | FacilitatorItem)[];
  bannerImage?: string;
}

interface Registration {
  id: string;
  studentName: string;
  studentNumber: string;
  department: string;
  yearSection: string;
  registrationDate: string;
  status: string;
  email?: string;
}

interface CertificateItem {
  id: string;
  verificationCode: string;
  certificateType: string;
  recipientName: string;
  recipientIdentifier?: string;
  issuedAt: string;
  status: string;
}

interface EvaluationItem {
  id: string;
  studentId: string;
  studentName: string;
  responses: any;
  submittedAt: string;
}

type TabType = 'details' | 'registration' | 'evaluation' | 'document' | 'certificates';

const getDefaultCitation = (type: string, eventTitle?: string) => {
  const evTitle = eventTitle || 'this university event';
  switch (type) {
    case 'PARTICIPATION':
      return `for active participation and valuable engagement in the ${evTitle} held at University of Rizal System Cainta Campus.`;
    case 'RECOGNITION':
      return `in recognition of exemplary performance, outstanding talent, and meaningful contribution during the ${evTitle} held at University of Rizal System Cainta Campus.`;
    case 'APPRECIATION':
      return `in grateful recognition and sincere appreciation of invaluable service, commitment, and dedicated contribution as resource speaker / facilitator during the ${evTitle} held at University of Rizal System Cainta Campus.`;
    case 'WINNER':
      return `for outstanding skill, exceptional merit, and winning distinction in the ${evTitle} competition held at University of Rizal System Cainta Campus.`;
    case 'COMPLETION':
      return `for successfully completing all requirements, sessions, and active involvement in the ${evTitle} conducted at University of Rizal System Cainta Campus.`;
    default:
      return `for active participation and valuable engagement in the ${evTitle} held at University of Rizal System Cainta Campus.`;
  }
};

function EventWorkspaceContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const user = session?.user as any;

  const eventId = params?.id as string;
  const initialTab = (searchParams.get('tab') as TabType) || 'details';
  const validInitialTab: TabType = ['details', 'registration', 'evaluation', 'document', 'certificates'].includes(initialTab)
    ? initialTab
    : 'details';

  const [activeTab, setActiveTab] = useState<TabType>(validInitialTab);
  const [event, setEvent] = useState<CampusEvent | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Event Form State
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editVenue, setEditVenue] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editBannerImage, setEditBannerImage] = useState('');
  const [facilitators, setFacilitators] = useState<FacilitatorItem[]>([]);
  const [newFacName, setNewFacName] = useState('');
  const [newFacRole, setNewFacRole] = useState('Facilitator');
  const [savingDetails, setSavingDetails] = useState(false);
  const [detailsSaved, setDetailsSaved] = useState(false);

  // Certificate Issuance State
  const [generatingCerts, setGeneratingCerts] = useState(false);
  const [certFeedback, setCertFeedback] = useState<string | null>(null);

  // Manual Certificate Modal State (No student number, supports type, description, signatory name & position)
  const [showRecognitionModal, setShowRecognitionModal] = useState(false);
  const [recCertType, setRecCertType] = useState<string>('RECOGNITION');
  const [recRecipientName, setRecRecipientName] = useState('');
  const [recAwardTitle, setRecAwardTitle] = useState('');
  const [recDescription, setRecDescription] = useState('');
  const [recSignatoryName, setRecSignatoryName] = useState('Dr. Marjorie DF. San Juan');
  const [recSignatoryPosition, setRecSignatoryPosition] = useState('Campus Director');
  const [issuingRec, setIssuingRec] = useState(false);

  // Official Event Document (Word / Google Docs Compilation Sheet) State
  const [docQrUrl, setDocQrUrl] = useState<string>('');
  const [docTitle, setDocTitle] = useState<string>('OFFICIAL EVENT COMPILATION: DETAILS, FACILITATORS & PARTICIPANTS ROSTER');
  const [docEventTitle, setDocEventTitle] = useState<string>('');
  const [docEventDesc, setDocEventDesc] = useState<string>('');
  const [docEventVenue, setDocEventVenue] = useState<string>('');
  const [docEventDate, setDocEventDate] = useState<string>('');
  const [docFacilitators, setDocFacilitators] = useState<FacilitatorItem[]>([]);
  const [docNewFacName, setDocNewFacName] = useState<string>('');
  const [docNewFacRole, setDocNewFacRole] = useState<string>('Facilitator');
  const [docParticipants, setDocParticipants] = useState<Registration[]>([]);
  const [docNewPartName, setDocNewPartName] = useState<string>('');
  const [docNewPartId, setDocNewPartId] = useState<string>('');
  const [docNewPartDept, setDocNewPartDept] = useState<string>('College of Computer Studies');
  const [docSavedToast, setDocSavedToast] = useState<boolean>(false);

  // Link copy toast
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEvalLink, setCopiedEvalLink] = useState(false);

  // Navigation back URL
  const isOsds = user?.role === 'OSDS_OFFICER' || user?.role === 'ADMIN';
  const backUrl = isOsds ? '/osds?tab=all' : '/org-officer';

  // Load All Event Data
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [evRes, regRes, certRes, evalRes] = await Promise.all([
        fetch(`/api/events/${eventId}`),
        fetch(`/api/events/${eventId}/registrations`),
        fetch(`/api/certificates?eventId=${eventId}`),
        fetch(`/api/evaluations?eventId=${eventId}`),
      ]);

      if (evRes.ok) {
        const ev = await evRes.json();
        setEvent(ev);
        setEditTitle(ev.title || '');
        setEditDesc(ev.description || '');
        setEditVenue(ev.venue || '');
        setEditStart(ev.startDate ? new Date(ev.startDate).toISOString().slice(0, 16) : '');
        setEditEnd(ev.endDate ? new Date(ev.endDate).toISOString().slice(0, 16) : '');
        setEditBannerImage(ev.bannerImage || '');
        const rawFac = ev.facilitators || [];
        setFacilitators(rawFac.map((f: any) =>
          typeof f === 'string' ? { name: f, role: 'Facilitator' } : { name: f.name || '', role: f.role || 'Facilitator' }
        ));
      }

      if (regRes.ok) {
        const rData = await regRes.json();
        setRegistrations(rData.registrations || []);
      }

      if (certRes.ok) {
        const cData = await certRes.json();
        setCertificates(Array.isArray(cData) ? cData : []);
      }

      if (evalRes.ok) {
        const eData = await evalRes.json();
        setEvaluations(eData.evaluations || []);
      }
    } catch (err) {
      console.error('Failed to load event data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [eventId]);

  // Handle Tab Switch & Sync URL
  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    router.replace(`/org-officer/events/${eventId}?tab=${tab}`, { scroll: false });
  };

  // Save Event Details
  const handleSaveDetails = async () => {
    setSavingDetails(true);
    try {
      await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          description: editDesc,
          venue: editVenue,
          startDate: editStart ? new Date(editStart).toISOString() : undefined,
          endDate: editEnd ? new Date(editEnd).toISOString() : undefined,
          bannerImage: editBannerImage,
          facilitators,
        }),
      });
      setDetailsSaved(true);
      setTimeout(() => setDetailsSaved(false), 2500);
      await loadAllData();
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSavingDetails(false);
    }
  };

  // Toggle Registration Open/Closed (Released at start of event)
  const toggleRegistration = async () => {
    if (!event) return;
    try {
      await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationOpen: !event.registrationOpen }),
      });
      setEvent({ ...event, registrationOpen: !event.registrationOpen });
    } catch (err) {
      console.error('Toggle registration failed:', err);
    }
  };

  // Toggle Evaluation Open/Closed (Released at end of event to mark attendance & completion)
  const toggleEvaluation = async () => {
    if (!event) return;
    try {
      await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evaluationOpen: !event.evaluationOpen }),
      });
      setEvent({ ...event, evaluationOpen: !event.evaluationOpen });
    } catch (err) {
      console.error('Toggle evaluation failed:', err);
    }
  };

  // Batch Generate Digital E-Certificates for Completed Attendees
  const handleGenerateCertificates = async () => {
    setGeneratingCerts(true);
    setCertFeedback(null);
    try {
      const res = await fetch(`/api/events/${eventId}/generate-certificates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facilitators }),
      });
      const data = await res.json();
      if (res.ok) {
        setCertFeedback(data.message || `Successfully generated digital e-certificates!`);
        const cRes = await fetch(`/api/certificates?eventId=${eventId}`);
        if (cRes.ok) {
          const freshCerts = await cRes.json();
          setCertificates(freshCerts);
        }
      } else {
        setCertFeedback(data.error || 'Failed to generate certificates.');
      }
    } catch {
      setCertFeedback('Network error generating certificates.');
    } finally {
      setGeneratingCerts(false);
      setTimeout(() => setCertFeedback(null), 5000);
    }
  };

  // Official Event Document State additions
  const [docParticipantFilter, setDocParticipantFilter] = useState<'all' | 'attended'>('all');
  const [docAttendeeSyncedToast, setDocAttendeeSyncedToast] = useState<boolean>(false);

  // Helper to compile attendees automatically from both registrations and submitted evaluations
  const compileAttendees = (regs: Registration[], evals: EvaluationItem[]) => {
    const list: Registration[] = [...regs];
    const registeredNames = new Set(regs.map(r => r.studentName.toLowerCase().trim()));
    const registeredIds = new Set(regs.map(r => (r.studentNumber || '').toUpperCase().trim()));

    evals.forEach((evItem, idx) => {
      const name = evItem.studentName?.trim() || '';
      const sId = evItem.studentId?.trim() || '';
      if (name && !registeredNames.has(name.toLowerCase()) && !registeredIds.has(sId.toUpperCase())) {
        list.push({
          id: `eval-attendee-${idx}`,
          studentName: name,
          studentNumber: sId.startsWith('test-') ? 'N/A' : sId,
          department: 'Attendee (Verified via Evaluation)',
          yearSection: 'Attendee',
          registrationDate: evItem.submittedAt || new Date().toISOString(),
          status: 'ATTENDED',
        });
      }
    });

    return list;
  };

  // Initialize Document fields from event data (details, facilitators, automatically compiled attendees)
  useEffect(() => {
    if (event) {
      setDocEventTitle(event.title || '');
      setDocEventDesc(event.description || '');
      setDocEventVenue(event.venue || '');
      setDocEventDate(
        event.startDate
          ? `${formatDateTime(event.startDate)}${event.endDate ? ` – ${formatDateTime(event.endDate)}` : ''}`
          : ''
      );
      if (!recDescription) setRecDescription(getDefaultCitation(recCertType, event.title));
    }
    if (facilitators && facilitators.length > 0) {
      setDocFacilitators(facilitators);
    }
    const compiled = compileAttendees(registrations, evaluations);
    if (compiled.length > 0) {
      setDocParticipants(compiled);
    }
  }, [event, facilitators, registrations, evaluations]);

  // Generate Document QR Code pointing to public registration / event page
  useEffect(() => {
    if (eventId) {
      const publicUrl = getEventPublicUrl(eventId);
      QRCode.toDataURL(publicUrl, {
        width: 320,
        margin: 2,
        color: { dark: '#0F172A', light: '#FFFFFF' }
      }).then(url => setDocQrUrl(url)).catch(err => console.error('Failed to generate doc QR:', err));
    }
  }, [eventId]);

  const syncAttendeesNow = () => {
    const compiled = compileAttendees(registrations, evaluations);
    setDocParticipants(compiled);
    setDocAttendeeSyncedToast(true);
    setTimeout(() => setDocAttendeeSyncedToast(false), 2500);
  };

  const resetDocToDefaults = () => {
    if (event) {
      setDocEventTitle(event.title || '');
      setDocEventDesc(event.description || '');
      setDocEventVenue(event.venue || '');
      setDocEventDate(
        event.startDate
          ? `${formatDateTime(event.startDate)}${event.endDate ? ` – ${formatDateTime(event.endDate)}` : ''}`
          : ''
      );
    }
    setDocTitle('OFFICIAL EVENT COMPILATION: DETAILS, FACILITATORS & PARTICIPANTS ROSTER');
    setDocFacilitators(facilitators);
    setDocParticipants(compileAttendees(registrations, evaluations));
  };

  const addDocFacilitator = () => {
    if (!docNewFacName.trim()) return;
    setDocFacilitators(prev => [...prev, { name: docNewFacName.trim(), role: docNewFacRole.trim() || 'Facilitator' }]);
    setDocNewFacName('');
    setDocNewFacRole('Facilitator');
  };

  const removeDocFacilitator = (index: number) => {
    setDocFacilitators(prev => prev.filter((_, i) => i !== index));
  };

  const addDocParticipant = () => {
    if (!docNewPartName.trim()) return;
    const newReg: Registration = {
      id: `manual-reg-${Date.now()}`,
      studentName: docNewPartName.trim(),
      studentNumber: docNewPartId.trim() || 'N/A',
      department: docNewPartDept.trim() || 'College of Computer Studies',
      yearSection: 'Attendee',
      registrationDate: new Date().toISOString(),
      status: 'REGISTERED'
    };
    setDocParticipants(prev => [newReg, ...prev]);
    setDocNewPartName('');
    setDocNewPartId('');
  };

  const removeDocParticipant = (index: number) => {
    setDocParticipants(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveDoc = () => {
    setDocSavedToast(true);
    setTimeout(() => setDocSavedToast(false), 2500);
  };

  const handlePrintDoc = () => {
    window.print();
  };

  const handleDownloadQr = () => {
    if (!docQrUrl) return;
    const a = document.createElement('a');
    a.href = docQrUrl;
    a.download = `URS-Event-${eventId}-Registration-QR.png`;
    a.click();
  };

  // Manual Certificate Issuance (No student number, supports type, description, signatory name & position)
  const handleManualIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recRecipientName.trim()) return;
    setIssuingRec(true);
    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'MANUAL_ISSUE',
          eventId,
          recipientName: recRecipientName.trim(),
          certificateType: recCertType,
          awardTitle: recAwardTitle.trim(),
          signatoryName: recSignatoryName.trim(),
          signatoryPosition: recSignatoryPosition.trim(),
          officerId: user?.id || 'officer',
          officerName: user?.name || 'Event Officer',
          eventDescription: recDescription.trim() || getDefaultCitation(recCertType, event?.title),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowRecognitionModal(false);
        setRecRecipientName('');
        setRecAwardTitle('');
        setRecDescription('');
        setCertFeedback(`Certificate (${recCertType}) issued successfully! Code: ${data.certificate?.verificationCode}`);
        const cRes = await fetch(`/api/certificates?eventId=${eventId}`);
        if (cRes.ok) {
          const freshCerts = await cRes.json();
          setCertificates(freshCerts);
        }
      } else {
        alert(data.message || 'Failed to issue certificate.');
      }
    } catch {
      alert('Network error issuing certificate.');
    } finally {
      setIssuingRec(false);
    }
  };

  const addFacilitator = () => {
    if (newFacName.trim()) {
      setFacilitators(prev => [...prev, { name: newFacName.trim(), role: newFacRole.trim() || 'Facilitator' }]);
      setNewFacName('');
      setNewFacRole('Facilitator');
    }
  };

  const copyRegistrationUrl = () => {
    const url = `${window.location.origin}/events/${eventId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyEvaluationUrl = () => {
    const url = `${window.location.origin}/events/${eventId}?tab=evaluate`;
    navigator.clipboard.writeText(url);
    setCopiedEvalLink(true);
    setTimeout(() => setCopiedEvalLink(false), 2000);
  };

  const formatDate = (iso: string) => {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleDateString('en-PH', {
      month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Manila'
    });
  };

  const formatDateTime = (iso: string) => {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleString('en-PH', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Manila'
    });
  };

  // Completion & Attendance Metrics
  const evaluatedStudentIds = new Set([
    ...evaluations.map(e => e.studentId).filter(Boolean),
    ...evaluations.map(e => e.studentName?.toLowerCase().trim()).filter(Boolean),
  ]);

  const isStudentAttended = (part: Registration) => {
    if (part.status === 'ATTENDED') return true;
    if (part.studentNumber && evaluatedStudentIds.has(part.studentNumber)) return true;
    if (part.studentName && evaluatedStudentIds.has(part.studentName.toLowerCase().trim())) return true;
    return false;
  };

  const displayedDocParticipants = docParticipantFilter === 'attended'
    ? docParticipants.filter(isStudentAttended)
    : docParticipants;

  const attendedDocCount = docParticipants.filter(isStudentAttended).length;

  const totalRegistered = registrations.length;
  const totalCompleted = evaluations.length;
  const completionPercent = totalRegistered > 0 ? Math.round((totalCompleted / totalRegistered) * 100) : 0;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748B' }}>
        <div style={{
          width: '36px', height: '36px', border: '3px solid #E2E8F0',
          borderTopColor: '#2563EB', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 12px'
        }} />
        Loading event workspace...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1150px', paddingBottom: '60px' }}>
      {/* Top Breadcrumb & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href={backUrl} style={{
            display: 'flex', alignItems: 'center', color: '#64748B', textDecoration: 'none',
            padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFFFFF'
          }}>
            <IconArrowLeft />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <span style={{
                fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px',
                padding: '2px 8px', borderRadius: '4px', background: '#EFF6FF', color: '#2563EB'
              }}>
                Event Hub
              </span>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>{event?.venue}</span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              {event?.title}
            </h1>
          </div>
        </div>

        {/* Live Metrics Strip */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', textAlign: 'center' }}>
            <div style={{ color: '#64748B', fontSize: '11px' }}>Registrations</div>
            <div style={{ fontWeight: '800', color: '#0F172A' }}>{totalRegistered}</div>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', textAlign: 'center' }}>
            <div style={{ color: '#64748B', fontSize: '11px' }}>Attended & Completed</div>
            <div style={{ fontWeight: '800', color: '#059669' }}>{totalCompleted} ({completionPercent}%)</div>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', textAlign: 'center' }}>
            <div style={{ color: '#64748B', fontSize: '11px' }}>E-Certs (Optional)</div>
            <div style={{ fontWeight: '800', color: '#7C3AED' }}>{certificates.length}</div>
          </div>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {certFeedback && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: '#ECFDF5', border: '1px solid #A7F3D0',
          borderRadius: '10px', padding: '12px 16px', marginBottom: '20px',
          fontSize: '13px', color: '#065F46', fontWeight: '600'
        }}>
          <IconCheckCircle />
          {certFeedback}
        </div>
      )}

      {/* Navigation Tabs (Compiled within the Event: Details, Registration, Evaluation/Attendance, E-Certificates) */}
      <div style={{
        display: 'flex', gap: '6px', background: '#F1F5F9',
        borderRadius: '12px', padding: '4px', marginBottom: '24px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'details', label: 'Event Details', icon: <IconCalendar /> },
          { id: 'registration', label: `Registration Roster (${totalRegistered})`, icon: <IconClipboardList /> },
          { id: 'evaluation', label: `Evaluation & Attendance (${evaluations.length})`, icon: <IconCheckCircle /> },
          { id: 'document', label: 'Event Document & QR', icon: <IconFileText /> },
          { id: 'certificates', label: `E-Certificates (${certificates.length})`, icon: <IconAward /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => switchTab(tab.id as TabType)}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '9px 16px', borderRadius: '9px', border: 'none', cursor: 'pointer',
              fontWeight: activeTab === tab.id ? '700' : '500', fontSize: '13px', fontFamily: 'inherit',
              background: activeTab === tab.id ? '#FFFFFF' : 'transparent',
              color: activeTab === tab.id ? '#2563EB' : '#64748B',
              boxShadow: activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease', whiteSpace: 'nowrap'
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: EVENT DETAILS */}
      {activeTab === 'details' && (
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px', maxWidth: '780px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0' }}>
              Edit Event Specifications
            </h2>
            <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>
              Update venue, schedule, facilitators, and promotional information.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Event Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Description & Scope</label>
              <textarea
                rows={4}
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Campus Venue</label>
              <input
                type="text"
                value={editVenue}
                onChange={e => setEditVenue(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={editStart}
                  onChange={e => setEditStart(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>End Date & Time</label>
                <input
                  type="datetime-local"
                  value={editEnd}
                  onChange={e => setEditEnd(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Facilitators / Speakers */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                Facilitators, Keynote Speakers & Resource Persons
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="Facilitator or Speaker Name..."
                  value={newFacName}
                  onChange={e => setNewFacName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFacilitator())}
                  style={{ flex: 2, padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                />
                <select
                  value={newFacRole}
                  onChange={e => setNewFacRole(e.target.value)}
                  style={{ flex: 1, padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', background: '#FFFFFF' }}
                >
                  <option value="Facilitator">Facilitator</option>
                  <option value="Keynote Speaker">Keynote Speaker</option>
                  <option value="Resource Speaker">Resource Speaker</option>
                  <option value="Guest Judge">Guest Judge</option>
                  <option value="Workshop Lead">Workshop Lead</option>
                </select>
                <button
                  type="button"
                  onClick={addFacilitator}
                  style={{
                    padding: '9px 16px', background: '#EFF6FF', color: '#2563EB',
                    border: '1px solid #BFDBFE', borderRadius: '8px', fontWeight: '700',
                    cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <IconUserPlus /> Add
                </button>
              </div>

              {facilitators.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {facilitators.map((f, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      background: '#F8FAFC', border: '1px solid #E2E8F0',
                      borderRadius: '8px', padding: '6px 12px', fontSize: '13px'
                    }}>
                      <span style={{ fontWeight: '700', color: '#0F172A' }}>{f.name}</span>
                      <span style={{ fontSize: '11px', color: '#64748B', background: '#E2E8F0', padding: '2px 6px', borderRadius: '4px' }}>{f.role}</span>
                      <button
                        type="button"
                        onClick={() => setFacilitators(prev => prev.filter((_, idx) => idx !== i))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '2px', display: 'flex' }}
                      >
                        <IconTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveDetails}
              disabled={savingDetails}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '12px 20px', background: detailsSaved ? '#ECFDF5' : 'linear-gradient(135deg, #1E3A8A, #2563EB)',
                color: detailsSaved ? '#059669' : '#FFFFFF', border: detailsSaved ? '1px solid #A7F3D0' : 'none',
                borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: savingDetails ? 'not-allowed' : 'pointer'
              }}
            >
              <IconSave />
              {detailsSaved ? 'Saved Successfully!' : savingDetails ? 'Saving...' : 'Save Event Details'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: REGISTRATION (Released at Start of Event) */}
      {activeTab === 'registration' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Release Controls Bar */}
          <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={toggleRegistration}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 16px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: '700',
                  background: event?.registrationOpen ? '#ECFDF5' : '#F1F5F9',
                  color: event?.registrationOpen ? '#059669' : '#64748B',
                }}
              >
                {event?.registrationOpen ? <IconToggleOn /> : <IconToggleOff />}
                Registration: {event?.registrationOpen ? 'Released (Open for Signups)' : 'Closed'}
              </button>

              <button
                onClick={copyRegistrationUrl}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '8px 14px', background: '#F8FAFC', color: '#334155',
                  border: '1px solid #CBD5E1', borderRadius: '9px', fontSize: '13px',
                  fontWeight: '600', cursor: 'pointer'
                }}
              >
                {copiedLink ? <IconCheck /> : <IconCopy />}
                {copiedLink ? 'Link Copied!' : 'Copy Registration Link'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Link
                href={`/org-officer/events/${eventId}/registration-form`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '9px 18px', background: '#EFF6FF', color: '#2563EB',
                  border: '1px solid #BFDBFE', borderRadius: '9px', fontSize: '13px',
                  fontWeight: '700', textDecoration: 'none'
                }}
              >
                <IconClipboardList />
                Customize Registration Form
              </Link>
            </div>
          </div>

          {/* Registrations Roster Table */}
          <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                  Registered Participants ({registrations.length})
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  Students registered at the start of the event.
                </span>
              </div>
            </div>

            {registrations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', color: '#94A3B8', fontSize: '14px' }}>
                No participants registered yet. Release registration and share the link with students.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    {['Attendee Name', 'Student ID', 'Department', 'Year & Section', 'Registered Date', 'Completion Status'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #E2E8F0' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((r, i) => {
                    const isEvaluated = evaluatedStudentIds.has(r.studentNumber) || evaluatedStudentIds.has(r.studentName?.toLowerCase());
                    return (
                      <tr key={r.id} style={{ borderBottom: i < registrations.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                        <td style={{ padding: '12px 16px', fontWeight: '700', color: '#0F172A' }}>{r.studentName}</td>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#2563EB', fontWeight: '600' }}>{r.studentNumber}</td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>{r.department}</td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>{r.yearSection}</td>
                        <td style={{ padding: '12px 16px', color: '#64748B', fontSize: '12px' }}>{formatDate(r.registrationDate)}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            fontSize: '11px', fontWeight: '700', padding: '3px 9px', borderRadius: '12px',
                            background: isEvaluated ? '#ECFDF5' : '#F1F5F9',
                            color: isEvaluated ? '#047857' : '#64748B'
                          }}>
                            {isEvaluated ? 'Attended (Evaluated)' : 'Registered (Pending Eval)'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: EVALUATION & ATTENDANCE COMPLETION (Released at End of Event) */}
      {activeTab === 'evaluation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Explanation Banner */}
          <div style={{
            background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '14px',
            padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ color: '#16A34A', display: 'flex' }}>
                <IconCheckCircle />
              </div>
              <div>
                <div style={{ fontWeight: '700', color: '#14532D', fontSize: '14px' }}>
                  Attendance Verification via Evaluation
                </div>
                <div style={{ color: '#166534', fontSize: '12px', marginTop: '2px' }}>
                  Release the evaluation form towards the end of the event. Submitting it marks the student as officially attended and completed.
                </div>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', background: '#FFFFFF', color: '#166534',
                border: '1px solid #86EFAC', borderRadius: '8px', fontSize: '12px',
                fontWeight: '700', cursor: 'pointer'
              }}
            >
              <IconPrinter /> Print Verified Attendee Roster
            </button>
          </div>

          {/* Controls Bar */}
          <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={toggleEvaluation}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 16px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: '700',
                  background: event?.evaluationOpen ? '#ECFDF5' : '#F1F5F9',
                  color: event?.evaluationOpen ? '#059669' : '#64748B',
                }}
              >
                {event?.evaluationOpen ? <IconToggleOn /> : <IconToggleOff />}
                Evaluation Form: {event?.evaluationOpen ? 'Released (Open for Responses)' : 'Closed'}
              </button>

              <button
                onClick={copyEvaluationUrl}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '8px 14px', background: '#F8FAFC', color: '#334155',
                  border: '1px solid #CBD5E1', borderRadius: '9px', fontSize: '13px',
                  fontWeight: '600', cursor: 'pointer'
                }}
              >
                {copiedEvalLink ? <IconCheck /> : <IconCopy />}
                {copiedEvalLink ? 'Link Copied!' : 'Copy Evaluation Link'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Link
                href={`/org-officer/events/${eventId}/evaluation-form`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '9px 18px', background: '#FFFBEB', color: '#D97706',
                  border: '1px solid #FDE68A', borderRadius: '9px', fontSize: '13px',
                  fontWeight: '700', textDecoration: 'none'
                }}
              >
                <IconStar />
                Customize Evaluation Questions
              </Link>
            </div>
          </div>

          {/* Evaluations Submissions Table */}
          <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                  Verified Attended Participants ({evaluations.length})
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  Students who submitted the evaluation and completed event participation.
                </span>
              </div>
            </div>

            {evaluations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', color: '#94A3B8', fontSize: '14px' }}>
                No evaluation responses recorded yet. Release the evaluation form at event end to capture attendees.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    {['Student Attendee', 'Student ID', 'Submission Timestamp', 'Attendance Status', 'Feedback Recorded'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #E2E8F0' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {evaluations.map((evItem, i) => (
                    <tr key={evItem.id} style={{ borderBottom: i < evaluations.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '700', color: '#0F172A' }}>{evItem.studentName}</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#2563EB' }}>{evItem.studentId}</td>
                      <td style={{ padding: '12px 16px', color: '#64748B', fontSize: '12px' }}>{formatDateTime(evItem.submittedAt)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#059669', background: '#ECFDF5', padding: '3px 8px', borderRadius: '12px' }}>
                          Attended (Verified)
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569', fontSize: '12px' }}>
                        {typeof evItem.responses === 'object' ? `${Object.keys(evItem.responses).length} ratings/comments` : 'Captured'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: EVENT DOCUMENT & QR (Word / Google Docs style A4 Sheet) */}
      {activeTab === 'document' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Document Action / Toolbar Strip */}
          <div className="no-print" style={{
            background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0',
            padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '3px 8px', borderRadius: '4px', background: '#EFF6FF', color: '#2563EB' }}>
                  Word / GDocs Sheet
                </span>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  Auto-generated from event data • Live editable before printing
                </span>
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: '4px 0 0 0' }}>
                Official Event Primer & Activity Document
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={resetDocToDefaults}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', background: '#F8FAFC', color: '#475569',
                  border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '12px',
                  fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit'
                }}
                title="Reload original event text"
              >
                <IconRefresh /> Reset to Defaults
              </button>

              <button
                type="button"
                onClick={handleSaveDoc}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', background: '#EFF6FF', color: '#2563EB',
                  border: '1px solid #93C5FD', borderRadius: '8px', fontSize: '12px',
                  fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit'
                }}
              >
                <IconSave /> {docSavedToast ? 'Document Saved!' : 'Save Edits'}
              </button>

              <button
                type="button"
                onClick={handlePrintDoc}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '8px 18px', background: 'linear-gradient(135deg, #1E3A8A, #2563EB)',
                  color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '12px',
                  fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: '0 2px 8px rgba(37,99,235,0.25)'
                }}
              >
                <IconPrinter /> Print / Save as PDF
              </button>
            </div>
          </div>

          {docSavedToast && (
            <div className="no-print" style={{
              background: '#ECFDF5', border: '1px solid #A7F3D0',
              borderRadius: '8px', padding: '10px 16px', fontSize: '13px',
              color: '#065F46', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <IconCheckCircle /> Document edits saved in workspace memory. Ready for printing or physical filing.
            </div>
          )}

          {/* The A4 Document Canvas Sheet */}
          <div
            id="official-event-document"
            style={{
              background: '#FFFFFF',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              boxShadow: '0 10px 30px rgba(0,0,0,0.07)',
              maxWidth: '820px',
              width: '100%',
              margin: '0 auto',
              padding: '48px 56px',
              boxSizing: 'border-box',
              color: '#0F172A',
              fontFamily: 'inherit'
            }}
          >
            {/* Document Institutional Header */}
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
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <input
                type="text"
                value={docTitle}
                onChange={e => setDocTitle(e.target.value)}
                style={{
                  width: '100%', textAlign: 'center', fontSize: '16px', fontWeight: '900',
                  color: '#1E3A8A', border: 'none', borderBottom: '1px dashed #CBD5E1',
                  padding: '4px 0', background: 'transparent', outline: 'none', textTransform: 'uppercase', letterSpacing: '0.6px'
                }}
              />
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                DOC REF: <span style={{ fontFamily: 'monospace', color: '#2563EB', fontWeight: '700' }}>URS-CC-COMP-{eventId.slice(-6).toUpperCase()}</span> • GENERATED ON: {formatDate(new Date().toISOString())}
              </div>
            </div>

            {/* PART I: EVENT DETAILS ("Event Deets") & EMBEDDED QR CODE */}
            <div style={{
              background: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '12px',
              padding: '22px', marginBottom: '28px'
            }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
                I. Official Event Details ("Event Deets")
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={docEventTitle}
                    onChange={e => setDocEventTitle(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '14px', fontWeight: '800', color: '#0F172A', boxSizing: 'border-box', background: '#FFFFFF' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Event Description / Briefing
                  </label>
                  <textarea
                    rows={3}
                    value={docEventDesc}
                    onChange={e => setDocEventDesc(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12.5px', lineHeight: 1.5, color: '#334155', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', background: '#FFFFFF' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Date & Schedule
                    </label>
                    <input
                      type="text"
                      value={docEventDate}
                      onChange={e => setDocEventDate(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', fontWeight: '600', color: '#0F172A', boxSizing: 'border-box', background: '#FFFFFF' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Campus Venue
                    </label>
                    <input
                      type="text"
                      value={docEventVenue}
                      onChange={e => setDocEventVenue(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', fontWeight: '600', color: '#0F172A', boxSizing: 'border-box', background: '#FFFFFF' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '4px', background: '#EFF6FF', color: '#2563EB' }}>
                    Status: {event?.status}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    Compiled Headcount: <strong>{docParticipants.length} Total Registered</strong> • <strong style={{ color: '#059669' }}>{attendedDocCount} Verified Attended</strong> • <strong>{docFacilitators.length} Facilitators</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* PART II: LIST OF FACILITATORS */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    II. List of Facilitators & Committee ({docFacilitators.length})
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    Official compilation of resource speakers, judges, and committee organizers.
                  </div>
                </div>
              </div>

              {docFacilitators.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', background: '#F8FAFC', borderRadius: '8px', color: '#94A3B8', fontSize: '12px' }}>
                  No facilitators listed. Add committee members using the form below.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '10px', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', width: '40px', fontSize: '11px', fontWeight: '700', color: '#64748B' }}>#</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Facilitator / Resource Person Name</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Role / Designation</th>
                      <th className="no-print" style={{ padding: '8px 12px', textAlign: 'center', width: '60px', fontSize: '11px', fontWeight: '700', color: '#64748B' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docFacilitators.map((fac, idx) => (
                      <tr key={idx} style={{ borderBottom: idx < docFacilitators.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                        <td style={{ padding: '8px 12px', color: '#94A3B8', fontWeight: '700' }}>{idx + 1}</td>
                        <td style={{ padding: '6px 12px' }}>
                          <input
                            type="text"
                            value={fac.name}
                            onChange={e => {
                              const val = e.target.value;
                              setDocFacilitators(prev => prev.map((f, i) => i === idx ? { ...f, name: val } : f));
                            }}
                            style={{ width: '100%', padding: '4px 8px', border: '1px solid #E2E8F0', borderRadius: '4px', fontSize: '12px', fontWeight: '700', color: '#0F172A', background: 'transparent' }}
                          />
                        </td>
                        <td style={{ padding: '6px 12px' }}>
                          <input
                            type="text"
                            value={fac.role}
                            onChange={e => {
                              const val = e.target.value;
                              setDocFacilitators(prev => prev.map((f, i) => i === idx ? { ...f, role: val } : f));
                            }}
                            style={{ width: '100%', padding: '4px 8px', border: '1px solid #E2E8F0', borderRadius: '4px', fontSize: '12px', color: '#475569', background: 'transparent' }}
                          />
                        </td>
                        <td className="no-print" style={{ padding: '6px 12px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => removeDocFacilitator(idx)}
                            style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '4px' }}
                            title="Remove facilitator"
                          >
                            <IconTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Inline Add Facilitator (no-print) */}
              <div className="no-print" style={{ display: 'flex', gap: '8px', background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', border: '1px dashed #CBD5E1' }}>
                <input
                  type="text"
                  placeholder="Facilitator full name..."
                  value={docNewFacName}
                  onChange={e => setDocNewFacName(e.target.value)}
                  style={{ flex: 2, padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', background: '#FFFFFF' }}
                />
                <input
                  type="text"
                  placeholder="Role (e.g. Speaker / Committee Lead)..."
                  value={docNewFacRole}
                  onChange={e => setDocNewFacRole(e.target.value)}
                  style={{ flex: 2, padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', background: '#FFFFFF' }}
                />
                <button
                  type="button"
                  onClick={addDocFacilitator}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '6px 14px', background: '#EFF6FF', color: '#2563EB',
                    border: '1px solid #BFDBFE', borderRadius: '6px', fontSize: '12px',
                    fontWeight: '700', cursor: 'pointer'
                  }}
                >
                  <IconUserPlus /> Add Facilitator
                </button>
              </div>
            </div>

            {/* PART III: LIST OF PARTICIPANTS & ATTENDEES */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    III. List of Participants & Attendees ({displayedDocParticipants.length}{docParticipantFilter === 'attended' ? ` of ${docParticipants.length}` : ''})
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                    Automatically compiled from event attendees (verified via evaluation) and registered students.
                  </div>
                </div>

                {/* Attendees Filter & Sync Controls (no-print) */}
                <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <button
                      type="button"
                      onClick={() => setDocParticipantFilter('all')}
                      style={{
                        padding: '4px 10px', fontSize: '11px', fontWeight: '700', borderRadius: '6px',
                        border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                        background: docParticipantFilter === 'all' ? '#FFFFFF' : 'transparent',
                        color: docParticipantFilter === 'all' ? '#1E3A8A' : '#64748B',
                        boxShadow: docParticipantFilter === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      All Attendees ({docParticipants.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocParticipantFilter('attended')}
                      style={{
                        padding: '4px 10px', fontSize: '11px', fontWeight: '700', borderRadius: '6px',
                        border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                        background: docParticipantFilter === 'attended' ? '#FFFFFF' : 'transparent',
                        color: docParticipantFilter === 'attended' ? '#059669' : '#64748B',
                        boxShadow: docParticipantFilter === 'attended' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      Verified Attended ({attendedDocCount})
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={syncAttendeesNow}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '5px 10px', background: '#FFFFFF', color: '#2563EB',
                      border: '1px solid #BFDBFE', borderRadius: '6px', fontSize: '11px',
                      fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit'
                    }}
                    title="Re-sync roster with latest event attendees and registrations"
                  >
                    <IconRefresh /> Re-sync Attendees
                  </button>
                </div>
              </div>

              {docAttendeeSyncedToast && (
                <div className="no-print" style={{
                  background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px',
                  padding: '6px 12px', fontSize: '11.5px', color: '#1E40AF', fontWeight: '600',
                  marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  <IconCheck /> Participant roster synchronized with current event attendees.
                </div>
              )}

              {displayedDocParticipants.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', background: '#F8FAFC', borderRadius: '8px', color: '#94A3B8', fontSize: '12px' }}>
                  {docParticipantFilter === 'attended'
                    ? 'No verified attendees yet. Once participants submit evaluations, they will automatically appear here as attended.'
                    : 'No participants or attendees recorded yet. Student registrations will automatically appear here.'}
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '10px', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '8px 10px', textAlign: 'left', width: '35px', fontSize: '11px', fontWeight: '700', color: '#64748B' }}>#</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Participant / Attendee Name</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Student ID</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Dept / Section</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Attendance Status</th>
                      <th className="no-print" style={{ padding: '8px 10px', textAlign: 'center', width: '50px', fontSize: '11px', fontWeight: '700', color: '#64748B' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedDocParticipants.map((part, idx) => {
                      const isAttended = isStudentAttended(part);
                      return (
                        <tr key={part.id || idx} style={{ borderBottom: idx < displayedDocParticipants.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                          <td style={{ padding: '6px 10px', color: '#94A3B8', fontWeight: '700' }}>{idx + 1}</td>
                          <td style={{ padding: '5px 10px' }}>
                            <input
                              type="text"
                              value={part.studentName}
                              onChange={e => {
                                const val = e.target.value;
                                setDocParticipants(prev => prev.map((p, i) => (p.id === part.id || i === idx) ? { ...p, studentName: val } : p));
                              }}
                              style={{ width: '100%', padding: '3px 6px', border: '1px solid #E2E8F0', borderRadius: '4px', fontSize: '12px', fontWeight: '700', color: '#0F172A', background: 'transparent' }}
                            />
                          </td>
                          <td style={{ padding: '5px 10px' }}>
                            <input
                              type="text"
                              value={part.studentNumber || ''}
                              onChange={e => {
                                const val = e.target.value;
                                setDocParticipants(prev => prev.map((p, i) => (p.id === part.id || i === idx) ? { ...p, studentNumber: val } : p));
                              }}
                              style={{ width: '100%', padding: '3px 6px', border: '1px solid #E2E8F0', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace', color: '#475569', background: 'transparent' }}
                            />
                          </td>
                          <td style={{ padding: '5px 10px' }}>
                            <input
                              type="text"
                              value={`${part.department || ''} ${part.yearSection ? `• ${part.yearSection}` : ''}`}
                              onChange={e => {
                                const val = e.target.value;
                                setDocParticipants(prev => prev.map((p, i) => (p.id === part.id || i === idx) ? { ...p, department: val } : p));
                              }}
                              style={{ width: '100%', padding: '3px 6px', border: '1px solid #E2E8F0', borderRadius: '4px', fontSize: '11px', color: '#475569', background: 'transparent' }}
                            />
                          </td>
                          <td style={{ padding: '5px 10px' }}>
                            <span style={{
                              fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px',
                              background: isAttended ? '#ECFDF5' : '#EFF6FF',
                              color: isAttended ? '#059669' : '#2563EB',
                              whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '4px'
                            }}>
                              {isAttended ? (
                                <>
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                  Attended (Verified)
                                </>
                              ) : 'Registered'}
                            </span>
                          </td>
                          <td className="no-print" style={{ padding: '5px 10px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => removeDocParticipant(idx)}
                              style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '2px' }}
                              title="Remove participant"
                            >
                              <IconTrash />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {/* Inline Add Participant (no-print) */}
              <div className="no-print" style={{ display: 'flex', gap: '8px', background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', border: '1px dashed #CBD5E1', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Student full name..."
                  value={docNewPartName}
                  onChange={e => setDocNewPartName(e.target.value)}
                  style={{ flex: 2, minWidth: '150px', padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', background: '#FFFFFF' }}
                />
                <input
                  type="text"
                  placeholder="Student ID (e.g. C2024_00179)..."
                  value={docNewPartId}
                  onChange={e => setDocNewPartId(e.target.value)}
                  style={{ flex: 1, minWidth: '120px', padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', background: '#FFFFFF' }}
                />
                <input
                  type="text"
                  placeholder="Department / Course..."
                  value={docNewPartDept}
                  onChange={e => setDocNewPartDept(e.target.value)}
                  style={{ flex: 1, minWidth: '140px', padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', background: '#FFFFFF' }}
                />
                <button
                  type="button"
                  onClick={addDocParticipant}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '6px 14px', background: '#EFF6FF', color: '#2563EB',
                    border: '1px solid #BFDBFE', borderRadius: '6px', fontSize: '12px',
                    fontWeight: '700', cursor: 'pointer'
                  }}
                >
                  <IconUserPlus /> Add Participant
                </button>
              </div>
            </div>

            {/* Document Footer */}
            <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94A3B8' }}>
              <span>University of Rizal System Cainta Campus • Office of Student Development Services</span>
              <span>Official Event Compilation Document • Details, Facilitators & Participants Roster</span>
            </div>
          </div>

          {/* Print CSS Injection */}
          <style>{`
            @media print {
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
                max-width: 100% !important;
                margin: 0 !important;
                padding: 32px !important;
                box-shadow: none !important;
                border: none !important;
              }
              .no-print {
                display: none !important;
              }
              input, textarea {
                border: none !important;
                background: transparent !important;
              }
            }
          `}</style>
        </div>
      )}

      {/* TAB 5: E-CERTIFICATES (OPTIONAL DIGITAL ALTERNATIVE) */}
      {activeTab === 'certificates' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Clarification Notice */}
          <div style={{
            background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px',
            padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ color: '#7C3AED', display: 'flex' }}>
                <IconAward />
              </div>
              <div>
                <div style={{ fontWeight: '700', color: '#1E293B', fontSize: '14px' }}>
                  Optional E-Certificates Station
                </div>
                <div style={{ color: '#64748B', fontSize: '12px', marginTop: '2px' }}>
                  Certificates are typically physically printed. You can generate digital e-certificates here as an alternative, or print the verified roster from the Evaluation tab.
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '22px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0' }}>
                Issue Digital E-Certificates
              </h2>
              <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>
                Generate cryptographic e-certificates for evaluated attendees, or issue special recognition awards.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowRecognitionModal(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '10px 16px', background: '#F8FAFC', color: '#0F172A',
                  border: '1px solid #CBD5E1', borderRadius: '9px', fontSize: '13px',
                  fontWeight: '700', cursor: 'pointer'
                }}
              >
                <IconAward /> Issue Manual Certificate / Award
              </button>

              <button
                onClick={handleGenerateCertificates}
                disabled={generatingCerts}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '10px 20px', background: 'linear-gradient(135deg, #059669, #10B981)',
                  color: '#FFFFFF', border: 'none', borderRadius: '9px', fontSize: '13px',
                  fontWeight: '700', cursor: generatingCerts ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(16,185,129,0.3)'
                }}
              >
                <IconAward />
                {generatingCerts ? 'Generating Certificates...' : 'Generate E-Certificates for Completed Attendees'}
              </button>
            </div>
          </div>

          {/* Issued Certificates Table */}
          <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                Issued E-Certificates ({certificates.length})
              </h3>
              <span style={{ fontSize: '12px', color: '#64748B' }}>
                All certificates carry cryptographic tamper-proof verification codes
              </span>
            </div>

            {certificates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', color: '#94A3B8', fontSize: '14px' }}>
                No digital certificates issued for this event yet. If digital certificates are desired, click &ldquo;Generate E-Certificates for Completed Attendees&rdquo;.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    {['Verification Code', 'Recipient', 'Student ID / Role', 'Certificate Type', 'Issued Date', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #E2E8F0' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((cert, i) => (
                    <tr key={cert.id} style={{ borderBottom: i < certificates.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: '700', color: '#2563EB' }}>
                        {cert.verificationCode}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '700', color: '#0F172A' }}>
                        {cert.recipientName}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748B' }}>
                        {cert.recipientIdentifier || 'Participant'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '12px',
                          background: cert.certificateType === 'WINNER' || cert.certificateType === 'RECOGNITION' ? '#FFFBEB' : cert.certificateType === 'APPRECIATION' ? '#F5F3FF' : '#EFF6FF',
                          color: cert.certificateType === 'WINNER' || cert.certificateType === 'RECOGNITION' ? '#D97706' : cert.certificateType === 'APPRECIATION' ? '#7C3AED' : '#2563EB'
                        }}>
                          {cert.certificateType}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748B', fontSize: '12px' }}>
                        {formatDate(cert.issuedAt)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#059669', background: '#ECFDF5', padding: '3px 8px', borderRadius: '12px' }}>
                          Verified
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <a
                            href={`/api/certificates/download/${cert.verificationCode || cert.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'flex', alignItems: 'center', gap: '5px',
                              padding: '5px 10px', background: '#EFF6FF', color: '#2563EB',
                              border: '1px solid #BFDBFE', borderRadius: '6px', fontSize: '11px',
                              fontWeight: '700', textDecoration: 'none'
                            }}
                          >
                            <IconDownload /> Download
                          </a>
                          <Link
                            href={`/verify/${cert.verificationCode}`}
                            target="_blank"
                            style={{
                              display: 'flex', alignItems: 'center', gap: '4px',
                              padding: '5px 9px', background: '#F8FAFC', color: '#64748B',
                              border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '11px',
                              fontWeight: '600', textDecoration: 'none'
                            }}
                          >
                            <IconExternalLink /> Verify
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Modal: Manual Issue Certificate */}
          {showRecognitionModal && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 300, padding: '20px', backdropFilter: 'blur(4px)'
            }}>
              <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '28px', maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                      Manual Certificate Issuance
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0 0' }}>
                      Issue an authenticated individual certificate with customized type, citation, and signatories.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRecognitionModal(false)}
                    style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '18px', cursor: 'pointer', padding: '4px' }}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleManualIssueCertificate} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                  {/* 1. Certificate Type */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                      Certificate Type *
                    </label>
                    <select
                      value={recCertType}
                      onChange={e => {
                        const newType = e.target.value;
                        setRecCertType(newType);
                        setRecDescription(getDefaultCitation(newType, event?.title));
                      }}
                      style={{
                        width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1',
                        borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box', background: '#FFFFFF'
                      }}
                    >
                      <option value="RECOGNITION">Certificate of Recognition (Honorees / Winners)</option>
                      <option value="APPRECIATION">Certificate of Appreciation (Speakers / Facilitators)</option>
                      <option value="PARTICIPATION">Certificate of Participation (Attendees)</option>
                      <option value="WINNER">Certificate of Achievement (Competition Winners)</option>
                      <option value="COMPLETION">Certificate of Completion (Workshops)</option>
                    </select>
                  </div>

                  {/* 2. Recipient Full Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                      Recipient Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maria Santos"
                      value={recRecipientName}
                      onChange={e => setRecRecipientName(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* 3. Award Title / Distinction */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                      Award Title / Distinction {recCertType === 'RECOGNITION' || recCertType === 'WINNER' ? '*' : '(Optional)'}
                    </label>
                    <input
                      type="text"
                      required={recCertType === 'RECOGNITION' || recCertType === 'WINNER'}
                      placeholder={
                        recCertType === 'APPRECIATION'
                          ? 'e.g. Keynote Speaker / Resource Speaker'
                          : recCertType === 'WINNER' || recCertType === 'RECOGNITION'
                          ? 'e.g. 1st Place - Web Design Competition / Outstanding Presenter'
                          : 'e.g. Active Participant (Optional)'
                      }
                      value={recAwardTitle}
                      onChange={e => setRecAwardTitle(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* 4. Description / Citation Textarea */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                        Citation / Description *
                      </label>
                      <button
                        type="button"
                        onClick={() => setRecDescription(getDefaultCitation(recCertType, event?.title))}
                        style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '11px', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                      >
                        Reset to template text
                      </button>
                    </div>
                    <textarea
                      required
                      rows={3}
                      value={recDescription}
                      onChange={e => setRecDescription(e.target.value)}
                      placeholder="Enter the official body citation to appear on the certificate..."
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '12.5px', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' }}
                    />
                  </div>

                  {/* 5. Signatory Name and Signatory Position */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Signatory Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={recSignatoryName}
                        onChange={e => setRecSignatoryName(e.target.value)}
                        placeholder="e.g. Dr. Marjorie DF. San Juan"
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        Signatory Position *
                      </label>
                      <input
                        type="text"
                        required
                        value={recSignatoryPosition}
                        onChange={e => setRecSignatoryPosition(e.target.value)}
                        placeholder="e.g. Campus Director"
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setShowRecognitionModal(false)}
                      style={{ flex: 1, padding: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={issuingRec}
                      style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #1E3A8A, #2563EB)', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: issuingRec ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '700' }}
                    >
                      {issuingRec ? 'Issuing...' : 'Issue Certificate'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function EventWorkspacePage() {
  return (
    <Suspense fallback={
      <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>
        Loading event workspace...
      </div>
    }>
      <EventWorkspaceContent />
    </Suspense>
  );
}
