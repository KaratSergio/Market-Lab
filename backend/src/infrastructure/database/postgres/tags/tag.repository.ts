import { Repository, FindOptionsWhere } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TagRepository as DomainTagRepository } from '@domain/tags/tag.repository';
import { TagOrmEntity } from './tag.entity';
import { TagDomainEntity } from '@domain/tags/tag.entity';
import { TagStatus, PopularTag } from '@domain/tags/types/tag.type';


@Injectable()
export class PostgresTagRepository extends DomainTagRepository {
  constructor(
    @InjectRepository(TagOrmEntity)
    private readonly repository: Repository<TagOrmEntity>
  ) {
    super();
  }

  // BaseRepository methods
  async create(data: TagDomainEntity): Promise<TagDomainEntity> {
    const ormEntity = this._toOrmEntity(data);
    const saved = await this.repository.save(ormEntity);
    return this._toDomainEntity(saved);
  }

  async findById(id: string): Promise<TagDomainEntity | null> {
    const entity = await this.repository.findOneBy({ id });
    return entity ? this._toDomainEntity(entity) : null;
  }

  async update(id: string, data: Partial<TagDomainEntity>): Promise<TagDomainEntity | null> {
    if (!await this.exists(id)) return null;

    await this.repository.update(id, this._prepareUpdateData(data));
    const updated = await this.repository.findOneBy({ id });
    return updated ? this._toDomainEntity(updated) : null;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  // QueryableRepository methods
  async findOne(filter: Partial<TagDomainEntity>): Promise<TagDomainEntity | null> {
    const query = this._buildWhereConditions(filter);
    const entity = await this.repository.findOne({ where: query });
    return entity ? this._toDomainEntity(entity) : null;
  }

  async findMany(filter: Partial<TagDomainEntity>): Promise<TagDomainEntity[]> {
    const query = this._buildWhereConditions(filter);
    const entities = await this.repository.find({ where: query });
    return entities.map(this._toDomainEntity);
  }

  async findAll(): Promise<TagDomainEntity[]> {
    const entities = await this.repository.find({
      order: { usageCount: 'DESC', name: 'ASC' }
    });
    return entities.map(this._toDomainEntity);
  }

  async exists(id: string): Promise<boolean> {
    return await this.repository.existsBy({ id });
  }

  // Tag-specific methods
  async findBySlug(slug: string): Promise<TagDomainEntity | null> {
    const entity = await this.repository.findOneBy({ slug });
    return entity ? this._toDomainEntity(entity) : null;
  }

  async findByName(name: string, exact: boolean = true): Promise<TagDomainEntity[]> {
    if (exact) {
      const entity = await this.repository.findOneBy({ name });
      return entity ? [this._toDomainEntity(entity)] : [];
    } else {
      const entities = await this.repository
        .createQueryBuilder('tag')
        .where('tag.name ILIKE :name', { name: `%${name}%` })
        .orderBy('tag.usageCount', 'DESC')
        .getMany();
      return entities.map(this._toDomainEntity);
    }
  }

  async findByStatus(status: TagStatus): Promise<TagDomainEntity[]> {
    const entities = await this.repository.find({
      where: { status },
      order: { usageCount: 'DESC', name: 'ASC' }
    });
    return entities.map(this._toDomainEntity);
  }

  async findActive(): Promise<TagDomainEntity[]> {
    return this.findByStatus('active');
  }

  async existsBySlug(slug: string): Promise<boolean> {
    return await this.repository.existsBy({ slug });
  }

  async existsByName(name: string): Promise<boolean> {
    return await this.repository.existsBy({ name });
  }

  // Product-tag relationship methods
  async addToProduct(productId: string, tagId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .relation(TagOrmEntity, 'products')
      .of(productId)
      .add(tagId);
  }

  async removeFromProduct(productId: string, tagId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .relation(TagOrmEntity, 'products')
      .of(productId)
      .remove(tagId);
  }

  async getProductTags(productId: string): Promise<TagDomainEntity[]> {
    const tags = await this.repository
      .createQueryBuilder('tag')
      .innerJoin('tag.products', 'product', 'product.id = :productId', { productId })
      .getMany();

    return tags.map(tag => this._toDomainEntity(tag));
  }

  async getTagsByProductIds(productIds: string[]): Promise<Map<string, TagDomainEntity[]>> {
    const tags = await this.repository
      .createQueryBuilder('tag')
      .innerJoin('tag.products', 'product')
      .where('product.id IN (:...productIds)', { productIds })
      .orderBy('tag.name', 'ASC')
      .getMany();

    const result = new Map<string, TagDomainEntity[]>();

    for (const productId of productIds) {
      const productTags = tags.filter(tag =>
        tag.products?.some(p => p.id === productId)
      );
      result.set(productId, productTags.map(t => this._toDomainEntity(t)));
    }

    return result;
  }

  // Usage statistics
  async getPopularTags(limit: number = 20): Promise<PopularTag[]> {
    const result = await this.repository
      .createQueryBuilder('tag')
      .select([
        'tag.id as id',
        'tag.name as name',
        'tag.slug as slug',
        'COUNT(product.id) as productCount'
      ])
      .leftJoin('tag.products', 'product')
      .where('tag.status = :status', { status: 'active' })
      .groupBy('tag.id, tag.name, tag.slug')
      .orderBy('productCount', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map((row: any) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      productCount: parseInt(row.productCount, 10) || 0
    }));
  }

