import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException
} from "@nestjs/common";

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


@Injectable()
export class ProductService {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
    private readonly productFileService: ProductFileService
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

  async findByCategory(category: string): Promise<ProductDomainEntity[]> {
    return this.productRepository.findByCategory(category);
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
    supplierId: string,
    images?: Express.Multer.File[]
  ): Promise<ProductDomainEntity> {
    // Проверяем уникальность имени у поставщика
    const exists = await this.productRepository.existsBySupplierAndName(supplierId, dto.name);
    if (exists) {
      throw new BadRequestException('Product with this name already exists for your supplier account');
    }

    // Создаем продукт (пока без изображений)
    const product = ProductDomainEntity.create(dto, supplierId);

    // Валидируем продукт
    const errors = product.validate();
    if (errors.length > 0) throw new BadRequestException(errors.join(', '));

    const savedProduct = await this.productRepository.create(product);

    if (images && images.length > 0) {
      try {
        const imageUrls = await this.productFileService.uploadProductImages(
          images,
          supplierId,
          savedProduct.id
        );

        if (imageUrls.length > 0) {
          await this.productRepository.update(savedProduct.id, {
            images: imageUrls
          });

          savedProduct.images = imageUrls;
        }
      } catch (error) {
        console.error('Failed to upload product images:', error);
      }
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
    // Checking rights
    this._checkProductOwnership(product, userId, userRoles, 'update');
    // If there are new images, load them
    let allImageUrls = [...product.images];

    if (newImages && newImages.length > 0) {
      try {
        const newImageUrls = await this.productFileService.uploadProductImages(
          newImages,
          product.supplierId,
          id
        );

        allImageUrls = [...allImageUrls, ...newImageUrls];

        dto.images = allImageUrls;
      } catch (error) {
        console.error('Failed to upload new images:', error);
      }
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

    this._checkProductOwnership(product, userId, userRoles, 'delete');

    // Delete images from storage
    try {
      await this.productFileService.deleteProductImages(product.supplierId, id);
    } catch (error) {
      console.error(`Failed to delete product images: ${error.message}`);
    }

    return this.productRepository.delete(id);
  }

  async addImages(
    productId: string,
    userId: string,
    userRoles: string[],
    images: Express.Multer.File[]
  ): Promise<string[]> {
    const product = await this.productRepository.findById(productId);
    if (!product) throw new NotFoundException(`Product ${productId} not found`);

    this._checkProductOwnership(product, userId, userRoles, 'add images');

    const uploadedUrls = await this.productFileService.uploadProductImages(
      images,
      product.supplierId,
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

    this._checkProductOwnership(product, userId, userRoles, 'remove image');

    const updatedImages = product.images.filter(img => img !== imageUrl);
    await this.productRepository.update(productId, {
      images: updatedImages
    });

    // TODO: удалить файл из хранилища
    // Нужно извлечь key из URL и вызвать storage.delete(key)
  }

  async getSupplierProducts(
    supplierId: string,
    userId: string,
    userRoles: string[]
  ): Promise<ProductDomainEntity[]> {
    // Only the supplier or the admin
    if (supplierId !== userId && !userRoles.includes(Role.ADMIN)) {
      throw new ForbiddenException('You can only view your own products');
    }
    return this.productRepository.findBySupplierId(supplierId);
  }

  async restockProduct(
    id: string,
    dto: RestockProductDto,
    userId: string,
    userRoles: string[]
  ): Promise<ProductDomainEntity | null> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    // product ownership
    this._checkProductOwnership(product, userId, userRoles, 'restock');
    if (dto.quantity <= 0) throw new BadRequestException('Quantity must be positive');

    return this.productRepository.increaseStock(id, dto.quantity);
  }

  async toggleStatus(
    id: string,
    status: ProductStatus,
    userId: string,
    userRoles: string[]
  ): Promise<ProductDomainEntity | null> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    // product ownership
    this._checkProductOwnership(product, userId, userRoles, 'change status');

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

    //! Здесь должна быть логика создания заказа
    // await this.orderService.createOrder({
    //   productId: id,
    //   customerId,
    //   quantity: dto.quantity,
    //   totalPrice: product.price * dto.quantity,
    //   shippingAddress: dto.shippingAddress,
    //   paymentMethod: dto.paymentMethod
    // });

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
    userId: string,
    userRoles: string[],
    action: string
  ): void {
    //! admins can do everything
    if (userRoles.includes(Role.ADMIN)) return;

    // Suppliers can only manage their own products
    if (userRoles.includes(Role.SUPPLIER)) {
      if (!product.isOwnedBy(userId)) {
        throw new ForbiddenException(`You don't have permission to ${action} this product`);
      }
      return;
    }

    throw new ForbiddenException(`You don't have permission to ${action} products`);
  }

  async checkOwnership(productId: string, userId: string): Promise<boolean> {
    const product = await this.productRepository.findById(productId);
    if (!product) return false;
    return product.isOwnedBy(userId);
  }

  async getLowStockProducts(threshold: number = 10): Promise<ProductDomainEntity[]> {
    return this.productRepository.findLowStock(threshold);
  }
}