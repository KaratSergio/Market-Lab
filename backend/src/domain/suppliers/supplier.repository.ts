import { SupplierDomainEntity } from './supplier.entity';
import { LanguageCode } from '@domain/translations/types';

import {
  BaseRepository,
  QueryableRepository,
  PaginableRepository
} from '@shared/types/repository.interface';


export abstract class SupplierRepository implements
  BaseRepository<SupplierDomainEntity>,
  QueryableRepository<SupplierDomainEntity>,
  PaginableRepository<SupplierDomainEntity> {

  // BaseRepository methods
  abstract create(data: Partial<SupplierDomainEntity>, languageCode?: LanguageCode): Promise<SupplierDomainEntity>;
  abstract findById(id: string, languageCode?: LanguageCode): Promise<SupplierDomainEntity | null>;
  abstract update(id: string, data: Partial<SupplierDomainEntity>, languageCode?: LanguageCode): Promise<SupplierDomainEntity | null>;
  abstract delete(id: string): Promise<void>;

  // QueryableRepository methods
  abstract findOne(filter: Partial<SupplierDomainEntity>, languageCode?: LanguageCode): Promise<SupplierDomainEntity | null>;
  abstract findMany(filter: Partial<SupplierDomainEntity>, languageCode?: LanguageCode): Promise<SupplierDomainEntity[]>;
  abstract findAll(languageCode?: LanguageCode): Promise<SupplierDomainEntity[]>;

  // Supplier-specific methods
  abstract findByUserId(userId: string, languageCode?: LanguageCode): Promise<SupplierDomainEntity | null>;
  abstract findByRegistrationNumber(regNumber: string, languageCode?: LanguageCode): Promise<SupplierDomainEntity | null>;
  abstract findByStatus(status: string, languageCode?: LanguageCode): Promise<SupplierDomainEntity[]>;

  // PaginableRepository methods
  abstract findWithPagination(
    page: number,
    limit: number,
    filter?: Partial<SupplierDomainEntity>,
    languageCode?: LanguageCode
  ): Promise<{
    data: SupplierDomainEntity[];
    total: number;
    page: number;
    totalPages: number;
  }>;
}