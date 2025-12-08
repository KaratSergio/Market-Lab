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
  providerResponse?: Record<string, any>;
  failureReason?: string;
}

export interface CapturePaymentDto {
  paymentId: string;
  amount?: number;
}

export interface PaymentWebhookDto {
  eventType: string;
  data: Record<string, any>;
  signature?: string;
  timestamp: number;
}