import { Injectable, Inject, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PaymentDomainEntity } from './payment.entity';
import { PaymentRepository } from './payment.repository';
import { CreatePaymentDto, ProcessPaymentDto, RefundPaymentDto, PAYMENT_STATUS } from './types';


@Injectable()
export class PaymentService {
  constructor(
    @Inject('PaymentRepository')
    private readonly paymentRepository: PaymentRepository,
  ) { }

  async createPayment(createDto: CreatePaymentDto): Promise<PaymentDomainEntity> {
    // Check if a payment already exists for this order.
    const existingPayment = await this.paymentRepository.findByOrderId(createDto.orderId);

    if (existingPayment && existingPayment.isSuccessful()) {
      throw new ConflictException('Payment already exists and is successful for this order');
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
    providerResponse?: Record<string, any>
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
    return updated;
  }

  async markPaymentAsFailed(
    paymentId: string,
    failureReason?: string,
    providerResponse?: Record<string, any>
  ): Promise<PaymentDomainEntity> {
    const payment = await this.getPaymentById(paymentId);

    try {
      payment.markAsFailed(failureReason, providerResponse);
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    const updated = await this.paymentRepository.update(payment.id, {
      status: payment.status,
      failureReason: payment.failureReason,
      providerResponse: payment.providerResponse,
      updatedAt: payment.updatedAt
    });

    if (!updated) throw new NotFoundException('Payment not found after update');
    return updated;
  }

  async cancelPayment(paymentId: string, reason?: string): Promise<PaymentDomainEntity> {
    const payment = await this.getPaymentById(paymentId);

    try {
      payment.markAsCancelled(reason);
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    const updated = await this.paymentRepository.update(payment.id, {
      status: payment.status,
      failureReason: payment.failureReason,
      updatedAt: payment.updatedAt
    });

    if (!updated) throw new NotFoundException('Payment not found after update');
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
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    const updated = await this.paymentRepository.update(payment.id, {
      status: payment.status,
      refundedAmount: payment.refundedAmount,
      refundedAt: payment.refundedAt,
      failureReason: payment.failureReason,
      updatedAt: payment.updatedAt
    });

    if (!updated) throw new NotFoundException('Payment not found after update');
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

  async getPaymentStats(startDate: Date, endDate: Date): Promise<any> {
    return this.paymentRepository.getPaymentStats(startDate, endDate);
  }

  async handleWebhook(eventData: any): Promise<void> {
    //! Обработка webhook от платежных систем
    // пока просто логируем
    console.log('Payment webhook received:', eventData);

    //! Пример обработки Stripe webhook
    if (eventData.type === 'payment_intent.succeeded' && eventData.data?.object) {
      const paymentIntent = eventData.data.object;
      const payment = await this.paymentRepository.findByTransactionId(paymentIntent.id);

      if (payment) {
        await this.markPaymentAsPaid(payment.id, paymentIntent.id, paymentIntent);
      }
    }
  }
}