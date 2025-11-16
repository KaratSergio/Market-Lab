import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import { Customer } from './customer.entity';
import { CustomerRepository } from './customer.repository';
import { CreateCustomerDto, UpdateCustomerDto } from './types/customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
  ) { }

  async findAll(): Promise<Customer[]> {
    return this.customerRepository.findAll();
  }

  async findById(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async findByEmail(email: string): Promise<Customer> {
    const customer = await this.customerRepository.findByEmail(email);
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async create(createDto: CreateCustomerDto): Promise<Customer> {
    const existingCustomer = await this.customerRepository.findByEmail(createDto.email);
    if (existingCustomer) throw new ConflictException('Customer with this email already exists');

    const customer = Customer.create(createDto);
    return this.customerRepository.create(customer);
  }

  async update(id: string, updateDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findById(id);
    customer.update(updateDto);
    return this.customerRepository.update(id, customer);
  }

  async delete(id: string): Promise<void> {
    const customer = await this.findById(id);
    customer.deactivate();
    await this.customerRepository.update(id, customer);
  }

  async activate(id: string): Promise<Customer> {
    const customer = await this.findById(id);
    customer.isActive = true;
    customer.updatedAt = new Date();
    return this.customerRepository.update(id, customer);
  }

  async deactivate(id: string): Promise<Customer> {
    const customer = await this.findById(id);
    customer.isActive = false;
    customer.updatedAt = new Date();
    return this.customerRepository.update(id, customer);
  }
}