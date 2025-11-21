import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerRepository as DomainCustomerRepository } from '@domain/customers/customer.repository';
import { CustomerDomainEntity } from '@domain/customers/customer.entity';
import { CustomerOrmEntity } from './customer.entity';

@Injectable()
export class PostgresCustomerRepository extends DomainCustomerRepository {
  constructor(
    @InjectRepository(CustomerOrmEntity)
    private readonly repository: Repository<CustomerOrmEntity>,
  ) { super() }

  async findAll(): Promise<CustomerDomainEntity[]> {
    const ormEntities = await this.repository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
    return ormEntities.map(this.toDomainEntity);
  }

  async findById(id: string): Promise<CustomerDomainEntity | null> {
    if (!id) return null;
    const ormEntity = await this.repository.findOne({ where: { id } });
    return ormEntity ? this.toDomainEntity(ormEntity) : null;
  }

  async findByEmail(email: string): Promise<CustomerDomainEntity | null> {
    const ormEntity = await this.repository.findOne({ where: { email } });
    return ormEntity ? this.toDomainEntity(ormEntity) : null;
  }

  async create(customer: CustomerDomainEntity): Promise<CustomerDomainEntity> {
    const ormEntity = this.toOrmEntity(customer);
    const savedOrmEntity = await this.repository.save(ormEntity);
    return this.toDomainEntity(savedOrmEntity);
  }

  async update(id: string, customer: CustomerDomainEntity): Promise<CustomerDomainEntity> {
    if (!id) throw new Error('Customer ID is required for update');

    const ormEntity = this.toOrmEntity(customer);
    await this.repository.update(id, ormEntity);
    const updatedOrmEntity = await this.repository.findOne({ where: { id } });

    if (!updatedOrmEntity) throw new Error(`Customer with id ${id} not found after update`);

    return this.toDomainEntity(updatedOrmEntity);
  }

  async delete(id: string): Promise<void> {
    if (!id) throw new Error('Customer ID is required for delete');
    await this.repository.delete(id);
  }

  private toDomainEntity(ormEntity: CustomerOrmEntity): CustomerDomainEntity {
    return new CustomerDomainEntity(
      ormEntity.id,
      ormEntity.email,
      ormEntity.password,
      ormEntity.firstName,
      ormEntity.lastName,
      ormEntity.roles,
      ormEntity.phone,
      ormEntity.address || undefined, // convert null to undefined
      ormEntity.createdAt,
      ormEntity.updatedAt,
      ormEntity.isActive
    );
  }

  private toOrmEntity(domainEntity: CustomerDomainEntity): CustomerOrmEntity {
    const ormEntity = new CustomerOrmEntity();
    //! Don't set the ID if it's empty - TypeORM will generate it automatically.
    if (domainEntity.id) ormEntity.id = domainEntity.id;

    ormEntity.email = domainEntity.email;
    ormEntity.password = domainEntity.password;
    ormEntity.firstName = domainEntity.firstName;
    ormEntity.lastName = domainEntity.lastName;
    ormEntity.roles = domainEntity.roles;
    ormEntity.phone = domainEntity.phone;
    ormEntity.address = domainEntity.address || null; // undefined to null for DB
    ormEntity.createdAt = domainEntity.createdAt;
    ormEntity.updatedAt = domainEntity.updatedAt;
    ormEntity.isActive = domainEntity.isActive;

    return ormEntity;
  }
}