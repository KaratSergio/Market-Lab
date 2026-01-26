import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, FindOptionsWhere } from 'typeorm';
import { TranslationRepository as DomainTranslationRepository } from '@domain/translations/translation.repository';
import { TranslationDomainEntity } from '@domain/translations/translation.entity';
import { TranslationOrmEntity } from './translation.entity';

import {
  TranslationQueryDto,
  TranslationEntityType,
  LanguageCode,
  TranslationCreateData
} from '@domain/translations/types';


@Injectable()
export class PostgresTranslationRepository extends DomainTranslationRepository {
  constructor(
    @InjectRepository(TranslationOrmEntity)
    private readonly repository: Repository<TranslationOrmEntity>
  ) {
    super();
  }

  async create(data: TranslationDomainEntity): Promise<TranslationDomainEntity> {
    const ormEntity = this._toOrmEntity(data);
    const saved = await this.repository.save(ormEntity);
    return this._toDomainEntity(saved);
  }

  async findById(id: string): Promise<TranslationDomainEntity | null> {
    const entity = await this.repository.findOneBy({ id });
    return entity ? this._toDomainEntity(entity) : null;
  }

  async update(id: string, data: Partial<TranslationDomainEntity>): Promise<TranslationDomainEntity | null> {
    await this.repository.update(id, this._prepareUpdateData(data));
    const updated = await this.repository.findOneBy({ id });
    return updated ? this._toDomainEntity(updated) : null;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findOne(filter: Partial<TranslationDomainEntity>): Promise<TranslationDomainEntity | null> {
    const where = this._buildWhereConditions(filter);
    const entity = await this.repository.findOne({ where });
    return entity ? this._toDomainEntity(entity) : null;
  }

  async findMany(filter: Partial<TranslationDomainEntity>): Promise<TranslationDomainEntity[]> {
    const where = this._buildWhereConditions(filter);
    const entities = await this.repository.find({ where });
    return entities.map(this._toDomainEntity);
  }

  async findAll(): Promise<TranslationDomainEntity[]> {
    const entities = await this.repository.find();
    return entities.map(this._toDomainEntity);
  }

  // Translation-specific methods

  async findByQuery(query: TranslationQueryDto): Promise<TranslationDomainEntity[]> {
    const where = this._buildQueryConditions(query);
    const entities = await this.repository.find({ where });
    return entities.map(this._toDomainEntity);
  }

  async getTranslationsForEntity(
    entityId: string,
    entityType: TranslationEntityType
  ): Promise<TranslationDomainEntity[]> {
    const entities = await this.repository.find({
      where: { entityId, entityType }
    });
    return entities.map(this._toDomainEntity);
  }

  async getTranslationsForEntities(
    entityIds: string[],
    entityType: TranslationEntityType,
    languageCode?: LanguageCode
  ): Promise<TranslationDomainEntity[]> {
    const where: FindOptionsWhere<TranslationOrmEntity> = {
      entityId: In(entityIds),
      entityType
    };

    if (languageCode) where.languageCode = languageCode;

    const entities = await this.repository.find({ where });
    return entities.map(this._toDomainEntity);
  }

  async getTranslationsByLanguage(
    entityType: TranslationEntityType,
    languageCode: LanguageCode
  ): Promise<TranslationDomainEntity[]> {
    const entities = await this.repository.find({
      where: { entityType, languageCode }
    });
    return entities.map(this._toDomainEntity);
  }

  async deleteByEntity(
    entityId: string,
    entityType: TranslationEntityType,
    languageCode?: LanguageCode,
    fieldName?: string
  ): Promise<void> {
    const where: FindOptionsWhere<TranslationOrmEntity> = { entityId, entityType };
    if (languageCode) where.languageCode = languageCode;
    if (fieldName) where.fieldName = fieldName;
    await this.repository.delete(where);
  }

  async bulkCreate(
    translations: TranslationCreateData[]
  ): Promise<TranslationDomainEntity[]> {
    const ormEntities = translations.map(data => {
      const ormEntity = new TranslationOrmEntity();
      ormEntity.entityId = data.entityId;
      ormEntity.entityType = data.entityType;
      ormEntity.languageCode = data.languageCode;
      ormEntity.fieldName = data.fieldName;
      ormEntity.translationText = data.translationText;
      return ormEntity;
    });

    const saved = await this.repository.save(ormEntities);
    return saved.map(this._toDomainEntity);
  }

  async bulkUpdate(
    updates: Array<{ id: string; translationText: string }>
  ): Promise<TranslationDomainEntity[]> {
    // batch update
    const updatePromises = updates.map(update =>
      this.repository.update(update.id, { translationText: update.translationText })
    );

    await Promise.all(updatePromises);

    const ids = updates.map(u => u.id);
    const updatedEntities = await this.repository.findBy({ id: In(ids) });
    return updatedEntities.map(this._toDomainEntity);
  }

  // Private helper methods

  private _buildWhereConditions(filter: Partial<TranslationDomainEntity>): FindOptionsWhere<TranslationOrmEntity> {
    const where: FindOptionsWhere<TranslationOrmEntity> = {};

    if (filter.id !== undefined) where.id = filter.id;
    if (filter.entityId !== undefined) where.entityId = filter.entityId;
    if (filter.entityType !== undefined) where.entityType = filter.entityType as TranslationEntityType;
    if (filter.languageCode !== undefined) where.languageCode = filter.languageCode as LanguageCode;
    if (filter.fieldName !== undefined) where.fieldName = filter.fieldName;
    if (filter.translationText !== undefined) where.translationText = filter.translationText;

    return where;
  }

  private _buildQueryConditions(query: TranslationQueryDto): FindOptionsWhere<TranslationOrmEntity> {
    const where: FindOptionsWhere<TranslationOrmEntity> = {};

    if (query.entityId !== undefined) where.entityId = query.entityId;
    if (query.entityIds !== undefined) where.entityId = In(query.entityIds);
    if (query.entityType !== undefined) where.entityType = query.entityType;
    if (query.languageCode !== undefined) where.languageCode = query.languageCode;
    if (query.fieldName !== undefined) where.fieldName = query.fieldName;

    return where;
  }

  private _prepareUpdateData(data: Partial<TranslationDomainEntity>): Partial<TranslationOrmEntity> {
    const updateData: Partial<TranslationOrmEntity> = {};

    if (data.entityId !== undefined) updateData.entityId = data.entityId;
    if (data.entityType !== undefined) updateData.entityType = data.entityType;
    if (data.languageCode !== undefined) updateData.languageCode = data.languageCode as LanguageCode;
    if (data.fieldName !== undefined) updateData.fieldName = data.fieldName;
    if (data.translationText !== undefined) updateData.translationText = data.translationText;

    return updateData;
  }

  private _toDomainEntity(ormEntity: TranslationOrmEntity): TranslationDomainEntity {
    return new TranslationDomainEntity(
      ormEntity.id,
      ormEntity.entityId,
      ormEntity.entityType as TranslationEntityType,
      ormEntity.languageCode as LanguageCode,
      ormEntity.fieldName,
      ormEntity.translationText,
      ormEntity.createdAt,
      ormEntity.updatedAt
    );
  }

  private _toOrmEntity(domainEntity: TranslationDomainEntity): TranslationOrmEntity {
    const ormEntity = new TranslationOrmEntity();
    ormEntity.id = domainEntity.id;
    ormEntity.entityId = domainEntity.entityId;
    ormEntity.entityType = domainEntity.entityType;
    ormEntity.languageCode = domainEntity.languageCode;
    ormEntity.fieldName = domainEntity.fieldName;
    ormEntity.translationText = domainEntity.translationText;
    ormEntity.createdAt = domainEntity.createdAt;
    ormEntity.updatedAt = domainEntity.updatedAt;
    return ormEntity;
  }
}