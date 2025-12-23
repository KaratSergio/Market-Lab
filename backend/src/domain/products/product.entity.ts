import {
  ProductModel,
  PRODUCT_STATUS,
  ProductStatus,
  DEFAULT_CATEGORY,
  MIN_STOCK_QUANTITY,
  CreateProductDto,
  UpdateProductDto
} from './types';

export class ProductDomainEntity implements ProductModel {
  public id: string;
  public name: string;
  public description: string;
  public price: number;
  public supplierId: string;
  public category: string;
  public images: string[];
  public stock: number;
  public status: ProductStatus;
  public tags: string[];
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    supplierId: string,
    name: string,
    description: string,
    price: number,
    category: string = DEFAULT_CATEGORY,
    images: string[] = [],
    stock: number = 0,
    status: ProductStatus = PRODUCT_STATUS.ACTIVE,
    tags: string[] = [],
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.supplierId = supplierId;
    this.name = name;
    this.description = description;
    this.price = price;
    this.category = category;
    this.images = images;
    this.stock = stock;
    this.status = status;
    this.tags = tags;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(createDto: CreateProductDto, supplierId: string): ProductDomainEntity {
    return new ProductDomainEntity(
      crypto.randomUUID(),
      supplierId,
      createDto.name,
      createDto.description,
      createDto.price,
      createDto.category || DEFAULT_CATEGORY,
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
    if (updateDto.category) this.category = updateDto.category;
    if (updateDto.images) this.images = updateDto.images;
    if (updateDto.stock !== undefined) this.stock = updateDto.stock;
    if (updateDto.status) this.status = updateDto.status;
    if (updateDto.tags) this.tags = updateDto.tags;

    this.updatedAt = new Date();
  }

  // Product activation
  activate(): void {
    this.status = PRODUCT_STATUS.ACTIVE;
    this.updatedAt = new Date();
  }

  // Deactivate the product
  deactivate(): void {
    this.status = PRODUCT_STATUS.INACTIVE;
    this.updatedAt = new Date();
  }

  // Archive the product
  archive(): void {
    this.status = PRODUCT_STATUS.ARCHIVED;
    this.updatedAt = new Date();
  }

  // Replenishment of stocks
  restock(quantity: number): void {
    if (quantity <= 0) throw new Error('Restock quantity must be positive');

    this.stock += quantity;
    this.updatedAt = new Date();
  }

  // Product sales
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

  // Getting information about availability
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

  // Adding images
  addImages(newImages: string[]): void {
    this.images = [...this.images, ...newImages];
    this.updatedAt = new Date();
  }

  // Deleting images
  removeImage(imageUrl: string): void {
    this.images = this.images.filter(img => img !== imageUrl);
    this.updatedAt = new Date();
  }

  // Adding tags
  addTags(newTags: string[]): void {
    const uniqueTags = [...new Set([...this.tags, ...newTags])];
    this.tags = uniqueTags;
    this.updatedAt = new Date();
  }

  // Removing tags
  removeTag(tag: string): void {
    this.tags = this.tags.filter(t => t !== tag);
    this.updatedAt = new Date();
  }

  // Getting a discount price
  getDiscountedPrice(discountPercentage: number): number {
    if (discountPercentage < 0 || discountPercentage > 100) {
      throw new Error('Discount percentage must be between 0 and 100');
    }
    return this.price * (1 - discountPercentage / 100);
  }

  // Product data validation
  validate(): string[] {
    const errors: string[] = [];

    if (!this.name.trim()) errors.push('Product name is required');
    if (!this.description.trim()) errors.push('Product description is required');
    if (this.price <= 0) errors.push('Product price must be positive');
    if (this.stock < 0) errors.push('Stock cannot be negative');
    if (!this.category.trim()) errors.push('Product category is required');

    return errors;
  }

  // Get the full name of the product (with category)
  getFullName(): string {
    return `${this.category}: ${this.name}`;
  }
}