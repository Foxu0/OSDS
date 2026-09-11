import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import {
  CampusEvent,
  StudentRegistration,
  AttendanceRecord,
  CertificateRecord,
  OfficerAccount,
  CompetitionWinner,
  CertificateType,
  EventStatus,
} from '@/types';
import { getOfficialServerTimestamp } from '@/lib/timezone';
import { getEventRegistrationStatus, computeDefaultRegistrationWindow } from '@/lib/registrationWindow';
import {
  validateStudentRegistrationInput,
  normalizeStudentId,
  formatClassDisplay,
  parseYearAndSection,
  getYearDigit,
  ALLOWED_COURSES,
  ALLOWED_YEAR_LEVELS,
  ALLOWED_SECTIONS,
} from '@/lib/studentRules';

export * from '@/lib/venues';
export * from '@/lib/registrationWindow';
export * from '@/lib/studentRules';

// Persistent Local File-based Database Store to guarantee data survives restarts
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'paperless-campus-db.json');

interface LocalDB {
  events: CampusEvent[];
  registrations: StudentRegistration[];
  attendances: AttendanceRecord[];
  certificates: CertificateRecord[];
  officers: OfficerAccount[];
  winners: CompetitionWinner[];
}

function getDefaultDB(): LocalDB {
  return {
    events: [
      {
        id: 'evt-1',
        title: 'URS Cainta IT & Innovation Summit 2026',
        description: 'Annual campus-wide technology summit featuring student project exhibitions, web development competitions, and guest keynote speakers.',
        venue: 'Laboratory Room',
        startDate: new Date('2026-09-15T09:00:00+08:00').toISOString(),
        endDate: new Date('2026-09-15T17:00:00+08:00').toISOString(),
        status: 'UPCOMING' as EventStatus,
        registrationOpen: true,
        registrationOpensAt: new Date('2026-09-01T08:00:00+08:00').toISOString(),
        registrationClosesAt: new Date('2026-09-15T09:00:00+08:00').toISOString(),
        createdById: 'demo-officer-1',
        createdAt: new Date('2026-09-01T08:00:00Z').toISOString(),
      },
      {
        id: 'evt-2',
        title: 'Campus Cybersecurity & Digital Rights Forum',
        description: 'Comprehensive cybersecurity awareness seminar covering student data privacy, ethical hacking fundamentals, and digital security in academia.',
        venue: 'Room 301',
        startDate: new Date('2026-09-22T13:00:00+08:00').toISOString(),
        endDate: new Date('2026-09-22T17:00:00+08:00').toISOString(),
        status: 'UPCOMING' as EventStatus,
        registrationOpen: true,
        registrationOpensAt: new Date('2026-09-10T08:00:00+08:00').toISOString(),
        registrationClosesAt: new Date('2026-09-22T13:00:00+08:00').toISOString(),
        createdById: 'demo-officer-1',
        createdAt: new Date('2026-09-02T10:00:00Z').toISOString(),
      },
      {
        id: 'evt-3',
        title: 'University Leadership & Cultural Recognition Night',
        description: 'Awards night celebrating student leaders, academic distinction awardees, and student organization officers for AY 2025-2026.',
        venue: 'Karangalan Court',
        startDate: new Date('2026-08-30T14:00:00+08:00').toISOString(),
        endDate: new Date('2026-08-30T19:00:00+08:00').toISOString(),
        status: 'COMPLETED' as EventStatus,
        registrationOpen: false,
        registrationOpensAt: new Date('2026-08-15T08:00:00+08:00').toISOString(),
        registrationClosesAt: new Date('2026-08-30T13:00:00+08:00').toISOString(),
        createdById: 'demo-officer-1',
        createdAt: new Date('2026-08-15T08:00:00Z').toISOString(),
      },
      {
        id: 'evt-4',
        title: 'Engineering & Industrial Tech Colloquium',
        description: 'Research presentations by graduating students and faculty in applied sciences and automotive engineering.',
        venue: 'Computer Laboratory 404',
        startDate: new Date('2026-09-28T09:00:00+08:00').toISOString(),
        endDate: new Date('2026-09-28T16:00:00+08:00').toISOString(),
        status: 'UPCOMING' as EventStatus,
        registrationOpen: true,
        registrationOpensAt: new Date('2026-09-14T08:00:00+08:00').toISOString(),
        registrationClosesAt: new Date('2026-09-28T09:00:00+08:00').toISOString(),
        createdById: 'demo-officer-1',
        createdAt: new Date('2026-09-03T11:00:00Z').toISOString(),
      },
    ],
    registrations: [
      {
        id: 'reg-1',
        eventId: 'evt-1',
        eventTitle: 'URS Cainta IT & Innovation Summit 2026',
        studentName: 'Juan Dela Cruz',
        studentNumber: 'C2024_00179',
        email: 'juan.delacruz@urs.edu.ph',
        department: 'BSIT',
        course: 'BSIT',
        yearSection: '3D',
        yearLevel: '3rd Year',
        section: 'D',
        status: 'REGISTERED',
        registrationDate: new Date('2026-09-04T08:30:00Z').toISOString(),
        qrToken: 'qr_token_C202400179_evt1',
        createdAt: new Date('2026-09-04T08:30:00Z').toISOString(),
      },
      {
        id: 'reg-2',
        eventId: 'evt-3',
        eventTitle: 'University Leadership & Cultural Recognition Night',
        studentName: 'Juan Dela Cruz',
        studentNumber: 'C2024_00179',
        email: 'juan.delacruz@urs.edu.ph',
        department: 'BSIT',
        course: 'BSIT',
        yearSection: '3D',
        yearLevel: '3rd Year',
        section: 'D',
        status: 'REGISTERED',
        registrationDate: new Date('2026-08-25T14:00:00Z').toISOString(),
        qrToken: 'qr_token_C202400179_evt3',
        createdAt: new Date('2026-08-25T14:00:00Z').toISOString(),
      },
      {
        id: 'reg-3',
        eventId: 'evt-3',
        eventTitle: 'University Leadership & Cultural Recognition Night',
        studentName: 'Angela Mendoza',
        studentNumber: 'C2025_00234',
        email: 'angela.mendoza@urs.edu.ph',
        department: 'BSE',
        course: 'BSE',
        yearSection: '2B',
        yearLevel: '2nd Year',
        section: 'B',
        status: 'REGISTERED',
        registrationDate: new Date('2026-08-26T10:15:00Z').toISOString(),
        qrToken: 'qr_token_C202500234_evt3',
        createdAt: new Date('2026-08-26T10:15:00Z').toISOString(),
      },
    ],
    attendances: [
      {
        id: 'att-1',
        registrationId: 'reg-2',
        eventId: 'evt-3',
        eventTitle: 'University Leadership & Cultural Recognition Night',
        studentName: 'Juan Dela Cruz',
        studentNumber: 'C2024_00179',
        department: 'BSIT',
        course: 'BSIT',
        yearSection: '3D',
        yearLevel: '3rd Year',
        section: 'D',
        checkInTime: new Date('2026-08-30T13:15:00Z').toISOString(),
        scannedByOfficerId: 'demo-officer-1',
        scannedByOfficerName: 'Maria Santos',
        remarks: 'Verified via Camera QR Scanner',
      },
      {
        id: 'att-2',
        registrationId: 'reg-3',
        eventId: 'evt-3',
        eventTitle: 'University Leadership & Cultural Recognition Night',
        studentName: 'Angela Mendoza',
        studentNumber: 'C2025_00234',
        department: 'BSE',
        course: 'BSE',
        yearSection: '2B',
        yearLevel: '2nd Year',
        section: 'B',
        checkInTime: new Date('2026-08-30T13:20:00Z').toISOString(),
        scannedByOfficerId: 'demo-officer-1',
        scannedByOfficerName: 'Maria Santos',
        remarks: 'Verified via Camera QR Scanner',
      },
    ],
    certificates: [
      {
        id: 'cert-1',
        verificationCode: 'URS-2026-CERT-8F3A91',
        certificateType: 'PARTICIPATION',
        recipientName: 'Juan Dela Cruz',
        recipientIdentifier: 'C2024_00179',
        recipientEmail: 'juan.delacruz@urs.edu.ph',
        eventId: 'evt-3',
        eventTitle: 'University Leadership & Cultural Recognition Night',
        eventDescription: 'An annual celebration of student leadership, cultural heritage, and academic excellence.',
        registrationId: 'reg-2',
        templateRef: 'default_template.pdf',
        status: 'ISSUED',
        issuedById: 'demo-officer-1',
        issuedByName: 'Maria Santos',
        signatoryPosition: 'Student Affairs Officer',
        issuedAt: new Date('2026-08-31T09:00:00Z').toISOString(),
      },
      {
        id: 'cert-2',
        verificationCode: 'URS-2026-WIN-99B2D4',
        certificateType: 'RECOGNITION',
        recipientName: 'Juan Dela Cruz',
        recipientIdentifier: 'C2024_00179',
        recipientEmail: 'juan.delacruz@urs.edu.ph',
        eventId: 'evt-1',
        eventTitle: 'URS Cainta IT & Innovation Summit 2026',
        awardTitle: '1st Place',
        competitionTitle: 'Web Innovation Hackathon',
        templateRef: 'default_template.pdf',
        status: 'ISSUED',
        issuedById: 'demo-admin-1',
        issuedByName: 'Admin Campus Director',
        signatoryPosition: 'Campus Director, URS Cainta',
        issuedAt: new Date('2026-09-02T11:00:00Z').toISOString(),
      },
      {
        id: 'cert-3',
        verificationCode: 'URS-2026-SPK-44C719',
        certificateType: 'APPRECIATION',
        recipientName: 'Engr. Rafael Alejandro',
        recipientIdentifier: 'Resource Speaker',
        recipientEmail: 'rafael.alejandro@industry.ph',
        eventId: 'evt-1',
        eventTitle: 'URS Cainta IT & Innovation Summit 2026',
        awardTitle: 'Resource Speaker — Scaling Enterprise Architecture in Modern Cloud',
        templateRef: 'default_template.pdf',
        status: 'ISSUED',
        issuedById: 'demo-admin-1',
        issuedByName: 'Admin Campus Director',
        signatoryPosition: 'Campus Director, URS Cainta',
        issuedAt: new Date('2026-09-02T14:00:00Z').toISOString(),
      },
    ],
    officers: [
      {
        id: 'demo-officer-1',
        name: 'Maria Santos',
        email: 'officer@urs.edu.ph',
        role: 'OFFICER',
        department: 'Supreme Student Council - Chief Facilitator',
        status: 'ACTIVE',
        createdAt: new Date('2026-01-10T08:00:00Z').toISOString(),
      },
      {
        id: 'demo-officer-2',
        name: 'Mark Joseph Ramos',
        email: 'facilitator2@urs.edu.ph',
        role: 'OFFICER',
        department: 'College of Computer Studies - Event Lead',
        status: 'ACTIVE',
        createdAt: new Date('2026-02-15T09:00:00Z').toISOString(),
      },
    ],
    winners: [
      {
        id: 'win-1',
        eventId: 'evt-1',
        participantName: 'Team Antigravity (Juan Dela Cruz & Angela Mendoza)',
        rank: 1,
        awardTitle: 'Grand Champion - Web Application Innovation',
        finalScore: 96.5,
        awardedAt: new Date('2026-09-02T11:00:00Z').toISOString(),
        recordedByOfficerId: 'demo-admin-1',
        recordedByOfficerName: 'Admin Campus Director',
        certificateCode: 'URS-2026-WIN-99B2D4',
      },
    ],
  };
}

