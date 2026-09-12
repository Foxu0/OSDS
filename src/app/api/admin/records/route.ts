import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import {
  getEvents,
  getRegistrations,
  getAttendanceLogs,
  getCertificates,
  getEvaluations,
  archiveRecord,
  unarchiveRecord,
  deleteRecord,
} from '@/lib/serverDataService';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'all'; // 'all' | 'active' | 'archived'
    const search = (searchParams.get('search') || '').toLowerCase().trim();

    const [events, registrations, attendances, certificates, evaluations] = await Promise.all([
      getEvents(),
      getRegistrations(),
      getAttendanceLogs(),
      getCertificates(),
      getEvaluations(),
    ]);

    // Compile each event with its sub-records (Registrations, Attendance Scans, Evaluations, Certificates)
    const compiledEvents = events.map((e) => {
      const eventRegs = registrations.filter((r) => r.eventId === e.id);
      const eventAtts = attendances.filter((a) => a.eventId === e.id);
      const eventEvals = evaluations.filter((ev: any) => ev.eventId === e.id);
      const eventCerts = certificates.filter((c) => c.eventId === e.id);
      const isArchived = !!((e as any).isArchived || (e.status as any) === 'ARCHIVED');

      return {
        id: e.id,
        recordType: 'EVENT' as const,
        title: e.title,
        description: e.description,
        venue: e.venue,
        startDate: e.startDate,
        endDate: e.endDate,
        status: isArchived ? 'ARCHIVED' : e.status,
        isArchived,
        createdAt: e.createdAt,
        createdById: e.createdById,
        registrations: eventRegs,
        attendances: eventAtts,
        evaluations: eventEvals,
        certificates: eventCerts,
        stats: {
          registrations: eventRegs.length,
          attendances: eventAtts.length,
          evaluations: eventEvals.length,
          certificates: eventCerts.length,
        },
        raw: e,
      };
    });

    let filteredEvents = [...compiledEvents];

    if (status === 'archived') {
      filteredEvents = filteredEvents.filter((e) => e.isArchived);
    } else if (status === 'active') {
      filteredEvents = filteredEvents.filter((e) => !e.isArchived);
    }

    if (search) {
      filteredEvents = filteredEvents.filter(
        (e) =>
          e.title.toLowerCase().includes(search) ||
          e.venue.toLowerCase().includes(search) ||
          e.id.toLowerCase().includes(search) ||
          (e.description && e.description.toLowerCase().includes(search))
      );
    }

    filteredEvents.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return NextResponse.json({
      events: filteredEvents,
      records: filteredEvents, // For backwards compatibility
      counts: {
        total: compiledEvents.length,
        events: compiledEvents.length,
        active: compiledEvents.filter((e) => !e.isArchived).length,
        archived: compiledEvents.filter((e) => e.isArchived).length,
        registrations: registrations.length,
        attendances: attendances.length,
        evaluations: evaluations.length,
        certificates: certificates.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch records' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { action, type, id } = await req.json();
    if (!type || !id) {
      return NextResponse.json({ error: 'Record type and ID are required.' }, { status: 400 });
    }

    const recordTypeLower = type.toLowerCase().replace(/s$/, '') as any;

    if (action === 'archive') {
      const success = await archiveRecord(recordTypeLower, id);
      return NextResponse.json({ success, message: 'Record archived successfully.' });
    } else if (action === 'unarchive') {
      const success = await unarchiveRecord(recordTypeLower, id);
      return NextResponse.json({ success, message: 'Record restored from archive.' });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update record archive status' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { type, id } = await req.json();
    if (!type || !id) {
      return NextResponse.json({ error: 'Record type and ID are required.' }, { status: 400 });
    }

    const recordTypeLower = type.toLowerCase().replace(/s$/, '') as any;
    const success = await deleteRecord(recordTypeLower, id);

    if (!success) {
      return NextResponse.json({ error: 'Record not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Record permanently deleted.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete record' }, { status: 500 });
  }
}
