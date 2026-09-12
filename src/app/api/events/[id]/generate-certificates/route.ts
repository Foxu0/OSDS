import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDb, saveDb } from '@/lib/serverDataService';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  const officerId = user?.id || 'officer-system';
  const officerName = user?.name || 'Campus Event Office';

  const db = getDb() as any;
  if (!db.certificates) db.certificates = [];
  if (!db.events) db.events = [];
  if (!db.registrations) db.registrations = [];

  const event = db.events.find((e: any) => e.id === eventId);
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  // Get participants registered for this event
  const registrations = db.registrations.filter((r: any) => r.eventId === eventId);

  // Get facilitators
  let bodyFacilitators: any[] = [];
  try {
    const body = await request.json();
    if (Array.isArray(body.facilitators)) bodyFacilitators = body.facilitators;
  } catch {
    // Body is optional
  }

  const facilitators = bodyFacilitators.length > 0 ? bodyFacilitators : (event.facilitators || []);

  let createdCount = 0;
  const now = new Date().toISOString();
  const year = new Date().getFullYear();

  // 1. Generate PARTICIPATION certificates for participants
  for (const reg of registrations) {
    const alreadyExists = db.certificates.some(
      (c: any) =>
        c.eventId === eventId &&
        ((c.recipientIdentifier && c.recipientIdentifier === reg.studentNumber) ||
          (c.recipientName && c.recipientName.toLowerCase() === reg.studentName?.toLowerCase())) &&
        c.certificateType === 'PARTICIPATION'
    );

    if (!alreadyExists) {
      const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
      const code = `URS-${year}-PRT-${randomHex}`;
      const newCert = {
        id: `cert-${Date.now()}-${randomHex}`,
        verificationCode: code,
        certificateType: 'PARTICIPATION',
        recipientName: reg.studentName,
        recipientIdentifier: reg.studentNumber,
        recipientEmail: reg.email || '',
        eventId: event.id,
        eventTitle: event.title,
        eventDescription: event.description || '',
        registrationId: reg.id,
        signatoryPosition: 'Campus Director',
        templateRef: 'default_template.pdf',
        status: 'ISSUED',
        issuedById: officerId,
        issuedByName: officerName,
        issuedAt: now,
        createdAt: now,
      };
      db.certificates.push(newCert);
      createdCount++;
    }
  }

  // 2. Generate APPRECIATION certificates for facilitators / speakers
  for (const item of facilitators) {
    const name = typeof item === 'string' ? item.trim() : (item.name || '').trim();
    const role = typeof item === 'string' ? 'Facilitator' : (item.role || 'Facilitator').trim();
    if (!name) continue;

    const alreadyExists = db.certificates.some(
      (c: any) =>
        c.eventId === eventId &&
        c.recipientName &&
        c.recipientName.toLowerCase() === name.toLowerCase() &&
        c.certificateType === 'APPRECIATION'
    );

    if (!alreadyExists) {
      const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
      const code = `URS-${year}-APR-${randomHex}`;
      const newCert = {
        id: `cert-${Date.now()}-${randomHex}`,
        verificationCode: code,
        certificateType: 'APPRECIATION',
        recipientName: name,
        recipientIdentifier: role,
        eventId: event.id,
        eventTitle: event.title,
        awardTitle: `${role} — ${event.title}`,
        eventDescription: event.description || '',
        signatoryPosition: 'Campus Director',
        templateRef: 'default_template.pdf',
        status: 'ISSUED',
        issuedById: officerId,
        issuedByName: officerName,
        issuedAt: now,
        createdAt: now,
      };
      db.certificates.push(newCert);
      createdCount++;
    }
  }

  saveDb(db);

  return NextResponse.json({
    success: true,
    count: createdCount,
    message: createdCount > 0
      ? `Generated ${createdCount} E-Certificate(s) for event participants and facilitators.`
      : 'All participants and facilitators already have E-Certificates issued.',
  });
}
