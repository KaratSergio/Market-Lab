import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSupplierStore } from '@/core/store/supplierStore';
import { useAuthStore } from '@/core/store/authStore';
import { supplierApi } from '@/core/api/supplier-api';
import {
  CreateSupplierDto,
  UpdateSupplierDto,
  SupplierSearchParams,
  SupplierStatus,
} from '@/core/types/supplierTypes';

// Query keys
export const supplierKeys = {
  all: ['suppliers'] as const,
  lists: () => [...supplierKeys.all, 'list'] as const,
  list: (filters: SupplierSearchParams) => [...supplierKeys.lists(), filters] as const,
  details: () => [...supplierKeys.all, 'detail'] as const,
  detail: (id: string) => [...supplierKeys.details(), id] as const,
  profile: () => [...supplierKeys.all, 'profile'] as const,
  documents: (supplierId: string) => [...supplierKeys.detail(supplierId), 'documents'] as const,
  public: (id: string) => [...supplierKeys.all, 'public', id] as const,
  active: () => [...supplierKeys.all, 'active'] as const,
} as const;

/**
 * Hook for getting active suppliers (public)
 */
export const useActiveSuppliers = () => {
  return useQuery({
    queryKey: supplierKeys.active(),
    queryFn: () => supplierApi.getActiveSuppliers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for getting supplier public info
 */
export const useSupplierPublic = (id: string) => {
  return useQuery({
    queryKey: supplierKeys.public(id),
    queryFn: () => supplierApi.getSupplierPublic(id),
    enabled: !!id,
  });
};

/**
 * Hook for getting all suppliers (admin)
 */
export const useSuppliers = (params?: SupplierSearchParams) => {
  const { token } = useAuthStore();
  const { setSuppliers, setFilteredSuppliers } = useSupplierStore();

  return useQuery({
    queryKey: supplierKeys.list(params || {}),
    queryFn: async () => {
      const data = await supplierApi.getSuppliers(token!, params);
      setSuppliers(data.suppliers);
      setFilteredSuppliers(data.suppliers);
      return data;
    },
    enabled: !!token,
  });
};

/**
 * Hook for getting specific supplier
 */
export const useSupplier = (id: string) => {
  const { token } = useAuthStore();
  const { setSelectedSupplier } = useSupplierStore();

  return useQuery({
    queryKey: supplierKeys.detail(id),
    queryFn: async () => {
      const data = await supplierApi.getSupplier(id, token!);
      setSelectedSupplier(data);
      return data;
    },
    enabled: !!token && !!id,
  });
};

/**
 * Hook for getting current supplier profile
 */
export const useMySupplierProfile = () => {
  const { token } = useAuthStore();
  const { setCurrentSupplier } = useSupplierStore();

  return useQuery({
    queryKey: supplierKeys.profile(),
    queryFn: async () => {
      const data = await supplierApi.getMyProfile(token!);
      setCurrentSupplier(data);
      return data;
    },
    enabled: !!token,
    retry: 1,
  });
};

/**
 * Hook for creating supplier (admin)
 */
export const useCreateSupplier = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSupplierDto) =>
      supplierApi.createSupplier(data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
    },
  });
};

/**
 * Hook for updating supplier profile
 */
export const useUpdateSupplierProfile = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const { setCurrentSupplier } = useSupplierStore();

  return useMutation({
    mutationFn: (data: UpdateSupplierDto) =>
      supplierApi.updateProfile(data, token!),
    onSuccess: (updatedSupplier) => {
      setCurrentSupplier(updatedSupplier);
      queryClient.invalidateQueries({ queryKey: supplierKeys.profile() });
      queryClient.invalidateQueries({
        queryKey: supplierKeys.detail(updatedSupplier.id)
      });
    },
  });
};

/**
 * Hook for updating supplier status (admin)
 */
export const useUpdateSupplierStatus = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SupplierStatus }) =>
      supplierApi.updateStatus(id, status, token!),
    onSuccess: (updatedSupplier) => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: supplierKeys.detail(updatedSupplier.id)
      });
      queryClient.invalidateQueries({ queryKey: supplierKeys.profile() });
    },
  });
};

/**
 * Hook for uploading supplier document
 */
export const useUploadSupplierDocuments = () => {
  const { token } = useAuthStore();
  const { currentSupplier, addDocuments } = useSupplierStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (files: File[]) => {
      if (!currentSupplier) throw new Error('No current supplier');
      return supplierApi.uploadDocuments(currentSupplier.id, files, token!);
    },
    onSuccess: (urls) => {
      addDocuments(urls);
      if (currentSupplier) {
        queryClient.invalidateQueries({
          queryKey: supplierKeys.documents(currentSupplier.id)
        });
        queryClient.invalidateQueries({
          queryKey: supplierKeys.profile()
        });
      }
    },
  });
};

/**
 * Hook for getting supplier documents
 */
export const useSupplierDocuments = (supplierId: string) => {
  const { token } = useAuthStore();
  const { setDocuments } = useSupplierStore();

  return useQuery({
    queryKey: supplierKeys.documents(supplierId),
    queryFn: async () => {
      const documents = await supplierApi.getDocuments(supplierId, token!);
      setDocuments(documents);
      return documents;
    },
    enabled: !!token && !!supplierId,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook for deleting supplier document
 */
export const useDeleteSupplierDocument = () => {
  const { token } = useAuthStore();
  const { currentSupplier, removeDocumentByUrl } = useSupplierStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentUrl: string) => {
      if (!currentSupplier) throw new Error('No current supplier');

      return supplierApi.deleteDocument(
        currentSupplier.id,
        documentUrl,
        token!
      );
    },
    onSuccess: (_, documentUrl) => {
      removeDocumentByUrl(documentUrl);
      if (currentSupplier) {
        queryClient.invalidateQueries({
          queryKey: supplierKeys.documents(currentSupplier.id)
        });
        queryClient.invalidateQueries({
          queryKey: supplierKeys.profile()
        });
      }
    },
  });
};

/**
 * Hook for searching suppliers
 */
export const useSearchSuppliers = () => {
  const { token } = useAuthStore();
  const { setFilteredSuppliers } = useSupplierStore();

  return useMutation({
    mutationFn: async (params: SupplierSearchParams) => {
      const data = await supplierApi.searchSuppliers(params, token!);
      setFilteredSuppliers(data.suppliers);
      return data;
    },
  });
};

/**
 * Hook for deleting supplier (admin)
 */
export const useDeleteSupplier = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => supplierApi.deleteSupplier(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
    },
  });
};