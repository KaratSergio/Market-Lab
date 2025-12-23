import {
  Controller,
  Get, Post, Body,
  Param, UseGuards, Req,
  HttpCode, HttpStatus,
  ForbiddenException,
} from '@nestjs/common';

import type {
  CreatePaymentDto,
  ProcessPaymentDto,
  RefundPaymentDto
} from '@domain/payment/types';

import { AuthJwtGuard } from '@auth/guard/auth-jwt.guard';
import { PermissionsGuard } from '@auth/guard/permissions.guard';
import { Permissions } from '@auth/decorators';
import { PermissionsService } from '@auth/permissions/permissions.service';
import { PaymentService } from '@domain/payment/payment.service';
import { Permission } from '@shared/types';


@Controller('payments')
@UseGuards(AuthJwtGuard, PermissionsGuard)
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly permissionsService: PermissionsService
  ) { }

  @Get()
  @Permissions(Permission.PAYMENT_READ)
  async getUserPayments(@Req() req: { user: { id: string; roles: string[]; permissions: string[] } }) {
    const userId = req.user.id;

    // Check if the user can read all payments
    if (this.permissionsService.hasPermission(req.user.permissions as Permission[], Permission.PAYMENT_READ_ALL)) {
      return this.paymentService.getAllPayments();
    }

    return this.paymentService.getUserPayments(userId);
  }

  @Get(':id')
  @Permissions(Permission.PAYMENT_READ)
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

  @Get('order/:orderId')
  @Permissions(Permission.PAYMENT_READ)
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

  @Post()
  @Permissions(Permission.PAYMENT_CREATE)
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

  @Post(':id/process')
  @Permissions(Permission.PAYMENT_PROCESS)
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

  @Post(':id/refund')
  @Permissions(Permission.PAYMENT_REFUND)
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

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.PAYMENT_CANCEL)
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

  // Admin endpoints
  @Get('admin/pending')
  @Permissions(Permission.PAYMENT_ADMIN_ACCESS)
  async getPendingPayments() {
    return this.paymentService.getPendingPayments();
  }

  @Get('admin/failed')
  @Permissions(Permission.PAYMENT_ADMIN_ACCESS)
  async getFailedPayments() {
    return this.paymentService.getFailedPayments();
  }

  @Get('admin/stats')
  @Permissions(Permission.PAYMENT_STATS_READ)
  async getPaymentStats(
    @Body('startDate') startDate: string,
    @Body('endDate') endDate: string,
  ) {
    return this.paymentService.getPaymentStats(
      new Date(startDate),
      new Date(endDate)
    );
  }
}