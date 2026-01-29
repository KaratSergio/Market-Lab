import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';

// Main auth components
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';

// Subservices
import { RegistrationService } from './services/registration.service';
import { EmailVerificationService } from './services/email-verification.service';
import { PasswordResetService } from './services/password-reset.service';
import { GoogleAuthService } from './services/google-auth.service';
import { PermissionsService } from './services/permissions.service';
import { UserService } from './services/user.service';

// Auth strategies and guards
import { AuthJwtConfig } from './config/auth-jwt.config';
import { AuthLocalStrategy } from './strategy/auth-local.strategy';
import { AuthJwtStrategy } from './strategy/auth-jwt.strategy';
import { RolesGuard } from './guard/roles.guard';
import { PermissionsGuard } from './guard/permissions.guard';

// modules
import { GoogleOAuthModule } from '@module/google-oauth.module';
import { MailModule } from '@module/mail.module';
import { AddressModule } from '@module/address.module';
import { TranslationsModule } from '@module/translations.module';
import { EncryptModule } from './encrypt/encrypt.module';
import { TokensModule } from './tokens/token.module';
import { UsersModule } from '@module/users.module';
import { CustomersModule } from '@module/customers.module';
import { SuppliersModule } from '@module/suppliers.module';
import { NotificationModule } from '@module/notification.module';

// Test controller (for development only)
import { TestOAuthController } from '@infrastructure/oauth/google/test-oauth.controller';


@Module({
  imports: [
    ConfigModule,
    PassportModule,
    EncryptModule,
    TokensModule,
    GoogleOAuthModule,
    MailModule,
    NotificationModule,
    AddressModule,
    TranslationsModule,
    UsersModule,
    CustomersModule,
    SuppliersModule,

    // Configure JWT module asynchronously
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useClass: AuthJwtConfig,
    }),
  ],
  providers: [
    // Main auth service (coordinator)
    AuthService,

    // Subservices (SRP)
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