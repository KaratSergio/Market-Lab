import {
  Controller,
  Post, Headers, Body, Req,
  HttpCode, HttpStatus, UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors as UseCustomInterceptors,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { AuthJwtGuard } from '@auth/guard/auth-jwt.guard';
import { PermissionsGuard } from '@auth/guard/permissions.guard';
import { Permissions } from '@auth/decorators';
import { PaymentService } from '@domain/payment/payment.service';
import { Permission } from '@shared/types';

// Swagger DTOs
import {
  StripeWebhookDtoSwagger,
  PaypalWebhookDtoSwagger,
  SimulatePaymentDtoSwagger,
  WebhookResponseDtoSwagger,
  SuccessResponseDtoSwagger,
} from '@domain/payment/types/payment.swagger.dto';


@ApiTags('payment-webhooks')
@Controller('webhook/payment')
@UseCustomInterceptors(ClassSerializerInterceptor)
export class PaymentWebhookController {
  constructor(private readonly paymentService: PaymentService) { }

  /**
   * HANDLE STRIPE WEBHOOK
   * @description Receives and processes Stripe payment webhook events.
   * Validates webhook signature and processes payment status updates.
   */
  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.PAYMENT_WEBHOOK_STRIPE)
  @ApiOperation({
    summary: 'Handle Stripe webhook',
    description: 'Receives and processes Stripe payment webhook events. Validates webhook signature and processes payment status updates.'
  })
  @ApiHeader({
    name: 'stripe-signature',
    description: 'Stripe webhook signature for verification',
    required: true,
    example: 't=123456789,v1=abc123def456',
  })
  @ApiBody({ type: StripeWebhookDtoSwagger })
  @ApiOkResponse({
    description: 'Webhook received and processed successfully',
    type: WebhookResponseDtoSwagger,
  })
  @ApiBadRequestResponse({
    description: 'Invalid webhook signature or malformed event data',
  })
  @ApiForbiddenResponse({
    description: 'Missing or invalid PAYMENT_WEBHOOK_STRIPE permission',
  })
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

  /**
   * HANDLE PAYPAL WEBHOOK
   * @description Receives and processes PayPal payment webhook events.
   * Validates webhook transmission and processes payment status updates.
   */
  @Post('paypal')
  @HttpCode(HttpStatus.OK)
  @Permissions(Permission.PAYMENT_WEBHOOK_PAYPAL)
  @ApiOperation({
    summary: 'Handle PayPal webhook',
    description: 'Receives and processes PayPal payment webhook events. Validates webhook transmission and processes payment status updates.'
  })
  @ApiHeader({
    name: 'paypal-transmission-id',
    description: 'PayPal webhook transmission ID for verification',
    required: true,
    example: 'transmission_123456789',
  })
  @ApiBody({ type: PaypalWebhookDtoSwagger })
  @ApiOkResponse({
    description: 'Webhook received and processed successfully',
    type: WebhookResponseDtoSwagger,
  })
  @ApiBadRequestResponse({
    description: 'Invalid webhook transmission or malformed event data',
  })
  @ApiForbiddenResponse({
    description: 'Missing or invalid PAYMENT_WEBHOOK_PAYPAL permission',
  })
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

  /**
   * SIMULATE SUCCESSFUL PAYMENT (Development Only)
   * @description Simulates a successful payment for testing purposes.
   * Development-only endpoint requiring PAYMENT_WEBHOOK_SIMULATE permission.
   */
  @Post('simulate-success')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthJwtGuard, PermissionsGuard)
  @Permissions(Permission.PAYMENT_WEBHOOK_SIMULATE)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Simulate successful payment (Development Only)',
    description: 'Simulates a successful payment for testing purposes. Development-only endpoint requiring PAYMENT_WEBHOOK_SIMULATE permission.'
  })
  @ApiBody({ type: SimulatePaymentDtoSwagger })
  @ApiOkResponse({
    description: 'Payment simulation successful',
    type: SuccessResponseDtoSwagger,
  })
  @ApiBadRequestResponse({
    description: 'Invalid payment ID or missing required fields',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required for simulation endpoints',
  })
  @ApiForbiddenResponse({
    description: 'Missing PAYMENT_WEBHOOK_SIMULATE permission',
  })
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

  /**
   * SIMULATE FAILED PAYMENT (Development Only)
   * @description Simulates a failed payment for testing purposes.
   * Development-only endpoint requiring PAYMENT_WEBHOOK_SIMULATE permission.
   */
  @Post('simulate-failed')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthJwtGuard, PermissionsGuard)
  @Permissions(Permission.PAYMENT_WEBHOOK_SIMULATE)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Simulate failed payment (Development Only)',
    description: 'Simulates a failed payment for testing purposes. Development-only endpoint requiring PAYMENT_WEBHOOK_SIMULATE permission.'
  })
  @ApiBody({ type: SimulatePaymentDtoSwagger })
  @ApiOkResponse({
    description: 'Payment simulation successful',
    type: SuccessResponseDtoSwagger,
  })
  @ApiBadRequestResponse({
    description: 'Invalid payment ID or missing required fields',
  })
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