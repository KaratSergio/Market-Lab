import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException
} from "@nestjs/common";

import {
  ProductStatus,
  PRODUCT_STATUS,
  CreateProductDto,
  PurchaseProductDto,
  ProductStatistics
} from "../types";
import { Role } from '@shared/types';

import { ProductRepository } from "../product.repository";
import { ProductDomainEntity } from "../product.entity";


@Injectable()
export class ProductCoreService {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
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

    const updatedProduct = await this.productRepository.decreaseStock(id, dto.quantity);
    if (!updatedProduct) throw new BadRequestException('Failed to process purchase');

    return updatedProduct;
  }

  // Methods for Admins
  async getStatistics(): Promise<ProductStatistics> {
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

  // Helper methods
  async checkProductExists(supplierId: string, productName: string): Promise<boolean> {
    return this.productRepository.existsBySupplierAndName(supplierId, productName);
  }

  async createProductEntity(dto: CreateProductDto, supplierId: string): Promise<ProductDomainEntity> {
    // Validation
    if (!dto.name?.trim()) throw new BadRequestException('Product name is required');
    if (!dto.description?.trim()) throw new BadRequestException('Product description is required');
    if (dto.price === undefined || dto.price < 0) throw new BadRequestException('Valid price is required');

    // Check if product with same name exists for this supplier
    const exists = await this.productRepository.existsBySupplierAndName(supplierId, dto.name);
    if (exists) throw new BadRequestException('Product with this name already exists');

    // Create entity
    const product = ProductDomainEntity.create(dto, supplierId);
    const errors = product.validate();
    if (errors.length > 0) throw new BadRequestException(errors.join(', '));

    return product;
  }

  async saveProduct(product: ProductDomainEntity): Promise<ProductDomainEntity> {
    return this.productRepository.create(product);
  }

  async updateProduct(
    id: string,
    data: Partial<ProductDomainEntity>
  ): Promise<ProductDomainEntity> {
    const updatedProduct = await this.productRepository.update(id, data);
    if (!updatedProduct) throw new NotFoundException(`Product ${id} not found after update`);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    return this.productRepository.delete(id);
  }

  async getLowStockProducts(threshold: number = 10): Promise<ProductDomainEntity[]> {
    return this.productRepository.findLowStock(threshold);
  }

  // Supplier operations without file dependencies
  async restockProductOperation(
    id: string,
    quantity: number,
    supplierId: string
  ): Promise<ProductDomainEntity | null> {
    return this.productRepository.increaseStock(id, quantity);
  }

  async toggleStatusOperation(
    id: string,
    status: ProductStatus
  ): Promise<ProductDomainEntity | null> {
    return this.productRepository.updateStatus(id, status);
  }

  async getSupplierProductsOperation(supplierId: string): Promise<ProductDomainEntity[]> {
    return this.productRepository.findBySupplierId(supplierId);
  }

  // Check ownership
  checkProductOwnership(
    product: ProductDomainEntity,
    supplierId: string,
    userRoles: string[],
    action: string
  ): void {
    if (userRoles.includes(Role.ADMIN)) return;

    if (userRoles.includes(Role.SUPPLIER)) {
      if (!product.isOwnedBy(supplierId)) {
        throw new ForbiddenException(`You don't have permission to ${action} this product`);
      }
      return;
    }

    throw new ForbiddenException(`You don't have permission to ${action} products`);
  }

  async checkOwnership(productId: string, supplierId: string): Promise<boolean> {
    const product = await this.productRepository.findById(productId);
    if (!product) return false;
    return product.isOwnedBy(supplierId);
  }
}