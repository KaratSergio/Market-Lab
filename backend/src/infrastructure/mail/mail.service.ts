import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly apiKey: string;
  private readonly sender = {
    name: 'Greenly',
    email: 'safonov.json@gmail.com',
  };

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('SENDINBLUE_KEY')!;
  }

  async sendEmail(to: string, subject: string, htmlContent: string): Promise<void> {
    const body = {
      sender: this.sender,
      to: [{ email: to }],
      subject,
      htmlContent,
      // headers: { 'X-Mailin-custom': 'test_account' }
    };

    try {
      const res = await fetch('https://api.sendinblue.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('[MailService] Failed to send email:', errorText);
        throw new Error(`Sendinblue API error: ${res.status}`);
      }

      console.log(`[MailService] Email sent to ${to}`);
    } catch (err) {
      console.error('[MailService] Error:', err);
      throw err;
    }
  }

  async sendVerificationEmail(email: string, verificationLink: string): Promise<void> {
    const subject = 'Verify your email address';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Email Verification</h2>
        <p>Hello!</p>
        <p>Please verify your email address by clicking the link below:</p>
        <p>
          <a href="${verificationLink}" 
            style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Verify Email Address
          </a>
        </p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `;

    await this.sendEmail(email, subject, htmlContent);
  }

  async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
    const subject = 'Reset your password';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset</h2>
        <p>Hello!</p>
        <p>You requested to reset your password. Click the link below to proceed:</p>
        <p>
          <a href="${resetLink}" 
            style="background-color: #f44336; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
      </div>
    `;

    await this.sendEmail(email, subject, htmlContent);
  }
}