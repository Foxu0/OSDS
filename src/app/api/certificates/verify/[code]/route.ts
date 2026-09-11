import { NextResponse } from 'next/server';
import { getCertificateByCode } from '@/lib/serverDataService';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const cert = await getCertificateByCode(code);
    if (!cert) {
      return NextResponse.json({ error: 'Certificate record not found in URS Registry' }, { status: 404 });
    }

    return NextResponse.json(cert);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server verification error' }, { status: 500 });
  }
}
