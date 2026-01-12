import { apiFetch } from '@/core/utils/api-utils';
import { SUPPLIER_ENDPOINTS } from '@/core/constants/api-config';
import {
  Supplier,
  CreateSupplierDto,
  UpdateSupplierDto,
  SupplierDocument,
  SuppliersResponse,
  SupplierSearchParams,
  SupplierStatus
} from '@/core/types/supplierTypes';

/**
 * Supplier management API client
 * Includes both public and protected endpoints
 */
export const supplierApi = {
  /**
   * PUBLIC: Get list of active suppliers
   */
  getActiveSuppliers: async (): Promise<Supplier[]> => {
    return apiFetch<Supplier[]>(
      SUPPLIER_ENDPOINTS.PUBLIC_ACTIVE,
      { method: 'GET' }
    );
  },

  /**
   * PUBLIC: Get supplier by ID (public info)
   */
  getSupplierPublic: async (id: string): Promise<Supplier> => {
    return apiFetch<Supplier>(
      SUPPLIER_ENDPOINTS.PUBLIC_BY_ID(id),
      { method: 'GET' }
    );
  },

  /**
   * Get all suppliers (requires admin auth)
   */
  getSuppliers: async (
    token: string,
    params?: SupplierSearchParams
  ): Promise<SuppliersResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.query) searchParams.append('query', params.query);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const url = `${SUPPLIER_ENDPOINTS.SUPPLIERS}?${searchParams.toString()}`;

    return apiFetch<SuppliersResponse>(
      url,
      { method: 'GET' },
      { token }
    );
  },

  /**
   * Get supplier by ID (requires auth)
   */
  getSupplier: async (id: string, token: string): Promise<Supplier> => {
    return apiFetch<Supplier>(
      SUPPLIER_ENDPOINTS.SUPPLIER_BY_ID(id),
      { method: 'GET' },
      { token }
    );
  },

  /**
   * Get current supplier's profile (my profile)
   */
  getMyProfile: async (token: string): Promise<Supplier> => {
    return apiFetch<Supplier>(
      SUPPLIER_ENDPOINTS.PROFILE_MY,
      { method: 'GET' },
      { token }
    );
  },

  /**
   * Update supplier profile
   */
  updateProfile: async (
    data: UpdateSupplierDto,
    token: string
  ): Promise<Supplier> => {
    return apiFetch<Supplier>(
      SUPPLIER_ENDPOINTS.PROFILE_UPDATE,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      { token }
    );
  },

  /**
   * Create new supplier (admin only)
   */
  createSupplier: async (
    data: CreateSupplierDto,
    token: string
  ): Promise<Supplier> => {
    return apiFetch<Supplier>(
      SUPPLIER_ENDPOINTS.SUPPLIERS,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      { token }
    );
  },

  /**
   * Update supplier status (admin only)
   */
  updateStatus: async (
    id: string,
    status: SupplierStatus,
    token: string
  ): Promise<Supplier> => {
    return apiFetch<Supplier>(
      SUPPLIER_ENDPOINTS.UPDATE_STATUS(id),
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      },
      { token }
    );
  },

  /**
   * Upload document for supplier
   */
  uploadDocuments: async (
    supplierId: string,
    files: File[],
    token: string
  ): Promise<string[]> => {
    const formData = new FormData();
    files.forEach(file => { formData.append('files', file) });

    return apiFetch<{ urls: string[] }>(
      SUPPLIER_ENDPOINTS.DOCUMENTS_UPLOAD(supplierId),
      {
        method: 'POST',
        body: formData,
      },
      { token }
    ).then(response => response.urls);
  },

  /**
   * Get supplier documents
   */
  getDocuments: async (
    supplierId: string,
    token: string
  ): Promise<string[]> => {
    return apiFetch<string[]>(
      SUPPLIER_ENDPOINTS.DOCUMENTS(supplierId),
      { method: 'GET' },
      { token }
    );
  },

  /**
   * Delete supplier document
   */
  deleteDocument: async (
    supplierId: string,
    documentUrl: string,
    token: string
  ): Promise<void> => {
    const encodedUrl = encodeURIComponent(documentUrl);

    return apiFetch<void>(
      SUPPLIER_ENDPOINTS.DOCUMENT_DELETE(supplierId, encodedUrl),
      { method: 'DELETE' },
      { token }
    );
  },

  /**
   * Search suppliers
   */
  searchSuppliers: async (
    params: SupplierSearchParams,
    token: string
  ): Promise<SuppliersResponse> => {
    return apiFetch<SuppliersResponse>(
      SUPPLIER_ENDPOINTS.SEARCH,
      {
        method: 'POST',
        body: JSON.stringify(params),
      },
      { token }
    );
  },

  /**
   * Delete supplier (admin only)
   */
  deleteSupplier: async (id: string, token: string): Promise<void> => {
    return apiFetch<void>(
      SUPPLIER_ENDPOINTS.SUPPLIER_BY_ID(id),
      { method: 'DELETE' },
      { token }
    );
  },
} as const;