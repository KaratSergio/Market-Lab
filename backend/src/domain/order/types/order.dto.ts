// Use it to type the incoming data
import { ShippingAddress, OrderItemModel } from "./order.type";

export interface CreateOrderDto {
  userId: string;
  cartId: string;
  shippingAddress: ShippingAddress;
  notes?: string;
}

export interface UpdateOrderStatusDto {
  status: string;
  notes?: string;
}

export interface UpdatePaymentStatusDto {
  paymentStatus: string;
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
  paymentDetails: Record<string, any>;
}