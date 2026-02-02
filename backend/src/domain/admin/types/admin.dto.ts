import {
  IsString, IsOptional, IsArray, IsEnum, IsIn,
  IsUUID, IsNotEmpty, IsEmail, IsNumber,
  Min, Max, IsObject, IsDate, Length, Matches,
  ArrayNotEmpty, ValidateNested
} from 'class-validator';

import { Type } from 'class-transformer';
import { type AdminStatus, ADMIN_STATUS_VALUES } from "./admin.type";
import { Role } from '@shared/types';


class AdminAddressDto {
  @IsOptional()
  @IsString({ message: 'Country must be a string' })
  @Length(2, 100, { message: 'Country must be between 2 and 100 characters' })
  country?: string;

  @IsOptional()
  @IsString({ message: 'City must be a string' })
  @Length(1, 100, { message: 'City must be between 1 and 100 characters' })
  city?: string;

  @IsOptional()
  @IsString({ message: 'Street must be a string' })
  @Length(1, 200, { message: 'Street must be between 1 and 200 characters' })
  street?: string;

  @IsOptional()
  @IsString({ message: 'Building must be a string' })
  @Length(1, 10, { message: 'Building must be between 1 and 10 characters' })
  building?: string;

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
  lat?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Longitude must be a number' })
  @Min(-180, { message: 'Longitude cannot be less than -180' })
  @Max(180, { message: 'Longitude cannot be greater than 180' })
  lng?: number;
}

export class CreateAdminDto {
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  @Length(6, 100, { message: 'Password must be between 6 and 100 characters' })
  password?: string;

  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;

  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  @Length(1, 100, { message: 'First name must be between 1 and 100 characters' })
  firstName: string;

  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  @Length(1, 100, { message: 'Last name must be between 1 and 100 characters' })
  lastName: string;

  @IsString({ message: 'Phone must be a string' })
  @IsNotEmpty({ message: 'Phone is required' })
  @Matches(/^[+]?[\d\s\-()]{6,20}$/, {
    message: 'Phone must be a valid phone number (6-20 digits, can start with +)'
  })
  phone: string;

  @IsArray({ message: 'Roles must be an array' })
  @ArrayNotEmpty({ message: 'At least one role is required' })
  @IsEnum(Role, { each: true, message: 'Each role must be a valid Role enum value' })
  roles: Role[];

  @IsOptional()
  @IsObject({ message: 'Address must be an object' })
  @ValidateNested()
  @Type(() => AdminAddressDto)
  address?: AdminAddressDto;

  @IsOptional()
  @IsString({ message: 'Department must be a string' })
  @Length(1, 100, { message: 'Department must be between 1 and 100 characters' })
  department?: string;
}

export class UpdateAdminDto {
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  @Length(6, 100, { message: 'Password must be between 6 and 100 characters' })
  password?: string;

  @IsOptional()
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  userId?: string;

  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @Length(1, 100, { message: 'First name must be between 1 and 100 characters' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @Length(1, 100, { message: 'Last name must be between 1 and 100 characters' })
  lastName?: string;

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @Matches(/^[+]?[\d\s\-()]{6,20}$/, {
    message: 'Phone must be a valid phone number (6-20 digits, can start with +)'
  })
  phone?: string;

  @IsOptional()
  @IsArray({ message: 'Roles must be an array' })
  @IsEnum(Role, { each: true, message: 'Each role must be a valid Role enum value' })
  roles?: Role[];

  @IsOptional()
  @IsObject({ message: 'Address must be an object' })
  @ValidateNested()
  @Type(() => AdminAddressDto)
  address?: AdminAddressDto;

  @IsOptional()
  @IsString({ message: 'Department must be a string' })
  @Length(1, 100, { message: 'Department must be between 1 and 100 characters' })
  department?: string;

  @IsOptional()
  @IsIn(ADMIN_STATUS_VALUES, { message: 'Status must be a valid AdminStatus value' })
  status?: AdminStatus;

  @IsOptional()
  @IsDate({ message: 'Last active date must be a valid date' })
  @Type(() => Date)
  lastActiveAt?: Date;
}