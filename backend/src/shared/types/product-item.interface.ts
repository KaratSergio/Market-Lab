export interface ProductItemBase {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  sku?: string;
  category?: string;
}

export interface ProductItemModel extends ProductItemBase {
  discount?: number;
  subtotal?: number;
  totalPrice?: number;
}

export const PRODUCT_ITEM_DEFAULTS = {
  name: 'Product',
  quantity: 1,
  price: 0,
  discount: 0,
} as const;

//! Helper to calculate fields
export const calculateItemTotals = (item: ProductItemBase & { discount?: number }): {
  subtotal: number;
  totalPrice: number;
} => {
  const subtotal = item.price * item.quantity;
  const totalPrice = subtotal - (item.discount || 0);
  return { subtotal, totalPrice };
};