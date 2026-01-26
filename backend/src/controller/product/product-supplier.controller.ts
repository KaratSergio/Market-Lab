import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductService } from '@domain/products/services/product.service';
import { SupplierOnly } from '@auth/decorators';
import { ParseData, Locale } from '@shared/decorators';
import type { AuthRequest } from '@auth/types';
import type { LanguageCode } from '@domain/translations/types';

import {
  Controller, Post, Put, Get, Param, Request,
  UploadedFiles, UseInterceptors, ParseUUIDPipe,
} from '@nestjs/common';

import {
  ApiTags, ApiOperation, ApiResponse,
  ApiBearerAuth, ApiParam, ApiConsumes, ApiBody
} from '@nestjs/swagger';

import {
  CreateProductDto,
  UpdateProductDto,
  RestockProductDto,
  CreateProductDtoSwagger,
  UpdateProductDtoSwagger,
  RestockProductDtoSwagger,
  ProductResponseDtoSwagger,
  ProductsListResponseDtoSwagger
} from '@domain/products/types';


@ApiTags('products')
@Controller('products')
export class ProductSupplierController {
  constructor(private readonly productService: ProductService) { }

  @Post()
  @SupplierOnly()
  @UseInterceptors(FilesInterceptor('images', 4))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create new product (Supplier Only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateProductDtoSwagger })
  @ApiResponse({ status: 201, type: ProductResponseDtoSwagger })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Not a supplier' })
  async create(
    @ParseData(CreateProductDto) dto: CreateProductDto,
    @UploadedFiles() images: Express.Multer.File[],
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    return this.productService.create(dto, userId, images);
  }

  @Put(':id')
  @SupplierOnly()
  @UseInterceptors(FilesInterceptor('newImages', 4))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update product (Supplier Only)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateProductDtoSwagger })
  @ApiResponse({ status: 200, type: ProductResponseDtoSwagger })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @ParseData(UpdateProductDto) dto: UpdateProductDto,
    @UploadedFiles() newImages: Express.Multer.File[],
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.productService.update(id, dto, userId, userRoles, newImages);
  }

  @Post(':id/restock')
  @SupplierOnly()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Restock product (Supplier Only)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiBody({ type: RestockProductDtoSwagger })
  @ApiResponse({ status: 200, type: ProductResponseDtoSwagger })
  async restock(
    @Param('id', ParseUUIDPipe) id: string,
    @ParseData(RestockProductDto) dto: RestockProductDto,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.productService.restockProduct(id, dto, userId, userRoles);
  }

  @Get('supplier/my')
  @SupplierOnly()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my products (Supplier Only)' })
  @ApiResponse({ status: 200, type: ProductsListResponseDtoSwagger })
  async getMyProducts(
    @Request() req: AuthRequest,
    @Locale() locale: LanguageCode,
  ) {
    return this.productService.getSupplierProducts(
      req.user.id,
      req.user.id,
      req.user.roles,
      locale
    );
  }

}