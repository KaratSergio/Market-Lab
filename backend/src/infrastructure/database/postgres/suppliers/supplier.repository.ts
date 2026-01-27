import { Repository, SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SupplierRepository as DomainSupplierRepository } from '@domain/suppliers/supplier.repository';
import { SupplierDomainEntity } from '@domain/suppliers/supplier.entity';
import { SupplierProfileOrmEntity } from './supplier.entity';
import { SupplierStatus } from '@domain/suppliers/types';
import { TranslationService } from '@domain/translations/translation.service';
import { LanguageCode, DEFAULT_LANGUAGE, TranslatableSupplierFields } from '@domain/translations/types';


@Injectable()
export class PostgresSupplierRepository extends DomainSupplierRepository {
  constructor(
    @InjectRepository(SupplierProfileOrmEntity)
    private readonly repository: Repository<SupplierProfileOrmEntity>,
    private readonly translationService: TranslationService
  ) {
    super();
  }

  // BaseRepository methods with languageCode
  async findAll(languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<SupplierDomainEntity[]> {
    const ormEntities = await this.repository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    return this._toDomainEntities(ormEntities, languageCode);
  }

  async findById(id: string, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<SupplierDomainEntity | null> {
    if (!id) return null;
    const ormEntity = await this.repository.findOne({
      where: { id },
      relations: ['user']
    });
    return ormEntity ? this._toDomainEntity(ormEntity, languageCode) : null;
  }

  async findByUserId(userId: string, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<SupplierDomainEntity | null> {
    const ormEntity = await this.repository.findOne({
      where: { user_id: userId },
      relations: ['user']
    });
    return ormEntity ? this._toDomainEntity(ormEntity, languageCode) : null;
  }

  async findByRegistrationNumber(regNumber: string, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<SupplierDomainEntity | null> {
    const ormEntity = await this.repository.findOne({
      where: { registrationNumber: regNumber },
      relations: ['user']
    });
    return ormEntity ? this._toDomainEntity(ormEntity, languageCode) : null;
  }

  async findByStatus(status: string, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<SupplierDomainEntity[]> {
    const ormEntities = await this.repository.find({
      where: { status },
      relations: ['user']
    });
    return this._toDomainEntities(ormEntities, languageCode);
  }

  async create(data: Partial<SupplierDomainEntity>, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<SupplierDomainEntity> {
    const ormEntity = this._toOrmEntity(data);
    const savedOrmEntity = await this.repository.save(ormEntity);
    return this._toDomainEntity(savedOrmEntity, languageCode);
  }

  async update(id: string, data: Partial<SupplierDomainEntity>, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<SupplierDomainEntity | null> {
    if (!id) throw new Error('Supplier ID is required for update');

    await this.repository.update(id, data);
    const updatedOrmEntity = await this.repository.findOne({
      where: { id },
      relations: ['user']
    });

    return updatedOrmEntity ? this._toDomainEntity(updatedOrmEntity, languageCode) : null;
  }

  async delete(id: string): Promise<void> {
    if (!id) throw new Error('Supplier ID is required for delete');
    await this.repository.delete(id);
  }

  // QueryableRepository methods
  async findOne(
    filter: Partial<SupplierDomainEntity>,
    languageCode: LanguageCode = DEFAULT_LANGUAGE
  ): Promise<SupplierDomainEntity | null> {
    const queryBuilder = this._buildBaseQuery();
    this._applyFilters(queryBuilder, filter);

    const ormEntity = await queryBuilder.getOne();
    return ormEntity ? this._toDomainEntity(ormEntity, languageCode) : null;
  }

  async findMany(
    filter: Partial<SupplierDomainEntity>,
    languageCode: LanguageCode = DEFAULT_LANGUAGE
  ): Promise<SupplierDomainEntity[]> {
    const queryBuilder = this._buildBaseQuery();
    this._applyFilters(queryBuilder, filter);

    const ormEntities = await queryBuilder.getMany();

    if (languageCode === DEFAULT_LANGUAGE || ormEntities.length === 0) {
      return Promise.all(ormEntities.map(ormEntity => this._toDomainEntity(ormEntity, languageCode)));
    }

    // Batch request
    const supplierIds = ormEntities.map(e => e.id);
    const translations = await this.translationService.getTranslationsForEntities(
      supplierIds,
      'supplier',
      languageCode
    );

    const translate = new Map<string, Map<string, string>>();

    for (const translation of translations) {
      const { entityId, fieldName, translationText } = translation;

      let fieldMap = translate.get(entityId);
      if (!fieldMap) {
        fieldMap = new Map<string, string>();
        translate.set(entityId, fieldMap);
      }

      fieldMap.set(fieldName, translationText);
    }

    return Promise.all(ormEntities.map(ormEntity =>
      this._toDomainEntity(ormEntity, languageCode, translate)
    ));
  }

  // PaginableRepository method
  async findWithPagination(
    page: number,
    limit: number,
    filter?: Partial<SupplierDomainEntity>,
    languageCode: LanguageCode = DEFAULT_LANGUAGE
  ): Promise<{
    data: SupplierDomainEntity[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const queryBuilder = this._buildBaseQuery();

    if (filter) {
      this._applyFilters(queryBuilder, filter);
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('supplier.createdAt', 'DESC');

    const data = await this.findMany({} as any, languageCode);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Private helpers

  private _buildBaseQuery(): SelectQueryBuilder<SupplierProfileOrmEntity> {
    return this.repository
      .createQueryBuilder('supplier')
      .leftJoinAndSelect('supplier.user', 'user');
  }

  private _applyFilters(
    queryBuilder: SelectQueryBuilder<SupplierProfileOrmEntity>,
    filter: Partial<SupplierDomainEntity>
  ) {
    if (filter.id) queryBuilder.andWhere('supplier.id = :id', { id: filter.id });
    if (filter.userId) queryBuilder.andWhere('supplier.user_id = :userId', { userId: filter.userId });
    if (filter.status) queryBuilder.andWhere('supplier.status = :status', { status: filter.status });
    if (filter.companyName) {
      if (filter.companyName.includes('%')) queryBuilder.andWhere('supplier.companyName ILIKE :companyName', { companyName: filter.companyName });
      else queryBuilder.andWhere('supplier.companyName = :companyName', { companyName: filter.companyName });
    }
    if (filter.registrationNumber) queryBuilder.andWhere('supplier.registrationNumber = :registrationNumber', { registrationNumber: filter.registrationNumber });
    if (filter.phone) queryBuilder.andWhere('supplier.phone = :phone', { phone: filter.phone });
    if (filter.firstName) queryBuilder.andWhere('supplier.firstName = :firstName', { firstName: filter.firstName });
    if (filter.lastName) queryBuilder.andWhere('supplier.lastName = :lastName', { lastName: filter.lastName });
    if (filter.description) queryBuilder.andWhere('supplier.description = :description', { description: filter.description });
  }

  private async _toDomainEntity(
    ormEntity: SupplierProfileOrmEntity,
    languageCode: LanguageCode = DEFAULT_LANGUAGE,
    preTranslate?: Map<string, Map<string, string>>
  ): Promise<SupplierDomainEntity> {
    const {
      id,
      user_id,
      companyName,
      registrationNumber,
      phone,
      firstName,
      lastName,
      description,
      documents,
      status,
      createdAt,
      updatedAt
    } = ormEntity;

    let translatedCompanyName = companyName;
    let translatedFirstName = firstName;
    let translatedLastName = lastName;
    let translatedDescription = description;
    let translationsData: any;

    if (languageCode !== DEFAULT_LANGUAGE) {
      let translationsForLanguage: Partial<Record<TranslatableSupplierFields, string>> = {};
      let hasTranslations = false;

      if (preTranslate && preTranslate.has(id)) {
        const translationMap = preTranslate.get(id)!;
        hasTranslations = translationMap.size > 0;

        if (hasTranslations) {
          translationMap.forEach((text, fieldName) => {
            translationsForLanguage[fieldName as TranslatableSupplierFields] = text;
          });
        }
      } else {
        const translations = await this.translationService.getTranslationsForEntities(
          [id],
          'supplier',
          languageCode
        );

        hasTranslations = translations.length > 0;
        if (hasTranslations) {
          translations.forEach(t => {
            translationsForLanguage[t.fieldName as TranslatableSupplierFields] = t.translationText;
          });
        }
      }

      if (hasTranslations) {
        translatedCompanyName = translationsForLanguage.companyName || companyName;
        translatedFirstName = translationsForLanguage.firstName || firstName;
        translatedLastName = translationsForLanguage.lastName || lastName;
        translatedDescription = translationsForLanguage.description || description;
        translationsData = { [languageCode]: translationsForLanguage };
      }
    }

    return new SupplierDomainEntity(
      id,
      user_id,
      translatedCompanyName,
      registrationNumber,
      phone,
      translatedFirstName,
      translatedLastName,
      translatedDescription,
      documents || [],
      status as SupplierStatus,
      translationsData,
      createdAt,
      updatedAt,
    );
  }

  private async _toDomainEntities(
    ormEntities: SupplierProfileOrmEntity[],
    languageCode: LanguageCode = DEFAULT_LANGUAGE
  ): Promise<SupplierDomainEntity[]> {
    if (ormEntities.length === 0) return [];

    return Promise.all(ormEntities.map(ormEntity =>
      this._toDomainEntity(ormEntity, languageCode)
    ));
  }

  private _toOrmEntity(domainEntity: Partial<SupplierDomainEntity>): SupplierProfileOrmEntity {
    const ormEntity = new SupplierProfileOrmEntity();

    if (domainEntity.id) ormEntity.id = domainEntity.id;
    if (domainEntity.userId) ormEntity.user_id = domainEntity.userId;
    if (domainEntity.companyName) ormEntity.companyName = domainEntity.companyName;
    if (domainEntity.registrationNumber) ormEntity.registrationNumber = domainEntity.registrationNumber;
    if (domainEntity.phone) ormEntity.phone = domainEntity.phone;
    if (domainEntity.firstName !== undefined) ormEntity.firstName = domainEntity.firstName;
    if (domainEntity.lastName !== undefined) ormEntity.lastName = domainEntity.lastName;
    if (domainEntity.description !== undefined) ormEntity.description = domainEntity.description;
    if (domainEntity.documents) ormEntity.documents = domainEntity.documents;
    if (domainEntity.status) ormEntity.status = domainEntity.status;
    if (domainEntity.createdAt) ormEntity.createdAt = domainEntity.createdAt;
    if (domainEntity.updatedAt) ormEntity.updatedAt = domainEntity.updatedAt;

    return ormEntity;
  }
}