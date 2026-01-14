import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Domain services
import { ProductService } from '@domain/products/product.service';
import { ProductFileService } from '@domain/products/product-file.service';

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
import { S3StorageModule } from '@infrastructure/storage/s3-storage.module';
import { S3StorageService } from '@infrastructure/storage/s3-storage.service';

// Categories Module
import { CategoriesModule } from '@module/categories.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([ProductOrmEntity, UserOrmEntity]),
    ConfigModule.forRoot(),
    S3StorageModule,
    CategoriesModule,
  ],
  controllers: [
    ProductPublicController,
    ProductSupplierController,
    ProductCustomerController,
    ProductAdminController,
    ProductSharedController
  ],
  providers: [
    // Main product service
    ProductService,

    // Service for working with product files
    ProductFileService,

    // Product repository
    {
      provide: 'ProductRepository',
      useClass: PostgresProductRepository,
    },

    // S3 storage via abstract interface
    {
      provide: 'FileStorage',
      useExisting: S3StorageService,
    },

    // If direct access to the S3 service is needed
    S3StorageService,
  ],
  exports: [
    ProductService,
    ProductFileService,
    S3StorageService,
  ],
})
export class ProductModule { }