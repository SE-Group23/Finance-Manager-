// utils/emailService.ts
import nodemailer from 'nodemailer';

// Create a transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Boolean(process.env.EMAIL_SECURE), // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  resetToken: string;
  userId: string | number;
}

export const sendPasswordResetEmail = async ({ to, resetToken, userId }: EmailOptions): Promise<boolean> => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${userId}/${resetToken}`;
  
  try {
    await transporter.sendMail({
      from: `"Your App Name" <${process.env.EMAIL_FROM}>`,
      to,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset</h1>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <a href="${resetUrl}" target="_blank">Reset Password</a>
        <p>The link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
    
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};