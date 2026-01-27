import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Role, Permission } from '@shared/types';
import { SupplierStatus } from '../types';
import { SupplierDomainEntity } from '../supplier.entity';
import { SupplierRepository } from '../supplier.repository';

import { UserRepository } from '@domain/users/user.repository';
import { AddressService } from '@domain/addresses/address.service';
import { TranslationService } from '@domain/translations/translation.service';
import { LanguageCode, DEFAULT_LANGUAGE } from '@domain/translations/types';

import { SupplierCoreService } from './supplier-core.service';
import { SupplierAccessService } from './supplier-access.service';


@Injectable()
export class SupplierAdminService extends SupplierCoreService {
  constructor(
    @Inject('SupplierRepository')
    supplierRepository: SupplierRepository,

    @Inject('UserRepository')
    userRepository: UserRepository,

    addressService: AddressService,

    @Inject(TranslationService)
    translationService: TranslationService,

    private readonly accessService: SupplierAccessService,
  ) {
    super(supplierRepository, userRepository, addressService, translationService);
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
  ): Promise<{
    suppliers: SupplierDomainEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    this.accessService.checkSupplierPermission(userRoles, Permission.SUPPLIER_READ, 'search suppliers');

    const {
      page = 1,
      limit = 10,
      language = DEFAULT_LANGUAGE,
      ...searchFilter
    } = filter;

    const repoFilter: Partial<SupplierDomainEntity> = {};

    if (searchFilter.status) repoFilter.status = searchFilter.status;
    if (searchFilter.companyName) repoFilter.companyName = `%${searchFilter.companyName}%`;
    if (searchFilter.registrationNumber) repoFilter.registrationNumber = searchFilter.registrationNumber;

    const result = await this.supplierRepository.findWithPagination(
      page,
      limit,
      repoFilter,
      language
    );

    return {
      suppliers: result.data,
      total: result.total,
      page: result.page,
      limit: limit,
      totalPages: result.totalPages
    };
  }

  async updateStatus(
    id: string,
    status: SupplierStatus,
    reason: string,
    userRoles: Role[]
  ): Promise<SupplierDomainEntity> {
    this.accessService.checkStatusPermission(status, userRoles);

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

  async findAll(
    userId: string,
    userRoles: string[],
    languageCode: LanguageCode = DEFAULT_LANGUAGE
  ): Promise<SupplierDomainEntity[]> {
    this.accessService.checkSupplierPermission(userRoles, Permission.SUPPLIER_READ, 'view all suppliers');

    return this.supplierRepository.findAll(languageCode);
  }
}