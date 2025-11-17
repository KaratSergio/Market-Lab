import { Controller, Get, Post, Put, Delete, Param, Body} from '@nestjs/common';
import { ProductService } from '@domain/products/product.service';
import type { CreateProductDto, UpdateProductDto } from '@domain/products/types/product.dto';


@Controller('product')
export class ProductController{
    constructor(private readonly productService: ProductService) {}

    @Get()
    async findAll(){
        return this.productService.findAll();
    }

    @Get(':id')
    async findById(@Param('id') id: string){
        return this.productService.findById(id);
    }
    
    @Post()
    async create(@Body() dto: CreateProductDto){
        return this.productService.create(dto);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateProductDto){
        return this.productService.update(id, dto);
    }

    @Delete(':id')
    async delete(@Param('id') id: string){
        return this.productService.delete(id);
    }

}