import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthTokenOrmEntity } from '@infrastructure/database/postgres/users/token.entity';
import { PostgresTokenRepository } from '@infrastructure/database/postgres/users/token.repository';
import { TokenService } from './token.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuthTokenOrmEntity])],
  providers: [
    PostgresTokenRepository,
    {
      provide: 'TokenRepository',
      useClass: PostgresTokenRepository,
    },
    TokenService,
  ],
  exports: [
    TokenService,
    'TokenRepository',
    PostgresTokenRepository,
  ],
})
export class TokensModule { }