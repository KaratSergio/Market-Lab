// Use only within the domain, internal typing..
import { Entity } from "@shared/types/entity.interface";

export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
  DRAFT: 'draft'
} as const;

// for class-validator
export enum ProductStatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
  DRAFT = 'draft'
}

export type ProductStatus = typeof PRODUCT_STATUS[keyof typeof PRODUCT_STATUS];

export const DEFAULT_CATEGORY = 'general';
export const MIN_STOCK_QUANTITY = 0;
export const MAX_IMAGES_PER_PRODUCT = 10;
export const MAX_TAGS_PER_PRODUCT = 20;

export interface ProductModel extends Entity {
  name: string;
  description: string;
  price: number;
  supplierId: string;
  categoryId?: string,
  subcategoryId?: string,
  images: string[];
  stock: number;
  status: ProductStatus;
  tags: string[];
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoryWithCount {
  category: string;
  count: number;
}

export interface ProductStatistics {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  draft: number;
  totalStock: number;
  averagePrice: number;
}