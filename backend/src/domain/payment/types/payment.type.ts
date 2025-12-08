// Use only within the domain, internal typing..
import { Entity } from "@shared/interfaces/entity.interface";

export const PAYMENT_METHOD = {
  CREDIT_CARD: 'credit_card',
  PAYPAL: 'paypal',
  CRYPTO: 'crypto',
  BANK_TRANSFER: 'bank_transfer',
  CASH: 'cash',
} as const;

export type PaymentMethod = typeof PAYMENT_METHOD[keyof typeof PAYMENT_METHOD];

export const PAYMENT_PROVIDER = {
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
  COINBASE: 'coinbase',
  MANUAL: 'manual',
} as const;

export type PaymentProvider = typeof PAYMENT_PROVIDER[keyof typeof PAYMENT_PROVIDER];

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
  CANCELLED: 'cancelled',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

export interface PaymentCardDetails {
  last4: string;
  brand: string;
  country: string;
  expMonth: number;
  expYear: number;
}

export interface PaymentCryptoDetails {
  currency: string;
  address: string;
  amount: string;
  network: string;
}

export interface PaymentModel extends Entity {
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  provider: PaymentProvider;
  status: PaymentStatus;
  transactionId?: string;
  cardDetails?: PaymentCardDetails;
  cryptoDetails?: PaymentCryptoDetails;
  providerResponse?: Record<string, any>;
  refundedAmount?: number;
  failureReason?: string;
  paidAt?: Date;
  refundedAt?: Date;
}