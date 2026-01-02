import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// DTOs and entities
import { GoogleAuthDto } from '../types';
import { UserOrmEntity } from '@infrastructure/database/postgres/users/user.entity';

// Infrastructure services
import { GoogleOAuthService } from '@infrastructure/oauth/google/google-oauth.service';


@Injectable()
export class GoogleAuthService {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
    private readonly googleOAuthService: GoogleOAuthService,
  ) { }

  /**
   * Generate Google OAuth URL for frontend redirection
   */
  async getGoogleAuthUrl(): Promise<string> {
    try {
      const url = this.googleOAuthService.getAuthUrl();
      return url;
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate Google auth URL');
    }
  }

  /**
   * Handle Google OAuth callback with authorization code
   */
  async handleGoogleCallback(code: string) {
    try {
      // Exchange code for Google tokens
      const tokens = await this.googleOAuthService.getTokens(code);

      // Verify ID token and get user info
      const googleUser = await this.googleOAuthService.verifyIdToken(tokens.idToken);

      // Find or create user
      const user = await this._findOrCreateGoogleUser(googleUser);

      return this._generateUserResponse(user);
    } catch (error) {
      throw new BadRequestException(`Google authentication failed: ${error.message}`);
    }
  }

  /**
   * Authenticate with Google using ID token (for mobile apps)
   */
  async authWithGoogle(dto: GoogleAuthDto) {
    const { idToken } = dto;

    try {
      // Verify Google ID token
      const googleUser = await this.googleOAuthService.verifyIdToken(idToken);

      // Find or create user
      const user = await this._findOrCreateGoogleUser(googleUser);

      return this._generateUserResponse(user);
    } catch (error) {
      throw new BadRequestException(`Google authentication failed: ${error.message}`);
    }
  }

  /**
   * Link Google account to existing user account
   */
  async linkGoogleAccount(userId: string, dto: GoogleAuthDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.googleId) throw new BadRequestException('Google account already linked');

    // Verify Google token
    const googleUser = await this.googleOAuthService.verifyIdToken(dto.idToken);

    // Check if Google account is already linked to another user
    const existingUser = await this.userRepo.findOne({
      where: { googleId: googleUser.id }
    });
    if (existingUser) {
      throw new ConflictException('This Google account is already linked to another user');
    }

    // Link Google account to user
    user.googleId = googleUser.id;

    // Auto-verify email if Google email is verified
    if (!user.emailVerified && googleUser.verified_email) {
      user.emailVerified = true;
    }

    await this.userRepo.save(user);

    return {
      success: true,
      message: 'Google account linked successfully'
    };
  }

  /**
   * Unlink Google account from user
   */
  async unlinkGoogleAccount(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (!user.googleId) throw new BadRequestException('Google account not linked');

    // Ensure user has a password before unlinking
    if (!user.password) {
      throw new BadRequestException('Cannot unlink Google account. Please set a password first');
    }

    user.googleId = null;
    await this.userRepo.save(user);

    return {
      success: true,
      message: 'Google account unlinked successfully'
    };
  }

  /**
   * Find existing user or create new one from Google user info
   * @private Internal method for user lookup/creation
   */
  private async _findOrCreateGoogleUser(googleUser: any) {
    let user = await this.userRepo.findOne({
      where: [
        { googleId: googleUser.id },
        { email: googleUser.email }
      ]
    });

    if (!user) {
      // Create new user for Google registration
      user = this.userRepo.create({
        email: googleUser.email,
        googleId: googleUser.id,
        emailVerified: googleUser.verified_email,
        roles: [],
        regComplete: false,
        password: null,
      });
    } else {
      // Update Google ID if missing
      if (!user.googleId) user.googleId = googleUser.id;
    }

    return this.userRepo.save(user);
  }

  /**
   * Generate standardized user response
   * @private Internal response formatter
   */
  private _generateUserResponse(user: UserOrmEntity) {
    const { password, ...safeUser } = user;
    return { user: safeUser };
  }
}