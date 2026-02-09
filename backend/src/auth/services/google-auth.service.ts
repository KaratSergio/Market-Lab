import {
  BadRequestException, ConflictException,
  Injectable, InternalServerErrorException,
  NotFoundException, Inject,
} from '@nestjs/common';

// Domain interfaces and entity
import { UserRepository } from '@domain/users/user.repository';
import { type OAuthAdapter } from '@domain/users/types/oauth.type';
import { UserDomainEntity } from '@domain/users/user.entity';
import { USER_STATUS, OAuthUser } from '@domain/users/types';
import { GoogleAuthDto } from '../types';

@Injectable()
export class GoogleAuthService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,

    @Inject('OAuthAdapter')
    private readonly oauthAdapter: OAuthAdapter,
  ) { }

  async getGoogleAuthUrl(): Promise<string> {
    try {
      return await this.oauthAdapter.getAuthUrl();
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate Google auth URL');
    }
  }

  async handleGoogleCallback(code: string) {
    try {
      const tokens = await this.oauthAdapter.getTokens(code);
      const oauthUser = await this.oauthAdapter.verifyIdToken(tokens.idToken);
      const user = await this._findOrCreateGoogleUser(oauthUser);
      return this._generateUserResponse(user);
    } catch (error) {
      throw new BadRequestException(`Google authentication failed: ${error.message}`);
    }
  }

  async authWithGoogle(dto: GoogleAuthDto) {
    const { idToken } = dto;

    try {
      const oauthUser = await this.oauthAdapter.verifyIdToken(idToken);
      const user = await this._findOrCreateGoogleUser(oauthUser);
      return this._generateUserResponse(user);
    } catch (error) {
      throw new BadRequestException(`Google authentication failed: ${error.message}`);
    }
  }

  async linkGoogleAccount(userId: string, dto: GoogleAuthDto) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (user.googleId) throw new ConflictException('Google account is already linked to this user');
    const oauthUser = await this.oauthAdapter.verifyIdToken(dto.idToken);
    const existingUser = await this.userRepository.findByGoogleId(oauthUser.id);
    if (existingUser) throw new ConflictException('This Google account is already linked to another user');

    await this.userRepository.update(userId, {
      googleId: oauthUser.id,
      emailVerified: !user.emailVerified && oauthUser.verified_email ? true : user.emailVerified,
      updatedAt: new Date(),
    });

    return {
      success: true,
      message: 'Google account linked successfully'
    };
  }

  async unlinkGoogleAccount(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (!user.passwordHash) throw new BadRequestException('Cannot unlink Google account. User must have a password set');
    if (!user.googleId) throw new BadRequestException('Google account is not linked to this user');

    await this.userRepository.update(userId, {
      googleId: undefined,
      updatedAt: new Date(),
    });

    return {
      success: true,
      message: 'Google account unlinked successfully'
    };
  }

  private async _findOrCreateGoogleUser(oauthUser: OAuthUser): Promise<UserDomainEntity> {
    let user = await this.userRepository.findByGoogleId(oauthUser.id);
    if (!user) user = await this.userRepository.findByEmail(oauthUser.email);

    if (!user) {
      user = new UserDomainEntity(
        '', // ID
        oauthUser.email,
        null, // passwordHash
        [], // user role user will choose later
        USER_STATUS.ACTIVE,
        oauthUser.verified_email,
        false, // regComplete
        oauthUser.id, // googleId
        undefined, // lastLoginAt
        new Date(), // createdAt
        new Date(), // updatedAt
      );

      user = await this.userRepository.create(user);
      return user;
    }

    if (!user.googleId) {
      await this.userRepository.update(user.id, {
        googleId: oauthUser.id,
        emailVerified: !user.emailVerified && oauthUser.verified_email ? true : user.emailVerified,
        updatedAt: new Date(),
      });
    }

    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    });

    const updatedUser = await this.userRepository.findById(user.id);
    if (!updatedUser) throw new InternalServerErrorException('Failed to retrieve updated user');
    return updatedUser;
  }

  private _generateUserResponse(user: UserDomainEntity) {
    const { passwordHash, ...safeUser } = user;
    return { user: safeUser };
  }
}