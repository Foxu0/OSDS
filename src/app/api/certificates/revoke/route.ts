import { NextResponse } from 'next/server';
import { revokeCertificate } from '@/lib/serverDataService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { certId, reason } = body;

    if (!certId || !reason) {
      return NextResponse.json(
        { success: false, message: 'Certificate identifier and official reason are required.' },
        { status: 400 }
      );
    }

    const result = await revokeCertificate(certId, reason);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to revoke certificate' },
      { status: 500 }
    );
  }
}
