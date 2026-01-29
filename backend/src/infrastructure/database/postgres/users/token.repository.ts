import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token, TokenRepository } from '@domain/users/types/token.type';
import { AuthTokenOrmEntity } from './token.entity';


@Injectable()
export class PostgresTokenRepository implements TokenRepository {
  constructor(
    @InjectRepository(AuthTokenOrmEntity)
    private readonly repository: Repository<AuthTokenOrmEntity>,
  ) { }

  async create(tokenData: Omit<Token, 'id' | 'createdAt'>): Promise<Token> {
    const entity = this.repository.create(tokenData);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findByToken(token: string): Promise<Token | null> {
    const entity = await this.repository.findOne({ where: { token } });
    return entity ? this.toDomain(entity) : null;
  }

  async markAsUsed(tokenId: string): Promise<void> {
    await this.repository.update(tokenId, { used: true });
  }

  async deleteExpired(): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
  }

  async deleteByUserId(userId: string, type?: string): Promise<void> {
    const query = this.repository
      .createQueryBuilder()
      .delete()
      .where('user_id = :userId', { userId });

    if (type) {
      query.andWhere('type = :type', { type });
    }

    await query.execute();
  }

  private toDomain(entity: AuthTokenOrmEntity): Token {
    return {
      id: entity.id,
      userId: entity.userId,
      type: entity.type,
      token: entity.token,
      used: entity.used,
      expiresAt: entity.expiresAt,
      createdAt: entity.createdAt,
    };
  }
}