import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/serverDataService';

export async function POST(request: Request) {
  const body = await request.json();
  const { eventId, studentId, studentName, responses } = body;

  if (!eventId || !studentId || !responses) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  const db = getDb() as any;
  if (!db.evaluations) db.evaluations = [];

  // Check duplicate
  const existing = db.evaluations.find(
    (e: any) => e.eventId === eventId && e.studentId === studentId
  );
  if (existing) {
    return NextResponse.json({ error: 'You have already submitted an evaluation for this event.' }, { status: 409 });
  }

  const evaluation = {
    id: `eval-${Date.now()}`,
    eventId,
    studentId,
    studentName: studentName || 'Anonymous',
    responses,
    submittedAt: new Date().toISOString(),
  };

  db.evaluations.push(evaluation);

  // Automatically issue Certificate of Participation for evaluating the event
  if (!db.certificates) db.certificates = [];
  if (!db.events) db.events = [];
  const event = db.events.find((e: any) => e.id === eventId);

  // Find registration for student details if available
  const reg = (db.registrations || []).find(
    (r: any) =>
      r.eventId === eventId &&
      (r.studentId === studentId ||
        r.studentName?.toLowerCase() === (studentName || '').toLowerCase())
  );

  const studentNum = reg?.studentNumber || body.studentNumber || 'C2024-00001';
  const studentEmail = reg?.email || body.studentEmail || '';

  const alreadyHasCert = db.certificates.some(
    (c: any) =>
      c.eventId === eventId &&
      ((c.recipientIdentifier && c.recipientIdentifier === studentNum) ||
        (c.recipientName && c.recipientName.toLowerCase() === (studentName || '').toLowerCase())) &&
      c.certificateType === 'PARTICIPATION'
  );

  let newCert = null;
  if (!alreadyHasCert && event) {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const code = `URS-${new Date().getFullYear()}-PRT-${randomHex}`;
    const now = new Date().toISOString();
    newCert = {
      id: `cert-${Date.now()}-${randomHex}`,
      verificationCode: code,
      certificateType: 'PARTICIPATION',
      recipientName: studentName || 'Student Participant',
      recipientIdentifier: studentNum,
      recipientEmail: studentEmail,
      eventId: eventId,
      eventTitle: event.title,
      eventDescription: event.description || '',
      registrationId: reg?.id || '',
      signatoryPosition: 'Campus Director',
      templateRef: 'default_template.pdf',
      status: 'ISSUED',
      issuedByName: 'OSDS / Campus Office',
      issuedAt: now,
      createdAt: now,
    };
    db.certificates.push(newCert);
  }

  saveDb(db);

  return NextResponse.json({
    evaluation,
    certificateIssued: !!newCert,
    certificateCode: newCert?.verificationCode || null,
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');

  const db = getDb() as any;
  const evaluations = (db.evaluations || []).filter(
    (e: any) => !eventId || e.eventId === eventId
  );

  return NextResponse.json({ evaluations });
}
