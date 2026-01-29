import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository as DomainUserRepository } from '@domain/users/user.repository';
import { UserDomainEntity } from '@domain/users/user.entity';
import { UserOrmEntity } from './user.entity';
import { UserStatus, UserRole } from '@domain/users/types';


@Injectable()
export class PostgresUserRepository extends DomainUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {
    super();
  }

  async findAll(): Promise<UserDomainEntity[]> {
    const ormEntities = await this.repository.find({
      relations: ['customerProfile', 'supplierProfile'],
      order: { createdAt: 'DESC' },
    });
    return ormEntities.map(this.toDomainEntity);
  }

  async findById(id: string): Promise<UserDomainEntity | null> {
    if (!id) return null;
    const ormEntity = await this.repository.findOne({
      where: { id },
      relations: ['customerProfile', 'supplierProfile']
    });
    return ormEntity ? this.toDomainEntity(ormEntity) : null;
  }

  async findByEmail(email: string): Promise<UserDomainEntity | null> {
    const ormEntity = await this.repository.findOne({
      where: { email },
      relations: ['customerProfile', 'supplierProfile']
    });
    return ormEntity ? this.toDomainEntity(ormEntity) : null;
  }

  async findByRole(role: string): Promise<UserDomainEntity[]> {
    const ormEntities = await this.repository
      .createQueryBuilder('user')
      .where('user.roles LIKE :role', { role: `%${role}%` })
      .leftJoinAndSelect('user.customerProfile', 'customerProfile')
      .leftJoinAndSelect('user.supplierProfile', 'supplierProfile')
      .getMany();

    return ormEntities.map(this.toDomainEntity);
  }

  async findByStatus(status: string): Promise<UserDomainEntity[]> {
    const ormEntities = await this.repository.find({
      where: { status },
      relations: ['customerProfile', 'supplierProfile']
    });
    return ormEntities.map(this.toDomainEntity);
  }

  async create(data: Partial<UserDomainEntity>): Promise<UserDomainEntity> {
    const ormEntity = this.toOrmEntity(data);
    const savedOrmEntity = await this.repository.save(ormEntity);
    return this.toDomainEntity(savedOrmEntity);
  }

  async update(id: string, data: Partial<UserDomainEntity>): Promise<UserDomainEntity | null> {
    if (!id) throw new Error('User ID is required for update');

    await this.repository.update(id, data);
    const updatedOrmEntity = await this.repository.findOne({
      where: { id },
      relations: ['customerProfile', 'supplierProfile']
    });

    return updatedOrmEntity ? this.toDomainEntity(updatedOrmEntity) : null;
  }

  async delete(id: string): Promise<void> {
    if (!id) throw new Error('User ID is required for delete');
    await this.repository.delete(id);
  }

  // QueryableRepository methods
  async findOne(filter: Partial<UserDomainEntity>): Promise<UserDomainEntity | null> {
    const queryBuilder = this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.customerProfile', 'customerProfile')
      .leftJoinAndSelect('user.supplierProfile', 'supplierProfile');

    if (filter.id) queryBuilder.andWhere('user.id = :id', { id: filter.id });
    if (filter.email) queryBuilder.andWhere('user.email = :email', { email: filter.email });
    if (filter.status) queryBuilder.andWhere('user.status = :status', { status: filter.status });
    if (filter.emailVerified !== undefined) {
      queryBuilder.andWhere('user.emailVerified = :emailVerified', { emailVerified: filter.emailVerified });
    }

    if (filter.roles && filter.roles.length > 0) {
      queryBuilder.andWhere('user.roles LIKE ANY(:roles)', {
        roles: filter.roles.map(role => `%${role}%`)
      });
    }

    const ormEntity = await queryBuilder.getOne();
    return ormEntity ? this.toDomainEntity(ormEntity) : null;
  }

  async findMany(filter: Partial<UserDomainEntity>): Promise<UserDomainEntity[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.customerProfile', 'customerProfile')
      .leftJoinAndSelect('user.supplierProfile', 'supplierProfile');

    if (filter.id) queryBuilder.andWhere('user.id = :id', { id: filter.id });
    if (filter.email) queryBuilder.andWhere('user.email = :email', { email: filter.email });
    if (filter.status) queryBuilder.andWhere('user.status = :status', { status: filter.status });
    if (filter.emailVerified !== undefined) {
      queryBuilder.andWhere('user.emailVerified = :emailVerified', { emailVerified: filter.emailVerified });
    }

    if (filter.roles && filter.roles.length > 0) {
      queryBuilder.andWhere('user.roles LIKE ANY(:roles)', {
        roles: filter.roles.map(role => `%${role}%`)
      });
    }

    const ormEntities = await queryBuilder.getMany();
    return ormEntities.map(this.toDomainEntity);
  }

  async findByGoogleId(googleId: string): Promise<UserDomainEntity | null> {
    if (!googleId) return null;

    const ormEntity = await this.repository.findOne({
      where: { googleId },
      relations: ['customerProfile', 'supplierProfile']
    });

    return ormEntity ? this.toDomainEntity(ormEntity) : null;
  }

  // Utility methods
  async exists(id: string): Promise<boolean> {
    if (!id) return false;
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }

  private toDomainEntity(ormEntity: UserOrmEntity): UserDomainEntity {
    return new UserDomainEntity(
      ormEntity.id,
      ormEntity.email,
      ormEntity.password,
      ormEntity.roles as UserRole[],
      ormEntity.status as UserStatus,
      ormEntity.emailVerified,
      ormEntity.regComplete,
      ormEntity.googleId || undefined,
      ormEntity.lastLoginAt,
      ormEntity.createdAt,
      ormEntity.updatedAt
    );
  }

  private toOrmEntity(domainEntity: Partial<UserDomainEntity>): UserOrmEntity {
    const ormEntity = new UserOrmEntity();

    if (domainEntity.id) ormEntity.id = domainEntity.id;
    if (domainEntity.email) ormEntity.email = domainEntity.email;
    if (domainEntity.passwordHash) ormEntity.password = domainEntity.passwordHash;
    if (domainEntity.roles) ormEntity.roles = domainEntity.roles;
    if (domainEntity.status) ormEntity.status = domainEntity.status;
    if (domainEntity.emailVerified !== undefined) ormEntity.emailVerified = domainEntity.emailVerified;
    if (domainEntity.regComplete !== undefined) ormEntity.regComplete = domainEntity.regComplete;
    if (domainEntity.lastLoginAt) ormEntity.lastLoginAt = domainEntity.lastLoginAt;
    if (domainEntity.createdAt) ormEntity.createdAt = domainEntity.createdAt;
    if (domainEntity.updatedAt) ormEntity.updatedAt = domainEntity.updatedAt;

    return ormEntity;
  }
}