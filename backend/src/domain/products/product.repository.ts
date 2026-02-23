import { ProductDomainEntity } from './product.entity';
import { ProductStatus } from './types';
import { LanguageCode } from '@domain/translations/types';

import {
  BaseRepository,
  QueryableRepository,
  UtilityRepository,
  PaginableRepository,
} from '@shared/types/repository.interface';

export abstract class ProductRepository implements
  BaseRepository<ProductDomainEntity>,
  QueryableRepository<ProductDomainEntity>,
  UtilityRepository<ProductDomainEntity>,
  PaginableRepository<ProductDomainEntity> {

  // BaseRepository methods
  abstract create(data: Partial<ProductDomainEntity>): Promise<ProductDomainEntity>;
  abstract findById(id: string, languageCode?: LanguageCode): Promise<ProductDomainEntity | null>;
  abstract update(id: string, data: Partial<ProductDomainEntity>): Promise<ProductDomainEntity | null>;
  abstract delete(id: string): Promise<void>;

  // QueryableRepository methods
  abstract findOne(filter: Partial<ProductDomainEntity>, languageCode?: LanguageCode): Promise<ProductDomainEntity | null>;
  abstract findMany(filter: Partial<ProductDomainEntity>, languageCode?: LanguageCode): Promise<ProductDomainEntity[]>;
  abstract findAll(languageCode?: LanguageCode): Promise<ProductDomainEntity[]>;

  // UtilityRepository methods
  abstract exists(id: string): Promise<boolean>;

  // PaginableRepository methods
  abstract findWithPagination(
    page: number,
    limit: number,
    filter?: Partial<ProductDomainEntity>,
    languageCode?: LanguageCode,
    sortBy?: keyof ProductDomainEntity,
    sortOrder?: 'ASC' | 'DESC',
    stock?: 'in-stock' | 'low-stock' | 'out-of-stock'
  ): Promise<{
    data: ProductDomainEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;

  // Product-specific methods
  abstract findBySupplierId(supplierId: string, languageCode?: LanguageCode): Promise<ProductDomainEntity[]>;
  abstract findByStatus(status: ProductStatus, languageCode?: LanguageCode): Promise<ProductDomainEntity[]>;
  abstract findActive(languageCode?: LanguageCode): Promise<ProductDomainEntity[]>;
  abstract findByPriceRange(min: number, max: number, languageCode?: LanguageCode): Promise<ProductDomainEntity[]>;
  abstract findByTags(tags: string[], languageCode?: LanguageCode): Promise<ProductDomainEntity[]>;
  abstract findByName(name: string, languageCode?: LanguageCode): Promise<ProductDomainEntity | null>;
  abstract searchByName(name: string, languageCode?: LanguageCode): Promise<ProductDomainEntity[]>;
  abstract searchByText(text: string, languageCode?: LanguageCode): Promise<ProductDomainEntity[]>;
  abstract existsBySupplierAndName(supplierId: string, name: string): Promise<boolean>;
  abstract countBySupplier(supplierId: string): Promise<number>;
  abstract countByStatus(status: ProductStatus): Promise<number>;
  abstract findSorted(sortBy: keyof ProductDomainEntity, order: 'ASC' | 'DESC', languageCode?: LanguageCode): Promise<ProductDomainEntity[]>;
  abstract updateStatus(id: string, status: ProductStatus, languageCode?: LanguageCode): Promise<ProductDomainEntity | null>;
  abstract updateStock(id: string, stock: number, languageCode?: LanguageCode): Promise<ProductDomainEntity | null>;
  abstract increaseStock(id: string, quantity: number, languageCode?: LanguageCode): Promise<ProductDomainEntity | null>;
  abstract decreaseStock(id: string, quantity: number, languageCode?: LanguageCode): Promise<ProductDomainEntity | null>;
  abstract updatePrice(id: string, price: number, languageCode?: LanguageCode): Promise<ProductDomainEntity | null>;
  abstract findLowStock(threshold?: number, languageCode?: LanguageCode): Promise<ProductDomainEntity[]>;
  abstract findByIds(ids: string[], languageCode?: LanguageCode): Promise<ProductDomainEntity[]>;
  abstract findByCategoryId(categoryId: string, languageCode?: LanguageCode): Promise<ProductDomainEntity[]>;
  abstract findBySubcategoryId(subcategoryId: string, languageCode?: LanguageCode): Promise<ProductDomainEntity[]>;
  abstract findByCategoryAndSubcategory(categoryId: string, subcategoryId?: string, languageCode?: LanguageCode): Promise<ProductDomainEntity[]>;

  // Statistics
  abstract getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    archived: number;
    draft: number;
    totalStock: number;
    averagePrice: number;
  }>;
}