  async getTagsWithProductCount(): Promise<Array<{ tagId: string; tagName: string; count: number }>> {
    const result = await this.repository
      .createQueryBuilder('tag')
      .leftJoin('tag.products', 'p')
      .select([
        'tag.id as tagId',
        'tag.name as tagName',
        'COUNT(p.id) as count'
      ])
      .groupBy('tag.id, tag.name')
      .orderBy('tag.name', 'ASC')
      .getRawMany();

    return result.map((row: any) => ({
      tagId: row.tagid,
      tagName: row.tagname,
      count: parseInt(row.count, 10) || 0
    }));
  }

  async countProductsByTag(tagId: string): Promise<number> {
    const tag = await this.repository.findOne({
      where: { id: tagId },
      relations: ['products']
    });

    return tag?.products?.length || 0;
  }

  // Search and filtering
  async searchTags(query: string, limit: number = 10): Promise<TagDomainEntity[]> {
    const entities = await this.repository
      .createQueryBuilder('tag')
      .where('tag.name ILIKE :query OR tag.slug ILIKE :query', { query: `%${query}%` })
      .andWhere('tag.status = :status', { status: 'active' })
      .orderBy('tag.usageCount', 'DESC')
      .limit(limit)
      .getMany();

    return entities.map(this._toDomainEntity);
  }

  async findTagsByProductIds(productIds: string[]): Promise<TagDomainEntity[]> {
    const entities = await this.repository
      .createQueryBuilder('tag')
      .innerJoin('tag.products', 'product')
      .where('product.id IN (:...productIds)', { productIds })
      .distinct(true)
      .orderBy('tag.name', 'ASC')
      .getMany();

    return entities.map(this._toDomainEntity);
  }

  // Bulk operations
  async bulkUpdateUsageCounts(): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(TagOrmEntity)
      .set({
        usageCount: () => '(SELECT COUNT(*) FROM product_tags WHERE product_tags.tagId = id)'
      })
      .execute();
  }

  async syncProductTags(productId: string, tagIds: string[]): Promise<void> {
    // First, remove all existing relationships
    await this.repository
      .createQueryBuilder()
      .relation(TagOrmEntity, 'products')
      .of(tagIds)
      .addAndRemove(tagIds, productId);
  }

  // Private helper methods
  private _buildWhereConditions(filter: Partial<TagDomainEntity>): FindOptionsWhere<TagOrmEntity> {
    const where: FindOptionsWhere<TagOrmEntity> = {};

    if (filter.id !== undefined) where.id = filter.id;
    if (filter.name !== undefined) where.name = filter.name;
    if (filter.slug !== undefined) where.slug = filter.slug;
    if (filter.description !== undefined) where.description = filter.description;
    if (filter.status !== undefined) where.status = filter.status;
    if (filter.usageCount !== undefined) where.usageCount = filter.usageCount;

    return where;
  }

  private _prepareUpdateData(data: Partial<TagDomainEntity>): Partial<TagOrmEntity> {
    const updateData: Partial<TagOrmEntity> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.usageCount !== undefined) updateData.usageCount = data.usageCount;

    return updateData;
  }

  private _toDomainEntity(ormEntity: TagOrmEntity): TagDomainEntity {
    return new TagDomainEntity(
      ormEntity.id,
      ormEntity.name,
      ormEntity.slug,
      ormEntity.description || undefined,
      ormEntity.status as TagStatus,
      ormEntity.usageCount,
      ormEntity.createdAt,
      ormEntity.updatedAt
    );
  }

  private _toOrmEntity(domainEntity: TagDomainEntity): TagOrmEntity {
    return Object.assign(new TagOrmEntity(), {
      id: domainEntity.id,
      name: domainEntity.name,
      slug: domainEntity.slug,
      description: domainEntity.description || null,
      status: domainEntity.status,
      usageCount: domainEntity.usageCount,
      createdAt: domainEntity.createdAt,
      updatedAt: domainEntity.updatedAt
    });
  }
}