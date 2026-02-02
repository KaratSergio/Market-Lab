import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
  ForbiddenException
} from '@nestjs/common';

import { CustomerDomainEntity } from './customer.entity';
import { CustomerRepository } from './customer.repository';
import { CreateCustomerDto, UpdateCustomerDto } from './types';
import { Role, Permission } from '@shared/types';
import { AddressService } from '@domain/addresses/address.service';


@Injectable()
export class CustomerService {
  constructor(
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
    private readonly addressService: AddressService,
  ) { }

  async findAll(userId: string, userRoles: string[]): Promise<CustomerDomainEntity[]> {
    this._checkCustomerPermission(userRoles, Permission.CUSTOMER_READ, 'view customers');
    return this.customerRepository.findAll();
  }

  async findById(
    id: string,
    userId: string,
    userRoles: string[]
  ): Promise<CustomerDomainEntity> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) throw new NotFoundException('Customer not found');

    this._checkCustomerAccess(customer, userId, userRoles, 'view');

    return customer;
  }

  async findByUserId(
    userId: string,
    requestUserId: string,
    userRoles: string[]
  ): Promise<CustomerDomainEntity> {
    const customer = await this.customerRepository.findByUserId(userId);
    if (!customer) throw new NotFoundException('Customer not found');

    this._checkCustomerAccess(customer, requestUserId, userRoles, 'view');

    return customer;
  }

  async create(createDto: CreateCustomerDto): Promise<CustomerDomainEntity> {
    const existingCustomer = await this.customerRepository.findByUserId(createDto.userId);
    if (existingCustomer) throw new ConflictException('Customer profile already exists for this user');

    const customer = CustomerDomainEntity.create(createDto);
    const savedCustomer = await this.customerRepository.create(customer);
    if (createDto.address) {
      await this.addressService.createAddress({
        entityId: savedCustomer.id,
        entityType: Role.CUSTOMER,
        ...createDto.address,
        isPrimary: true,
      });
    }
    return savedCustomer;
  }

  async update(
    id: string,
    updateDto: UpdateCustomerDto,
    userId: string,
    userRoles: string[]
  ): Promise<CustomerDomainEntity> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) throw new NotFoundException('Customer not found');

    this._checkCustomerAccess(customer, userId, userRoles, 'update');

    customer.update(updateDto);

    const updated = await this.customerRepository.update(id, {
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      birthday: customer.birthday,
      status: customer.status,
      updatedAt: customer.updatedAt
    });

    if (!updated) throw new NotFoundException('Customer not found after update');
    return updated;
  }

  async delete(
    id: string,
    userId: string,
    userRoles: string[]
  ): Promise<CustomerDomainEntity> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) throw new NotFoundException('Customer not found');

    this._checkCustomerAccess(customer, userId, userRoles, 'delete');

    customer.deactivate();

    const updated = await this.customerRepository.update(id, {
      status: customer.status,
      updatedAt: customer.updatedAt
    });

    if (!updated) throw new NotFoundException('Customer not found after deactivation');
    return updated;
  }

  // Activation/deactivation (admin)
  async activate(
    id: string,
    userId: string,
    userRoles: string[]
  ): Promise<CustomerDomainEntity> {
    this._checkCustomerPermission(userRoles, Permission.CUSTOMER_MANAGE, 'activate customers');

    const customer = await this.customerRepository.findById(id);
    if (!customer) throw new NotFoundException('Customer not found');

    customer.activate();

    const updated = await this.customerRepository.update(id, {
      status: customer.status,
      updatedAt: customer.updatedAt
    });

    if (!updated) throw new NotFoundException('Customer not found after activation');
    return updated;
  }

  async deactivate(
    id: string,
    userId: string,
    userRoles: string[]
  ): Promise<CustomerDomainEntity> {
    this._checkCustomerPermission(userRoles, Permission.CUSTOMER_MANAGE, 'deactivate customers');

    const customer = await this.customerRepository.findById(id);
    if (!customer) throw new NotFoundException('Customer not found');

    customer.deactivate();

    const updated = await this.customerRepository.update(id, {
      status: customer.status,
      updatedAt: customer.updatedAt
    });

    if (!updated) throw new NotFoundException('Customer not found after deactivation');
    return updated;
  }

  // Search for customers (admin/supplier)
  async findOne(
    filter: Partial<CustomerDomainEntity>,
    userId: string,
    userRoles: string[]
  ): Promise<CustomerDomainEntity | null> {
    this._checkCustomerPermission(userRoles, Permission.CUSTOMER_READ, 'search customers');
    return this.customerRepository.findOne(filter);
  }

  async findMany(
    filter: Partial<CustomerDomainEntity>,
    userId: string,
    userRoles: string[]
  ): Promise<CustomerDomainEntity[]> {
    this._checkCustomerPermission(userRoles, Permission.CUSTOMER_READ, 'search customers');
    return this.customerRepository.findMany(filter);
  }

  //! Helper methods for checking rights
  private _checkCustomerPermission(
    userRoles: string[],
    requiredPermission: Permission,
    action: string
  ): void {
    // Admins have all rights
    if (userRoles.includes(Role.ADMIN)) return;
    throw new ForbiddenException(`You don't have permission to ${action}`);
  }

  private _checkCustomerAccess(
    customer: CustomerDomainEntity,
    userId: string,
    userRoles: string[],
    action: string
  ): void {
    // Admins have all rights
    if (userRoles.includes(Role.ADMIN)) return;
    // Suppliers can read customers
    if (userRoles.includes(Role.SUPPLIER) && action === 'view') return;
    // Customers can only manage their own profile.
    if (userRoles.includes(Role.CUSTOMER) && customer.userId === userId) return;

    throw new ForbiddenException(`You don't have permission to ${action} this customer`);
  }
}