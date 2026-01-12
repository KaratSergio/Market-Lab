import {
  BadRequestException, ConflictException,
  Injectable, Inject, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

// DTOs & types
import {
  RegisterDto,
  RegisterInitialDto,
  RegCompleteDto,
  RegSupplierProfileDto,
  RegCustomerProfileDto,
} from '../types';
import { Role } from '@shared/types';
import type { DocumentStorage } from '@domain/suppliers/types';

// Entities
import { UserOrmEntity } from '@infrastructure/database/postgres/users/user.entity';
import { CustomerProfileOrmEntity } from '@infrastructure/database/postgres/customers/customer.entity';
import { SupplierProfileOrmEntity } from '@infrastructure/database/postgres/suppliers/supplier.entity';

// auth services
import { EncryptService } from '../encrypt/encrypt.service';
import { TokenService } from '../tokens/token.service';

import { MailService } from '@infrastructure/mail/mail.service'; //! reconnect with adapter

import { AddressService } from '@domain/addresses/address.service';


@Injectable()
export class RegistrationService {
  private readonly frontendUrl: string;

  constructor(
    private readonly encrypt: EncryptService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
    private readonly addressService: AddressService,
    private readonly config: ConfigService,

    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,

    @InjectRepository(CustomerProfileOrmEntity)
    private readonly customerRepo: Repository<CustomerProfileOrmEntity>,

    @InjectRepository(SupplierProfileOrmEntity)
    private readonly supplierRepo: Repository<SupplierProfileOrmEntity>,

    @Inject('DocumentStorage')
    private readonly documentStorage: DocumentStorage,
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
   * @description For new users: completes registration with role selection
   * @description For existing users: adds new roles and creates profiles
   */
  async completeRegistration(
    userId: string,
    dto: RegCompleteDto,
    documents?: Express.Multer.File[]
  ) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const { role, profile } = dto;

    // Check if user already has this role
    if (user.roles.includes(role)) {
      throw new BadRequestException(`User already has ${role} role`);
    }

    // If user is completing registration for the first time
    if (!user.regComplete) {
      user.regComplete = true;
      user.roles = [role]; // Set initial role
    }
    // If user is adding a new role (e.g., customer becoming supplier)
    else {
      // Add new role to existing roles
      user.roles = [...user.roles, role];
    }

    await this.userRepo.save(user);

    // Handle customer profile creation
    if (role === Role.CUSTOMER) {
      await this._createCustomerProfile(user.id, profile as RegCustomerProfileDto);
    }

    // Handle supplier profile creation with document upload
    if (role === Role.SUPPLIER) {
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
    if (role === Role.CUSTOMER) {
      await this._createCustomerProfile(user.id, profile as RegCustomerProfileDto);
    } else if (role === Role.SUPPLIER) {
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
    // Check if customer profile already exists
    const existingProfile = await this.customerRepo.findOne({ where: { user_id: userId } });
    if (existingProfile) {
      throw new BadRequestException('Customer profile already exists');
    }

    const customer = this.customerRepo.create({
      user_id: userId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
    });

    const savedCustomer = await this.customerRepo.save(customer);

    if (profile.address) {
      await this.addressService.createAddress({
        entityId: savedCustomer.id,
        entityType: 'customer',
        country: profile.address.country,
        city: profile.address.city,
        street: profile.address.street,
        building: profile.address.building,
        postalCode: profile.address.postalCode,
        state: profile.address.state,
        lat: profile.address.lat,
        lng: profile.address.lng,
        isPrimary: true,
      });
    }

    return savedCustomer;
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
    // Check if supplier profile already exists
    const existingProfile = await this.supplierRepo.findOne({ where: { user_id: userId } });
    if (existingProfile) {
      throw new BadRequestException('Supplier profile already exists');
    }

    let documentUrls: string[] = [];

    // Upload documents to S3 if provided
    if (documents && documents.length > 0) {
      documentUrls = await this.documentStorage.uploadMany(
        documents,
        profile.companyName
      );
    }

    // Combine uploaded documents with any provided URLs
    const allDocuments = [...documentUrls, ...(profile.documents ?? [])];

    const supplier = this.supplierRepo.create({
      user_id: userId,
      companyName: profile.companyName,
      registrationNumber: profile.registrationNumber,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      description: profile.description,
      documents: allDocuments,
      status: 'pending',
    });

    const savedSupplier = await this.supplierRepo.save(supplier);

    if (profile.address) {
      await this.addressService.createAddress({
        entityId: savedSupplier.id,
        entityType: 'supplier',
        country: profile.address.country,
        city: profile.address.city,
        street: profile.address.street,
        building: profile.address.building,
        postalCode: profile.address.postalCode,
        state: profile.address.state,
        lat: profile.address.lat,
        lng: profile.address.lng,
        isPrimary: true,
      });
    }

    return savedSupplier;
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