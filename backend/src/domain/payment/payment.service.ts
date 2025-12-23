import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException
} from '@nestjs/common';

import {
  CreatePaymentDto,
  ProcessPaymentDto,
  RefundPaymentDto,
  ProviderResponse,
  PaymentStatsDto,
  PaymentWebhookData,
  PAYMENT_STATUS,
  StripeEvent,
  PaypalEvent
} from './types';

import { PaymentDomainEntity } from './payment.entity';
import { PaymentRepository } from './payment.repository';
import { PermissionsService } from '@auth/permissions/permissions.service';
import { Permission } from '@shared/types';


@Injectable()
export class PaymentService {
  constructor(
    @Inject('PaymentRepository')
    private readonly paymentRepository: PaymentRepository,
    private readonly permissionsService: PermissionsService
  ) { }

  async createPayment(createDto: CreatePaymentDto): Promise<PaymentDomainEntity> {
    // Check if a payment already exists for this order.
    const existingPayment = await this.paymentRepository.findByOrderId(createDto.orderId);

    if (existingPayment) {
      if (existingPayment.isSuccessful()) {
        throw new ConflictException('Payment already exists and is successful for this order');
      }

      // If there is an unfinished payment, check if it belongs to the user
      if (existingPayment.userId !== createDto.userId) {
        throw new ConflictException('There is already a pending payment for this order');
      }
    }

    const payment = PaymentDomainEntity.create(createDto);
    return this.paymentRepository.create(payment);
  }

  async getPaymentById(id: string): Promise<PaymentDomainEntity> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async getPaymentByOrderId(orderId: string): Promise<PaymentDomainEntity> {
    const payment = await this.paymentRepository.findByOrderId(orderId);
    if (!payment) throw new NotFoundException('Payment not found for order');
    return payment;
  }

  async getAllPayments(): Promise<PaymentDomainEntity[]> {
    return this.paymentRepository.findAll();
  }

  async processPayment(paymentId: string, processDto?: ProcessPaymentDto): Promise<PaymentDomainEntity> {
    const payment = await this.getPaymentById(paymentId);

    if (payment.status !== PAYMENT_STATUS.PENDING) {
      throw new BadRequestException(`Payment cannot be processed in status: ${payment.status}`);
    }

    payment.markAsProcessing();

    const updated = await this.paymentRepository.update(payment.id, {
      status: payment.status,
      updatedAt: payment.updatedAt
    });

    if (!updated) throw new NotFoundException('Payment not found after update');

    // ! Здесь будет интеграция с платежным шлюзом
    // ! используем симуляцию успешного платежа
    if (processDto?.paymentToken) {
      setTimeout(async () => {
        await this.markPaymentAsPaid(paymentId, `txn_${Date.now()}`, { simulated: true });
      }, 1000);
    }

    return updated;
  }

  async markPaymentAsPaid(
    paymentId: string,
    transactionId: string,
    providerResponse?: ProviderResponse
  ): Promise<PaymentDomainEntity> {
    const payment = await this.getPaymentById(paymentId);

    payment.markAsPaid(transactionId, providerResponse);

    const updated = await this.paymentRepository.update(payment.id, {
      status: payment.status,
      transactionId: payment.transactionId,
      providerResponse: payment.providerResponse,
      paidAt: payment.paidAt,
      updatedAt: payment.updatedAt
    });

    if (!updated) throw new NotFoundException('Payment not found after update');
    // Trigger a successful payment event
    await this._triggerPaymentSuccessEvent(payment);
    return updated;
  }

  async markPaymentAsFailed(
    paymentId: string,
    failureReason?: string,
    providerResponse?: ProviderResponse
  ): Promise<PaymentDomainEntity> {
    const payment = await this.getPaymentById(paymentId);

    try {
      payment.markAsFailed(failureReason, providerResponse);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(errorMessage);
    }

    const updated = await this.paymentRepository.update(payment.id, {
      status: payment.status,
      failureReason: payment.failureReason,
      providerResponse: payment.providerResponse,
      updatedAt: payment.updatedAt
    });

    if (!updated) throw new NotFoundException('Payment not found after update');
    // Trigger the failed payment event
    await this._triggerPaymentFailureEvent(payment, failureReason);
    return updated;
  }

  async cancelPayment(paymentId: string, reason?: string): Promise<PaymentDomainEntity> {
    const payment = await this.getPaymentById(paymentId);

    try {
      payment.markAsCancelled(reason);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(errorMessage);
    }

    const updated = await this.paymentRepository.update(payment.id, {
      status: payment.status,
      failureReason: payment.failureReason,
      updatedAt: payment.updatedAt
    });

    if (!updated) throw new NotFoundException('Payment not found after update');
    // Trigger the payment cancellation event
    await this._triggerPaymentCancellationEvent(payment, reason);
    return updated;
  }

