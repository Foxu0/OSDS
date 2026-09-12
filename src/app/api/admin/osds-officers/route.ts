import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getOsdsOfficers, addOfficerAccount, toggleOfficerStatus, deleteRecord } from '@/lib/serverDataService';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const osdsOfficers = await getOsdsOfficers();
    return NextResponse.json({ officers: osdsOfficers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch OSDS officers' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, department, password } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and official email are required.' }, { status: 400 });
    }

    const newOfficer = await addOfficerAccount({
      name,
      email,
      department: department || 'Office of Student Development Services (OSDS)',
      role: 'OSDS_OFFICER',
      password: password || 'password123',
      registeredById: user.id || 'admin',
    });

    return NextResponse.json({
      success: true,
      message: `OSDS Officer ${newOfficer.name} registered successfully.`,
      officer: newOfficer,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to register OSDS officer' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Officer ID is required.' }, { status: 400 });
    }

    const updated = await toggleOfficerStatus(id);
    if (!updated) {
      return NextResponse.json({ error: 'Officer not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, officer: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update officer status' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Officer ID is required.' }, { status: 400 });
    }

    const deleted = await deleteRecord('officer', id);
    if (!deleted) {
      return NextResponse.json({ error: 'Officer not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'OSDS officer removed successfully.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to remove officer' }, { status: 500 });
  }
}
