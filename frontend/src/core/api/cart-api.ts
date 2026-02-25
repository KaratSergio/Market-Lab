import { apiFetch } from '@/core/utils/api-utils';
import { CART_ENDPOINTS } from '@/core/constants/api-config';
import {
  CartDto,
  AddItemToCartDto,
  UpdateCartItemDto,
  ApplyDiscountDto,
  CartCheckoutDto,
  SupplierCartStatsDto,
} from '@/core/types/cartTypes';

/**
 * Helper function to create request options with proper credentials
 */
const createRequestOptions = (
  method: string,
  body?: ApplyDiscountDto | UpdateCartItemDto | AddItemToCartDto,
  token?: string | null
): { options: RequestInit; config?: { token: string } } => {
  const options: RequestInit = { method };
  if (body) options.body = JSON.stringify(body);
  if (!token) options.credentials = 'include';

  return {
    options,
    config: token ? { token } : undefined,
  };
};

/**
 * Cart management API client
 * Works for both guests (without token) and authenticated users
 */
export const cartApi = {
  /**
   * Retrieves the current cart (works for guests and authenticated users)
   * @param token Optional JWT token for authenticated users
   */
  getCart: async (token?: string | null): Promise<CartDto> => {
    const { options, config } = createRequestOptions('GET', undefined, token);
    return apiFetch<CartDto>(CART_ENDPOINTS.GET_CART, options, config);
  },

  /**
   * Adds an item to the cart (works for guests and authenticated users)
   * @param item Cart item data
   * @param token Optional JWT token for authenticated users
   */
  addItem: async (item: AddItemToCartDto, token?: string | null): Promise<CartDto> => {
    const { options, config } = createRequestOptions('POST', item, token);
    return apiFetch<CartDto>(CART_ENDPOINTS.ADD_ITEM, options, config);
  },

  /**
   * Updates quantity of a specific item in the cart (works for guests and authenticated users)
   * @param productId Product identifier
   * @param updateData Update data
   * @param token Optional JWT token for authenticated users
   */
  updateItem: async (
    productId: string,
    updateData: UpdateCartItemDto,
    token?: string | null
  ): Promise<CartDto> => {
    const { options, config } = createRequestOptions('PUT', updateData, token);
    return apiFetch<CartDto>(CART_ENDPOINTS.UPDATE_ITEM(productId), options, config);
  },

  /**
   * Removes an item from the cart (works for guests and authenticated users)
   * @param productId Product identifier to remove
   * @param token Optional JWT token for authenticated users
   */
  removeItem: async (productId: string, token?: string | null): Promise<void> => {
    const { options, config } = createRequestOptions('DELETE', undefined, token);
    return apiFetch<void>(CART_ENDPOINTS.REMOVE_ITEM(productId), options, config);
  },

  /**
   * Applies discount to the cart (works for guests and authenticated users)
   * @param discountData Discount data
   * @param token Optional JWT token for authenticated users
   */
  applyDiscount: async (
    discountData: ApplyDiscountDto,
    token?: string | null
  ): Promise<CartDto> => {
    const { options, config } = createRequestOptions('POST', discountData, token);
    return apiFetch<CartDto>(CART_ENDPOINTS.APPLY_DISCOUNT, options, config);
  },

  /**
   * Clears all items from the cart (works for guests and authenticated users)
   * @param token Optional JWT token for authenticated users
   */
  clearCart: async (token?: string | null): Promise<void> => {
    const { options, config } = createRequestOptions('POST', undefined, token);
    return apiFetch<void>(CART_ENDPOINTS.CLEAR_CART, options, config);
  },

  /**
   * Merges guest cart with user cart after login
   * @param token JWT token (required)
   */
  mergeCart: async (token: string | null): Promise<CartDto> => {
    const { options, config } = createRequestOptions('POST', undefined, token);
    return apiFetch<CartDto>(CART_ENDPOINTS.MERGE_CART, options, config);
  },

  /**
   * Prepares cart for checkout (requires authentication)
   * @param token JWT token (required)
   */
  prepareCheckout: async (token: string | null): Promise<CartCheckoutDto> => {
    const { options, config } = createRequestOptions('POST', undefined, token);
    return apiFetch<CartCheckoutDto>(CART_ENDPOINTS.CHECKOUT, options, config);
  },

  /**
   * Gets supplier cart statistics (requires authentication)
   * @param token JWT token (required)
   */
  getSupplierStats: async (token: string): Promise<SupplierCartStatsDto> => {
    const { options, config } = createRequestOptions('GET', undefined, token);
    return apiFetch<SupplierCartStatsDto>(CART_ENDPOINTS.SUPPLIER_STATS, options, config);
  },

  /**
   * Gets expired carts (Admin only, requires authentication)
   * @param token JWT token (required)
   */
  getExpiredCarts: async (token: string): Promise<CartDto[]> => {
    const { options, config } = createRequestOptions('GET', undefined, token);
    return apiFetch<CartDto[]>(CART_ENDPOINTS.EXPIRED_CARTS, options, config);
  },

  /**
   * Cleans up expired carts (Admin only, requires authentication)
   * @param token JWT token (required)
   */
  cleanupExpiredCarts: async (token: string): Promise<void> => {
    const { options, config } = createRequestOptions('POST', undefined, token);
    return apiFetch<void>(CART_ENDPOINTS.CLEANUP_CARTS, options, config);
  },
} as const;