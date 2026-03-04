import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagApi } from '@/core/api/tag-api';
import { Locale } from '../constants/locales';

import {
  TagFilters,
  CreateTagDto, UpdateTagDto,
  DeleteTranslationParams,
} from '../types/tagTypes';


export const tagKeys = {
  all: ['tags'] as const,
  lists: () => [...tagKeys.all, 'list'] as const,
  list: (filters?: TagFilters) => [...tagKeys.lists(), filters] as const,
  popular: (limit?: number, language?: Locale) => [...tagKeys.all, 'popular', { limit, language }] as const,
  withCounts: (language?: Locale) => [...tagKeys.all, 'withCounts', language] as const,
  byProduct: (productId: string, language?: Locale) => [...tagKeys.all, 'byProduct', productId, language] as const,
  search: (query: string, limit?: number, language?: Locale) => [...tagKeys.all, 'search', query, limit, language] as const,
  bySlug: (slug: string, language?: Locale) => [...tagKeys.all, 'bySlug', slug, language] as const,
  detail: (id: string, language?: Locale) => [...tagKeys.all, 'detail', id, language] as const,
  translations: (id: string) => [...tagKeys.all, 'translations', id] as const,
  byCategoryId: (categoryId: string, language?: Locale) => [...tagKeys.all, 'byCategory', categoryId, language] as const,
  byCategorySlug: (slug: string, language?: Locale) => [...tagKeys.all, 'byCategorySlug', slug, language] as const,
};

/**
 * Hook for getting all tags with optional filters
 */
export const useTags = (filters?: TagFilters) => {
  return useQuery({
    queryKey: tagKeys.list(filters),
    queryFn: () => tagApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for getting popular tags
 */
export const usePopularTags = (limit: number = 20, language?: Locale) => {
  return useQuery({
    queryKey: tagKeys.popular(limit, language),
    queryFn: () => tagApi.getPopular(limit, language),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook for getting tags with product counts
 */
export const useTagsWithCounts = (language?: Locale) => {
  return useQuery({
    queryKey: tagKeys.withCounts(language),
    queryFn: () => tagApi.getWithCounts(language),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook for getting tags by product ID
 */
export const useProductTags = (productId?: string, language?: Locale) => {
  return useQuery({
    queryKey: tagKeys.byProduct(productId || '', language),
    queryFn: () => productId ? tagApi.getByProductId(productId, language) : Promise.resolve([]),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook for searching tags
 */
export const useTagSearch = (query: string, limit: number = 10, language?: Locale) => {
  return useQuery({
    queryKey: tagKeys.search(query, limit, language),
    queryFn: () => tagApi.search(query, limit, language),
    enabled: query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook for getting tag by slug
 */
export const useTagBySlug = (slug?: string, language?: Locale) => {
  return useQuery({
    queryKey: tagKeys.bySlug(slug || '', language),
    queryFn: () => slug ? tagApi.getBySlug(slug, language) : Promise.reject(new Error('No slug provided')),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook for getting tag by ID
 */
export const useTagById = (id?: string, language?: Locale) => {
  return useQuery({
    queryKey: tagKeys.detail(id || '', language),
    queryFn: () => id ? tagApi.getById(id, language) : Promise.reject(new Error('No ID provided')),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook for getting tag translations
 */
export const useTagTranslations = (id?: string) => {
  return useQuery({
    queryKey: tagKeys.translations(id || ''),
    queryFn: () => id ? tagApi.getTranslations(id) : Promise.reject(new Error('No ID provided')),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook for getting tags by category ID
 */
export const useTagsByCategoryId = (categoryId?: string, language?: Locale) => {
  return useQuery({
    queryKey: tagKeys.byCategoryId(categoryId || '', language),
    queryFn: () => categoryId ? tagApi.getByCategoryId(categoryId, language) : Promise.resolve([]),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook for getting tags by category slug
 */
export const useTagsByCategorySlug = (slug?: string, language?: Locale) => {
  return useQuery({
    queryKey: tagKeys.byCategorySlug(slug || '', language),
    queryFn: () => slug ? tagApi.getByCategorySlug(slug, language) : Promise.resolve([]),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook for creating a tag (Admin only)
 */
export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, token }: { data: CreateTagDto; token: string }) =>
      tagApi.create(data, token),
    onSuccess: () => {
      // Invalidate all tag lists
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tagKeys.popular() });
      queryClient.invalidateQueries({ queryKey: tagKeys.withCounts() });
    },
  });
};

/**
 * Hook for updating a tag (Admin only)
 */
export const useUpdateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, token }: { id: string; data: UpdateTagDto; token: string }) =>
      tagApi.update(id, data, token),
    onSuccess: (_, variables) => {
      // Invalidate specific tag and lists
      queryClient.invalidateQueries({ queryKey: tagKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tagKeys.translations(variables.id) });
    },
  });
};

/**
 * Hook for deleting a tag (Admin only)
 */
export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, token }: { id: string; token: string }) =>
      tagApi.delete(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
    },
  });
};

/**
 * Hook for updating tag translations (Admin only)
 */
export const useUpdateTagTranslations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      translations,
      token
    }: {
      id: string;
      translations: Record<Locale, Record<string, string>>;
      token: string
    }) => tagApi.updateTranslations(id, translations, token),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tagKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: tagKeys.translations(variables.id) });
    },
  });
};

/**
 * Hook for deleting tag translations (Admin only)
 */
export const useDeleteTagTranslations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      params,
      token
    }: {
      id: string;
      params: DeleteTranslationParams;
      token: string
    }) => tagApi.deleteTranslations(id, params, token),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tagKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: tagKeys.translations(variables.id) });
    },
  });
};

/**
 * Hook for changing tag status (Admin only)
 */
export const useChangeTagStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      token
    }: {
      id: string;
      status: 'active' | 'inactive';
      token: string
    }) => tagApi.changeStatus(id, status, token),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tagKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
    },
  });
};

/**
 * Hook for syncing product tags (Admin only)
 */
export const useSyncProductTags = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      tagIds,
      token
    }: {
      productId: string;
      tagIds: string[];
      token: string
    }) => tagApi.syncProductTags(productId, tagIds, token),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: tagKeys.byProduct(variables.productId)
      });
      queryClient.invalidateQueries({ queryKey: tagKeys.withCounts() });
      queryClient.invalidateQueries({ queryKey: tagKeys.popular() });
    },
  });
};

/**
 * Hook for merging tags (Admin only)
 */
export const useMergeTags = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sourceTagId,
      targetTagId,
      token
    }: {
      sourceTagId: string;
      targetTagId: string;
      token: string
    }) => tagApi.mergeTags(sourceTagId, targetTagId, token),
    onSuccess: (_, variables) => {
      // Invalidate everything since merging affects many relationships
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
    },
  });
};