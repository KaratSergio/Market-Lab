import { BaseRepository, QueryableRepository } from '@shared/types/repository.interface';
import { CustomerDomainEntity } from './customer.entity';

export abstract class CustomerRepository implements
  BaseRepository<CustomerDomainEntity>,
  QueryableRepository<CustomerDomainEntity> {
  // BaseRepository methods
  abstract create(data: Partial<CustomerDomainEntity>): Promise<CustomerDomainEntity>;
  abstract findById(id: string): Promise<CustomerDomainEntity | null>;
  abstract update(id: string, data: Partial<CustomerDomainEntity>): Promise<CustomerDomainEntity | null>;
  abstract delete(id: string): Promise<void>;

  // QueryableRepository methods
  abstract findOne(filter: Partial<CustomerDomainEntity>): Promise<CustomerDomainEntity | null>;
  abstract findMany(filter: Partial<CustomerDomainEntity>): Promise<CustomerDomainEntity[]>;
  abstract findAll(): Promise<CustomerDomainEntity[]>;

  // Customer-specific methods
  abstract findByUserId(userId: string): Promise<CustomerDomainEntity | null>;
  abstract findByEmail(email: string): Promise<CustomerDomainEntity | null>;
}