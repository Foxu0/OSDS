// Domain Types for Paperless Campus Event Check-in & E-Certificate System
// University of Rizal System – Cainta Campus
// Four-Role Architecture: STUDENT | ORG_OFFICER | OSDS_OFFICER | ADMIN

// 'OFFICER' is kept for backward compatibility with legacy OfficerAccount seed data
export type Role = 'STUDENT' | 'ORG_OFFICER' | 'OSDS_OFFICER' | 'ADMIN' | 'OFFICER';

export type AccountStatus = 'PENDING' | 'ACTIVE' | 'DEACTIVATED';

export type EventStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export type RegistrationStatus = 'REGISTERED' | 'CANCELLED';

export type CertificateType = 'PARTICIPATION' | 'RECOGNITION' | 'WINNER' | 'APPRECIATION' | 'ATTENDANCE';

export type CertificateStatus = 'ISSUED' | 'REVOKED';

export type FormFieldType = 'SHORT_TEXT' | 'LONG_TEXT' | 'DROPDOWN' | 'CHECKBOX' | 'RADIO' | 'RATING';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string | null;
  studentNumber?: string | null;
  status?: AccountStatus;
}

export interface StudentAccount {
  id: string;
  studentNumber: string;
  name: string;
  email: string;
  course: string;
  yearLevel: string;
  section: string;
  yearSection: string;
  department: string;
  role: Role;
  status: AccountStatus;
  passwordHash: string;
  password?: string;
  createdAt: string;
  updatedAt?: string;
  verifiedAt?: string;
}

export interface VerificationCodeRecord {
  id: string;
  identifier: string; // studentNumber or email
  email: string;
  code: string;
  type: 'SIGNUP' | 'PASSWORD_RESET';
  expiresAt: string;
  used: boolean;
  attempts: number;
  createdAt: string;
}

export interface OfficerAccount {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  password?: string;
  passwordHash?: string;
  registeredById?: string;
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
  evaluationOpen?: boolean;
  registrationOpensAt?: string;
  registrationClosesAt?: string;
  createdById?: string;
  createdByRole?: Role;
  organizationName?: string;
  bannerImage?: string;
  facilitators?: string[];
  createdAt: string;
  updatedAt?: string;
  approvedById?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface StudentRegistration {
  id: string;
  eventId: string;
  eventTitle?: string;
  studentName: string;
  studentNumber: string;
  email: string;
  department: string;
  course?: string;
  yearSection: string;
  yearLevel?: string;
  section?: string;
  status: RegistrationStatus;
  registrationDate: string;
  qrToken: string;
  createdAt: string;
  formResponses?: Record<string, string | string[]>;
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
  checkInTime: string;
  scannedByOfficerId: string;
  scannedByOfficerName: string;
  remarks?: string;
}

export interface CertificateRecord {
  id: string;
  verificationCode: string;
  certificateType: CertificateType;
  recipientName: string;
  recipientIdentifier?: string;
  recipientEmail?: string;
  eventId: string;
  eventTitle: string;
  eventDescription?: string;
  registrationId?: string;
  awardTitle?: string;
  competitionTitle?: string;
  signatoryPosition?: string;
  signatoryName?: string;
  templateRef: string;
  status: CertificateStatus;
  issuedById?: string;
  issuedByName?: string;
  issuedAt: string;
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

// Form Builder Types
export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  required: boolean;
  options?: string[];       // for DROPDOWN, CHECKBOX, RADIO
  ratingScale?: number;     // for RATING (default 5)
  placeholder?: string;
}

export interface EventForm {
  id: string;
  eventId: string;
  formType: 'REGISTRATION' | 'EVALUATION';
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationResponse {
  id: string;
  eventId: string;
  studentId: string;
  studentName: string;
  responses: Record<string, string | number | string[]>;
  submittedAt: string;
}

// Judge Scoring Criteria
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
