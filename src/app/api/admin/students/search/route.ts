import { NextResponse } from 'next/server';
import { searchStudentRecords } from '@/lib/serverDataService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    if (!query) {
      return NextResponse.json([]);
    }

    const results = await searchStudentRecords(query);
    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Search error' }, { status: 500 });
  }
}
