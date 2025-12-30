import {
  Controller,
  Get, Put, Delete,
  Param, Body,
  Request, Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

import type {
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

// Swagger DTOs
import {
  UpdateCustomerDtoSwagger,
  CustomerResponseDtoSwagger,
  CustomersListResponseDtoSwagger,
  CustomerProfileResponseDtoSwagger,
} from '@domain/customers/types/customer.swagger.dto';


@ApiTags('customers')
@ApiBearerAuth('JWT-auth')
@Controller('customers')
@UseInterceptors(ClassSerializerInterceptor)
export class CustomersController {
  constructor(private readonly customerService: CustomerService) { }

  /**
   * GET ALL CUSTOMERS
   * @description Retrieves list of all customers in the system.
   * Access restricted to ADMIN and SUPPLIER roles with CUSTOMER_READ permission.
   */
  @Get()
  @Auth([Role.ADMIN, Role.SUPPLIER], [Permission.CUSTOMER_READ])
  @ApiOperation({
    summary: 'Get all customers',
    description: 'Retrieves list of all customers in the system. Access restricted to ADMIN and SUPPLIER roles with CUSTOMER_READ permission.'
  })
  @ApiOkResponse({
    description: 'Customers list retrieved successfully',
    type: CustomersListResponseDtoSwagger,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User lacks required roles or permissions',
  })
  async findAll(@Request() req: AuthRequest) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.customerService.findAll(userId, userRoles);
  }

  /**
   * GET MY PROFILE
   * @description Retrieves profile information of the currently authenticated customer.
   * Customers can only view their own profile.
   */
  @Get('profile')
  @Auth()
  @ApiOperation({
    summary: 'Get my customer profile',
    description: 'Retrieves profile information of the currently authenticated customer.'
  })
  @ApiOkResponse({
    description: 'Customer profile retrieved successfully',
    type: CustomerProfileResponseDtoSwagger,
  })
  @ApiNotFoundResponse({
    description: 'Customer profile not found',
  })
  async getMyProfile(@Request() req: AuthRequest) {
    const customerId = req.user.id; // user.id from token
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.customerService.findByUserId(customerId, userId, userRoles);
  }

  /**
   * GET CUSTOMER BY ID
   * @description Retrieves detailed information about a specific customer by ID.
   * Access restricted to ADMIN and SUPPLIER roles with CUSTOMER_READ permission.
   */
  @Get(':id')
  @Auth([Role.ADMIN, Role.SUPPLIER], [Permission.CUSTOMER_READ])
  @ApiOperation({
    summary: 'Get customer by ID',
    description: 'Retrieves detailed information about a specific customer by ID. Access restricted to ADMIN and SUPPLIER roles with CUSTOMER_READ permission.'
  })
  @ApiParam({
    name: 'id',
    description: 'Customer ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Customer details retrieved successfully',
    type: CustomerResponseDtoSwagger,
  })
  @ApiNotFoundResponse({
    description: 'Customer not found with the specified ID',
  })
  @ApiForbiddenResponse({
    description: 'User lacks required permissions to view customer details',
  })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.customerService.findById(id, userId, userRoles);
  }

  /**
   * UPDATE CUSTOMER PROFILE
   * @description Updates customer profile information.
   * Customers can update their own profile, admins can update any customer.
   */
  @Put(':id')
  @Auth()
  @ApiOperation({
    summary: 'Update customer profile',
    description: 'Updates customer profile information. Customers can update their own profile, admins can update any customer.'
  })
  @ApiParam({
    name: 'id',
    description: 'Customer ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateCustomerDtoSwagger })
  @ApiOkResponse({
    description: 'Customer profile updated successfully',
    type: CustomerResponseDtoSwagger,
  })
  @ApiBadRequestResponse({
    description: 'Invalid update data provided',
  })
  @ApiForbiddenResponse({
    description: 'User not authorized to update this customer profile',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerDto,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.customerService.update(id, dto, userId, userRoles);
  }

  /**
   * UPDATE MY PROFILE
   * @description Updates profile of the currently authenticated customer.
   * Customer-only endpoint for self-profile updates.
   */
  @Put('profile/update')
  @CustomerOnly()
  @ApiOperation({
    summary: 'Update my customer profile',
    description: 'Updates profile of the currently authenticated customer. Customer-only endpoint for self-profile updates.'
  })
  @ApiBody({ type: UpdateCustomerDtoSwagger })
  @ApiOkResponse({
    description: 'Customer profile updated successfully',
    type: CustomerProfileResponseDtoSwagger,
  })
  @ApiBadRequestResponse({
    description: 'Invalid update data provided',
  })
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

  /**
   * DELETE CUSTOMER PROFILE
   * @description Deletes or deactivates a customer profile.
   * Customers can delete their own profile, admins can delete any customer.
   */
  @Delete(':id')
  @Auth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete customer profile',
    description: 'Deletes or deactivates a customer profile. Customers can delete their own profile, admins can delete any customer.'
  })
  @ApiParam({
    name: 'id',
    description: 'Customer ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Customer profile deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Customer not found with the specified ID',
  })
  @ApiForbiddenResponse({
    description: 'User not authorized to delete this customer profile',
  })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.customerService.delete(id, userId, userRoles);
  }

  /**
   * DEACTIVATE MY PROFILE
   * @description Deactivates profile of the currently authenticated customer.
   * Customer-only endpoint for self-deactivation.
   */
  @Delete('profile/deactivate')
  @CustomerOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deactivate my customer profile',
    description: 'Deactivates profile of the currently authenticated customer. Customer-only endpoint for self-deactivation.'
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Customer profile deactivated successfully',
  })
  async deactivateMyProfile(@Request() req: AuthRequest) {
    const userId = req.user.id;
    const userRoles = req.user.roles;

    const customer = await this.customerService.findByUserId(userId, userId, userRoles);

    return this.customerService.delete(customer.id, userId, userRoles);
  }

  // ================= ADMIN METHODS =================

  /**
   * ACTIVATE CUSTOMER (Admin Only)
   * @description Reactivates a deactivated customer account.
   * Admin-only endpoint requiring ADMIN role.
   */
  @Put('admin/:id/activate')
  @AdminOnly()
  @ApiOperation({
    summary: 'Activate customer account (Admin Only)',
    description: 'Reactivates a deactivated customer account. Admin-only endpoint requiring ADMIN role.'
  })
  @ApiParam({
    name: 'id',
    description: 'Customer ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Customer account activated successfully',
    type: CustomerResponseDtoSwagger,
  })
  @ApiNotFoundResponse({
    description: 'Customer not found with the specified ID',
  })
  @ApiForbiddenResponse({
    description: 'User is not an administrator',
  })
  async activateCustomer(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.customerService.activate(id, userId, userRoles);
  }

  /**
   * DEACTIVATE CUSTOMER (Admin Only)
   * @description Deactivates a customer account (soft delete).
   * Admin-only endpoint requiring ADMIN role.
   */
  @Put('admin/:id/deactivate')
  @AdminOnly()
  @ApiOperation({
    summary: 'Deactivate customer account (Admin Only)',
    description: 'Deactivates a customer account (soft delete). Admin-only endpoint requiring ADMIN role.'
  })
  @ApiParam({
    name: 'id',
    description: 'Customer ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Customer account deactivated successfully',
    type: CustomerResponseDtoSwagger,
  })
  @ApiNotFoundResponse({
    description: 'Customer not found with the specified ID',
  })
  @ApiForbiddenResponse({
    description: 'User is not an administrator',
  })
  async deactivateCustomer(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.customerService.deactivate(id, userId, userRoles);
  }

  // ================= SEARCH METHODS =================

  /**
   * SEARCH FOR SINGLE CUSTOMER
   * @description Searches for a single customer based on filter criteria.
   * Access restricted to SUPPLIER and ADMIN roles.
   */
  @Get('search/find-one')
  @SupplierOrAdmin()
  @ApiOperation({
    summary: 'Search for single customer',
    description: 'Searches for a single customer based on filter criteria. Access restricted to SUPPLIER and ADMIN roles.'
  })
  @ApiQuery({
    name: 'filter',
    type: 'object',
    description: 'Search filter criteria (supports email, phone, name)',
    required: false,
    example: { email: 'customer@example.com' },
  })
  @ApiOkResponse({
    description: 'Customer found successfully',
    type: CustomerResponseDtoSwagger,
  })
  @ApiNotFoundResponse({
    description: 'No customer matches the search criteria',
  })
  async findOne(
    @Query() filter: any,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.customerService.findOne(filter, userId, userRoles);
  }

  /**
   * SEARCH FOR MULTIPLE CUSTOMERS
   * @description Searches for multiple customers based on filter criteria.
   * Access restricted to SUPPLIER and ADMIN roles.
   */
  @Get('search/find-many')
  @SupplierOrAdmin()
  @ApiOperation({
    summary: 'Search for multiple customers',
    description: 'Searches for multiple customers based on filter criteria. Access restricted to SUPPLIER and ADMIN roles.'
  })
  @ApiQuery({
    name: 'filter',
    type: 'object',
    description: 'Search filter criteria',
    required: false,
    example: { status: 'active', role: 'CUSTOMER' },
  })
  @ApiOkResponse({
    description: 'Customers found successfully',
    type: CustomersListResponseDtoSwagger,
  })
  async findMany(
    @Query() filter: any,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.customerService.findMany(filter, userId, userRoles);
  }
}