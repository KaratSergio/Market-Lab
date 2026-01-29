import { Injectable, Inject } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { type TokenRepository } from '@domain/users/types/token.type';

type TokenType = 'email_verification' | 'password_reset';

@Injectable()
export class TokenService {
  constructor(
    @Inject('TokenRepository')
    private readonly tokenRepository: TokenRepository,
  ) { }

  async createToken(
    userId: string,
    type: TokenType,
    ttlHours: number = 24,
  ): Promise<string> {
    await this.tokenRepository.deleteByUserId(userId, type);
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

    await this.tokenRepository.create({
      userId,
      type,
      token,
      expiresAt,
      used: false,
    });

    return token;
  }

  async validateToken(
    token: string,
    type: TokenType,
  ): Promise<{ valid: boolean; userId?: string; error?: string }> {
    const tokenEntity = await this.tokenRepository.findByToken(token);

    if (!tokenEntity) return { valid: false, error: 'Token not found' };
    if (tokenEntity.used) return { valid: false, error: 'Token already used' };
    if (new Date() > tokenEntity.expiresAt) return { valid: false, error: 'Token expired' };
    if (tokenEntity.type !== type) return { valid: false, error: 'Invalid token type' };

    return { valid: true, userId: tokenEntity.userId };
  }

  async markTokenAsUsed(token: string): Promise<void> {
    const tokenEntity = await this.tokenRepository.findByToken(token);
    if (tokenEntity) {
      await this.tokenRepository.markAsUsed(tokenEntity.id);
    }
  }

  async deleteUserTokens(userId: string, type?: TokenType): Promise<void> {
    await this.tokenRepository.deleteByUserId(userId, type);
  }
}