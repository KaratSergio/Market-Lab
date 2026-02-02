import {
  IsString, IsOptional, IsEnum,
  IsUUID, IsNotEmpty, IsNumber,
  Min, Max, IsBoolean, Length, Matches

} from 'class-validator';
import { Type } from 'class-transformer';
import { type EntityRole } from '@shared/types';


export class CreateAddressDto {
  @IsUUID('4', { message: 'Entity ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Entity ID is required' })
  entityId: string;

  @IsEnum(['supplier', 'customer'], {
    message: 'Entity type must be either "supplier" or "customer"'
  })
  entityType: EntityRole;

  @IsString({ message: 'Country must be a string' })
  @IsNotEmpty({ message: 'Country is required' })
  @Length(2, 100, { message: 'Country must be between 2 and 100 characters' })
  country: string;

  @IsString({ message: 'City must be a string' })
  @IsNotEmpty({ message: 'City is required' })
  @Length(1, 100, { message: 'City must be between 1 and 100 characters' })
  city: string;

  @IsString({ message: 'Street must be a string' })
  @IsNotEmpty({ message: 'Street is required' })
  @Length(1, 200, { message: 'Street must be between 1 and 200 characters' })
  street: string;

  @IsString({ message: 'Building must be a string' })
  @IsNotEmpty({ message: 'Building is required' })
  @Length(1, 10, { message: 'Building must be between 1 and 10 characters' })
  building: string;

  @IsOptional()
  @IsString({ message: 'Postal code must be a string' })
  @Matches(/^[A-Z0-9\s-]{3,10}$/i, {
    message: 'Postal code must contain 3-10 alphanumeric characters, spaces or hyphens'
  })
  postalCode?: string;

  @IsOptional()
  @IsString({ message: 'State must be a string' })
  @Length(2, 100, { message: 'State must be between 2 and 100 characters' })
  state?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Latitude must be a number' })
  @Min(-90, { message: 'Latitude cannot be less than -90' })
  @Max(90, { message: 'Latitude cannot be greater than 90' })
  @Type(() => Number)
  lat?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Longitude must be a number' })
  @Min(-180, { message: 'Longitude cannot be less than -180' })
  @Max(180, { message: 'Longitude cannot be greater than 180' })
  @Type(() => Number)
  lng?: number;

  @IsOptional()
  @IsBoolean({ message: 'isPrimary must be a boolean' })
  @Type(() => Boolean)
  isPrimary?: boolean;
}

export class UpdateAddressDto {
  @IsOptional()
  @IsString({ message: 'Postal code must be a string' })
  @Matches(/^[A-Z0-9\s-]{3,10}$/i, {
    message: 'Postal code must contain 3-10 alphanumeric characters, spaces or hyphens'
  })
  postalCode?: string;

  @IsOptional()
  @IsString({ message: 'State must be a string' })
  @Length(2, 100, { message: 'State must be between 2 and 100 characters' })
  state?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Latitude must be a number' })
  @Min(-90, { message: 'Latitude cannot be less than -90' })
  @Max(90, { message: 'Latitude cannot be greater than 90' })
  @Type(() => Number)
  lat?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Longitude must be a number' })
  @Min(-180, { message: 'Longitude cannot be less than -180' })
  @Max(180, { message: 'Longitude cannot be greater than 180' })
  @Type(() => Number)
  lng?: number;

  @IsOptional()
  @IsBoolean({ message: 'isPrimary must be a boolean' })
  @Type(() => Boolean)
  isPrimary?: boolean;
}

export interface AddressResponseDto {
  id: string;
  country: string;
  city: string;
  street: string;
  building: string;
  postalCode?: string;
  state?: string;
  lat?: number;
  lng?: number;
  isPrimary: boolean;
  fullAddress: string;
  createdAt: Date;
  updatedAt: Date;
}