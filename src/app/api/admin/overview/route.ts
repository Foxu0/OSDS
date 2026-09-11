import { NextResponse } from 'next/server';
import { getAdminSystemOverview } from '@/lib/serverDataService';

export async function GET() {
  try {
    const metrics = await getAdminSystemOverview();
    return NextResponse.json(metrics);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch admin overview' }, { status: 500 });
  }
}
