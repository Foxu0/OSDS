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
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = (session.user as any)?.role;
  if (role !== 'OSDS_OFFICER' && role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only OSDS Officers can approve events.' }, { status: 403 });
  }

  const body = await request.json();
  const { action, reason, approvedById } = body;

  const db = getDb() as any;
  const eventIdx = db.events?.findIndex((e: any) => e.id === eventId);

  if (eventIdx === undefined || eventIdx < 0) {
    return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
  }

  const now = new Date().toISOString();

  if (action === 'APPROVE') {
    db.events[eventIdx] = {
      ...db.events[eventIdx],
      status: 'UPCOMING',
      approvedById: approvedById || (session.user as any)?.id,
      approvedAt: now,
      rejectionReason: null,
      updatedAt: now,
    };
  } else if (action === 'REJECT') {
    db.events[eventIdx] = {
      ...db.events[eventIdx],
      status: 'CANCELLED',
      rejectionReason: reason || 'Not approved by OSDS',
      updatedAt: now,
    };
  } else {
    return NextResponse.json({ error: 'Invalid action. Use APPROVE or REJECT.' }, { status: 400 });
  }

  saveDb(db);
  return NextResponse.json({ event: db.events[eventIdx] });
}
