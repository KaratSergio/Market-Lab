import { ProductDomainEntity } from './product.entity';
import { ProductStatus } from './types';

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
  abstract findById(id: string): Promise<ProductDomainEntity | null>;
  abstract update(id: string, data: Partial<ProductDomainEntity>): Promise<ProductDomainEntity | null>;
  abstract delete(id: string): Promise<void>;

  // QueryableRepository methods
  abstract findOne(filter: Partial<ProductDomainEntity>): Promise<ProductDomainEntity | null>;
  abstract findMany(filter: Partial<ProductDomainEntity>): Promise<ProductDomainEntity[]>;
  abstract findAll(): Promise<ProductDomainEntity[]>;

  // UtilityRepository methods
  abstract exists(id: string): Promise<boolean>;

  // PaginableRepository methods
  abstract findWithPagination(
    page: number,
    limit: number,
    filter?: Partial<ProductDomainEntity>
  ): Promise<{
    data: ProductDomainEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;

  // Product-specific methods

  // Search by supplier
  abstract findBySupplierId(supplierId: string): Promise<ProductDomainEntity[]>;

  // Search by status
  abstract findByStatus(status: ProductStatus): Promise<ProductDomainEntity[]>;

  // Search for active products
  abstract findActive(): Promise<ProductDomainEntity[]>;

  // Search by price range
  abstract findByPriceRange(min: number, max: number): Promise<ProductDomainEntity[]>;

  // Search by tags
  abstract findByTags(tags: string[]): Promise<ProductDomainEntity[]>;

  // Search by name
  abstract findByName(name: string): Promise<ProductDomainEntity | null>;

  // Search by part of the name
  abstract searchByName(name: string): Promise<ProductDomainEntity[]>;

  // Search by text in the title and description
  abstract searchByText(text: string): Promise<ProductDomainEntity[]>;

  // Check if the product exists at the supplier's location
  abstract existsBySupplierAndName(supplierId: string, name: string): Promise<boolean>;

  // Get the number of products from the supplier
  abstract countBySupplier(supplierId: string): Promise<number>;

  // Get status statistics
  abstract countByStatus(status: ProductStatus): Promise<number>;

  // Getting products with sorting
  abstract findSorted(
    sortBy: keyof ProductDomainEntity,
    order: 'ASC' | 'DESC'
  ): Promise<ProductDomainEntity[]>;

  // Update product status
  abstract updateStatus(id: string, status: ProductStatus): Promise<ProductDomainEntity | null>;

  // Update inventory
  abstract updateStock(id: string, stock: number): Promise<ProductDomainEntity | null>;

  // Increase inventory
  abstract increaseStock(id: string, quantity: number): Promise<ProductDomainEntity | null>;

  // Decrease inventory
  abstract decreaseStock(id: string, quantity: number): Promise<ProductDomainEntity | null>;

  // Update price
  abstract updatePrice(id: string, price: number): Promise<ProductDomainEntity | null>;

  // Get products with low stock
  abstract findLowStock(threshold?: number): Promise<ProductDomainEntity[]>;

  // Getting products by ID array
  abstract findByIds(ids: string[]): Promise<ProductDomainEntity[]>;

  // Search by category ID
  abstract findByCategoryId(categoryId: string): Promise<ProductDomainEntity[]>;

  // Search by subcategory ID
  abstract findBySubcategoryId(subcategoryId: string): Promise<ProductDomainEntity[]>;

  // Search by category and subcategory
  abstract findByCategoryAndSubcategory(
    categoryId: string,
    subcategoryId?: string
  ): Promise<ProductDomainEntity[]>;

  // Getting statistics
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