import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartRepository as DomainCartRepository } from '@domain/cart/cart.repository';
import { CartDomainEntity, CartItem } from '@domain/cart/cart.entity';
import { CartOrmEntity } from './cart.entity';
import { CartItemOrmEntity } from './cart-item.entity';
import { CART_STATUS, CartStatus } from '@domain/cart/types';

@Injectable()
export class PostgresCartRepository extends DomainCartRepository {
  constructor(
    @InjectRepository(CartOrmEntity)
    private readonly cartRepository: Repository<CartOrmEntity>,
    @InjectRepository(CartItemOrmEntity)
    private readonly cartItemRepository: Repository<CartItemOrmEntity>,
  ) { super() }

  async create(data: Partial<CartDomainEntity>): Promise<CartDomainEntity> {
    const ormEntity = this.toOrmEntity(data);
    const savedOrmEntity = await this.cartRepository.save(ormEntity);
    return this.toDomainEntity(savedOrmEntity);
  }

  async findById(id: string): Promise<CartDomainEntity | null> {
    if (!id) return null;
    const ormEntity = await this.cartRepository.findOne({
      where: { id },
      relations: ['items']
    });
    return ormEntity ? this.toDomainEntity(ormEntity) : null;
  }

  async update(id: string, data: Partial<CartDomainEntity>): Promise<CartDomainEntity> {
    if (!id) throw new Error('Cart ID is required for update');

    // Updating basic cart information
    await this.cartRepository.update(id, {
      totalAmount: data.totalAmount,
      discountAmount: data.discountAmount,
      finalAmount: data.finalAmount,
      currency: data.currency,
      status: data.status,
      expiresAt: data.expiresAt,
      updatedAt: new Date()
    });

    // Deleting old items
    await this.cartItemRepository.delete({ cartId: id });

    // Creating new items
    if (data.items && data.items.length > 0) {
      const cartItems = data.items.map(item =>
        this.cartItemRepository.create({
          cartId: id,
          productId: item.productId,
          name: item.name || '',
          quantity: item.quantity,
          price: item.price,
          discount: item.discount || 0,
          subtotal: item.subtotal,
          imageUrl: item.imageUrl
        })
      );

      await this.cartItemRepository.save(cartItems);
    }

    const updatedOrmEntity = await this.cartRepository.findOne({
      where: { id },
      relations: ['items']
    });

    if (!updatedOrmEntity) throw new Error(`Cart with id ${id} not found after update`);
    return this.toDomainEntity(updatedOrmEntity);
  }

  async delete(id: string): Promise<void> {
    if (!id) throw new Error('Cart ID is required for delete');
    await this.cartRepository.delete(id);
  }

  // QueryableRepository methods
  async findOne(filter: Partial<CartDomainEntity>): Promise<CartDomainEntity | null> {
    const queryBuilder = this.cartRepository
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.items', 'items');

    if (filter.id) queryBuilder.andWhere('cart.id = :id', { id: filter.id });
    if (filter.userId) queryBuilder.andWhere('cart.userId = :userId', { userId: filter.userId });
    if (filter.status) queryBuilder.andWhere('cart.status = :status', { status: filter.status });
    if (filter.currency) queryBuilder.andWhere('cart.currency = :currency', { currency: filter.currency });

    const ormEntity = await queryBuilder.getOne();
    return ormEntity ? this.toDomainEntity(ormEntity) : null;
  }

  async findMany(filter: Partial<CartDomainEntity>): Promise<CartDomainEntity[]> {
    const queryBuilder = this.cartRepository
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.items', 'items');

    if (filter.id) queryBuilder.andWhere('cart.id = :id', { id: filter.id });
    if (filter.userId) queryBuilder.andWhere('cart.userId = :userId', { userId: filter.userId });
    if (filter.status) queryBuilder.andWhere('cart.status = :status', { status: filter.status });
    if (filter.currency) queryBuilder.andWhere('cart.currency = :currency', { currency: filter.currency });

    const ormEntities = await queryBuilder.getMany();
    return ormEntities.map(this.toDomainEntity);
  }

