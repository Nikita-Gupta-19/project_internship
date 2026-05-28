import nodemailer from 'nodemailer';

/**
 * Send an email using Gmail SMTP
 * @param {string} to - Recipient email address
 * @param {string} otp - The 6-digit OTP code
 */
export const sendOtpEmail = async (to, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Project & Task Manager" <${process.env.EMAIL_USER}>`,
      to,
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
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Sent] ${to} (Message ID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error('[Email Error] Failed to send OTP:', error);
    throw error;
  }
};
