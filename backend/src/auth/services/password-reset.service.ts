import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

// Entities
import { UserOrmEntity } from '@infrastructure/database/postgres/users/user.entity';

// Infrastructure services
import { EncryptService } from '../encrypt/encrypt.service';
import { TokenService } from '../tokens/token.service';
import { MailService } from '@infrastructure/mail/mail.service';


@Injectable()
export class PasswordResetService {
  private readonly frontendUrl: string;

  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
    private readonly encrypt: EncryptService,
    private readonly config: ConfigService,
  ) {
    this.frontendUrl = this.config.get<string>('FRONTEND_URL')!;
  }

  /**
   * Request password reset by sending email with reset link
   */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { email } });
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

    // Update user's password
    await this.userRepo.update(validation.userId!, { password: passwordHash });

    // Mark token as used and clean up
    await this.tokenService.markTokenAsUsed(token);
    await this.tokenService.deleteUserTokens(validation.userId!, 'password_reset');

    // TODO: Invalidate all existing user sessions/tokens here
    // This would require a token blacklist or session management system

    return { success: true };
  }
}