function loadDB(): LocalDB {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading local db file:', err);
  }
  const defaultData = getDefaultDB();
  saveDB(defaultData);
  return defaultData;
}

function saveDB(data: LocalDB): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local db file:', err);
  }
}

// -------------------------------------------------------------
// EVENTS
// -------------------------------------------------------------
export async function getEvents(): Promise<CampusEvent[]> {
  const db = loadDB();
  return db.events.sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
}

export async function getEventById(id: string): Promise<CampusEvent | null> {
  const db = loadDB();
  return db.events.find((e) => e.id === id) || null;
}

export async function createEvent(data: {
  title: string;
  description: string;
  venue: string;
  startDate: string;
  endDate: string;
  createdById?: string;
  registrationOpen?: boolean;
  registrationOpensAt?: string;
  registrationClosesAt?: string;
}): Promise<CampusEvent> {
  const db = loadDB();
  const defaultWindow = computeDefaultRegistrationWindow(data.startDate);
  const registrationOpensAt = data.registrationOpensAt || defaultWindow.opensAt;
  const registrationClosesAt = data.registrationClosesAt || defaultWindow.closesAt;

  const newEvt: CampusEvent = {
    id: `evt-${Date.now()}`,
    title: data.title,
    description: data.description,
    venue: data.venue,
    startDate: data.startDate,
    endDate: data.endDate,
    status: 'UPCOMING',
    registrationOpen: data.registrationOpen ?? true,
    registrationOpensAt,
    registrationClosesAt,
    createdById: data.createdById || 'demo-officer-1',
    createdAt: getOfficialServerTimestamp(),
  };

  db.events.unshift(newEvt);
  saveDB(db);

  // Attempt async sync with Prisma if configured
  try {
    if (prisma?.event) {
      await prisma.event.create({
        data: {
          id: newEvt.id,
          title: newEvt.title,
          description: newEvt.description,
          venue: newEvt.venue,
          startDate: new Date(newEvt.startDate),
          endDate: new Date(newEvt.endDate),
          status: newEvt.status,
          registrationOpen: newEvt.registrationOpen,
          registrationOpensAt: new Date(newEvt.registrationOpensAt!),
          registrationClosesAt: new Date(newEvt.registrationClosesAt!),
          createdById: newEvt.createdById,
        },
      });
    }
  } catch (e) {
    // Non-blocking fallback
  }

  return newEvt;
}

