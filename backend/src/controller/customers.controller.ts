import {
  Controller,
  Get, Post, Put, Delete,
  Param, Body,
  Request, Query,
  ParseUUIDPipe,
} from '@nestjs/common';

import type {
  // CreateCustomerDto,
  UpdateCustomerDto
} from '@domain/customers/types';

import {
  Auth,
  AdminOnly,
  CustomerOnly,
  SupplierOrAdmin
} from '../auth/decorators';

import { CustomerService } from '@domain/customers/customer.service';
import type { AuthRequest } from '../auth/types';
import { Permission, Role } from '@shared/types';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customerService: CustomerService) { }

  // Admins and suppliers can see all customers
  @Get()
  @Auth([Role.ADMIN, Role.SUPPLIER], [Permission.CUSTOMER_READ])
  async findAll(@Request() req: AuthRequest) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.customerService.findAll(userId, userRoles);
  }

  // Customer can see his profile, admins/suppliers - anyone
  @Get('profile')
  @Auth()
  async getMyProfile(@Request() req: AuthRequest) {
    const customerId = req.user.id; // user.id from token
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.customerService.findByUserId(customerId, userId, userRoles);
  }

  // Get customer by ID
  @Get(':id')
  @Auth([Role.ADMIN, Role.SUPPLIER], [Permission.CUSTOMER_READ])
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.customerService.findById(id, userId, userRoles);
  }

  // Profile update (customer - yours, admin - anyone)
  @Put(':id')
  @Auth()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerDto,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.customerService.update(id, dto, userId, userRoles);
  }

  // Updating your profile
  @Put('profile/update')
  @CustomerOnly()
  async updateMyProfile(
    @Body() dto: UpdateCustomerDto,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;

    // Find customerId by userId
    const customer = await this.customerService.findByUserId(userId, userId, userRoles);

    return this.customerService.update(customer.id, dto, userId, userRoles);
  }

  // Profile deactivation (customer - yours, admin - anyone)
  @Delete(':id')
  @Auth()
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.customerService.delete(id, userId, userRoles);
  }

  // Deactivate your profile
  @Delete('profile/deactivate')
  @CustomerOnly()
  async deactivateMyProfile(@Request() req: AuthRequest) {
    const userId = req.user.id;
    const userRoles = req.user.roles;

    const customer = await this.customerService.findByUserId(userId, userId, userRoles);

    return this.customerService.delete(customer.id, userId, userRoles);
  }

  // Admin methods

  @Put('admin/:id/activate')
  @AdminOnly()
  async activateCustomer(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.customerService.activate(id, userId, userRoles);
  }

  @Put('admin/:id/deactivate')
  @AdminOnly()
  async deactivateCustomer(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.customerService.deactivate(id, userId, userRoles);
  }

  // Search for customers (admin/supplier)
  @Get('search/find-one')
  @SupplierOrAdmin()
  async findOne(
    @Query() filter: any,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.customerService.findOne(filter, userId, userRoles);
  }

  @Get('search/find-many')
  @SupplierOrAdmin()
  async findMany(
    @Query() filter: any,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.customerService.findMany(filter, userId, userRoles);
  }
}