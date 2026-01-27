import {
  IsEmail, IsString,
  MinLength, IsEnum,
  ValidateNested, IsOptional,
  IsObject, IsArray,
  IsNumber, IsDateString,
  IsNotEmpty, IsBoolean
} from 'class-validator';

import { Type } from 'class-transformer';
import { LanguageCode, TranslatableSupplierFields } from '@domain/translations/types';
import { Role } from '@shared/types';

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  building: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}


export class RegCustomerProfileDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  phone: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;
}

export class RegSupplierProfileDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  companyName: string;

  @IsString()
  registrationNumber: string;

  @IsString()
  phone: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];

  @IsOptional()
  @IsObject({ message: 'Translations must be an object' })
  translations?: Record<LanguageCode, Partial<Record<TranslatableSupplierFields, string>>>;
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(Role)
  role: Role;

  @ValidateNested()
  @Type((obj) =>
    obj?.object?.role === Role.SUPPLIER
      ? RegSupplierProfileDto
      : RegCustomerProfileDto
  )
  profile: RegCustomerProfileDto | RegSupplierProfileDto;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class RegisterInitialDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  googleId?: string;

  @IsOptional()
  @IsString()
  facebookId?: string;
}

export class RegCompleteDto {
  @IsEnum(Role)
  role: Role;

  @ValidateNested()
  @Type((obj) =>
    obj?.object?.role === Role.SUPPLIER
      ? RegSupplierProfileDto
      : RegCustomerProfileDto
  )
  profile: RegCustomerProfileDto | RegSupplierProfileDto;
}

export class CheckRegStatusDto {
  @IsEmail()
  email: string;
}

export class AuthResponseDto {
  @IsString()
  access_token: string;

  @IsObject()
  user: {
    id: string;
    email: string;
    roles: Role[];
    regComplete: boolean;
    emailVerified: boolean;
    firstName?: string;
    lastName?: string;
  };
}