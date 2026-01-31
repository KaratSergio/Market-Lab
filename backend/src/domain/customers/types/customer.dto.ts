import {
  IsString, IsOptional, IsObject, IsIn,
  MinLength, MaxLength, Matches,
  IsDateString, IsNumber, IsUUID
} from 'class-validator';
import { Type } from 'class-transformer';
import { type CustomerStatus, CUSTOMER_STATUS_VALUES } from './customer.type';

export class AddressDto {
  @IsString()
  @MinLength(2, { message: 'Country must be at least 2 characters' })
  country: string;

  @IsString()
  @MinLength(2, { message: 'City must be at least 2 characters' })
  city: string;

  @IsString()
  @MinLength(2, { message: 'Street must be at least 2 characters' })
  street: string;

  @IsString()
  @MinLength(1, { message: 'Building number is required' })
  building: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z0-9\s-]{3,10}$/, {
    message: 'Postal code format is invalid'
  })
  postalCode?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'State must be at least 2 characters' })
  state?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lat?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lng?: number;
}

export class CreateCustomerDto {
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  userId: string;

  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  firstName: string;

  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  lastName: string;

  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format'
  })
  phone: string;

  @IsOptional()
  @IsDateString({}, { message: 'Birthday must be a valid date' })
  birthday?: string;

  @IsOptional()
  @IsObject()
  @Type(() => AddressDto)
  address?: AddressDto;
}

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  lastName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format'
  })
  phone?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Birthday must be a valid date' })
  birthday?: string;

  @IsOptional()
  @IsObject()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsOptional()
  @IsIn(CUSTOMER_STATUS_VALUES, {
    message: `Status must be one of: ${CUSTOMER_STATUS_VALUES.join(', ')}`
  })
  status?: CustomerStatus;
}