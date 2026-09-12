import { NextResponse } from 'next/server';
import {
  getCertificates,
  issueParticipationCertificatesBatch,
  issueRecognitionCertificate,
  issueGuestSpeakerCertificate,
} from '@/lib/serverDataService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');
    let certs = await getCertificates();
    if (eventId) {
      certs = certs.filter((c: any) => c.eventId === eventId);
    }
    return NextResponse.json(certs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch certificates' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    // 1. Batch Participation Certificates
    if (action === 'BATCH_PARTICIPATION') {
      const { eventId, officerId, officerName, signatoryPosition } = body;
      if (!eventId) {
        return NextResponse.json({ success: false, message: 'Event ID is required' }, { status: 400 });
      }
      const result = await issueParticipationCertificatesBatch(
        eventId,
        officerId || 'staff-officer',
        officerName || 'Staff Officer',
        signatoryPosition
      );
      return NextResponse.json(result);
    }

    // 2. Manual Certificate Issuance (Participation, Recognition, Appreciation, Winner)
    if (action === 'WINNER_RECOGNITION' || action === 'MANUAL_ISSUE') {
      const {
        eventId,
        recipientName,
        certificateType,
        awardTitle,
        competitionTitle,
        recipientIdentifier,
        recipientEmail,
        officerId,
        officerName,
        signatoryPosition,
        signatoryName,
        eventDescription,
      } = body;

      if (!eventId || !recipientName?.trim()) {
        return NextResponse.json(
          { success: false, message: 'Event and Recipient Name are required' },
          { status: 400 }
        );
      }

      const cert = await issueRecognitionCertificate({
        eventId,
        recipientName: recipientName.trim(),
        certificateType: certificateType || 'RECOGNITION',
        awardTitle: awardTitle?.trim() || '',
        competitionTitle,
        recipientIdentifier: recipientIdentifier || '',
        recipientEmail,
        officerId: officerId || 'staff-officer',
        officerName: officerName || 'Staff Officer',
        signatoryPosition: signatoryPosition?.trim() || 'Campus Director',
        signatoryName: signatoryName?.trim() || 'Dr. Marjorie DF. San Juan',
        eventDescription: eventDescription?.trim() || '',
      });

      return NextResponse.json({ success: true, certificate: cert });
    }

    // 3. Certificate of Appreciation (Guest Speaker / Facilitator)
    if (action === 'GUEST_SPEAKER_APPRECIATION') {
      const {
        eventId,
        speakerName,
        keynoteTopic,
        recipientRole,
        speakerEmail,
        officerId,
        officerName,
        signatoryPosition,
      } = body;

      if (!eventId || !speakerName || !keynoteTopic) {
        return NextResponse.json(
          { success: false, message: 'Event, Recipient Name, and Topic/Contribution are required' },
          { status: 400 }
        );
      }

      const cert = await issueGuestSpeakerCertificate({
        eventId,
        speakerName,
        keynoteTopic,
        recipientRole,
        speakerEmail,
        officerId: officerId || 'staff-officer',
        officerName: officerName || 'Staff Officer',
        signatoryPosition,
      });

      return NextResponse.json({ success: true, certificate: cert });
    }

    return NextResponse.json({ success: false, message: 'Invalid certificate action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error issuing certificate' },
      { status: 500 }
    );
  }
}
