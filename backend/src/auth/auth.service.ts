import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { RegisterDto, RequestSupplierDto, UserPayload, ROLES, Role } from './types';
import type { CustomerModel } from '@domain/customers/types';
import { EncryptService } from './encrypt/encrypt.service';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';

import { CustomerOrmEntity } from '@infrastructure/database/postgres/customers/customer.entity';
import { SupplierOrmEntity } from '@infrastructure/database/postgres/suppliers/supplier.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly encryptService: EncryptService,
    private readonly jwtService: JwtService,

    @InjectRepository(CustomerOrmEntity)
    private readonly customerRepo: Repository<CustomerOrmEntity>,

    @InjectRepository(SupplierOrmEntity)
    private readonly supplierRepo: Repository<SupplierOrmEntity>,
  ) { }


  // REGISTRATION (always as Customer)
  async register(dto: RegisterDto) {
    const { email, password } = dto;

    const existing = await this.customerRepo.findOne({ where: { email } });
    if (existing) throw new ConflictException('Email already exists');
    if (password.length < 6) throw new BadRequestException('Password must be at least 6 characters');

    const hash = await this.encryptService.hash(password);

    // Created by customer with email and password
    const customer = this.customerRepo.create({
      email,
      password: hash,
      roles: [ROLES.CUSTOMER],
    });

    await this.customerRepo.save(customer);
    return this._buildAuthResponse(customer);
  }

  // LOGIN
  async validateUser(credentials: { email: string; password: string }): Promise<CustomerModel | null> {
    const user = await this.customerRepo.findOne({
      where: { email: credentials.email },
      select: ['id', 'email', 'password', 'roles', 'createdAt', 'updatedAt']
    });

    if (!user) return null;

    const isValid = await this.encryptService.compare(
      credentials.password,
      user.password,
    );

    if (!isValid) return null;

    const { password, ...safeUser } = user;
    return safeUser as CustomerModel;
  }

  async login(customerId: string) {
    const found = await this.customerRepo.findOne({
      where: { id: customerId },
    });

    if (!found) throw new NotFoundException('User not found');

    return this._buildAuthResponse(found);
  }

  // BECOME A SUPPLIER
  async requestSupplier(customerId: string, dto: RequestSupplierDto): Promise<SupplierOrmEntity> {
    const customer = await this.customerRepo.findOne({ where: { id: customerId } });
    if (!customer) throw new NotFoundException('Customer not found');

    let supplier = await this.supplierRepo.findOne({
      where: { customer: { id: customerId } },
      relations: ['customer'],
    });

    if (supplier) {
      supplier.name = dto.name;
      supplier.phone = dto.phone;
      supplier.documents = dto.documents;
      supplier.status = 'pending';
      await this.supplierRepo.save(supplier);
    } else {
      supplier = this.supplierRepo.create({
        customer,
        name: dto.name,
        phone: dto.phone,
        email: customer.email,
        documents: dto.documents,
        status: 'pending',
      });
      await this.supplierRepo.save(supplier);
    }

    const updatedRoles = [...customer.roles];
    if (!updatedRoles.includes(ROLES.SUPPLIER)) updatedRoles.push(ROLES.SUPPLIER);

    await this.customerRepo.update(customerId, {
      roles: updatedRoles,
      updatedAt: new Date()
    });

    supplier.customer.roles = updatedRoles;
    return supplier;
  }


  // @internal
  private _buildAuthResponse(customer: CustomerOrmEntity) {
    const payload: UserPayload = {
      id: customer.id,
      email: customer.email,
      roles: customer.roles as Role[],
    };

    const { password, ...user } = customer;

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}