import { ConfigService } from '@nestjs/config';
import { Injectable, Inject } from '@nestjs/common';

// Domain repository
import { UserRepository } from '@domain/users/user.repository';

// Auth services
import { EncryptService } from '@auth/encrypt/encrypt.service';
import { TokenService } from '@auth/tokens/token.service';

// Domain services
import { NotificationService } from '@domain/notifications/notification.service';


@Injectable()
export class PasswordResetService {
  private readonly frontendUrl: string;

  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,

    private readonly tokenService: TokenService,
    private readonly mailService: NotificationService,
    private readonly encrypt: EncryptService,
    private readonly config: ConfigService,
  ) {
    this.frontendUrl = this.config.get<string>('FRONTEND_URL')!;
  }

  /**
   * Request password reset by sending email with reset link
   */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return; // Security: don't reveal if user exists

    // Generate password reset token (valid for 1 hour)
    const token = await this.tokenService.createToken(
      user.id,
      'password_reset',
      1
    );
    const resetLink = `${this.frontendUrl}/reset-password?token=${token}`;

    await this.mailService.sendPasswordResetEmail(email, resetLink);
  }

  /**
   * Reset password using token
   * @returns Success status and message
   */
  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; message?: string }> {
    // Validate the token
    const validation = await this.tokenService.validateToken(token, 'password_reset');

    if (!validation.valid) {
      return {
        success: false,
        message: validation.error || 'Invalid or expired token',
      };
    }

    // Hash the new password
    const passwordHash = await this.encrypt.hash(newPassword);

    // Update user's password using domain repository
    await this.userRepository.update(validation.userId!, {
      passwordHash: passwordHash,
      updatedAt: new Date()
    });

    // Mark token as used and clean up
    await this.tokenService.markTokenAsUsed(token);
    await this.tokenService.deleteUserTokens(validation.userId!, 'password_reset');

    // TODO: Invalidate all existing user sessions/tokens here
    // This would require a token blacklist or session management system

    return { success: true };
  }
}