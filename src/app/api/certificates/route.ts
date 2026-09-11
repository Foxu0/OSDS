import { NextResponse } from 'next/server';
import {
  getCertificates,
  issueParticipationCertificatesBatch,
  issueRecognitionCertificate,
  issueGuestSpeakerCertificate,
} from '@/lib/serverDataService';

export async function GET() {
  try {
    const certs = await getCertificates();
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

    // 2. Certificate of Recognition (Winner / Competition)
    if (action === 'WINNER_RECOGNITION') {
      const {
        eventId,
        recipientName,
        awardTitle,
        competitionTitle,
        recipientIdentifier,
        recipientEmail,
        officerId,
        officerName,
        signatoryPosition,
        eventDescription,
      } = body;

      if (!eventId || !recipientName || !awardTitle) {
        return NextResponse.json(
          { success: false, message: 'Event, Recipient Name, and Award Title are required' },
          { status: 400 }
        );
      }

      const cert = await issueRecognitionCertificate({
        eventId,
        recipientName,
        awardTitle,
        competitionTitle,
        recipientIdentifier,
        recipientEmail,
        officerId: officerId || 'staff-officer',
        officerName: officerName || 'Staff Officer',
        signatoryPosition,
        eventDescription,
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
