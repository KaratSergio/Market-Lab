import {
  TagModel, CreateTagDto, UpdateTagDto,
  DEFAULT_TAG_STATUS, TagStatus
} from './types';


export class TagDomainEntity implements TagModel {
  constructor(
    public readonly id: string,
    public name: string,
    public slug: string,
    public description: string = '',
    public status: TagStatus = DEFAULT_TAG_STATUS,
    public usageCount: number = 0,
    public categoryId?: string | null,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) { }

  static create(createDto: CreateTagDto): TagDomainEntity {
    const slug = createDto.slug || this.generateSlug(createDto.name);

    return new TagDomainEntity(
      crypto.randomUUID(),
      createDto.name,
      slug,
      createDto.description || '',
      createDto.status || DEFAULT_TAG_STATUS,
      0, // new tag starts with 0 used
      createDto.categoryId
    );
  }

  update(updateDto: UpdateTagDto): void {
    if (updateDto.name !== undefined) this.name = updateDto.name;
    if (updateDto.slug !== undefined) this.slug = updateDto.slug;
    if (updateDto.description !== undefined) this.description = updateDto.description;
    if (updateDto.status !== undefined) this.status = updateDto.status;
    if (updateDto.categoryId !== undefined) this.categoryId = updateDto.categoryId;

    this.updatedAt = new Date();
  }

  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  activate(): void {
    this.status = 'active';
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.status = 'inactive';
    this.updatedAt = new Date();
  }

  isActive(): boolean {
    return this.status === 'active';
  }

  incrementUsage(count: number = 1): void {
    this.usageCount += count;
    this.updatedAt = new Date();
  }

  decrementUsage(count: number = 1): void {
    this.usageCount = Math.max(0, this.usageCount - count);
    this.updatedAt = new Date();
  }

  resetUsage(): void {
    this.usageCount = 0;
    this.updatedAt = new Date();
  }

  validate(): string[] {
    const errors: string[] = [];

    if (!this.name?.trim()) errors.push('Tag name is required');
    if (!this.slug?.trim()) errors.push('Tag slug is required');
    if (this.slug && !/^[a-z]+$/.test(this.slug)) errors.push('Slug can only contain lowercase letters');
    if (this.usageCount < 0) errors.push('Usage count cannot be negative');

    return errors;
  }

  isPopular(threshold: number = 10): boolean {
    return this.usageCount >= threshold;
  }

  getDisplayName(): string {
    return this.name;
  }
}