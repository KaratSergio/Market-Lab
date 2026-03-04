import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '@/core/api/category-api';
import { Locale } from '../constants/locales';

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters?: any, language?: Locale) => [...categoryKeys.lists(), filters, language] as const,
  parents: (language?: Locale) => [...categoryKeys.all, 'parents', language] as const,
  children: (parentId?: string, language?: Locale) =>
    [...categoryKeys.all, 'children', parentId, language] as const,
  detail: (id: string, language?: Locale) =>
    [...categoryKeys.all, 'detail', id, language] as const,
} as const;

/**
 * Hook for getting all categories with tree structure
 */
export const useCategories = (language?: Locale) => {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: () => categoryApi.getAll(language),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for getting parent categories only
 */
export const useParentCategories = (language?: Locale) => {
  return useQuery({
    queryKey: categoryKeys.parents(language),
    queryFn: () => categoryApi.getParents(language),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook for getting children of a category
 */
export const useCategoryChildren = (parentId?: string, language?: Locale) => {
  return useQuery({
    queryKey: categoryKeys.children(parentId, language),
    queryFn: () => parentId ? categoryApi.getChildren(parentId, language) : Promise.resolve([]),
    enabled: !!parentId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook for getting category by ID
 */
export const useCategoryById = (id?: string, language?: Locale) => {
  return useQuery({
    queryKey: categoryKeys.detail(id || '', language),
    queryFn: () => id ? categoryApi.getById(id, language) : Promise.reject(new Error('No ID provided')),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};