import { BaseRepository, QueryableRepository } from '@shared/types/repository.interface';
import { SupplierDomainEntity } from './supplier.entity';

export abstract class SupplierRepository implements
  BaseRepository<SupplierDomainEntity>,
  QueryableRepository<SupplierDomainEntity> {
  // BaseRepository methods
  abstract create(data: Partial<SupplierDomainEntity>): Promise<SupplierDomainEntity>;
  abstract findById(id: string): Promise<SupplierDomainEntity | null>;
  abstract update(id: string, data: Partial<SupplierDomainEntity>): Promise<SupplierDomainEntity | null>;
  abstract delete(id: string): Promise<void>;

  // QueryableRepository methods
  abstract findOne(filter: Partial<SupplierDomainEntity>): Promise<SupplierDomainEntity | null>;
  abstract findMany(filter: Partial<SupplierDomainEntity>): Promise<SupplierDomainEntity[]>;
  abstract findAll(): Promise<SupplierDomainEntity[]>;

  // Supplier-specific methods
  abstract findByUserId(userId: string): Promise<SupplierDomainEntity | null>;
  abstract findByRegistrationNumber(regNumber: string): Promise<SupplierDomainEntity | null>;
  abstract findByStatus(status: string): Promise<SupplierDomainEntity[]>;
}