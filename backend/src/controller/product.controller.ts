import {
  Controller,
  Get, Post, Put, Delete,
  Param, Body,
  Request, Query,
  ParseUUIDPipe,
  BadRequestException
} from '@nestjs/common';

import type {
  CreateProductDto,
  UpdateProductDto,
  PurchaseProductDto,
  RestockProductDto
} from '@domain/products/types';

import {
  Auth,
  SupplierOnly,
  SupplierOrAdmin,
  CustomerOnly,
  AdminOnly
} from '../auth/decorators';

import { ProductService } from '@domain/products/product.service';
import type { AuthRequest } from '../auth/types';


@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  // Public access

  @Get()
  async findAll(
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string
  ) {
    if (search) {
      return this.productService.searchByText(search);
    }

    if (category) {
      return this.productService.findByCategory(category);
    }

    if (page || limit) {
      const pageNum = parseInt(page || '1');
      const limitNum = parseInt(limit || '10');
      return this.productService.getPaginated(pageNum, limitNum);
    }

    return this.productService.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.findById(id);
  }

  @Get('categories/list')
  async getCategories() {
    return this.productService.getCategories();
  }

  // Suppliers only

  @Post()
  @SupplierOnly()
  async create(
    @Body() dto: CreateProductDto,
    @Request() req: AuthRequest
  ) {
    const supplierId = req.user.id;
    return this.productService.create(dto, supplierId);
  }

  @Put(':id')
  @SupplierOrAdmin()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.productService.update(id, dto, userId, userRoles);
  }

  // Only suppliers or admins
  @Delete(':id')
  @SupplierOrAdmin()
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.productService.delete(id, userId, userRoles);
  }

  // Only customers
  @Post(':id/purchase')
  @CustomerOnly()
  async purchase(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PurchaseProductDto,
    @Request() req: AuthRequest
  ) {
    const customerId = req.user.id;
    return this.productService.purchase(id, dto, customerId);
  }

  // Suppliers - View your products
  @Get('supplier/my')
  @SupplierOnly()
  async getMyProducts(@Request() req: AuthRequest) {
    const supplierId = req.user.id;
    const userRoles = req.user.roles;
    return this.productService.getSupplierProducts(supplierId, supplierId, userRoles);
  }

  // Suppliers - stock replenishment
  @Post(':id/restock')
  @SupplierOnly()
  async restock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RestockProductDto,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.productService.restockProduct(id, dto, userId, userRoles);
  }

  // Suppliers/Admins - Status Change
  @Put(':id/status')
  @SupplierOrAdmin()
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { status: string },
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;

    const validStatuses = ['active', 'inactive', 'archived', 'draft'];
    if (!validStatuses.includes(dto.status)) {
      throw new BadRequestException('Invalid status');
    }

    return this.productService.toggleStatus(id, dto.status as any, userId, userRoles);
  }

  // Product Ownership Verification
  @Get(':id/ownership')
  @Auth()
  async checkOwnership(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    return this.productService.checkOwnership(id, userId);
  }

  // For Admin

  // Full statistics
  @Get('admin/statistics')
  @AdminOnly()
  async getStatistics() {
    return this.productService.getStatistics();
  }

  // All products (including inactive ones)
  @Get('admin/all')
  @AdminOnly()
  async getAllProducts(@Query('status') status?: string) {
    const filter: any = {};
    if (status) {
      filter.status = status;
    }
    return this.productService.getAllProducts(filter);
  }

  // Forced deletion
  @Delete('admin/:id/force')
  @AdminOnly()
  async forceDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.forceDelete(id);
  }

  // Products with low stock
  @Get('admin/low-stock')
  @AdminOnly()
  async getLowStockProducts(@Query('threshold') threshold?: string) {
    const thresholdNum = threshold ? parseInt(threshold) : 10;
    return this.productService.getLowStockProducts(thresholdNum);
  }
}