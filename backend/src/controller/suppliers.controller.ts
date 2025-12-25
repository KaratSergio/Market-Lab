import {
  Controller,
  Get, Post, Put, Delete,
  Param, Body,
  Request, Query,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFiles,
  BadRequestException
} from '@nestjs/common';

import {
  Auth,
  AdminOnly,
  SupplierOnly,
  SupplierOrAdmin,
  AuthenticatedOnly
} from '../auth/decorators';

import { FilesInterceptor } from '@nestjs/platform-express';
import type { AuthRequest } from '../auth/types';
import type { UpdateSupplierDto } from '@domain/suppliers/types';
import { SupplierService } from '@domain/suppliers/supplier.service';
import { Permission, Role } from '@shared/types';


@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly supplierService: SupplierService) { }

  @Get('public/active')
  async findAllActive() {
    return this.supplierService.findAllActive();
  }

  @Get('public/:id')
  async getPublicInfo(@Param('id', ParseUUIDPipe) id: string) {
    return this.supplierService.getPublicSupplierInfo(id);
  }

  @Get()
  @AdminOnly()
  async findAll(@Request() req: AuthRequest) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.supplierService.findAll(userId, userRoles);
  }

  @Get('profile/my')
  @SupplierOnly()
  async getMyProfile(@Request() req: AuthRequest) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.supplierService.findByUserId(userId, userId, userRoles);
  }

  @Get(':id')
  @AuthenticatedOnly()
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.supplierService.findById(id, userId, userRoles);
  }


  @Put(':id')
  @SupplierOrAdmin()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSupplierDto,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.supplierService.update(id, dto, userId, userRoles);
  }

  @Put('profile/update')
  @SupplierOnly()
  async updateMyProfile(
    @Body() dto: UpdateSupplierDto,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;

    const supplier = await this.supplierService.findByUserId(userId, userId, userRoles);

    return this.supplierService.update(supplier.id, dto, userId, userRoles);
  }

  @Delete(':id')
  @SupplierOrAdmin()
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.supplierService.delete(id, userId, userRoles);
  }

  // Supplier upload docs
  @Post(':id/documents')
  @UseInterceptors(FilesInterceptor('files', 10))
  @SupplierOrAdmin()
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

  @Get(':id/documents')
  @SupplierOrAdmin()
  async getDocuments(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.supplierService.getDocuments(id, userId, userRoles);
  }

  @Delete(':id/documents/:documentKey')
  @SupplierOrAdmin()
  async deleteDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('documentKey') documentKey: string,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.supplierService.deleteDocument(id, documentKey, userId, userRoles);
  }


  // Administrative methods

  @Put('admin/:id/approve')
  @Auth([Role.ADMIN], [Permission.SUPPLIER_APPROVE])
  async approveSupplier(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.supplierService.approve(id, userId, userRoles);
  }

  @Put('admin/:id/reject')
  @AdminOnly()
  async rejectSupplier(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { reason: string },
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.supplierService.reject(id, dto.reason, userId, userRoles);
  }

  @Put('admin/:id/suspend')
  @Auth([Role.ADMIN], [Permission.SUPPLIER_SUSPEND])
  async suspendSupplier(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { reason: string },
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.supplierService.suspend(id, dto.reason, userId, userRoles);
  }

  @Put('admin/:id/activate')
  @AdminOnly()
  async activateSupplier(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.supplierService.activate(id, userId, userRoles);
  }

  // supplier search (admin)
  @Get('search/find-one')
  @AdminOnly()
  async findOne(
    @Query() filter: any,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.supplierService.findOne(filter, userId, userRoles);
  }

  @Get('search/find-many')
  @AdminOnly()
  async findMany(
    @Query() filter: any,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.supplierService.findMany(filter, userId, userRoles);
  }

  // Suppliers by status (admin)
  @Get('status/:status')
  @AdminOnly()
  async findByStatus(
    @Param('status') status: string,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.supplierService.findByStatus(status as any, userId, userRoles);
  }
}