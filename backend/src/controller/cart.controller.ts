import {
  Controller,
  Get, Post, Put, Delete, Res, Req,
  Body, Param, HttpCode, HttpStatus,
  Request, ClassSerializerInterceptor,
  UseInterceptors as UseCustomInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';

import {
  ApiTags, ApiOperation,
  ApiBearerAuth, ApiBody, ApiParam,
  ApiOkResponse, ApiNotFoundResponse,
  ApiForbiddenResponse, ApiBadRequestResponse,
  ApiCreatedResponse, ApiNoContentResponse,
  ApiUnauthorizedResponse, ApiCookieAuth,
} from '@nestjs/swagger';

import type {
  AddItemToCartDto,
  UpdateCartItemDto,
  ApplyDiscountDto
} from '@domain/cart/types';

import { Auth, Public, CustomerOnly } from '../auth/decorators';
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
@Controller('cart')
@UseCustomInterceptors(ClassSerializerInterceptor)
export class CartController {
  constructor(private readonly cartService: CartService) { }

  /**
   * GET SESSION ID FROM REQUEST
   * Helper method to extract sessionId from cookies or headers
   */
  private getSessionId(req: any): string | undefined {
    return req.cookies?.['sessionId'] || req.headers?.['x-session-id'];
  }

  /**
   * SET SESSION ID COOKIE
   * Helper method to set sessionId cookie for guests
   */
  private setSessionIdCookie(res: Response, sessionId: string): void {
    res.cookie('sessionId', sessionId, {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }

  /**
   * GET CART (Public - Guest or Customer)
   */
  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get cart (Public - Guest or Customer)',
    description: 'Retrieves the current shopping cart. Works for both guests and authenticated customers.'
  })
  @ApiCookieAuth('sessionId')
  @ApiOkResponse({
    description: 'Cart retrieved successfully',
    type: CartResponseDtoSwagger,
  })
  @ApiNotFoundResponse({ description: 'Cart not found' })
  async getCart(
    @Req() req: AuthRequest & { cookies: any },
    @Res({ passthrough: true }) res: Response
  ) {
    const userId = req.user?.id;
    const userRoles = req.user?.roles;
    const sessionId = this.getSessionId(req);

    const identifier = {
      userId,
      sessionId: sessionId
    };

    const cart = await this.cartService.getOrCreateCart(identifier, 'USD', userRoles);

    // If guest and no sessionId yet, create and set it
    if (!userId && !sessionId && cart.sessionId) {
      this.setSessionIdCookie(res, cart.sessionId);
    }

    return cart;
  }

  /**
   * ADD ITEM TO CART (Public - Guest or Customer)
   */
  @Post('items')
  @Public()
  @ApiOperation({
    summary: 'Add item to cart (Public - Guest or Customer)',
    description: 'Adds a product to the shopping cart. Works for both guests and authenticated customers.'
  })
  @ApiCookieAuth('sessionId')
  @ApiBody({ type: AddItemToCartDtoSwagger })
  @ApiCreatedResponse({
    description: 'Item added to cart successfully',
    type: CartResponseDtoSwagger,
  })
  @ApiBadRequestResponse({ description: 'Invalid item data or insufficient stock' })
  @ApiNotFoundResponse({ description: 'Product not found or not available' })
  async addItem(
    @Req() req: AuthRequest & { cookies: any },
    @Res({ passthrough: true }) res: Response,
    @Body() addItemDto: AddItemToCartDto
  ) {
    const userId = req.user?.id;
    const userRoles = req.user?.roles;
    const sessionId = this.getSessionId(req);

    const identifier = {
      userId,
      sessionId: sessionId
    };

    const cart = await this.cartService.addItemToCart(identifier, addItemDto, userRoles);

    // If guest and no sessionId yet, create and set it
    if (!userId && !sessionId && cart.sessionId) {
      this.setSessionIdCookie(res, cart.sessionId);
    }

    return cart;
  }

  /**
   * UPDATE CART ITEM QUANTITY (Public - Guest or Customer)
   */
  @Put('items/:productId')
  @Public()
  @ApiOperation({
    summary: 'Update cart item quantity (Public - Guest or Customer)',
    description: 'Updates quantity of a specific item in the cart. Works for both guests and authenticated customers.'
  })
  @ApiCookieAuth('sessionId')
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
    @Req() req: AuthRequest & { cookies: any },
    @Param('productId') productId: string,
    @Body() updateDto: UpdateCartItemDto,
  ) {
    const userId = req.user?.id;
    const userRoles = req.user?.roles;
    const sessionId = this.getSessionId(req);

    const identifier = {
      userId,
      sessionId: sessionId
    };

    // Get or create cart to get cartId
    const cart = await this.cartService.getOrCreateCart(identifier, 'USD', userRoles);

    return this.cartService.updateItemQuantity(
      cart.id,
      productId,
      updateDto,
      identifier,
      userRoles
    );
  }

  /**
   * REMOVE ITEM FROM CART (Public - Guest or Customer)
   */
  @Delete('items/:productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Public()
  @ApiOperation({
    summary: 'Remove item from cart (Public - Guest or Customer)',
    description: 'Removes a specific item from the cart. Works for both guests and authenticated customers.'
  })
  @ApiCookieAuth('sessionId')
  @ApiParam({
    name: 'productId',
    description: 'Product ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiNoContentResponse({ description: 'Item removed from cart successfully' })
  @ApiNotFoundResponse({ description: 'Item not found in cart' })
  async removeItem(
    @Req() req: AuthRequest & { cookies: any },
    @Param('productId') productId: string,
  ) {
    const userId = req.user?.id;
    const userRoles = req.user?.roles;
    const sessionId = this.getSessionId(req);

    const identifier = {
      userId,
      sessionId: sessionId
    };

    // Get or create cart to get cartId
    const cart = await this.cartService.getOrCreateCart(identifier, 'USD', userRoles);

    return this.cartService.removeItemFromCart(
      cart.id,
      productId,
      identifier,
      userRoles
    );
  }

  /**
   * APPLY DISCOUNT CODE (Public - Guest or Customer)
   */
  @Post('apply-discount')
  @Public()
  @ApiOperation({
    summary: 'Apply discount code (Public - Guest or Customer)',
    description: 'Applies a discount code to the cart. Works for both guests and authenticated customers.'
  })
  @ApiCookieAuth('sessionId')
  @ApiBody({ type: ApplyDiscountDtoSwagger })
  @ApiOkResponse({
    description: 'Discount applied successfully',
    type: CartResponseDtoSwagger,
  })
  @ApiBadRequestResponse({
    description: 'Invalid, expired, or already used discount code',
  })
  async applyDiscount(
    @Req() req: AuthRequest & { cookies: any },
    @Body() discountDto: ApplyDiscountDto,
  ) {
    const userId = req.user?.id;
    const userRoles = req.user?.roles;
    const sessionId = this.getSessionId(req);

    const identifier = {
      userId,
      sessionId: sessionId
    };

    // Get or create cart to get cartId
    const cart = await this.cartService.getOrCreateCart(identifier, 'USD', userRoles);

    return this.cartService.applyDiscount(
      cart.id,
      discountDto,
      identifier,
      userRoles
    );
  }

  /**
   * CLEAR CART (Public - Guest or Customer)
   */
  @Post('clear')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Public()
  @ApiOperation({
    summary: 'Clear cart (Public - Guest or Customer)',
    description: 'Removes all items from the cart. Works for both guests and authenticated customers.'
  })
  @ApiCookieAuth('sessionId')
  @ApiNoContentResponse({
    description: 'Cart cleared successfully',
  })
  async clearCart(
    @Req() req: AuthRequest & { cookies: any },
  ) {
    const userId = req.user?.id;
    const userRoles = req.user?.roles;
    const sessionId = this.getSessionId(req);

    const identifier = {
      userId,
      sessionId: sessionId
    };

    // Get or create cart to get cartId
    const cart = await this.cartService.getOrCreateCart(identifier, 'USD', userRoles);

    return this.cartService.clearCart(
      cart.id,
      identifier,
      userRoles
    );
  }

  /**
   * MERGE GUEST CART WITH USER CART (Customer Only)
   */
  @Post('merge')
  @CustomerOnly()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Merge guest cart with user cart (Customer Only)',
    description: 'Merges the current guest cart with the user\'s cart after login.'
  })
  @ApiOkResponse({
    description: 'Carts merged successfully',
    type: CartResponseDtoSwagger,
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  async mergeCart(
    @Req() req: AuthRequest & { cookies: any },
    @Res({ passthrough: true }) res: Response
  ) {
    const userId = req.user.id;
    const sessionId = this.getSessionId(req);
    const userRoles = req.user.roles;

    if (sessionId) {
      const cart = await this.cartService.mergeGuestCartWithUser(userId, sessionId);

      // Clear sessionId after successful merge
      res.clearCookie('sessionId');

      return cart;
    }

    // If no guest cart, just return user cart
    const identifier = { userId };
    return this.cartService.getCartByUserId(identifier, userRoles);
  }

  /**
   * PREPARE CART FOR CHECKOUT (Customer Only)
   */
  @Post('checkout')
  @CustomerOnly()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Prepare cart for checkout (Customer Only)',
    description: 'Prepares cart for checkout process. Requires authentication for order creation.'
  })
  @ApiOkResponse({
    description: 'Cart ready for checkout',
    type: CartCheckoutResponseDtoSwagger,
  })
  @ApiBadRequestResponse({
    description: 'Cart validation failed (e.g., out of stock items)',
  })
  @ApiUnauthorizedResponse({ description: 'User not authenticated' })
  async prepareCheckout(@Request() req: AuthRequest) {
    const userId = req.user.id;
    const userRoles = req.user.roles;

    const identifier = { userId };
    const cart = await this.cartService.getCartByUserId(identifier, userRoles);

    return this.cartService.markCartAsPendingCheckout(
      cart.id,
      identifier,
      userRoles
    );
  }

  // ================= ADMIN ENDPOINTS =================

  /**
   * GET EXPIRED CARTS (Admin Only)
   */
  @Get('admin/expired')
  @Auth([Role.ADMIN], [Permission.CART_ADMIN_READ])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get expired carts (Admin Only)',
    description: 'Retrieves list of carts that have expired (abandoned). Admin-only endpoint.'
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
   */
  @Post('admin/cleanup')
  @HttpCode(HttpStatus.OK)
  @Auth([Role.ADMIN], [Permission.CART_ADMIN_CLEANUP])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Cleanup expired carts (Admin Only)',
    description: 'Removes expired carts from the system. Admin-only endpoint.'
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
   */
  @Get('supplier/activity')
  @Auth([Role.SUPPLIER])
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get supplier cart activity (Supplier Only)',
    description: 'Retrieves statistics about supplier\'s products in active carts.'
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
      req.user.id,  // supplierId
      req.user.id,  // userId
      req.user.roles
    );
  }
}