import { Injectable } from '@nestjs/common';
import { MailAdapter } from '@domain/notifications/types';
import { MailService } from './mail.service';

@Injectable()
export class SendinblueMailAdapter implements MailAdapter {
  constructor(private readonly mailService: MailService) { }

  async sendEmail(to: string, subject: string, htmlContent: string): Promise<void> {
    return this.mailService.sendEmail(to, subject, htmlContent);
  }

  async sendVerificationEmail(email: string, verificationLink: string): Promise<void> {
    return this.mailService.sendVerificationEmail(email, verificationLink);
  }

  async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
    return this.mailService.sendPasswordResetEmail(email, resetLink);
  }
}