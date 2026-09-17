import { NextResponse } from 'next/server';
import { createPendingStudentAccount, createVerificationCode } from '@/lib/serverDataService';
import { sendVerificationEmail } from '@/lib/emailService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      studentName,
      studentNumber,
      email,
      course,
      yearLevel,
      section,
      yearSection,
      yearSectionCode,
      password,
      confirmPassword,
    } = body;

    // Validate passwords match
    if (!password || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Password and Confirm Password are required.' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match.' },
        { status: 400 }
      );
    }

    // Validate maximum character limits
    if (typeof studentNumber === 'string' && studentNumber.trim().length > 20) {
      return NextResponse.json(
        { success: false, message: 'Student Number cannot exceed 20 characters.' },
        { status: 400 }
      );
    }

    if (typeof studentName === 'string' && studentName.trim().length > 50) {
      return NextResponse.json(
        { success: false, message: 'Full Name cannot exceed 50 characters.' },
        { status: 400 }
      );
    }

    if (typeof email === 'string' && email.trim().length > 50) {
      return NextResponse.json(
        { success: false, message: 'Email cannot exceed 50 characters.' },
        { status: 400 }
      );
    }

    if (typeof password === 'string' && password.length > 30) {
      return NextResponse.json(
        { success: false, message: 'Password cannot exceed 30 characters.' },
        { status: 400 }
      );
    }

    if (typeof confirmPassword === 'string' && confirmPassword.length > 30) {
      return NextResponse.json(
        { success: false, message: 'Confirm Password cannot exceed 30 characters.' },
        { status: 400 }
      );
    }

    // Create pending account and reserve student number
    const result = await createPendingStudentAccount({
      studentName,
      studentNumber,
      email,
      course,
      yearLevel,
      section,
      yearSection,
      yearSectionCode,
      password,
    });

    if (!result.success || !result.student) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP code and send to student's email
    const code = await createVerificationCode(
      result.student.studentNumber,
      result.student.email,
      'SIGNUP'
    );

    // Send email
    const emailResult = await sendVerificationEmail(result.student.email, result.student.name, code);
    if (!emailResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: emailResult.error || "We couldn't send the verification code right now. Please try again.",
        },
        { status: 500 }
      );
    }

    // Mask email for privacy
    const [local, domain] = result.student.email.split('@');
    const maskedLocal = local.length > 2 ? `${local[0]}***${local[local.length - 1]}` : `${local[0]}***`;
    const maskedEmail = `${maskedLocal}@${domain}`;

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email. Please enter the 6-digit code to activate your account.',
      studentNumber: result.student.studentNumber,
      maskedEmail,
    });
  } catch (error: any) {
    console.error('Student sign up error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'An error occurred during student sign up.' },
      { status: 500 }
    );
  }
}
