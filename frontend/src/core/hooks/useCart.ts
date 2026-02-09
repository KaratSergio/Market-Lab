import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '@/core/api/cart-api';
import {
  AddItemToCartDto,
  UpdateCartItemDto,
  ApplyDiscountDto,
} from '@/core/types/cartTypes';
import { useAuthStore } from '@/core/store/authStore';

// Query keys
export const cartKeys = {
  all: ['cart'] as const,
  details: () => [...cartKeys.all, 'detail'] as const,
  supplierStats: () => [...cartKeys.all, 'supplier-stats'] as const,
  expiredCarts: () => [...cartKeys.all, 'expired'] as const,
};

/**
 * Hook for getting the current user's cart
 */
export const useCart = () => {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: cartKeys.details(),
    queryFn: () => cartApi.getCart(token!),
    enabled: !!token && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook for adding an item to cart
 */
export const useAddToCart = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (item: AddItemToCartDto) => cartApi.addItem(item, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.details() });
    },
    onError: (error: Error) => {
      console.error('Failed to add item to cart:', error);
    },
  });
};

/**
 * Hook for updating cart item quantity
 */
export const useUpdateCartItem = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      cartApi.updateItem(productId, { quantity }, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.details() });
    },
    onError: (error: Error) => {
      console.error('Failed to update cart item:', error);
    },
  });
};

/**
 * Hook for removing item from cart
 */
export const useRemoveFromCart = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => cartApi.removeItem(productId, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.details() });
    },
    onError: (error: Error) => {
      console.error('Failed to remove item from cart:', error);
    },
  });
};

/**
 * Hook for applying discount to cart
 */
export const useApplyDiscount = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (discountData: ApplyDiscountDto) =>
      cartApi.applyDiscount(discountData, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.details() });
    },
    onError: (error: Error) => {
      console.error('Failed to apply discount:', error);
    },
  });
};

/**
 * Hook for clearing the cart
 */
export const useClearCart = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartApi.clearCart(token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.details() });
    },
    onError: (error: Error) => {
      console.error('Failed to clear cart:', error);
    },
  });
};

/**
 * Hook for preparing cart for checkout
 */
export const usePrepareCheckout = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartApi.prepareCheckout(token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.details() });
    },
    onError: (error: Error) => {
      console.error('Failed to prepare checkout:', error);
    },
  });
};

/**
 * Hook for getting supplier cart statistics
 */
export const useSupplierCartStats = () => {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: cartKeys.supplierStats(),
    queryFn: () => cartApi.getSupplierStats(token!),
    enabled: !!token && isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook for getting expired carts (Admin only)
 */
export const useExpiredCarts = () => {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: cartKeys.expiredCarts(),
    queryFn: () => cartApi.getExpiredCarts(token!),
    enabled: !!token && isAuthenticated,
  });
};

/**
 * Hook for cleaning up expired carts (Admin only)
 */
export const useCleanupExpiredCarts = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartApi.cleanupExpiredCarts(token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.expiredCarts() });
    },
    onError: (error: Error) => {
      console.error('Failed to cleanup expired carts:', error);
    },
  });
};