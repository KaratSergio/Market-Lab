import {
  ApiProperty,
  ApiPropertyOptional
} from '@nestjs/swagger';

import {
  IsEmail, IsString,
  IsOptional, IsPhoneNumber,
  IsArray, IsObject, IsNumber
} from 'class-validator';


export class UpdateSupplierDtoSwagger {
  @ApiPropertyOptional({
    description: 'Company name',
    example: 'Tech Solutions Inc.',
  })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({
    description: 'Company description',
    example: 'Leading provider of technology solutions',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Contact phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Company website URL',
    example: 'https://techsolutions.example.com',
  })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({
    description: 'Business address',
    example: '123 Business St, New York, NY 10001',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Tax identification number',
    example: '123-45-6789',
  })
  @IsOptional()
  @IsString()
  taxId?: string;

  @ApiPropertyOptional({
    description: 'Business registration number',
    example: 'REG123456789',
  })
  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @ApiPropertyOptional({
    description: 'Supplier categories',
    example: ['Electronics', 'Technology'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({
    description: 'Payment terms',
    example: 'Net 30',
  })
  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @ApiPropertyOptional({
    description: 'Business preferences',
    example: { autoApproveOrders: true, notifyOnLowStock: true },
  })
  @IsOptional()
  @IsObject()
  preferences?: Record<string, any>;
}

export class UploadDocumentsDtoSwagger {
  @ApiProperty({
    description: 'Document type',
    example: 'tax_certificate',
    enum: ['tax_certificate', 'business_license', 'bank_statement', 'id_proof', 'other'],
  })
  @IsString()
  documentType: string;

  @ApiProperty({
    description: 'Files to upload',
    type: 'array',
    items: { type: 'string', format: 'binary' },
  })
  files: any[];
}

export class RejectSupplierDtoSwagger {
  @ApiProperty({
    description: 'Reason for rejection',
    example: 'Incomplete documentation provided',
    required: true,
  })
  @IsString()
  reason: string;
}

export class SuspendSupplierDtoSwagger {
  @ApiProperty({
    description: 'Reason for suspension',
    example: 'Violation of terms of service',
    required: true,
  })
  @IsString()
  reason: string;
}

export class SearchFilterDtoSwagger {
  @ApiPropertyOptional({
    description: 'Search by company name',
    example: 'Tech Solutions',
  })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({
    description: 'Search by email',
    example: 'supplier@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Search by tax ID',
    example: '123-45-6789',
  })
  @IsOptional()
  @IsString()
  taxId?: string;

  @ApiPropertyOptional({
    description: 'Filter by status',
    example: 'approved',
    enum: ['pending', 'approved', 'rejected', 'suspended', 'active'],
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by category',
    example: 'Electronics',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Minimum rating',
    example: 4.0,
    minimum: 0,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  minRating?: number;

  @ApiPropertyOptional({
    description: 'Created date from (ISO format)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsString()
  createdFrom?: string;

  @ApiPropertyOptional({
    description: 'Created date to (ISO format)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsString()
  createdTo?: string;
}

// Response DTOs
export class SupplierResponseDtoSwagger {
  @ApiProperty({
    description: 'Supplier ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Associated user ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  userId: string;

  @ApiProperty({
    description: 'Company name',
    example: 'Tech Solutions Inc.',
  })
  companyName: string;

  @ApiPropertyOptional({
    description: 'Company description',
    example: 'Leading provider of technology solutions',
  })
  description?: string;

  @ApiProperty({
    description: 'Contact email',
    example: 'contact@techsolutions.example.com',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'Contact phone number',
    example: '+1234567890',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Company website URL',
    example: 'https://techsolutions.example.com',
  })
  website?: string;

  @ApiPropertyOptional({
    description: 'Business address',
    example: '123 Business St, New York, NY 10001',
  })
  address?: string;

  @ApiPropertyOptional({
    description: 'Tax identification number',
    example: '123-45-6789',
  })
  taxId?: string;

  @ApiProperty({
    description: 'Supplier status',
    example: 'approved',
    enum: ['pending', 'approved', 'rejected', 'suspended', 'active', 'inactive'],
  })
  status: string;

  @ApiProperty({
    description: 'Approval status',
    example: 'approved',
    enum: ['pending', 'approved', 'rejected'],
  })
  approvalStatus: string;

  @ApiProperty({
    description: 'Average rating',
    example: 4.5,
    minimum: 0,
    maximum: 5,
  })
  rating: number;

  @ApiProperty({
    description: 'Total reviews count',
    example: 120,
  })
  totalReviews: number;

  @ApiProperty({
    description: 'Supplier categories',
    example: ['Electronics', 'Technology'],
    type: [String],
  })
  categories: string[];

  @ApiProperty({
    description: 'Total products listed',
    example: 45,
  })
  totalProducts: number;

  @ApiProperty({
    description: 'Total orders fulfilled',
    example: 230,
  })
  totalOrders: number;

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

export class SupplierPublicResponseDtoSwagger {
  @ApiProperty({
    description: 'Supplier ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Company name',
    example: 'Tech Solutions Inc.',
  })
  companyName: string;

  @ApiPropertyOptional({
    description: 'Company description',
    example: 'Leading provider of technology solutions',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Company website URL',
    example: 'https://techsolutions.example.com',
  })
  website?: string;

  @ApiProperty({
    description: 'Average rating',
    example: 4.5,
  })
  rating: number;

  @ApiProperty({
    description: 'Total reviews count',
    example: 120,
  })
  totalReviews: number;

  @ApiProperty({
    description: 'Supplier categories',
    example: ['Electronics', 'Technology'],
    type: [String],
  })
  categories: string[];

  @ApiProperty({
    description: 'Total products listed',
    example: 45,
  })
  totalProducts: number;

  @ApiProperty({
    description: 'Years in business',
    example: 5,
  })
  yearsInBusiness: number;
}

export class SupplierProfileResponseDtoSwagger {
  @ApiProperty({
    description: 'Supplier ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Company name',
    example: 'Tech Solutions Inc.',
  })
  companyName: string;

  @ApiPropertyOptional({
    description: 'Company description',
    example: 'Leading provider of technology solutions',
  })
  description?: string;

  @ApiProperty({
    description: 'Contact email',
    example: 'contact@techsolutions.example.com',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'Contact phone number',
    example: '+1234567890',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Company website URL',
    example: 'https://techsolutions.example.com',
  })
  website?: string;

  @ApiPropertyOptional({
    description: 'Business address',
    example: '123 Business St, New York, NY 10001',
  })
  address?: string;

  @ApiPropertyOptional({
    description: 'Tax identification number',
    example: '123-45-6789',
  })
  taxId?: string;

  @ApiProperty({
    description: 'Supplier status',
    example: 'approved',
  })
  status: string;

  @ApiProperty({
    description: 'Approval status',
    example: 'approved',
  })
  approvalStatus: string;

  @ApiProperty({
    description: 'Average rating',
    example: 4.5,
  })
  rating: number;

  @ApiProperty({
    description: 'Supplier categories',
    example: ['Electronics', 'Technology'],
    type: [String],
  })
  categories: string[];

  @ApiProperty({
    description: 'Payment terms',
    example: 'Net 30',
  })
  paymentTerms: string;

  @ApiProperty({
    description: 'Business preferences',
    example: { autoApproveOrders: true, notifyOnLowStock: true },
  })
  preferences: Record<string, any>;

  @ApiProperty({
    description: 'Account creation date',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;
}

export class SupplierDocumentResponseDtoSwagger {
  @ApiProperty({
    description: 'Document key/identifier',
    example: 'tax_certificate_2024.pdf',
  })
  key: string;

  @ApiProperty({
    description: 'Document URL',
    example: 'https://storage.example.com/documents/tax_certificate_2024.pdf',
  })
  url: string;

  @ApiProperty({
    description: 'Document type',
    example: 'tax_certificate',
  })
  documentType: string;

  @ApiProperty({
    description: 'File name',
    example: 'tax_certificate_2024.pdf',
  })
  fileName: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1048576,
  })
  fileSize: number;

  @ApiProperty({
    description: 'MIME type',
    example: 'application/pdf',
  })
  mimeType: string;

  @ApiProperty({
    description: 'Upload date',
    example: '2024-06-20T14:45:00.000Z',
  })
  uploadedAt: Date;
}

export class SuppliersListResponseDtoSwagger {
  @ApiProperty({
    description: 'List of suppliers',
    type: [SupplierResponseDtoSwagger],
  })
  suppliers: SupplierResponseDtoSwagger[];

  @ApiProperty({
    description: 'Total count of suppliers',
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