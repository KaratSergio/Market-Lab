import {
  Controller,
  Get, Post, Put, Delete,
  Param, Body, Request, Query,
  ParseUUIDPipe, UseInterceptors,
  UploadedFiles, BadRequestException,
  HttpCode, HttpStatus,
  UseInterceptors as UseCustomInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';

import {
  ApiTags, ApiOperation, ApiResponse,
  ApiBearerAuth, ApiBody, ApiParam, ApiQuery,
  ApiOkResponse, ApiNotFoundResponse,
  ApiForbiddenResponse, ApiUnauthorizedResponse,
  ApiBadRequestResponse, ApiConsumes, ApiCreatedResponse,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';

import {
  Auth,
  AdminOnly,
  SupplierOnly,
  SupplierOrAdmin,
  AuthenticatedOnly
} from '../auth/decorators';

import type { AuthRequest } from '../auth/types';
import type { UpdateSupplierDto, SupplierStatus } from '@domain/suppliers/types';
import { SupplierService } from '@domain/suppliers/supplier.service';
import { Permission, Role } from '@shared/types';

// Swagger DTOs
import {
  UpdateSupplierDtoSwagger,
  UploadDocumentsDtoSwagger,
  SupplierResponseDtoSwagger,
  SupplierPublicResponseDtoSwagger,
  SuppliersListResponseDtoSwagger,
  SupplierProfileResponseDtoSwagger,
  SupplierDocumentResponseDtoSwagger,
} from '@domain/suppliers/types/supplier.swagger.dto';


@ApiTags('suppliers')
@Controller('suppliers')
@UseCustomInterceptors(ClassSerializerInterceptor)
export class SuppliersController {
  constructor(private readonly supplierService: SupplierService) { }

  // ================= PUBLIC ENDPOINTS =================

  /**
   * GET ALL ACTIVE SUPPLIERS (Public)
   * @description Retrieves list of all active and approved suppliers.
   * Public endpoint accessible without authentication.
   */
  @Get('public/active')
  @ApiOperation({
    summary: 'Get all active suppliers (Public)',
    description: 'Retrieves list of all active and approved suppliers. Public endpoint accessible without authentication.'
  })
  @ApiOkResponse({
    description: 'Active suppliers list retrieved successfully',
    type: [SupplierPublicResponseDtoSwagger],
  })
  async findAllActive() {
    return this.supplierService.findAllActive();
  }

  /**
   * GET SUPPLIER PUBLIC INFO (Public)
   * @description Retrieves public information about a specific supplier.
   * Public endpoint accessible without authentication.
   */
  @Get('public/:id')
  @ApiOperation({
    summary: 'Get supplier public info (Public)',
    description: 'Retrieves public information about a specific supplier. Public endpoint accessible without authentication.'
  })
  @ApiParam({
    name: 'id',
    description: 'Supplier ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Supplier public info retrieved successfully',
    type: SupplierPublicResponseDtoSwagger,
  })
  @ApiNotFoundResponse({
    description: 'Supplier not found or not active',
  })
  async getPublicInfo(@Param('id', ParseUUIDPipe) id: string) {
    return this.supplierService.getPublicSupplierInfo(id);
  }

  // ================= PROTECTED ENDPOINTS =================

  /**
   * GET ALL SUPPLIERS (Admin Only)
   * @description Retrieves complete list of all suppliers including pending, rejected, and suspended.
   * Admin-only endpoint requiring ADMIN role.
   */
  @Get()
  @AdminOnly()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all suppliers (Admin Only)',
    description: 'Retrieves complete list of all suppliers including pending, rejected, and suspended. Admin-only endpoint requiring ADMIN role.'
  })
  @ApiOkResponse({
    description: 'Suppliers list retrieved successfully',
    type: SuppliersListResponseDtoSwagger,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User is not an administrator',
  })
  async findAll(@Request() req: AuthRequest) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.supplierService.findAll(userId, userRoles);
  }

  /**
   * GET MY SUPPLIER PROFILE
   * @description Retrieves profile information of the currently authenticated supplier.
   * Supplier-only endpoint.
   */
  @Get('profile/my')
  @SupplierOnly()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get my supplier profile',
    description: 'Retrieves profile information of the currently authenticated supplier. Supplier-only endpoint.'
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
  async getMyProfile(@Request() req: AuthRequest) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.supplierService.findByUserId(userId, userId, userRoles);
  }

  /**
   * GET SUPPLIER BY ID
   * @description Retrieves detailed information about a specific supplier by ID.
   * Requires authentication. Suppliers can view themselves, admins can view any supplier.
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
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.supplierService.findById(id, userId, userRoles);
  }

  /**
   * UPDATE SUPPLIER PROFILE
   * @description Updates supplier profile information.
   * Suppliers can update their own profile, admins can update any supplier.
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
   * @description Updates profile of the currently authenticated supplier.
   * Supplier-only endpoint for self-profile updates.
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
   * @description Deletes or deactivates a supplier profile.
   * Suppliers can delete their own profile, admins can delete any supplier.
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

  // ================= DOCUMENT MANAGEMENT =================

  /**
   * UPLOAD SUPPLIER DOCUMENTS
   * @description Uploads documents for supplier.
   * Supports multiple file uploads (max 10 files). Supplier or admin access only.
   */
  @Post(':id/documents')
  @UseInterceptors(FilesInterceptor('files', 10))
  @SupplierOrAdmin()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Upload supplier documents',
    description: 'Uploads documents for supplier. Supports multiple file uploads (max 10 files). Supplier or admin access only.'
  })
  @ApiParam({
    name: 'id',
    description: 'Supplier ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload supplier documents',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Documents uploaded successfully',
    type: [String],
  })
  @ApiBadRequestResponse({
    description: 'No files uploaded',
  })
  @ApiForbiddenResponse({
    description: 'User not authorized to upload documents for this supplier',
  })
  async uploadDocuments(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;

    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    return this.supplierService.uploadDocuments(
      id,
      files,
      userId,
      userRoles
    );
  }

  /**
   * GET SUPPLIER DOCUMENTS
   * @description Retrieves list of documents uploaded by a supplier.
   * Supplier can view their own documents, admin can view any supplier's documents.
   */
  @Get(':id/documents')
  @SupplierOrAdmin()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get supplier documents',
    description: 'Retrieves list of documents uploaded by a supplier. Supplier can view their own documents, admin can view any supplier\'s documents.'
  })
  @ApiParam({
    name: 'id',
    description: 'Supplier ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Supplier documents retrieved successfully',
    type: [String],
  })
  async getDocuments(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.supplierService.getDocuments(id, userId, userRoles);
  }

  /**
   * DELETE SUPPLIER DOCUMENT
   * @description Deletes a specific document uploaded by a supplier.
   * Supplier can delete their own documents, admin can delete any document.
   */
  @Delete(':id/documents/:documentUrl')
  @SupplierOrAdmin()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete supplier document',
    description: 'Deletes a specific document uploaded by a supplier. Supplier can delete their own documents, admin can delete any document.'
  })
  @ApiParam({
    name: 'id',
    description: 'Supplier ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'documentUrl',
    description: 'Document URL or filename',
    example: 'https://s3.amazonaws.com/bucket/suppliers/company/documents/file.pdf',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Document deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Document not found',
  })
  async deleteDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('documentUrl') documentUrl: string,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.supplierService.deleteDocument(id, documentUrl, userId, userRoles);
  }

  // ================= ADMINISTRATIVE METHODS =================

  /**
   * UPDATE SUPPLIER STATUS (Admin Only)
   * @description Updates supplier status (approve, reject, suspend, or reset to pending)
   * Admin-only endpoint requiring ADMIN role with appropriate permissions.
   */
  @Put('admin/:id/status')
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
          enum: ['approved', 'rejected', 'suspended', 'pending'],
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
  async updateSupplierStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { status: string; reason: string },
    @Request() req: AuthRequest
  ) {
    const userRoles = req.user.roles;
    const validStatuses = ['pending', 'approved', 'rejected', 'suspended'];
    if (!validStatuses.includes(dto.status)) throw new BadRequestException(`Invalid status`);

    return this.supplierService.updateStatus(
      id,
      dto.status as SupplierStatus,
      dto.reason,
      userRoles
    );
  }

  // ================= SEARCH METHODS =================

  /**
   * SEARCH FOR MULTIPLE SUPPLIERS (Admin Only)
   * @description Searches for multiple suppliers based on filter criteria.
   * Admin-only endpoint requiring ADMIN role.
   */
  @Get('search')
  @AdminOnly()
  async searchSuppliers(
    @Query() query: {
      status?: SupplierStatus;
      companyName?: string;
      registrationNumber?: string;
      limit?: number;
      page?: number;
    },
    @Request() req: AuthRequest
  ) {
    return this.supplierService.searchSuppliers(query, req.user.roles);
  }
}