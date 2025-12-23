import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupplierProfileOrmEntity } from '@infrastructure/database/postgres/suppliers/supplier.entity';
import { PostgresSupplierRepository } from '@infrastructure/database/postgres/suppliers/supplier.repository';
import { SupplierService } from '@domain/suppliers/supplier.service';
import { SuppliersController } from '../controller/suppliers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SupplierProfileOrmEntity])],
  controllers: [SuppliersController],
  providers: [
    SupplierService,
    {
      provide: 'SupplierRepository',
      useClass: PostgresSupplierRepository,
    },
  ],
  exports: ['SupplierRepository', SupplierService],
})
export class SuppliersModule { }