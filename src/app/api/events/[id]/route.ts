import { NextResponse } from 'next/server';
import { getEventById, updateEvent, getCompetitionWinners } from '@/lib/serverDataService';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await getEventById(id);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    const winners = await getCompetitionWinners(id);
    // Return event as top-level AND nested for compatibility with both consumers
    return NextResponse.json({ ...event, winners, event });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch event' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await updateEvent(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json({ ...updated, event: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update event' }, { status: 500 });
  }
}
