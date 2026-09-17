import { Resend } from 'resend';

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Initializes the server-side Resend client.
 * Returns null if RESEND_API_KEY is not configured.
 */
function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey || apiKey === 'YOUR_RESEND_API_KEY') {
    return null;
  }
  return new Resend(apiKey);
}

/**
 * Resolves the verified sender email address for Resend.
 * Defaults to 'Paperless Campus <onboarding@resend.dev>' for initial testing/dev,
 * or the configured custom domain in RESEND_FROM_EMAIL.
 */
function getFromAddress(): string {
  const customFrom = process.env.RESEND_FROM_EMAIL?.trim();
  if (customFrom && customFrom !== 'YOUR_VERIFIED_SENDER') {
    return customFrom.includes('<') ? customFrom : `"Paperless Campus" <${customFrom}>`;
  }
  return 'Paperless Campus <onboarding@resend.dev>';
}

/**
 * Sends a 6-digit verification code to the student's email for account activation via Resend.
 */
export async function sendVerificationEmail(
  to: string,
  studentName: string,
  code: string
): Promise<EmailResult> {
  const recipientEmail = to.trim();
  const displayName = studentName?.trim() || 'Student';
  const from = getFromAddress();
  const subject = 'Verify your Paperless Campus account';

  const textBody = `Hello ${displayName},

Your Paperless Campus verification code is: ${code}

This code expires in 10 minutes. Please enter this code on the registration page to activate your student account.

Security Notice: Do not share this code with anyone. University staff and administrators will never ask for your verification code.

University of Rizal System – Cainta Campus
Office of Student Development Services (OSDS)`;

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 28px; border: 1px solid #E2E8F0; border-radius: 12px; background: #FFFFFF;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #1E3A8A; margin: 0 0 6px 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">University of Rizal System</h2>
        <p style="color: #64748B; font-size: 13px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Paperless Campus • Student Account Verification</p>
      </div>

      <div style="border-top: 1px solid #F1F5F9; margin-bottom: 20px;"></div>
      
      <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 12px 0;">Hello <strong>${displayName}</strong>,</p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">Thank you for registering for the Paperless Campus Portal. Please enter the 6-digit verification code below on the registration page to activate your student account:</p>
      
      <div style="text-align: center; margin: 28px 0;">
        <div style="display: inline-block; background: #EFF6FF; border: 2px dashed #2563EB; border-radius: 10px; padding: 14px 36px;">
          <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #1E3A8A; font-family: monospace;">${code}</span>
        </div>
      </div>
      
      <div style="background: #F8FAFC; border-left: 4px solid #3B82F6; padding: 12px 16px; border-radius: 6px; margin: 20px 0;">
        <p style="color: #1E40AF; font-size: 13px; line-height: 1.5; margin: 0; font-weight: 600;">
          ⏱️ This code expires in 10 minutes.
        </p>
        <p style="color: #64748B; font-size: 12px; line-height: 1.4; margin: 4px 0 0 0;">
          If you did not request this registration, you can safely ignore this email.
        </p>
      </div>

      <p style="color: #94A3B8; font-size: 12px; line-height: 1.5; margin: 20px 0 0 0;">
        🔒 <strong>Security Note:</strong> Never share your verification code with anyone.
      </p>
      
      <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0 16px 0;" />
      <p style="color: #94A3B8; font-size: 11px; text-align: center; margin: 0;">
        URS Cainta Campus • Office of Student Development Services (OSDS)
      </p>
    </div>
  `;

  const resend = getResendClient();

  if (!resend) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[emailService] ⚠️ [DEV MODE] RESEND_API_KEY is not configured in .env.local.');
      console.log(`[emailService] [DEV OTP SIMULATION] Verification code for ${recipientEmail}: >>> ${code} <<<`);
      return { success: true, messageId: `dev-sim-${Date.now()}` };
    }
    console.error('[emailService] ❌ Error: RESEND_API_KEY is not configured in production.');
    return {
      success: false,
      error: "We couldn't send the verification code right now. Please try again.",
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: [recipientEmail],
      subject,
      text: textBody,
      html: htmlBody,
    });

    if (error) {
      console.error('[emailService] Resend API response error:', error.message);
      return {
        success: false,
        error: "We couldn't send the verification code right now. Please try again.",
      };
    }

    console.log(`[emailService] Verification email sent to ${recipientEmail} (ID: ${data?.id})`);
    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error('[emailService] Resend delivery exception:', err?.message || 'Network error');
    return {
      success: false,
      error: "We couldn't send the verification code right now. Please try again.",
    };
  }
}

/**
 * Sends a 6-digit password reset code to the student's registered email via Resend.
 */
export async function sendPasswordResetEmail(
  to: string,
  studentName: string,
  code: string
): Promise<EmailResult> {
  const recipientEmail = to.trim();
  const displayName = studentName?.trim() || 'Student';
  const from = getFromAddress();
  const subject = `Password Reset Code: ${code} - Paperless Campus`;

  const textBody = `Hello ${displayName},

You requested a password reset for your Paperless Campus student account.

Your 6-digit password reset code is: ${code}

This code expires in 10 minutes. If you did not request a password reset, your account is secure and you can safely ignore this email.

Security Notice: Do not share this code with anyone.

University of Rizal System – Cainta Campus
Office of Student Development Services (OSDS)`;

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 28px; border: 1px solid #E2E8F0; border-radius: 12px; background: #FFFFFF;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #1E3A8A; margin: 0 0 6px 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">University of Rizal System</h2>
        <p style="color: #64748B; font-size: 13px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Paperless Campus • Password Recovery</p>
      </div>

      <div style="border-top: 1px solid #F1F5F9; margin-bottom: 20px;"></div>
      
      <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 12px 0;">Hello <strong>${displayName}</strong>,</p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">We received a request to reset the password for your student account. Use the 6-digit code below to set your new password:</p>
      
      <div style="text-align: center; margin: 28px 0;">
        <div style="display: inline-block; background: #FEF3C7; border: 2px dashed #D97706; border-radius: 10px; padding: 14px 36px;">
          <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #92400E; font-family: monospace;">${code}</span>
        </div>
      </div>
      
      <div style="background: #FFFBEB; border-left: 4px solid #F59E0B; padding: 12px 16px; border-radius: 6px; margin: 20px 0;">
        <p style="color: #B45309; font-size: 13px; line-height: 1.5; margin: 0; font-weight: 600;">
          ⏱️ This code expires in 10 minutes.
        </p>
        <p style="color: #78350F; font-size: 12px; line-height: 1.4; margin: 4px 0 0 0;">
          If you did not request a password reset, you can safely ignore this email. Your current password remains unchanged.
        </p>
      </div>

      <p style="color: #94A3B8; font-size: 12px; line-height: 1.5; margin: 20px 0 0 0;">
        🔒 <strong>Security Note:</strong> Never share this code with anyone.
      </p>
      
      <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0 16px 0;" />
      <p style="color: #94A3B8; font-size: 11px; text-align: center; margin: 0;">
        URS Cainta Campus • Office of Student Development Services (OSDS)
      </p>
    </div>
  `;

  const resend = getResendClient();

  if (!resend) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[emailService] ⚠️ [DEV MODE] RESEND_API_KEY is not configured in .env.local.');
      console.log(`[emailService] [DEV OTP SIMULATION] Reset code for ${recipientEmail}: >>> ${code} <<<`);
      return { success: true, messageId: `dev-sim-${Date.now()}` };
    }
    console.error('[emailService] ❌ Error: RESEND_API_KEY is not configured in production.');
    return {
      success: false,
      error: "We couldn't send the verification code right now. Please try again.",
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: [recipientEmail],
      subject,
      text: textBody,
      html: htmlBody,
    });

    if (error) {
      console.error('[emailService] Resend API response error:', error.message);
      return {
        success: false,
        error: "We couldn't send the verification code right now. Please try again.",
      };
    }

    console.log(`[emailService] Password reset email sent to ${recipientEmail} (ID: ${data?.id})`);
    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error('[emailService] Resend delivery exception:', err?.message || 'Network error');
    return {
      success: false,
      error: "We couldn't send the verification code right now. Please try again.",
    };
  }
}
