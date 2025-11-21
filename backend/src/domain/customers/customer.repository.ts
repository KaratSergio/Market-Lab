import { BaseRepository } from '@shared/interfaces/repository.interface';
import { CustomerDomainEntity } from './customer.entity';

export abstract class CustomerRepository implements BaseRepository<CustomerDomainEntity> {
  abstract findAll(): Promise<CustomerDomainEntity[]>;
  abstract findById(id: string): Promise<CustomerDomainEntity | null>;
  abstract findByEmail(email: string): Promise<CustomerDomainEntity | null>;
  abstract create(customer: CustomerDomainEntity): Promise<CustomerDomainEntity>;
  abstract update(id: string, customer: CustomerDomainEntity): Promise<CustomerDomainEntity>;
  abstract delete(id: string): Promise<void>;
}