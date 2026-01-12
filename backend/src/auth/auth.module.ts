import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Main auth components
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';

// Subservices
import { RegistrationService } from './services/registration.service';
import { EmailVerificationService } from './services/email-verification.service';
import { PasswordResetService } from './services/password-reset.service';
import { GoogleAuthService } from './services/google-auth.service';
import { UserService } from './services/user.service';

// Auth strategies and guards
import { AuthJwtConfig } from './config/auth-jwt.config';
import { AuthLocalStrategy } from './strategy/auth-local.strategy';
import { AuthJwtStrategy } from './strategy/auth-jwt.strategy';
import { EncryptModule } from './encrypt/encrypt.module';
import { TokensModule } from './tokens/token.module';
import { RolesGuard } from './guard/roles.guard';
import { PermissionsGuard } from './guard/permissions.guard';
import { PermissionsService } from './services/permissions.service';

// Infrastructure modules
import { MailModule } from '@infrastructure/mail/mail.module';
import { GoogleOAuthModule } from '@infrastructure/oauth/google/google-oauth.module';
import { S3StorageModule } from '@infrastructure/storage/s3-storage.module';
import { S3DocumentStorageAdapter } from '@infrastructure/storage/s3-document-storage.adapter';

// Database entities
import { UserOrmEntity } from '@infrastructure/database/postgres/users/user.entity';
import { AuthTokenOrmEntity } from '@infrastructure/database/postgres/users/token.entity';
import { CustomerProfileOrmEntity } from '@infrastructure/database/postgres/customers/customer.entity';
import { SupplierProfileOrmEntity } from '@infrastructure/database/postgres/suppliers/supplier.entity';

// Test controller (for development only)
import { TestOAuthController } from '@infrastructure/oauth/google/test-oauth.controller';

import { AddressModule } from '@module/address.module';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    EncryptModule,
    MailModule,
    TokensModule,
    GoogleOAuthModule,
    S3StorageModule,
    AddressModule,

    // Configure JWT module asynchronously
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useClass: AuthJwtConfig,
    }),

    // Register TypeORM entities for dependency injection
    TypeOrmModule.forFeature([
      UserOrmEntity,
      AuthTokenOrmEntity,
      CustomerProfileOrmEntity,
      SupplierProfileOrmEntity
    ]),
  ],
  providers: [
    // Main auth service (coordinator)
    AuthService,

    // Subservices (each with single responsibility)
    RegistrationService,
    EmailVerificationService,
    PasswordResetService,
    GoogleAuthService,
    UserService,

    // Auth strategies
    AuthLocalStrategy,
    AuthJwtStrategy,

    // Permissions and guards
    PermissionsService,
    RolesGuard,
    PermissionsGuard,

    // S3 storage upload documents
    S3DocumentStorageAdapter,
    {
      provide: 'DocumentStorage',
      useClass: S3DocumentStorageAdapter,
    },
  ],
  controllers: [
    AuthController,
    TestOAuthController, // Development only, remove in production
  ],
  exports: [
    AuthService,
    UserService,
    JwtModule,
    RegistrationService,
    PermissionsService,
  ],
})
export class AuthModule { }