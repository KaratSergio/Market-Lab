import {
  IsString, IsOptional, IsIn, IsNotEmpty,
  Min, Max, IsObject, IsNumber
} from 'class-validator';

import { TAG_STATUS_VALUES, type TagStatus } from './tag.type';
import { LanguageCode, TranslatableTagFields } from '@domain/translations/types';

export class CreateTagDto {
  @IsString({ message: 'Tag name must be a string' })
  @IsNotEmpty({ message: 'Tag name is required' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Slug must be a string' })
  @IsNotEmpty({ message: 'Slug cannot be empty' })
  slug?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsIn(TAG_STATUS_VALUES, { message: 'Invalid status' })
  status?: TagStatus;

  @IsOptional()
  @IsObject({ message: 'Translations must be an object' })
  translations?: Record<LanguageCode, Partial<Record<TranslatableTagFields, string>>>;
}

export class UpdateTagDto {
  @IsOptional()
  @IsString({ message: 'Tag name must be a string' })
  @IsNotEmpty({ message: 'Tag name cannot be empty' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Slug must be a string' })
  @IsNotEmpty({ message: 'Slug cannot be empty' })
  slug?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsIn(TAG_STATUS_VALUES, { message: 'Invalid status' })
  status?: TagStatus;

  @IsOptional()
  @IsObject({ message: 'Translations must be an object' })
  translations?: Record<LanguageCode, Partial<Record<TranslatableTagFields, string>>>;
}

export class TagFiltersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(TAG_STATUS_VALUES)
  status?: TagStatus;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  @IsIn(['name', 'usageCount', 'createdAt'])
  sortBy?: string = 'usageCount';

  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}