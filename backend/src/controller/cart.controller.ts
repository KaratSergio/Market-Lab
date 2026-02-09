import {
  Controller,
  Get, Post, Put, Delete,
  Body, Param, HttpCode, HttpStatus,
  Request, ClassSerializerInterceptor,
  UseInterceptors as UseCustomInterceptors,
} from '@nestjs/common';

import {
  ApiTags, ApiOperation,
  ApiBearerAuth, ApiBody, ApiParam,
  ApiOkResponse, ApiNotFoundResponse,
  ApiForbiddenResponse, ApiBadRequestResponse,
  ApiCreatedResponse, ApiNoContentResponse,
} from '@nestjs/swagger';

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

// Swagger DTOs
import {
  AddItemToCartDtoSwagger,
  UpdateCartItemDtoSwagger,
  ApplyDiscountDtoSwagger,
  CartResponseDtoSwagger,
  CartCheckoutResponseDtoSwagger,
  ExpiredCartsResponseDtoSwagger,
  SupplierCartStatsResponseDtoSwagger,
  SuccessResponseCartDtoSwagger
} from '@domain/cart/types/cart.swagger.dto';

@ApiTags('cart')
@ApiBearerAuth('JWT-auth')
@Controller('cart')
@UseCustomInterceptors(ClassSerializerInterceptor)
export class CartController {
  constructor(private readonly cartService: CartService) { }

