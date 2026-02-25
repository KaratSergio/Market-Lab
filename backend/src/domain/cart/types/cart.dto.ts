// Use it to type the incoming data
import { CartItemModel } from "./cart.type";

export interface CreateCartDto {
  userId?: string | null;
  sessionId?: string | null;
  currency?: string;
  items?: CartItemModel[];
}

export interface AddItemToCartDto {
  productId: string;
  quantity: number;
  price: number;
  name?: string;
  imageUrl?: string;
}

export interface UpdateCartItemDto {
  quantity: number;
}

export interface ApplyDiscountDto {
  discountCode: string;
  discountAmount?: number;
  discountPercentage?: number;
}