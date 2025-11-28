import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { EncryptService } from './encrypt/encrypt.service';
import { RegisterDto, RegSupplierProfileDto, RegCustomerProfileDto } from './types';

import { UserOrmEntity } from '@infrastructure/database/postgres/users/user.entity';
import { CustomerProfileOrmEntity } from '@infrastructure/database/postgres/customers/customer.entity';
import { SupplierProfileOrmEntity } from '@infrastructure/database/postgres/suppliers/supplier.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly encrypt: EncryptService,
    private readonly jwt: JwtService,

    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,

    @InjectRepository(CustomerProfileOrmEntity)
    private readonly customerRepo: Repository<CustomerProfileOrmEntity>,

    @InjectRepository(SupplierProfileOrmEntity)
    private readonly supplierRepo: Repository<SupplierProfileOrmEntity>,
  ) { }

  //  REGISTRATION
  async register(dto: RegisterDto) {
    const { email, password, role, profile } = dto;

    const exists = await this.userRepo.findOne({ where: { email } });
    if (exists) throw new ConflictException('Email already registered');

    const passwordHash = await this.encrypt.hash(password);

    const user = this.userRepo.create({
      email,
      password: passwordHash,
      roles: [role],
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

  //  REQUEST SUPPLIER (become supplier button)
  async requestSupplier(userId: string, dto: RegSupplierProfileDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException();

    // Already supplier? Do nothing
    if (user.roles.includes('supplier')) {
      throw new BadRequestException('Already a supplier');
    }

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
  async validateUser(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) return null;

    const valid = await this.encrypt.compare(password, user.password);
    if (!valid) return null;

    const { password: _, ...safe } = user;
    return safe;
  }

  async login(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException();
    return this._authResponse(user);
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
    });

    const { password, ...safe } = user;

    return {
      access_token: token,
      user: safe,
    };
  }
}