  async findAll(): Promise<CartDomainEntity[]> {
    const ormEntities = await this.cartRepository.find({
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
    return ormEntities.map(this.toDomainEntity);
  }

  // Cart-specific methods
  async findByUserId(userId: string): Promise<CartDomainEntity | null> {
    const ormEntity = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items'],
      order: { updatedAt: 'DESC' }
    });
    return ormEntity ? this.toDomainEntity(ormEntity) : null;
  }

  async findByStatus(status: string): Promise<CartDomainEntity[]> {
    const ormEntities = await this.cartRepository.find({
      where: { status: status as CartStatus },
      relations: ['items']
    });
    return ormEntities.map(this.toDomainEntity);
  }

  async findExpiredCarts(): Promise<CartDomainEntity[]> {
    const ormEntities = await this.cartRepository
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.items', 'items')
      .where('cart.expiresAt < :now', { now: new Date() })
      .andWhere('cart.status = :status', { status: CART_STATUS.ACTIVE })
      .getMany();

    return ormEntities.map(this.toDomainEntity);
  }

  async clearUserCart(userId: string): Promise<void> {
    const cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items']
    });

    if (cart) {
      // delete all items
      await this.cartItemRepository.delete({ cartId: cart.id });

      // update cart
      await this.cartRepository.update(cart.id, {
        totalAmount: 0,
        discountAmount: 0,
        finalAmount: 0,
        updatedAt: new Date()
      });
    }
  }

  // Utility methods
  async exists(id: string): Promise<boolean> {
    if (!id) return false;
    const count = await this.cartRepository.count({ where: { id } });
    return count > 0;
  }

  async existsByUserId(userId: string): Promise<boolean> {
    if (!userId) return false;
    const count = await this.cartRepository.count({ where: { userId } });
    return count > 0;
  }

  private toDomainEntity(ormEntity: CartOrmEntity): CartDomainEntity {
    const items = ormEntity.items?.map(item => new CartItem(
      item.productId,
      item.quantity,
      parseFloat(item.price.toString()),
      parseFloat(item.discount.toString()),
      item.name,
      item.imageUrl
    )) || [];

    return new CartDomainEntity(
      ormEntity.id,
      ormEntity.userId,
      ormEntity.currency,
      ormEntity.status,
      items,
      ormEntity.expiresAt,
      ormEntity.createdAt,
      ormEntity.updatedAt
    );
  }

  private toOrmEntity(domainEntity: Partial<CartDomainEntity>): CartOrmEntity {
    const ormEntity = new CartOrmEntity();

    if (domainEntity.id) ormEntity.id = domainEntity.id;
    if (domainEntity.userId) ormEntity.userId = domainEntity.userId;
    if (domainEntity.totalAmount !== undefined) ormEntity.totalAmount = domainEntity.totalAmount;
    if (domainEntity.discountAmount !== undefined) ormEntity.discountAmount = domainEntity.discountAmount;
    if (domainEntity.finalAmount !== undefined) ormEntity.finalAmount = domainEntity.finalAmount;
    if (domainEntity.currency) ormEntity.currency = domainEntity.currency;
    if (domainEntity.status) ormEntity.status = domainEntity.status;
    if (domainEntity.expiresAt) ormEntity.expiresAt = domainEntity.expiresAt;
    if (domainEntity.createdAt) ormEntity.createdAt = domainEntity.createdAt;
    if (domainEntity.updatedAt) ormEntity.updatedAt = domainEntity.updatedAt;

    if (domainEntity.items && domainEntity.items.length > 0) {
      ormEntity.items = domainEntity.items.map(item => {
        const cartItem = new CartItemOrmEntity();
        cartItem.productId = item.productId;
        cartItem.name = item.name || '';
        cartItem.quantity = item.quantity;
        cartItem.price = item.price;
        cartItem.discount = item.discount || 0;
        cartItem.subtotal = item.subtotal;
        cartItem.imageUrl = item.imageUrl || '';
        return cartItem;
      });
    }

    return ormEntity;
  }
}