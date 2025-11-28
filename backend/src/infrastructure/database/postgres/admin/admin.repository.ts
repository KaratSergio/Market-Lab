import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminRepository as DomainAdminRepository } from '@domain/admin/admin.repository';
import { AdminDomainEntity } from '@domain/admin/admin.entity';
import { AdminOrmEntity } from './admin.entity';
import { AdminRole, AdminStatus, ADMIN_STATUS } from '@domain/admin/types';

@Injectable()
export class PostgresAdminRepository extends DomainAdminRepository {
  constructor(
    @InjectRepository(AdminOrmEntity)
    private readonly repository: Repository<AdminOrmEntity>,
  ) {
    super();
  }

  async findAll(): Promise<AdminDomainEntity[]> {
    const ormEntities = await this.repository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    return ormEntities.map(this.toDomainEntity);
  }

  async findById(id: string): Promise<AdminDomainEntity | null> {
    if (!id) return null;
    const ormEntity = await this.repository.findOne({
      where: { id },
      relations: ['user']
    });
    return ormEntity ? this.toDomainEntity(ormEntity) : null;
  }

  async findByUserId(userId: string): Promise<AdminDomainEntity | null> {
    const ormEntity = await this.repository.findOne({
      where: { userId },
      relations: ['user']
    });
    return ormEntity ? this.toDomainEntity(ormEntity) : null;
  }

  async findByRole(role: AdminRole): Promise<AdminDomainEntity[]> {
    const ormEntities = await this.repository.find({
      where: { role },
      relations: ['user']
    });
    return ormEntities.map(this.toDomainEntity);
  }

  async findByStatus(status: AdminStatus): Promise<AdminDomainEntity[]> {
    const ormEntities = await this.repository.find({
      where: { status },
      relations: ['user']
    });
    return ormEntities.map(this.toDomainEntity);
  }

  async findByDepartment(department: string): Promise<AdminDomainEntity[]> {
    const ormEntities = await this.repository.find({
      where: { department },
      relations: ['user']
    });
    return ormEntities.map(this.toDomainEntity);
  }

  async findActiveAdmins(): Promise<AdminDomainEntity[]> {
    const ormEntities = await this.repository.find({
      where: { status: ADMIN_STATUS.ACTIVE },
      relations: ['user']
    });
    return ormEntities.map(this.toDomainEntity);
  }

  async create(data: Partial<AdminDomainEntity>): Promise<AdminDomainEntity> {
    const ormEntity = this.toOrmEntity(data);
    const savedOrmEntity = await this.repository.save(ormEntity);
    return this.toDomainEntity(savedOrmEntity);
  }

  async update(id: string, data: Partial<AdminDomainEntity>): Promise<AdminDomainEntity | null> {
    if (!id) throw new Error('Admin ID is required for update');

    await this.repository.update(id, data);
    const updatedOrmEntity = await this.repository.findOne({
      where: { id },
      relations: ['user']
    });

    return updatedOrmEntity ? this.toDomainEntity(updatedOrmEntity) : null;
  }

  async delete(id: string): Promise<void> {
    if (!id) throw new Error('Admin ID is required for delete');
    await this.repository.delete(id);
  }

  // QueryableRepository methods
  async findOne(filter: Partial<AdminDomainEntity>): Promise<AdminDomainEntity | null> {
    const queryBuilder = this.repository
      .createQueryBuilder('admin')
      .leftJoinAndSelect('admin.user', 'user');

    if (filter.id) queryBuilder.andWhere('admin.id = :id', { id: filter.id });
    if (filter.userId) queryBuilder.andWhere('admin.userId = :userId', { userId: filter.userId });
    if (filter.firstName) queryBuilder.andWhere('admin.firstName = :firstName', { firstName: filter.firstName });
    if (filter.lastName) queryBuilder.andWhere('admin.lastName = :lastName', { lastName: filter.lastName });
    if (filter.phone) queryBuilder.andWhere('admin.phone = :phone', { phone: filter.phone });
    if (filter.role) queryBuilder.andWhere('admin.role = :role', { role: filter.role });
    if (filter.status) queryBuilder.andWhere('admin.status = :status', { status: filter.status });
    if (filter.department) queryBuilder.andWhere('admin.department = :department', { department: filter.department });

    const ormEntity = await queryBuilder.getOne();
    return ormEntity ? this.toDomainEntity(ormEntity) : null;
  }

  async findMany(filter: Partial<AdminDomainEntity>): Promise<AdminDomainEntity[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('admin')
      .leftJoinAndSelect('admin.user', 'user');

    if (filter.id) queryBuilder.andWhere('admin.id = :id', { id: filter.id });
    if (filter.userId) queryBuilder.andWhere('admin.userId = :userId', { userId: filter.userId });
    if (filter.firstName) queryBuilder.andWhere('admin.firstName = :firstName', { firstName: filter.firstName });
    if (filter.lastName) queryBuilder.andWhere('admin.lastName = :lastName', { lastName: filter.lastName });
    if (filter.phone) queryBuilder.andWhere('admin.phone = :phone', { phone: filter.phone });
    if (filter.role) queryBuilder.andWhere('admin.role = :role', { role: filter.role });
    if (filter.status) queryBuilder.andWhere('admin.status = :status', { status: filter.status });
    if (filter.department) queryBuilder.andWhere('admin.department = :department', { department: filter.department });

    const ormEntities = await queryBuilder.getMany();
    return ormEntities.map(this.toDomainEntity);
  }

  // Utility methods
  async exists(id: string): Promise<boolean> {
    if (!id) return false;
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }

  async existsByUserId(userId: string): Promise<boolean> {
    if (!userId) return false;
    const count = await this.repository.count({ where: { userId } });
    return count > 0;
  }

  private toDomainEntity(ormEntity: AdminOrmEntity): AdminDomainEntity {
    return new AdminDomainEntity(
      ormEntity.id,
      ormEntity.userId,
      ormEntity.firstName,
      ormEntity.lastName,
      ormEntity.phone,
      ormEntity.role,
      ormEntity.status,
      ormEntity.permissions,
      ormEntity.department,
      ormEntity.lastActiveAt || undefined,
      ormEntity.createdAt,
      ormEntity.updatedAt
    );
  }

  private toOrmEntity(domainEntity: Partial<AdminDomainEntity>): AdminOrmEntity {
    const ormEntity = new AdminOrmEntity();

    if (domainEntity.id) ormEntity.id = domainEntity.id;
    if (domainEntity.userId) ormEntity.userId = domainEntity.userId;
    if (domainEntity.firstName) ormEntity.firstName = domainEntity.firstName;
    if (domainEntity.lastName) ormEntity.lastName = domainEntity.lastName;
    if (domainEntity.phone) ormEntity.phone = domainEntity.phone;
    if (domainEntity.role) ormEntity.role = domainEntity.role;
    if (domainEntity.status) ormEntity.status = domainEntity.status;
    if (domainEntity.permissions) ormEntity.permissions = domainEntity.permissions;
    if (domainEntity.department !== undefined) ormEntity.department = domainEntity.department;
    if (domainEntity.lastActiveAt) ormEntity.lastActiveAt = domainEntity.lastActiveAt;
    if (domainEntity.createdAt) ormEntity.createdAt = domainEntity.createdAt;
    if (domainEntity.updatedAt) ormEntity.updatedAt = domainEntity.updatedAt;

    return ormEntity;
  }
}