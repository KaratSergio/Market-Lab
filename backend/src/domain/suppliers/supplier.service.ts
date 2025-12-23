import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import {
  CreateSupplierDto,
  UpdateSupplierDto,
  SUPPLIER_STATUS,
  SupplierStatus
} from './types';

import { SupplierDomainEntity } from './supplier.entity';
import { SupplierRepository } from './supplier.repository';
import { Role, Permission } from '@shared/types';

@Injectable()
export class SupplierService {
  constructor(
    @Inject('SupplierRepository')
    private readonly supplierRepository: SupplierRepository,
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
  ): Promise<SupplierDomainEntity> {
    const supplier = await this.supplierRepository.findByUserId(userId);
    if (!supplier) throw new NotFoundException('Supplier not found');
    // Check access
    this._checkSupplierAccess(supplier, requestUserId, userRoles, 'view');

    return supplier;
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
    return this.supplierRepository.create(supplier);
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
      address: supplier.address,
      email: supplier.email,
      phone: supplier.phone,
      documents: supplier.documents,
      status: supplier.status,
      updatedAt: supplier.updatedAt
    });

    if (!updated) throw new NotFoundException('Supplier not found after update');
    return updated;
  }

  // Supplier approval (admin)
  async approve(
    id: string,
    userId: string,
    userRoles: string[]
  ): Promise<SupplierDomainEntity> {
    this._checkSupplierPermission(userRoles, Permission.SUPPLIER_APPROVE, 'approve suppliers');

    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) throw new NotFoundException('Supplier not found');

    supplier.approve();

    const updated = await this.supplierRepository.update(id, {
      status: supplier.status,
      updatedAt: supplier.updatedAt
    });

    if (!updated) throw new NotFoundException('Supplier not found after approval');
    return updated;
  }

  // Supplier Rejection (admin)
  async reject(
    id: string,
    reason: string,
    userId: string,
    userRoles: string[]
  ): Promise<SupplierDomainEntity> {
    this._checkSupplierPermission(userRoles, Permission.SUPPLIER_MANAGE, 'reject suppliers');

    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) throw new NotFoundException('Supplier not found');

    supplier.reject();

    const updated = await this.supplierRepository.update(id, {
      status: supplier.status,
      updatedAt: supplier.updatedAt
    });

    if (!updated) throw new NotFoundException('Supplier not found after rejection');
    return updated;
  }

  // Supplier blocking (admin)
  async suspend(
    id: string,
    reason: string,
    userId: string,
    userRoles: string[]
  ): Promise<SupplierDomainEntity> {
    this._checkSupplierPermission(userRoles, Permission.SUPPLIER_SUSPEND, 'suspend suppliers');

    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) throw new NotFoundException('Supplier not found');

    supplier.suspend();

    const updated = await this.supplierRepository.update(id, {
      status: supplier.status,
      updatedAt: supplier.updatedAt
    });

    if (!updated) throw new NotFoundException('Supplier not found after suspension');
    return updated;
  }

  // Activation (unblocking) of the supplier (admin)
  async activate(
    id: string,
    userId: string,
    userRoles: string[]
  ): Promise<SupplierDomainEntity> {
    this._checkSupplierPermission(userRoles, Permission.SUPPLIER_MANAGE, 'activate suppliers');

    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) throw new NotFoundException('Supplier not found');

    supplier.approve();

    const updated = await this.supplierRepository.update(id, {
      status: supplier.status,
      updatedAt: supplier.updatedAt
    });

    if (!updated) throw new NotFoundException('Supplier not found after activation');
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
  async findOne(
    filter: Partial<SupplierDomainEntity>,
    userId: string,
    userRoles: string[]
  ): Promise<SupplierDomainEntity | null> {
    this._checkSupplierPermission(userRoles, Permission.SUPPLIER_READ, 'search suppliers');
    return this.supplierRepository.findOne(filter);
  }

  async findMany(
    filter: Partial<SupplierDomainEntity>,
    userId: string,
    userRoles: string[]
  ): Promise<SupplierDomainEntity[]> {
    this._checkSupplierPermission(userRoles, Permission.SUPPLIER_READ, 'search suppliers');
    return this.supplierRepository.findMany(filter);
  }

  // Getting suppliers by status (admin)
  async findByStatus(
    status: SupplierStatus,
    userId: string,
    userRoles: string[]
  ): Promise<SupplierDomainEntity[]> {
    this._checkSupplierPermission(userRoles, Permission.SUPPLIER_READ, 'view suppliers by status');
    return this.supplierRepository.findByStatus(status);
  }

  // Public information about the supplier
  async getPublicSupplierInfo(id: string): Promise<any> {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) throw new NotFoundException('Supplier not found');

    return {
      id: supplier.id,
      companyName: supplier.companyName,
      address: supplier.address,
      email: supplier.email,
      phone: supplier.phone,
      status: supplier.status,
      createdAt: supplier.createdAt,
      isActive: supplier.isActive(),
      canSupply: supplier.canSupply(),
    };
  }

  // Limited information for buyers
  async getLimitedSupplierInfo(id: string): Promise<any> {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) throw new NotFoundException('Supplier not found');

    return {
      id: supplier.id,
      companyName: supplier.companyName,
      // address: maskAddress(supplier.address),
      // email: maskEmail(supplier.email),      
      // phone: maskPhone(supplier.phone),      
      status: supplier.status,
      isActive: supplier.isActive(),
      canSupply: supplier.canSupply(),
      // You can add rating, number of reviews, etc.
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
}