import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerRepository as DomainCustomerRepository } from '../../../../domain/customers/customer.repository';
import { Customer } from '../../../../domain/customers/customer.entity';
import { CustomerEntity } from './customer.entity';

@Injectable()
export class PostgresCustomerRepository extends DomainCustomerRepository {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly repository: Repository<CustomerEntity>,
  ) {
    super();
  }

  private toDomain(entity: CustomerEntity): Customer {
    return new Customer(
      entity.id,
      entity.email,
      entity.firstName,
      entity.lastName,
      entity.phone,
      entity.address,
      entity.createdAt,
      entity.updatedAt,
      entity.isActive,
    );
  }

  private toEntity(customer: Customer): CustomerEntity {
    const entity = new CustomerEntity();
    entity.id = customer.id;
    entity.email = customer.email;
    entity.firstName = customer.firstName;
    entity.lastName = customer.lastName;
    entity.phone = customer.phone;
    entity.address = customer.address;
    entity.createdAt = customer.createdAt;
    entity.updatedAt = customer.updatedAt;
    entity.isActive = customer.isActive;
    return entity;
  }

  async findAll(): Promise<Customer[]> {
    const entities = await this.repository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findById(id: string): Promise<Customer | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const entity = await this.repository.findOne({ where: { email } });
    return entity ? this.toDomain(entity) : null;
  }

  async create(customer: Customer): Promise<Customer> {
    const entity = this.toEntity(customer);
    const savedEntity = await this.repository.save(entity);
    return this.toDomain(savedEntity);
  }

  async update(id: string, customer: Customer): Promise<Customer> {
    const entity = this.toEntity(customer);
    await this.repository.update(id, entity);
    return customer;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}