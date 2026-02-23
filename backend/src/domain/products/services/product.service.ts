import { Injectable } from "@nestjs/common";
import { ProductCoreService } from "./product-core.service";
import { ProductManagementService } from "./product-manage.service";
import { ProductOwnerService } from "./product-owner.service";
import { ProductDomainEntity } from "../product.entity";

import {
  CreateProductDto,
  UpdateProductDto,
  PurchaseProductDto,
  RestockProductDto,
  ProductStatus,
  PaginatedResult,
  ProductStatistics
} from "../types";
import { LanguageCode, DEFAULT_LANGUAGE } from "@domain/translations/types";


@Injectable()
export class ProductService {
  constructor(
    private readonly productCore: ProductCoreService,
    private readonly productManagement: ProductManagementService,
    private readonly productOwner: ProductOwnerService
  ) { }

  // Public methods
  findAll(languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<ProductDomainEntity[]> {
    return this.productCore.findAll(languageCode);
  }

  findById(id: string, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<ProductDomainEntity | null> {
    return this.productCore.findById(id, languageCode);
  }

  searchByText(text: string, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<ProductDomainEntity[]> {
    return this.productCore.searchByText(text, languageCode);
  }

  findByCategoryId(categoryId: string, languageCode: LanguageCode = DEFAULT_LANGUAGE): Promise<ProductDomainEntity[]> {
    return this.productCore.findByCategoryId(categoryId, languageCode);
  }

  getPaginated(
    page: number,
    limit: number,
    languageCode: LanguageCode = DEFAULT_LANGUAGE,
    filter?: Partial<ProductDomainEntity>,
    sortBy?: 'price' | 'name' | 'createdAt' | 'stock',
    sortOrder?: 'ASC' | 'DESC',
    stock?: 'in-stock' | 'low-stock' | 'out-of-stock'
  ): Promise<PaginatedResult<ProductDomainEntity>> {
    return this.productCore.getPaginated(
      page, limit, languageCode,
      filter || { status: 'active' },
      sortBy, sortOrder, stock
    );
  }

  // Supplier methods
  create(
    dto: CreateProductDto,
    userId: string,
    images?: Express.Multer.File[]
  ): Promise<ProductDomainEntity> {
    return this.productManagement.create(dto, userId, images);
  }

  update(
    id: string,
    dto: UpdateProductDto,
    userId: string,
    userRoles: string[],
    newImages?: Express.Multer.File[]
  ): Promise<ProductDomainEntity> {
    return this.productManagement.update(id, dto, userId, userRoles, newImages);
  }

  delete(
    id: string,
    userId: string,
    userRoles: string[]
  ): Promise<void> {
    return this.productManagement.delete(id, userId, userRoles);
  }

  addImages(
    productId: string,
    userId: string,
    userRoles: string[],
    images: Express.Multer.File[]
  ): Promise<string[]> {
    return this.productManagement.addImages(productId, userId, userRoles, images);
  }

  removeImage(
    productId: string,
    userId: string,
    userRoles: string[],
    imageUrl: string
  ): Promise<void> {
    return this.productManagement.removeImage(productId, userId, userRoles, imageUrl);
  }

  getSupplierProducts(
    userId: string,
    currentUserId: string,
    userRoles: string[],
    locale: LanguageCode
  ): Promise<ProductDomainEntity[]> {
    return this.productManagement.getSupplierProducts(userId, currentUserId, userRoles, locale);
  }

  restockProduct(
    id: string,
    dto: RestockProductDto,
    userId: string,
    userRoles: string[]
  ): Promise<ProductDomainEntity | null> {
    return this.productManagement.restockProduct(id, dto, userId, userRoles);
  }

  toggleStatus(
    id: string,
    status: ProductStatus,
    userId: string,
    userRoles: string[]
  ): Promise<ProductDomainEntity | null> {
    return this.productManagement.toggleStatus(id, status, userId, userRoles);
  }

  // Customer methods
  purchase(
    id: string,
    dto: PurchaseProductDto,
    customerId: string
  ): Promise<ProductDomainEntity> {
    return this.productCore.purchase(id, dto, customerId);
  }

  // Admin methods
  getStatistics(): Promise<ProductStatistics> {
    return this.productCore.getStatistics();
  }

  getAllProducts(
    filter?: Partial<ProductDomainEntity>
  ): Promise<ProductDomainEntity[]> {
    return this.productCore.getAllProducts(filter);
  }

  forceDelete(id: string): Promise<void> {
    return this.productCore.forceDelete(id);
  }

  activateProduct(id: string): Promise<ProductDomainEntity | null> {
    return this.productCore.activateProduct(id);
  }

  deactivateProduct(id: string): Promise<ProductDomainEntity | null> {
    return this.productCore.deactivateProduct(id);
  }

  // Helper methods
  async checkOwnership(productId: string, userId: string): Promise<boolean> {
    try {
      const supplierId = await this.productOwner.getSupplierIdFromUserId(userId);
      return this.productCore.checkOwnership(productId, supplierId);
    } catch {
      return false;
    }
  }

  getLowStockProducts(threshold: number = 10): Promise<ProductDomainEntity[]> {
    return this.productCore.getLowStockProducts(threshold);
  }
}