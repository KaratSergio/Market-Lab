import {
  Controller, Get, Put, Delete, Param,
  Body, Request, ParseUUIDPipe, HttpCode, HttpStatus,
  Query
} from '@nestjs/common';

import {
  ApiTags, ApiOperation, ApiResponse,
  ApiBearerAuth, ApiBody, ApiParam,
  ApiOkResponse, ApiNotFoundResponse,
  ApiForbiddenResponse, ApiBadRequestResponse,
  ApiQuery
} from '@nestjs/swagger';

import type { AuthRequest } from '@auth/types';
import type { UpdateSupplierDto } from '@domain/suppliers/types';
import { type LanguageCode, SUPPORTED_LANGUAGES } from '@domain/translations/types';
import { SupplierService } from '@domain/suppliers/services/supplier.service';
import { SupplierOnly, SupplierOrAdmin, AuthenticatedOnly, } from '@auth/decorators';

import {
  UpdateSupplierDtoSwagger,
  SupplierResponseDtoSwagger,
  SupplierProfileResponseDtoSwagger,
} from '@domain/suppliers/types/supplier.swagger.dto';


@ApiTags('suppliers-profile')
@Controller('suppliers')
export class SupplierProfileController {
  constructor(private readonly supplierService: SupplierService) { }

  /**
   * GET MY SUPPLIER PROFILE
   */
  @Get('profile/my')
  @SupplierOnly()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get my supplier profile',
    description: 'Retrieves profile information of the currently authenticated supplier. Supplier-only endpoint.'
  })
  @ApiQuery({
    name: 'language',
    required: false,
    enum: Object.values(SUPPORTED_LANGUAGES),
    description: 'Language code for translations'
  })
  @ApiOkResponse({
    description: 'Supplier profile retrieved successfully',
    type: SupplierProfileResponseDtoSwagger,
  })
  @ApiNotFoundResponse({
    description: 'Supplier profile not found',
  })
  @ApiForbiddenResponse({
    description: 'User is not a supplier',
  })
  async getMyProfile(
    @Request() req: AuthRequest,
    @Query('language') language?: LanguageCode
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.supplierService.findByUserId(userId, userId, userRoles, language);
  }

  /**
   * GET SUPPLIER BY ID
   */
  @Get(':id')
  @AuthenticatedOnly()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get supplier by ID',
    description: 'Retrieves detailed information about a specific supplier by ID. Requires authentication. Suppliers can view themselves, admins can view any supplier.'
  })
  @ApiParam({
    name: 'id',
    description: 'Supplier ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'language',
    required: false,
    enum: Object.values(SUPPORTED_LANGUAGES),
    description: 'Language code for translations'
  })
  @ApiOkResponse({
    description: 'Supplier details retrieved successfully',
    type: SupplierResponseDtoSwagger,
  })
  @ApiNotFoundResponse({
    description: 'Supplier not found with the specified ID',
  })
  @ApiForbiddenResponse({
    description: 'User not authorized to view this supplier',
  })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthRequest,
    @Query('language') language?: LanguageCode
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.supplierService.findById(id, userId, userRoles, language);
  }

  /**
   * UPDATE SUPPLIER PROFILE
   */
  @Put(':id')
  @SupplierOrAdmin()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update supplier profile',
    description: 'Updates supplier profile information. Suppliers can update their own profile, admins can update any supplier.'
  })
  @ApiParam({
    name: 'id',
    description: 'Supplier ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateSupplierDtoSwagger })
  @ApiOkResponse({
    description: 'Supplier profile updated successfully',
    type: SupplierResponseDtoSwagger,
  })
  @ApiBadRequestResponse({
    description: 'Invalid update data provided',
  })
  @ApiForbiddenResponse({
    description: 'User not authorized to update this supplier profile',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSupplierDto,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.supplierService.update(id, dto, userId, userRoles);
  }

  /**
   * UPDATE MY SUPPLIER PROFILE
   */
  @Put('profile/update')
  @SupplierOnly()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update my supplier profile',
    description: 'Updates profile of the currently authenticated supplier. Supplier-only endpoint for self-profile updates.'
  })
  @ApiBody({ type: UpdateSupplierDtoSwagger })
  @ApiOkResponse({
    description: 'Supplier profile updated successfully',
    type: SupplierProfileResponseDtoSwagger,
  })
  @ApiBadRequestResponse({
    description: 'Invalid update data provided',
  })
  async updateMyProfile(
    @Body() dto: UpdateSupplierDto,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;

    const supplier = await this.supplierService.findByUserId(userId, userId, userRoles);
    return this.supplierService.update(supplier.id, dto, userId, userRoles);
  }

  /**
   * DELETE SUPPLIER PROFILE
   */
  @Delete(':id')
  @SupplierOrAdmin()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete supplier profile',
    description: 'Deletes or deactivates a supplier profile. Suppliers can delete their own profile, admins can delete any supplier.'
  })
  @ApiParam({
    name: 'id',
    description: 'Supplier ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Supplier profile deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Supplier not found with the specified ID',
  })
  @ApiForbiddenResponse({
    description: 'User not authorized to delete this supplier profile',
  })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.supplierService.delete(id, userId, userRoles);
  }
}