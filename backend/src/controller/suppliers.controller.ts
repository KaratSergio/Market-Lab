import {
  Controller,
  Get, Post, Put, Delete,
  Param, Body,
  Request, Query,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  HttpCode,
  HttpStatus,
  UseInterceptors as UseCustomInterceptors,
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
  ApiConsumes,
  ApiCreatedResponse,
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
import type { UpdateSupplierDto } from '@domain/suppliers/types';
import { SupplierService } from '@domain/suppliers/supplier.service';
import { Permission, Role } from '@shared/types';

// Swagger DTOs
import {
  UpdateSupplierDtoSwagger,
  UploadDocumentsDtoSwagger,
  RejectSupplierDtoSwagger,
  SuspendSupplierDtoSwagger,
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
   * @description Uploads documents for supplier verification or compliance.
   * Supports multiple file uploads (max 10 files). Supplier or admin access only.
   */
  @Post(':id/documents')
  @UseInterceptors(FilesInterceptor('files', 10))
  @SupplierOrAdmin()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Upload supplier documents',
    description: 'Uploads documents for supplier verification or compliance. Supports multiple file uploads (max 10 files). Supplier or admin access only.'
  })
  @ApiParam({
    name: 'id',
    description: 'Supplier ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadDocumentsDtoSwagger })
  @ApiCreatedResponse({
    description: 'Documents uploaded successfully',
    type: [SupplierDocumentResponseDtoSwagger],
  })
  @ApiBadRequestResponse({
    description: 'No files uploaded or invalid document type',
  })
  @ApiForbiddenResponse({
    description: 'User not authorized to upload documents for this supplier',
  })
  async uploadDocuments(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: { documentType: string },
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;

    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    if (!body.documentType) {
      throw new BadRequestException('Document type is required');
    }

    return this.supplierService.uploadDocuments(
      id,
      files,
      body.documentType,
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
    type: [SupplierDocumentResponseDtoSwagger],
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
  @Delete(':id/documents/:documentKey')
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
    name: 'documentKey',
    description: 'Document key/identifier',
    example: 'tax_certificate_2024.pdf',
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
    @Param('documentKey') documentKey: string,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.supplierService.deleteDocument(id, documentKey, userId, userRoles);
  }

  // ================= ADMINISTRATIVE METHODS =================

  /**
   * APPROVE SUPPLIER (Admin Only)
   * @description Approves a pending supplier application.
   * Admin-only endpoint requiring ADMIN role and SUPPLIER_APPROVE permission.
   */
  @Put('admin/:id/approve')
  @Auth([Role.ADMIN], [Permission.SUPPLIER_APPROVE])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Approve supplier (Admin Only)',
    description: 'Approves a pending supplier application. Admin-only endpoint requiring ADMIN role and SUPPLIER_APPROVE permission.'
  })
  @ApiParam({
    name: 'id',
    description: 'Supplier ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Supplier approved successfully',
    type: SupplierResponseDtoSwagger,
  })
  @ApiNotFoundResponse({
    description: 'Supplier not found',
  })
  @ApiForbiddenResponse({
    description: 'User lacks required permissions',
  })
  async approveSupplier(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.supplierService.approve(id, userId, userRoles);
  }

  /**
   * REJECT SUPPLIER (Admin Only)
   * @description Rejects a pending supplier application with a reason.
   * Admin-only endpoint requiring ADMIN role.
   */
  @Put('admin/:id/reject')
  @AdminOnly()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Reject supplier (Admin Only)',
    description: 'Rejects a pending supplier application with a reason. Admin-only endpoint requiring ADMIN role.'
  })
  @ApiParam({
    name: 'id',
    description: 'Supplier ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: RejectSupplierDtoSwagger })
  @ApiOkResponse({
    description: 'Supplier rejected successfully',
    type: SupplierResponseDtoSwagger,
  })
  @ApiBadRequestResponse({
    description: 'Rejection reason is required',
  })
  async rejectSupplier(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { reason: string },
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.supplierService.reject(id, dto.reason, userId, userRoles);
  }

  /**
   * SUSPEND SUPPLIER (Admin Only)
   * @description Suspends an active supplier account with a reason.
   * Admin-only endpoint requiring ADMIN role and SUPPLIER_SUSPEND permission.
   */
  @Put('admin/:id/suspend')
  @Auth([Role.ADMIN], [Permission.SUPPLIER_SUSPEND])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Suspend supplier (Admin Only)',
    description: 'Suspends an active supplier account with a reason. Admin-only endpoint requiring ADMIN role and SUPPLIER_SUSPEND permission.'
  })
  @ApiParam({
    name: 'id',
    description: 'Supplier ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: SuspendSupplierDtoSwagger })
  @ApiOkResponse({
    description: 'Supplier suspended successfully',
    type: SupplierResponseDtoSwagger,
  })
  @ApiBadRequestResponse({
    description: 'Suspension reason is required',
  })
  async suspendSupplier(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { reason: string },
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.supplierService.suspend(id, dto.reason, userId, userRoles);
  }

  /**
   * ACTIVATE SUPPLIER (Admin Only)
   * @description Reactivates a suspended supplier account.
   * Admin-only endpoint requiring ADMIN role.
   */
  @Put('admin/:id/activate')
  @AdminOnly()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Activate supplier (Admin Only)',
    description: 'Reactivates a suspended supplier account. Admin-only endpoint requiring ADMIN role.'
  })
  @ApiParam({
    name: 'id',
    description: 'Supplier ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Supplier activated successfully',
    type: SupplierResponseDtoSwagger,
  })
  @ApiNotFoundResponse({
    description: 'Supplier not found',
  })
  async activateSupplier(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.supplierService.activate(id, userId, userRoles);
  }

  // ================= SEARCH METHODS =================

  /**
   * SEARCH FOR SINGLE SUPPLIER (Admin Only)
   * @description Searches for a single supplier based on filter criteria.
   * Admin-only endpoint requiring ADMIN role.
   */
  @Get('search/find-one')
  @AdminOnly()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Search for single supplier (Admin Only)',
    description: 'Searches for a single supplier based on filter criteria. Admin-only endpoint requiring ADMIN role.'
  })
  @ApiQuery({
    name: 'filter',
    type: 'object',
    description: 'Search filter criteria (supports companyName, email, taxId, status)',
    required: false,
    example: { companyName: 'Tech Corp', status: 'approved' },
  })
  @ApiOkResponse({
    description: 'Supplier found successfully',
    type: SupplierResponseDtoSwagger,
  })
  @ApiNotFoundResponse({
    description: 'No supplier matches the search criteria',
  })
  async findOne(
    @Query() filter: any,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.supplierService.findOne(filter, userId, userRoles);
  }

  /**
   * SEARCH FOR MULTIPLE SUPPLIERS (Admin Only)
   * @description Searches for multiple suppliers based on filter criteria.
   * Admin-only endpoint requiring ADMIN role.
   */
  @Get('search/find-many')
  @AdminOnly()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Search for multiple suppliers (Admin Only)',
    description: 'Searches for multiple suppliers based on filter criteria. Admin-only endpoint requiring ADMIN role.'
  })
  @ApiQuery({
    name: 'filter',
    type: 'object',
    description: 'Search filter criteria',
    required: false,
    example: { status: 'pending', createdFrom: '2024-01-01' },
  })
  @ApiOkResponse({
    description: 'Suppliers found successfully',
    type: SuppliersListResponseDtoSwagger,
  })
  async findMany(
    @Query() filter: any,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.supplierService.findMany(filter, userId, userRoles);
  }

  /**
   * GET SUPPLIERS BY STATUS (Admin Only)
   * @description Retrieves suppliers filtered by their approval status.
   * Admin-only endpoint requiring ADMIN role.
   */
  @Get('status/:status')
  @AdminOnly()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get suppliers by status (Admin Only)',
    description: 'Retrieves suppliers filtered by their approval status. Admin-only endpoint requiring ADMIN role.'
  })
  @ApiParam({
    name: 'status',
    description: 'Supplier status',
    enum: ['pending', 'approved', 'rejected', 'suspended', 'active'],
    example: 'pending',
  })
  @ApiOkResponse({
    description: 'Suppliers by status retrieved successfully',
    type: SuppliersListResponseDtoSwagger,
  })
  async findByStatus(
    @Param('status') status: string,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.supplierService.findByStatus(status as any, userId, userRoles);
  }
}