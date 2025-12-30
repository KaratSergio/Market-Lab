import {
  ApiProperty,
  ApiPropertyOptional
} from '@nestjs/swagger';

import {
  IsEmail, IsString, IsOptional,
  IsPhoneNumber, IsDate,
  IsObject,
} from 'class-validator';

import { Type } from 'class-transformer';


export class UpdateCustomerDtoSwagger {
  @ApiPropertyOptional({
    description: 'Customer first name',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Customer last name',
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Customer phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Customer shipping address',
    example: '123 Main St, New York, NY 10001',
  })
  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @ApiPropertyOptional({
    description: 'Customer billing address',
    example: '456 Business Ave, New York, NY 10002',
  })
  @IsOptional()
  @IsString()
  billingAddress?: string;

  @ApiPropertyOptional({
    description: 'Customer preferences (JSON object)',
    example: { newsletter: true, language: 'en' },
  })
  @IsOptional()
  @IsObject()
  preferences?: Record<string, any>;
}

export class SearchFilterDtoSwagger {
  @ApiPropertyOptional({
    description: 'Search by email address',
    example: 'customer@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Search by phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Search by first name',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Search by last name',
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Filter by account status',
    example: 'active',
    enum: ['active', 'inactive', 'suspended'],
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Created date from (ISO format)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdFrom?: Date;

  @ApiPropertyOptional({
    description: 'Created date to (ISO format)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdTo?: Date;
}

// Response DTOs
export class CustomerResponseDtoSwagger {
  @ApiProperty({
    description: 'Customer ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Associated user ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  userId: string;

  @ApiProperty({
    description: 'Customer email',
    example: 'customer@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Customer first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'Customer last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiPropertyOptional({
    description: 'Customer phone number',
    example: '+1234567890',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Shipping address',
    example: '123 Main St, New York, NY 10001',
  })
  shippingAddress?: string;

  @ApiPropertyOptional({
    description: 'Billing address',
    example: '456 Business Ave, New York, NY 10002',
  })
  billingAddress?: string;

  @ApiProperty({
    description: 'Account status',
    example: 'active',
    enum: ['active', 'inactive', 'suspended'],
  })
  status: string;

  @ApiProperty({
    description: 'Customer preferences',
    example: { newsletter: true, language: 'en', marketingEmails: false },
  })
  preferences: Record<string, any>;

  @ApiProperty({
    description: 'Total orders placed',
    example: 15,
  })
  totalOrders: number;

  @ApiProperty({
    description: 'Total spent amount',
    example: 1250.75,
  })
  totalSpent: number;

  @ApiProperty({
    description: 'Account creation date',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last profile update date',
    example: '2024-06-20T14:45:00.000Z',
  })
  updatedAt: Date;
}

export class CustomerProfileResponseDtoSwagger {
  @ApiProperty({
    description: 'Customer ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Customer email',
    example: 'customer@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Customer first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'Customer last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiPropertyOptional({
    description: 'Customer phone number',
    example: '+1234567890',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Shipping address',
    example: '123 Main St, New York, NY 10001',
  })
  shippingAddress?: string;

  @ApiPropertyOptional({
    description: 'Billing address',
    example: '456 Business Ave, New York, NY 10002',
  })
  billingAddress?: string;

  @ApiProperty({
    description: 'Account status',
    example: 'active',
  })
  status: string;

  @ApiProperty({
    description: 'Customer preferences',
    example: { newsletter: true, language: 'en' },
  })
  preferences: Record<string, any>;

  @ApiProperty({
    description: 'Account creation date',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;
}

export class CustomersListResponseDtoSwagger {
  @ApiProperty({
    description: 'List of customers',
    type: [CustomerResponseDtoSwagger],
  })
  customers: CustomerResponseDtoSwagger[];

  @ApiProperty({
    description: 'Total count of customers',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 15,
  })
  totalPages: number;
}

export class SuccessResponseDtoSwagger {
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

  @ApiPropertyOptional({
    description: 'Response data',
  })
  data?: any;
}