import { NextResponse } from 'next/server';
import { getCertificates } from '@/lib/serverDataService';
import { generateCertificatePDF, CertType } from '@/lib/pdfGenerator';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Certificate ID is required' }, { status: 400 });
    }

    // Find cert from the data store
    const allCerts = await getCertificates();
    const cert = allCerts.find((c) => c.id === id || c.verificationCode === id);

    if (!cert) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    if (cert.status === 'REVOKED') {
      return NextResponse.json(
        { error: 'This certificate has been revoked and cannot be downloaded.' },
        { status: 403 }
      );
    }

    // Generate the PDF
    const pdfBytes = await generateCertificatePDF({
      verificationCode:  cert.verificationCode,
      recipientName:     cert.recipientName,
      studentId:         cert.recipientIdentifier,
      certificateType:   cert.certificateType as CertType,
      eventTitle:        cert.eventTitle,
      eventDescription:  cert.eventDescription,
      awardTitle:        cert.awardTitle,
      competitionTitle:  cert.competitionTitle,
      issuedAt:          cert.issuedAt,
      signatoryName:     cert.signatoryName || cert.issuedByName || 'Dr. Marjorie DF. San Juan',
      signatoryPosition: cert.signatoryPosition || 'Campus Director',
    });

    // Sanitize filename
    const safeRecipient = cert.recipientName
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .substring(0, 40);

    const typeLabel =
      cert.certificateType === 'RECOGNITION' || cert.certificateType === 'WINNER'
        ? 'Recognition'
        : cert.certificateType === 'APPRECIATION'
        ? 'Appreciation'
        : 'Participation';

    const filename = `URS_Certificate_of_${typeLabel}_${safeRecipient}_${cert.verificationCode}.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBytes.byteLength.toString(),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('[Certificate Download] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate certificate PDF' },
      { status: 500 }
    );
  }
}
