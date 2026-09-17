import { NextResponse } from 'next/server';
import { getStudentByNumber, createVerificationCode } from '@/lib/serverDataService';
import { sendVerificationEmail, sendPasswordResetEmail } from '@/lib/emailService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentNumber, type = 'SIGNUP' } = body;

    if (!studentNumber) {
      return NextResponse.json(
        { success: false, message: 'Student Number is required.' },
        { status: 400 }
      );
    }

    const student = await getStudentByNumber(studentNumber);
    if (!student) {
      return NextResponse.json(
        { success: false, message: 'No student account found for this Student Number.' },
        { status: 404 }
      );
    }

    const codeType = type === 'PASSWORD_RESET' ? 'PASSWORD_RESET' : 'SIGNUP';
    const code = await createVerificationCode(student.studentNumber, student.email, codeType);

    const emailResult =
      codeType === 'PASSWORD_RESET'
        ? await sendPasswordResetEmail(student.email, student.name, code)
        : await sendVerificationEmail(student.email, student.name, code);

    if (!emailResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: emailResult.error || "We couldn't send the verification code right now. Please try again.",
        },
        { status: 500 }
      );
    }

    const [local, domain] = student.email.split('@');
    const maskedLocal = local.length > 2 ? `${local[0]}***${local[local.length - 1]}` : `${local[0]}***`;
    const maskedEmail = `${maskedLocal}@${domain}`;

    return NextResponse.json({
      success: true,
      message: `A new 6-digit code has been sent to ${maskedEmail}.`,
      maskedEmail,
    });
  } catch (error: any) {
    console.error('Resend code error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to resend code.' },
      { status: 500 }
    );
  }
}
