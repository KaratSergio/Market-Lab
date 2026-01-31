import { IsEmail, IsString, IsArray, IsOptional, IsBoolean, IsDate, MinLength, Matches, IsIn } from 'class-validator';
import { USER_ROLE_VALUES, type UserRole } from './user.type';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  })
  password: string;

  @IsArray()
  @IsIn(USER_ROLE_VALUES, { each: true })
  roles: UserRole[];
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @IsOptional()
  @IsString()
  passwordHash?: string;

  @IsOptional()
  @IsArray()
  @IsIn(USER_ROLE_VALUES, { each: true })
  roles?: UserRole[];

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastLoginAt?: Date;
}

export class RegisterUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  })
  password: string;

  @IsIn(USER_ROLE_VALUES, { each: true })
  role: UserRole; // One role upon registration (customer or supplier)
}