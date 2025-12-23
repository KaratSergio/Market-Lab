import {
  Controller,
  Post, Headers,
  Body, Req,
  HttpCode, HttpStatus,
  UseGuards
} from '@nestjs/common';

import type { Request } from 'express';
import { AuthJwtGuard } from '@auth/guard/auth-jwt.guard';
import { PermissionsGuard } from '@auth/guard/permissions.guard';
import { Permissions } from '@auth/decorators';
import { PaymentService } from '@domain/payment/payment.service';
import { Permission } from '@shared/types';


@Controller('webhook/payment')
export class PaymentWebhookController {
  constructor(private readonly paymentService: PaymentService) { }

  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.PAYMENT_WEBHOOK_STRIPE)
  async handleStripeWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    const event = req.body;

    await this.paymentService.handleWebhook({
      eventType: 'stripe.webhook',
      data: event,
      signature,
      timestamp: Date.now(),
    });

    return { received: true };
  }

  @Post('paypal')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.PAYMENT_WEBHOOK_PAYPAL)
  async handlePaypalWebhook(
    @Req() req: Request,
    @Headers('paypal-transmission-id') transmissionId: string,
  ) {
    const event = req.body;

    await this.paymentService.handleWebhook({
      eventType: 'paypal.webhook',
      data: event,
      signature: transmissionId,
      timestamp: Date.now(),
    });

    return { received: true };
  }

  @Post('simulate-success')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthJwtGuard, PermissionsGuard)
  @Permissions(Permission.PAYMENT_WEBHOOK_SIMULATE)
  async simulateSuccessfulPayment(
    @Body('paymentId') paymentId: string,
    @Body('transactionId') transactionId: string,
  ) {
    return this.paymentService.markPaymentAsPaid(
      paymentId,
      transactionId || `simulated_${Date.now()}`,
      { simulated: true }
    );
  }

  @Post('simulate-failed')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthJwtGuard, PermissionsGuard)
  @Permissions(Permission.PAYMENT_WEBHOOK_SIMULATE)
  async simulateFailedPayment(
    @Body('paymentId') paymentId: string,
    @Body('reason') reason?: string,
  ) {
    return this.paymentService.markPaymentAsFailed(
      paymentId,
      reason || 'Simulated failure',
      { simulated: true }
    );
  }
}