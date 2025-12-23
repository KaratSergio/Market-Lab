import { Repository, SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductRepository as DomainProductRepository } from '@domain/products/product.repository';
import { ProductOrmEntity } from './product.entity';
import { ProductDomainEntity } from '@domain/products/product.entity';
import { ProductStatus } from '@domain/products/types';

@Injectable()
export class PostgresProductRepository extends DomainProductRepository {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly repository: Repository<ProductOrmEntity>,
  ) { super() }

  async create(data: Partial<ProductDomainEntity>): Promise<ProductDomainEntity> {
    const ormEntity = this.toOrmEntity(data as ProductDomainEntity);
    const savedOrmEntity = await this.repository.save(ormEntity);
    return this.toDomainEntity(savedOrmEntity);
  }

  async findById(id: string): Promise<ProductDomainEntity | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });
    return ormEntity ? this.toDomainEntity(ormEntity) : null;
  }

  async update(id: string, data: Partial<ProductDomainEntity>): Promise<ProductDomainEntity | null> {
    const exists = await this.exists(id);
    if (!exists) return null;

    await this.repository.update(id, this.prepareUpdateData(data));
    const updatedOrmEntity = await this.repository.findOne({ where: { id } });

    return updatedOrmEntity ? this.toDomainEntity(updatedOrmEntity) : null;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  // QueryableRepository methods
  async findOne(filter: Partial<ProductDomainEntity>): Promise<ProductDomainEntity | null> {
    const queryBuilder = this.repository.createQueryBuilder('product');
    this.applyFilters(queryBuilder, filter);
    const ormEntity = await queryBuilder.getOne();
    return ormEntity ? this.toDomainEntity(ormEntity) : null;
  }

  async findMany(filter: Partial<ProductDomainEntity>): Promise<ProductDomainEntity[]> {
    const queryBuilder = this.repository.createQueryBuilder('product');
    this.applyFilters(queryBuilder, filter);
    const ormEntities = await queryBuilder.getMany();
    return ormEntities.map(this.toDomainEntity);
  }

  async findAll(): Promise<ProductDomainEntity[]> {
    const ormEntities = await this.repository.find();
    return ormEntities.map(this.toDomainEntity);
  }

  // UtilityRepository methods
  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }

  // PaginableRepository methods
  async findWithPagination(
    page: number,
    limit: number,
    filter?: Partial<ProductDomainEntity>
  ): Promise<{
    data: ProductDomainEntity[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const queryBuilder = this.repository.createQueryBuilder('product');
    if (filter) this.applyFilters(queryBuilder, filter);

    queryBuilder.skip(skip).take(limit).orderBy('product.createdAt', 'DESC');

    const [ormEntities, total] = await queryBuilder.getManyAndCount();

    return {
      data: ormEntities.map(this.toDomainEntity),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Product-specific methods
  async findBySupplierId(supplierId: string): Promise<ProductDomainEntity[]> {
    const ormEntities = await this.repository.find({
      where: { supplierId },
      order: { createdAt: 'DESC' }
    });
    return ormEntities.map(this.toDomainEntity);
  }

  async findByCategory(category: string): Promise<ProductDomainEntity[]> {
    const ormEntities = await this.repository.find({
      where: { category, status: 'active' },
      order: { createdAt: 'DESC' }
    });
    return ormEntities.map(this.toDomainEntity);
  }

  async findByStatus(status: ProductStatus): Promise<ProductDomainEntity[]> {
    const ormEntities = await this.repository.find({
      where: { status },
      order: { createdAt: 'DESC' }
    });
    return ormEntities.map(this.toDomainEntity);
  }

  async findActive(): Promise<ProductDomainEntity[]> {
    return this.findByStatus('active');
  }

  async findByPriceRange(min: number, max: number): Promise<ProductDomainEntity[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('product')
      .where('product.status = :status', { status: 'active' })
      .andWhere('product.price BETWEEN :min AND :max', { min, max })
      .orderBy('product.price', 'ASC');

    const ormEntities = await queryBuilder.getMany();
    return ormEntities.map(this.toDomainEntity);
  }

  async findByTags(tags: string[]): Promise<ProductDomainEntity[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('product')
      .where('product.status = :status', { status: 'active' });

    // For each tag we add a condition
    tags.forEach((tag, index) => {
      queryBuilder.andWhere(`product.tags @> :tag${index}`, { [`tag${index}`]: [tag] });
    });

    const ormEntities = await queryBuilder.getMany();
    return ormEntities.map(this.toDomainEntity);
  }

  async findByName(name: string): Promise<ProductDomainEntity | null> {
    const ormEntity = await this.repository.findOne({ where: { name } });
    return ormEntity ? this.toDomainEntity(ormEntity) : null;
  }

  async searchByName(name: string): Promise<ProductDomainEntity[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('product')
      .where('LOWER(product.name) LIKE LOWER(:name)', { name: `%${name}%` })
      .andWhere('product.status = :status', { status: 'active' });

    const ormEntities = await queryBuilder.getMany();
    return ormEntities.map(this.toDomainEntity);
  }

  async searchByText(text: string): Promise<ProductDomainEntity[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('product')
      .where('product.status = :status', { status: 'active' })
      .andWhere(
        '(LOWER(product.name) LIKE LOWER(:text) OR LOWER(product.description) LIKE LOWER(:text))',
        { text: `%${text}%` }
      );

    const ormEntities = await queryBuilder.getMany();
    return ormEntities.map(this.toDomainEntity);
  }

  async existsBySupplierAndName(supplierId: string, name: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { supplierId, name }
    });
    return count > 0;
  }

  async countBySupplier(supplierId: string): Promise<number> {
    return this.repository.count({ where: { supplierId } });
  }

  async countByStatus(status: ProductStatus): Promise<number> {
    return this.repository.count({ where: { status } });
  }

  async findSorted(
    sortBy: keyof ProductDomainEntity,
    order: 'ASC' | 'DESC'
  ): Promise<ProductDomainEntity[]> {
    const ormEntities = await this.repository.find({
      where: { status: 'active' },
      order: { [sortBy]: order }
    });
    return ormEntities.map(this.toDomainEntity);
  }

  async updateStatus(id: string, status: ProductStatus): Promise<ProductDomainEntity | null> {
    const exists = await this.exists(id);
    if (!exists) return null;

    await this.repository.update(id, { status });
    return this.findById(id);
  }

  async updateStock(id: string, stock: number): Promise<ProductDomainEntity | null> {
    const exists = await this.exists(id);
    if (!exists) return null;

    await this.repository.update(id, { stock });
    return this.findById(id);
  }

  async increaseStock(id: string, quantity: number): Promise<ProductDomainEntity | null> {
    const exists = await this.exists(id);
    if (!exists) return null;

    await this.repository
      .createQueryBuilder()
      .update(ProductOrmEntity)
      .set({ stock: () => `stock + ${quantity}` })
      .where('id = :id', { id })
      .execute();

    return this.findById(id);
  }

  async decreaseStock(id: string, quantity: number): Promise<ProductDomainEntity | null> {
    const exists = await this.exists(id);
    if (!exists) return null;

    const product = await this.findById(id);
    if (!product || product.stock < quantity) return null;

    await this.repository
      .createQueryBuilder()
      .update(ProductOrmEntity)
      .set({ stock: () => `stock - ${quantity}` })
      .where('id = :id', { id })
      .andWhere('stock >= :quantity', { quantity })
      .execute();

    return this.findById(id);
  }

  async updatePrice(id: string, price: number): Promise<ProductDomainEntity | null> {
    const exists = await this.exists(id);
    if (!exists) return null;

    await this.repository.update(id, { price });
    return this.findById(id);
  }

  async findLowStock(threshold: number = 10): Promise<ProductDomainEntity[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('product')
      .where('product.stock <= :threshold', { threshold })
      .andWhere('product.status = :status', { status: 'active' });

    const ormEntities = await queryBuilder.getMany();
    return ormEntities.map(this.toDomainEntity);
  }

  async findByIds(ids: string[]): Promise<ProductDomainEntity[]> {
    if (ids.length === 0) return [];

    const queryBuilder = this.repository
      .createQueryBuilder('product')
      .where('product.id IN (:...ids)', { ids })
      .andWhere('product.status = :status', { status: 'active' });

    const ormEntities = await queryBuilder.getMany();
    return ormEntities.map(this.toDomainEntity);
  }

  async getCategoriesWithCount(): Promise<Array<{ category: string; count: number }>> {
    const queryBuilder = this.repository
      .createQueryBuilder('product')
      .select('product.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('product.status = :status', { status: 'active' })
      .groupBy('product.category');

    const result = await queryBuilder.getRawMany();

    return result.map(row => ({
      category: row.category,
      count: parseInt(row.count)
    }));
  }

  async getPopularTags(limit: number = 20): Promise<Array<{ tag: string; count: number }>> {
    // PostgreSQL-specific query for jsonb array unnest
    const result = await this.repository
      .createQueryBuilder('product')
      .select('unnest(product.tags)', 'tag')
      .addSelect('COUNT(*)', 'count')
      .where('product.status = :status', { status: 'active' })
      .groupBy('tag')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map(row => ({
      tag: row.tag,
      count: parseInt(row.count)
    }));
  }

  async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    archived: number;
    draft: number;
    totalStock: number;
    averagePrice: number;
    categoriesCount: number;
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

    const categoriesResult = await this.getCategoriesWithCount();

    return {
      total,
      active,
      inactive,
      archived,
      draft,
      totalStock: parseFloat(stockResult.totalStock) || 0,
      averagePrice: parseFloat(priceResult.averagePrice) || 0,
      categoriesCount: categoriesResult.length
    };
  }

  // Private helper methods
  private applyFilters(queryBuilder: SelectQueryBuilder<ProductOrmEntity>, filter: Partial<ProductDomainEntity>) {
    if (filter.id) queryBuilder.andWhere('product.id = :id', { id: filter.id });
    if (filter.supplierId) queryBuilder.andWhere('product.supplierId = :supplierId', { supplierId: filter.supplierId });
    if (filter.name) queryBuilder.andWhere('product.name = :name', { name: filter.name });
    if (filter.description) queryBuilder.andWhere('product.description = :description', { description: filter.description });
    if (filter.price !== undefined) queryBuilder.andWhere('product.price = :price', { price: filter.price });
    if (filter.category) queryBuilder.andWhere('product.category = :category', { category: filter.category });

    // For jsonb fields
    if (filter.images !== undefined) {
      if (Array.isArray(filter.images) && filter.images.length === 0) {
        queryBuilder.andWhere('product.images = :emptyArray', { emptyArray: [] });
      } else if (Array.isArray(filter.images)) {
        queryBuilder.andWhere('product.images @> :images', { images: filter.images });
      }
    }

    if (filter.stock !== undefined) queryBuilder.andWhere('product.stock = :stock', { stock: filter.stock });
    if (filter.status) queryBuilder.andWhere('product.status = :status', { status: filter.status });

    if (filter.tags !== undefined) {
      if (Array.isArray(filter.tags) && filter.tags.length === 0) {
        queryBuilder.andWhere('product.tags = :emptyArray', { emptyArray: [] });
      } else if (Array.isArray(filter.tags)) {
        queryBuilder.andWhere('product.tags @> :tags', { tags: filter.tags });
      }
    }
  }

  private prepareUpdateData(data: Partial<ProductDomainEntity>): Partial<ProductOrmEntity> {
    const updateData: Partial<ProductOrmEntity> = {};

    if (data.supplierId !== undefined) updateData.supplierId = data.supplierId;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.tags !== undefined) updateData.tags = data.tags;

    return updateData;
  }

  private toDomainEntity(ormEntity: ProductOrmEntity): ProductDomainEntity {
    return new ProductDomainEntity(
      ormEntity.id,
      ormEntity.supplierId,
      ormEntity.name,
      ormEntity.description,
      typeof ormEntity.price === 'string' ? parseFloat(ormEntity.price) : ormEntity.price,
      ormEntity.category,
      ormEntity.images || [],
      ormEntity.stock,
      ormEntity.status as ProductStatus,
      ormEntity.tags || [],
      ormEntity.createdAt,
      ormEntity.updatedAt
    );
  }

  private toOrmEntity(domainEntity: ProductDomainEntity): ProductOrmEntity {
    const ormEntity = new ProductOrmEntity();

    if (domainEntity.id) ormEntity.id = domainEntity.id;
    ormEntity.supplierId = domainEntity.supplierId;
    ormEntity.name = domainEntity.name;
    ormEntity.description = domainEntity.description;
    ormEntity.price = domainEntity.price;
    ormEntity.category = domainEntity.category;
    ormEntity.images = domainEntity.images;
    ormEntity.stock = domainEntity.stock;
    ormEntity.status = domainEntity.status;
    ormEntity.tags = domainEntity.tags;
    ormEntity.createdAt = domainEntity.createdAt;
    ormEntity.updatedAt = domainEntity.updatedAt;

    return ormEntity;
  }
}