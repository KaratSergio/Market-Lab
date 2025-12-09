// Use it to type the incoming data
import {
  PaymentMethod,
  PaymentProvider,
  PaymentCardDetails,
  PaymentCryptoDetails
} from "./payment.type";

export interface CreatePaymentDto {
  orderId: string;
  userId: string;
  amount: number;
  currency?: string;
  method: PaymentMethod;
  provider: PaymentProvider;
  cardDetails?: PaymentCardDetails;
  cryptoDetails?: PaymentCryptoDetails;
}

export interface ProcessPaymentDto {
  paymentId: string;
  paymentToken?: string;
  saveCard?: boolean;
  returnUrl?: string;
}

export interface RefundPaymentDto {
  paymentId: string;
  amount?: number;
  reason?: string;
}

export interface UpdatePaymentStatusDto {
  status: string;
  transactionId?: string;
  providerResponse?: Record<string, unknown>;
  failureReason?: string;
}

export interface CapturePaymentDto {
  paymentId: string;
  amount?: number;
}

export interface PaymentWebhookDto {
  eventType: string;
  data: Record<string, unknown>;
  signature?: string;
  timestamp: number;
}

// provider response
export type ProviderResponse = Record<string, unknown>;

// for statistics
export interface PaymentStatsDto {
  totalRevenue: number;
  successfulPayments: number;
  failedPayments: number;
  averagePaymentValue: number;
  refundedAmount: number;

  totalPayments?: number;
  totalAmount?: number;
  pendingPayments?: number;
  refundedPayments?: number;
  averagePaymentAmount?: number;
  [key: string]: number | undefined;
}

// for webhook data
export interface PaymentWebhookData {
  eventType: string;
  data?: {
    object?: Record<string, unknown>;
  };
  [key: string]: unknown;
}