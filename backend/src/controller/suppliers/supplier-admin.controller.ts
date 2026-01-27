import {
  Controller, Get, Put,
  Param, Query, Body, Request,
  ParseUUIDPipe, ParseIntPipe,
} from '@nestjs/common';

import {
  ApiTags, ApiOperation, ApiBody,
  ApiBearerAuth, ApiParam, ApiQuery,
  ApiOkResponse, ApiBadRequestResponse,
  ApiForbiddenResponse, ApiNotFoundResponse,
} from '@nestjs/swagger';

import { Auth } from '@auth/decorators';
import type { AuthRequest } from '@auth/types';
import { SupplierService } from '@domain/suppliers/services/supplier.service';
import { Permission, Role } from '@shared/types';
import { SupplierStatus } from '@domain/suppliers/types';
import { SupplierResponseDtoSwagger } from '@domain/suppliers/types/supplier.swagger.dto';
import { type LanguageCode, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '@domain/translations/types';


@ApiTags('admin-suppliers')
@Controller('admin/suppliers')
export class SupplierAdminController {
  constructor(private readonly supplierService: SupplierService) { }

  /**
   * GET ALL SUPPLIERS (Admin Only)
   */
  @Get()
  @Auth([Role.ADMIN], [Permission.SUPPLIER_READ])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all suppliers (Admin Only)',
    description: 'Retrieves complete list of all suppliers including pending, rejected, and suspended.'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number for pagination'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Number of items per page'
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: SupplierStatus,
    description: 'Filter by supplier status'
  })
  @ApiQuery({
    name: 'companyName',
    required: false,
    type: String,
    description: 'Search by company name (partial match)'
  })
  @ApiQuery({
    name: 'registrationNumber',
    required: false,
    type: String,
    description: 'Search by registration number'
  })
  @ApiQuery({
    name: 'language',
    required: false,
    enum: Object.values(SUPPORTED_LANGUAGES),
    description: 'Language code for translations'
  })
  @ApiOkResponse({
    description: 'Suppliers list retrieved successfully',
  })
  @ApiForbiddenResponse({
    description: 'User is not an administrator',
  })
  async findAll(
    @Request() req: AuthRequest,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('status') status?: SupplierStatus,
    @Query('companyName') companyName?: string,
    @Query('registrationNumber') registrationNumber?: string,
    @Query('language') language: LanguageCode = DEFAULT_LANGUAGE
  ) {
    return this.supplierService.searchSuppliers(
      {
        page,
        limit,
        status,
        companyName,
        registrationNumber,
        language
      },
      req.user.roles
    );
  }

  /**
   * UPDATE SUPPLIER STATUS (Admin Only)
   */
  @Put(':id/status')
  @Auth([Role.ADMIN], [Permission.SUPPLIER_APPROVE])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update supplier status (Admin Only)',
    description: 'Updates supplier status: approve, reject, suspend, or set to pending.'
  })
  @ApiParam({
    name: 'id',
    description: 'Supplier ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(SupplierStatus),
          description: 'New status for the supplier'
        },
        reason: {
          type: 'string',
          description: 'Reason for status change (optional, recommended for reject/suspend)'
        }
      },
      required: ['status']
    }
  })
  @ApiOkResponse({
    description: 'Supplier status updated successfully',
    type: SupplierResponseDtoSwagger,
  })
  @ApiBadRequestResponse({
    description: 'Invalid status value',
  })
  @ApiForbiddenResponse({
    description: 'User lacks required permissions for this status change',
  })
  @ApiNotFoundResponse({
    description: 'Supplier not found',
  })
  async updateSupplierStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { status: SupplierStatus; reason?: string },
    @Request() req: AuthRequest
  ) {
    return this.supplierService.updateStatus(
      id,
      dto.status,
      dto.reason || '',
      req.user.roles
    );
  }
}