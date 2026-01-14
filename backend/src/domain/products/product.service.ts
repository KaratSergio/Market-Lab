import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import {
  ProductStatus,
  PRODUCT_STATUS,
  CreateProductDto,
  UpdateProductDto,
  PurchaseProductDto,
  RestockProductDto
} from "./types";

import { Role } from '@shared/types';
import { ProductRepository } from "./product.repository";
import { ProductDomainEntity } from "./product.entity";
import { ProductFileService } from "./product-file.service";
import { UserOrmEntity } from '@infrastructure/database/postgres/users/user.entity';

@Injectable()
export class ProductService {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
    private readonly productFileService: ProductFileService,
    @InjectRepository(UserOrmEntity)
    private readonly usersRepository: Repository<UserOrmEntity>
  ) { }

  // Public methods
  async findAll(): Promise<ProductDomainEntity[]> {
    return this.productRepository.findActive();
  }

  async findById(id: string): Promise<ProductDomainEntity> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async searchByText(text: string): Promise<ProductDomainEntity[]> {
    return this.productRepository.searchByText(text);
  }

  async findByCategoryId(id: string): Promise<ProductDomainEntity[]> {
    return this.productRepository.findByCategoryId(id);
  }

  async getPaginated(
    page: number = 1,
    limit: number = 10,
    filter?: Partial<ProductDomainEntity>
  ) {
    return this.productRepository.findWithPagination(page, limit, filter);
  }

  async getCategories(): Promise<Array<{ category: string; count: number }>> {
    return this.productRepository.getCategoriesWithCount();
  }

  // Methods for Suppliers

  async create(
    dto: CreateProductDto,
    userId: string,
    images?: Express.Multer.File[]
  ): Promise<ProductDomainEntity> {
    if (!dto.name?.trim()) throw new BadRequestException('Product name is required');
    if (!dto.description?.trim()) throw new BadRequestException('Product description is required');
    if (dto.price === undefined || dto.price < 0) throw new BadRequestException('Valid price is required');

    const supplierId = await this.getSupplierIdFromUserId(userId);

    const exists = await this.productRepository.existsBySupplierAndName(supplierId, dto.name);
    if (exists) throw new BadRequestException('Product with this name already exists');

    const product = ProductDomainEntity.create(dto, supplierId);
    const errors = product.validate();

    if (errors.length > 0) throw new BadRequestException(errors.join(', '));

    const savedProduct = await this.productRepository.create(product);

    if (images?.length) {
      try {
        const imageUrls = await this.productFileService.uploadProductImages(
          images,
          supplierId,
          savedProduct.id
        );

        if (imageUrls.length) {
          await this.productRepository.update(savedProduct.id, {
            images: imageUrls
          });

          savedProduct.images = imageUrls;
        }
      } catch (error) { }
    }

    return savedProduct;
  }

  async update(
    id: string,
    dto: UpdateProductDto,
    userId: string,
    userRoles: string[],
    newImages?: Express.Multer.File[]
  ): Promise<ProductDomainEntity> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundException(`Product ${id} not found`);

    const supplierId = await this.getSupplierIdFromUserId(userId);
    this._checkProductOwnership(product, supplierId, userRoles, 'update');

    let allImageUrls = [...product.images];

    if (newImages?.length) {
      try {
        const newImageUrls = await this.productFileService.uploadProductImages(
          newImages,
          supplierId,
          id
        );

        allImageUrls = [...allImageUrls, ...newImageUrls];
        dto.images = allImageUrls;
      } catch (error) { }
    }

    const updatedProduct = await this.productRepository.update(id, dto);
    if (!updatedProduct) throw new NotFoundException(`Product ${id} not found after update`);

    return updatedProduct;
  }

  async delete(
    id: string,
    userId: string,
    userRoles: string[]
  ): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundException(`Product ${id} not found`);

    const supplierId = await this.getSupplierIdFromUserId(userId);

    this._checkProductOwnership(product, supplierId, userRoles, 'delete');

    // Delete images from storage
    try {
      await this.productFileService.deleteProductImages(supplierId, id);
    } catch (error) {
      console.error(`Failed to delete product images: ${error.message}`);
    }

    return this.productRepository.delete(id);
  }

  async addImages(
    productId: string,
    userId: string, // userId, а не supplierId
    userRoles: string[],
    images: Express.Multer.File[]
  ): Promise<string[]> {
    const product = await this.productRepository.findById(productId);
    if (!product) throw new NotFoundException(`Product ${productId} not found`);

    // Получаем supplierId для проверки прав
    const supplierId = await this.getSupplierIdFromUserId(userId);

    this._checkProductOwnership(product, supplierId, userRoles, 'add images');

    const uploadedUrls = await this.productFileService.uploadProductImages(
      images,
      supplierId, // Используем правильный supplierId
      productId
    );

    // Update the array of images in the product
    if (uploadedUrls.length > 0) {
      const updatedImages = [...product.images, ...uploadedUrls];
      await this.productRepository.update(productId, {
        images: updatedImages
      });
    }

    return uploadedUrls;
  }

  async removeImage(
    productId: string,
    userId: string,
    userRoles: string[],
    imageUrl: string
  ): Promise<void> {
    const product = await this.productRepository.findById(productId);
    if (!product) throw new NotFoundException(`Product ${productId} not found`);

    const supplierId = await this.getSupplierIdFromUserId(userId);

    this._checkProductOwnership(product, supplierId, userRoles, 'remove image');

    const updatedImages = product.images.filter(img => img !== imageUrl);
    await this.productRepository.update(productId, {
      images: updatedImages
    });

    // TODO: удалить файл из хранилища
    // Нужно извлечь key из URL и вызвать storage.delete(key)
  }

  async getSupplierProducts(
    userId: string,
    currentUserId: string,
    userRoles: string[]
  ): Promise<ProductDomainEntity[]> {
    const requestedSupplierId = await this.getSupplierIdFromUserId(userId);
    const currentSupplierId = await this.getSupplierIdFromUserId(currentUserId);

    // Only the supplier or the admin
    if (requestedSupplierId !== currentSupplierId && !userRoles.includes(Role.ADMIN)) {
      throw new ForbiddenException('You can only view your own products');
    }

    return this.productRepository.findBySupplierId(requestedSupplierId);
  }

  async restockProduct(
    id: string,
    dto: RestockProductDto,
    userId: string, // userId, а не supplierId
    userRoles: string[]
  ): Promise<ProductDomainEntity | null> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundException(`Product ${id} not found`);

    const supplierId = await this.getSupplierIdFromUserId(userId);

    // product ownership
    this._checkProductOwnership(product, supplierId, userRoles, 'restock');
    if (dto.quantity <= 0) throw new BadRequestException('Quantity must be positive');

    return this.productRepository.increaseStock(id, dto.quantity);
  }

  async toggleStatus(
    id: string,
    status: ProductStatus,
    userId: string, // userId, а не supplierId
    userRoles: string[]
  ): Promise<ProductDomainEntity | null> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundException(`Product ${id} not found`);

    const supplierId = await this.getSupplierIdFromUserId(userId);

    // product ownership
    this._checkProductOwnership(product, supplierId, userRoles, 'change status');

    return this.productRepository.updateStatus(id, status);
  }

  // Methods for Customer
  async purchase(
    id: string,
    dto: PurchaseProductDto,
    customerId: string
  ): Promise<ProductDomainEntity> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    if (!product.isAvailable()) throw new BadRequestException('Product is not available for purchase');
    if (product.stock < dto.quantity) throw new BadRequestException('Insufficient stock');

    // Decrease the remainder
    const updatedProduct = await this.productRepository.decreaseStock(id, dto.quantity);
    if (!updatedProduct) throw new BadRequestException('Failed to process purchase');

    return updatedProduct;
  }

  // Methods for Admins
  async getStatistics(): Promise<any> {
    return this.productRepository.getStatistics();
  }

  async getAllProducts(
    filter?: Partial<ProductDomainEntity>
  ): Promise<ProductDomainEntity[]> {
    return this.productRepository.findMany(filter || {});
  }

  async forceDelete(id: string): Promise<void> {
    const exists = await this.productRepository.exists(id);
    if (!exists) throw new NotFoundException(`Product ${id} not found`);

    return this.productRepository.delete(id);
  }

  async activateProduct(id: string): Promise<ProductDomainEntity | null> {
    return this.productRepository.updateStatus(id, PRODUCT_STATUS.ACTIVE);
  }

  async deactivateProduct(id: string): Promise<ProductDomainEntity | null> {
    return this.productRepository.updateStatus(id, PRODUCT_STATUS.INACTIVE);
  }

  // Auxiliary methods

  private _checkProductOwnership(
    product: ProductDomainEntity,
    supplierId: string,
    userRoles: string[],
    action: string
  ): void {
    //! admins can do everything
    if (userRoles.includes(Role.ADMIN)) return;

    // Suppliers can only manage their own products
    if (userRoles.includes(Role.SUPPLIER)) {
      if (!product.isOwnedBy(supplierId)) {
        throw new ForbiddenException(`You don't have permission to ${action} this product`);
      }
      return;
    }

    throw new ForbiddenException(`You don't have permission to ${action} products`);
  }

  async checkOwnership(productId: string, userId: string): Promise<boolean> {
    const product = await this.productRepository.findById(productId);
    if (!product) return false;

    try {
      const supplierId = await this.getSupplierIdFromUserId(userId);
      return product.isOwnedBy(supplierId);
    } catch {
      return false;
    }
  }

  async getLowStockProducts(threshold: number = 10): Promise<ProductDomainEntity[]> {
    return this.productRepository.findLowStock(threshold);
  }

  // Helper method to get supplierId from userId
  private async getSupplierIdFromUserId(userId: string): Promise<string> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['supplierProfile']
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    if (!user.supplierProfile) {
      throw new BadRequestException('User is not registered as a supplier');
    }

    return user.supplierProfile.id;
  }
}