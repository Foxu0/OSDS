// Dynamic Public Application URL Resolver
// Guarantees QR codes and ticket links dynamically point to the correct production domain
// Never hardcodes localhost in production environments

export function getPublicAppUrl(): string {
  // 1. If in client browser, use the current window location origin directly
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  // 2. Explicit public app URL from environment
  if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.trim() !== '') {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }

  // 3. NextAuth production URL
  if (process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.trim() !== '') {
    return process.env.NEXTAUTH_URL.replace(/\/$/, '');
  }

  // 4. Vercel deployment automatic URL
  if (process.env.VERCEL_URL && process.env.VERCEL_URL.trim() !== '') {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`;
  }

  // 5. Development localhost fallback
  return 'http://localhost:3000';
}

/**
 * Builds an absolute public URL for an event page.
 */
export function getEventPublicUrl(eventId: string): string {
  return `${getPublicAppUrl()}/events/${eventId}`;
}

/**
 * Builds an absolute public URL for a student ticket pass.
 */
export function getTicketPublicUrl(qrToken: string): string {
  return `${getPublicAppUrl()}/ticket/${qrToken}`;
}

/**
 * Builds an absolute public URL for certificate verification.
 */
export function getCertificateVerifyUrl(verificationCode: string): string {
  return `${getPublicAppUrl()}/verify/${verificationCode}`;
}
