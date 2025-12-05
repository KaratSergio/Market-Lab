import { BaseRepository, QueryableRepository } from '@shared/interfaces/repository.interface';
import { CartDomainEntity } from './cart.entity';

export abstract class CartRepository implements
  BaseRepository<CartDomainEntity>,
  QueryableRepository<CartDomainEntity> {

  // BaseRepository methods
  abstract create(data: Partial<CartDomainEntity>): Promise<CartDomainEntity>;
  abstract findById(id: string): Promise<CartDomainEntity | null>;
  abstract update(id: string, data: Partial<CartDomainEntity>): Promise<CartDomainEntity>;
  abstract delete(id: string): Promise<void>;

  // QueryableRepository methods
  abstract findOne(filter: Partial<CartDomainEntity>): Promise<CartDomainEntity | null>;
  abstract findMany(filter: Partial<CartDomainEntity>): Promise<CartDomainEntity[]>;
  abstract findAll(): Promise<CartDomainEntity[]>;

  // Cart-specific methods
  abstract findByUserId(userId: string): Promise<CartDomainEntity | null>;
  abstract findByStatus(status: string): Promise<CartDomainEntity[]>;
  abstract findExpiredCarts(): Promise<CartDomainEntity[]>;
  abstract clearUserCart(userId: string): Promise<void>;
}