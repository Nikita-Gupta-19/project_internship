import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email using Resend API
 * @param {string} to - Recipient email address
 * @param {string} otp - The 6-digit OTP code
 */
export const sendOtpEmail = async (to, otp) => {
  try {
    const data = await resend.emails.send({
      from: 'Project & Task Manager <onboarding@resend.dev>',
      to: [to],
      subject: 'Your Login Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #4F46E5; text-align: center;">Welcome back!</h2>
          <p style="font-size: 16px; color: #333;">Here is your 6-digit login code. It will expire in 10 minutes.</p>
          <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; text-align: center; margin: 25px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #111827;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #666; text-align: center;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `,
    });

    console.log(`[Email Sent via Resend] ${to} (ID: ${data.id})`);
    return true;
  } catch (error) {
    console.error('[Resend Error] Failed to send OTP:', error);
    throw error;
  }
};
