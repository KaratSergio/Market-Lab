import { Type } from 'class-transformer';
import { LanguageCode, TranslatableProductFields } from '@domain/translations/types';

import {
  IsString, IsNumber, IsOptional, IsArray,
  IsIn, IsUUID, Min, IsNotEmpty, IsObject
} from 'class-validator';

import {
  PRODUCT_STATUS_VALUES, UNIT_VALUES, CURRENCIES_VALUES,
  type ProductStatus, type Unit, type Currency,
  UNITS, CURRENCIES, PRODUCT_STATUS
} from './product.type';


export class CreateProductDto {
  @IsString({ message: 'Product name must be a string' })
  @IsNotEmpty({ message: 'Product name is required' })
  name: string;

  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsOptional()
  @IsString({ message: 'Short description must be a string' })
  shortDescription?: string;

  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price cannot be negative' })
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsArray({ message: 'Images must be an array' })
  @IsString({ each: true, message: 'Each image URL must be a string' })
  images?: string[] = [];

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  subcategoryId?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Stock must be a number' })
  @Min(0, { message: 'Stock cannot be negative' })
  @Type(() => Number)
  stock?: number = 0;

  @IsOptional()
  @IsIn(PRODUCT_STATUS_VALUES, { message: 'Invalid status' })
  status?: ProductStatus = PRODUCT_STATUS.DRAFT;

  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[] = [];

  @IsOptional()
  @IsIn(UNIT_VALUES, { message: 'Invalid unit' })
  unit: Unit = UNITS.PIECE; // 'pcs'

  @IsOptional()
  @IsIn(CURRENCIES_VALUES, { message: 'Invalid currency' })
  currency: Currency = CURRENCIES.UAH; // 'UAH'

  @IsOptional()
  @IsObject({ message: 'Translations must be an object' })
  translations?: Record<LanguageCode, Partial<Record<TranslatableProductFields, string>>>;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString({ message: 'Product name must be a string' })
  @IsNotEmpty({ message: 'Product name cannot be empty' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description cannot be empty' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Short description must be a string' })
  shortDescription?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price cannot be negative' })
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  subcategoryId?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Stock must be a number' })
  @Min(0, { message: 'Stock cannot be negative' })
  @Type(() => Number)
  stock?: number;

  @IsOptional()
  @IsIn(PRODUCT_STATUS_VALUES, { message: 'Invalid status' })
  status?: ProductStatus;

  @IsOptional()
  @IsArray({ message: 'Images must be an array' })
  @IsString({ each: true, message: 'Each image URL must be a string' })
  images?: string[];

  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];

  @IsOptional()
  @IsIn(UNIT_VALUES, { message: 'Invalid unit' })
  unit?: Unit;

  @IsOptional()
  @IsIn(CURRENCIES_VALUES, { message: 'Invalid currency' })
  currency?: Currency;

  @IsOptional()
  @IsObject({ message: 'Translations must be an object' })
  translations?: Record<LanguageCode, Partial<Record<TranslatableProductFields, string>>>;
}

export class RestockProductDto {
  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(1, { message: 'Quantity must be at least 1' })
  @Type(() => Number)
  quantity: number;
}

export class PurchaseProductDto {
  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(1, { message: 'Quantity must be at least 1' })
  @Type(() => Number)
  quantity: number;
}

export class UpdateProductStatusDto {
  @IsIn(PRODUCT_STATUS_VALUES, { message: 'Invalid status' })
  @IsNotEmpty({ message: 'Status is required' })
  status: ProductStatus;
}