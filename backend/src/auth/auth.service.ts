import {
  RegisterDto,
  RegisterInitialDto,
  RegCompleteDto,
  RegSupplierProfileDto,
  RegCustomerProfileDto,
  GoogleAuthDto
} from './types';

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  InternalServerErrorException
} from '@nestjs/common';

import { EncryptService } from './encrypt/encrypt.service';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';

import { UserOrmEntity } from '@infrastructure/database/postgres/users/user.entity';
import { CustomerProfileOrmEntity } from '@infrastructure/database/postgres/customers/customer.entity';
import { SupplierProfileOrmEntity } from '@infrastructure/database/postgres/suppliers/supplier.entity';

import { ConfigService } from '@nestjs/config';
import { TokenService } from './tokens/token.service';
import { MailService } from '@infrastructure/mail/mail.service';
import { GoogleOAuthService } from '@infrastructure/oauth/google/google-oauth.service';


@Injectable()
export class AuthService {
  private readonly frontendUrl: string;

  constructor(
    private readonly encrypt: EncryptService,
    private readonly jwt: JwtService,
    private readonly mailService: MailService,
    private readonly tokenService: TokenService,
    private readonly config: ConfigService,
    private readonly googleOAuthService: GoogleOAuthService,

    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,

    @InjectRepository(CustomerProfileOrmEntity)
    private readonly customerRepo: Repository<CustomerProfileOrmEntity>,

    @InjectRepository(SupplierProfileOrmEntity)
    private readonly supplierRepo: Repository<SupplierProfileOrmEntity>,
  ) {
    this.frontendUrl = this.config.get<string>('FRONTEND_URL')!;
  }

  // INITIAL REGISTRATION (for all types)
  async registerInitial(dto: RegisterInitialDto) {
    const { email, password, googleId } = dto;

    const exists = await this.userRepo.findOne({ where: { email } });
    if (exists) {
      if (googleId && exists.googleId === googleId) return this._authResponse(exists);
      throw new ConflictException('Email already registered');
    }

    // Hash password if provided
    let passwordHash = null;
    if (password) passwordHash = await this.encrypt.hash(password);

    const user = this.userRepo.create({
      email,
      password: passwordHash,
      googleId: googleId || null,
      roles: [],
      regComplete: false,
      emailVerified: googleId ? true : false,
    });

    const savedUser = await this.userRepo.save(user);

    // Send verification email only for non-Google registration
    if (!googleId) {
      const token = await this.tokenService.createToken(user.id, 'email_verification', 24);
      const verificationLink = `${this.frontendUrl}/auth/verify-email?token=${token}`;

      this.mailService.sendVerificationEmail(email, verificationLink)
        .catch(err => console.error('Failed to send verification email:', err));
    }

    return this._authResponse(savedUser);
  }

  // COMPLETION OF REGISTRATION
  async completeRegistration(userId: string, dto: RegCompleteDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.regComplete) throw new BadRequestException('Registration already completed');

    const { role, profile } = dto;

    user.roles = [role];
    user.regComplete = true;
    await this.userRepo.save(user);

    // CUSTOMER PROFILE
    if (role === 'customer') {
      const customerProfile = profile as RegCustomerProfileDto;

      const customer = this.customerRepo.create({
        user_id: user.id,
        firstName: customerProfile.firstName,
        lastName: customerProfile.lastName,
        phone: customerProfile.phone,
        address: customerProfile.address
      });
      await this.customerRepo.save(customer);
    }

    // SUPPLIER PROFILE
    if (role === 'supplier') {
      const supplierProfile = profile as RegSupplierProfileDto;

      const supplier = this.supplierRepo.create({
        user_id: user.id,
        companyName: supplierProfile.companyName,
        registrationNumber: supplierProfile.registrationNumber,
        address: supplierProfile.address,
        email: user.email,
        phone: supplierProfile.phone || '',
        documents: supplierProfile.documents ?? [],
      });
      await this.supplierRepo.save(supplier);
    }

