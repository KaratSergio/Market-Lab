import { Repository, FindOptionsWhere, IsNull } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryRepository as DomainCategoryRepository } from '@domain/categories/category.repository';
import { CategoryOrmEntity } from './category.entity';
import { CategoryDomainEntity } from '@domain/categories/category.entity';
import { CategoryTreeItem, CategoryStatus } from '@domain/categories/types/category.type';

@Injectable()
export class PostgresCategoryRepository extends DomainCategoryRepository {
  constructor(
    @InjectRepository(CategoryOrmEntity)
    private readonly repository: Repository<CategoryOrmEntity>
  ) {
    super();
  }

  // BaseRepository methods
  async create(data: CategoryDomainEntity): Promise<CategoryDomainEntity> {
    const ormEntity = this.toOrmEntity(data);
    const saved = await this.repository.save(ormEntity);
    return this.toDomainEntity(saved);
  }

  async findById(id: string): Promise<CategoryDomainEntity | null> {
    const entity = await this.repository.findOneBy({ id });
    return entity ? this.toDomainEntity(entity) : null;
  }

  async update(id: string, data: Partial<CategoryDomainEntity>): Promise<CategoryDomainEntity | null> {
    if (!await this.exists(id)) return null;

    await this.repository.update(id, this.prepareUpdateData(data));
    const updated = await this.repository.findOneBy({ id });
    return updated ? this.toDomainEntity(updated) : null;
  }

  async delete(id: string): Promise<void> {
    const children = await this.findChildren(id);
    if (children.length > 0) throw new Error('Cannot delete category with children');

    const category = await this.repository.findOne({
      where: { id },
      relations: ['products']
    });

    if (category && category.products && category.products.length > 0) {
      throw new Error('Cannot delete category with products');
    }

    await this.repository.delete(id);
  }

  // QueryableRepository methods
  async findOne(filter: Partial<CategoryDomainEntity>): Promise<CategoryDomainEntity | null> {
    const query = this.buildWhereConditions(filter);
    const entity = await this.repository.findOne({ where: query });
    return entity ? this.toDomainEntity(entity) : null;
  }

  async findMany(filter: Partial<CategoryDomainEntity>): Promise<CategoryDomainEntity[]> {
    const query = this.buildWhereConditions(filter);
    const entities = await this.repository.find({ where: query });
    return entities.map(this.toDomainEntity);
  }

  async findAll(): Promise<CategoryDomainEntity[]> {
    const entities = await this.repository.find({ order: { order: 'ASC', name: 'ASC' } });
    return entities.map(this.toDomainEntity);
  }

  // UtilityRepository methods
  async exists(id: string): Promise<boolean> {
    return await this.repository.existsBy({ id });
  }

