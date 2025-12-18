import { ProductDomainEntity } from "./product.entity";
import { BaseRepository } from '@shared/types/repository.interface'

export abstract class ProductRepository implements BaseRepository<ProductDomainEntity> {
  abstract create(product: ProductDomainEntity): Promise<ProductDomainEntity>;
  abstract findAll(): Promise<ProductDomainEntity[]>;
  abstract findById(id: string): Promise<ProductDomainEntity | null>;
  abstract update(id: string, product: ProductDomainEntity): Promise<ProductDomainEntity>;
  abstract delete(id: string): Promise<void>;
}