export async function updateEvent(
  id: string,
  updates: Partial<CampusEvent>
): Promise<CampusEvent | null> {
  const db = loadDB();
  const index = db.events.findIndex((e) => e.id === id);
  if (index === -1) return null;

  db.events[index] = {
    ...db.events[index],
    ...updates,
    updatedAt: getOfficialServerTimestamp(),
  };
  saveDB(db);

  try {
    if (prisma?.event) {
      const prismaData: any = {};
      if (updates.title !== undefined) prismaData.title = updates.title;
      if (updates.description !== undefined) prismaData.description = updates.description;
      if (updates.venue !== undefined) prismaData.venue = updates.venue;
      if (updates.startDate !== undefined) prismaData.startDate = new Date(updates.startDate);
      if (updates.endDate !== undefined) prismaData.endDate = new Date(updates.endDate);
      if (updates.status !== undefined) prismaData.status = updates.status;
      if (updates.registrationOpen !== undefined) prismaData.registrationOpen = updates.registrationOpen;
      if (updates.registrationOpensAt !== undefined) {
        prismaData.registrationOpensAt = updates.registrationOpensAt ? new Date(updates.registrationOpensAt) : null;
      }
      if (updates.registrationClosesAt !== undefined) {
        prismaData.registrationClosesAt = updates.registrationClosesAt ? new Date(updates.registrationClosesAt) : null;
      }

      await prisma.event.update({
        where: { id },
        data: prismaData,
      });
    }
  } catch (e) {
    // Non-blocking fallback
  }

  return db.events[index];
}

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
  // STRICT URS CAINTA STUDENT INFORMATION VALIDATION
  const validation = validateStudentRegistrationInput(data);
  if (!validation.isValid || !validation.normalized) {
    return {
      success: false,
      message: validation.message || 'Invalid registration details.',
    };
  }
  const norm = validation.normalized;

  const db = loadDB();
  const event = db.events.find((e) => e.id === data.eventId);

  if (!event) {
    return { success: false, message: 'Event not found.' };
  }

  // Check if student already registered for this event
  const cleanNumber = norm.studentNumber;
  const existing = db.registrations.find(
    (r) =>
      r.eventId === data.eventId &&
      r.studentNumber.trim().toUpperCase() === cleanNumber &&
      r.status === 'REGISTERED'
  );

  if (existing) {
    return {
      success: true,
      message: 'Student is already registered for this event. Your existing ticket is below.',
      registration: existing,
      isExisting: true,
    };
  }

  // STRICT SERVER-SIDE REGISTRATION EXPIRATION AND WINDOW VALIDATION
  // Validates current server time against the event's registration window
  const serverTimestamp = getOfficialServerTimestamp();
  const regStatus = getEventRegistrationStatus(event, serverTimestamp);

  if (!regStatus.canRegister) {
    return {
      success: false,
      message: `${regStatus.label}: ${regStatus.message}`,
    };
  }

  // Generate secure unique token
  const randomStr = Math.random().toString(36).substring(2, 10);
  const qrToken = `qr_token_${cleanNumber.replace(/[^A-Z0-9]/g, '')}_${randomStr}_${Date.now()}`;

  const newReg: StudentRegistration = {
    id: `reg-${Date.now()}`,
    eventId: data.eventId,
    eventTitle: event.title,
    studentName: norm.studentName,
    studentNumber: norm.studentNumber,
    email: norm.email,
    department: norm.course,
    course: norm.course,
    yearSection: norm.yearSection,
    yearLevel: norm.yearLevel,
    section: norm.section,
    status: 'REGISTERED',
    registrationDate: serverTimestamp,
    qrToken,
    createdAt: serverTimestamp,
  };

  db.registrations.push(newReg);
  saveDB(db);

  // Attempt async sync with Prisma if configured
  try {
    if (prisma?.registration) {
      await prisma.registration.create({
        data: {
          id: newReg.id,
          eventId: newReg.eventId,
          studentName: newReg.studentName,
          studentNumber: newReg.studentNumber,
          email: newReg.email,
          department: newReg.department,
          yearSection: newReg.yearSection,
          status: newReg.status,
          registrationDate: new Date(newReg.registrationDate),
          qrToken: newReg.qrToken,
        },
      });
    }
  } catch (e) {
    // Non-blocking fallback
  }

  return {
    success: true,
    message: 'Official Event Registration successful! Present your QR pass at the venue entrance.',
    registration: newReg,
    isExisting: false,
  };
}

