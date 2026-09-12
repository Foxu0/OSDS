import { NextResponse } from 'next/server';
import { registerStudentForEvent, getRegistrationsForEvent } from '@/lib/serverDataService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      eventId,
      studentName,
      studentNumber,
      email,
      course,
      department,
      yearLevel,
      section,
      yearSection,
    } = body;

    if (!eventId || !studentName || !studentNumber) {
      return NextResponse.json(
        { success: false, message: 'Event ID, Full Name, and Student ID are required.' },
        { status: 400 }
      );
    }

    // Strict server-side registration validation and timestamp/token generation
    const result = await registerStudentForEvent({
      eventId,
      studentName,
      studentNumber,
      email,
      course: course || department,
      department: course || department,
      yearLevel,
      section,
      yearSection,
    });

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error during registration.' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');
    if (!eventId) {
      return NextResponse.json({ error: 'eventId query parameter is required' }, { status: 400 });
    }

    const registrations = await getRegistrationsForEvent(eventId);
    return NextResponse.json({ registrations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch registrations' }, { status: 500 });
  }
}
