import { NextResponse } from 'next/server';
import { getStudentByNumber, createVerificationCode } from '@/lib/serverDataService';
import { sendPasswordResetEmail } from '@/lib/emailService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentNumber } = body;

    if (!studentNumber) {
      return NextResponse.json(
        { success: false, message: 'Student Number is required.' },
        { status: 400 }
      );
    }

    const student = await getStudentByNumber(studentNumber);
    if (!student) {
      return NextResponse.json(
        {
          success: false,
          message: 'No active student account found matching this Student Number. Please check and try again.',
        },
        { status: 404 }
      );
    }

    if (student.status === 'DEACTIVATED') {
      return NextResponse.json(
        {
          success: false,
          message: 'This account has been deactivated. Please contact campus administration.',
        },
        { status: 403 }
      );
    }

    // Generate 6-digit password reset code
    const code = await createVerificationCode(student.studentNumber, student.email, 'PASSWORD_RESET');

    // Send email
    const emailResult = await sendPasswordResetEmail(student.email, student.name, code);
    if (!emailResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: emailResult.error || "We couldn't send the verification code right now. Please try again.",
        },
        { status: 500 }
      );
    }

    // Mask email for student privacy
    const [local, domain] = student.email.split('@');
    const maskedLocal = local.length > 2 ? `${local[0]}***${local[local.length - 1]}` : `${local[0]}***`;
    const maskedEmail = `${maskedLocal}@${domain}`;

    return NextResponse.json({
      success: true,
      message: `A 6-digit reset code has been sent to your registered email (${maskedEmail}).`,
      studentNumber: student.studentNumber,
      maskedEmail,
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'An error occurred during password recovery.' },
      { status: 500 }
    );
  }
}
