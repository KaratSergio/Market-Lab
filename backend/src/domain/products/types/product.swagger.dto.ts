import {
  ApiProperty,
  ApiPropertyOptional
} from '@nestjs/swagger';

import {
  IsString, IsNumber,
  IsOptional, IsArray, Min,
  IsUrl, IsObject
} from 'class-validator';
import { Type } from 'class-transformer';


export class CreateProductDtoSwagger {
  @ApiProperty({
    description: 'Product name',
    example: 'Gaming Laptop Pro',
    required: true,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'High-performance gaming laptop with RTX 4080',
    required: true,
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Product price',
    example: 1499.99,
    minimum: 0.01,
    required: true,
  })
  @IsNumber()
  @Min(0.01)
  price: number;

  @ApiProperty({
    description: 'Stock quantity',
    example: 50,
    minimum: 0,
    required: true,
  })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({
    description: 'Product category',
    example: 'electronics',
    required: true,
  })
  @IsString()
  category: string;

  @ApiPropertyOptional({
    description: 'Product SKU (Stock Keeping Unit)',
    example: 'LAP-GAM-PRO-001',
  })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({
    description: 'Product brand',
    example: 'TechBrand',
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({
    description: 'Product weight in kilograms',
    example: 2.5,
  })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({
    description: 'Product dimensions (LxWxH in cm)',
    example: '35x25x5',
  })
  @IsOptional()
  @IsString()
  dimensions?: string;

  @ApiPropertyOptional({
    description: 'Product specifications (JSON object)',
    example: { processor: 'Intel i9', ram: '32GB', storage: '1TB SSD' },
  })
  @IsOptional()
  @IsObject()
  specifications?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Product tags',
    example: ['gaming', 'laptop', 'high-performance'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    description: 'Product images',
    type: 'array',
    items: { type: 'string', format: 'binary' },
  })
  images: any[];
}

export class UpdateProductDtoSwagger {
  @ApiPropertyOptional({
    description: 'Product name',
    example: 'Gaming Laptop Pro Max',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'Updated description with new features',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Product price',
    example: 1599.99,
    minimum: 0.01,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  price?: number;

  @ApiPropertyOptional({
    description: 'Stock quantity',
    example: 75,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({
    description: 'Product category',
    example: 'computers',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Product status',
    example: 'active',
    enum: ['active', 'inactive', 'archived', 'draft'],
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Additional images',
    type: 'array',
    items: { type: 'string', format: 'binary' },
  })
  newImages?: any[];
}

export class PurchaseProductDtoSwagger {
  @ApiProperty({
    description: 'Quantity to purchase',
    example: 1,
    minimum: 1,
    required: true,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({
    description: 'Shipping address for this order',
    example: '123 Main St, New York, NY 10001',
  })
  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @ApiPropertyOptional({
    description: 'Notes for the supplier',
    example: 'Please include original packaging',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RestockProductDtoSwagger {
  @ApiProperty({
    description: 'Quantity to add to stock',
    example: 25,
    minimum: 1,
    required: true,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({
    description: 'Reason for restocking',
    example: 'Regular inventory replenishment',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: 'Unit cost of restocked items',
    example: 1200.00,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  unitCost?: number;
}

export class AddImagesDtoSwagger {
  @ApiProperty({
    description: 'Product images to add',
    type: 'array',
    items: { type: 'string', format: 'binary' },
  })
  images: any[];
}

export class RemoveImageDtoSwagger {
  @ApiProperty({
    description: 'URL of the image to remove',
    example: 'https://storage.example.com/images/product_123.jpg',
    required: true,
  })
  @IsString()
  @IsUrl()
  imageUrl: string;
}

export class UpdateProductStatusDtoSwagger {
  @ApiProperty({
    description: 'New product status',
    example: 'inactive',
    enum: ['active', 'inactive', 'archived', 'draft'],
    required: true,
  })
  @IsString()
  status: string;
}

// Response DTOs
export class ProductResponseDtoSwagger {
  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Gaming Laptop Pro',
  })
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'High-performance gaming laptop with RTX 4080',
  })
  description: string;

  @ApiProperty({
    description: 'Product price',
    example: 1499.99,
  })
  price: number;

  @ApiProperty({
    description: 'Stock quantity',
    example: 50,
  })
  stock: number;

  @ApiProperty({
    description: 'Product category',
    example: 'electronics',
  })
  category: string;

  @ApiPropertyOptional({
    description: 'Product SKU',
    example: 'LAP-GAM-PRO-001',
  })
  sku?: string;

  @ApiPropertyOptional({
    description: 'Product brand',
    example: 'TechBrand',
  })
  brand?: string;

  @ApiProperty({
    description: 'Product status',
    example: 'active',
    enum: ['active', 'inactive', 'archived', 'draft'],
  })
  status: string;

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
  reviewCount: number;

  @ApiProperty({
    description: 'Total sold units',
    example: 230,
  })
  soldCount: number;

  @ApiProperty({
    description: 'Supplier ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  supplierId: string;

  @ApiProperty({
    description: 'Supplier company name',
    example: 'Tech Solutions Inc.',
  })
  supplierName: string;

  @ApiProperty({
    description: 'Product images URLs',
    example: [
      'https://storage.example.com/images/product_1.jpg',
      'https://storage.example.com/images/product_2.jpg'
    ],
    type: [String],
  })
  images: string[];

  @ApiProperty({
    description: 'Product specifications',
    example: { processor: 'Intel i9', ram: '32GB', storage: '1TB SSD' },
  })
  specifications: Record<string, any>;

  @ApiProperty({
    description: 'Product tags',
    example: ['gaming', 'laptop', 'high-performance'],
    type: [String],
  })
  tags: string[];

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-06-20T14:45:00.000Z',
  })
  updatedAt: Date;
}

export class ProductPublicResponseDtoSwagger {
  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Gaming Laptop Pro',
  })
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'High-performance gaming laptop with RTX 4080',
  })
  description: string;

  @ApiProperty({
    description: 'Product price',
    example: 1499.99,
  })
  price: number;

  @ApiProperty({
    description: 'Stock availability status',
    example: 'in_stock',
    enum: ['in_stock', 'low_stock', 'out_of_stock'],
  })
  stockStatus: string;

  @ApiProperty({
    description: 'Product category',
    example: 'electronics',
  })
  category: string;

  @ApiPropertyOptional({
    description: 'Product brand',
    example: 'TechBrand',
  })
  brand?: string;

  @ApiProperty({
    description: 'Average rating',
    example: 4.5,
  })
  rating: number;

  @ApiProperty({
    description: 'Total reviews count',
    example: 120,
  })
  reviewCount: number;

  @ApiProperty({
    description: 'Supplier company name',
    example: 'Tech Solutions Inc.',
  })
  supplierName: string;

  @ApiProperty({
    description: 'Product images URLs',
    example: [
      'https://storage.example.com/images/product_1.jpg',
      'https://storage.example.com/images/product_2.jpg'
    ],
    type: [String],
  })
  images: string[];

  @ApiProperty({
    description: 'Key specifications',
    example: ['Intel i9 Processor', '32GB RAM', '1TB SSD'],
    type: [String],
  })
  keySpecifications: string[];
}

export class ProductsListResponseDtoSwagger {
  @ApiProperty({
    description: 'List of products',
    type: [ProductPublicResponseDtoSwagger],
  })
  products: ProductPublicResponseDtoSwagger[];

  @ApiProperty({
    description: 'Total count of products',
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

export class ProductStatisticsResponseDtoSwagger {
  @ApiProperty({
    description: 'Total products count',
    example: 1000,
  })
  totalProducts: number;

  @ApiProperty({
    description: 'Products by status',
    example: { active: 850, inactive: 100, archived: 50 },
  })
  byStatus: Record<string, number>;

  @ApiProperty({
    description: 'Products by category',
    example: { electronics: 300, clothing: 250, books: 150 },
  })
  byCategory: Record<string, number>;

  @ApiProperty({
    description: 'Low stock products count',
    example: 45,
  })
  lowStockCount: number;

  @ApiProperty({
    description: 'Out of stock products count',
    example: 12,
  })
  outOfStockCount: number;

  @ApiProperty({
    description: 'Total products sold this month',
    example: 1250,
  })
  monthlySales: number;

  @ApiProperty({
    description: 'Total revenue this month',
    example: 187500.75,
  })
  monthlyRevenue: number;
}

export class SuccessResponseProductDtoSwagger {
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

export class PaginationQueryDtoSwagger {
  @ApiPropertyOptional({
    description: 'Page number (default: 1)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page (default: 10, max: 100)',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;
}