import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SupplierRepository as DomainSupplierRepository } from '@domain/suppliers/supplier.repository';
import { SupplierDomainEntity } from '@domain/suppliers/supplier.entity';
import { SupplierProfileOrmEntity } from './supplier.entity';
import { SupplierStatus } from '@domain/suppliers/types';

@Injectable()
export class PostgresSupplierRepository extends DomainSupplierRepository {
  constructor(
    @InjectRepository(SupplierProfileOrmEntity)
    private readonly repository: Repository<SupplierProfileOrmEntity>,
  ) {
    super();
  }

  async findAll(): Promise<SupplierDomainEntity[]> {
    const ormEntities = await this.repository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    return ormEntities.map(this.toDomainEntity);
  }

  async findById(id: string): Promise<SupplierDomainEntity | null> {
    if (!id) return null;
    const ormEntity = await this.repository.findOne({
      where: { id },
      relations: ['user']
    });
    return ormEntity ? this.toDomainEntity(ormEntity) : null;
  }

  async findByUserId(userId: string): Promise<SupplierDomainEntity | null> {
    const ormEntity = await this.repository.findOne({
      where: { user_id: userId },
      relations: ['user']
    });
    return ormEntity ? this.toDomainEntity(ormEntity) : null;
  }

  async findByRegistrationNumber(regNumber: string): Promise<SupplierDomainEntity | null> {
    const ormEntity = await this.repository.findOne({
      where: { registrationNumber: regNumber },
      relations: ['user']
    });
    return ormEntity ? this.toDomainEntity(ormEntity) : null;
  }

  async findByStatus(status: string): Promise<SupplierDomainEntity[]> {
    const ormEntities = await this.repository.find({
      where: { status },
      relations: ['user']
    });
    return ormEntities.map(this.toDomainEntity);
  }

  async create(data: Partial<SupplierDomainEntity>): Promise<SupplierDomainEntity> {
    const ormEntity = this.toOrmEntity(data);
    const savedOrmEntity = await this.repository.save(ormEntity);
    return this.toDomainEntity(savedOrmEntity);
  }

  async update(id: string, data: Partial<SupplierDomainEntity>): Promise<SupplierDomainEntity | null> {
    if (!id) throw new Error('Supplier ID is required for update');

    await this.repository.update(id, data);
    const updatedOrmEntity = await this.repository.findOne({
      where: { id },
      relations: ['user']
    });

    return updatedOrmEntity ? this.toDomainEntity(updatedOrmEntity) : null;
  }

  async delete(id: string): Promise<void> {
    if (!id) throw new Error('Supplier ID is required for delete');
    await this.repository.delete(id);
  }

  // QueryableRepository methods
  async findOne(filter: Partial<SupplierDomainEntity>): Promise<SupplierDomainEntity | null> {
    const queryBuilder = this.repository
      .createQueryBuilder('supplier')
      .leftJoinAndSelect('supplier.user', 'user');

    if (filter.id) {
      queryBuilder.andWhere('supplier.id = :id', { id: filter.id });
    }

    if (filter.userId) {
      queryBuilder.andWhere('supplier.user_id = :userId', { userId: filter.userId });
    }

    if (filter.status) {
      queryBuilder.andWhere('supplier.status = :status', { status: filter.status });
    }

    if (filter.companyName) {
      queryBuilder.andWhere('supplier.companyName = :companyName', { companyName: filter.companyName });
    }

    if (filter.registrationNumber) {
      queryBuilder.andWhere('supplier.registrationNumber = :registrationNumber', {
        registrationNumber: filter.registrationNumber
      });
    }

    if (filter.email) {
      queryBuilder.andWhere('supplier.email = :email', { email: filter.email });
    }

    if (filter.phone) {
      queryBuilder.andWhere('supplier.phone = :phone', { phone: filter.phone });
    }

    if (filter.firstName) {
      queryBuilder.andWhere('supplier.firstName = :firstName', { firstName: filter.firstName });
    }

    if (filter.lastName) {
      queryBuilder.andWhere('supplier.lastName = :lastName', { lastName: filter.lastName });
    }

    if (filter.description) {
      queryBuilder.andWhere('supplier.description = :description', { description: filter.description });
    }

    const ormEntity = await queryBuilder.getOne();
    return ormEntity ? this.toDomainEntity(ormEntity) : null;
  }

