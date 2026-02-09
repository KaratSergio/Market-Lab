import { apiFetch } from '@/core/utils/api-utils';
import { CART_ENDPOINTS } from '@/core/constants/api-config';
import {
  CartDto,
  AddItemToCartDto,
  UpdateCartItemDto,
  ApplyDiscountDto,
  CartCheckoutDto,
  CartStatsDto,
  SupplierCartStatsDto,
} from '@/core/types/cartTypes';

/**
 * Cart management API client
 * Requires authentication token for all operations
 */
export const cartApi = {
  /**
   * Retrieves the current user's cart
   * @param token JWT authentication token
   */
  getCart: async (token: string): Promise<CartDto> => {
    return apiFetch<CartDto>(
      CART_ENDPOINTS.GET_CART,
      { method: 'GET' },
      { token }
    );
  },

  /**
   * Adds an item to the cart
   * @param item Cart item data
   * @param token JWT authentication token
   */
  addItem: async (item: AddItemToCartDto, token: string): Promise<CartDto> => {
    return apiFetch<CartDto>(
      CART_ENDPOINTS.ADD_ITEM,
      {
        method: 'POST',
        body: JSON.stringify(item),
      },
      { token }
    );
  },

  /**
   * Updates quantity of a specific item in the cart
   * @param productId Product identifier
   * @param updateData Update data
   * @param token JWT authentication token
   */
  updateItem: async (
    productId: string,
    updateData: UpdateCartItemDto,
    token: string
  ): Promise<CartDto> => {
    return apiFetch<CartDto>(
      CART_ENDPOINTS.UPDATE_ITEM(productId),
      {
        method: 'PUT',
        body: JSON.stringify(updateData),
      },
      { token }
    );
  },

  /**
   * Removes an item from the cart
   * @param productId Product identifier to remove
   * @param token JWT authentication token
   */
  removeItem: async (productId: string, token: string): Promise<void> => {
    return apiFetch<void>(
      CART_ENDPOINTS.REMOVE_ITEM(productId),
      { method: 'DELETE' },
      { token }
    );
  },

  /**
   * Applies discount to the cart
   * @param discountData Discount data
   * @param token JWT authentication token
   */
  applyDiscount: async (
    discountData: ApplyDiscountDto,
    token: string
  ): Promise<CartDto> => {
    return apiFetch<CartDto>(
      CART_ENDPOINTS.APPLY_DISCOUNT,
      {
        method: 'POST',
        body: JSON.stringify(discountData),
      },
      { token }
    );
  },

  /**
   * Clears all items from the cart
   * @param token JWT authentication token
   */
  clearCart: async (token: string): Promise<void> => {
    return apiFetch<void>(
      CART_ENDPOINTS.CLEAR_CART,
      { method: 'POST' },
      { token }
    );
  },

  /**
   * Prepares cart for checkout
   * @param token JWT authentication token
   */
  prepareCheckout: async (token: string): Promise<CartCheckoutDto> => {
    return apiFetch<CartCheckoutDto>(
      CART_ENDPOINTS.CHECKOUT,
      { method: 'POST' },
      { token }
    );
  },

  /**
   * Gets supplier cart statistics
   * @param token JWT authentication token
   */
  getSupplierStats: async (token: string): Promise<SupplierCartStatsDto> => {
    return apiFetch<SupplierCartStatsDto>(
      CART_ENDPOINTS.SUPPLIER_STATS,
      { method: 'GET' },
      { token }
    );
  },

  /**
   * Gets expired carts (Admin only)
   * @param token JWT authentication token
   */
  getExpiredCarts: async (token: string): Promise<CartDto[]> => {
    return apiFetch<CartDto[]>(
      CART_ENDPOINTS.EXPIRED_CARTS,
      { method: 'GET' },
      { token }
    );
  },

  /**
   * Cleans up expired carts (Admin only)
   * @param token JWT authentication token
   */
  cleanupExpiredCarts: async (token: string): Promise<void> => {
    return apiFetch<void>(
      CART_ENDPOINTS.CLEANUP_CARTS,
      { method: 'POST' },
      { token }
    );
  },
} as const;