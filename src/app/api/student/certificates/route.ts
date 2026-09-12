import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/serverDataService';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = session.user as any;
  const studentName = user?.name;
  const studentEmail = user?.email;
  const studentNumber = user?.studentNumber;

  const db = getDb() as any;
  const certificates = (db.certificates || []).filter((cert: any) => {
    if (cert.status === 'REVOKED') return false;
    return (
      (studentName && cert.recipientName?.toLowerCase() === studentName.toLowerCase()) ||
      (studentEmail && cert.recipientEmail?.toLowerCase() === studentEmail.toLowerCase()) ||
      (studentNumber && cert.recipientIdentifier?.toLowerCase() === studentNumber.toLowerCase())
    );
  });

  return NextResponse.json({ certificates });
}
