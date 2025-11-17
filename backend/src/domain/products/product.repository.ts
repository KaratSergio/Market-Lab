import { ProductEntity } from "./product.entity";

export abstract class ProductRepository {
    abstract create(product: ProductEntity): Promise<ProductEntity>;
    abstract findAll(): Promise<ProductEntity[]>;
    abstract findById(id: string): Promise<ProductEntity | null>;
    abstract update(id: string, product: Partial<ProductEntity>): Promise<ProductEntity>;
    abstract delete(id: string): Promise<void>;
  }