import {
  Controller,
  Get, Post, Put,
  Body, Param,
  Request, ParseUUIDPipe,
  ClassSerializerInterceptor,
  UseInterceptors as UseCustomInterceptors,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

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

// Swagger DTOs
import {
  CreateOrderDtoSwagger,
  UpdateOrderStatusDtoSwagger,
  CancelOrderDtoSwagger,
  RefundRequestDtoSwagger,
  OrderResponseDtoSwagger,
  OrdersListResponseDtoSwagger,
  OrderStatisticsResponseDtoSwagger,
  PendingOrdersResponseDtoSwagger,
  OrderDetailsResponseDtoSwagger,
  OrderNumberResponseDtoSwagger,
} from '@domain/order/types/order.swagger.dto';


@ApiTags('orders')
@ApiBearerAuth('JWT-auth')
@Controller('orders')
@UseCustomInterceptors(ClassSerializerInterceptor)
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  // ================= CUSTOMER ENDPOINTS =================

  /**
   * GET USER ORDERS (Customer Only)
   * @description Retrieves all orders for the currently authenticated customer.
   * Supports optional filtering by status and pagination.
   */
  @Get()
  @CustomerOnly()
  @ApiOperation({
    summary: 'Get user orders (Customer Only)',
    description: 'Retrieves all orders for the currently authenticated customer. Supports optional filtering by status and pagination.'
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by order status',
    example: 'processing',
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 10,
  })
  @ApiOkResponse({
    description: 'User orders retrieved successfully',
    type: OrdersListResponseDtoSwagger,
  })
  @ApiForbiddenResponse({
    description: 'User is not a customer',
  })
  async getUserOrders(@Request() req: AuthRequest) {
    const userId = req.user.id;
    return this.orderService.getUserOrders(userId);
  }

  /**
   * GET ORDER BY ID (Customer Only)
   * @description Retrieves detailed information about a specific order by ID.
   * Customers can only view their own orders.
   */
  @Get(':id')
  @Auth([Role.CUSTOMER], [Permission.ORDER_READ])
  @ApiOperation({
    summary: 'Get order by ID (Customer Only)',
    description: 'Retrieves detailed information about a specific order by ID. Customers can only view their own orders.'
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Order details retrieved successfully',
    type: OrderDetailsResponseDtoSwagger,
  })
  @ApiNotFoundResponse({
    description: 'Order not found',
  })
  @ApiForbiddenResponse({
    description: 'User not authorized to view this order',
  })
  async getOrderById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.orderService.getOrderById(id, userId, userRoles);
  }

  /**
   * GET ORDER BY ORDER NUMBER (Customer Only)
   * @description Retrieves order information using the unique order number.
   * Customers can only view their own orders.
   */
  @Get('number/:orderNumber')
  @Auth([Role.CUSTOMER], [Permission.ORDER_READ])
  @ApiOperation({
    summary: 'Get order by order number (Customer Only)',
    description: 'Retrieves order information using the unique order number. Customers can only view their own orders.'
  })
  @ApiParam({
    name: 'orderNumber',
    description: 'Unique order number',
    example: 'ORD-2024-001234',
  })
  @ApiOkResponse({
    description: 'Order details retrieved successfully',
    type: OrderNumberResponseDtoSwagger,
  })
  @ApiNotFoundResponse({
    description: 'Order not found with specified order number',
  })
  async getOrderByNumber(
    @Param('orderNumber') orderNumber: string,
    @Request() req: AuthRequest
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.orderService.getOrderByNumber(orderNumber, userId, userRoles);
  }

  /**
   * CREATE NEW ORDER (Customer Only)
   * @description Creates a new order from the customer's cart items.
   * Validates cart items, processes payment, and creates order record.
   */
  @Post()
  @CustomerOnly()
  @ApiOperation({
    summary: 'Create new order (Customer Only)',
    description: 'Creates a new order from the customer\'s cart items. Validates cart items, processes payment, and creates order record.'
  })
  @ApiBody({ type: CreateOrderDtoSwagger })
  @ApiCreatedResponse({
    description: 'Order created successfully',
    type: OrderResponseDtoSwagger,
  })
  @ApiBadRequestResponse({
    description: 'Invalid order data or empty cart',
  })
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

  /**
   * CANCEL ORDER (Customer Only)
   * @description Cancels an existing order that belongs to the customer.
   * Only orders in certain statuses can be cancelled by customers.
   */
  @Put(':id/cancel')
  @Auth([Role.CUSTOMER], [Permission.ORDER_UPDATE])
  @ApiOperation({
    summary: 'Cancel order (Customer Only)',
    description: 'Cancels an existing order that belongs to the customer. Only orders in certain statuses can be cancelled by customers.'
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: CancelOrderDtoSwagger })
  @ApiOkResponse({
    description: 'Order cancelled successfully',
    type: OrderResponseDtoSwagger,
  })
  @ApiBadRequestResponse({
    description: 'Order cannot be cancelled in current status',
  })
  @ApiForbiddenResponse({
    description: 'User not authorized to cancel this order',
  })
  async cancelOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthRequest,
    @Body('reason') reason?: string
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.orderService.cancelOrder(id, reason, userId, userRoles);
  }

  /**
   * REQUEST REFUND (Customer Only)
   * @description Initiates a refund request for an order.
   * Customers can request refunds for eligible orders within specified time limits.
   */
  @Post(':id/refund')
  @Auth([Role.CUSTOMER], [Permission.ORDER_UPDATE])
  @ApiOperation({
    summary: 'Request refund (Customer Only)',
    description: 'Initiates a refund request for an order. Customers can request refunds for eligible orders within specified time limits.'
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: RefundRequestDtoSwagger })
  @ApiCreatedResponse({
    description: 'Refund request initiated successfully',
    type: OrderResponseDtoSwagger,
  })
  @ApiBadRequestResponse({
    description: 'Order not eligible for refund',
  })
  async initiateRefund(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthRequest,
    @Body('reason') reason?: string
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.orderService.initiateRefund(id, reason, userId, userRoles);
  }

  // ================= SUPPLIER ENDPOINTS =================

  /**
   * GET SUPPLIER ORDERS (Supplier Only)
   * @description Retrieves all orders containing products from the authenticated supplier.
   * Includes order items, customer details, and order status.
   */
  @Get('supplier/my')
  @Auth([Role.SUPPLIER], [Permission.ORDER_READ_ALL])
  @ApiOperation({
    summary: 'Get supplier orders (Supplier Only)',
    description: 'Retrieves all orders containing products from the authenticated supplier. Includes order items, customer details, and order status.'
  })
  @ApiOkResponse({
    description: 'Supplier orders retrieved successfully',
    type: OrdersListResponseDtoSwagger,
  })
  @ApiForbiddenResponse({
    description: 'User is not a supplier or lacks permissions',
  })
  async getSupplierOrders(@Request() req: AuthRequest) {
    const supplierId = req.user.id;
    const userRoles = req.user.roles;
    return this.orderService.getSupplierOrders(supplierId, req.user.id, userRoles);
  }

  // ================= ADMIN ENDPOINTS =================

  /**
   * GET ORDER STATISTICS (Admin Only)
   * @description Retrieves comprehensive order statistics and analytics.
   * Includes revenue, order volume, customer metrics, and trend analysis.
   */
  @Get('admin/stats')
  @Auth([Role.ADMIN], [Permission.ORDER_STATS_READ])
  @ApiOperation({
    summary: 'Get order statistics (Admin Only)',
    description: 'Retrieves comprehensive order statistics and analytics. Includes revenue, order volume, customer metrics, and trend analysis.'
  })
  @ApiOkResponse({
    description: 'Order statistics retrieved successfully',
    type: OrderStatisticsResponseDtoSwagger,
  })
  @ApiForbiddenResponse({
    description: 'User lacks admin permissions',
  })
  async getOrderStats() {
    return this.orderService.getOrderStats();
  }

  /**
   * GET PENDING ORDERS (Admin/Supplier)
   * @description Retrieves all orders with pending status requiring attention.
   * Admin and suppliers can view pending orders for their respective products.
   */
  @Get('admin/pending')
  @Auth([Role.ADMIN, Role.SUPPLIER], [Permission.ORDER_READ_ALL])
  @ApiOperation({
    summary: 'Get pending orders (Admin/Supplier)',
    description: 'Retrieves all orders with pending status requiring attention. Admin and suppliers can view pending orders for their respective products.'
  })
  @ApiOkResponse({
    description: 'Pending orders retrieved successfully',
    type: PendingOrdersResponseDtoSwagger,
  })
  async getPendingOrders(@Request() req: AuthRequest) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.orderService.findPendingOrders(userId, userRoles);
  }

  /**
   * GET UNPAID ORDERS (Admin Only)
   * @description Retrieves all orders with unpaid payment status.
   * Admin-only endpoint for managing payment collections.
   */
  @Get('admin/unpaid')
  @Auth([Role.ADMIN], [Permission.ORDER_READ_ALL])
  @ApiOperation({
    summary: 'Get unpaid orders (Admin Only)',
    description: 'Retrieves all orders with unpaid payment status. Admin-only endpoint for managing payment collections.'
  })
  @ApiOkResponse({
    description: 'Unpaid orders retrieved successfully',
    type: OrdersListResponseDtoSwagger,
  })
  async getUnpaidOrders(@Request() req: AuthRequest) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.orderService.findUnpaidOrders(userId, userRoles);
  }

  /**
   * GET ALL ORDERS (Admin Only)
   * @description Retrieves all orders in the system with full details.
   * Admin-only endpoint with full access to all order data.
   */
  @Get('admin/all')
  @Auth([Role.ADMIN], [Permission.ORDER_READ_ALL])
  @ApiOperation({
    summary: 'Get all orders (Admin Only)',
    description: 'Retrieves all orders in the system with full details. Admin-only endpoint with full access to all order data.'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 50,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by order status',
    example: 'processing',
  })
  @ApiOkResponse({
    description: 'All orders retrieved successfully',
    type: OrdersListResponseDtoSwagger,
  })
  async getAllOrders(@Request() req: AuthRequest) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.orderService.getAllOrders(userId, userRoles);
  }

  /**
   * UPDATE ORDER STATUS (Admin/Supplier)
   * @description Updates the status of an order (processing, shipped, delivered, etc.).
   * Admin can update any order, suppliers can update status for their own products.
   */
  @Put('admin/:id/status')
  @SupplierOrAdmin()
  @ApiOperation({
    summary: 'Update order status (Admin/Supplier)',
    description: 'Updates the status of an order (processing, shipped, delivered, etc.). Admin can update any order, suppliers can update status for their own products.'
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateOrderStatusDtoSwagger })
  @ApiOkResponse({
    description: 'Order status updated successfully',
    type: OrderResponseDtoSwagger,
  })
  @ApiBadRequestResponse({
    description: 'Invalid status transition',
  })
  @ApiForbiddenResponse({
    description: 'User not authorized to update this order status',
  })
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

  /**
   * PROCESS REFUND (Admin Only)
   * @description Processes a refund request and issues refund to customer.
   * Admin-only endpoint for finalizing refund transactions.
   */
  @Post('admin/:id/process-refund')
  @Auth([Role.ADMIN], [Permission.ORDER_REFUND])
  @ApiOperation({
    summary: 'Process refund (Admin Only)',
    description: 'Processes a refund request and issues refund to customer. Admin-only endpoint for finalizing refund transactions.'
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: RefundRequestDtoSwagger })
  @ApiOkResponse({
    description: 'Refund processed successfully',
    type: OrderResponseDtoSwagger,
  })
  @ApiBadRequestResponse({
    description: 'Refund cannot be processed',
  })
  @ApiForbiddenResponse({
    description: 'User lacks permission to process refunds',
  })
  async processRefund(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthRequest,
    @Body('reason') reason?: string
  ) {
    const userId = req.user.id;
    const userRoles = req.user.roles;
    return this.orderService.processRefund(id, reason, userId, userRoles);
  }
}