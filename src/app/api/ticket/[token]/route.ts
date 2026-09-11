import { NextResponse } from 'next/server';
import { getRegistrationByToken } from '@/lib/serverDataService';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const ticketData = await getRegistrationByToken(token);
    if (!ticketData) {
      return NextResponse.json({ error: 'Personal Attendance Ticket not found' }, { status: 404 });
    }

    return NextResponse.json(ticketData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
