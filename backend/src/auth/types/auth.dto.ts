import { IsEmail, IsString, MinLength, IsIn, ValidateNested, IsOptional, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ROLES } from './auth.type';
import type { Role } from './auth.type';


export class RegCustomerProfileDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  phone: string;

  @IsString()
  address?: string; //! (optional)
}

export class RegSupplierProfileDto {
  @IsString()
  companyName: string;

  @IsString()
  registrationNumber: string;

  @IsString()
  phone: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsObject()
  documents?: string[];
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsIn([ROLES.CUSTOMER, ROLES.SUPPLIER])
  role: Role;

  @ValidateNested()
  @Type((obj) =>
    obj?.object?.role === ROLES.SUPPLIER
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
