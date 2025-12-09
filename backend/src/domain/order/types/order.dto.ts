// Use it to type the incoming data
import {
  ShippingAddress,
  OrderItemModel,
  OrderStatus,
  PaymentStatus
} from "./order.type";


export interface CreateOrderDto {
  userId: string;
  cartId: string;
  shippingAddress: ShippingAddress;
  notes?: string;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
  notes?: string;
}

export interface UpdatePaymentStatusDto {
  paymentStatus: PaymentStatus;
  transactionId?: string;
}

export interface CalculateOrderDto {
  items: OrderItemModel[];
  shippingFee: number;
  taxRate: number;
  discountAmount?: number;
  currency?: string;
}

export interface ProcessPaymentDto {
  orderId: string;
  paymentMethod: string;
  paymentDetails: Record<string, unknown>;
}

// to convert from the basket
export interface CartItemOrderDto {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  imageUrl?: string;
}

export interface OrderTotalsDto {
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
}

export interface OrderStatsDto {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  pendingOrders: number;
  completedOrders?: number;
  cancelledOrders?: number;
  refundedOrders?: number;
  [key: string]: number | undefined | string;
}