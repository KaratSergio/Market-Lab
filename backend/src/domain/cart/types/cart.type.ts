// Use only within the domain, internal typing..
import { Entity } from '@shared/interfaces/entity.interface';

export const CART_STATUS = {
  ACTIVE: 'active',
  PENDING_CHECKOUT: 'pending_checkout',
  ABANDONED: 'abandoned',
  CONVERTED_TO_ORDER: 'converted_to_order',
} as const;

export type CartStatus = typeof CART_STATUS[keyof typeof CART_STATUS];

export interface CartItemModel {
  productId: string;
  quantity: number;
  price: number;
  discount?: number;
  name?: string;
  imageUrl?: string;
}

export interface CartModel extends Entity {
  id: string;
  userId: string;
  items: CartItemModel[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  currency: string;
  status: CartStatus;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}