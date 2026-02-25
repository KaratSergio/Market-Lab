// Use only within the domain, internal typing..
import { Entity } from '@shared/types/entity.interface';
import { ProductItemModel } from '@shared/types/product-item.interface';


export const CART_OWNER_TYPE = {
  USER: 'user',
  GUEST: 'guest',
} as const;

export const CART_STATUS = {
  ACTIVE: 'active',
  PENDING_CHECKOUT: 'pending_checkout',
  ABANDONED: 'abandoned',
  CONVERTED_TO_ORDER: 'converted_to_order',
} as const;

export type CartOwnerType = typeof CART_OWNER_TYPE[keyof typeof CART_OWNER_TYPE];
export type CartStatus = typeof CART_STATUS[keyof typeof CART_STATUS];

export type CartItemModel = ProductItemModel;

export interface CartModel extends Entity {
  userId?: string | null;
  sessionId?: string | null;
  ownerType: CartOwnerType;
  items: CartItemModel[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  currency: string;
  status: CartStatus;
  expiresAt?: Date;
}
