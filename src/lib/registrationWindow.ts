// Strict QR Registration Window & Expiration Engine
// University of Rizal System – Cainta Campus
// All official times and checks use Asia/Manila and trusted server/database timestamps

import { CampusEvent, PublicRegistrationStatus } from '@/types';
import { formatManilaDateTime } from '@/lib/timezone';

export interface RegistrationStatusInfo {
  status: PublicRegistrationStatus;
  label: string;
  badgeClass: string;
  message: string;
  canRegister: boolean;
  opensAt: Date;
  closesAt: Date;
}

/**
 * Computes default 1-HOUR registration window based on Event start date.
 * Default: Opens 1 hour before event start, closes exactly when event starts.
 */
export function computeDefaultRegistrationWindow(startDateStr: string): {
  opensAt: string;
  closesAt: string;
} {
  const start = new Date(startDateStr);
  const opens = new Date(start.getTime() - 60 * 60 * 1000); // 1 hour prior
  return {
    opensAt: opens.toISOString(),
    closesAt: start.toISOString(),
  };
}

/**
 * Resolves the effective registration window dates for an event.
 * If not explicitly configured, gracefully defaults to the 1-hour window before startDate.
 */
export function getEffectiveRegistrationWindow(event: CampusEvent): {
  opensAt: Date;
  closesAt: Date;
} {
  const start = new Date(event.startDate);

  const opensAt = event.registrationOpensAt
    ? new Date(event.registrationOpensAt)
    : new Date(start.getTime() - 60 * 60 * 1000);

  const closesAt = event.registrationClosesAt
    ? new Date(event.registrationClosesAt)
    : start;

  return { opensAt, closesAt };
}

/**
 * Evaluates the strict registration status of an event against a given reference timestamp (defaults to current time).
 */
export function getEventRegistrationStatus(
  event: CampusEvent,
  referenceTime?: Date | string | number
): RegistrationStatusInfo {
  const now = referenceTime ? new Date(referenceTime) : new Date();
  const { opensAt, closesAt } = getEffectiveRegistrationWindow(event);

  // 1. Manually or administratively closed / cancelled
  if (event.registrationOpen === false || event.status === 'CANCELLED') {
    return {
      status: 'REGISTRATION CLOSED',
      label: 'Registration Closed',
      badgeClass: 'badge-admin',
      message: 'Registration has been officially closed for this event.',
      canRegister: false,
      opensAt,
      closesAt,
    };
  }

  // 2. Event is already completed
  if (event.status === 'COMPLETED') {
    return {
      status: 'REGISTRATION EXPIRED',
      label: 'Registration Expired',
      badgeClass: 'badge-admin',
      message: 'This event has concluded and registrations have expired.',
      canRegister: false,
      opensAt,
      closesAt,
    };
  }

  // 3. Before Registration Window
  if (now.getTime() < opensAt.getTime()) {
    return {
      status: 'REGISTRATION NOT YET OPEN',
      label: 'Registration Not Yet Open',
      badgeClass: 'badge-gold',
      message: `Registration opens on ${formatManilaDateTime(opensAt.toISOString())}.`,
      canRegister: false,
      opensAt,
      closesAt,
    };
  }

  // 4. Past Registration Window (EXPIRED)
  if (now.getTime() > closesAt.getTime()) {
    return {
      status: 'REGISTRATION EXPIRED',
      label: 'Registration Expired',
      badgeClass: 'badge-admin',
      message: 'This event registration period has expired.',
      canRegister: false,
      opensAt,
      closesAt,
    };
  }

  // 5. Within valid Registration Window (ACTIVE)
  return {
    status: 'OPEN FOR REGISTRATION',
    label: 'Open for Registration',
    badgeClass: 'badge-officer',
    message: `Registration is open until ${formatManilaDateTime(closesAt.toISOString())}.`,
    canRegister: true,
    opensAt,
    closesAt,
  };
}
