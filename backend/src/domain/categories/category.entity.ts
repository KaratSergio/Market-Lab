import {
  CategoryModel, CreateCategoryDto, UpdateCategoryDto,
  DEFAULT_CATEGORY_STATUS, CategoryStatus
} from './types';


export class CategoryDomainEntity implements CategoryModel {
  constructor(
    public readonly id: string,
    public name: string,
    public slug: string,
    public description: string = '',
    public status: CategoryStatus = DEFAULT_CATEGORY_STATUS,
    public imageUrl?: string,
    public parentId?: string | null,
    public order: number = 0,
    public metaTitle?: string,
    public metaDescription?: string,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) { }

  static create(createDto: CreateCategoryDto): CategoryDomainEntity {
    const slug = createDto.slug || this.generateSlug(createDto.name);

    return new CategoryDomainEntity(
      crypto.randomUUID(),
      createDto.name,
      slug,
      createDto.description || '',
      createDto.status || DEFAULT_CATEGORY_STATUS,
      createDto.imageUrl,
      createDto.parentId || null,
      createDto.order || 0,
      createDto.metaTitle,
      createDto.metaDescription
    );
  }

  update(updateDto: UpdateCategoryDto): void {
    if (updateDto.name !== undefined) this.name = updateDto.name;
    if (updateDto.slug !== undefined) this.slug = updateDto.slug;
    if (updateDto.description !== undefined) this.description = updateDto.description;
    if (updateDto.status !== undefined) this.status = updateDto.status;
    if (updateDto.imageUrl !== undefined) this.imageUrl = updateDto.imageUrl;
    if (updateDto.parentId !== undefined) this.parentId = updateDto.parentId;
    if (updateDto.order !== undefined) this.order = updateDto.order;
    if (updateDto.metaTitle !== undefined) this.metaTitle = updateDto.metaTitle;
    if (updateDto.metaDescription !== undefined) this.metaDescription = updateDto.metaDescription;

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

  archive(): void {
    this.status = 'archived';
    this.updatedAt = new Date();
  }

  isActive(): boolean {
    return this.status === 'active';
  }

  isParent(): boolean {
    return !this.parentId; // parentId === null or undefined
  }

  isChild(): boolean {
    return !!this.parentId;
  }

  validate(): string[] {
    const errors: string[] = [];

    if (!this.name?.trim()) errors.push('Category name is required');
    if (!this.slug?.trim()) errors.push('Category slug is required');
    if (this.slug && !/^[a-z0-9-]+$/.test(this.slug)) errors.push('Slug can only contain lowercase letters, numbers, and hyphens');
    if (this.order < 0) errors.push('Order cannot be negative');
    if (this.isChild() && !this.parentId) errors.push('Child category must have a parentId');

    return errors;
  }

  getFullName(parentCategory?: CategoryDomainEntity): string {
    if (this.isParent()) return this.name;
    if (parentCategory) return `${parentCategory.name} > ${this.name}`;
    return this.name;
  }
}