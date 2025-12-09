// Use only within the domain, internal typing..
import { Entity } from "@shared/interfaces/entity.interface";
import { ProductItemModel } from '@shared/interfaces/product-item.type';


export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

export type OrderItemModel = ProductItemModel;

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface OrderModel extends Entity {
  userId: string;
  cartId: string;
  orderNumber: string;
  items: OrderItemModel[];
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: ShippingAddress;
  notes?: string;
}