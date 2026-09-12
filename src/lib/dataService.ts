// Client-Safe Data Service for Paperless Campus
// ZERO PRISMA OR SERVER-ONLY NODE IMPORTS TO PREVENT BROWSER BUNDLE ERRORS
// Interacts with server API endpoints cleanly

import {
  CampusEvent,
  StudentRegistration,
  AttendanceRecord,
  CertificateRecord,
  OfficerAccount,
  CompetitionWinner,
  CertificateType,
} from '@/types';

const BASE_URL = typeof window !== 'undefined' ? '' : (process.env.NEXTAUTH_URL || 'http://localhost:3000');

// -------------------------------------------------------------
// EVENTS
// -------------------------------------------------------------
export async function getEvents(): Promise<CampusEvent[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/events`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load events');
    const data = await res.json();
    return Array.isArray(data) ? data : (data.events || []);
  } catch (err) {
    console.error('getEvents error:', err);
    return [];
  }
}

export async function getEventById(id: string): Promise<CampusEvent | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/events/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.event || null;
  } catch (err) {
    console.error('getEventById error:', err);
    return null;
  }
}

export async function createEvent(data: {
  title: string;
  description: string;
  venue: string;
  startDate: string;
  endDate: string;
  registrationOpensAt?: string;
  registrationClosesAt?: string;
  createdById?: string;
}): Promise<CampusEvent> {
  const res = await fetch(`${BASE_URL}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create event');
  return await res.json();
}

export { ALLOWED_VENUES, type AllowedVenue, isValidVenue } from './venues';
export {
  computeDefaultRegistrationWindow,
  getEffectiveRegistrationWindow,
  getEventRegistrationStatus,
  type RegistrationStatusInfo,
} from './registrationWindow';
export { getPublicAppUrl, getEventPublicUrl, getTicketPublicUrl, getCertificateVerifyUrl } from './appUrl';

export async function updateEvent(
  id: string,
  data: Partial<CampusEvent>
): Promise<CampusEvent | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/events/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update event');
    return await res.json();
  } catch (err) {
    console.error('updateEvent error:', err);
    return null;
  }
}

export * from './venues';
export * from './registrationWindow';
export * from './studentRules';
export * from './appUrl';

// -------------------------------------------------------------
// PUBLIC STUDENT REGISTRATIONS
// -------------------------------------------------------------
export async function registerStudentForEvent(data: {
  eventId: string;
  studentName: string;
  studentNumber: string;
  email?: string;
  department?: string;
  course?: string;
  yearSection?: string;
  yearLevel?: string;
  section?: string;
}): Promise<{
  success: boolean;
  message: string;
  registration?: StudentRegistration;
  isExisting?: boolean;
}> {
  try {
    const res = await fetch(`${BASE_URL}/api/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error during registration.' };
  }
}

// Legacy alias
export async function registerForEvent(
  studentId: string,
  studentName: string,
  studentNumber: string,
  eventId: string
) {
  return registerStudentForEvent({
    eventId,
    studentName,
    studentNumber,
    email: `${studentNumber.toLowerCase()}@urs.edu.ph`,
    course: 'BSIT',
    department: 'BSIT',
    yearLevel: '3rd Year',
    section: 'D',
    yearSection: '3D',
  });
}

export async function getStudentRegistrations(studentId: string): Promise<StudentRegistration[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/students/search?q=${encodeURIComponent(studentId)}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const searchData = await res.json();
    if (searchData && searchData.length > 0) {
      return searchData[0].events.map((e: any, idx: number) => ({
        id: `reg-${idx}`,
        eventId: e.eventId,
        eventTitle: e.eventTitle,
        studentName: searchData[0].studentName,
        studentNumber: searchData[0].studentNumber,
        email: searchData[0].email,
        department: searchData[0].department,
        yearSection: searchData[0].yearSection,
        status: 'REGISTERED',
        registrationDate: e.registrationDate,
        qrToken: e.qrToken,
        createdAt: e.registrationDate,
      }));
    }
    return [];
  } catch {
    return [];
  }
}

export async function getRegistrationsForEvent(eventId: string): Promise<StudentRegistration[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/registrations?eventId=${eventId}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getRegistrationByToken(token: string): Promise<{
  registration: StudentRegistration;
  event: CampusEvent;
} | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/ticket/${encodeURIComponent(token)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('getRegistrationByToken error:', err);
    return null;
  }
}

// -------------------------------------------------------------
// QR ATTENDANCE SCANNER & MONITORING
// -------------------------------------------------------------
export async function processQRScan(
  qrToken: string,
  officerId: string,
  officerName: string
): Promise<{
  success: boolean;
  isDuplicate: boolean;
  message: string;
  registration?: StudentRegistration;
  attendance?: AttendanceRecord;
}> {
  try {
    const res = await fetch(`${BASE_URL}/api/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrToken, officerId, officerName }),
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      isDuplicate: false,
      message: err.message || 'Network error scanning QR token.',
    };
  }
}

