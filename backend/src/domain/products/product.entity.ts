import { LanguageCode, TranslatableProductFields } from '@domain/translations/types';

import {
  Unit, Currency, UNITS, CURRENCIES,
  ProductModel, PRODUCT_STATUS,
  ProductStatus, MIN_STOCK_QUANTITY,
  CreateProductDto, UpdateProductDto
} from './types';


export class ProductDomainEntity implements ProductModel {
  constructor(
    public readonly id: string,
    public readonly supplierId: string,
    public name: string,
    public description: string,
    public price: number,
    public unit: Unit,
    public currency: Currency,
    public shortDescription?: string,
    public categoryId?: string,
    public subcategoryId?: string,
    public images: string[] = [],
    public stock: number = 0,
    public status: ProductStatus = PRODUCT_STATUS.ACTIVE,
    public tags: string[] = [],
    public translations?: Partial<Record<LanguageCode, Partial<Record<TranslatableProductFields, string>>>>,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) { }

  static create(createDto: CreateProductDto, supplierId: string): ProductDomainEntity {
    return new ProductDomainEntity(
      crypto.randomUUID(),
      supplierId,
      createDto.name,
      createDto.description,
      createDto.price,
      createDto.unit || UNITS.PIECE,
      createDto.currency || CURRENCIES.UAH,
      createDto.shortDescription,
      createDto.categoryId,
      createDto.subcategoryId,
      createDto.images || [],
      createDto.stock || 0,
      createDto.status || PRODUCT_STATUS.ACTIVE,
      createDto.tags || []
    );
  }

  update(updateDto: UpdateProductDto): void {
    if (updateDto.name) this.name = updateDto.name;
    if (updateDto.description) this.description = updateDto.description;
    if (updateDto.price) this.price = updateDto.price;
    if (updateDto.unit) this.unit = updateDto.unit;
    if (updateDto.currency) this.currency = updateDto.currency;
    if (updateDto.shortDescription) this.shortDescription = updateDto.shortDescription;
    if (updateDto.categoryId !== undefined) this.categoryId = updateDto.categoryId;
    if (updateDto.subcategoryId !== undefined) this.subcategoryId = updateDto.subcategoryId;
    if (updateDto.images) this.images = updateDto.images;
    if (updateDto.stock !== undefined) this.stock = updateDto.stock;
    if (updateDto.status) this.status = updateDto.status;
    if (updateDto.tags) this.tags = updateDto.tags;

    this.updatedAt = new Date();
  }

  // Category management
  changeCategory(categoryId?: string, subcategoryId?: string): void {
    if (subcategoryId && !categoryId) {
      throw new Error('Category must be specified when subcategory is set');
    }

    this.categoryId = categoryId;
    this.subcategoryId = subcategoryId;
    this.updatedAt = new Date();
  }

  clearCategory(): void {
    this.categoryId = undefined;
    this.subcategoryId = undefined;
    this.updatedAt = new Date();
  }

  hasCategory(): boolean {
    return !!this.categoryId;
  }

  hasSubcategory(): boolean {
    return !!this.subcategoryId;
  }

  // Product activation
  activate(): void {
    this.status = PRODUCT_STATUS.ACTIVE;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.status = PRODUCT_STATUS.INACTIVE;
    this.updatedAt = new Date();
  }

  archive(): void {
    this.status = PRODUCT_STATUS.ARCHIVED;
    this.updatedAt = new Date();
  }

  // Stock management
  restock(quantity: number): void {
    if (quantity <= 0) throw new Error('Restock quantity must be positive');
    this.stock += quantity;
    this.updatedAt = new Date();
  }

  sell(quantity: number): void {
    if (quantity <= 0) throw new Error('Sale quantity must be positive');
    if (this.stock < quantity) throw new Error('Insufficient stock');
    if (this.status !== PRODUCT_STATUS.ACTIVE) throw new Error('Product is not active');

    this.stock -= quantity;
    this.updatedAt = new Date();
  }

  // Check availability
  isAvailable(): boolean {
    return this.status === PRODUCT_STATUS.ACTIVE && this.stock > MIN_STOCK_QUANTITY;
  }

  getStockInfo(): string {
    if (this.status !== PRODUCT_STATUS.ACTIVE) return 'Not available';
    if (this.stock === 0) return 'Out of stock';
    if (this.stock <= 10) return `Low stock (${this.stock} left)`;
    return 'In stock';
  }

  // Check ownership
  isOwnedBy(supplierId: string): boolean {
    return this.supplierId === supplierId;
  }

  // Price change
  changePrice(newPrice: number): void {
    if (newPrice <= 0) throw new Error('Price must be positive');
    this.price = newPrice;
    this.updatedAt = new Date();
  }

  // Images management
  addImages(newImages: string[]): void {
    this.images = [...this.images, ...newImages];
    this.updatedAt = new Date();
  }

  removeImage(imageUrl: string): void {
    this.images = this.images.filter(img => img !== imageUrl);
    this.updatedAt = new Date();
  }

  // Tags management
  addTags(newTags: string[]): void {
    const uniqueTags = [...new Set([...this.tags, ...newTags])];
    this.tags = uniqueTags;
    this.updatedAt = new Date();
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter(t => t !== tag);
    this.updatedAt = new Date();
  }

  // Discount
  getDiscountedPrice(discountPercentage: number): number {
    if (discountPercentage < 0 || discountPercentage > 100) {
      throw new Error('Discount percentage must be between 0 and 100');
    }
    return this.price * (1 - discountPercentage / 100);
  }

  // Validation
  validate(): string[] {
    const errors: string[] = [];

    if (!this.name.trim()) errors.push('Product name is required');
    if (!this.description.trim()) errors.push('Product description is required');
    if (this.price <= 0) errors.push('Product price must be positive');
    if (this.stock < 0) errors.push('Stock cannot be negative');
    if (this.subcategoryId && !this.categoryId) errors.push('Category must be specified when subcategory is set');
    if (!Object.values(UNITS).includes(this.unit)) errors.push(`Invalid unit: ${this.unit}`);
    if (!Object.values(CURRENCIES).includes(this.currency)) errors.push(`Invalid currency: ${this.currency}`);

    return errors;
  }

  // Get display name
  getDisplayName(): string {
    return this.name;
  }

  // Quick check methods
  isActive(): boolean {
    return this.status === PRODUCT_STATUS.ACTIVE;
  }

  isOutOfStock(): boolean {
    return this.stock === 0;
  }

  isLowStock(threshold: number = 10): boolean {
    return this.stock > 0 && this.stock <= threshold;
  }

  getCategoryPath(categoryName?: string, subcategoryName?: string): string {
    if (!this.categoryId) return '';
    if (categoryName && subcategoryName) return `${categoryName} > ${subcategoryName}`;
    if (categoryName) return categoryName;
    return `Category ID: ${this.categoryId}`;
  }
}