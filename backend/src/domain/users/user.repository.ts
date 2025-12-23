import { BaseRepository, QueryableRepository } from '@shared/types/repository.interface';
import { UserDomainEntity } from './user.entity';

export abstract class UserRepository implements
  BaseRepository<UserDomainEntity>,
  QueryableRepository<UserDomainEntity> {
  // BaseRepository methods
  abstract create(data: Partial<UserDomainEntity>): Promise<UserDomainEntity>;
  abstract findById(id: string): Promise<UserDomainEntity | null>;
  abstract update(id: string, data: Partial<UserDomainEntity>): Promise<UserDomainEntity | null>;
  abstract delete(id: string): Promise<void>;

  // QueryableRepository methods
  abstract findOne(filter: Partial<UserDomainEntity>): Promise<UserDomainEntity | null>;
  abstract findMany(filter: Partial<UserDomainEntity>): Promise<UserDomainEntity[]>;
  abstract findAll(): Promise<UserDomainEntity[]>;

  // User-specific methods
  abstract findByEmail(email: string): Promise<UserDomainEntity | null>;
  abstract findByRole(role: string): Promise<UserDomainEntity[]>;
  abstract findByStatus(status: string): Promise<UserDomainEntity[]>;
}