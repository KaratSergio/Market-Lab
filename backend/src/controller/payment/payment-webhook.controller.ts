import { Controller, Post, Headers, Body, Req, HttpCode, HttpStatus } from '@nestjs/common';
import type { Request } from 'express';
import { PaymentService } from '@domain/payment/payment.service';

@Controller('webhook/payment')
export class PaymentWebhookController {
  constructor(private readonly paymentService: PaymentService) { }

  @Post('stripe')
  @HttpCode(HttpStatus.OK)
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

  //! simulate
  @Post('simulate-success')
  @HttpCode(HttpStatus.OK)
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