import {
  Controller,
  Get, Post, Put,
  Body, Param,
  Request, ParseUUIDPipe
} from '@nestjs/common';

import type {
  CreateOrderDto,
  UpdateOrderStatusDto
} from '@domain/order/types';

import {
  Auth,
  CustomerOnly,
  SupplierOrAdmin
} from '../auth/decorators';

import { OrderService } from '@domain/order/order.service';
import type { CartItemModel } from '@domain/cart/types';
import type { AuthRequest } from '../auth/types';
import { Role, Permission } from '@shared/types';


@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  // Get user's own orders
  @Get()
  @CustomerOnly()
  async getUserOrders(@Request() req: AuthRequest) {
    const userId = req.user.id;
    return this.orderService.getUserOrders(userId);
  }

  // Get specific order (customer can only see their own)
  @Get(':id')
  @Auth([Role.CUSTOMER], [Permission.ORDER_READ])
  async getOrderById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.orderService.getOrderById(id, userId, userRoles);
  }

  // Get order by order number
  @Get('number/:orderNumber')
  @Auth([Role.CUSTOMER], [Permission.ORDER_READ])
  async getOrderByNumber(
    @Param('orderNumber') orderNumber: string,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.orderService.getOrderByNumber(orderNumber, userId, userRoles);
  }

  // Create new order from cart
  @Post()
  @CustomerOnly()
  async createOrder(
    @Request() req: AuthRequest,
    @Body() createOrderDto: CreateOrderDto
  ) {
    const userId = req.user.id;

    // In real implementation, get cart items from cart service
    // For now, using placeholder data as in original code
    const cartItems: CartItemModel[] = [];
    const totals = {
      subtotal: 100,
      shippingFee: 5,
      taxAmount: 10,
      discountAmount: 0,
      totalAmount: 115
    };

    return this.orderService.createOrder(
      { ...createOrderDto, userId },
      cartItems,
      totals
    );
  }

  // Cancel own order
  @Put(':id/cancel')
  @Auth([Role.CUSTOMER], [Permission.ORDER_UPDATE])
  async cancelOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthRequest,
    @Body('reason') reason?: string
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.orderService.cancelOrder(id, reason, userId, userRoles);
  }

  // Request refund for own order
  @Post(':id/refund')
  @Auth([Role.CUSTOMER], [Permission.ORDER_UPDATE])
  async initiateRefund(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthRequest,
    @Body('reason') reason?: string
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.orderService.initiateRefund(id, reason, userId, userRoles);
  }

  // Get orders containing supplier's products
  @Get('supplier/my')
  @Auth([Role.SUPPLIER], [Permission.ORDER_READ_ALL])
  async getSupplierOrders(@Request() req: AuthRequest) {
    const supplierId = req.user.id;
    const userRoles = req.user.roles;
    return this.orderService.getSupplierOrders(supplierId, req.user.id, userRoles);
  }

  // Get order statistics
  @Get('admin/stats')
  @Auth([Role.ADMIN], [Permission.ORDER_STATS_READ])
  async getOrderStats() {
    return this.orderService.getOrderStats();
  }

  // Get all pending orders
  @Get('admin/pending')
  @Auth([Role.ADMIN, Role.SUPPLIER], [Permission.ORDER_READ_ALL])
  async getPendingOrders(@Request() req: AuthRequest) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.orderService.findPendingOrders(userId, userRoles);
  }

  // Get all unpaid orders
  @Get('admin/unpaid')
  @Auth([Role.ADMIN], [Permission.ORDER_READ_ALL])
  async getUnpaidOrders(@Request() req: AuthRequest) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.orderService.findUnpaidOrders(userId, userRoles);
  }

  // Update order status (admin/supplier)
  @Put('admin/:id/status')
  @SupplierOrAdmin()
  async updateOrderStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.orderService.updateOrderStatus(
      id,
      updateStatusDto,
      userId,
      userRoles
    );
  }

  // Process refund (admin only)
  @Post('admin/:id/process-refund')
  @Auth([Role.ADMIN], [Permission.ORDER_REFUND])
  async processRefund(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthRequest,
    @Body('reason') reason?: string
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.orderService.processRefund(id, reason, userId, userRoles);
  }

  // Get all orders (admin only)
  @Get('admin/all')
  @Auth([Role.ADMIN], [Permission.ORDER_READ_ALL])
  async getAllOrders(@Request() req: AuthRequest) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.orderService.getAllOrders(userId, userRoles);
  }
}