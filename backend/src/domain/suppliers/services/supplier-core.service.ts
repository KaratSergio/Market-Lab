import { Injectable, Inject } from '@nestjs/common';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { SupplierDomainEntity } from '../supplier.entity';
import { SupplierRepository } from '../supplier.repository';

import { UserService } from '@auth/services/user.service';
import { AddressService } from '@domain/addresses/address.service';
import { TranslationService } from '@domain/translations/translation.service';
import { ProductService } from '@domain/products/services';

import {
  CreateSupplierDto, UpdateSupplierDto,
  SupplierProfileDto, SupplierPublicDto, SupplierStatus
} from '../types';

import { AddressResponseDto } from '@domain/addresses/types/address.dto';
import { LanguageCode, DEFAULT_LANGUAGE } from '@domain/translations/types';
import { Role } from '@shared/types';


@Injectable()
export class SupplierCoreService {
  constructor(
    @Inject('SupplierRepository')
    protected readonly supplierRepository: SupplierRepository,

    protected readonly addressService: AddressService,
    private readonly translationService: TranslationService,
    private readonly userService?: UserService,
    private readonly productService?: ProductService,
  ) { }

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

    if (createDto.translations) {
      await this.translationService.saveTranslations(
        savedSupplier.id,
        'supplier',
        createDto.translations
      );
    }

    if (createDto.address) {
      await this.addressService.createAddress({
        entityId: savedSupplier.id,
        entityType: Role.SUPPLIER,
        country: createDto.address.country,
        city: createDto.address.city,
        street: createDto.address.street || '',
        building: createDto.address.building || '',
        postalCode: createDto.address.postalCode,
        state: createDto.address.state,
        lat: createDto.address.lat,
        lng: createDto.address.lng,
        isPrimary: true,
      });
    }

