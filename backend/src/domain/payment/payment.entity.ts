import {
  PaymentModel,
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
  PaymentCardDetails,
  PaymentCryptoDetails,
  CreatePaymentDto,
  PAYMENT_STATUS
} from './types';

export class PaymentDomainEntity implements PaymentModel {
  public id: string;
  public orderId: string;
  public userId: string;
  public amount: number;
  public currency: string;
  public method: PaymentMethod;
  public provider: PaymentProvider;
  public status: PaymentStatus;
  public transactionId?: string;
  public cardDetails?: PaymentCardDetails;
  public cryptoDetails?: PaymentCryptoDetails;
  public providerResponse?: Record<string, any>;
  public refundedAmount?: number;
  public failureReason?: string;
  public paidAt?: Date;
  public refundedAt?: Date;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    orderId: string,
    userId: string,
    amount: number,
    currency: string,
    method: PaymentMethod,
    provider: PaymentProvider,
    status: PaymentStatus = PAYMENT_STATUS.PENDING,
    transactionId?: string,
    cardDetails?: PaymentCardDetails,
    cryptoDetails?: PaymentCryptoDetails,
    providerResponse?: Record<string, any>,
    refundedAmount?: number,
    failureReason?: string,
    paidAt?: Date,
    refundedAt?: Date,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.orderId = orderId;
    this.userId = userId;
    this.amount = amount;
    this.currency = currency;
    this.method = method;
    this.provider = provider;
    this.status = status;
    this.transactionId = transactionId;
    this.cardDetails = cardDetails;
    this.cryptoDetails = cryptoDetails;
    this.providerResponse = providerResponse;
    this.refundedAmount = refundedAmount;
    this.failureReason = failureReason;
    this.paidAt = paidAt;
    this.refundedAt = refundedAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;

    this.validate();
  }

  static create(createDto: CreatePaymentDto): PaymentDomainEntity {
    return new PaymentDomainEntity(
      crypto.randomUUID(),
      createDto.orderId,
      createDto.userId,
      createDto.amount,
      createDto.currency || 'USD',
      createDto.method,
      createDto.provider,
      PAYMENT_STATUS.PENDING,
      undefined,
      createDto.cardDetails,
      createDto.cryptoDetails
    );
  }

  // Бизнес-методы
  markAsProcessing(transactionId?: string): void {
    if (this.status !== PAYMENT_STATUS.PENDING) {
      throw new Error(`Cannot process payment with status: ${this.status}`);
    }

    this.status = PAYMENT_STATUS.PROCESSING;
    if (transactionId) this.transactionId = transactionId;
    this.updatedAt = new Date();
  }

  markAsPaid(transactionId: string, providerResponse?: Record<string, any>): void {
    if (this.status !== PAYMENT_STATUS.PENDING && this.status !== PAYMENT_STATUS.PROCESSING) {
      throw new Error(`Cannot mark as paid payment with status: ${this.status}`);
    }

    this.status = PAYMENT_STATUS.PAID;
    this.transactionId = transactionId;
    this.providerResponse = providerResponse;
    this.paidAt = new Date();
    this.updatedAt = new Date();
  }

  markAsFailed(failureReason?: string, providerResponse?: Record<string, any>): void {
    if (this.status === PAYMENT_STATUS.PAID || this.status === PAYMENT_STATUS.REFUNDED) {
      throw new Error(`Cannot mark as failed payment with status: ${this.status}`);
    }

    this.status = PAYMENT_STATUS.FAILED;
    this.failureReason = failureReason;
    this.providerResponse = providerResponse;
    this.updatedAt = new Date();
  }

  markAsCancelled(reason?: string): void {
    if (this.status === PAYMENT_STATUS.PAID || this.status === PAYMENT_STATUS.REFUNDED) {
      throw new Error(`Cannot cancel payment with status: ${this.status}`);
    }

    this.status = PAYMENT_STATUS.CANCELLED;
    this.failureReason = reason;
    this.updatedAt = new Date();
  }

  refund(refundAmount?: number, reason?: string): void {
    if (this.status !== PAYMENT_STATUS.PAID) {
      throw new Error('Cannot refund unpaid payment');
    }

    const amountToRefund = refundAmount || this.amount;

    if (amountToRefund > this.amount) {
      throw new Error('Refund amount cannot exceed payment amount');
    }

    if (this.refundedAmount && amountToRefund > (this.amount - this.refundedAmount)) {
      throw new Error('Refund amount exceeds remaining refundable amount');
    }

    this.refundedAmount = (this.refundedAmount || 0) + amountToRefund;

    if (this.refundedAmount === this.amount) {
      this.status = PAYMENT_STATUS.REFUNDED;
      this.refundedAt = new Date();
    } else {
      this.status = PAYMENT_STATUS.PARTIALLY_REFUNDED;
    }

    if (reason) this.failureReason = reason;
    this.updatedAt = new Date();
  }

  getRefundableAmount(): number {
    if (this.status !== PAYMENT_STATUS.PAID && this.status !== PAYMENT_STATUS.PARTIALLY_REFUNDED) {
      return 0;
    }

    return this.amount - (this.refundedAmount || 0);
  }

  isRefundable(): boolean {
    return this.status === PAYMENT_STATUS.PAID ||
      this.status === PAYMENT_STATUS.PARTIALLY_REFUNDED;
  }

  isSuccessful(): boolean {
    return this.status === PAYMENT_STATUS.PAID;
  }

  isFailed(): boolean {
    return this.status === PAYMENT_STATUS.FAILED || this.status === PAYMENT_STATUS.CANCELLED;
  }

  private validate(): void {
    if (this.amount <= 0) {
      throw new Error('Payment amount must be positive');
    }

    if (this.refundedAmount && this.refundedAmount > this.amount) {
      throw new Error('Refunded amount cannot exceed payment amount');
    }

    if (this.refundedAmount && this.refundedAmount < 0) {
      throw new Error('Refunded amount cannot be negative');
    }

    if (this.method === 'credit_card' && !this.cardDetails) {
      throw new Error('Card details required for credit card payments');
    }

    if (this.method === 'crypto' && !this.cryptoDetails) {
      throw new Error('Crypto details required for crypto payments');
    }
  }
}