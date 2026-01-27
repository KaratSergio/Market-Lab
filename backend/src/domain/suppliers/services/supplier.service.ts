import { Injectable } from '@nestjs/common';
import { SupplierDomainEntity } from '../supplier.entity';

import { SupplierCoreService } from './supplier-core.service';
import { SupplierAccessService } from './supplier-access.service';
import { SupplierAdminService } from './supplier-admin.service';
import { SupplierDocumentsService } from './supplier-documents.service';

import {
  SupplierProfileDto,
  CreateSupplierDto,
  UpdateSupplierDto,
  SupplierStatus
} from '../types';
import { Role } from '@shared/types';
import { LanguageCode, DEFAULT_LANGUAGE } from '@domain/translations/types';


@Injectable()
export class SupplierService {
  constructor(
    private readonly coreService: SupplierCoreService,
    private readonly adminService: SupplierAdminService,
    private readonly documentsService: SupplierDocumentsService,
    private readonly accessService: SupplierAccessService,
  ) { }

  async findAllActive(languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<SupplierDomainEntity[]> {
    return this.coreService.findAllActive(languageCode);
  }

  async getPublicSupplierInfo(supplierId: string, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<any> {
    return this.coreService.getPublicSupplierInfo(supplierId, languageCode);
  }

  async create(createDto: CreateSupplierDto): Promise<SupplierDomainEntity> {
    return this.coreService.create(createDto);
  }

  // Profile methods
  async findById(
    id: string,
    userId?: string,
    userRoles?: string[],
    languageCode: LanguageCode = DEFAULT_LANGUAGE
  ): Promise<SupplierDomainEntity> {
    const supplier = await this.coreService.findById(id, languageCode);
    this.accessService.checkSupplierAccess(supplier, userId, userRoles, 'view');
    return supplier;
  }

  async findByUserId(
    userId: string,
    requestUserId?: string,
    userRoles?: string[],
    languageCode: LanguageCode = DEFAULT_LANGUAGE
  ): Promise<SupplierProfileDto> {
    const supplierProfile = await this.coreService.findByUserId(userId, languageCode);
    this.accessService.checkSupplierAccess(supplierProfile, requestUserId, userRoles, 'view');
    return supplierProfile;
  }

  async update(
    id: string,
    updateDto: UpdateSupplierDto,
    userId: string,
    userRoles: string[]
  ): Promise<SupplierDomainEntity> {
    const supplier = await this.coreService.findById(id);
    this.accessService.checkSupplierAccess(supplier, userId, userRoles, 'update');
    return this.coreService.update(id, updateDto);
  }

  async delete(
    id: string,
    userId: string,
    userRoles: string[]
  ): Promise<void> {
    const supplier = await this.coreService.findById(id);
    this.accessService.checkSupplierAccess(supplier, userId, userRoles, 'delete');
    return this.coreService.delete(id);
  }

  // Documents methods
  async uploadDocuments(
    id: string,
    files: Express.Multer.File[],
    userId: string,
    userRoles: string[]
  ): Promise<{ urls: string[] }> {
    const supplier = await this.coreService.findById(id);
    this.accessService.checkSupplierAccess(supplier, userId, userRoles, 'upload documents');
    return this.documentsService.uploadDocuments(id, files, userId, userRoles);
  }

  async getDocuments(
    id: string,
    userId: string,
    userRoles: string[]
  ): Promise<string[]> {
    const supplier = await this.coreService.findById(id);
    this.accessService.checkSupplierAccess(supplier, userId, userRoles, 'view documents');
    return this.documentsService.getDocuments(id, userId, userRoles);
  }

  async deleteDocument(
    id: string,
    documentUrl: string,
    userId: string,
    userRoles: string[]
  ): Promise<void> {
    const supplier = await this.coreService.findById(id);
    this.accessService.checkSupplierAccess(supplier, userId, userRoles, 'delete documents');
    return this.documentsService.deleteDocument(id, documentUrl, userId, userRoles);
  }

  // Admin methods
  async findAll(
    userId: string,
    userRoles: string[]
  ): Promise<SupplierDomainEntity[]> {
    return this.adminService.findAll(userId, userRoles);
  }

  async searchSuppliers(
    filter: {
      page?: number;
      limit?: number;
      status?: SupplierStatus;
      companyName?: string;
      email?: string;
      registrationNumber?: string;
      language?: LanguageCode;
    },
    userRoles: Role[]
  ) {
    return this.adminService.searchSuppliers(filter, userRoles);
  }

  async updateStatus(
    id: string,
    status: SupplierStatus,
    reason: string,
    userRoles: Role[]
  ): Promise<SupplierDomainEntity> {
    return this.adminService.updateStatus(id, status, reason, userRoles);
  }

  // Helper methods
  async _canSupplierSupply(supplierId: string): Promise<boolean> {
    const supplier = await this.coreService.findById(supplierId);
    return this.accessService.canSupplierSupply(supplier);
  }
}