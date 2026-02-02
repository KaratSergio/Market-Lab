import { BaseRepository, QueryableRepository } from '@shared/types/repository.interface';
import { Address } from './address.entity';
import { EntityRole } from '@shared/types';


export abstract class AddressRepository implements
  BaseRepository<Address>,
  QueryableRepository<Address> {

  // BaseRepository
  abstract create(data: Partial<Address>): Promise<Address>;
  abstract findById(id: string): Promise<Address | null>;
  abstract update(id: string, data: Partial<Address>): Promise<Address | null>;
  abstract delete(id: string): Promise<void>;

  // QueryableRepository
  abstract findOne(filter: Partial<Address>): Promise<Address | null>;
  abstract findMany(filter: Partial<Address>): Promise<Address[]>;
  abstract findAll(): Promise<Address[]>;

  // Address-specific
  abstract findByEntity(entityId: string, entityType: EntityRole): Promise<Address[]>;
  abstract findPrimaryByEntity(entityId: string, entityType: EntityRole): Promise<Address | null>;
}