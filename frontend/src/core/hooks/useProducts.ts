import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/core/store/authStore';
import { useProductStore } from '@/core/store/productStore';
import { productApi } from '@/core/api/product-api';

import {
  CreateProductDto,
  UpdateProductDto,
  RestockProductDto,
  ProductStatus,
  Product,
} from '@/core/types/productTypes';

// Query keys for supplier products
export const supplierProductKeys = {
  all: ['supplier-products'] as const,
  lists: () => [...supplierProductKeys.all, 'list'] as const,
  list: (filters?: any) => [...supplierProductKeys.lists(), filters] as const,
  details: () => [...supplierProductKeys.all, 'detail'] as const,
  detail: (id: string) => [...supplierProductKeys.details(), id] as const,
  ownership: (id: string) => [...supplierProductKeys.detail(id), 'ownership'] as const,
} as const;

// Public product keys (for public catalog)
export const publicProductKeys = {
  all: ['public-products'] as const,
  lists: () => [...publicProductKeys.all, 'list'] as const,
  list: (filters?: any) => [...publicProductKeys.lists(), filters] as const,
  detail: (id: string) => [...publicProductKeys.all, 'detail', id] as const,
} as const;

/**
 * Hook for getting supplier's products (React Query only)
 */

export const useSupplierProducts = () => {
  const { token } = useAuthStore();
  const { setLoading, setError } = useProductStore();

  return useQuery<Product[]>({
    queryKey: supplierProductKeys.lists(),
    queryFn: async (): Promise<Product[]> => {
      setLoading(true);
      try {
        const products = await productApi.getMyProducts(token!);
        return products;
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load products');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook for creating a new product
 */
export const useCreateSupplierProduct = () => {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  const { setLoading, setError, setSuccessMessage } = useProductStore();

  return useMutation({
    mutationFn: async (payload: { data: CreateProductDto; images: File[] }) => {
      setLoading(true);
      try {
        const product = await productApi.createProduct(
          payload.data,
          payload.images,
          token!
        );
        setSuccessMessage('Product created successfully');
        return product;
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to create product');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierProductKeys.lists() });
    },
  });
};

/**
 * Hook for updating a product
 */
export const useUpdateSupplierProduct = () => {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  const { setLoading, setError, setSuccessMessage } = useProductStore();

  return useMutation({
    mutationFn: async (payload: {
      id: string;
      data: UpdateProductDto;
      images?: File[];
    }) => {
      setLoading(true);
      try {
        const product = await productApi.updateProduct(
          payload.id,
          payload.data,
          payload.images || [],
          token!
        );
        setSuccessMessage('Product updated successfully');
        return product;
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to update product');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: supplierProductKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: supplierProductKeys.lists() });
    },
  });
};

/**
 * Hook for deleting a product
 */
export const useDeleteSupplierProduct = () => {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  const { setLoading, setError, setSuccessMessage } = useProductStore();

  return useMutation({
    mutationFn: async (id: string) => {
      setLoading(true);
      try {
        await productApi.deleteProduct(id, token!);
        setSuccessMessage('Product deleted successfully');
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to delete product');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierProductKeys.lists() });
    },
  });
};

/**
 * Hook for updating product status
 */
export const useUpdateSupplierProductStatus = () => {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  const { setLoading, setError, setSuccessMessage } = useProductStore();

  return useMutation({
    mutationFn: async (payload: { id: string; status: ProductStatus }) => {
      setLoading(true);
      try {
        const product = await productApi.updateProductStatus(
          payload.id,
          payload.status,
          token!
        );
        const action = payload.status === 'active' ? 'activated' : 'deactivated';
        setSuccessMessage(`Product ${action}`);
        return product;
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to update product status');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: supplierProductKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: supplierProductKeys.lists() });
    },
  });
};

/**
 * Hook for restocking a product
 */
export const useRestockSupplierProduct = () => {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  const { setLoading, setError, setSuccessMessage } = useProductStore();

  return useMutation({
    mutationFn: async (payload: { id: string; data: RestockProductDto }) => {
      setLoading(true);
      try {
        const product = await productApi.restockProduct(
          payload.id,
          payload.data,
          token!
        );
        setSuccessMessage(`Restocked ${payload.data.quantity} units`);
        return product;
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to restock product');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: supplierProductKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: supplierProductKeys.lists() });
    },
  });
};

/**
 * Hook for adding images to product
 */
export const useAddSupplierProductImages = () => {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  const { setLoading, setError, setSuccessMessage } = useProductStore();

  return useMutation({
    mutationFn: async (payload: { id: string; images: File[] }) => {
      setLoading(true);
      try {
        const result = await productApi.addProductImages(
          payload.id,
          payload.images,
          token!
        );
        setSuccessMessage(`${result.urls.length} image(s) added successfully`);
        return result;
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to add images');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: supplierProductKeys.detail(variables.id) });
    },
  });
};

/**
 * Hook for getting product by ID (supplier)
 */
export const useSupplierProduct = (id: string) => {
  const { token } = useAuthStore();
  const { setLoading, setError } = useProductStore();

  return useQuery<Product>({
    queryKey: supplierProductKeys.detail(id),
    queryFn: async () => {
      setLoading(true);
      try {
        const product = await productApi.getProductById(id);
        return product;
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load product');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!token && !!id,
  });
};

/**
 * Hook for checking product ownership
 */
export const useCheckProductOwnership = (id: string) => {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: supplierProductKeys.ownership(id),
    queryFn: async () => {
      return await productApi.checkOwnership(id, token!);
    },
    enabled: !!token && !!id,
  });
};

// PUBLIC PRODUCT HOOKS

/**
 * Hook for getting public active products
 */
export const usePublicActiveProducts = (
  options: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sortBy?: 'price' | 'name' | 'createdAt' | 'stock';
    sortOrder?: 'ASC' | 'DESC';
    stock?: 'in-stock' | 'low-stock' | 'out-of-stock';
  } = {}
) => {
  const { page = 1, limit = 12, category, search, sortBy, sortOrder, stock } = options;

  return useQuery({
    queryKey: publicProductKeys.list({ page, limit, category, search, sortBy, sortOrder, stock, status: 'active' }),
    queryFn: async () => {
      const response = await productApi.getAllProducts({
        status: 'active',
        page,
        limit,
        category,
        search,
        sortBy,
        sortOrder,
        stock,
      });

      return {
        products: response.data || [],
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      };
    },
  });
};

/**
 * Hook for getting a single public product
 */
export const usePublicProduct = (id: string) => {
  return useQuery({
    queryKey: publicProductKeys.detail(id),
    queryFn: async () => {
      const product = await productApi.getProductById(id);
      return product;
    },
    enabled: !!id,
  });
};

/**
 * Hook for searching public products
 */
export const useSearchPublicProducts = (
  params: {
    search: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }
) => {
  return useQuery({
    queryKey: publicProductKeys.list(params),
    queryFn: async () => {
      const response = await productApi.searchProducts(
        params.search,
        params.category,
        params.minPrice,
        params.maxPrice,
        params.page,
        params.limit
      );

      return {
        products: response.data || [],
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      };
    },
    enabled: !!params.search || !!params.category,
  });
};