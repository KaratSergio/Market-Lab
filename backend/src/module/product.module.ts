import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TranslationsModule } from './translations.module';

// Domain services
import {
  ProductService,
  ProductCoreService,
  ProductManagementService,
  ProductOwnerService,
  ProductFileService
} from '@domain/products/services';

// Controllers
import {
  ProductPublicController,
  ProductSupplierController,
  ProductCustomerController,
  ProductAdminController,
  ProductSharedController
} from '@controller/product';

// Database infrastructure
import { ProductOrmEntity } from '@infrastructure/database/postgres/products/product.entity';
import { PostgresProductRepository } from '@infrastructure/database/postgres/products/product.repository';
import { UserOrmEntity } from '@infrastructure/database/postgres/users/user.entity';

// S3 Storage
import { S3StorageModule } from '@module/s3-storage.module';
import { S3ProductImageStorageAdapter } from '@infrastructure/storage/s3-product-img.adapter';

// Modules
import { CategoriesModule } from '@module/categories.module';
import { TagsModule } from '@module/tags.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([ProductOrmEntity, UserOrmEntity]),
    ConfigModule.forRoot(),
    S3StorageModule,
    CategoriesModule,
    TagsModule,
    TranslationsModule,
  ],
  controllers: [
    ProductPublicController,
    ProductSupplierController,
    ProductCustomerController,
    ProductAdminController,
    ProductSharedController
  ],
  providers: [
    ProductCoreService,
    ProductManagementService,
    ProductOwnerService,
    ProductFileService,
    ProductService,

    // Product repository
    {
      provide: 'ProductRepository',
      useClass: PostgresProductRepository,
    },

    // S3 storage via abstract interface
    {
      provide: 'ProductImageStorage',
      useExisting: S3ProductImageStorageAdapter,
    },

    // Direct access to the S3 service
    S3ProductImageStorageAdapter,
  ],
  exports: [
    ProductService,
  ],
})
export class ProductModule { }