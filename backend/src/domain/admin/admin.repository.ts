import { BaseRepository, QueryableRepository } from '@shared/interfaces/repository.interface';
import { AdminDomainEntity } from './admin.entity';
import { AdminRole, AdminStatus } from './types';

export abstract class AdminRepository implements
  BaseRepository<AdminDomainEntity>,
  QueryableRepository<AdminDomainEntity> {

  // BaseRepository methods
  abstract create(data: Partial<AdminDomainEntity>): Promise<AdminDomainEntity>;
  abstract findById(id: string): Promise<AdminDomainEntity | null>;
  abstract update(id: string, data: Partial<AdminDomainEntity>): Promise<AdminDomainEntity | null>;
  abstract delete(id: string): Promise<void>;

  // QueryableRepository methods
  abstract findOne(filter: Partial<AdminDomainEntity>): Promise<AdminDomainEntity | null>;
  abstract findMany(filter: Partial<AdminDomainEntity>): Promise<AdminDomainEntity[]>;
  abstract findAll(): Promise<AdminDomainEntity[]>;

  // Admin-specific methods
  abstract findByUserId(userId: string): Promise<AdminDomainEntity | null>;
  abstract findByRole(role: AdminRole): Promise<AdminDomainEntity[]>;
  abstract findByStatus(status: AdminStatus): Promise<AdminDomainEntity[]>;
  abstract findByDepartment(department: string): Promise<AdminDomainEntity[]>;
  abstract findActiveAdmins(): Promise<AdminDomainEntity[]>;
}