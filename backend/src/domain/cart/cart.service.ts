import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException
} from '@nestjs/common';

import {
  AddItemToCartDto,
  UpdateCartItemDto,
  ApplyDiscountDto,
  CART_STATUS
} from './types';

import { Role } from '@shared/types';
import { CartDomainEntity } from './cart.entity';
import { CartRepository } from './cart.repository';


@Injectable()
export class CartService {
  constructor(
    @Inject('CartRepository')
    private readonly cartRepository: CartRepository,
  ) { }

  async getOrCreateCart(
    userId: string,
    currency: string = 'UAH',
    userRoles: string[]
  ): Promise<CartDomainEntity> {
    if (!userRoles.includes(Role.CUSTOMER)) throw new ForbiddenException('Only customers can have a cart');
    let cart = await this.cartRepository.findByUserId(userId);

    if (!cart) {
      cart = CartDomainEntity.create({ userId, currency });
      return this.cartRepository.create(cart);
    }
    if (cart.isExpired() && cart.status === CART_STATUS.ACTIVE) {
      cart.clear();
      cart = await this.cartRepository.update(cart.id, cart);
    }

    return cart;
  }

  async getCartById(
    id: string,
    userId: string,
    userRoles: string[]
  ): Promise<CartDomainEntity> {
    const cart = await this.cartRepository.findById(id);
    if (!cart) throw new NotFoundException('Cart not found');

    this._checkCartAccess(cart, userId, userRoles);
    return cart;
  }

  async getCartByUserId(
    userId: string,
    userRoles: string[]
  ): Promise<CartDomainEntity> {
    if (!userRoles.includes(Role.CUSTOMER)) throw new ForbiddenException('Only customers can have a cart');
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) throw new NotFoundException('Cart not found for user');

    this._checkCartAccess(cart, userId, userRoles);
    return cart;
  }

  async addItemToCart(
    userId: string,
    itemDto: AddItemToCartDto,
    userRoles: string[]
  ): Promise<CartDomainEntity> {
    if (userRoles && !userRoles.includes(Role.CUSTOMER)) {
      throw new ForbiddenException('Only customers can add items to cart');
    }

    const cart = await this.getOrCreateCart(userId, 'UAH', userRoles);

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
    updateDto: UpdateCartItemDto,
    userId: string,
    userRoles: string[]
  ): Promise<CartDomainEntity> {
    const cart = await this.getCartById(cartId, userId, userRoles);

    if (!userRoles.includes(Role.CUSTOMER)) throw new ForbiddenException('Only customers can update items in cart');
    if (cart.status !== CART_STATUS.ACTIVE) throw new ConflictException('Cannot modify cart that is not active');

    cart.updateItemQuantity(productId, updateDto.quantity);
    return this.cartRepository.update(cart.id, cart);
  }

  async removeItemFromCart(
    cartId: string,
    productId: string,
    userId: string,
    userRoles: string[]
  ): Promise<CartDomainEntity> {
    const cart = await this.getCartById(cartId, userId, userRoles);

    if (!userRoles.includes(Role.CUSTOMER)) throw new ForbiddenException('Only customers can remove items from cart');
    if (cart.status !== CART_STATUS.ACTIVE) throw new ConflictException('Cannot modify cart that is not active');

    cart.removeItem(productId);
    return this.cartRepository.update(cart.id, cart);
  }

  async applyDiscount(
    cartId: string,
    discountDto: ApplyDiscountDto,
    userId: string,
    userRoles: string[]
  ): Promise<CartDomainEntity> {
    const cart = await this.getCartById(cartId, userId, userRoles);
    if (!userRoles.includes(Role.CUSTOMER)) throw new ForbiddenException('Only customers can apply discounts to cart');

    //! Add promo code verification logic
    const discountAmount = discountDto.discountAmount ||
      (discountDto.discountPercentage ? cart.totalAmount * (discountDto.discountPercentage / 100) : 0);

    cart.applyDiscount(discountAmount);
    return this.cartRepository.update(cart.id, cart);
  }

  async clearCart(
    cartId: string,
    userId: string,
    userRoles: string[]
  ): Promise<CartDomainEntity> {
    const cart = await this.getCartById(cartId, userId, userRoles);
    if (!userRoles.includes(Role.CUSTOMER)) throw new ForbiddenException('Only customers can clear cart');

    cart.clear();
    return this.cartRepository.update(cart.id, cart);
  }

  async markCartAsPendingCheckout(
    cartId: string,
    userId: string,
    userRoles: string[]
  ): Promise<CartDomainEntity> {
    const cart = await this.getCartById(cartId, userId, userRoles);

    if (!userRoles.includes(Role.CUSTOMER)) throw new ForbiddenException('Only customers can checkout cart');
    if (cart.items.length === 0) throw new BadRequestException('Cannot checkout empty cart');

    cart.markAsPendingCheckout();
    return this.cartRepository.update(cart.id, cart);
  }

  async markCartAsConvertedToOrder(
    cartId: string,
    userId: string,
    userRoles: string[]
  ): Promise<CartDomainEntity> {
    const cart = await this.getCartById(cartId, userId, userRoles);

    if (!userRoles.includes(Role.ADMIN) && !userRoles.includes(Role.CUSTOMER)) {
      throw new ForbiddenException('Only customers or admins can mark cart as converted to order');
    }

    cart.markAsConvertedToOrder();
    return this.cartRepository.update(cart.id, cart);
  }

  async findExpiredCarts(
    userId: string,
    userRoles: string[]
  ): Promise<CartDomainEntity[]> {
    // Only admins can view all expired carts
    if (!userRoles.includes(Role.ADMIN)) throw new ForbiddenException('Only admins can view expired carts');
    return this.cartRepository.findExpiredCarts();
  }

  async cleanupExpiredCarts(
    userId: string,
    userRoles: string[]
  ): Promise<void> {
    // Only admins can clear expired carts
    if (!userRoles.includes(Role.ADMIN)) throw new ForbiddenException('Only admins can cleanup expired carts');
    const expiredCarts = await this.findExpiredCarts(userId, userRoles);

    for (const cart of expiredCarts) {
      if (cart.status === CART_STATUS.ACTIVE) {
        cart.clear();
        await this.cartRepository.update(cart.id, cart);
      }
    }
  }

  private _checkCartAccess(
    cart: CartDomainEntity,
    userId: string,
    userRoles: string[]
  ): void {
    if (userRoles && userRoles.includes(Role.ADMIN)) return;
    if (userId && cart.userId === userId) return;
    throw new ForbiddenException('You do not have access to this cart');
  }

  //! Дополнительный метод для статистики поставщика
  async getSupplierCartStats(
    supplierId: string,
    userId: string,
    userRoles: string[]
  ): Promise<any> {
    // Only the supplier or admin can see the statistics
    if (userRoles) {
      const isSupplier = userRoles.includes(Role.SUPPLIER) && userId === supplierId;
      const isAdmin = userRoles.includes(Role.ADMIN);

      if (!isSupplier && !isAdmin) {
        throw new ForbiddenException('Only supplier or admin can view cart statistics');
      }
    }

    //! Возвращает статистику по товарам поставщика в активных корзинах
    return {
      supplierId,
      totalInCarts: 0, // ! логику подсчета
      topProducts: [], // !
    };
  }
}