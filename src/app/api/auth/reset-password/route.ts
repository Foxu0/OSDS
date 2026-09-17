import { NextResponse } from 'next/server';
import { verifyCode, resetStudentPassword, getStudentByNumber } from '@/lib/serverDataService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentNumber, code, newPassword, confirmPassword } = body;

    if (!studentNumber || !code || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'All fields are required.' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'New passwords do not match.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // Verify OTP Code
    const verification = await verifyCode(studentNumber, code, 'PASSWORD_RESET');
    if (!verification.valid) {
      return NextResponse.json(
        { success: false, message: verification.message },
        { status: 400 }
      );
    }

    // Reset password while preserving all student records, registrations, attendance, and certificates
    const result = await resetStudentPassword(studentNumber, newPassword);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    const student = await getStudentByNumber(studentNumber);

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully! You can now log in using your Student Number and new password.',
      studentNumber: student?.studentNumber || studentNumber,
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'An error occurred during password reset.' },
      { status: 500 }
    );
  }
}
