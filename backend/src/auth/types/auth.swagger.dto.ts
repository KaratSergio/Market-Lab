// src/auth/dto/auth.swagger.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsArray, IsEnum, IsNotEmpty, IsBoolean } from 'class-validator';
import { Role } from '@shared/types';

export class RegisterInitialDtoSwagger {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password (minimum 6 characters)',
    example: 'password123',
    minLength: 6,
    required: true,
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;
}

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegCompleteDtoSwagger {
  @ApiProperty({
    description: 'Selected user role',
    enum: Role,
    example: Role.CUSTOMER,
    required: true,
  })
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Company name (required for suppliers)',
    example: 'Tech Corp Ltd.',
  })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({
    description: 'Tax ID (required for suppliers)',
    example: '123456789',
  })
  @IsOptional()
  @IsString()
  taxId?: string;
}

export class RegSupplierProfileDtoSwagger {
  @ApiProperty({
    required: true,
    description: 'Contact person name'
  })
  firstName: string;

  @ApiProperty({
    required: true,
    description: 'Contact person surname'
  })
  lastName: string;

  @ApiProperty({
    description: 'Company name',
    example: 'Tech Corp Ltd.',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({
    description: 'Tax ID number',
    example: '123456789',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @ApiProperty({
    required: true,
    description: 'Phone number'
  })
  phone: string;

  @ApiProperty({
    required: true,
    description: 'Company address'
  })
  address: string;

  @ApiPropertyOptional({
    required: true,
    description: 'Business description',
    example: 'Technology solutions provider',
  })
  @IsString()
  description: string;

  @ApiProperty({
    required: true,
    type: [String],
    description: 'URL company documents'
  })
  documents: string[];
}

export class GoogleAuthDtoSwagger {
  @ApiProperty({
    description: 'Google ID token',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;

  @ApiPropertyOptional({
    description: 'Google access token',
    example: 'ya29.a0AfH6SMB...',
  })
  @IsOptional()
  @IsString()
  accessToken?: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token',
    example: 'abc123def456',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'New password (minimum 6 characters)',
    example: 'newPassword123',
    minLength: 6,
    required: true,
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  newPassword: string;
}

export class EmailResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'If the email exists, verification instructions have been sent',
  })
  message: string;
}

export class SuccessResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Operation completed successfully',
  })
  message: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Token type',
    example: 'Bearer',
  })
  token_type: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 3600,
  })
  expires_in: number;

  @ApiProperty({
    description: 'User information',
    type: Object,
  })
  user: any;
}