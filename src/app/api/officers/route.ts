import { NextResponse } from 'next/server';
import { getOfficers, addOfficerAccount } from '@/lib/serverDataService';

export async function GET() {
  try {
    const officers = await getOfficers();
    return NextResponse.json(officers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch officers' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, department } = body;

    if (!name || !email || !department) {
      return NextResponse.json({ error: 'Name, email, and department are required' }, { status: 400 });
    }

    const officer = await addOfficerAccount({ name, email, department });
    return NextResponse.json(officer, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to add officer' }, { status: 500 });
  }
}
