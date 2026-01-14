import { apiFetch } from '@/core/utils/api-utils';
import { PRODUCT_ENDPOINTS } from '@/core/constants/api-config';

import {
  Product,
  CreateProductDto,
  UpdateProductDto,
  RestockProductDto,
  PurchaseProductDto,
  ProductsResponse,
  ProductStatus,
  ImageUploadResponse,
  OwnershipInfo,
  ProductStatistics,
  ProductSearchParams,
} from '@/core/types/productTypes';


/**
 * Product management API client
 * Includes public, supplier, customer, and admin endpoints
 */
export const productApi = {
  // ================= PUBLIC ENDPOINTS =================

  /**
   * PUBLIC: Get all products with optional filtering
   */
  getAllProducts: async (
    params?: ProductSearchParams
  ): Promise<ProductsResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.category) searchParams.append('category', params.category);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);

    const url = params ?
      `${PRODUCT_ENDPOINTS.GET_ALL_PUBLIC}?${searchParams.toString()}` :
      PRODUCT_ENDPOINTS.GET_ALL_PUBLIC;

    return apiFetch<ProductsResponse>(
      url,
      { method: 'GET' }
    );
  },

  /**
   * PUBLIC: Get product by ID
   */
  getProductById: async (id: string): Promise<Product> => {
    return apiFetch<Product>(
      PRODUCT_ENDPOINTS.GET_BY_ID_PUBLIC(id),
      { method: 'GET' }
    );
  },

  /**
   * PUBLIC: Get product categories
   */
  getCategories: async (): Promise<string[]> => {
    return apiFetch<string[]>(
      PRODUCT_ENDPOINTS.GET_CATEGORIES,
      { method: 'GET' }
    );
  },

  // ================= SUPPLIER ENDPOINTS =================

  /**
   * CREATE: Create new product (Supplier Only)
   */
  createProduct: async (
    data: CreateProductDto,
    images: File[],
    token: string
  ): Promise<Product> => {
    const formData = new FormData();

    // Append product data as JSON (field name should match backend expectation)
    // Based on your endpoint, it expects the DTO directly in body, not nested in 'data'
    const productData = {
      name: data.name,
      description: data.description,
      price: data.price,
      categoryId: data.categoryId,
      subcategoryId: data.subcategoryId,
      stock: data.stock,
      status: data.status || 'draft',
    };

    formData.append('data', JSON.stringify(productData));

    // Append images (field name 'images' as per FilesInterceptor)
    images.forEach(file => {
      formData.append('images', file);
    });

    return apiFetch<Product>(
      PRODUCT_ENDPOINTS.CREATE,
      {
        method: 'POST',
        body: formData,
      },
      { token }
    );
  },

  /**
   * READ: Get supplier's products (Supplier Only)
   */
  getMyProducts: async (token: string): Promise<Product[]> => {
    return apiFetch<Product[]>(
      PRODUCT_ENDPOINTS.SUPPLIER_MY,
      { method: 'GET' },
      { token }
    );
  },

  /**
   * UPDATE: Update product (Supplier or Admin)
   */
  updateProduct: async (
    id: string,
    data: UpdateProductDto,
    newImages: File[],
    token: string
  ): Promise<Product> => {
    const formData = new FormData();

    // Append update data
    const updateData = {
      name: data.name,
      description: data.description,
      price: data.price,
      categoryId: data.categoryId,
      subcategoryId: data.subcategoryId,
      stock: data.stock,
      status: data.status,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    formData.append('data', JSON.stringify(updateData));

    // Append new images if any (field name 'newImages' as per FilesInterceptor)
    newImages.forEach(file => {
      formData.append('newImages', file);
    });

    return apiFetch<Product>(
      PRODUCT_ENDPOINTS.UPDATE(id),
      {
        method: 'PUT',
        body: formData,
      },
      { token }
    );
  },

  /**
   * UPDATE: Restock product (Supplier Only)
   */
  restockProduct: async (
    id: string,
    data: RestockProductDto,
    token: string
  ): Promise<Product> => {
    return apiFetch<Product>(
      PRODUCT_ENDPOINTS.RESTOCK(id),
      {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      },
      { token }
    );
  },

  // ================= IMAGE MANAGEMENT =================

  /**
   * UPDATE: Add images to product (Supplier or Admin)
   */
  addProductImages: async (
    id: string,
    images: File[],
    token: string
  ): Promise<ImageUploadResponse> => {
    const formData = new FormData();

    // Append images (field name 'images' as per FilesInterceptor)
    images.forEach(file => {
      formData.append('images', file);
    });

    return apiFetch<ImageUploadResponse>(
      PRODUCT_ENDPOINTS.ADD_IMAGES(id),
      {
        method: 'POST',
        body: formData,
      },
      { token }
    );
  },

  /**
   * DELETE: Remove image from product (Supplier or Admin)
   */
  removeProductImage: async (
    id: string,
    imageUrl: string,
    token: string
  ): Promise<void> => {
    return apiFetch<void>(
      PRODUCT_ENDPOINTS.REMOVE_IMAGE(id),
      {
        method: 'DELETE',
        body: JSON.stringify({ imageUrl }),
        headers: {
          'Content-Type': 'application/json',
        },
      },
      { token }
    );
  },

  // ================= SHARED ENDPOINTS =================

  /**
   * DELETE: Delete product (Supplier or Admin)
   */
  deleteProduct: async (
    id: string,
    token: string
  ): Promise<void> => {
    return apiFetch<void>(
      PRODUCT_ENDPOINTS.DELETE(id),
      { method: 'DELETE' },
      { token }
    );
  },

  /**
   * UPDATE: Update product status (Supplier or Admin)
   */
  updateProductStatus: async (
    id: string,
    status: ProductStatus,
    token: string
  ): Promise<Product> => {
    return apiFetch<Product>(
      PRODUCT_ENDPOINTS.UPDATE_STATUS(id),
      {
        method: 'PUT',
        body: JSON.stringify({ status }),
        headers: {
          'Content-Type': 'application/json',
        },
      },
      { token }
    );
  },

  /**
   * READ: Check product ownership (Authenticated)
   */
  checkOwnership: async (
    id: string,
    token: string
  ): Promise<OwnershipInfo> => {
    return apiFetch<OwnershipInfo>(
      PRODUCT_ENDPOINTS.OWNERSHIP(id),
      { method: 'GET' },
      { token }
    );
  },

  // ================= CUSTOMER ENDPOINTS =================

  /**
   * CREATE: Purchase product (Customer Only)
   */
  purchaseProduct: async (
    id: string,
    data: PurchaseProductDto,
    token: string
  ): Promise<{ success: boolean; orderId: string; message: string }> => {
    return apiFetch<{ success: boolean; orderId: string; message: string }>(
      PRODUCT_ENDPOINTS.PURCHASE(id),
      {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      },
      { token }
    );
  },

  // ================= ADMIN ENDPOINTS =================

  /**
   * READ: Get product statistics (Admin Only)
   */
  getProductStatistics: async (
    token: string
  ): Promise<ProductStatistics> => {
    return apiFetch<ProductStatistics>(
      PRODUCT_ENDPOINTS.STATISTICS,
      { method: 'GET' },
      { token }
    );
  },

  /**
   * READ: Get all products including inactive (Admin Only)
   */
  getAllProductsAdmin: async (
    status?: ProductStatus,
    token?: string
  ): Promise<Product[]> => {
    const searchParams = new URLSearchParams();
    if (status) searchParams.append('status', status);

    const url = status ?
      `${PRODUCT_ENDPOINTS.ADMIN_ALL}?${searchParams.toString()}` :
      PRODUCT_ENDPOINTS.ADMIN_ALL;

    return apiFetch<Product[]>(
      url,
      { method: 'GET' },
      { token: token! }
    );
  },

  /**
   * DELETE: Force delete product (Admin Only)
   */
  forceDeleteProduct: async (
    id: string,
    token: string
  ): Promise<void> => {
    return apiFetch<void>(
      PRODUCT_ENDPOINTS.FORCE_DELETE(id),
      { method: 'DELETE' },
      { token }
    );
  },

  /**
   * READ: Get low stock products (Admin Only)
   */
  getLowStockProducts: async (
    threshold: number = 10,
    token: string
  ): Promise<Product[]> => {
    const searchParams = new URLSearchParams();
    searchParams.append('threshold', threshold.toString());

    return apiFetch<Product[]>(
      `${PRODUCT_ENDPOINTS.LOW_STOCK}?${searchParams.toString()}`,
      { method: 'GET' },
      { token }
    );
  },

  // ================= UTILITY METHODS =================

  /**
   * Search products by text
   */
  searchProducts: async (
    query: string,
    category?: string,
    minPrice?: number,
    maxPrice?: number,
    page?: number,
    limit?: number
  ): Promise<ProductsResponse> => {
    const params: ProductSearchParams = { search: query };

    if (category) params.category = category;
    if (minPrice !== undefined) params.minPrice = minPrice;
    if (maxPrice !== undefined) params.maxPrice = maxPrice;
    if (page !== undefined) params.page = page;
    if (limit !== undefined) params.limit = limit;

    return productApi.getAllProducts(params);
  },

  /**
   * Get products by category
   */
  getProductsByCategory: async (
    category: string,
    page?: number,
    limit?: number
  ): Promise<ProductsResponse> => {
    const params: ProductSearchParams = { category };

    if (page !== undefined) params.page = page;
    if (limit !== undefined) params.limit = limit;

    return productApi.getAllProducts(params);
  },

  /**
   * Get paginated products
   */
  getPaginatedProducts: async (
    page: number = 1,
    limit: number = 10,
    category?: string,
    search?: string
  ): Promise<ProductsResponse> => {
    const params: ProductSearchParams = { page, limit };

    if (category) params.category = category;
    if (search) params.search = search;

    return productApi.getAllProducts(params);
  },
} as const;

