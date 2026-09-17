import { NextResponse } from 'next/server';
import { verifyCode, activateStudentAccount, getStudentByNumber } from '@/lib/serverDataService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentNumber, code } = body;

    if (!studentNumber || !code) {
      return NextResponse.json(
        { success: false, message: 'Student Number and 6-digit verification code are required.' },
        { status: 400 }
      );
    }

    // Verify OTP code
    const verification = await verifyCode(studentNumber, code, 'SIGNUP');
    if (!verification.valid) {
      return NextResponse.json(
        { success: false, message: verification.message },
        { status: 400 }
      );
    }

    // Activate Account
    const activated = await activateStudentAccount(studentNumber);
    if (!activated) {
      return NextResponse.json(
        { success: false, message: 'Could not activate account. Student record not found.' },
        { status: 404 }
      );
    }

    const student = await getStudentByNumber(studentNumber);

    return NextResponse.json({
      success: true,
      message: 'Account verified successfully! You can now sign in with your Student Number and Password.',
      studentNumber: student?.studentNumber || studentNumber,
    });
  } catch (error: any) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'An error occurred during verification.' },
      { status: 500 }
    );
  }
}
