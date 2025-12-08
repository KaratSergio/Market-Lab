import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { AuthJwtGuard } from '@auth/guard/auth-jwt.guard';
import { CartService } from '@domain/cart/cart.service';
import type { AddItemToCartDto, UpdateCartItemDto, ApplyDiscountDto, } from '@domain/cart/types';


@Controller('cart')
@UseGuards(AuthJwtGuard)
export class CartController {
  constructor(private readonly cartService: CartService) { }

  @Get()
  async getCart(@Req() req: { user: { id: string } }) {
    const userId = req.user.id;
    return this.cartService.getOrCreateCart(userId);
  }

  @Post('items')
  async addItem(
    @Req() req: { user: { id: string } },
    @Body() addItemDto: AddItemToCartDto
  ) {
    const userId = req.user.id;
    return this.cartService.addItemToCart(userId, addItemDto);
  }

  @Put('items/:productId')
  async updateItem(
    @Req() req: { user: { id: string } },
    @Param('productId') productId: string,
    @Body() updateDto: UpdateCartItemDto,
  ) {
    const cart = await this.cartService.getCartByUserId(req.user.id);
    return this.cartService.updateItemQuantity(cart.id, productId, updateDto);
  }

  @Delete('items/:productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItem(
    @Req() req: { user: { id: string } },
    @Param('productId') productId: string,
  ) {
    const cart = await this.cartService.getCartByUserId(req.user.id);
    return this.cartService.removeItemFromCart(cart.id, productId);
  }

  @Post('apply-discount')
  async applyDiscount(
    @Req() req: { user: { id: string } },
    @Body() discountDto: ApplyDiscountDto,
  ) {
    const cart = await this.cartService.getCartByUserId(req.user.id);
    return this.cartService.applyDiscount(cart.id, discountDto);
  }

  @Post('clear')
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearCart(@Req() req: { user: { id: string } }) {
    const cart = await this.cartService.getCartByUserId(req.user.id);
    return this.cartService.clearCart(cart.id);
  }

  @Post('checkout')
  async prepareCheckout(@Req() req: { user: { id: string } }) {
    const cart = await this.cartService.getCartByUserId(req.user.id);
    return this.cartService.markCartAsPendingCheckout(cart.id);
  }

  // Admin endpoints
  @Get('admin/expired')
  async getExpiredCarts() {
    return this.cartService.findExpiredCarts();
  }

  @Post('admin/cleanup')
  @HttpCode(HttpStatus.OK)
  async cleanupExpiredCarts() {
    return this.cartService.cleanupExpiredCarts();
  }
}