  // PaginableRepository methods
  async findWithPagination(
    page: number,
    limit: number,
    filter?: Partial<CategoryDomainEntity>
  ): Promise<{
    data: CategoryDomainEntity[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const where = filter ? this.buildWhereConditions(filter) : {};

    const [entities, total] = await this.repository.findAndCount({
      where,
      skip,
      take: limit,
      order: { order: 'ASC', name: 'ASC' }
    });

    return {
      data: entities.map(this.toDomainEntity),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Category-specific methods
  async findBySlug(slug: string): Promise<CategoryDomainEntity | null> {
    const entity = await this.repository.findOneBy({ slug });
    return entity ? this.toDomainEntity(entity) : null;
  }

  async findByParentId(parentId: string | null): Promise<CategoryDomainEntity[]> {
    const where: FindOptionsWhere<CategoryOrmEntity> =
      parentId === null
        ? { parentId: IsNull() }
        : { parentId };

    const entities = await this.repository.find({
      where,
      order: { order: 'ASC', name: 'ASC' }
    });
    return entities.map(this.toDomainEntity);
  }

  async findParents(): Promise<CategoryDomainEntity[]> {
    return this.findByParentId(null);
  }

  async findChildren(parentId: string): Promise<CategoryDomainEntity[]> {
    return this.findByParentId(parentId);
  }

  async findByStatus(status: CategoryStatus): Promise<CategoryDomainEntity[]> {
    const entities = await this.repository.find({
      where: { status },
      order: { order: 'ASC', name: 'ASC' }
    });
    return entities.map(this.toDomainEntity);
  }

  async findActive(): Promise<CategoryDomainEntity[]> {
    return this.findByStatus('active');
  }

  async getTree(): Promise<CategoryTreeItem[]> {
    const parents = await this.findParents();

    return Promise.all(parents.map(async parent => {
      const children = await this.findChildren(parent.id);

      return {
        ...parent,
        children: children.map(child => ({ ...child, children: [] }))
      };
    }));
  }

  async existsBySlug(slug: string): Promise<boolean> {
    return await this.repository.existsBy({ slug });
  }

  async existsByParentAndName(parentId: string | null, name: string): Promise<boolean> {
    const where: FindOptionsWhere<CategoryOrmEntity> =
      parentId === null
        ? { parentId: IsNull(), name }
        : { parentId, name };

    return await this.repository.existsBy(where);
  }

  async getCategoriesWithProductCount(): Promise<Array<{
    categoryId: string;
    categoryName: string;
    count: number;
  }>> {
    const result = await this.repository
      .createQueryBuilder('c')
      .leftJoin('c.products', 'p')
      .select(['c.id as categoryId', 'c.name as categoryName', 'COUNT(p.id) as count'])
      .groupBy('c.id, c.name')
      .orderBy('c.name', 'ASC')
      .getRawMany();

    return result.map((row: any) => ({
      categoryId: row.categoryid,
      categoryName: row.categoryname,
      count: parseInt(row.count, 10) || 0
    }));
  }

  async countProductsInCategory(categoryId: string): Promise<number> {
    if (categoryId === 'all') {
      const result = await this.repository
        .createQueryBuilder('c')
        .leftJoin('c.products', 'p')
        .select('COUNT(p.id)', 'count')
        .getRawOne();

      return parseInt((result?.count as string) || '0', 10);
    }

    const category = await this.repository.findOne({
      where: { id: categoryId },
      relations: ['products']
    });

    return category?.products?.length || 0;
  }

  // Private helper methods
  private buildWhereConditions(filter: Partial<CategoryDomainEntity>): FindOptionsWhere<CategoryOrmEntity> {
    const where: FindOptionsWhere<CategoryOrmEntity> = {};

    if (filter.id !== undefined) where.id = filter.id;
    if (filter.name !== undefined) where.name = filter.name;
    if (filter.slug !== undefined) where.slug = filter.slug;
    if (filter.description !== undefined) where.description = filter.description;
    if (filter.status !== undefined) where.status = filter.status;
    if (filter.imageUrl !== undefined) where.imageUrl = filter.imageUrl;
    if (filter.parentId !== undefined) where.parentId = filter.parentId === null ? IsNull() : filter.parentId;
    if (filter.order !== undefined) where.order = filter.order;
    if (filter.metaTitle !== undefined) where.metaTitle = filter.metaTitle;
    if (filter.metaDescription !== undefined) where.metaDescription = filter.metaDescription;

    return where;
  }

  private prepareUpdateData(data: Partial<CategoryDomainEntity>): Partial<CategoryOrmEntity> {
    const updateData: Partial<CategoryOrmEntity> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.parentId !== undefined) updateData.parentId = data.parentId === undefined ? undefined : data.parentId;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle;
    if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription;

    return updateData;
  }

  private toDomainEntity(ormEntity: CategoryOrmEntity): CategoryDomainEntity {
    return new CategoryDomainEntity(
      ormEntity.id,
      ormEntity.name,
      ormEntity.slug,
      ormEntity.description,
      ormEntity.status as CategoryStatus,
      ormEntity.imageUrl || undefined,
      ormEntity.parentId || undefined,
      ormEntity.order,
      ormEntity.metaTitle || undefined,
      ormEntity.metaDescription || undefined,
      ormEntity.createdAt,
      ormEntity.updatedAt
    );
  }

  private toOrmEntity(domainEntity: CategoryDomainEntity): CategoryOrmEntity {
    return Object.assign(new CategoryOrmEntity(), {
      id: domainEntity.id,
      name: domainEntity.name,
      slug: domainEntity.slug,
      description: domainEntity.description,
      status: domainEntity.status,
      imageUrl: domainEntity.imageUrl || null,
      parentId: domainEntity.parentId || null,
      order: domainEntity.order,
      metaTitle: domainEntity.metaTitle || null,
      metaDescription: domainEntity.metaDescription || null,
      createdAt: domainEntity.createdAt,
      updatedAt: domainEntity.updatedAt
    });
  }
}