  async findMany(filter: Partial<SupplierDomainEntity>): Promise<SupplierDomainEntity[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('supplier')
      .leftJoinAndSelect('supplier.user', 'user');

    if (filter.id) {
      queryBuilder.andWhere('supplier.id = :id', { id: filter.id });
    }

    if (filter.userId) {
      queryBuilder.andWhere('supplier.user_id = :userId', { userId: filter.userId });
    }

    if (filter.status) {
      queryBuilder.andWhere('supplier.status = :status', { status: filter.status });
    }

    if (filter.companyName) {
      queryBuilder.andWhere('supplier.companyName = :companyName', { companyName: filter.companyName });
    }

    if (filter.registrationNumber) {
      queryBuilder.andWhere('supplier.registrationNumber = :registrationNumber', {
        registrationNumber: filter.registrationNumber
      });
    }

    if (filter.email) {
      queryBuilder.andWhere('supplier.email = :email', { email: filter.email });
    }

    if (filter.phone) {
      queryBuilder.andWhere('supplier.phone = :phone', { phone: filter.phone });
    }

    if (filter.firstName) {
      queryBuilder.andWhere('supplier.firstName = :firstName', { firstName: filter.firstName });
    }

    if (filter.lastName) {
      queryBuilder.andWhere('supplier.lastName = :lastName', { lastName: filter.lastName });
    }

    if (filter.description) {
      queryBuilder.andWhere('supplier.description = :description', { description: filter.description });
    }

    if (filter.companyName && filter.companyName.includes('%')) {
      queryBuilder.andWhere('supplier.companyName LIKE :companyName', { companyName: filter.companyName });
    }

    const ormEntities = await queryBuilder.getMany();
    return ormEntities.map(this.toDomainEntity);
  }

  private toDomainEntity(ormEntity: SupplierProfileOrmEntity): SupplierDomainEntity {
    return new SupplierDomainEntity(
      ormEntity.id,
      ormEntity.user_id,
      ormEntity.companyName,
      ormEntity.registrationNumber,
      ormEntity.address,
      ormEntity.email,
      ormEntity.phone,
      ormEntity.firstName,
      ormEntity.lastName,
      ormEntity.description,
      ormEntity.documents,
      ormEntity.status as SupplierStatus,
      ormEntity.createdAt,
      ormEntity.updatedAt
    );
  }

  private toOrmEntity(domainEntity: Partial<SupplierDomainEntity>): SupplierProfileOrmEntity {
    const ormEntity = new SupplierProfileOrmEntity();

    if (domainEntity.id) ormEntity.id = domainEntity.id;
    if (domainEntity.userId) ormEntity.user_id = domainEntity.userId;
    if (domainEntity.companyName) ormEntity.companyName = domainEntity.companyName;
    if (domainEntity.registrationNumber) ormEntity.registrationNumber = domainEntity.registrationNumber;
    if (domainEntity.address) ormEntity.address = domainEntity.address;
    if (domainEntity.email) ormEntity.email = domainEntity.email;
    if (domainEntity.phone) ormEntity.phone = domainEntity.phone;
    if (domainEntity.firstName !== undefined) ormEntity.firstName = domainEntity.firstName;
    if (domainEntity.lastName !== undefined) ormEntity.lastName = domainEntity.lastName;
    if (domainEntity.description !== undefined) ormEntity.description = domainEntity.description;
    if (domainEntity.documents) ormEntity.documents = domainEntity.documents;
    if (domainEntity.status) ormEntity.status = domainEntity.status;
    if (domainEntity.createdAt) ormEntity.createdAt = domainEntity.createdAt;
    if (domainEntity.updatedAt) ormEntity.updatedAt = domainEntity.updatedAt;

    return ormEntity;
  }
}