export async function getAttendanceLogs(eventId?: string): Promise<AttendanceRecord[]> {
  try {
    const url = eventId ? `${BASE_URL}/api/attendance?eventId=${eventId}` : `${BASE_URL}/api/attendance`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getLiveAttendanceMonitoring(eventId: string) {
  try {
    const res = await fetch(`${BASE_URL}/api/attendance/live/${eventId}`, { cache: 'no-store' });
    if (!res.ok) return { totalRegistered: 0, totalCheckedIn: 0, notCheckedIn: 0, records: [] };
    return await res.json();
  } catch {
    return { totalRegistered: 0, totalCheckedIn: 0, notCheckedIn: 0, records: [] };
  }
}

// -------------------------------------------------------------
// CERTIFICATES & VERIFICATION
// -------------------------------------------------------------
export async function getCertificates(studentId?: string): Promise<CertificateRecord[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/certificates`, { cache: 'no-store' });
    if (!res.ok) return [];
    const certs: CertificateRecord[] = await res.json();
    if (studentId) {
      return certs.filter((c) => c.recipientIdentifier === studentId || c.recipientName.includes(studentId));
    }
    return certs;
  } catch {
    return [];
  }
}

export async function getCertificateByCode(code: string): Promise<CertificateRecord | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/certificates/verify/${encodeURIComponent(code)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('getCertificateByCode error:', err);
    return null;
  }
}

export async function issueParticipationCertificatesBatch(
  eventId: string,
  officerId: string,
  officerName: string,
  signatoryPosition?: string
) {
  try {
    const res = await fetch(`${BASE_URL}/api/certificates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'BATCH_PARTICIPATION',
        eventId,
        officerId,
        officerName,
        signatoryPosition,
      }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, count: 0, message: err.message || 'Error issuing certificates' };
  }
}

// Legacy alias
export async function generateBulkCertificates(eventId: string, type?: CertificateType) {
  return issueParticipationCertificatesBatch(eventId, 'demo-officer-1', 'Maria Santos');
}

export async function issueRecognitionCertificate(data: {
  eventId: string;
  recipientName: string;
  awardTitle?: string;
  certificateType?: CertificateType;
  competitionTitle?: string;
  recipientIdentifier?: string;
  recipientEmail?: string;
  officerId?: string;
  officerName?: string;
  signatoryPosition?: string;
  signatoryName?: string;
  eventDescription?: string;
}) {
  const res = await fetch(`${BASE_URL}/api/certificates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'MANUAL_ISSUE',
      ...data,
    }),
  });
  return await res.json();
}

export async function issueGuestSpeakerCertificate(data: {
  eventId: string;
  speakerName: string;
  keynoteTopic: string;
  recipientRole?: string;
  speakerEmail?: string;
  officerId?: string;
  officerName?: string;
  signatoryPosition?: string;
}) {
  const res = await fetch(`${BASE_URL}/api/certificates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'GUEST_SPEAKER_APPRECIATION',
      ...data,
    }),
  });
  return await res.json();
}

export async function revokeCertificate(certId: string, reason: string) {
  try {
    const res = await fetch(`${BASE_URL}/api/certificates/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ certId, reason }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to revoke certificate' };
  }
}

// -------------------------------------------------------------
// ADMIN OVERVIEW, SEARCH, & OFFICERS
// -------------------------------------------------------------
export async function getAdminOverview() {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/overview`, { cache: 'no-store' });
    if (!res.ok) return { totalEvents: 0, totalRegistrations: 0, totalAttendees: 0, activeOfficers: 0, totalCertificates: 0 };
    return await res.json();
  } catch {
    return { totalEvents: 0, totalRegistrations: 0, totalAttendees: 0, activeOfficers: 0, totalCertificates: 0 };
  }
}

