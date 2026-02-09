export interface CartItemDto {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  discount: number;
  name: string;
  imageUrl?: string;
  weight?: string;
  unit?: string;
  farmer?: string;
  category?: string;
  maxQuantity: number;
}

export interface CartDto {
  id: string;
  userId: string;
  items: CartItemDto[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  currency: string;
  status: 'ACTIVE' | 'PENDING_CHECKOUT' | 'CONVERTED_TO_ORDER' | 'EXPIRED';
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddItemToCartDto {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  imageUrl?: string;
}

export interface UpdateCartItemDto {
  quantity: number;
}

export interface ApplyDiscountDto {
  code?: string;
  discountAmount?: number;
  discountPercentage?: number;
}

export interface CartCheckoutDto {
  cartId: string;
  totalAmount: number;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress?: string;
  paymentMethod?: string;
}

export interface CartStatsDto {
  totalItemsInCarts: number;
  uniqueProductsInCarts: number;
  totalCartValue: number;
  averageCartValue: number;
  abandonedCarts: number;
}

export interface SupplierCartStatsDto {
  supplierId: string;
  totalInCarts: number;
  topProducts: Array<{
    productId: string;
    name: string;
    totalQuantity: number;
    totalValue: number;
  }>;
}