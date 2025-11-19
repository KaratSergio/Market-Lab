import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';;
import { ProductRepository as DomainProductRepository} from '@domain/products/product.repository';
import { ProductEntity } from '@domain/products/product.entity';


@Injectable()
export class PostgresProductRepository extends DomainProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>,
  ) { super() }

  async findAll(): Promise<ProductEntity[]> {
    return this.repository.find({
    });
  }

  async findById(id: string): Promise<ProductEntity | null> {
    return this.repository.findOne({ where: { id } });
  }


  async create(product: ProductEntity): Promise<ProductEntity> {
    const { v4: uuidv4 } = await import('uuid');
    product.setId(uuidv4())
    return this.repository.save(product);
  }

  async update(id: string, product: ProductEntity): Promise<ProductEntity> {
    await this.repository.update(id, product);
    return this.findById(id) as Promise<ProductEntity>;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}