    return this._authResponse(user);
  }

  // Admin registration method
  async register(dto: RegisterDto) {
    const { email, password, role, profile } = dto;

    const exists = await this.userRepo.findOne({ where: { email } });
    if (exists) throw new ConflictException('Email already registered');

    const passwordHash = await this.encrypt.hash(password);

    const user = this.userRepo.create({
      email,
      password: passwordHash,
      roles: [role],
      regComplete: true,
    });

    await this.userRepo.save(user);

    // CUSTOMER PROFILE
    if (role === 'customer') {
      const customerProfile = profile as RegCustomerProfileDto;

      const customer = this.customerRepo.create({
        user_id: user.id,
        firstName: customerProfile.firstName,
        lastName: customerProfile.lastName,
        phone: customerProfile.phone,
        // address: customerProfile.address
      });
      await this.customerRepo.save(customer);
    }

    // SUPPLIER PROFILE
    if (role === 'supplier') {
      const supplierProfile = profile as RegSupplierProfileDto;

      const supplier = this.supplierRepo.create({
        user_id: user.id,
        companyName: supplierProfile.companyName,
        registrationNumber: supplierProfile.registrationNumber,
        address: supplierProfile.address,
        email: user.email,
        phone: supplierProfile.phone || '',
        documents: supplierProfile.documents ?? [],
      });
      await this.supplierRepo.save(supplier);
    }

    return this._authResponse(user);
  }

  //  REQUEST SUPPLER
  async requestSupplier(userId: string, dto: RegSupplierProfileDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException();
    if (user.roles.includes('supplier')) throw new BadRequestException('Already a supplier');

    // Add role
    user.roles.push('supplier');
    await this.userRepo.save(user);

    // Create supplier profile
    const supplierProfile = this.supplierRepo.create({
      user_id: user.id,
      companyName: dto.companyName,
      registrationNumber: dto.registrationNumber,
      address: dto.address,
      email: user.email,
      phone: dto.phone || '',
      documents: dto.documents ?? [],
    });

    await this.supplierRepo.save(supplierProfile);

    return this._authResponse(user);
  }

  //  LOGIN
  async login(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException();
    return this._authResponse(user);
  }

  async validateUser(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || !user.password) return null;

    const valid = await this.encrypt.compare(password, user.password);
    if (!valid) return null;

    const { password: _, ...safe } = user;
    return safe;
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  // @internal
  private _authResponse(user: UserOrmEntity) {
    const token = this.jwt.sign({
      id: user.id,
      email: user.email,
      roles: user.roles,
      regComplete: user.regComplete,
    });

    const { password, ...safe } = user;

    return {
      access_token: token,
      user: safe,
    };
  }

  // Email verification
  async sendVerificationEmail(email: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || user.emailVerified) return;

    const token = await this.tokenService.createToken(user.id, 'email_verification', 24);
    const verificationLink = `${this.frontendUrl}/auth/verify-email?token=${token}`;

    await this.mailService.sendVerificationEmail(email, verificationLink);
  }

  async verifyEmail(token: string): Promise<{ success: boolean; message?: string }> {
    const validation = await this.tokenService.validateToken(token, 'email_verification');

    if (!validation.valid) {
      return {
        success: false,
        message: validation.error || 'Invalid token'
      };
    }

    // update user
    await this.userRepo.update(validation.userId!, { emailVerified: true });

    // mark the token as used
    await this.tokenService.markTokenAsUsed(token);

    // delete all user verification tokens
    await this.tokenService.deleteUserTokens(validation.userId!, 'email_verification');

    return { success: true };
  }

  // Password recovery
  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) return;

    // Generate a password reset token (valid for 1 hour)
    const token = await this.tokenService.createToken(user.id, 'password_reset', 1);
    const resetLink = `${this.frontendUrl}/auth/reset-password?token=${token}`;

    await this.mailService.sendPasswordResetEmail(email, resetLink);
  }

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; message?: string }> {
    const validation = await this.tokenService.validateToken(token, 'password_reset');

    if (!validation.valid) {
      return {
        success: false,
        message: validation.error || 'Invalid token'
      };
    }

    // hash password
    const passwordHash = await this.encrypt.hash(newPassword);

    // update password
    await this.userRepo.update(validation.userId!, { password: passwordHash });

    // mark the token as used
    await this.tokenService.markTokenAsUsed(token);

    // delete all user password reset tokens
    await this.tokenService.deleteUserTokens(validation.userId!, 'password_reset');

    //! Разлогиниваем пользователя на всех устройствах
    //! (если есть система сессий/токенов - инвалидируйте их здесь)

    return { success: true };
  }

  // checking verification status
  async checkEmailVerification(userId: string): Promise<{ verified: boolean }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return { verified: user.emailVerified };
  }

  // GOOGLE AUTH METHODS
  // Get Google OAuth URL for frontend
  async getGoogleAuthUrl(): Promise<{ url: string }> {
    try {
      const url = this.googleOAuthService.getAuthUrl();
      return { url };
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate Google auth URL');
    }
  }

  // Handle Google OAuth callback with authorization code
  async handleGoogleCallback(code: string) {
    try {
      // Exchange code for tokens
      const tokens = await this.googleOAuthService.getTokens(code);

      // Verify ID token and get user info
      const googleUser = await this.googleOAuthService.verifyIdToken(tokens.idToken);

      // Find existing user by Google ID or email
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

      const savedUser = await this.userRepo.save(user);

      return this._authResponse(savedUser);
    } catch (error) {
      throw new BadRequestException(`Google authentication failed: ${error.message}`);
    }
  }

  // Authenticate with Google using ID token
  async authWithGoogle(dto: GoogleAuthDto) {
    const { idToken } = dto;

    try {
      // Verify Google ID token
      const googleUser = await this.googleOAuthService.verifyIdToken(idToken);

      // Find existing user
      let user = await this.userRepo.findOne({
        where: [
          { googleId: googleUser.id },
          { email: googleUser.email }
        ]
      });

      if (!user) {
        // Create new user
        user = this.userRepo.create({
          email: googleUser.email,
          googleId: googleUser.id,
          emailVerified: googleUser.verified_email,
          roles: [],
          regComplete: false,
          password: null,
        });
      }

      const savedUser = await this.userRepo.save(user);

      return this._authResponse(savedUser);
    } catch (error) {
      throw new BadRequestException(`Google authentication failed: ${error.message}`);
    }
  }

  // Link Google account to existing user
  async linkGoogleAccount(userId: string, dto: GoogleAuthDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.googleId) throw new BadRequestException('Google account already linked');

    const googleUser = await this.googleOAuthService.verifyIdToken(dto.idToken);

    // Check if Google account is already linked to another user
    const existingUser = await this.userRepo.findOne({
      where: { googleId: googleUser.id }
    });
    if (existingUser) throw new ConflictException('This Google account is already linked to another user');

    // Link Google account
    user.googleId = googleUser.id;
    if (!user.emailVerified && googleUser.verified_email) {
      user.emailVerified = true;
    }

    await this.userRepo.save(user);

    return {
      success: true,
      message: 'Google account linked successfully'
    };
  }

  // Unlink Google account
  async unlinkGoogleAccount(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (!user.googleId) throw new BadRequestException('Google account not linked');
    if (!user.password) throw new BadRequestException('Cannot unlink Google account. Please set a password first');

    user.googleId = null;
    await this.userRepo.save(user);

    return {
      success: true,
      message: 'Google account unlinked successfully'
    };
  }

  async findByGoogleId(googleId: string): Promise<UserOrmEntity | null> {
    return this.userRepo.findOne({ where: { googleId } });
  }
}