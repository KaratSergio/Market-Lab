import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import { CustomerDomainEntity } from './customer.entity';
import { CustomerRepository } from './customer.repository';
import { CreateCustomerDto, UpdateCustomerDto } from './types/customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
  ) { }

  async findAll(): Promise<CustomerDomainEntity[]> {
    return this.customerRepository.findAll();
  }

  async findById(id: string): Promise<CustomerDomainEntity> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async findByEmail(email: string): Promise<CustomerDomainEntity> {
    const customer = await this.customerRepository.findByEmail(email);
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async create(createDto: CreateCustomerDto): Promise<CustomerDomainEntity> {
    const existingCustomer = await this.customerRepository.findByEmail(createDto.email);
    if (existingCustomer) throw new ConflictException('Customer with this email already exists');

    const customer = CustomerDomainEntity.create(createDto);
    return this.customerRepository.create(customer);
  }

  async update(id: string, updateDto: UpdateCustomerDto): Promise<CustomerDomainEntity> {
    const customer = await this.findById(id);
    customer.update(updateDto);
    return this.customerRepository.update(id, customer);
  }

  async delete(id: string): Promise<void> {
    const customer = await this.findById(id);
    customer.deactivate();
    await this.customerRepository.update(id, customer);
  }

  async activate(id: string): Promise<CustomerDomainEntity> {
    return this.update(id, { isActive: true });
  }

  async deactivate(id: string): Promise<CustomerDomainEntity> {
    return this.update(id, { isActive: false });
  }
}