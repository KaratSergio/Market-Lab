import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '@/core/api/category-api';

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters?: any) => [...categoryKeys.lists(), filters] as const,
  parents: () => [...categoryKeys.all, 'parents'] as const,
  children: (parentId?: string) => [...categoryKeys.all, 'children', parentId] as const,
  detail: (id: string) => [...categoryKeys.all, 'detail', id] as const,
} as const;

/**
 * Hook for getting all categories with tree structure
 */
export const useCategories = () => {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: () => categoryApi.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for getting parent categories only
 */
export const useParentCategories = () => {
  return useQuery({
    queryKey: categoryKeys.parents(),
    queryFn: () => categoryApi.getParents(),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook for getting children of a category
 */
export const useCategoryChildren = (parentId?: string) => {
  return useQuery({
    queryKey: categoryKeys.children(parentId),
    queryFn: () => parentId ? categoryApi.getChildren(parentId) : Promise.resolve([]),
    enabled: !!parentId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook for getting category by ID
 */
export const useCategoryById = (id?: string) => {
  return useQuery({
    queryKey: categoryKeys.detail(id || ''),
    queryFn: () => id ? categoryApi.getById(id) : Promise.reject(new Error('No ID provided')),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};