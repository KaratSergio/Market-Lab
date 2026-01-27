// Use it to type the incoming data
import {
  IsString, IsOptional, IsArray,
  IsEnum, IsObject, IsNotEmpty, Matches
} from 'class-validator';

import { SupplierStatus, SupplierModel, AccessibleSupplier } from './supplier.type';
import { AddressResponseDto } from '@domain/addresses/types/address.dto';
import { LanguageCode, TranslatableSupplierFields } from '@domain/translations/types';


export class CreateSupplierDto {
  @IsString({ message: 'User ID must be a string' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;

  @IsString({ message: 'Company name must be a string' })
  @IsNotEmpty({ message: 'Company name is required' })
  companyName: string;

  @IsString({ message: 'Registration number must be a string' })
  @IsNotEmpty({ message: 'Registration number is required' })
  @Matches(/^[A-Z0-9\-]+$/, { message: 'Invalid registration number format' })
  registrationNumber: string;

  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  firstName: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  lastName: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description: string;

  @IsString({ message: 'Phone must be a string' })
  @IsNotEmpty({ message: 'Phone is required' })
  @Matches(/^[\d\s\-\+\(\)]+$/, { message: 'Invalid phone number format' })
  phone: string;

  @IsOptional()
  @IsArray({ message: 'Documents must be an array' })
  @IsString({ each: true, message: 'Each document must be a string' })
  documents?: string[];

  @IsOptional()
  address?: {
    country: string;
    city: string;
    street?: string;
    building?: string;
    postalCode?: string;
    state?: string;
    lat?: number;
    lng?: number;
  };

  @IsOptional()
  @IsObject({ message: 'Translations must be an object' })
  translations?: Record<LanguageCode, Partial<Record<TranslatableSupplierFields, string>>>;
}

export class UpdateSupplierDto {
  @IsOptional()
  @IsString({ message: 'Company name must be a string' })
  companyName?: string;

  @IsOptional()
  @IsString({ message: 'Registration number must be a string' })
  @Matches(/^[A-Z0-9\-]+$/, { message: 'Invalid registration number format' })
  registrationNumber?: string;

  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  lastName?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @Matches(/^[\d\s\-\+\(\)]+$/, { message: 'Invalid phone number format' })
  phone?: string;

  @IsOptional()
  @IsArray({ message: 'Documents must be an array' })
  @IsString({ each: true, message: 'Each document must be a string' })
  documents?: string[];

  @IsOptional()
  @IsEnum(SupplierStatus, { message: 'Invalid status' })
  status?: SupplierStatus;

  @IsOptional()
  address?: {
    country: string;
    city: string;
    street?: string;
    building?: string;
    postalCode?: string;
    state?: string;
    lat?: number;
    lng?: number;
  };

  @IsOptional()
  @IsObject({ message: 'Translations must be an object' })
  translations?: Record<LanguageCode, Partial<Record<TranslatableSupplierFields, string>>>;
}

// Outgoing DTO for a profile with email
export interface SupplierProfileDto extends Omit<SupplierModel, 'translations'>, AccessibleSupplier {
  email: string;
  primaryAddress?: AddressResponseDto | null;
  addresses: AddressResponseDto[];
  translations?: Record<LanguageCode, Partial<Record<TranslatableSupplierFields, string>>>;
}

export interface SupplierPublicDto {
  id: string;
  companyName: string;
  email: string;
  phone: string;
  status: string;
  address?: {
    country: string;
    city: string;
    fullAddress: string;
  };
  translations?: Record<LanguageCode, Partial<Record<TranslatableSupplierFields, string>>>;
}