import {
  Injectable, Inject,
  NotFoundException, BadRequestException,
  ConflictException, ForbiddenException
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

  async getOrCreateGuestCart(
    sessionId: string,
    currency: string = 'UAH'
  ): Promise<CartDomainEntity> {
    if (!sessionId) throw new BadRequestException('Session ID is required for guest cart');
    let cart = await this.cartRepository.findBySessionId(sessionId);

    if (!cart) {
      cart = CartDomainEntity.create({
        sessionId,
        currency
      });
      return this.cartRepository.create(cart);
    }

    if (cart.isExpired()) {
      cart.clear();
      cart = await this.cartRepository.update(cart.id, cart);
    }

    return cart;
  }

  async getOrCreateCart(
    identifier: { userId?: string; sessionId?: string },
    currency: string = 'UAH',
    userRoles?: string[]
  ): Promise<CartDomainEntity> {
    const { userId, sessionId } = identifier;

    if (userId) {
      let cart = await this.cartRepository.findByUserId(userId);
      if (!cart) {
        cart = CartDomainEntity.create({ userId, currency });
        return this.cartRepository.create(cart);
      }
      return cart;
    }

    if (sessionId) {
      return this.getOrCreateGuestCart(sessionId, currency);
    }

    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    return this.getOrCreateGuestCart(newSessionId, currency);
  }

  async mergeGuestCartWithUser(
    userId: string,
    sessionId: string
  ): Promise<CartDomainEntity> {
    if (!userId || !sessionId) {
      throw new BadRequestException('Both userId and sessionId are required for merge');
    }

    return this.cartRepository.mergeCarts(userId, sessionId);
  }

  async getCartById(
    id: string,
    identifier: { userId?: string; sessionId?: string },
    userRoles?: string[]
  ): Promise<CartDomainEntity> {
    const cart = await this.cartRepository.findById(id);
    if (!cart) throw new NotFoundException('Cart not found');

    this._checkCartAccess(cart, identifier, userRoles);
    return cart;
  }

  async getCartByUserId(
    identifier: { userId?: string; sessionId?: string },
    userRoles?: string[]
  ): Promise<CartDomainEntity> {
    const { userId } = identifier;

    if (!userId) {
      throw new BadRequestException('UserId is required to get cart by user id');
    }

    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) throw new NotFoundException('Cart not found for user');

    this._checkCartAccess(cart, identifier, userRoles);
    return cart;
  }

  async addItemToCart(
    identifier: { userId?: string; sessionId?: string },
    itemDto: AddItemToCartDto,
    userRoles?: string[]
  ): Promise<CartDomainEntity> {
    const cart = await this.getOrCreateCart(identifier, 'UAH', userRoles);

    // Maximum 10 different items in the cart
    if (cart.items.length >= 10 && !cart.items.find(item => item.productId === itemDto.productId)) {
      throw new BadRequestException('Cart cannot have more than 10 different items');
    }

    // Maximum 99 pieces of one product
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
    identifier: { userId?: string; sessionId?: string },
    userRoles?: string[]
  ): Promise<CartDomainEntity> {
    const cart = await this.getCartById(cartId, identifier, userRoles);

    if (cart.status !== CART_STATUS.ACTIVE) {
      throw new ConflictException('Cannot modify cart that is not active');
    }

    cart.updateItemQuantity(productId, updateDto.quantity);
    return this.cartRepository.update(cart.id, cart);
  }

  async removeItemFromCart(
    cartId: string,
    productId: string,
    identifier: { userId?: string; sessionId?: string },
    userRoles?: string[]
  ): Promise<CartDomainEntity> {
    const cart = await this.getCartById(cartId, identifier, userRoles);

    if (cart.status !== CART_STATUS.ACTIVE) {
      throw new ConflictException('Cannot modify cart that is not active');
    }

    cart.removeItem(productId);
    return this.cartRepository.update(cart.id, cart);
  }

  async applyDiscount(
    cartId: string,
    discountDto: ApplyDiscountDto,
    identifier: { userId?: string; sessionId?: string },
    userRoles?: string[]
  ): Promise<CartDomainEntity> {
    const cart = await this.getCartById(cartId, identifier, userRoles);

    //! Add promo code verification logic
    const discountAmount = discountDto.discountAmount ||
      (discountDto.discountPercentage ? cart.totalAmount * (discountDto.discountPercentage / 100) : 0);

    cart.applyDiscount(discountAmount);
    return this.cartRepository.update(cart.id, cart);
  }

  async clearCart(
    cartId: string,
    identifier: { userId?: string; sessionId?: string },
    userRoles?: string[]
  ): Promise<CartDomainEntity> {
    const cart = await this.getCartById(cartId, identifier, userRoles);

    cart.clear();
    return this.cartRepository.update(cart.id, cart);
  }

  async markCartAsPendingCheckout(
    cartId: string,
    identifier: { userId?: string; sessionId?: string },
    userRoles?: string[]
  ): Promise<CartDomainEntity> {
    const cart = await this.getCartById(cartId, identifier, userRoles);

    if (cart.items.length === 0) {
      throw new BadRequestException('Cannot checkout empty cart');
    }

    // Only authenticated users can checkout
    if (!identifier.userId) {
      throw new ForbiddenException('You must be logged in to checkout');
    }

    cart.markAsPendingCheckout();
    return this.cartRepository.update(cart.id, cart);
  }

  async markCartAsConvertedToOrder(
    cartId: string,
    identifier: { userId?: string; sessionId?: string },
    userRoles?: string[]
  ): Promise<CartDomainEntity> {
    const cart = await this.getCartById(cartId, identifier, userRoles);

    // Only authenticated users or admins can mark as converted
    if (!identifier.userId && !userRoles?.includes(Role.ADMIN)) {
      throw new ForbiddenException('You must be logged in to complete order');
    }

    cart.markAsConvertedToOrder();
    return this.cartRepository.update(cart.id, cart);
  }

  async findExpiredCarts(
    userId: string,
    userRoles: string[]
  ): Promise<CartDomainEntity[]> {
    // Only admins can view all expired carts
    if (!userRoles.includes(Role.ADMIN)) {
      throw new ForbiddenException('Only admins can view expired carts');
    }
    return this.cartRepository.findExpiredCarts();
  }

  async cleanupExpiredCarts(
    userId: string,
    userRoles: string[]
  ): Promise<void> {
    // Only admins can clear expired carts
    if (!userRoles.includes(Role.ADMIN)) {
      throw new ForbiddenException('Only admins can cleanup expired carts');
    }

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
    identifier: { userId?: string; sessionId?: string },
    userRoles?: string[]
  ): void {
    if (userRoles?.includes(Role.ADMIN)) return;

    if (identifier.userId && cart.userId === identifier.userId) return;
    if (identifier.sessionId && cart.sessionId === identifier.sessionId && !cart.userId) return;

    throw new ForbiddenException('You do not have access to this cart');
  }

  //! Additional method for supplier statistics
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

    //! Returns statistics on supplier products in active carts
    return {
      supplierId,
      totalInCarts: 0, //! logic to be implemented
      topProducts: [], //! logic to be implemented
    };
  }
}