export async function getRegistrationByToken(
  token: string
): Promise<{ registration: StudentRegistration; event: CampusEvent } | null> {
  const db = loadDB();
  const reg = db.registrations.find((r) => r.qrToken === token.trim());
  if (!reg) return null;

  const event = db.events.find((e) => e.id === reg.eventId) || {
    id: reg.eventId,
    title: reg.eventTitle || 'Campus Event',
    description: '',
    venue: 'URS Cainta Campus',
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    status: 'ONGOING' as EventStatus,
    createdAt: new Date().toISOString(),
  };

  return { registration: reg, event };
}

export async function getRegistrationsForEvent(
  eventId: string
): Promise<StudentRegistration[]> {
  const db = loadDB();
  return db.registrations.filter((r) => r.eventId === eventId);
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
  const db = loadDB();
  const reg = db.registrations.find((r) => r.qrToken === qrToken.trim());

  if (!reg) {
    return {
      success: false,
      isDuplicate: false,
      message: 'Invalid or Unrecognized QR Code Token. Verify registration.',
    };
  }

  // Duplicate Check: Check if attendance record already exists for this registration
  const existingAttendance = db.attendances.find((a) => a.registrationId === reg.id);
  if (existingAttendance) {
    return {
      success: false,
      isDuplicate: true,
      message: `DUPLICATE CHECK-IN PREVENTED! Attendee ${reg.studentName} (${reg.studentNumber}) was already scanned into "${reg.eventTitle || 'Event'}" at ${new Date(existingAttendance.checkInTime).toLocaleTimeString('en-PH', { timeZone: 'Asia/Manila' })}.`,
      registration: reg,
      attendance: existingAttendance,
    };
  }

  // STRICT RULE: Attendance timestamp MUST be server-generated!
  const serverTimestamp = getOfficialServerTimestamp();

  const newAtt: AttendanceRecord = {
    id: `att-${Date.now()}`,
    registrationId: reg.id,
    eventId: reg.eventId,
    eventTitle: reg.eventTitle,
    studentName: reg.studentName,
    studentNumber: reg.studentNumber,
    department: reg.department,
    course: reg.course || reg.department,
    yearSection: reg.yearSection,
    yearLevel: reg.yearLevel,
    section: reg.section,
    checkInTime: serverTimestamp,
    scannedByOfficerId: officerId,
    scannedByOfficerName: officerName,
    remarks: 'Verified via Camera/Pass QR Scanner',
  };

  db.attendances.unshift(newAtt);
  saveDB(db);

  // Attempt sync with Prisma
  try {
    if (prisma?.attendance) {
      await prisma.attendance.create({
        data: {
          id: newAtt.id,
          registrationId: newAtt.registrationId,
          eventId: newAtt.eventId,
          checkInTime: new Date(newAtt.checkInTime),
          scannedByOfficerId: newAtt.scannedByOfficerId,
          scannedByOfficerName: newAtt.scannedByOfficerName,
          remarks: newAtt.remarks,
        },
      });
    }
  } catch (e) {
    // Non-blocking fallback
  }

  return {
    success: true,
    isDuplicate: false,
    message: `VERIFIED & CHECKED IN! Attendee ${reg.studentName} (${reg.studentNumber}) checked into ${reg.eventTitle || 'Event'}.`,
    registration: reg,
    attendance: newAtt,
  };
}