  async refundPayment(paymentId: string, refundDto: RefundPaymentDto): Promise<PaymentDomainEntity> {
    const payment = await this.getPaymentById(paymentId);

    if (!payment.isRefundable()) throw new BadRequestException('Payment is not refundable');

    const refundableAmount = payment.getRefundableAmount();
    const refundAmount = refundDto.amount || refundableAmount;

    if (refundAmount > refundableAmount) {
      throw new BadRequestException(`Refund amount exceeds refundable amount: ${refundableAmount}`);
    }

    try {
      payment.refund(refundAmount, refundDto.reason);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(errorMessage);
    }

    const updated = await this.paymentRepository.update(payment.id, {
      status: payment.status,
      refundedAmount: payment.refundedAmount,
      refundedAt: payment.refundedAt,
      failureReason: payment.failureReason,
      updatedAt: payment.updatedAt
    });

    if (!updated) throw new NotFoundException('Payment not found after update');
    // Trigger the chargeback event
    await this._triggerPaymentRefundEvent(payment, refundAmount, refundDto.reason);
    return updated;
  }

  async getUserPayments(userId: string): Promise<PaymentDomainEntity[]> {
    return this.paymentRepository.findByUserId(userId);
  }

  async getPendingPayments(): Promise<PaymentDomainEntity[]> {
    return this.paymentRepository.findPendingPayments();
  }

  async getFailedPayments(): Promise<PaymentDomainEntity[]> {
    return this.paymentRepository.findFailedPayments();
  }

  async getPaymentStats(startDate: Date, endDate: Date): Promise<PaymentStatsDto> {
    return this.paymentRepository.getPaymentStats(startDate, endDate);
  }

  async handleWebhook(eventData: PaymentWebhookData): Promise<void> {
    console.log('Payment webhook received:', eventData);

    // Stripe webhook
    if (eventData.eventType === 'stripe.webhook') {
      const stripeEvent = eventData.data as StripeEvent;

      if (stripeEvent.type === 'payment_intent.succeeded') {
        const paymentIntent = stripeEvent.data.object as Record<string, unknown>;
        const transactionId = paymentIntent.id as string;

        if (transactionId) {
          const payment = await this.paymentRepository.findByTransactionId(transactionId);

          if (payment) {
            await this.markPaymentAsPaid(payment.id, transactionId, paymentIntent);
          }
        }
      }
    }

    // PayPal webhook
    if (eventData.eventType === 'paypal.webhook') {
      const paypalEvent = eventData.data as PaypalEvent;

      if (paypalEvent.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
        const capture = paypalEvent.resource as Record<string, unknown>;
        const transactionId = capture.id as string;

        if (transactionId) {
          const payment = await this.paymentRepository.findByTransactionId(transactionId);

          if (payment) {
            await this.markPaymentAsPaid(payment.id, transactionId, capture);
          }
        }
      }
    }
  }

  // Helper methods for events
  private async _triggerPaymentSuccessEvent(payment: PaymentDomainEntity): Promise<void> {
    //! Здесь будет логика отправки события об успешном платеже
    console.log(`Payment ${payment.id} succeeded for user ${payment.userId}`);
    //! Можно интегрировать с EventEmitter или брокером сообщений
  }

  private async _triggerPaymentFailureEvent(payment: PaymentDomainEntity, reason?: string): Promise<void> {
    console.log(`Payment ${payment.id} failed for user ${payment.userId}: ${reason}`);
  }

  private async _triggerPaymentCancellationEvent(payment: PaymentDomainEntity, reason?: string): Promise<void> {
    console.log(`Payment ${payment.id} cancelled for user ${payment.userId}: ${reason}`);
  }

  private async _triggerPaymentRefundEvent(
    payment: PaymentDomainEntity,
    amount: number,
    reason?: string
  ): Promise<void> {
    console.log(`Payment ${payment.id} refunded for user ${payment.userId}: ${amount} - ${reason}`);
  }

  // Method for checking payment access rights
  async checkPaymentAccess(
    userId: string,
    userPermissions: Permission[],
    paymentId: string
  ): Promise<boolean> {
    const payment = await this.getPaymentById(paymentId);

    // If the payment belongs to the user
    if (payment.userId === userId) return true;
    // If the user has permission to read all payments
    if (this.permissionsService.hasPermission(userPermissions, Permission.PAYMENT_READ_ALL)) return true;
    // If the user has permission to manage payments
    if (this.permissionsService.hasPermission(userPermissions, Permission.PAYMENT_MANAGE)) return true;

    return false;
  }
}