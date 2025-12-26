import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';

// Entities
import { UserOrmEntity } from '@infrastructure/database/postgres/users/user.entity';

// Infrastructure services
import { TokenService } from '../tokens/token.service';
import { MailService } from '@infrastructure/mail/mail.service';


@Injectable()
export class EmailVerificationService {
  private readonly frontendUrl: string;

  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {
    this.frontendUrl = this.config.get<string>('FRONTEND_URL')!;
  }

  /**
   * Send email verification link to user
   */
  async sendVerificationEmail(email: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { email } });

    // Don't send if user doesn't exist or already verified
    if (!user || user.emailVerified) return;

    const token = await this.tokenService.createToken(
      user.id,
      'email_verification',
      24 // 24 hours validity
    );
    const verificationLink = `${this.frontendUrl}/auth/verify-email?token=${token}`;

    await this.mailService.sendVerificationEmail(email, verificationLink);
  }

  /**
   * Verify email using token
   * @returns Success status and message
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message?: string }> {
    // Validate the token
    const validation = await this.tokenService.validateToken(token, 'email_verification');

    if (!validation.valid) {
      return {
        success: false,
        message: validation.error || 'Invalid or expired token',
      };
    }

    // Update user's verification status
    await this.userRepo.update(validation.userId!, { emailVerified: true });

    // Mark token as used and clean up
    await this.tokenService.markTokenAsUsed(token);
    await this.tokenService.deleteUserTokens(validation.userId!, 'email_verification');

    return { success: true };
  }

  /**
   * Check if user's email is verified
   */
  async checkEmailVerification(userId: string): Promise<{ verified: boolean }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return { verified: user.emailVerified };
  }
}