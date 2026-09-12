import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/serverDataService';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const { searchParams } = new URL(request.url);
  const formType = searchParams.get('type');

  const db = getDb();
  const forms = (db as any).forms || [];
  const form = forms.find(
    (f: any) => f.eventId === eventId && (!formType || f.formType === formType)
  );

  return NextResponse.json({ form: form || null });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const body = await request.json();
  const { formType, fields } = body;

  const db = getDb() as any;
  if (!db.forms) db.forms = [];

  const existingIdx = db.forms.findIndex(
    (f: any) => f.eventId === eventId && f.formType === formType
  );

  const now = new Date().toISOString();
  const formData = {
    id: existingIdx >= 0 ? db.forms[existingIdx].id : `form-${Date.now()}`,
    eventId,
    formType,
    fields,
    createdAt: existingIdx >= 0 ? db.forms[existingIdx].createdAt : now,
    updatedAt: now,
  };

  if (existingIdx >= 0) {
    db.forms[existingIdx] = formData;
  } else {
    db.forms.push(formData);
  }

  saveDb(db);
  return NextResponse.json({ form: formData });
}