    return savedSupplier;
  }

  async findById(id: string, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<SupplierDomainEntity> {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) throw new NotFoundException('Supplier not found');

    if (languageCode !== DEFAULT_LANGUAGE) {
      const translations = await this.translationService.getTranslationsForEntities(
        [id],
        'supplier',
        languageCode
      );

      if (translations.length > 0) return this._applyTranslationsToSupplier(supplier, translations);
    }

    return supplier;
  }

  async findByUserId(userId: string, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<SupplierProfileDto> {
    const supplier = await this.supplierRepository.findByUserId(userId);
    const user = await this.userService?.findById(userId);
    if (!supplier || !user) throw new NotFoundException('Supplier not found');

    let translations: any[] = [];
    if (languageCode !== DEFAULT_LANGUAGE) {
      translations = await this.translationService.getTranslationsForEntities(
        [supplier.id],
        'supplier',
        languageCode
      );
    }

    const allTranslations = await this.translationService.getEntityTranslations(supplier.id, Role.SUPPLIER);
    const translationsByLanguage = this._groupTranslationsByLanguage(allTranslations);
    const translationMap = this._createTranslationMap(translations);

    const primaryAddress = await this.addressService.getPrimaryAddress(supplier.id, Role.SUPPLIER);
    const addresses = await this.addressService.getEntityAddresses(supplier.id, Role.SUPPLIER);

    const supplierDto: SupplierProfileDto = {
      id: supplier.id,
      userId: supplier.userId,
      companyName: translationMap.companyName || supplier.companyName,
      firstName: translationMap.firstName || supplier.firstName,
      lastName: translationMap.lastName || supplier.lastName,
      registrationNumber: supplier.registrationNumber,
      phone: supplier.phone,
      documents: supplier.documents,
      status: supplier.status,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt,

      email: user.email,
      primaryAddress: primaryAddress ? this._mapAddressToResponse(primaryAddress) : null,
      addresses: addresses.map(addr => this._mapAddressToResponse(addr)),
      description: translationMap.description || supplier.description,

      isActive: () => supplier.status === SupplierStatus.APPROVED,

      translations: translationsByLanguage
    };

    return supplierDto;
  }

  async update(id: string, updateDto: UpdateSupplierDto): Promise<SupplierDomainEntity> {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) throw new NotFoundException('Supplier not found');

    if (updateDto.registrationNumber && updateDto.registrationNumber !== supplier.registrationNumber) {
      const existing = await this.supplierRepository.findByRegistrationNumber(updateDto.registrationNumber);
      if (existing) throw new ConflictException('Supplier with this registration number already exists');
    }

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
      updatedAt: new Date()
    });

    if (!updated) throw new NotFoundException('Supplier not found after update');

    if (updateDto.translations) {
      await this.translationService.saveTranslations(
        id,
        'supplier',
        updateDto.translations
      );
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.translationService.deleteTranslations(id, 'supplier');
    await this.supplierRepository.delete(id);
  }

  async findAllActive(languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<SupplierDomainEntity[]> {
    const suppliers = await this.supplierRepository.findByStatus('approved');

    if (languageCode !== DEFAULT_LANGUAGE && suppliers.length > 0) {
      return this._applyTranslationsToSuppliers(suppliers, languageCode);
    }

    return suppliers;
  }

  async getPublicSupplierInfo(supplierId: string, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<SupplierPublicDto> {
    const supplier = await this.supplierRepository.findById(supplierId);
    if (!supplier) throw new NotFoundException('Supplier not found');

    let translationMap: Record<string, string> = {};
    if (languageCode !== DEFAULT_LANGUAGE) {
      const translations = await this.translationService.getTranslationsForEntities(
        [supplierId],
        'supplier',
        languageCode
      );
      translationMap = this._createTranslationMap(translations);
    }

    const productsResult = await this.productService?.getPaginated(
      1, // page
      50, // limit
      languageCode,
      {
        supplierId: supplierId,
        status: 'active'
      },
      'createdAt',
      'DESC'
    );

    const user = await this.userService?.findById(supplier.userId);
    const primaryAddress = await this.addressService.getPrimaryAddress(supplierId, Role.SUPPLIER);

    const allTranslations = await this.translationService.getEntityTranslations(supplierId, Role.SUPPLIER);
    const translationsByLanguage = this._groupTranslationsByLanguage(allTranslations);

    return {
      id: supplier.id,
      companyName: translationMap['companyName'] || supplier.companyName,
      email: user?.email || '',
      phone: supplier.phone,
      status: supplier.status,
      address: primaryAddress ? {
        country: primaryAddress.country,
        city: primaryAddress.city,
        fullAddress: primaryAddress.fullAddress,
      } : undefined,
      products: productsResult?.data?.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        unit: product.unit,
        // categoryId: product.categoryId,
        images: product.images,
        createdAt: product.createdAt,
      })),
      translations: translationsByLanguage
    };
  }

  // Private helpers

  private _applyTranslationsToSupplier(
    supplier: SupplierDomainEntity,
    translations: any[]
  ): SupplierDomainEntity {
    const translationMap = this._createTranslationMap(translations);

    return new SupplierDomainEntity(
      supplier.id,
      supplier.userId,
      translationMap.companyName || supplier.companyName,
      supplier.registrationNumber,
      supplier.phone,
      translationMap.firstName || supplier.firstName,
      translationMap.lastName || supplier.lastName,
      translationMap.description || supplier.description,
      supplier.documents,
      supplier.status,
      supplier.translations,
      supplier.createdAt,
      supplier.updatedAt
    );
  }

  private async _applyTranslationsToSuppliers(
    suppliers: SupplierDomainEntity[],
    languageCode: LanguageCode
  ): Promise<SupplierDomainEntity[]> {
    if (suppliers.length === 0) return [];

    const supplierIds = suppliers.map(s => s.id);
    const translations = await this.translationService.getTranslationsForEntities(
      supplierIds,
      Role.SUPPLIER,
      languageCode
    );

    const translationsBySupplier = this._groupTranslationsByEntityId(translations);

    return suppliers.map(supplier => {
      const supplierTranslations = translationsBySupplier[supplier.id] || [];
      if (supplierTranslations.length === 0) return supplier;

      return this._applyTranslationsToSupplier(supplier, supplierTranslations);
    });
  }

  private _createTranslationMap(translations: any[]): Record<string, string> {
    return translations.reduce((acc, t) => {
      acc[t.fieldName] = t.translationText;
      return acc;
    }, {} as Record<string, string>);
  }

  private _groupTranslationsByEntityId(translations: any[]): Record<string, any[]> {
    return translations.reduce((acc, translation) => {
      if (!acc[translation.entityId]) {
        acc[translation.entityId] = [];
      }
      acc[translation.entityId].push(translation);
      return acc;
    }, {} as Record<string, any[]>);
  }

  private _groupTranslationsByLanguage(translations: any[]): Record<string, Record<string, string>> {
    const result: Record<string, Record<string, string>> = {};

    translations.forEach(translation => {
      if (!result[translation.languageCode]) {
        result[translation.languageCode] = {};
      }
      result[translation.languageCode][translation.fieldName] = translation.translationText;
    });

    return result;
  }

  protected _mapAddressToResponse(address: AddressResponseDto): AddressResponseDto {
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