  /**
   * GET CART (Customer Only)
   * @description Retrieves the current shopping cart for authenticated customer.
   * Includes all items, pricing, discounts, and totals.
   */
  @Get()
  @CustomerOnly()
  @ApiOperation({
    summary: 'Get cart (Customer Only)',
    description: 'Retrieves the current shopping cart for authenticated customer. Includes all items, pricing, discounts, and totals.'
  })
  @ApiOkResponse({
    description: 'Cart retrieved successfully',
    type: CartResponseDtoSwagger,
  })
  @ApiNotFoundResponse({ description: 'Cart not found for this user' })
  @ApiForbiddenResponse({ description: 'User is not a customer' })
  async getCart(@Request() req: AuthRequest) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.cartService.getOrCreateCart(userId, 'USD', userRoles);
  }

  /**
   * ADD ITEM TO CART (Customer Only)
   * @description Adds a product item to the shopping cart with specified quantity.
   * Validates stock availability and product status.
   */
  @Post('items')
  @Auth([Role.CUSTOMER], [Permission.CART_ADD_ITEM])
  @ApiOperation({
    summary: 'Add item to cart (Customer Only)',
    description: 'Adds a product item to the shopping cart with specified quantity. Validates stock availability and product status.'
  })
  @ApiBody({ type: AddItemToCartDtoSwagger })
  @ApiCreatedResponse({
    description: 'Item added to cart successfully',
    type: CartResponseDtoSwagger,
  })
  @ApiBadRequestResponse({ description: 'Invalid item data or insufficient stock' })
  @ApiNotFoundResponse({ description: 'Product not found or not available' })
  async addItem(
    @Request() req: AuthRequest,
    @Body() addItemDto: AddItemToCartDto
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.cartService.addItemToCart(userId, addItemDto, userRoles);
  }

  /**
   * UPDATE CART ITEM QUANTITY (Customer Only)
   * @description Updates the quantity of a specific item in the shopping cart.
   * Validates new quantity against available stock.
   */
  @Put('items/:productId')
  @Auth([Role.CUSTOMER], [Permission.CART_UPDATE_ITEM])
  @ApiOperation({
    summary: 'Update cart item quantity (Customer Only)',
    description: 'Updates the quantity of a specific item in the shopping cart. Validates new quantity against available stock.'
  })
  @ApiParam({
    name: 'productId',
    description: 'Product ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateCartItemDtoSwagger })
  @ApiOkResponse({
    description: 'Cart item updated successfully',
    type: CartResponseDtoSwagger,
  })
  @ApiBadRequestResponse({ description: 'Invalid quantity or insufficient stock' })
  @ApiNotFoundResponse({ description: 'Item not found in cart' })
  async updateItem(
    @Request() req: AuthRequest,
    @Param('productId') productId: string,
    @Body() updateDto: UpdateCartItemDto,
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    const cart = await this.cartService.getCartByUserId(userId, userRoles);
    return this.cartService.updateItemQuantity(
      cart.id,
      productId,
      updateDto,
      userId,
      userRoles
    );
  }

  /**
   * REMOVE ITEM FROM CART (Customer Only)
   * @description Removes a specific item from the shopping cart.
   * Returns updated cart with recalculated totals.
   */
  @Delete('items/:productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth([Role.CUSTOMER], [Permission.CART_REMOVE_ITEM])
  @ApiOperation({
    summary: 'Remove item from cart (Customer Only)',
    description: 'Removes a specific item from the shopping cart. Returns updated cart with recalculated totals.'
  })
  @ApiParam({
    name: 'productId',
    description: 'Product ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiNoContentResponse({ description: 'Item removed from cart successfully', })
  @ApiNotFoundResponse({ description: 'Item not found in cart', })
  async removeItem(
    @Request() req: AuthRequest,
    @Param('productId') productId: string,
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    const cart = await this.cartService.getCartByUserId(userId, userRoles);
    return this.cartService.removeItemFromCart(
      cart.id,
      productId,
      userId,
      userRoles
    );
  }

  /**
   * APPLY DISCOUNT CODE (Customer Only)
   * @description Applies a discount code or coupon to the shopping cart.
   * Validates discount code, expiration, and usage limits.
   */
  @Post('apply-discount')
  @Auth([Role.CUSTOMER], [Permission.CART_APPLY_DISCOUNT])
  @ApiOperation({
    summary: 'Apply discount code (Customer Only)',
    description: 'Applies a discount code or coupon to the shopping cart. Validates discount code, expiration, and usage limits.'
  })
  @ApiBody({ type: ApplyDiscountDtoSwagger })
  @ApiOkResponse({
    description: 'Discount applied successfully',
    type: CartResponseDtoSwagger,
  })
  @ApiBadRequestResponse({
    description: 'Invalid, expired, or already used discount code',
  })
  async applyDiscount(
    @Request() req: AuthRequest,
    @Body() discountDto: ApplyDiscountDto,
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    const cart = await this.cartService.getCartByUserId(userId, userRoles);
    return this.cartService.applyDiscount(
      cart.id,
      discountDto,
      userId,
      userRoles
    );
  }

  /**
   * CLEAR CART (Customer Only)
   * @description Removes all items from the shopping cart.
   * Resets cart to empty state.
   */
  @Post('clear')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth([Role.CUSTOMER], [Permission.CART_CLEAR])
  @ApiOperation({
    summary: 'Clear cart (Customer Only)',
    description: 'Removes all items from the shopping cart. Resets cart to empty state.'
  })
  @ApiNoContentResponse({
    description: 'Cart cleared successfully',
  })
  async clearCart(@Request() req: AuthRequest) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    const cart = await this.cartService.getCartByUserId(userId, userRoles);
    return this.cartService.clearCart(
      cart.id,
      userId,
      userRoles
    );
  }

  /**
   * PREPARE CART FOR CHECKOUT (Customer Only)
   * @description Prepares cart for checkout process.
   * Validates all items, calculates final totals, and reserves stock.
   */
  @Post('checkout')
  @Auth([Role.CUSTOMER], [Permission.CART_CHECKOUT])
  @ApiOperation({
    summary: 'Prepare cart for checkout (Customer Only)',
    description: 'Prepares cart for checkout process. Validates all items, calculates final totals, and reserves stock.'
  })
  @ApiOkResponse({
    description: 'Cart ready for checkout',
    type: CartCheckoutResponseDtoSwagger,
  })
  @ApiBadRequestResponse({
    description: 'Cart validation failed (e.g., out of stock items)',
  })
  async prepareCheckout(@Request() req: AuthRequest) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    const cart = await this.cartService.getCartByUserId(userId, userRoles);
    return this.cartService.markCartAsPendingCheckout(
      cart.id,
      userId,
      userRoles
    );
  }

  // ================= ADMIN ENDPOINTS =================

  /**
   * GET EXPIRED CARTS (Admin Only)
   * @description Retrieves list of carts that have expired (abandoned).
   * Admin-only endpoint for monitoring abandoned carts.
   */
  @Get('admin/expired')
  @Auth([Role.ADMIN], [Permission.CART_ADMIN_READ])
  @ApiOperation({
    summary: 'Get expired carts (Admin Only)',
    description: 'Retrieves list of carts that have expired (abandoned). Admin-only endpoint for monitoring abandoned carts.'
  })
  @ApiOkResponse({
    description: 'Expired carts retrieved successfully',
    type: ExpiredCartsResponseDtoSwagger,
  })
  @ApiForbiddenResponse({
    description: 'User lacks admin permissions',
  })
  async getExpiredCarts(@Request() req: AuthRequest) {
    return this.cartService.findExpiredCarts(
      req.user.id,
      req.user.roles
    );
  }

  /**
   * CLEANUP EXPIRED CARTS (Admin Only)
   * @description Removes expired carts from the system.
   * Admin-only endpoint for system maintenance.
   */
  @Post('admin/cleanup')
  @HttpCode(HttpStatus.OK)
  @Auth([Role.ADMIN], [Permission.CART_ADMIN_CLEANUP])
  @ApiOperation({
    summary: 'Cleanup expired carts (Admin Only)',
    description: 'Removes expired carts from the system. Admin-only endpoint for system maintenance.'
  })
  @ApiOkResponse({
    description: 'Expired carts cleaned up successfully',
    type: SuccessResponseCartDtoSwagger,
  })
  async cleanupExpiredCarts(@Request() req: AuthRequest) {
    return this.cartService.cleanupExpiredCarts(
      req.user.id,
      req.user.roles
    );
  }

  // ================= SUPPLIER ENDPOINTS =================

  /**
   * GET SUPPLIER CART ACTIVITY (Supplier Only)
   * @description Retrieves statistics about supplier's products in active carts.
   * Shows how many of supplier's products are currently in customers' carts.
   */
  @Get('supplier/activity')
  @Auth([Role.SUPPLIER])
  @ApiOperation({
    summary: 'Get supplier cart activity (Supplier Only)',
    description: 'Retrieves statistics about supplier\'s products in active carts. Shows how many of supplier\'s products are currently in customers\' carts.'
  })
  @ApiOkResponse({
    description: 'Supplier cart statistics retrieved successfully',
    type: SupplierCartStatsResponseDtoSwagger,
  })
  @ApiForbiddenResponse({
    description: 'User is not a supplier',
  })
  async getSupplierCartActivity(@Request() req: AuthRequest) {
    return this.cartService.getSupplierCartStats(
      req.user.id,
      req.user.id,
      req.user.roles
    );
  }
}