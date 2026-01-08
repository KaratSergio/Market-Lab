import {
  Injectable, Inject,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import {
  SupplierPublicDto,
  SupplierProfileDto,
  CreateSupplierDto,
  UpdateSupplierDto,
  SUPPLIER_STATUS,
  SupplierStatus
} from './types';
import { AddressResponseDto } from '@domain/addresses/types/address.dto';

import { Role, Permission } from '@shared/types';
import { SupplierDomainEntity } from './supplier.entity';
import { SupplierRepository } from './supplier.repository';
import { S3StorageService } from '@infrastructure/storage/s3-storage.service';
import { UserRepository } from '@domain/users/user.repository';

import { AddressService } from '@domain/addresses/address.service';
import { Address } from '@domain/addresses/address.entity';


@Injectable()
export class SupplierService {
  constructor(
    @Inject('SupplierRepository')
    private readonly supplierRepository: SupplierRepository,

    @Inject('UserRepository')
    private readonly userRepository: UserRepository,

    private readonly s3StorageService: S3StorageService,
    private readonly addressService: AddressService,
  ) { }

  async findAllActive(): Promise<SupplierDomainEntity[]> {
    return this.supplierRepository.findByStatus(SUPPLIER_STATUS.APPROVED);
  }

  async findAll(
    userId: string,
    userRoles: string[]
  ): Promise<SupplierDomainEntity[]> {
    this._checkSupplierPermission(userRoles, Permission.SUPPLIER_READ, 'view all suppliers');
    return this.supplierRepository.findAll();
  }

  async findById(
    id: string,
    userId?: string,
    userRoles?: string[]
  ): Promise<SupplierDomainEntity> {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) throw new NotFoundException('Supplier not found');
    // Check access
    this._checkSupplierAccess(supplier, userId, userRoles, 'view');

    return supplier;
  }

  // Search by userId (to check if a profile exists)
  async findByUserId(
    userId: string,
    requestUserId?: string,
    userRoles?: string[]
  ): Promise<SupplierProfileDto> {
    const supplier = await this.supplierRepository.findByUserId(userId);
    const user = await this.userRepository.findById(userId);
    if (!supplier || !user) throw new NotFoundException('Supplier not found');
    // Check access
    this._checkSupplierAccess(supplier, requestUserId, userRoles, 'view');

    const primaryAddress = await this.addressService.getPrimaryAddress(supplier.id, 'supplier');
    const addresses = await this.addressService.getEntityAddresses(supplier.id, 'supplier');

    return {
      ...supplier,
      email: user.email,
      primaryAddress: primaryAddress ? this._mapAddressToResponse(primaryAddress) : null,
      addresses: addresses.map(addr => this._mapAddressToResponse(addr)),
    };

  }

  async create(createDto: CreateSupplierDto): Promise<SupplierDomainEntity> {
    // Check if the profile already exists
    const existingByUserId = await this.supplierRepository.findByUserId(createDto.userId);
    if (existingByUserId) {
      throw new ConflictException('Supplier profile already exists for this user');
    }

    const existingByRegNumber = await this.supplierRepository.findByRegistrationNumber(createDto.registrationNumber);
    if (existingByRegNumber) {
      throw new ConflictException('Supplier with this registration number already exists');
    }

    const supplier = SupplierDomainEntity.create(createDto);
    const savedSupplier = await this.supplierRepository.create(supplier);
    if (createDto.address) {
      await this.addressService.createAddress({
        entityId: savedSupplier.id,
        entityType: 'supplier',
        country: createDto.address.country,
        city: createDto.address.city,
        street: createDto.address.street,
        building: createDto.address.building,
        postalCode: createDto.address.postalCode,
        state: createDto.address.state,
        lat: createDto.address.lat,
        lng: createDto.address.lng,
        isPrimary: true,
      });
    }
    return savedSupplier;
  }

  async update(
    id: string,
    updateDto: UpdateSupplierDto,
    userId: string,
    userRoles: string[]
  ): Promise<SupplierDomainEntity> {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) throw new NotFoundException('Supplier not found');
    // Check access rights
    this._checkSupplierAccess(supplier, userId, userRoles, 'update');

    supplier.update(updateDto);

    const updated = await this.supplierRepository.update(id, {
      companyName: supplier.companyName,
      registrationNumber: supplier.registrationNumber,
      phone: supplier.phone,
      firstName: supplier.firstName,
      lastName: supplier.lastName,
      description: supplier.description,
      documents: supplier.documents,
      status: supplier.status,
      updatedAt: supplier.updatedAt
    });

    if (!updated) throw new NotFoundException('Supplier not found after update');
    return updated;
  }

  // Upload supplier documents
  async uploadDocuments(
    id: string,
    files: Express.Multer.File[],
    documentType: string,
    userId: string,
    userRoles: string[]
  ): Promise<{ urls: string[] }> {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) throw new NotFoundException('Supplier not found');

    // Check access rights
    this._checkSupplierAccess(supplier, userId, userRoles, 'upload documents');

    const uploadResults = await this.s3StorageService.uploadSupplierDocuments(
      files.map(file => ({
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
      })),
      supplier.companyName,
      documentType
    );

    // Update supplier documents list in database
    const newDocumentUrls = uploadResults.map(result => result.url);
    const updatedDocuments = [...supplier.documents, ...newDocumentUrls];

    await this.supplierRepository.update(id, {
      documents: updatedDocuments,
      updatedAt: new Date()
    });

    return { urls: newDocumentUrls };
  }

  // Get supplier documents
  async getDocuments(
    id: string,
    userId: string,
    userRoles: string[]
  ): Promise<{ [key: string]: string[] }> {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) throw new NotFoundException('Supplier not found');

    // Check access rights (admin or supplier owner)
    this._checkSupplierAccess(supplier, userId, userRoles, 'view documents');

    return await this.s3StorageService.getSupplierDocumentUrls(supplier.companyName);
  }

  //  Delete supplier document
  async deleteDocument(
    id: string,
    documentKey: string,
    userId: string,
    userRoles: string[]
  ): Promise<void> {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) throw new NotFoundException('Supplier not found');

    // Check access rights
    this._checkSupplierAccess(supplier, userId, userRoles, 'delete documents');

    await this.s3StorageService.deleteSupplierDocument(supplier.companyName, documentKey);

    // Update documents list in database
    const updatedDocuments = supplier.documents.filter(doc => !doc.includes(documentKey));
    await this.supplierRepository.update(id, {
      documents: updatedDocuments,
      updatedAt: new Date()
    });
  }

  async updateStatus(
    id: string,
    status: SupplierStatus,
    reason: string,
    userRoles: Role[]
  ): Promise<SupplierDomainEntity> {
    this._checkStatusPermission(status, userRoles);
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) throw new NotFoundException('Supplier not found');

    supplier.update({ status });
    if (reason) console.log(`Supplier ${id} status changed to ${status}. Reason: ${reason}`);

    const updated = await this.supplierRepository.update(id, {
      status: supplier.status,
      updatedAt: new Date()
    });

    if (!updated) throw new NotFoundException('Supplier not found');
    return updated;
  }

  async delete(
    id: string,
    userId: string,
    userRoles: string[]
  ): Promise<void> {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) throw new NotFoundException('Supplier not found');
    // Check access rights
    this._checkSupplierAccess(supplier, userId, userRoles, 'delete');

    await this.supplierRepository.delete(id);
  }

  // Search for suppliers (admin)
  async searchSuppliers(
    filter: {
      status?: SupplierStatus;
      companyName?: string;
      email?: string;
      registrationNumber?: string;
    },
    userRoles: Role[]
  ): Promise<SupplierDomainEntity[]> {
    this._checkSupplierPermission(userRoles, Permission.SUPPLIER_READ, 'search suppliers');
    const repoFilter: Partial<SupplierDomainEntity> = {};

    if (filter.status) repoFilter.status = filter.status;
    if (filter.companyName) repoFilter.companyName = filter.companyName;
    if (filter.registrationNumber) repoFilter.registrationNumber = filter.registrationNumber;

    return this.supplierRepository.findMany(repoFilter);
  }

  // Public information about the supplier
  async getPublicSupplierInfo(supplierId: string): Promise<SupplierPublicDto> {
    const supplier = await this.supplierRepository.findById(supplierId);
    if (!supplier) throw new NotFoundException('Supplier not found');

    const user = await this.userRepository.findById(supplier.userId);
    const primaryAddress = await this.addressService.getPrimaryAddress(supplierId, 'supplier');

    return {
      id: supplier.id,
      companyName: supplier.companyName,
      email: user?.email || '',
      phone: supplier.phone,
      status: supplier.status,
      address: primaryAddress ? {
        country: primaryAddress.country,
        city: primaryAddress.city,
        fullAddress: primaryAddress.fullAddress,
      } : undefined,
    };
  }

  // Helper methods for checking rights

  private _checkSupplierPermission(
    userRoles: string[],
    requiredPermission: Permission,
    action: string
  ): void {
    // Admins have all rights
    if (userRoles.includes(Role.ADMIN)) return;

    //! нужно проверять через PermissionsService
    throw new ForbiddenException(`You don't have permission to ${action}`);
  }

  private _checkSupplierAccess(
    supplier: SupplierDomainEntity,
    userId?: string,
    userRoles?: string[],
    action?: string
  ): void {
    //! Admins can do everything
    if (userRoles && userRoles.includes(Role.ADMIN)) return;

    // Suppliers can only manage their own profile
    if (userRoles && userRoles.includes(Role.SUPPLIER)) {
      if (supplier.userId === userId) {
        return;
      }
    }

    // Buyers and guests can only view active suppliers
    if (action === 'view' && supplier.isActive()) return;

    throw new ForbiddenException(`You don't have permission to ${action} this supplier`);
  }

  // Check if the supplier can supply goods
  async _canSupplierSupply(supplierId: string): Promise<boolean> {
    const supplier = await this.supplierRepository.findById(supplierId);
    if (!supplier) return false;
    return supplier.canSupply();
  }

  // Check status, activate supplier account
  private _checkStatusPermission(status: SupplierStatus, userRoles: Role[]) {
    const permissionMap = {
      [SUPPLIER_STATUS.APPROVED]: Permission.SUPPLIER_APPROVE,
      [SUPPLIER_STATUS.REJECTED]: Permission.SUPPLIER_MANAGE,
      [SUPPLIER_STATUS.SUSPENDED]: Permission.SUPPLIER_SUSPEND,
      [SUPPLIER_STATUS.PENDING]: null,
    };

    const requiredPermission = permissionMap[status];
    if (requiredPermission) {
      this._checkSupplierPermission(userRoles, requiredPermission, `change status to ${status}`);
    }
  }

  //address mapping
  private _mapAddressToResponse(address: Address): AddressResponseDto {
    return {
      id: address.id,
      country: address.country,
      city: address.city,
      street: address.street,
      building: address.building,
      postalCode: address.postalCode,
      state: address.state,
      lat: address.lat,
      lng: address.lng,
      isPrimary: address.isPrimary,
      fullAddress: address.fullAddress,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
    };
  }
}