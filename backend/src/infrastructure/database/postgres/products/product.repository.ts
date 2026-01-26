import { Repository, SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductRepository as DomainProductRepository } from '@domain/products/product.repository';
import { ProductOrmEntity } from './product.entity';
import { ProductDomainEntity } from '@domain/products/product.entity';
import { ProductStatus, Unit, Currency } from '@domain/products/types';
import { TranslationService } from '@domain/translations/translation.service';
import { LanguageCode, TranslatableProductFields, DEFAULT_LANGUAGE } from '@domain/translations/types';


@Injectable()
export class PostgresProductRepository extends DomainProductRepository {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly repository: Repository<ProductOrmEntity>,
    private readonly translationService: TranslationService
  ) { super() }

  // BaseRepository
  async create(data: Partial<ProductDomainEntity>): Promise<ProductDomainEntity> {
    const entity = this._toOrmEntity(data as ProductDomainEntity);
    const saved = await this.repository.save(entity);
    return this._toDomainEntity(saved, DEFAULT_LANGUAGE);
  }

  async findById(id: string, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<ProductDomainEntity | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['category', 'subcategory']
    });

    return entity ? this._toDomainEntity(entity, languageCode) : null;
  }

  async update(id: string, data: Partial<ProductDomainEntity>): Promise<ProductDomainEntity | null> {
    if (!await this.exists(id)) return null;

    await this.repository.update(id, this._prepareUpdateData(data));
    const updated = await this.repository.findOne({
      where: { id },
      relations: ['category', 'subcategory']
    });

    return updated ? this._toDomainEntity(updated, DEFAULT_LANGUAGE) : null;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  // QueryableRepository methods
  async findOne(filter: Partial<ProductDomainEntity>, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<ProductDomainEntity | null> {
    const query = this._buildWhereQuery(filter);
    const entity = await query.getOne();

    return entity ? this._toDomainEntity(entity, languageCode) : null;
  }

  async findMany(
    filter: Partial<ProductDomainEntity>,
    languageCode: LanguageCode = DEFAULT_LANGUAGE
  ): Promise<ProductDomainEntity[]> {
    const query = this._buildWhereQuery(filter);
    const entities = await query.getMany();

    if (languageCode === DEFAULT_LANGUAGE || entities.length === 0) {
      return Promise.all(entities.map(ormEntity => this._toDomainEntity(ormEntity, languageCode)));
    }

    // Batch request for all translations
    const entityIds = entities.map(e => e.id);
    const translations = await this.translationService.getTranslationsForEntities(
      entityIds,
      'product',
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

    return Promise.all(entities.map(ormEntity => this._toDomainEntity(ormEntity, languageCode, translate)));
  }

  async findAll(languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<ProductDomainEntity[]> {
    const entities = await this.repository.find({
      relations: ['category', 'subcategory']
    });

    return Promise.all(entities.map(ormEntity => this._toDomainEntity(ormEntity, languageCode)));
  }

  // UtilityRepository methods
  async exists(id: string): Promise<boolean> {
    return await this.repository.existsBy({ id });
  }

  // PaginableRepository methods
  async findWithPagination(
    page: number,
    limit: number,
    filter?: Partial<ProductDomainEntity>,
    languageCode: LanguageCode = DEFAULT_LANGUAGE
  ): Promise<{
    data: ProductDomainEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const query = this._buildWhereQuery(filter);

    query.skip(skip).take(limit).orderBy('product.createdAt', 'DESC');

    const [entities, total] = await query.getManyAndCount();

    const data = await Promise.all(entities.map(ormEntity => this._toDomainEntity(ormEntity, languageCode)));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Category methods
  async findByCategoryId(categoryId: string, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<ProductDomainEntity[]> {
    return this.findMany({ categoryId, status: 'active' }, languageCode);
  }

  async findBySubcategoryId(subcategoryId: string, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<ProductDomainEntity[]> {
    return this.findMany({ subcategoryId, status: 'active' }, languageCode);
  }

  async findByCategoryAndSubcategory(
    categoryId: string,
    subcategoryId?: string,
    languageCode: LanguageCode = DEFAULT_LANGUAGE
  ): Promise<ProductDomainEntity[]> {
    const filter: Partial<ProductDomainEntity> = { categoryId, status: 'active' };
    if (subcategoryId) filter.subcategoryId = subcategoryId;
    return this.findMany(filter, languageCode);
  }

  // Supplier methods
  async findBySupplierId(supplierId: string, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<ProductDomainEntity[]> {
    return this.findMany({ supplierId }, languageCode);
  }

  // Status methods
  async findByStatus(status: ProductStatus, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<ProductDomainEntity[]> {
    return this.findMany({ status }, languageCode);
  }

  async findActive(languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<ProductDomainEntity[]> {
    return this.findByStatus('active', languageCode);
  }

  // Search methods
  async findByPriceRange(min: number, max: number, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<ProductDomainEntity[]> {
    const query = this._buildBaseQuery()
      .andWhere('product.price BETWEEN :min AND :max', { min, max })
      .orderBy('product.price', 'ASC');

    const entities = await query.getMany();

    return Promise.all(entities.map(ormEntity => this._toDomainEntity(ormEntity, languageCode)));
  }

  async findByTags(tags: string[], languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<ProductDomainEntity[]> {
    const query = this._buildBaseQuery();

    tags.forEach((tag, index) => {
      query.andWhere(`product.tags @> :tag${index}`, { [`tag${index}`]: [tag] });
    });

    const entities = await query.getMany();

    return Promise.all(entities.map(ormEntity => this._toDomainEntity(ormEntity, languageCode)));
  }

  async findByName(name: string, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<ProductDomainEntity | null> {
    return this.findOne({ name }, languageCode);
  }

  async searchByName(name: string, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<ProductDomainEntity[]> {
    const query = this._buildBaseQuery()
      .andWhere('LOWER(product.name) LIKE LOWER(:name)', { name: `%${name}%` });

    const entities = await query.getMany();

    return Promise.all(entities.map(ormEntity => this._toDomainEntity(ormEntity, languageCode)));
  }

  async searchByText(text: string, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<ProductDomainEntity[]> {
    const query = this._buildBaseQuery()
      .andWhere(
        '(LOWER(product.name) LIKE LOWER(:text) OR LOWER(product.description) LIKE LOWER(:text))',
        { text: `%${text}%` }
      );

    const entities = await query.getMany();

    return Promise.all(entities.map(ormEntity => this._toDomainEntity(ormEntity, languageCode)));
  }

  async existsBySupplierAndName(supplierId: string, name: string): Promise<boolean> {
    return await this.repository.existsBy({ supplierId, name });
  }

  // Count methods
  async countBySupplier(supplierId: string): Promise<number> {
    return this.repository.count({ where: { supplierId } });
  }

  async countByStatus(status: ProductStatus): Promise<number> {
    return this.repository.count({ where: { status } });
  }

  // Sort methods
  async findSorted(
    sortBy: keyof ProductDomainEntity,
    order: 'ASC' | 'DESC',
    languageCode: LanguageCode = DEFAULT_LANGUAGE
  ): Promise<ProductDomainEntity[]> {
    const entities = await this.repository.find({
      where: { status: 'active' },
      relations: ['category', 'subcategory'],
      order: { [sortBy]: order }
    });

    return Promise.all(entities.map(ormEntity => this._toDomainEntity(ormEntity, languageCode)));
  }

  // Update methods
  async updateStatus(id: string, status: ProductStatus, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<ProductDomainEntity | null> {
    const updated = await this.update(id, { status });
    if (!updated) return null;

    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this._toDomainEntity(entity, languageCode) : null;
  }

  async updateStock(id: string, stock: number, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<ProductDomainEntity | null> {
    const updated = await this.update(id, { stock });
    if (!updated) return null;

    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this._toDomainEntity(entity, languageCode) : null;
  }

  async increaseStock(id: string, quantity: number, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<ProductDomainEntity | null> {
    if (!await this.exists(id)) return null;

    await this.repository
      .createQueryBuilder()
      .update(ProductOrmEntity)
      .set({ stock: () => `stock + ${quantity}` })
      .where('id = :id', { id })
      .execute();

    return this.findById(id, languageCode);
  }

  async decreaseStock(id: string, quantity: number, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<ProductDomainEntity | null> {
    if (!await this.exists(id)) return null;

    const product = await this.findById(id);
    if (!product || product.stock < quantity) return null;

    await this.repository
      .createQueryBuilder()
      .update(ProductOrmEntity)
      .set({ stock: () => `stock - ${quantity}` })
      .where('id = :id', { id })
      .andWhere('stock >= :quantity', { quantity })
      .execute();

    return this.findById(id, languageCode);
  }

  async updatePrice(id: string, price: number, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<ProductDomainEntity | null> {
    const updated = await this.update(id, { price });
    if (!updated) return null;

    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this._toDomainEntity(entity, languageCode) : null;
  }

  // Filter methods
  async findLowStock(threshold: number = 10, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<ProductDomainEntity[]> {
    const query = this._buildBaseQuery()
      .andWhere('product.stock <= :threshold', { threshold });

    const entities = await query.getMany();

    return Promise.all(entities.map(ormEntity => this._toDomainEntity(ormEntity, languageCode)));
  }

  async findByIds(ids: string[], languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<ProductDomainEntity[]> {
    if (ids.length === 0) return [];

    const query = this._buildBaseQuery()
      .andWhere('product.id IN (:...ids)', { ids });

    const entities = await query.getMany();

    return Promise.all(entities.map(ormEntity => this._toDomainEntity(ormEntity, languageCode)));
  }

  async findByUnit(unit: Unit, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<ProductDomainEntity[]> {
    return this.findMany({ unit, status: 'active' }, languageCode);
  }

  async findByCurrency(currency: Currency, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<ProductDomainEntity[]> {
    return this.findMany({ currency, status: 'active' }, languageCode);
  }

  // Statistics methods
  async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    archived: number;
    draft: number;
    totalStock: number;
    averagePrice: number;
  }> {
    const total = await this.repository.count();
    const active = await this.countByStatus('active');
    const inactive = await this.countByStatus('inactive');
    const archived = await this.countByStatus('archived');
    const draft = await this.countByStatus('draft');

    const stockResult = await this.repository
      .createQueryBuilder('product')
      .select('COALESCE(SUM(product.stock), 0)', 'totalStock')
      .getRawOne();

    const priceResult = await this.repository
      .createQueryBuilder('product')
      .select('COALESCE(AVG(product.price), 0)', 'averagePrice')
      .getRawOne();

    return {
      total,
      active,
      inactive,
      archived,
      draft,
      totalStock: parseFloat(stockResult?.totalStock || '0') || 0,
      averagePrice: parseFloat(priceResult?.averagePrice || '0') || 0
    };
  }

  // Helper methods
  private _buildBaseQuery(): SelectQueryBuilder<ProductOrmEntity> {
    return this.repository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.subcategory', 'subcategory')
      .where('product.status = :status', { status: 'active' });
  }

  private _buildWhereQuery(filter?: Partial<ProductDomainEntity>): SelectQueryBuilder<ProductOrmEntity> {
    const query = this.repository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.subcategory', 'subcategory');

    if (filter) {
      this._applyFilters(query, filter);
    }

    return query;
  }

  private _applyFilters(query: SelectQueryBuilder<ProductOrmEntity>, filter: Partial<ProductDomainEntity>) {
    if (filter.id) query.andWhere('product.id = :id', { id: filter.id });
    if (filter.supplierId) query.andWhere('product.supplierId = :supplierId', { supplierId: filter.supplierId });
    if (filter.name) query.andWhere('product.name = :name', { name: filter.name });
    if (filter.description) query.andWhere('product.description = :description', { description: filter.description });
    if (filter.price !== undefined) query.andWhere('product.price = :price', { price: filter.price });
    if (filter.unit !== undefined) query.andWhere('product.unit = :unit', { unit: filter.unit });
    if (filter.currency !== undefined) query.andWhere('product.currency = :currency', { currency: filter.currency });
    if (filter.categoryId !== undefined) query.andWhere('product.categoryId = :categoryId', { categoryId: filter.categoryId });
    if (filter.subcategoryId !== undefined) query.andWhere('product.subcategoryId = :subcategoryId', { subcategoryId: filter.subcategoryId });
    if (filter.images !== undefined) this._applyImagesFilter(query, filter.images);
    if (filter.stock !== undefined) query.andWhere('product.stock = :stock', { stock: filter.stock });
    if (filter.status) query.andWhere('product.status = :status', { status: filter.status });
    if (filter.tags !== undefined) this._applyTagsFilter(query, filter.tags);
  }

  private _applyImagesFilter(query: SelectQueryBuilder<ProductOrmEntity>, images: string[] | undefined) {
    if (Array.isArray(images)) {
      if (images.length === 0) {
        query.andWhere('product.images = :emptyArray', { emptyArray: [] });
      } else {
        query.andWhere('product.images @> :images', { images });
      }
    }
  }

  private _applyTagsFilter(query: SelectQueryBuilder<ProductOrmEntity>, tags: string[] | undefined) {
    if (Array.isArray(tags)) {
      if (tags.length === 0) {
        query.andWhere('product.tags = :emptyArray', { emptyArray: [] });
      } else {
        query.andWhere('product.tags @> :tags', { tags });
      }
    }
  }

  private _prepareUpdateData(data: Partial<ProductDomainEntity>): Partial<ProductOrmEntity> {
    const updateData: Partial<ProductOrmEntity> = {};

    if (data.supplierId !== undefined) updateData.supplierId = data.supplierId;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.subcategoryId !== undefined) updateData.subcategoryId = data.subcategoryId;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.tags !== undefined) updateData.tags = data.tags;

    return updateData;
  }

  private async _toDomainEntity(
    ormEntity: ProductOrmEntity,
    languageCode: LanguageCode = DEFAULT_LANGUAGE,
    preTranslate?: Map<string, Map<string, string>>
  ): Promise<ProductDomainEntity> {

    const {
      id, supplierId, name, description, shortDescription, unit, currency,
      categoryId, subcategoryId, images, stock, status, tags,
      createdAt, updatedAt
    } = ormEntity;

    const price = typeof ormEntity.price === 'string' ? parseFloat(ormEntity.price) : ormEntity.price;

    let translatedName = name;
    let translatedDescription = description;
    let translatedShortDescription = shortDescription || undefined;
    let translationsData: Partial<Record<LanguageCode, Partial<Record<TranslatableProductFields, string>>>> | undefined;

    if (languageCode !== DEFAULT_LANGUAGE) {
      let translationsForLanguage: Partial<Record<TranslatableProductFields, string>> = {};
      let hasTranslations = false;

      if (preTranslate && preTranslate.has(id)) {
        const translationMap = preTranslate.get(id)!;
        hasTranslations = translationMap.size > 0;

        if (hasTranslations) {
          translationMap.forEach((text, fieldName) => {
            translationsForLanguage[fieldName as TranslatableProductFields] = text;
          });
        }
      } else {
        const translations = await this.translationService.getTranslationsForEntities(
          [id],
          'product',
          languageCode
        );

        hasTranslations = translations.length > 0;
        if (hasTranslations) {
          translations.forEach(t => {
            translationsForLanguage[t.fieldName as TranslatableProductFields] = t.translationText;
          });
        }
      }

      if (hasTranslations) {
        translatedName = translationsForLanguage.name || name;
        translatedDescription = translationsForLanguage.description || description;
        translatedShortDescription = translationsForLanguage.shortDescription || shortDescription || undefined;
        translationsData = { [languageCode]: translationsForLanguage };
      }
    }

    return new ProductDomainEntity(
      id,
      supplierId,
      translatedName,
      translatedDescription,
      price,
      unit as Unit,
      currency as Currency,
      translatedShortDescription,
      categoryId || undefined,
      subcategoryId || undefined,
      images || [],
      stock,
      status as ProductStatus,
      tags || [],
      translationsData,
      createdAt,
      updatedAt
    );
  }

  private _toOrmEntity(domainEntity: ProductDomainEntity): ProductOrmEntity {
    const entity = new ProductOrmEntity();

    if (domainEntity.id) entity.id = domainEntity.id;
    entity.supplierId = domainEntity.supplierId;
    entity.name = domainEntity.name;
    entity.description = domainEntity.description;
    entity.price = domainEntity.price;
    entity.unit = domainEntity.unit;
    entity.currency = domainEntity.currency;
    entity.categoryId = domainEntity.categoryId || null;
    entity.subcategoryId = domainEntity.subcategoryId || null;
    entity.images = domainEntity.images;
    entity.stock = domainEntity.stock;
    entity.status = domainEntity.status;
    entity.tags = domainEntity.tags;
    entity.createdAt = domainEntity.createdAt;
    entity.updatedAt = domainEntity.updatedAt;

    return entity;
  }
}