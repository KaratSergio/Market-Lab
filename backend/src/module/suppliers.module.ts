import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AddressModule } from './address.module';
import { AuthModule } from '@auth/auth.module';

// Domain services
import { SupplierService } from '@domain/suppliers/supplier.service';

// Controllers
import { SuppliersController } from '../controller/suppliers.controller';

// Database infrastructure
import { SupplierProfileOrmEntity } from '@infrastructure/database/postgres/suppliers/supplier.entity';
import { PostgresSupplierRepository } from '@infrastructure/database/postgres/suppliers/supplier.repository';

// S3 Storage
import { S3StorageModule } from '@infrastructure/storage/s3-storage.module';
import { S3StorageService } from '@infrastructure/storage/s3-storage.service';
import { UsersModule } from './users.module';



@Module({
  imports: [
    TypeOrmModule.forFeature([SupplierProfileOrmEntity]),
    ConfigModule.forRoot(),
    AuthModule,
    AddressModule,
    S3StorageModule,
    UsersModule,
  ],
  controllers: [SuppliersController],
  providers: [
    // Main supplier service
    SupplierService,

    // Supplier repository
    {
      provide: 'SupplierRepository',
      useClass: PostgresSupplierRepository,
    },

    // S3 storage via abstract interface
    {
      provide: 'FileStorage',
      useExisting: S3StorageService,
    },

    // Direct access to the S3 service
    S3StorageService,
  ],
  exports: [
    SupplierService,
    S3StorageService,
  ],
})
export class SuppliersModule { }