export async function searchStudentRecords(query: string) {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/students/search?q=${encodeURIComponent(query)}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getOfficers(): Promise<OfficerAccount[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/officers`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function addOfficer(data: { name: string; email: string; department: string }) {
  const res = await fetch(`${BASE_URL}/api/officers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add officer');
  return await res.json();
}

export async function getCompetitionWinners(eventId?: string): Promise<CompetitionWinner[]> {
  if (eventId) {
    try {
      const res = await fetch(`${BASE_URL}/api/events/${eventId}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        return data.winners || [];
      }
    } catch {}
  }
  return [];
}

// Compatibility mocks for obsolete judge scoring if any legacy view accesses them
export async function getCompetitions() {
  return [
    {
      id: 'comp-1',
      eventId: 'evt-1',
      title: 'Web Application Innovation Contest',
      description: 'Developing paperless university web platforms evaluating visual excellence, code architecture, and functionality.',
      criteria: [
        { id: 'crit-1', name: 'UI Aesthetics & Design Excellence', maxScore: 100, weight: 35 },
        { id: 'crit-2', name: 'Technical Architecture & Security', maxScore: 100, weight: 35 },
        { id: 'crit-3', name: 'Functionality & Feature Completeness', maxScore: 100, weight: 30 },
      ],
    },
  ];
}

export async function getParticipants(competitionId: string) {
  return [
    { id: 'part-1', competitionId, participantName: 'Team Antigravity (Juan Dela Cruz)' },
    { id: 'part-2', competitionId, participantName: 'Cyber Knights (BSIT 3-A)' },
  ];
}

export async function submitJudgeScore(data: any) {
  return { success: true, message: 'Score submitted successfully!' };
}

export async function getTabulatedResults(competitionId: string) {
  return [
    { participantId: 'part-1', participantName: 'Team Antigravity (Juan Dela Cruz)', judgeCount: 3, averageScore: 96.5 },
    { participantId: 'part-2', participantName: 'Cyber Knights (BSIT 3-A)', judgeCount: 3, averageScore: 91.2 },
  ];
}

export async function declareWinners(competitionId: string, winnerList: any[]) {
  return { success: true, message: 'Winners recognized successfully!' };
}

export async function getRecognitions() {
  return [];
}

// -------------------------------------------------------------
// OFFICER ACCOUNTS & HIERARCHICAL MANAGEMENT
// -------------------------------------------------------------
// Admin -> OSDS Officers
export async function getOsdsOfficers(): Promise<OfficerAccount[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/osds-officers`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.officers || [];
  } catch {
    return [];
  }
}

export async function registerOsdsOfficer(data: {
  name: string;
  email: string;
  department?: string;
  password?: string;
}): Promise<{ success: boolean; message: string; officer?: OfficerAccount }> {
  const res = await fetch(`${BASE_URL}/api/admin/osds-officers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to register OSDS officer.');
  }
  return json;
}

export async function toggleOsdsOfficerStatus(id: string): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/api/admin/osds-officers`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return res.ok;
}

// OSDS -> Org Officers
export async function getOrgOfficers(): Promise<OfficerAccount[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/osds/org-officers`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.officers || [];
  } catch {
    return [];
  }
}

export async function registerOrgOfficer(data: {
  name: string;
  email: string;
  department: string;
  password?: string;
}): Promise<{ success: boolean; message: string; officer?: OfficerAccount }> {
  const res = await fetch(`${BASE_URL}/api/osds/org-officers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to register Organization officer.');
  }
  return json;
}

export async function toggleOrgOfficerStatus(id: string): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/api/osds/org-officers`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return res.ok;
}

// -------------------------------------------------------------
// ADMIN RECORDS VAULT API METHODS
// -------------------------------------------------------------
export interface AdminEventRecord {
  id: string;
  recordType: 'EVENT';
  title: string;
  description: string;
  venue: string;
  startDate: string;
  endDate: string;
  status: string;
  isArchived: boolean;
  createdAt: string;
  createdById?: string;
  registrations: any[];
  attendances: any[];
  evaluations: any[];
  certificates: any[];
  stats: {
    registrations: number;
    attendances: number;
    evaluations: number;
    certificates: number;
  };
  raw?: any;
}

export type AdminRecordItem = AdminEventRecord;

export async function getAdminRecords(params?: {
  status?: string;
  search?: string;
}): Promise<{ records: AdminEventRecord[]; events: AdminEventRecord[]; counts: Record<string, number> }> {
  try {
    const sp = new URLSearchParams();
    if (params?.status) sp.set('status', params.status);
    if (params?.search) sp.set('search', params.search);

    const res = await fetch(`${BASE_URL}/api/admin/records?${sp.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load admin records');
    return await res.json();
  } catch (err) {
    console.error('getAdminRecords error:', err);
    return { records: [], events: [], counts: { total: 0, events: 0, active: 0, archived: 0, registrations: 0, attendances: 0, evaluations: 0, certificates: 0 } };
  }
}

export async function archiveAdminRecord(type: string, id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${BASE_URL}/api/admin/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'archive', type, id }),
  });
  return await res.json();
}

export async function unarchiveAdminRecord(type: string, id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${BASE_URL}/api/admin/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'unarchive', type, id }),
  });
  return await res.json();
}

export async function deleteAdminRecord(type: string, id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${BASE_URL}/api/admin/records`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, id }),
  });
  return await res.json();
}

export async function deleteOsdsOfficer(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${BASE_URL}/api/admin/osds-officers`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return await res.json();
}
