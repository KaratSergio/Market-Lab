import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Auth components
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthJwtConfig } from './config/auth-jwt.config';
import { AuthLocalStrategy } from './strategy/auth-local.strategy';
import { AuthJwtStrategy } from './strategy/auth-jwt.strategy';
import { EncryptModule } from './encrypt/encrypt.module';
import { TokensModule } from './tokens/token.module';

// Permissions
import { PermissionsService } from './permissions/permissions.service';
import { RolesGuard } from './guard/roles.guard';
import { PermissionsGuard } from './guard/permissions.guard';

// Infrastructure modules
import { MailModule } from '@infrastructure/mail/mail.module';
import { GoogleOAuthModule } from '@infrastructure/oauth/google/google-oauth.module';

// Infrastructure entities
import { UserOrmEntity } from '@infrastructure/database/postgres/users/user.entity';
import { AuthTokenOrmEntity } from '../infrastructure/database/postgres/users/token.entity';
import { CustomerProfileOrmEntity } from '@infrastructure/database/postgres/customers/customer.entity';
import { SupplierProfileOrmEntity } from '@infrastructure/database/postgres/suppliers/supplier.entity';

//! Test Controller
import { TestOAuthController } from '@infrastructure/oauth/google/test-oauth.controller';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    EncryptModule,
    MailModule,
    TokensModule,
    GoogleOAuthModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useClass: AuthJwtConfig,
    }),

    TypeOrmModule.forFeature([
      UserOrmEntity,
      AuthTokenOrmEntity,
      CustomerProfileOrmEntity,
      SupplierProfileOrmEntity
    ]),
  ],
  providers: [
    AuthService,
    AuthLocalStrategy,
    AuthJwtStrategy,
    PermissionsService,
    RolesGuard,
    PermissionsGuard,
    PermissionsService,
  ],
  controllers: [AuthController, TestOAuthController],
  exports: [
    AuthService,
    PermissionsService,
  ],
})
export class AuthModule { }