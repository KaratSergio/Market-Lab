import {
  ApiProperty,
  ApiPropertyOptional
} from '@nestjs/swagger';

import {
  IsString, IsNumber,
  IsOptional, IsUUID,
  Min, IsObject, IsDate
} from 'class-validator';
import { Type } from 'class-transformer';


export class StripeWebhookDtoSwagger {
  @ApiProperty({
    description: 'Stripe event object',
    example: {
      id: 'evt_123456789',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_123456789', amount: 1000, currency: 'usd' } },
    },
    required: true,
  })
  @IsObject()
  data: any;
}

export class PaypalWebhookDtoSwagger {
  @ApiProperty({
    description: 'PayPal webhook event object',
    example: {
      id: 'WH-123456789',
      event_type: 'PAYMENT.CAPTURE.COMPLETED',
      resource: { id: 'CAP-123456789', amount: { value: '10.00', currency_code: 'USD' } },
    },
    required: true,
  })
  @IsObject()
  data: any;
}

export class SimulatePaymentDtoSwagger {
  @ApiProperty({
    description: 'Payment ID to simulate',
    example: 'pay_123456789',
    required: true,
  })
  @IsString()
  paymentId: string;

  @ApiPropertyOptional({
    description: 'Transaction ID for successful simulation',
    example: 'txn_simulated_123456',
  })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional({
    description: 'Failure reason for failed simulation',
    example: 'Insufficient funds',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class CreatePaymentDtoSwagger {
  @ApiProperty({
    description: 'Order ID associated with the payment',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsUUID()
  orderId: string;

  @ApiProperty({
    description: 'Payment amount',
    example: 99.99,
    minimum: 0.01,
    required: true,
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Payment currency',
    example: 'USD',
    required: true,
  })
  @IsString()
  currency: string;

  @ApiProperty({
    description: 'Payment method',
    example: 'credit_card',
    enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'crypto'],
    required: true,
  })
  @IsString()
  paymentMethod: string;

  @ApiPropertyOptional({
    description: 'User ID (if creating payment for another user - requires PAYMENT_MANAGE permission)',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Payment description',
    example: 'Payment for Order #ORD-2024-001234',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Additional payment metadata',
    example: { customer_ip: '192.168.1.1', browser: 'Chrome' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class ProcessPaymentDtoSwagger {
  @ApiProperty({
    description: 'Payment gateway response data',
    example: {
      transactionId: 'txn_123456789',
      gateway: 'stripe',
      response: { status: 'succeeded', captured: true },
    },
    required: true,
  })
  @IsObject()
  gatewayData: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Customer payment method details',
    example: { last4: '4242', brand: 'visa', expiry_month: 12, expiry_year: 2025 },
  })
  @IsOptional()
  @IsObject()
  paymentMethodDetails?: Record<string, any>;
}

export class RefundPaymentDtoSwagger {
  @ApiProperty({
    description: 'Refund amount (full or partial)',
    example: 99.99,
    minimum: 0.01,
    required: true,
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Reason for refund',
    example: 'Customer requested refund',
    required: true,
  })
  @IsString()
  reason: string;

  @ApiPropertyOptional({
    description: 'Refund notes',
    example: 'Product damaged during shipping',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CancelPaymentDtoSwagger {
  @ApiPropertyOptional({
    description: 'Reason for cancellation',
    example: 'Payment timeout',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class DateRangeQueryDtoSwagger {
  @ApiPropertyOptional({
    description: 'Start date for statistics (ISO format)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'End date for statistics (ISO format)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;
}

// Response DTOs
export class PaymentResponseDtoSwagger {
  @ApiProperty({
    description: 'Payment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Order ID associated with the payment',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  orderId: string;

  @ApiProperty({
    description: 'User ID who made the payment',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  userId: string;

  @ApiProperty({
    description: 'Payment amount',
    example: 99.99,
  })
  amount: number;

  @ApiProperty({
    description: 'Payment currency',
    example: 'USD',
  })
  currency: string;

  @ApiProperty({
    description: 'Payment status',
    example: 'completed',
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
  })
  status: string;

  @ApiProperty({
    description: 'Payment method',
    example: 'credit_card',
  })
  paymentMethod: string;

  @ApiPropertyOptional({
    description: 'Transaction ID from payment gateway',
    example: 'txn_123456789',
  })
  transactionId?: string;

  @ApiPropertyOptional({
    description: 'Payment gateway used',
    example: 'stripe',
  })
  gateway?: string;

  @ApiPropertyOptional({
    description: 'Refund amount if applicable',
    example: 50.00,
  })
  refundAmount?: number;

  @ApiPropertyOptional({
    description: 'Refund reason if applicable',
    example: 'Customer requested refund',
  })
  refundReason?: string;

  @ApiPropertyOptional({
    description: 'Cancellation reason if applicable',
    example: 'Payment timeout',
  })
  cancellationReason?: string;

  @ApiProperty({
    description: 'Payment creation date',
    example: '2024-06-20T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Payment last update date',
    example: '2024-06-20T11:45:00.000Z',
  })
  updatedAt: Date;
}

export class PaymentDetailsResponseDtoSwagger extends PaymentResponseDtoSwagger {
  @ApiProperty({
    description: 'Payment gateway response data',
    example: { status: 'succeeded', captured: true },
  })
  gatewayResponse: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Customer payment method details',
    example: { last4: '4242', brand: 'visa' },
  })
  paymentMethodDetails?: Record<string, any>;

  @ApiProperty({
    description: 'Payment metadata',
    example: { customer_ip: '192.168.1.1', browser: 'Chrome' },
  })
  metadata: Record<string, any>;

  @ApiProperty({
    description: 'Payment history/logs',
    example: [
      { timestamp: '2024-06-20T10:30:00.000Z', action: 'payment_created', status: 'pending' },
      { timestamp: '2024-06-20T11:00:00.000Z', action: 'payment_processed', status: 'completed' },
    ],
  })
  history: Array<{
    timestamp: Date;
    action: string;
    status: string;
    notes?: string;
  }>;
}

export class PaymentsListResponseDtoSwagger {
  @ApiProperty({
    description: 'List of payments',
    type: [PaymentResponseDtoSwagger],
  })
  payments: PaymentResponseDtoSwagger[];

  @ApiProperty({
    description: 'Total count of payments',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 15,
  })
  totalPages: number;
}

export class PaymentStatsResponseDtoSwagger {
  @ApiProperty({
    description: 'Total payments count',
    example: 1000,
  })
  totalPayments: number;

  @ApiProperty({
    description: 'Total revenue',
    example: 125000.75,
  })
  totalRevenue: number;

  @ApiProperty({
    description: 'Average payment amount',
    example: 125.00,
  })
  averagePaymentAmount: number;

  @ApiProperty({
    description: 'Payments by status',
    example: {
      completed: 850,
      pending: 50,
      failed: 30,
      refunded: 70,
    },
  })
  byStatus: Record<string, number>;

  @ApiProperty({
    description: 'Payments by method',
    example: {
      credit_card: 600,
      paypal: 300,
      bank_transfer: 100,
    },
  })
  byMethod: Record<string, number>;

  @ApiProperty({
    description: 'Revenue by month (current year)',
    example: {
      'January': 10000.00,
      'February': 12000.00,
      'March': 15000.00,
    },
  })
  revenueByMonth: Record<string, number>;

  @ApiProperty({
    description: 'Successful payment rate',
    example: 0.85,
  })
  successRate: number;

  @ApiProperty({
    description: 'Refund rate',
    example: 0.07,
  })
  refundRate: number;
}

export class WebhookResponseDtoSwagger {
  @ApiProperty({
    description: 'Webhook received status',
    example: true,
  })
  received: boolean;

  @ApiProperty({
    description: 'Webhook processing status',
    example: 'processed',
    enum: ['processed', 'ignored', 'failed'],
  })
  status: string;

  @ApiPropertyOptional({
    description: 'Processing message',
    example: 'Payment status updated successfully',
  })
  message?: string;
}

export class SuccessResponseDtoSwagger {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Operation completed successfully',
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Response data',
  })
  data?: any;
}