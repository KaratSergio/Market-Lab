import {
  ApiProperty,
  ApiPropertyOptional
} from '@nestjs/swagger';

import {
  IsString, IsNumber,
  IsOptional, Min
} from 'class-validator';
import { Type } from 'class-transformer';


export class CreateOrderDtoSwagger {
  @ApiProperty({
    description: 'Shipping address for the order',
    example: '123 Main Street, New York, NY 10001',
    required: true,
  })
  @IsString()
  shippingAddress: string;

  @ApiProperty({
    description: 'Billing address for the order',
    example: '123 Main Street, New York, NY 10001',
    required: true,
  })
  @IsString()
  billingAddress: string;

  @ApiPropertyOptional({
    description: 'Shipping method selected',
    example: 'express',
    enum: ['standard', 'express', 'overnight'],
  })
  @IsOptional()
  @IsString()
  shippingMethod?: string;

  @ApiPropertyOptional({
    description: 'Payment method selected',
    example: 'credit_card',
    enum: ['credit_card', 'paypal', 'bank_transfer', 'cash_on_delivery'],
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({
    description: 'Customer notes for the order',
    example: 'Please deliver after 5 PM',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Discount code applied',
    example: 'SUMMER2024',
  })
  @IsOptional()
  @IsString()
  discountCode?: string;
}

export class UpdateOrderStatusDtoSwagger {
  @ApiProperty({
    description: 'New order status',
    example: 'shipped',
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    required: true,
  })
  @IsString()
  status: string;

  @ApiPropertyOptional({
    description: 'Status update notes',
    example: 'Package handed over to courier',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Tracking number for shipping',
    example: 'TRK123456789',
  })
  @IsOptional()
  @IsString()
  trackingNumber?: string;
}

export class CancelOrderDtoSwagger {
  @ApiPropertyOptional({
    description: 'Reason for cancellation',
    example: 'Changed my mind',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class RefundRequestDtoSwagger {
  @ApiProperty({
    description: 'Reason for refund request',
    example: 'Product damaged during shipping',
    required: true,
  })
  @IsString()
  reason: string;

  @ApiPropertyOptional({
    description: 'Amount to refund (partial refund)',
    example: 50.00,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  refundAmount?: number;

  @ApiPropertyOptional({
    description: 'Additional evidence or comments',
    example: 'Photos of damaged product attached',
  })
  @IsOptional()
  @IsString()
  evidence?: string;
}

// Response DTOs
export class OrderItemResponseDtoSwagger {
  @ApiProperty({
    description: 'Order item ID',
    example: 'order_item_123',
  })
  id: string;

  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  productId: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Gaming Laptop Pro',
  })
  productName: string;

  @ApiProperty({
    description: 'Product SKU',
    example: 'LAP-GAM-PRO-001',
  })
  sku: string;

  @ApiProperty({
    description: 'Unit price at time of order',
    example: 1499.99,
  })
  unitPrice: number;

  @ApiProperty({
    description: 'Quantity ordered',
    example: 1,
  })
  quantity: number;

  @ApiProperty({
    description: 'Total price for this item',
    example: 1499.99,
  })
  totalPrice: number;

  @ApiPropertyOptional({
    description: 'Product variant information',
    example: { color: 'black', storage: '1TB' },
  })
  variant?: Record<string, any>;

  @ApiProperty({
    description: 'Supplier ID',
    example: 'supplier_123',
  })
  supplierId: string;

  @ApiProperty({
    description: 'Supplier name',
    example: 'Tech Solutions Inc.',
  })
  supplierName: string;
}

export class OrderResponseDtoSwagger {
  @ApiProperty({
    description: 'Order ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Unique order number',
    example: 'ORD-2024-001234',
  })
  orderNumber: string;

  @ApiProperty({
    description: 'Customer ID',
    example: 'customer_123',
  })
  customerId: string;

  @ApiProperty({
    description: 'Customer email',
    example: 'customer@example.com',
  })
  customerEmail: string;

  @ApiProperty({
    description: 'Customer full name',
    example: 'John Doe',
  })
  customerName: string;

  @ApiProperty({
    description: 'Order status',
    example: 'processing',
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
  })
  status: string;

  @ApiProperty({
    description: 'Payment status',
    example: 'paid',
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
  })
  paymentStatus: string;

  @ApiProperty({
    description: 'Shipping address',
    example: '123 Main Street, New York, NY 10001',
  })
  shippingAddress: string;

  @ApiProperty({
    description: 'Billing address',
    example: '123 Main Street, New York, NY 10001',
  })
  billingAddress: string;

  @ApiProperty({
    description: 'Shipping method',
    example: 'express',
  })
  shippingMethod: string;

  @ApiProperty({
    description: 'Payment method',
    example: 'credit_card',
  })
  paymentMethod: string;

  @ApiProperty({
    description: 'Order items',
    type: [OrderItemResponseDtoSwagger],
  })
  items: OrderItemResponseDtoSwagger[];

  @ApiProperty({
    description: 'Number of unique items',
    example: 3,
  })
  itemCount: number;

  @ApiProperty({
    description: 'Total quantity of items',
    example: 5,
  })
  totalQuantity: number;

  @ApiProperty({
    description: 'Subtotal (sum of item prices)',
    example: 2999.97,
  })
  subtotal: number;

  @ApiProperty({
    description: 'Shipping cost',
    example: 9.99,
  })
  shippingCost: number;

  @ApiProperty({
    description: 'Tax amount',
    example: 299.99,
  })
  taxAmount: number;

  @ApiPropertyOptional({
    description: 'Discount amount',
    example: 150.00,
  })
  discountAmount?: number;

  @ApiPropertyOptional({
    description: 'Applied discount code',
    example: 'SUMMER2024',
  })
  discountCode?: string;

  @ApiProperty({
    description: 'Grand total',
    example: 3159.95,
  })
  grandTotal: number;

  @ApiPropertyOptional({
    description: 'Tracking number',
    example: 'TRK123456789',
  })
  trackingNumber?: string;

  @ApiPropertyOptional({
    description: 'Estimated delivery date',
    example: '2024-06-25T00:00:00.000Z',
  })
  estimatedDelivery?: Date;

  @ApiPropertyOptional({
    description: 'Actual delivery date',
    example: '2024-06-24T14:30:00.000Z',
  })
  deliveredAt?: Date;

  @ApiPropertyOptional({
    description: 'Cancellation reason',
    example: 'Changed my mind',
  })
  cancellationReason?: string;

  @ApiPropertyOptional({
    description: 'Refund reason',
    example: 'Product damaged',
  })
  refundReason?: string;

  @ApiPropertyOptional({
    description: 'Refund amount',
    example: 2999.97,
  })
  refundAmount?: number;

  @ApiProperty({
    description: 'Order creation date',
    example: '2024-06-20T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-06-20T11:45:00.000Z',
  })
  updatedAt: Date;
}

export class OrderDetailsResponseDtoSwagger extends OrderResponseDtoSwagger {
  @ApiProperty({
    description: 'Customer phone number',
    example: '+1234567890',
  })
  customerPhone: string;

  @ApiProperty({
    description: 'Payment transaction ID',
    example: 'txn_123456789',
  })
  transactionId: string;

  @ApiProperty({
    description: 'Payment gateway used',
    example: 'stripe',
  })
  paymentGateway: string;

  @ApiProperty({
    description: 'Order notes from customer',
    example: 'Please deliver after 5 PM',
  })
  notes: string;

  @ApiProperty({
    description: 'Order history/logs',
    example: [
      { timestamp: '2024-06-20T10:30:00.000Z', action: 'order_created', status: 'pending' },
      { timestamp: '2024-06-20T11:00:00.000Z', action: 'payment_received', status: 'processing' },
    ],
  })
  history: Array<{
    timestamp: Date;
    action: string;
    status: string;
    notes?: string;
  }>;
}

export class OrderNumberResponseDtoSwagger {
  @ApiProperty({
    description: 'Order ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Order number',
    example: 'ORD-2024-001234',
  })
  orderNumber: string;

  @ApiProperty({
    description: 'Order status',
    example: 'processing',
  })
  status: string;

  @ApiProperty({
    description: 'Payment status',
    example: 'paid',
  })
  paymentStatus: string;

  @ApiProperty({
    description: 'Grand total',
    example: 3159.95,
  })
  grandTotal: number;

  @ApiProperty({
    description: 'Order creation date',
    example: '2024-06-20T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Shipping address',
    example: '123 Main Street, New York, NY 10001',
  })
  shippingAddress: string;

  @ApiProperty({
    description: 'Number of items',
    example: 3,
  })
  itemCount: number;
}

export class OrdersListResponseDtoSwagger {
  @ApiProperty({
    description: 'List of orders',
    type: [OrderResponseDtoSwagger],
  })
  orders: OrderResponseDtoSwagger[];

  @ApiProperty({
    description: 'Total count of orders',
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

export class OrderStatisticsResponseDtoSwagger {
  @ApiProperty({
    description: 'Total orders count',
    example: 1000,
  })
  totalOrders: number;

  @ApiProperty({
    description: 'Total revenue',
    example: 125000.75,
  })
  totalRevenue: number;

  @ApiProperty({
    description: 'Average order value',
    example: 125.00,
  })
  averageOrderValue: number;

  @ApiProperty({
    description: 'Orders by status',
    example: {
      pending: 50,
      processing: 150,
      shipped: 300,
      delivered: 450,
      cancelled: 50,
    },
  })
  byStatus: Record<string, number>;

  @ApiProperty({
    description: 'Revenue by month (current year)',
    example: {
      'January': 10000.00,
      'February': 12000.00,
      'March': 15000.00,
      // ... rest of months
    },
  })
  revenueByMonth: Record<string, number>;

  @ApiProperty({
    description: 'Top products by sales',
    example: [
      { productId: 'prod_123', name: 'Gaming Laptop', unitsSold: 150, revenue: 224998.50 },
      { productId: 'prod_456', name: 'Wireless Mouse', unitsSold: 300, revenue: 8997.00 },
    ],
  })
  topProducts: Array<{
    productId: string;
    name: string;
    unitsSold: number;
    revenue: number;
  }>;

  @ApiProperty({
    description: 'Top customers by spending',
    example: [
      { customerId: 'cust_123', name: 'John Doe', orderCount: 25, totalSpent: 12500.00 },
      { customerId: 'cust_456', name: 'Jane Smith', orderCount: 18, totalSpent: 8999.50 },
    ],
  })
  topCustomers: Array<{
    customerId: string;
    name: string;
    orderCount: number;
    totalSpent: number;
  }>;

  @ApiProperty({
    description: 'Conversion rate (orders/carts)',
    example: 0.35,
  })
  conversionRate: number;

  @ApiProperty({
    description: 'Refund rate',
    example: 0.02,
  })
  refundRate: number;
}

export class PendingOrdersResponseDtoSwagger {
  @ApiProperty({
    description: 'Total pending orders count',
    example: 50,
  })
  totalPending: number;

  @ApiProperty({
    description: 'Pending orders requiring immediate attention',
    example: 15,
  })
  urgentCount: number;

  @ApiProperty({
    description: 'Average processing time for pending orders',
    example: '2 hours, 30 minutes',
  })
  averageProcessingTime: string;

  @ApiProperty({
    description: 'Pending orders grouped by priority',
    example: {
      high: [
        { orderId: 'order_123', orderNumber: 'ORD-2024-001234', waitingTime: '5 hours' },
      ],
      medium: [
        { orderId: 'order_456', orderNumber: 'ORD-2024-001235', waitingTime: '2 hours' },
      ],
      low: [
        { orderId: 'order_789', orderNumber: 'ORD-2024-001236', waitingTime: '30 minutes' },
      ],
    },
  })
  byPriority: Record<string, Array<{
    orderId: string;
    orderNumber: string;
    waitingTime: string;
  }>>;

  @ApiProperty({
    description: 'Pending orders list',
    type: [OrderResponseDtoSwagger],
  })
  orders: OrderResponseDtoSwagger[];
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

export class PaginationQueryDtoSwagger {
  @ApiPropertyOptional({
    description: 'Page number (default: 1)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page (default: 10, max: 100)',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;
}