import { Injectable, Inject } from '@nestjs/common';
import { Notifications, type MailAdapter } from './types';


@Injectable()
export class NotificationService implements Notifications {
  constructor(
    @Inject('MailAdapter')
    private readonly mailAdapter: MailAdapter,
  ) { }

  async sendVerificationEmail(email: string, verificationLink: string): Promise<void> {
    await this.mailAdapter.sendVerificationEmail(email, verificationLink);
  }

  async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
    await this.mailAdapter.sendPasswordResetEmail(email, resetLink);
  }

  // async sendSms(phone: string, message: string): Promise<void> { ... }
}