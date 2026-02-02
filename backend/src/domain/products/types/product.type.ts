import { Entity } from "@shared/types/entity.interface";
import { WithTranslations } from "@domain/translations/types";


export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
  DRAFT: 'draft'
} as const;

export type ProductStatus = typeof PRODUCT_STATUS[keyof typeof PRODUCT_STATUS];
export const PRODUCT_STATUS_VALUES = Object.values(PRODUCT_STATUS)

export const DEFAULT_CATEGORY = 'general';
export const MIN_STOCK_QUANTITY = 0;
export const MAX_IMAGES_PER_PRODUCT = 10;
export const MAX_TAGS_PER_PRODUCT = 20;

export interface ProductModel extends Entity, WithTranslations<'product'> {
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  supplierId: string;
  categoryId?: string,
  subcategoryId?: string,
  images: string[];
  stock: number;
  status: ProductStatus;
  tags: string[];
  unit: Unit;
  currency: Currency;
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

export const UNITS = {
  KILOGRAM: 'kg',
  GRAM: 'g',
  LITER: 'l',
  MILLILITER: 'ml',
  PIECE: 'pcs'
} as const;

export type Unit = typeof UNITS[keyof typeof UNITS];
export const UNIT_VALUES = Object.values(UNITS)

export const CURRENCIES = {
  UAH: 'UAH',
  USD: 'USD',
  EUR: 'EUR'
} as const;

export type Currency = typeof CURRENCIES[keyof typeof CURRENCIES];
export const CURRENCIES_VALUES = Object.values(CURRENCIES)