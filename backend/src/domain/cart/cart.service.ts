import { Injectable, Inject, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { CartDomainEntity } from './cart.entity';
import { CartRepository } from './cart.repository';
import { AddItemToCartDto, UpdateCartItemDto, ApplyDiscountDto, CART_STATUS } from './types';
import { CUSTOMER_STATUS } from '@domain/customers/types';


@Injectable()
export class CartService {
  constructor(
    @Inject('CartRepository')
    private readonly cartRepository: CartRepository,
  ) { }

  async getOrCreateCart(userId: string, currency: string = 'USD'): Promise<CartDomainEntity> {
    let cart = await this.cartRepository.findByUserId(userId);

    if (!cart) {
      cart = CartDomainEntity.create({ userId, currency });
      return this.cartRepository.create(cart);
    }

    // Checking if the basket is expired
    if (cart.isExpired() && cart.status === CART_STATUS.ACTIVE) {
      cart.clear();
      cart = await this.cartRepository.update(cart.id, cart);
    }

    return cart;
  }

  async getCartById(id: string): Promise<CartDomainEntity> {
    const cart = await this.cartRepository.findById(id);
    if (!cart) throw new NotFoundException('Cart not found');
    return cart;
  }

  async getCartByUserId(userId: string): Promise<CartDomainEntity> {
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) throw new NotFoundException('Cart not found for user');
    return cart;
  }

  async addItemToCart(
    userId: string,
    itemDto: AddItemToCartDto
  ): Promise<CartDomainEntity> {
    const cart = await this.getOrCreateCart(userId);

    //! Maximum 10 different items in the cart
    if (cart.items.length >= 10 && !cart.items.find(item => item.productId === itemDto.productId)) {
      throw new BadRequestException('Cart cannot have more than 10 different items');
    }

    //! Maximum 99 pieces of one product
    const existingItem = cart.items.find(item => item.productId === itemDto.productId);
    if (existingItem && existingItem.quantity + itemDto.quantity > 99) {
      throw new BadRequestException('Cannot add more than 99 units of the same product');
    }

    cart.addItem(
      itemDto.productId,
      itemDto.quantity,
      itemDto.price,
      itemDto.name!,
      itemDto.imageUrl
    );

    return this.cartRepository.update(cart.id, cart);
  }

  async updateItemQuantity(
    cartId: string,
    productId: string,
    updateDto: UpdateCartItemDto
  ): Promise<CartDomainEntity> {
    const cart = await this.getCartById(cartId);

    if (cart.status !== CART_STATUS.ACTIVE) {
      throw new ConflictException('Cannot modify cart that is not active');
    }

    cart.updateItemQuantity(productId, updateDto.quantity);
    return this.cartRepository.update(cart.id, cart);
  }

  async removeItemFromCart(cartId: string, productId: string): Promise<CartDomainEntity> {
    const cart = await this.getCartById(cartId);

    if (cart.status !== CUSTOMER_STATUS.ACTIVE) {
      throw new ConflictException('Cannot modify cart that is not active');
    }

    cart.removeItem(productId);
    return this.cartRepository.update(cart.id, cart);
  }

  async applyDiscount(cartId: string, discountDto: ApplyDiscountDto): Promise<CartDomainEntity> {
    const cart = await this.getCartById(cartId);

    //! добавить логику проверки промокода
    const discountAmount = discountDto.discountAmount ||
      (discountDto.discountPercentage ? cart.totalAmount * (discountDto.discountPercentage / 100) : 0);

    cart.applyDiscount(discountAmount);
    return this.cartRepository.update(cart.id, cart);
  }

  async clearCart(cartId: string): Promise<CartDomainEntity> {
    const cart = await this.getCartById(cartId);
    cart.clear();
    return this.cartRepository.update(cart.id, cart);
  }

  async markCartAsPendingCheckout(cartId: string): Promise<CartDomainEntity> {
    const cart = await this.getCartById(cartId);

    if (cart.items.length === 0) {
      throw new BadRequestException('Cannot checkout empty cart');
    }

    cart.markAsPendingCheckout();
    return this.cartRepository.update(cart.id, cart);
  }

  async markCartAsConvertedToOrder(cartId: string): Promise<CartDomainEntity> {
    const cart = await this.getCartById(cartId);
    cart.markAsConvertedToOrder();
    return this.cartRepository.update(cart.id, cart);
  }

  async findExpiredCarts(): Promise<CartDomainEntity[]> {
    return this.cartRepository.findExpiredCarts();
  }

  async cleanupExpiredCarts(): Promise<void> {
    const expiredCarts = await this.findExpiredCarts();

    for (const cart of expiredCarts) {
      if (cart.status === CART_STATUS.ACTIVE) {
        cart.clear();
        await this.cartRepository.update(cart.id, cart);
      }
    }
  }
}