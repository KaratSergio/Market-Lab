import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Auth service
import { TokenService } from '@auth/tokens/token.service';

// Domain repository
import { UserRepository } from '@domain/users/user.repository';

// Domain services
import { NotificationService } from '@domain/notifications/notification.service';


@Injectable()
export class EmailVerificationService {
  private readonly frontendUrl: string;

  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,

    private readonly tokenService: TokenService,
    private readonly mailService: NotificationService,
    private readonly config: ConfigService,
  ) {
    this.frontendUrl = this.config.get<string>('FRONTEND_URL')!;
  }

  /**
   * Send email verification link to user
   */
  async sendVerificationEmail(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

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

    // Update user's verification status using domain repository
    await this.userRepository.update(validation.userId!, {
      emailVerified: true,
      updatedAt: new Date()
    });

    // Mark token as used and clean up
    await this.tokenService.markTokenAsUsed(token);
    await this.tokenService.deleteUserTokens(validation.userId!, 'email_verification');

    return { success: true };
  }

  /**
   * Check if user's email is verified
   */
  async checkEmailVerification(userId: string): Promise<{ verified: boolean }> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    return { verified: user.emailVerified };
  }
}