import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getOrgOfficers, addOfficerAccount, toggleOfficerStatus } from '@/lib/serverDataService';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (role !== 'OSDS_OFFICER' && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. OSDS access required.' }, { status: 403 });
    }

    const orgOfficers = await getOrgOfficers();
    return NextResponse.json({ officers: orgOfficers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch Org officers' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (user?.role !== 'OSDS_OFFICER' && user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. OSDS access required.' }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, department, password } = body;

    if (!name || !email || !department) {
      return NextResponse.json({
        error: 'Officer Name, official email, and student organization name are required.'
      }, { status: 400 });
    }

    const newOfficer = await addOfficerAccount({
      name,
      email,
      department,
      role: 'ORG_OFFICER',
      password: password || 'password123',
      registeredById: user.id || 'osds',
    });

    return NextResponse.json({
      success: true,
      message: `Organization Officer ${newOfficer.name} (${newOfficer.department}) registered successfully.`,
      officer: newOfficer,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to register Org officer' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (role !== 'OSDS_OFFICER' && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. OSDS access required.' }, { status: 403 });
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
