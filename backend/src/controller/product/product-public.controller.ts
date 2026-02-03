import { ProductService } from '@domain/products/services/product.service';
import type { LanguageCode } from '@domain/translations/types';
import { ProductDomainEntity } from '@domain/products/product.entity';
import { Locale } from '@shared/decorators';

import {
  Controller, Get, Param,
  Query, ParseUUIDPipe
} from '@nestjs/common';

import {
  ApiTags, ApiOperation,
  ApiResponse, ApiParam, ApiQuery
} from '@nestjs/swagger';

import {
  ProductsListResponseDtoSwagger,
  ProductPublicResponseDtoSwagger,
} from '@domain/products/types';


@ApiTags('products')
@Controller('products')
export class ProductPublicController {
  constructor(private readonly productService: ProductService) { }

  @Get()
  @ApiOperation({
    summary: 'Get all products (Public)',
    description: 'Retrieves products with optional filtering, pagination, and search.'
  })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, description: 'Search query' })
  @ApiQuery({ name: 'id', required: false, description: 'Category ID for filtering' })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['price', 'name', 'createdAt', 'stock'],
    description: 'Field to sort by'
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort order (ASC or DESC)'
  })
  @ApiResponse({ status: 200, type: ProductsListResponseDtoSwagger })
  async findAll(
    @Locale() locale: LanguageCode,
    @Query('id') id?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: 'price' | 'name' | 'createdAt' | 'stock',
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC'
  ) {
    if (search) {
      const searchResults = await this.productService.searchByText(search, locale);

      const jsonProducts = JSON.parse(JSON.stringify(searchResults));

      return {
        data: jsonProducts,
        total: jsonProducts.length,
        page: 1,
        limit: jsonProducts.length,
        totalPages: 1
      };
    }
    if (id) return this.productService.findByCategoryId(id, locale);
    if (page || limit) {
      const pageNum = parseInt(page || '1');
      const limitNum = parseInt(limit || '10');
      const filter: Partial<ProductDomainEntity> = { status: 'active' };
      return this.productService.getPaginated(pageNum, limitNum, locale, filter, sortBy, sortOrder);
    }
    return this.productService.findAll(locale);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID (Public)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, type: ProductPublicResponseDtoSwagger })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.findById(id);
  }
}