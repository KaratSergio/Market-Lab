import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from '@domain/products/product.service';
import { ProductController } from '@controller/product.controller';
import { ProductEntity } from '@infrastructure/database/postgres/products/product.entity';
import { PostgresProductRepository } from '@infrastructure/database/postgres/products/product.repository';


@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity])],
  controllers: [ProductController],
  providers: [
    ProductService,
    {
      provide: 'ProductRepository',
      useClass: PostgresProductRepository,
    },
  ],
  exports: [ProductService],
})
export class ProductModule{}