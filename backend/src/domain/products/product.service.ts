import { Injectable, NotFoundException} from "@nestjs/common";
import { ProductRepository } from "./product.repository";
import { CreateProductDto, UpdateProductDto } from "./types/product.dto";
import { ProductEntity } from "./product.entity";

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async create(dto: CreateProductDto): Promise<ProductEntity>{
    const product = new ProductEntity(null, dto.name, dto.description, dto.price);
    return this.productRepository.create(product);
  }

  async findAll(): Promise<ProductEntity[]>{
    return this.productRepository.findAll();
  }

  async findById(id: string): Promise<ProductEntity | null>{
    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
   }

  async update(id: string, dto: UpdateProductDto): Promise<ProductEntity>{
    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return this.productRepository.update(id, dto);
  }

  async delete(id: string): Promise<void>{
    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return this.productRepository.delete(id);
  }

}