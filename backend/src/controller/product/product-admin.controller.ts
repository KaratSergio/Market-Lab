import { ProductService } from '@domain/products/product.service';
import { AdminOnly } from '@auth/decorators';

import {
  Controller, Get, Delete,
  Param, Query, ParseUUIDPipe
} from '@nestjs/common';

import {
  ApiTags, ApiOperation, ApiResponse,
  ApiBearerAuth, ApiParam, ApiQuery
} from '@nestjs/swagger';

import {
  ProductStatisticsResponseDtoSwagger,
  ProductsListResponseDtoSwagger
} from '@domain/products/types';


@ApiTags('products')
@Controller('products')
export class ProductAdminController {
  constructor(private readonly productService: ProductService) { }

  @Get('admin/statistics')
  @AdminOnly()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get product statistics (Admin Only)' })
  @ApiResponse({ status: 200, type: ProductStatisticsResponseDtoSwagger })
  async getStatistics() {
    return this.productService.getStatistics();
  }

  @Get('admin/all')
  @AdminOnly()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all products (Admin Only)' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'inactive', 'archived', 'draft']
  })
  @ApiResponse({ status: 200, type: ProductsListResponseDtoSwagger })
  async getAllProducts(@Query('status') status?: string) {
    const filter: any = {};
    if (status) filter.status = status;
    return this.productService.getAllProducts(filter);
  }

  @Delete('admin/:id/force')
  @AdminOnly()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Force delete product (Admin Only)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 204, description: 'Product force deleted' })
  async forceDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.forceDelete(id);
  }

  @Get('admin/low-stock')
  @AdminOnly()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get low stock products (Admin Only)' })
  @ApiQuery({ name: 'threshold', required: false, description: 'Stock threshold' })
  @ApiResponse({ status: 200, type: ProductsListResponseDtoSwagger })
  async getLowStockProducts(@Query('threshold') threshold?: string) {
    const thresholdNum = threshold ? parseInt(threshold) : 10;
    return this.productService.getLowStockProducts(thresholdNum);
  }
}