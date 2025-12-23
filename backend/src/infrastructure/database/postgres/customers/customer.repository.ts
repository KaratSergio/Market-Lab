import { Repository, SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerRepository as DomainCustomerRepository } from '@domain/customers/customer.repository';
import { CustomerDomainEntity } from '@domain/customers/customer.entity';
import { CustomerProfileOrmEntity } from './customer.entity';
import { CustomerStatus } from '@domain/customers/types';


@Injectable()
export class PostgresCustomerRepository extends DomainCustomerRepository {
  constructor(
    @InjectRepository(CustomerProfileOrmEntity)
    private readonly repository: Repository<CustomerProfileOrmEntity>,
  ) {
    super();
  }

  async findAll(): Promise<CustomerDomainEntity[]> {
    const ormEntities = await this.repository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    return ormEntities.map(this.toDomainEntity);
  }

  async findById(id: string): Promise<CustomerDomainEntity | null> {
    if (!id) return null;
    const ormEntity = await this.repository.findOne({
      where: { id },
      relations: ['user']
    });
    return ormEntity ? this.toDomainEntity(ormEntity) : null;
  }

  async findByUserId(userId: string): Promise<CustomerDomainEntity | null> {
    const ormEntity = await this.repository.findOne({
      where: { user_id: userId },
      relations: ['user']
    });
    return ormEntity ? this.toDomainEntity(ormEntity) : null;
  }

  async findByEmail(email: string): Promise<CustomerDomainEntity | null> {
    const ormEntity = await this.repository.findOne({
      where: { user: { email } },
      relations: ['user']
    });
    return ormEntity ? this.toDomainEntity(ormEntity) : null;
  }

  async create(data: Partial<CustomerDomainEntity>): Promise<CustomerDomainEntity> {
    const ormEntity = this.toOrmEntity(data);
    const savedOrmEntity = await this.repository.save(ormEntity);
    return this.toDomainEntity(savedOrmEntity);
  }

  async update(id: string, data: Partial<CustomerDomainEntity>): Promise<CustomerDomainEntity | null> {
    if (!id) throw new Error('Customer ID is required for update');

    await this.repository.update(id, data);
    const updatedOrmEntity = await this.repository.findOne({
      where: { id },
      relations: ['user']
    });

    return updatedOrmEntity ? this.toDomainEntity(updatedOrmEntity) : null;
  }

  async delete(id: string): Promise<void> {
    if (!id) throw new Error('Customer ID is required for delete');
    await this.repository.delete(id);
  }

  // QueryableRepository methods
  async findOne(filter: Partial<CustomerDomainEntity>): Promise<CustomerDomainEntity | null> {
    const queryBuilder = this.repository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.user', 'user');

    this.applyFilters(queryBuilder, filter);

    const ormEntity = await queryBuilder.getOne();
    return ormEntity ? this.toDomainEntity(ormEntity) : null;
  }

  async findMany(filter: Partial<CustomerDomainEntity>): Promise<CustomerDomainEntity[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.user', 'user');

    this.applyFilters(queryBuilder, filter);

    const ormEntities = await queryBuilder.getMany();
    return ormEntities.map(this.toDomainEntity);
  }

  private applyFilters(queryBuilder: SelectQueryBuilder<CustomerProfileOrmEntity>, filter: Partial<CustomerDomainEntity>) {
    if (filter.id) queryBuilder.andWhere('customer.id = :id', { id: filter.id });
    if (filter.userId) queryBuilder.andWhere('customer.user_id = :userId', { userId: filter.userId });
    if (filter.firstName) queryBuilder.andWhere('customer.firstName = :firstName', { firstName: filter.firstName });
    // if (filter.firstName) queryBuilder.andWhere('customer.firstName ILIKE :firstName', { firstName: `%${filter.firstName}%` }); //!
    if (filter.lastName) queryBuilder.andWhere('customer.lastName = :lastName', { lastName: filter.lastName });
    if (filter.phone) queryBuilder.andWhere('customer.phone = :phone', { phone: filter.phone });

    if (filter.birthday !== undefined) {
      if (filter.birthday === null) queryBuilder.andWhere('customer.birthday IS NULL');
      else queryBuilder.andWhere('customer.birthday = :birthday', { birthday: filter.birthday });
    }

    if (filter.status) queryBuilder.andWhere('customer.status = :status', { status: filter.status });

    // Search group by address
    if (filter.address && typeof filter.address === 'object') {
      // Search by city
      if (filter.address.city) {
        queryBuilder.andWhere('customer.address->>\'city\' = :city', { city: filter.address.city });
      }
      // Search by country
      if (filter.address.country) {
        queryBuilder.andWhere('customer.address->>\'country\' = :country', { country: filter.address.country });
      }
    }
  }

  private toDomainEntity(ormEntity: CustomerProfileOrmEntity): CustomerDomainEntity {
    return new CustomerDomainEntity(
      ormEntity.id,
      ormEntity.user_id,
      ormEntity.firstName,
      ormEntity.lastName,
      ormEntity.phone,
      ormEntity.birthday,
      ormEntity.status as CustomerStatus,
      ormEntity.address || undefined,
      ormEntity.createdAt,
      ormEntity.updatedAt
    );
  }

  private toOrmEntity(domainEntity: Partial<CustomerDomainEntity>): CustomerProfileOrmEntity {
    const ormEntity = new CustomerProfileOrmEntity();

    if (domainEntity.id) ormEntity.id = domainEntity.id;
    if (domainEntity.userId) ormEntity.user_id = domainEntity.userId;
    if (domainEntity.firstName) ormEntity.firstName = domainEntity.firstName;
    if (domainEntity.lastName) ormEntity.lastName = domainEntity.lastName;
    if (domainEntity.phone) ormEntity.phone = domainEntity.phone;
    if (domainEntity.birthday !== undefined) ormEntity.birthday = domainEntity.birthday;
    if (domainEntity.status) ormEntity.status = domainEntity.status;
    if (domainEntity.address) ormEntity.address = domainEntity.address;
    if (domainEntity.createdAt) ormEntity.createdAt = domainEntity.createdAt;
    if (domainEntity.updatedAt) ormEntity.updatedAt = domainEntity.updatedAt;

    return ormEntity;
  }
}