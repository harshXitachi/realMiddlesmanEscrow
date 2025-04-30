import { MailService } from '@sendgrid/mail';
import { nanoid } from 'nanoid';

// Set up SendGrid
const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY!);

// Sender email address
// TODO: After verifying this email in SendGrid, update to your business email or noreply@middlesman.com
const SENDER_EMAIL = '2023bcacsbharsh13944@poornima.edu.in'; // Replace with your email address that you can verify

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

// Send email helper function using SendGrid
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await mailService.send({
      to: options.to,
      from: SENDER_EMAIL,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

// Generate verification code
export function generateVerificationCode(): string {
  return nanoid(6).toUpperCase();
}

// Send verification email
export async function sendVerificationEmail(email: string, code: string, username: string): Promise<boolean> {
  const subject = 'Verify Your Middlesman Account';
  const text = `Hi ${username},
  
Please verify your Middlesman account by entering the following code:

${code}

This code will expire in 1 hour.

Thanks,
The Middlesman Team`;

  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(to right, #1A2980, #26D0CE); padding: 20px; color: white; text-align: center; border-radius: 5px 5px 0 0;">
      <h1 style="margin: 0;">Verify Your Middlesman Account</h1>
    </div>
    <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 5px 5px;">
      <p>Hi ${username},</p>
      <p>Please verify your Middlesman account by entering the following code:</p>
      <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px;">
        ${code}
      </div>
      <p>This code will expire in 1 hour.</p>
      <p>Thanks,<br>The Middlesman Team</p>
    </div>
  </div>
  `;

  return await sendEmail({ to: email, subject, text, html });
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, code: string, username: string): Promise<boolean> {
  const subject = 'Reset Your Middlesman Password';
  const text = `Hi ${username},
  
You've requested to reset your password. Please use the following code to reset your password:

${code}

This code will expire in 1 hour.

If you didn't request this, you can safely ignore this email.

Thanks,
The Middlesman Team`;

  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(to right, #1A2980, #26D0CE); padding: 20px; color: white; text-align: center; border-radius: 5px 5px 0 0;">
      <h1 style="margin: 0;">Reset Your Middlesman Password</h1>
    </div>
    <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 5px 5px;">
      <p>Hi ${username},</p>
      <p>You've requested to reset your password. Please use the following code to reset your password:</p>
      <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px;">
        ${code}
      </div>
      <p>This code will expire in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p>Thanks,<br>The Middlesman Team</p>
    </div>
  </div>
  `;

  return await sendEmail({ to: email, subject, text, html });
}