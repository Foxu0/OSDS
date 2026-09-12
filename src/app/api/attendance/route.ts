import { NextResponse } from 'next/server';
import { processQRScan, getAttendanceLogs } from '@/lib/serverDataService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { qrToken, officerId, officerName, eventId } = body;

    if (!qrToken) {
      return NextResponse.json({ success: false, message: 'QR Token or Student ID is required.' }, { status: 400 });
    }

    const result = await processQRScan(
      qrToken,
      officerId || 'demo-officer-1',
      officerName || 'Staff Officer',
      eventId || undefined
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error processing scan.' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId') || undefined;
    const logs = await getAttendanceLogs(eventId);
    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch attendance logs' }, { status: 500 });
  }
}
