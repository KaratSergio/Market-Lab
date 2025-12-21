import {
  Controller,
  Get, Post, Put, Delete,
  Body, Param,
  HttpCode, HttpStatus, Request
} from '@nestjs/common';

import type {
  AddItemToCartDto,
  UpdateCartItemDto,
  ApplyDiscountDto
} from '@domain/cart/types';

import {
  Auth,
  CustomerOnly,
} from '../auth/decorators';

import { CartService } from '@domain/cart/cart.service';
import type { AuthRequest } from '../auth/types';
import { Permission, Role } from '@shared/types';


@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) { }

  @Get()
  @CustomerOnly()
  async getCart(@Request() req: AuthRequest) {
    const userId = req.user.id;
    return this.cartService.getOrCreateCart(userId);
  }

  @Post('items')
  @Auth([Role.CUSTOMER], [Permission.CART_ADD_ITEM])
  async addItem(
    @Request() req: AuthRequest,
    @Body() addItemDto: AddItemToCartDto
  ) {
    const userId = req.user.id;
    return this.cartService.addItemToCart(userId, addItemDto);
  }

  @Put('items/:productId')
  @Auth([Role.CUSTOMER], [Permission.CART_UPDATE_ITEM])
  async updateItem(
    @Request() req: AuthRequest,
    @Param('productId') productId: string,
    @Body() updateDto: UpdateCartItemDto,
  ) {
    const cart = await this.cartService.getCartByUserId(req.user.id);
    return this.cartService.updateItemQuantity(cart.id, productId, updateDto);
  }

  @Delete('items/:productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth([Role.CUSTOMER], [Permission.CART_REMOVE_ITEM])
  async removeItem(
    @Request() req: AuthRequest,
    @Param('productId') productId: string,
  ) {
    const cart = await this.cartService.getCartByUserId(req.user.id);
    return this.cartService.removeItemFromCart(cart.id, productId);
  }

  @Post('apply-discount')
  @Auth([Role.CUSTOMER], [Permission.CART_APPLY_DISCOUNT])
  async applyDiscount(
    @Request() req: AuthRequest,
    @Body() discountDto: ApplyDiscountDto,
  ) {
    const cart = await this.cartService.getCartByUserId(req.user.id);
    return this.cartService.applyDiscount(cart.id, discountDto);
  }

  @Post('clear')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth([Role.CUSTOMER], [Permission.CART_CLEAR])
  async clearCart(@Request() req: AuthRequest) {
    const cart = await this.cartService.getCartByUserId(req.user.id);
    return this.cartService.clearCart(cart.id);
  }

  @Post('checkout')
  @Auth([Role.CUSTOMER], [Permission.CART_CHECKOUT])
  async prepareCheckout(@Request() req: AuthRequest) {
    const cart = await this.cartService.getCartByUserId(req.user.id);
    return this.cartService.markCartAsPendingCheckout(cart.id);
  }

  // Admin endpoints

  @Get('admin/expired')
  @Auth([Role.ADMIN], [Permission.CART_ADMIN_READ])
  async getExpiredCarts() {
    return this.cartService.findExpiredCarts();
  }

  @Post('admin/cleanup')
  @HttpCode(HttpStatus.OK)
  @Auth([Role.ADMIN], [Permission.CART_ADMIN_CLEANUP])
  async cleanupExpiredCarts() {
    return this.cartService.cleanupExpiredCarts();
  }

  @Get('supplier/activity')
  @Auth([Role.SUPPLIER])
  async getSupplierCartActivity(@Request() req: AuthRequest) {
    // Returns statistics: how many products from the supplier are in active carts
    return this.cartService.getSupplierCartStats(req.user.id);
  }
}