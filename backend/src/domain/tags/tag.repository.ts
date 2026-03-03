import { MinimalRepository } from '@shared/types';
import { TagDomainEntity } from './tag.entity';
import { TagStatus, PopularTag } from './types/tag.type';

export abstract class TagRepository implements MinimalRepository<TagDomainEntity> {
  // BaseRepository methods
  abstract create(data: Partial<TagDomainEntity>): Promise<TagDomainEntity>;
  abstract findById(id: string): Promise<TagDomainEntity | null>;
  abstract update(id: string, data: Partial<TagDomainEntity>): Promise<TagDomainEntity | null>;
  abstract delete(id: string): Promise<void>;

  // QueryableRepository methods
  abstract findOne(filter: Partial<TagDomainEntity>): Promise<TagDomainEntity | null>;
  abstract findMany(filter: Partial<TagDomainEntity>): Promise<TagDomainEntity[]>;
  abstract findAll(): Promise<TagDomainEntity[]>;
  abstract exists(id: string): Promise<boolean>;

  // Tag-specific methods
  abstract findBySlug(slug: string): Promise<TagDomainEntity | null>;
  abstract findByName(name: string, exact?: boolean): Promise<TagDomainEntity[]>;
  abstract findByStatus(status: TagStatus): Promise<TagDomainEntity[]>;
  abstract findActive(): Promise<TagDomainEntity[]>;

  abstract existsBySlug(slug: string): Promise<boolean>;
  abstract existsByName(name: string): Promise<boolean>;

  // Product-tag relationship methods
  abstract addToProduct(productId: string, tagId: string): Promise<void>;
  abstract removeFromProduct(productId: string, tagId: string): Promise<void>;
  abstract getProductTags(productId: string): Promise<TagDomainEntity[]>;
  abstract getTagsByProductIds(productIds: string[]): Promise<Map<string, TagDomainEntity[]>>;

  // Usage statistics
  abstract getPopularTags(limit?: number): Promise<PopularTag[]>;
  abstract getTagsWithProductCount(): Promise<Array<{ tagId: string; tagName: string; count: number }>>;
  abstract countProductsByTag(tagId: string): Promise<number>;

  // Search and filtering
  abstract searchTags(query: string, limit?: number): Promise<TagDomainEntity[]>;
  abstract findTagsByProductIds(productIds: string[]): Promise<TagDomainEntity[]>;
  abstract findByCategoryId(categoryId: string): Promise<TagDomainEntity[]>;
  abstract findByCategorySlug(categorySlug: string): Promise<TagDomainEntity[]>;

  // Bulk operations
  abstract bulkUpdateUsageCounts(): Promise<void>;
  abstract syncProductTags(productId: string, tagIds: string[]): Promise<void>;
}