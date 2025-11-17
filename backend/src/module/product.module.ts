import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from '@domain/products/product.service';
import { ProductController } from '@controller/product.controller';
import { ProductEntity } from '@domain/products/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity])],
  controllers: [ProductController],
  exports: [ProductService],
})
export class ProductModule{}