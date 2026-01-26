import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject
} from "@nestjs/common";

import { ProductCoreService } from "./product-core.service";
import { ProductOwnerService } from "./product-owner.service";
import { ProductFileService } from "./product-file.service";
import { ProductDomainEntity } from "../product.entity";

import {
  CreateProductDto,
  UpdateProductDto,
  RestockProductDto,
  ProductStatus
} from "../types";
import { Role } from '@shared/types';
import { LanguageCode, DEFAULT_LANGUAGE } from "@domain/translations/types";
import { TranslationService } from "@domain/translations/translation.service";


@Injectable()
export class ProductManagementService {
  constructor(
    private readonly productCore: ProductCoreService,
    private readonly productOwner: ProductOwnerService,
    private readonly productFileService: ProductFileService,
    @Inject(TranslationService)
    private readonly translationService: TranslationService
  ) { }

  async create(
    dto: CreateProductDto,
    userId: string,
    images?: Express.Multer.File[]
  ): Promise<ProductDomainEntity> {
    const { supplierId, companyName } = await this.productOwner.getSupplierInfo(userId);
    const product = await this.productCore.createProductEntity(dto, supplierId);
    const savedProduct = await this.productCore.saveProduct(product);

    if (dto.translations) {
      await this.translationService.saveTranslations(
        savedProduct.id,
        'product',
        dto.translations
      );
    }

    if (images?.length) await this._uploadAndAttachImages(savedProduct, images, companyName);
    return savedProduct;
  }

  async update(
    id: string,
    dto: UpdateProductDto,
    userId: string,
    userRoles: string[],
    newImages?: Express.Multer.File[]
  ): Promise<ProductDomainEntity> {
    const product = await this.productCore.findById(id);
    const { supplierId, companyName } = await this.productOwner.getSupplierInfo(userId);

    this.productCore.checkProductOwnership(product, supplierId, userRoles, 'update');

    if (dto.translations) {
      await this.translationService.saveTranslations(
        id,
        'product',
        dto.translations
      );
    }

    if (newImages?.length) {
      const uploadedUrls = await this._uploadImages(newImages, companyName, product.name);
      dto.images = [...product.images, ...uploadedUrls];
    }

    return this.productCore.updateProduct(id, dto);
  }

  async delete(
    id: string,
    userId: string,
    userRoles: string[]
  ): Promise<void> {
    const product = await this.productCore.findById(id);
    const { supplierId, companyName } = await this.productOwner.getSupplierInfo(userId);

    this.productCore.checkProductOwnership(product, supplierId, userRoles, 'delete');

    await this.translationService.deleteTranslations(id, 'product');

    try {
      await this.productFileService.deleteProductImages(companyName, product.name);
    } catch (error) {
      console.error(`Failed to delete product images: ${error.message}`);
    }

    return this.productCore.deleteProduct(id);
  }

  async addImages(
    productId: string,
    userId: string,
    userRoles: string[],
    images: Express.Multer.File[]
  ): Promise<string[]> {
    const product = await this.productCore.findById(productId);
    const { supplierId, companyName } = await this.productOwner.getSupplierInfo(userId);

    this.productCore.checkProductOwnership(product, supplierId, userRoles, 'add images');

    const uploadedUrls = await this._uploadImages(images, companyName, product.name);

    if (uploadedUrls.length > 0) {
      const updatedImages = [...product.images, ...uploadedUrls];
      await this.productCore.updateProduct(productId, { images: updatedImages });
    }

    return uploadedUrls;
  }

  async removeImage(
    productId: string,
    userId: string,
    userRoles: string[],
    imageUrl: string
  ): Promise<void> {
    const product = await this.productCore.findById(productId);
    const { supplierId } = await this.productOwner.getSupplierInfo(userId);

    this.productCore.checkProductOwnership(product, supplierId, userRoles, 'remove image');

    if (!product.images.includes(imageUrl)) {
      throw new NotFoundException('Image not found for this product');
    }

    try {
      await this.productFileService.deleteImageByUrl(imageUrl);
    } catch (error) {
      console.error(`Failed to delete image from storage: ${error.message}`);
      throw new BadRequestException(`Failed to delete image from storage: ${error.message}`);
    }

    const updatedImages = product.images.filter(img => img !== imageUrl);
    await this.productCore.updateProduct(productId, { images: updatedImages });
  }

  async getSupplierProducts(
    targetUserId: string,
    requestingUserId: string,
    roles: string[],
    languageCode: LanguageCode = DEFAULT_LANGUAGE
  ): Promise<ProductDomainEntity[]> {
    const targetSupplierId = await this.productOwner.getSupplierIdFromUserId(targetUserId);
    const requestingSupplierId = await this.productOwner.getSupplierIdFromUserId(requestingUserId);

    if (targetSupplierId !== requestingSupplierId && !roles.includes(Role.ADMIN)) {
      throw new ForbiddenException('You can only view your own products');
    }

    return this.productCore.getSupplierProductsOperation(targetSupplierId, languageCode);
  }

  async restockProduct(
    id: string,
    dto: RestockProductDto,
    userId: string,
    userRoles: string[]
  ): Promise<ProductDomainEntity | null> {
    const product = await this.productCore.findById(id);
    const { supplierId } = await this.productOwner.getSupplierInfo(userId);

    this.productCore.checkProductOwnership(product, supplierId, userRoles, 'restock');

    if (dto.quantity <= 0) throw new BadRequestException('Quantity must be positive');

    return this.productCore.restockProductOperation(id, dto.quantity, supplierId);
  }

  async toggleStatus(
    id: string,
    status: ProductStatus,
    userId: string,
    userRoles: string[]
  ): Promise<ProductDomainEntity | null> {
    const product = await this.productCore.findById(id);
    const { supplierId } = await this.productOwner.getSupplierInfo(userId);

    this.productCore.checkProductOwnership(product, supplierId, userRoles, 'change status');

    return this.productCore.toggleStatusOperation(id, status);
  }

  // Private helpers
  private async _uploadImages(
    files: Express.Multer.File[],
    companyName: string,
    productName: string
  ): Promise<string[]> {
    return this.productFileService.uploadProductImages(files, companyName, productName);
  }

  private async _uploadAndAttachImages(
    product: ProductDomainEntity,
    images: Express.Multer.File[],
    companyName: string
  ): Promise<void> {
    try {
      const imageUrls = await this._uploadImages(images, companyName, product.name);

      if (imageUrls.length) {
        await this.productCore.updateProduct(product.id, { images: imageUrls });
        product.images = imageUrls;
      }
    } catch (error) {
      console.error('Failed to upload images:', error);
    }
  }
}