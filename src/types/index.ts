// Domain Types for Paperless Campus Event Check-in & E-Certificate System
// University of Rizal System – Cainta Campus
// Final Two-Tier Architecture: Authenticated Roles (ADMIN, OFFICER) + Public Attendees (No account)

export type Role = 'ADMIN' | 'OFFICER';

export type EventStatus = 'DRAFT' | 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export type RegistrationStatus = 'REGISTERED' | 'CANCELLED';

export type CertificateType = 'PARTICIPATION' | 'RECOGNITION' | 'WINNER' | 'APPRECIATION' | 'ATTENDANCE';

export type CertificateStatus = 'ISSUED' | 'REVOKED';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string | null;
}

export interface OfficerAccount {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export type PublicRegistrationStatus =
  | 'REGISTRATION NOT YET OPEN'
  | 'OPEN FOR REGISTRATION'
  | 'REGISTRATION CLOSED'
  | 'REGISTRATION EXPIRED';

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  venue: string;
  startDate: string;
  endDate: string;
  status: EventStatus;
  registrationOpen?: boolean;
  registrationOpensAt?: string;
  registrationClosesAt?: string;
  createdById?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StudentRegistration {
  id: string;
  eventId: string;
  eventTitle?: string;
  studentName: string;
  studentNumber: string; // URS Cainta format: C2024_00179
  email: string;
  department: string; // Course/Program: BT-Auto, BSIT, BSE, BEED, BTLED
  course?: string; // Course alias
  yearSection: string; // e.g. "3B" or "BSIT — 3B"
  yearLevel?: string; // 1st Year, 2nd Year, 3rd Year, 4th Year
  section?: string; // A, B, C, D, E
  status: RegistrationStatus;
  registrationDate: string; // Server-generated ISO string (Asia/Manila)
  qrToken: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  registrationId: string;
  eventId: string;
  eventTitle?: string;
  studentName: string;
  studentNumber: string;
  department?: string;
  course?: string;
  yearSection?: string;
  yearLevel?: string;
  section?: string;
  checkInTime: string; // Server-generated ISO string (Asia/Manila)
  scannedByOfficerId: string;
  scannedByOfficerName: string;
  remarks?: string;
}

export interface CertificateRecord {
  id: string;
  verificationCode: string;
  certificateType: CertificateType;
  recipientName: string;
  recipientIdentifier?: string; // Student Number or "Guest Speaker"
  recipientEmail?: string;
  eventId: string;
  eventTitle: string;
  eventDescription?: string;   // Event details used in the certificate body
  registrationId?: string;
  awardTitle?: string;         // e.g. "Grand Champion", keynote topic, or recipient role
  competitionTitle?: string;
  signatoryPosition?: string;  // e.g. "Dean, College of Computer Studies"
  templateRef: string;
  status: CertificateStatus;
  issuedById?: string;
  issuedByName?: string;
  issuedAt: string; // Server-generated ISO string (Asia/Manila)
  revokedAt?: string;
  revocationReason?: string;
  filePath?: string;
  createdAt?: string;
}

export interface CompetitionWinner {
  id: string;
  competitionId?: string;
  eventId: string;
  participantName: string;
  rank: number;
  awardTitle: string;
  finalScore?: number;
  awardedAt?: string;
  recordedByOfficerId?: string;
  recordedByOfficerName?: string;
  certificateCode?: string;
}

// Judge Scoring Criteria (for officer/competition record keeping)
export interface Criterion {
  id: string;
  name: string;
  maxScore: number;
  weight: number;
}

export interface CriterionScore {
  criterionId: string;
  score: number;
}
