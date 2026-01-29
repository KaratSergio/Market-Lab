export interface MailAdapter {
  sendEmail(to: string, subject: string, htmlContent: string): Promise<void>;
  sendVerificationEmail(email: string, verificationLink: string): Promise<void>;
  sendPasswordResetEmail(email: string, resetLink: string): Promise<void>;
}

export interface Notifications {
  sendVerificationEmail(email: string, verificationLink: string): Promise<void>;
  sendPasswordResetEmail(email: string, resetLink: string): Promise<void>;
}