/**
 * Utility function to prepare form data for product operations
 */
export const prepareProductFormData = (
  productData: CreateProductDto | UpdateProductDto,
  images: File[] = [],
  imageFieldName: string = 'images'
): FormData => {
  const formData = new FormData();

  // Add product data
  const cleanData = { ...productData };
  Object.keys(cleanData).forEach(key => {
    if (cleanData[key as keyof typeof cleanData] === undefined) {
      delete cleanData[key as keyof typeof cleanData];
    }
  });

  formData.append('data', JSON.stringify(cleanData));

  // Add images
  images.forEach(file => {
    formData.append(imageFieldName, file);
  });

  return formData;
};

/**
 * Utility function to validate image files before upload
 */
export const validateProductImages = (
  files: File[],
  options: {
    maxCount?: number;
    maxSizeMB?: number;
    allowedTypes?: string[];
  } = {}
): { isValid: boolean; errors: string[] } => {
  const {
    maxCount = 4,
    maxSizeMB = 5,
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  } = options;

  const errors: string[] = [];

  // Check count
  if (files.length > maxCount) {
    errors.push(`Maximum ${maxCount} images allowed`);
  }

  // Check each file
  files.forEach((file, index) => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File ${index + 1}: Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
    }

    // Check file size (MB to bytes)
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      errors.push(`File ${index + 1}: File too large. Maximum: ${maxSizeMB}MB`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Types for product API responses
 */
export interface ProductApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Helper function to handle API responses consistently
 */
export const handleProductApiResponse = async <T>(
  promise: Promise<T>
): Promise<ProductApiResponse<T>> => {
  try {
    const data = await promise;
    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to complete product operation'
    };
  }
};