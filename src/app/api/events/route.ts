import { NextResponse } from 'next/server';
import { getEvents, createEvent } from '@/lib/serverDataService';

export async function GET() {
  try {
    const events = await getEvents();
    return NextResponse.json(events);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title || !body.venue || !body.startDate || !body.endDate) {
      return NextResponse.json({ error: 'Missing required event fields' }, { status: 400 });
    }
    const event = await createEvent(body);
    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create event' }, { status: 500 });
  }
}
