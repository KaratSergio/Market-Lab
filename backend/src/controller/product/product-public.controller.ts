import { ProductService } from '@domain/products/services/product.service';

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
  @ApiResponse({ status: 200, type: ProductsListResponseDtoSwagger })
  async findAll(
    @Query('id') id?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string
  ) {
    if (search) return this.productService.searchByText(search);
    if (id) return this.productService.findByCategoryId(id);
    if (page || limit) {
      const pageNum = parseInt(page || '1');
      const limitNum = parseInt(limit || '10');
      return this.productService.getPaginated(pageNum, limitNum);
    }
    return this.productService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID (Public)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, type: ProductPublicResponseDtoSwagger })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.findById(id);
  }
}