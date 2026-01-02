import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

// DTOs and entities
import {
  RegisterDto,
  RegisterInitialDto,
  RegCompleteDto,
  RegSupplierProfileDto,
  RegCustomerProfileDto,
} from '../types';
import { UserOrmEntity } from '@infrastructure/database/postgres/users/user.entity';
import { CustomerProfileOrmEntity } from '@infrastructure/database/postgres/customers/customer.entity';
import { SupplierProfileOrmEntity } from '@infrastructure/database/postgres/suppliers/supplier.entity';

// Infrastructure services
import { EncryptService } from '../encrypt/encrypt.service';
import { TokenService } from '../tokens/token.service';
import { MailService } from '@infrastructure/mail/mail.service';
import { S3StorageService } from '@infrastructure/storage/s3-storage.service';


@Injectable()
export class RegistrationService {
  private readonly frontendUrl: string;

  constructor(
    private readonly encrypt: EncryptService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
    private readonly s3StorageService: S3StorageService,
    private readonly config: ConfigService,

    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,

    @InjectRepository(CustomerProfileOrmEntity)
    private readonly customerRepo: Repository<CustomerProfileOrmEntity>,

    @InjectRepository(SupplierProfileOrmEntity)
    private readonly supplierRepo: Repository<SupplierProfileOrmEntity>,
  ) {
    this.frontendUrl = this.config.get<string>('FRONTEND_URL')!;
  }

  /**
   * Initial registration for all user types
   * Creates user with basic info and sends verification email
   */
  async registerInitial(dto: RegisterInitialDto) {
    const { email, password, googleId } = dto;

    // Check if user already exists
    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) {
      if (googleId && existingUser.googleId === googleId) {
        // User already registered with same Google ID
        return this._generateUserResponse(existingUser);
      }
      throw new ConflictException('Email already registered');
    }

    // Hash password if provided (for non-Google registration)
    let passwordHash = null;
    if (password) passwordHash = await this.encrypt.hash(password);

    // Create new user entity
    const user = this.userRepo.create({
      email,
      password: passwordHash,
      googleId: googleId || null,
      roles: [],
      regComplete: false,
      emailVerified: googleId ? true : false, // Google users are pre-verified
    });

    const savedUser = await this.userRepo.save(user);

    // Send verification email only for non-Google registration
    if (!googleId) await this._sendVerificationEmail(savedUser);

    return this._generateUserResponse(savedUser);
  }

  /**
   * Complete registration process with user details and documents
   */
  async completeRegistration(
    userId: string,
    dto: RegCompleteDto,
    documents?: Express.Multer.File[]
  ) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.regComplete) throw new BadRequestException('Registration already completed');

    const { role, profile } = dto;

    // Update user with selected role
    user.roles = [role];
    user.regComplete = true;
    await this.userRepo.save(user);

    // Handle customer profile creation
    if (role === 'customer') {
      await this._createCustomerProfile(user.id, profile as RegCustomerProfileDto);
    }

    // Handle supplier profile creation with document upload
    if (role === 'supplier') {
      await this._createSupplierProfile(
        user.id,
        user.email,
        profile as RegSupplierProfileDto,
        documents
      );
    }

    return this._generateUserResponse(user);
  }

  /**
   * Admin registration (creates fully registered users)
   */
  async registerAdmin(dto: RegisterDto) {
    const { email, password, role, profile } = dto;

    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) throw new ConflictException('Email already registered');

    const passwordHash = await this.encrypt.hash(password);

    const user = this.userRepo.create({
      email,
      password: passwordHash,
      roles: [role],
      regComplete: true,
      emailVerified: true, // Admin created users are auto-verified
    });

    await this.userRepo.save(user);

    // Create profile based on role
    if (role === 'customer') {
      await this._createCustomerProfile(user.id, profile as RegCustomerProfileDto);
    } else if (role === 'supplier') {
      await this._createSupplierProfile(
        user.id,
        user.email,
        profile as RegSupplierProfileDto,
        []
      );
    }

    return this._generateUserResponse(user);
  }

  /**
   * Create customer profile entity
   * @private Internal method for customer creation
   */
  private async _createCustomerProfile(
    userId: string,
    profile: RegCustomerProfileDto
  ) {
    const customer = this.customerRepo.create({
      user_id: userId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      address: profile.address,
    });
    await this.customerRepo.save(customer);
  }

  /**
   * Create supplier profile with document upload
   * @private Internal method for supplier creation
   */
  private async _createSupplierProfile(
    userId: string,
    email: string,
    profile: RegSupplierProfileDto,
    documents?: Express.Multer.File[]
  ) {
    let documentUrls: string[] = [];

    // Upload documents to S3 if provided
    if (documents && documents.length > 0) {
      const uploadPromises = documents.map(async (file) => {
        const result = await this.s3StorageService.uploadSupplierDocument(
          {
            buffer: file.buffer,
            originalname: file.originalname,
            mimetype: file.mimetype,
          },
          profile.companyName,
          'registration'
        );
        return result.url;
      });

      documentUrls = await Promise.all(uploadPromises);
    }

    // Combine uploaded documents with any provided URLs
    const allDocuments = [...documentUrls, ...(profile.documents ?? [])];

    const supplier = this.supplierRepo.create({
      user_id: userId,
      companyName: profile.companyName,
      registrationNumber: profile.registrationNumber,
      firstName: profile.firstName,
      lastName: profile.lastName,
      address: profile.address,
      email: email,
      phone: profile.phone || '',
      documents: allDocuments,
    });

    await this.supplierRepo.save(supplier);
  }

  /**
   * Send verification email to user
   * @private Internal method for email verification
   */
  private async _sendVerificationEmail(user: UserOrmEntity) {
    try {
      const token = await this.tokenService.createToken(
        user.id,
        'email_verification',
        24 // 24 hours validity
      );
      const verificationLink = `${this.frontendUrl}/auth/verify-email?token=${token}`;

      await this.mailService.sendVerificationEmail(user.email, verificationLink);
    } catch (error) {
      // Log error but don't fail registration
      console.error('Failed to send verification email:', error);
    }
  }

  /**
   * Generate standardized user response without password
   * @private Internal response formatter
   */
  private _generateUserResponse(user: UserOrmEntity) {
    const { password, ...safeUser } = user;
    return { user: safeUser };
  }
}