export async function getAttendanceLogs(eventId?: string): Promise<AttendanceRecord[]> {
  const db = loadDB();
  if (eventId) {
    return db.attendances.filter((a) => a.eventId === eventId);
  }
  return db.attendances;
}

export async function getLiveAttendanceMonitoring(eventId: string): Promise<{
  totalRegistered: number;
  totalCheckedIn: number;
  notCheckedIn: number;
  records: Array<{
    registration: StudentRegistration;
    attendance?: AttendanceRecord;
    checkedIn: boolean;
  }>;
}> {
  const db = loadDB();
  const regs = db.registrations.filter((r) => r.eventId === eventId);
  const atts = db.attendances.filter((a) => a.eventId === eventId);

  const records = regs.map((r) => {
    const att = atts.find((a) => a.registrationId === r.id);
    return {
      registration: r,
      attendance: att,
      checkedIn: !!att,
    };
  });

  return {
    totalRegistered: regs.length,
    totalCheckedIn: atts.length,
    notCheckedIn: Math.max(0, regs.length - atts.length),
    records,
  };
}

// -------------------------------------------------------------
// E-CERTIFICATES STATION & VERIFICATION
// -------------------------------------------------------------
export async function getCertificates(): Promise<CertificateRecord[]> {
  const db = loadDB();
  return db.certificates.sort(
    (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
  );
}

export async function getCertificateByCode(code: string): Promise<CertificateRecord | null> {
  const db = loadDB();
  const cleanCode = code.trim().toUpperCase();
  return (
    db.certificates.find((c) => c.verificationCode.toUpperCase() === cleanCode) || null
  );
}

export async function issueParticipationCertificatesBatch(
  eventId: string,
  officerId: string,
  officerName: string,
  signatoryPosition?: string
): Promise<{ success: boolean; count: number; message: string }> {
  const db = loadDB();
  const event = db.events.find((e) => e.id === eventId);
  if (!event) return { success: false, count: 0, message: 'Event not found.' };

  // Get all checked-in attendees for this event
  const attendees = db.attendances.filter((a) => a.eventId === eventId);
  if (attendees.length === 0) {
    return {
      success: false,
      count: 0,
      message: 'No checked-in attendees found for this event. Attendees must be scanned first.',
    };
  }

  let createdCount = 0;
  const serverTimestamp = getOfficialServerTimestamp();

  for (const att of attendees) {
    const alreadyIssued = db.certificates.find(
      (c) =>
        c.eventId === eventId &&
        c.recipientIdentifier === att.studentNumber &&
        (c.certificateType === 'PARTICIPATION' || c.certificateType === 'ATTENDANCE')
    );

    if (!alreadyIssued) {
      const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
      const code = `URS-${new Date().getFullYear()}-PRT-${randomHex}`;

      const newCert: CertificateRecord = {
        id: `cert-${Date.now()}-${randomHex}`,
        verificationCode: code,
        certificateType: 'PARTICIPATION',
        recipientName: att.studentName,
        recipientIdentifier: att.studentNumber,
        eventId: event.id,
        eventTitle: event.title,
        eventDescription: event.description,
        registrationId: att.registrationId,
        signatoryPosition: signatoryPosition,
        templateRef: 'default_template.pdf',
        status: 'ISSUED',
        issuedById: officerId,
        issuedByName: officerName,
        issuedAt: serverTimestamp,
        createdAt: serverTimestamp,
      };

      db.certificates.push(newCert);
      createdCount++;

      // Async Prisma persist
      try {
        if (prisma?.certificate) {
          await prisma.certificate.upsert({
            where: { verificationCode: code },
            create: {
              id: newCert.id,
              verificationCode: code,
              certificateType: 'PARTICIPATION',
              recipientName: newCert.recipientName,
              recipientIdentifier: newCert.recipientIdentifier,
              eventId: newCert.eventId,
              registrationId: newCert.registrationId,
              eventDescription: newCert.eventDescription,
              signatoryPosition: newCert.signatoryPosition,
              issuedById: officerId,
              issuedByName: officerName,
              issuedAt: new Date(serverTimestamp),
            },
            update: {},
          });
        }
      } catch (e) { /* non-blocking */ }
    }
  }

  saveDB(db);
  return {
    success: true,
    count: createdCount,
    message: `Generated ${createdCount} Certificate(s) of Participation for verified attendees!`,
  };
}

export async function issueRecognitionCertificate(data: {
  eventId: string;
  recipientName: string;
  awardTitle: string;        // e.g. "Grand Champion", "1st Runner-Up"
  competitionTitle?: string; // e.g. "Web Innovation Hackathon"
  recipientIdentifier?: string;
  recipientEmail?: string;
  officerId: string;
  officerName: string;
  signatoryPosition?: string;
  eventDescription?: string;
}): Promise<CertificateRecord> {
  const db = loadDB();
  const event = db.events.find((e) => e.id === data.eventId);
  const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
  const code = `URS-${new Date().getFullYear()}-REC-${randomHex}`;
  const serverTimestamp = getOfficialServerTimestamp();

  const newCert: CertificateRecord = {
    id: `cert-${Date.now()}-${randomHex}`,
    verificationCode: code,
    certificateType: 'RECOGNITION',
    recipientName: data.recipientName.trim(),
    recipientIdentifier: data.recipientIdentifier?.trim() || '',
    recipientEmail: data.recipientEmail?.trim(),
    eventId: data.eventId,
    eventTitle: event?.title || 'Campus Competition',
    eventDescription: data.eventDescription || event?.description,
    awardTitle: data.awardTitle.trim(),
    competitionTitle: data.competitionTitle?.trim(),
    signatoryPosition: data.signatoryPosition,
    templateRef: 'default_template.pdf',
    status: 'ISSUED',
    issuedById: data.officerId,
    issuedByName: data.officerName,
    issuedAt: serverTimestamp,
    createdAt: serverTimestamp,
  };

  db.certificates.unshift(newCert);

  // Also record in winners store for backward compat
  const winnerRecord: CompetitionWinner = {
    id: `win-${Date.now()}`,
    eventId: data.eventId,
    participantName: data.recipientName,
    rank: data.awardTitle.toLowerCase().includes('champion') ? 1 : 2,
    awardTitle: data.awardTitle,
    awardedAt: serverTimestamp,
    recordedByOfficerId: data.officerId,
    recordedByOfficerName: data.officerName,
    certificateCode: code,
  };
  db.winners.unshift(winnerRecord);

  saveDB(db);

  // Async Prisma persist
  try {
    if (prisma?.certificate) {
      await prisma.certificate.upsert({
        where: { verificationCode: code },
        create: {
          id: newCert.id,
          verificationCode: code,
          certificateType: 'RECOGNITION',
          recipientName: newCert.recipientName,
          recipientIdentifier: newCert.recipientIdentifier,
          recipientEmail: newCert.recipientEmail,
          eventId: newCert.eventId,
          awardTitle: newCert.awardTitle,
          competitionTitle: newCert.competitionTitle,
          eventDescription: newCert.eventDescription,
          signatoryPosition: newCert.signatoryPosition,
          issuedById: data.officerId,
          issuedByName: data.officerName,
          issuedAt: new Date(serverTimestamp),
        },
        update: {},
      });
    }
  } catch (e) { /* non-blocking */ }

  return newCert;
}

export async function issueGuestSpeakerCertificate(data: {
  eventId: string;
  speakerName: string;
  keynoteTopic: string;        // role / contribution description
  recipientRole?: string;      // e.g. "Resource Speaker", "Judge", "Facilitator"
  speakerEmail?: string;
  officerId: string;
  officerName: string;
  signatoryPosition?: string;
}): Promise<CertificateRecord> {
  const db = loadDB();
  const event = db.events.find((e) => e.id === data.eventId);
  const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
  const code = `URS-${new Date().getFullYear()}-APR-${randomHex}`;
  const serverTimestamp = getOfficialServerTimestamp();

  const roleLabel = data.recipientRole?.trim() || 'Resource Speaker';
  const awardTitleValue = `${roleLabel} — ${data.keynoteTopic.trim()}`;

  const newCert: CertificateRecord = {
    id: `cert-${Date.now()}-${randomHex}`,
    verificationCode: code,
    certificateType: 'APPRECIATION',
    recipientName: data.speakerName.trim(),
    recipientIdentifier: roleLabel,
    recipientEmail: data.speakerEmail?.trim(),
    eventId: data.eventId,
    eventTitle: event?.title || 'University Event',
    awardTitle: awardTitleValue,
    signatoryPosition: data.signatoryPosition,
    templateRef: 'default_template.pdf',
    status: 'ISSUED',
    issuedById: data.officerId,
    issuedByName: data.officerName,
    issuedAt: serverTimestamp,
    createdAt: serverTimestamp,
  };

  db.certificates.unshift(newCert);
  saveDB(db);

  // Async Prisma persist
  try {
    if (prisma?.certificate) {
      await prisma.certificate.upsert({
        where: { verificationCode: code },
        create: {
          id: newCert.id,
          verificationCode: code,
          certificateType: 'APPRECIATION',
          recipientName: newCert.recipientName,
          recipientIdentifier: newCert.recipientIdentifier,
          recipientEmail: newCert.recipientEmail,
          eventId: newCert.eventId,
          awardTitle: newCert.awardTitle,
          signatoryPosition: newCert.signatoryPosition,
          issuedById: data.officerId,
          issuedByName: data.officerName,
          issuedAt: new Date(serverTimestamp),
        },
        update: {},
      });
    }
  } catch (e) { /* non-blocking */ }

  return newCert;
}

export async function revokeCertificate(
  certId: string,
  reason: string,
  adminId?: string
): Promise<{ success: boolean; message: string }> {
  const db = loadDB();
  const cert = db.certificates.find((c) => c.id === certId || c.verificationCode === certId);

  if (!cert) {
    return { success: false, message: 'Certificate record not found.' };
  }

  cert.status = 'REVOKED';
  cert.revokedAt = getOfficialServerTimestamp();
  cert.revocationReason = reason;

  saveDB(db);

  // Async Prisma revocation sync
  try {
    if (prisma?.certificate) {
      await prisma.certificate.updateMany({
        where: {
          OR: [
            { id: certId },
            { verificationCode: certId },
          ],
        },
        data: {
          status: 'REVOKED',
          revokedAt: new Date(cert.revokedAt),
          revocationReason: reason,
        },
      });
    }
  } catch (e) { /* non-blocking */ }

  return {
    success: true,
    message: `Certificate ${cert.verificationCode} has been officially REVOKED. Public verification will immediately reflect this change.`,
  };
}

// -------------------------------------------------------------
// ADMIN RECORD SEARCH & SYSTEM OVERVIEW
// -------------------------------------------------------------
export async function getAdminSystemOverview(): Promise<{
  totalEvents: number;
  totalRegistrations: number;
  totalAttendees: number;
  activeOfficers: number;
  totalCertificates: number;
}> {
  const db = loadDB();
  return {
    totalEvents: db.events.length,
    totalRegistrations: db.registrations.length,
    totalAttendees: db.attendances.length,
    activeOfficers: db.officers.filter((o) => o.status === 'ACTIVE').length,
    totalCertificates: db.certificates.length,
  };
}

export async function searchStudentRecords(query: string): Promise<
  Array<{
    studentNumber: string;
    studentName: string;
    department: string;
    course?: string;
    yearSection: string;
    yearLevel?: string;
    section?: string;
    classDisplay?: string;
    email: string;
    events: Array<{
      eventId: string;
      eventTitle: string;
      registrationDate: string;
      qrToken: string;
      attended: boolean;
      checkInTime?: string;
      scannedBy?: string;
    }>;
    certificates: CertificateRecord[];
  }>
> {
  const db = loadDB();
  const q = query.trim().toLowerCase();
  const terms = q.split(/[\s—\-–]+/).filter(Boolean);

  // Find all registrations matching query terms
  const matchedRegs = db.registrations.filter((r) => {
    const formattedClass = formatClassDisplay(
      r.course || r.department,
      r.yearLevel || r.yearSection,
      r.section || r.yearSection
    ).toLowerCase();

    const searchableText = [
      r.studentNumber.toLowerCase(),
      r.studentName.toLowerCase(),
      r.department.toLowerCase(),
      (r.course || '').toLowerCase(),
      r.yearSection.toLowerCase(),
      (r.yearLevel || '').toLowerCase(),
      (r.section || '').toLowerCase(),
      formattedClass,
      r.email.toLowerCase(),
    ].join(' ');

    return terms.every((term) => searchableText.includes(term));
  });

  // Group by student number
  const studentMap = new Map<string, any>();

  for (const reg of matchedRegs) {
    if (!studentMap.has(reg.studentNumber)) {
      const classDisplay = formatClassDisplay(
        reg.course || reg.department,
        reg.yearLevel || reg.yearSection,
        reg.section || reg.yearSection
      );
      const parsed = parseYearAndSection(reg.yearSection);

      studentMap.set(reg.studentNumber, {
        studentNumber: reg.studentNumber,
        studentName: reg.studentName,
        department: reg.department,
        course: reg.course || reg.department,
        yearSection: reg.yearSection,
        yearLevel: reg.yearLevel || parsed.yearLevel,
        section: reg.section || parsed.section,
        classDisplay,
        email: reg.email,
        events: [],
        certificates: db.certificates.filter(
          (c) =>
            c.recipientIdentifier === reg.studentNumber ||
            c.recipientName.toLowerCase() === reg.studentName.toLowerCase()
        ),
      });
    }

    const studentData = studentMap.get(reg.studentNumber)!;
    const att = db.attendances.find((a) => a.registrationId === reg.id);
    studentData.events.push({
      eventId: reg.eventId,
      eventTitle: reg.eventTitle || 'Campus Event',
      registrationDate: reg.registrationDate,
      qrToken: reg.qrToken,
      attended: !!att,
      checkInTime: att?.checkInTime,
      scannedBy: att?.scannedByOfficerName,
    });
  }

  return Array.from(studentMap.values());
}

export async function getOfficers(): Promise<OfficerAccount[]> {
  const db = loadDB();
  return db.officers;
}

export async function addOfficerAccount(data: {
  name: string;
  email: string;
  department: string;
}): Promise<OfficerAccount> {
  const db = loadDB();
  const newOfficer: OfficerAccount = {
    id: `officer-${Date.now()}`,
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    role: 'OFFICER',
    department: data.department.trim(),
    status: 'ACTIVE',
    createdAt: getOfficialServerTimestamp(),
  };

  db.officers.push(newOfficer);
  saveDB(db);
  return newOfficer;
}

export async function getCompetitionWinners(eventId?: string): Promise<CompetitionWinner[]> {
  const db = loadDB();
  if (eventId) {
    return db.winners.filter((w) => w.eventId === eventId);
  }
  return db.winners;
}
