import {
  Controller,
  Get, Post, Body,
  Query, Param,
  UseGuards, Req,
  HttpCode, HttpStatus,
  ForbiddenException,
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
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

import type {
  CreatePaymentDto,
  ProcessPaymentDto,
  RefundPaymentDto
} from '@domain/payment/types';

import { AuthJwtGuard } from '@auth/guard/auth-jwt.guard';
import { PermissionsGuard } from '@auth/guard/permissions.guard';
import { Permissions } from '@auth/decorators';
import { PermissionsService } from '@auth/services/permissions.service';
import { PaymentService } from '@domain/payment/payment.service';
import { Permission } from '@shared/types';

// Swagger DTOs
import {
  CreatePaymentDtoSwagger,
  ProcessPaymentDtoSwagger,
  RefundPaymentDtoSwagger,
  CancelPaymentDtoSwagger,
  PaymentResponseDtoSwagger,
  PaymentsListResponseDtoSwagger,
  PaymentStatsResponseDtoSwagger,
} from '@domain/payment/types/payment.swagger.dto';


@ApiTags('payments')
@ApiBearerAuth('JWT-auth')
@Controller('payments')
@UseGuards(AuthJwtGuard, PermissionsGuard)
@UseCustomInterceptors(ClassSerializerInterceptor)
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly permissionsService: PermissionsService
  ) { }

  /**
   * GET USER PAYMENTS
   * @description Retrieves payment history for authenticated user.
   * Users with PAYMENT_READ_ALL permission can view all payments.
   */
  @Get()
  @Permissions(Permission.PAYMENT_READ)
  @ApiOperation({
    summary: 'Get user payments',
    description: 'Retrieves payment history for authenticated user. Users with PAYMENT_READ_ALL permission can view all payments.'
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by payment status',
    example: 'completed',
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
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
    description: 'Payments retrieved successfully',
    type: PaymentsListResponseDtoSwagger,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User lacks PAYMENT_READ permission',
  })
  async getUserPayments(@Req() req: { user: { id: string; roles: string[]; permissions: string[] } }) {
    const userId = req.user.id;

    // Check if the user can read all payments
    if (this.permissionsService.hasPermission(req.user.permissions as Permission[], Permission.PAYMENT_READ_ALL)) {
      return this.paymentService.getAllPayments();
    }

    return this.paymentService.getUserPayments(userId);
  }

  /**
   * GET PAYMENT BY ID
   * @description Retrieves detailed information about a specific payment.
   * Users can only view their own payments unless they have PAYMENT_READ_ALL permission.
   */
  @Get(':id')
  @Permissions(Permission.PAYMENT_READ)
  @ApiOperation({
    summary: 'Get payment by ID',
    description: 'Retrieves detailed information about a specific payment. Users can only view their own payments unless they have PAYMENT_READ_ALL permission.'
  })
  @ApiParam({
    name: 'id',
    description: 'Payment ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Payment details retrieved successfully',
    type: PaymentResponseDtoSwagger,
  })
  @ApiNotFoundResponse({
    description: 'Payment not found with specified ID',
  })
  @ApiForbiddenResponse({
    description: 'User not authorized to view this payment',
  })
  async getPaymentById(
    @Req() req: { user: { id: string; roles: string[]; permissions: string[] } },
    @Param('id') id: string
  ) {
    const payment = await this.paymentService.getPaymentById(id);

    // Check the user's access to the payment
    if (payment.userId !== req.user.id &&
      !this.permissionsService.hasPermission(req.user.permissions as Permission[], Permission.PAYMENT_READ_ALL)) {
      throw new ForbiddenException('Access denied to this payment');
    }

    return payment;
  }

  /**
   * GET PAYMENT BY ORDER ID
   * @description Retrieves payment information associated with a specific order.
   * Users can only view payments for their own orders unless they have PAYMENT_READ_ALL permission.
   */
  @Get('order/:orderId')
  @Permissions(Permission.PAYMENT_READ)
  @ApiOperation({
    summary: 'Get payment by order ID',
    description: 'Retrieves payment information associated with a specific order. Users can only view payments for their own orders unless they have PAYMENT_READ_ALL permission.'
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @ApiOkResponse({
    description: 'Payment details retrieved successfully',
    type: PaymentResponseDtoSwagger,
  })
  @ApiNotFoundResponse({
    description: 'Payment not found for specified order',
  })
  async getPaymentByOrderId(
    @Req() req: { user: { id: string; roles: string[]; permissions: string[] } },
    @Param('orderId') orderId: string
  ) {
    const payment = await this.paymentService.getPaymentByOrderId(orderId);

    // Check the user's access to the payment
    if (payment.userId !== req.user.id &&
      !this.permissionsService.hasPermission(req.user.permissions as Permission[], Permission.PAYMENT_READ_ALL)) {
      throw new ForbiddenException('Access denied to this payment');
    }

    return payment;
  }

  /**
   * CREATE NEW PAYMENT
   * @description Initiates a new payment for an order.
   * Users can create payments for themselves; users with PAYMENT_MANAGE can create for others.
   */
  @Post()
  @Permissions(Permission.PAYMENT_CREATE)
  @ApiOperation({
    summary: 'Create new payment',
    description: 'Initiates a new payment for an order. Users can create payments for themselves; users with PAYMENT_MANAGE can create for others.'
  })
  @ApiBody({ type: CreatePaymentDtoSwagger })
  @ApiCreatedResponse({
    description: 'Payment created successfully',
    type: PaymentResponseDtoSwagger,
  })
  @ApiBadRequestResponse({
    description: 'Invalid payment data or missing required fields',
  })
  @ApiForbiddenResponse({
    description: 'User not authorized to create payment for specified user',
  })
  async createPayment(
    @Req() req: { user: { id: string; roles: string[]; permissions: string[] } },
    @Body() createPaymentDto: CreatePaymentDto
  ) {
    const userId = req.user.id;

    // Check if the user can create payments for other users
    if (createPaymentDto.userId && createPaymentDto.userId !== userId) {
      if (!this.permissionsService.hasPermission(req.user.permissions as Permission[], Permission.PAYMENT_MANAGE)) {
        throw new ForbiddenException('You can only create payments for yourself');
      }
    }

    return this.paymentService.createPayment({
      ...createPaymentDto,
      userId: createPaymentDto.userId || userId,
    });
  }

  /**
   * PROCESS PAYMENT
   * @description Processes a pending payment with payment gateway details.
   * Users can process their own payments; users with PAYMENT_MANAGE can process any payment.
   */
  @Post(':id/process')
  @Permissions(Permission.PAYMENT_PROCESS)
  @ApiOperation({
    summary: 'Process payment',
    description: 'Processes a pending payment with payment gateway details. Users can process their own payments; users with PAYMENT_MANAGE can process any payment.'
  })
  @ApiParam({
    name: 'id',
    description: 'Payment ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: ProcessPaymentDtoSwagger })
  @ApiOkResponse({
    description: 'Payment processed successfully',
    type: PaymentResponseDtoSwagger,
  })
  @ApiBadRequestResponse({
    description: 'Invalid payment data or payment already processed',
  })
  @ApiForbiddenResponse({
    description: 'User not authorized to process this payment',
  })
  async processPayment(
    @Req() req: { user: { id: string; roles: string[]; permissions: string[] } },
    @Param('id') id: string,
    @Body() processDto: ProcessPaymentDto,
  ) {
    // Check if the user can process this payment
    if (!this.permissionsService.hasPermission(req.user.permissions as Permission[], Permission.PAYMENT_MANAGE)) {
      const payment = await this.paymentService.getPaymentById(id);
      if (payment.userId !== req.user.id) {
        throw new ForbiddenException('You can only process your own payments');
      }
    }

    return this.paymentService.processPayment(id, processDto);
  }

  /**
   * REFUND PAYMENT
   * @description Initiates a refund for a completed payment.
   * Users can refund their own payments; users with PAYMENT_MANAGE can refund any payment.
   */
  @Post(':id/refund')
  @Permissions(Permission.PAYMENT_REFUND)
  @ApiOperation({
    summary: 'Refund payment',
    description: 'Initiates a refund for a completed payment. Users can refund their own payments; users with PAYMENT_MANAGE can refund any payment.'
  })
  @ApiParam({
    name: 'id',
    description: 'Payment ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: RefundPaymentDtoSwagger })
  @ApiOkResponse({
    description: 'Refund initiated successfully',
    type: PaymentResponseDtoSwagger,
  })
  @ApiBadRequestResponse({
    description: 'Payment cannot be refunded or invalid refund amount',
  })
  async refundPayment(
    @Req() req: { user: { id: string; roles: string[]; permissions: string[] } },
    @Param('id') id: string,
    @Body() refundDto: RefundPaymentDto,
  ) {
    // Checking return rights
    if (!this.permissionsService.hasPermission(req.user.permissions as Permission[], Permission.PAYMENT_MANAGE)) {
      const payment = await this.paymentService.getPaymentById(id);
      if (payment.userId !== req.user.id) {
        throw new ForbiddenException('You can only refund your own payments');
      }
    }

    return this.paymentService.refundPayment(id, refundDto);
  }

  /**
   * CANCEL PAYMENT
   * @description Cancels a pending payment.
   * Users can cancel their own payments; users with PAYMENT_MANAGE can cancel any payment.
   */
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.PAYMENT_CANCEL)
  @ApiOperation({
    summary: 'Cancel payment',
    description: 'Cancels a pending payment. Users can cancel their own payments; users with PAYMENT_MANAGE can cancel any payment.'
  })
  @ApiParam({
    name: 'id',
    description: 'Payment ID (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: CancelPaymentDtoSwagger })
  @ApiOkResponse({
    description: 'Payment cancelled successfully',
    type: PaymentResponseDtoSwagger,
  })
  @ApiBadRequestResponse({
    description: 'Payment cannot be cancelled in current status',
  })
  async cancelPayment(
    @Req() req: { user: { id: string; roles: string[]; permissions: string[] } },
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    // Checking cancel rights
    if (!this.permissionsService.hasPermission(req.user.permissions as Permission[], Permission.PAYMENT_MANAGE)) {
      const payment = await this.paymentService.getPaymentById(id);
      if (payment.userId !== req.user.id) {
        throw new ForbiddenException('You can only cancel your own payments');
      }
    }

    return this.paymentService.cancelPayment(id, reason);
  }

  // ================= ADMIN ENDPOINTS =================

  /**
   * GET PENDING PAYMENTS (Admin Only)
   * @description Retrieves all payments with pending status.
   * Admin-only endpoint requiring PAYMENT_ADMIN_ACCESS permission.
   */
  @Get('admin/pending')
  @Permissions(Permission.PAYMENT_ADMIN_ACCESS)
  @ApiOperation({
    summary: 'Get pending payments (Admin Only)',
    description: 'Retrieves all payments with pending status. Admin-only endpoint requiring PAYMENT_ADMIN_ACCESS permission.'
  })
  @ApiOkResponse({
    description: 'Pending payments retrieved successfully',
    type: PaymentsListResponseDtoSwagger,
  })
  @ApiForbiddenResponse({
    description: 'User lacks PAYMENT_ADMIN_ACCESS permission',
  })
  async getPendingPayments() {
    return this.paymentService.getPendingPayments();
  }

  /**
   * GET FAILED PAYMENTS (Admin Only)
   * @description Retrieves all payments with failed status.
   * Admin-only endpoint requiring PAYMENT_ADMIN_ACCESS permission.
   */
  @Get('admin/failed')
  @Permissions(Permission.PAYMENT_ADMIN_ACCESS)
  @ApiOperation({
    summary: 'Get failed payments (Admin Only)',
    description: 'Retrieves all payments with failed status. Admin-only endpoint requiring PAYMENT_ADMIN_ACCESS permission.'
  })
  @ApiOkResponse({
    description: 'Failed payments retrieved successfully',
    type: PaymentsListResponseDtoSwagger,
  })
  async getFailedPayments() {
    return this.paymentService.getFailedPayments();
  }

  /**
   * GET PAYMENT STATISTICS (Admin Only)
   * @description Retrieves comprehensive payment statistics and analytics.
   * Admin-only endpoint requiring PAYMENT_STATS_READ permission.
   */
  @Get('admin/stats')
  @Permissions(Permission.PAYMENT_STATS_READ)
  @ApiOperation({
    summary: 'Get payment statistics (Admin Only)',
    description: 'Retrieves comprehensive payment statistics and analytics. Admin-only endpoint requiring PAYMENT_STATS_READ permission.'
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date for statistics (ISO format)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date for statistics (ISO format)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @ApiOkResponse({
    description: 'Payment statistics retrieved successfully',
    type: PaymentStatsResponseDtoSwagger,
  })
  async getPaymentStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const defaultStartDate = new Date();
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 1); // last 30 days

    const start = startDate ? new Date(startDate) : defaultStartDate;
    const end = endDate ? new Date(endDate) : new Date();

    return this.paymentService.getPaymentStats(start, end);
  }
}