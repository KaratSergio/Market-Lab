import {
  IsString, IsOptional, IsIn, IsUUID,
  IsNotEmpty, Min, Max, IsUrl, IsObject
} from 'class-validator';

import { Type } from 'class-transformer';
import { type CategoryStatus, CATEGORY_STATUS_VALUES } from './category.type';
import { LanguageCode, TranslatableCategoryFields } from '@domain/translations/types';


export class CreateCategoryDto {
  @IsString({ message: 'Category name must be a string' })
  @IsNotEmpty({ message: 'Category name is required' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Slug must be a string' })
  @IsNotEmpty({ message: 'Slug cannot be empty' })
  slug?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsIn(CATEGORY_STATUS_VALUES, { message: 'Invalid status' })
  status?: CategoryStatus;

  @IsOptional()
  @IsUrl({}, { message: 'Image URL must be a valid URL' })
  imageUrl?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string | null;

  @IsOptional()
  @Type(() => Number)
  @Min(0, { message: 'Order cannot be negative' })
  @Max(1000, { message: 'Order cannot exceed 1000' })
  order?: number;

  @IsOptional()
  @IsString({ message: 'Meta title must be a string' })
  @IsNotEmpty({ message: 'Meta title cannot be empty' })
  metaTitle?: string;

  @IsOptional()
  @IsString({ message: 'Meta description must be a string' })
  @IsNotEmpty({ message: 'Meta description cannot be empty' })
  metaDescription?: string;

  @IsOptional()
  @IsObject({ message: 'Translations must be an object' })
  translations?: Record<LanguageCode, Partial<Record<TranslatableCategoryFields, string>>>;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString({ message: 'Category name must be a string' })
  @IsNotEmpty({ message: 'Category name cannot be empty' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Slug must be a string' })
  @IsNotEmpty({ message: 'Slug cannot be empty' })
  slug?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsIn(CATEGORY_STATUS_VALUES, { message: 'Invalid status' })
  status?: CategoryStatus;

  @IsOptional()
  @IsUrl({}, { message: 'Image URL must be a valid URL' })
  imageUrl?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string | null;

  @IsOptional()
  @Type(() => Number)
  @Min(0, { message: 'Order cannot be negative' })
  @Max(1000, { message: 'Order cannot exceed 1000' })
  order?: number;

  @IsOptional()
  @IsString({ message: 'Meta title must be a string' })
  @IsNotEmpty({ message: 'Meta title cannot be empty' })
  metaTitle?: string;

  @IsOptional()
  @IsString({ message: 'Meta description must be a string' })
  @IsNotEmpty({ message: 'Meta description cannot be empty' })
  metaDescription?: string;

  @IsOptional()
  @IsObject({ message: 'Translations must be an object' })
  translations?: Record<LanguageCode, Partial<Record<TranslatableCategoryFields, string>>>;
}