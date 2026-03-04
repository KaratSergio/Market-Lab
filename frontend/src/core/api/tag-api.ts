import { apiFetch } from '@/core/utils/api-utils';
import { TAG_ENDPOINTS } from '@/core/constants/api-config';
import { Locale } from '../constants/locales';

import {
  Tag, TagWithTranslations, TagWithProductCount,
  PopularTag, CreateTagDto, UpdateTagDto,
  TagFilters, SyncProductTagsResult,
  MergeTagsResult, DeleteTranslationParams,
} from '../types/tagTypes';


export const tagApi = {
  /**
   * Get all tags with optional filters and localization
   */
  getAll: async (filters?: TagFilters): Promise<Tag[]> => {
    const params = new URLSearchParams();

    if (filters?.language) params.append('language', filters.language);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `${TAG_ENDPOINTS.GET_ALL}?${queryString}` : TAG_ENDPOINTS.GET_ALL;

    return apiFetch<Tag[]>(endpoint, { method: 'GET' });
  },

  /**
   * Get popular tags with product count
   */
  getPopular: async (limit: number = 20, language?: Locale): Promise<PopularTag[]> => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (language) params.append('language', language);

    return apiFetch<PopularTag[]>(
      `${TAG_ENDPOINTS.GET_POPULAR}?${params.toString()}`,
      { method: 'GET' }
    );
  },

  /**
   * Get all tags with product counts
   */
  getWithCounts: async (language?: Locale): Promise<TagWithProductCount[]> => {
    const params = language ? `?language=${language}` : '';
    return apiFetch<TagWithProductCount[]>(
      `${TAG_ENDPOINTS.GET_WITH_COUNTS}${params}`,
      { method: 'GET' }
    );
  },

  /**
   * Get tags for a specific product
   */
  getByProductId: async (productId: string, language?: Locale): Promise<Tag[]> => {
    const params = language ? `?language=${language}` : '';
    return apiFetch<Tag[]>(
      `${TAG_ENDPOINTS.GET_BY_PRODUCT_ID(productId)}${params}`,
      { method: 'GET' }
    );
  },

  /**
   * Search tags by name
   */
  search: async (query: string, limit: number = 10, language?: Locale): Promise<Tag[]> => {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('limit', limit.toString());
    if (language) params.append('language', language);

    return apiFetch<Tag[]>(
      `${TAG_ENDPOINTS.SEARCH}?${params.toString()}`,
      { method: 'GET' }
    );
  },

  /**
   * Get tag by slug
   */
  getBySlug: async (slug: string, language?: Locale): Promise<Tag> => {
    const params = language ? `?language=${language}` : '';
    return apiFetch<Tag>(
      `${TAG_ENDPOINTS.GET_BY_SLUG(slug)}${params}`,
      { method: 'GET' }
    );
  },

  /**
   * Get tag by ID
   */
  getById: async (id: string, language?: Locale): Promise<Tag> => {
    const params = language ? `?language=${language}` : '';
    return apiFetch<Tag>(
      `${TAG_ENDPOINTS.GET_BY_ID(id)}${params}`,
      { method: 'GET' }
    );
  },

  /**
   * Get all translations for tag
   */
  getTranslations: async (id: string): Promise<TagWithTranslations> => {
    return apiFetch<TagWithTranslations>(
      TAG_ENDPOINTS.GET_TRANSLATIONS(id),
      { method: 'GET' }
    );
  },

  /**
   * Get tags by category ID
   */
  getByCategoryId: async (categoryId: string, language?: Locale): Promise<Tag[]> => {
    const params = language ? `?language=${language}` : '';
    return apiFetch<Tag[]>(
      `${TAG_ENDPOINTS.GET_BY_CATEGORY_ID(categoryId)}${params}`,
      { method: 'GET' }
    );
  },

  /**
   * Get tags by category slug
   */
  getByCategorySlug: async (slug: string, language?: Locale): Promise<Tag[]> => {
    const params = language ? `?language=${language}` : '';
    return apiFetch<Tag[]>(
      `${TAG_ENDPOINTS.GET_BY_CATEGORY_SLUG(slug)}${params}`,
      { method: 'GET' }
    );
  },

  // ADMIN ENDPOINTS

  /**
   * Create new tag with translations (Admin only)
   */
  create: async (data: CreateTagDto, token: string): Promise<Tag> => {
    return apiFetch<Tag>(
      TAG_ENDPOINTS.CREATE,
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

  /**
   * Update tag with translations (Admin only)
   */
  update: async (id: string, data: UpdateTagDto, token: string): Promise<Tag> => {
    return apiFetch<Tag>(
      TAG_ENDPOINTS.UPDATE(id),
      {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      },
      { token }
    );
  },

  /**
   * Delete tag and its translations (Admin only)
   */
  delete: async (id: string, token: string): Promise<void> => {
    return apiFetch<void>(
      TAG_ENDPOINTS.DELETE(id),
      { method: 'DELETE' },
      { token }
    );
  },

  /**
   * Update tag translations (Admin only)
   */
  updateTranslations: async (
    id: string,
    translations: Record<Locale, Record<string, string>>,
    token: string
  ): Promise<void> => {
    return apiFetch<void>(
      TAG_ENDPOINTS.UPDATE_TRANSLATIONS(id),
      {
        method: 'PUT',
        body: JSON.stringify(translations),
        headers: {
          'Content-Type': 'application/json',
        },
      },
      { token }
    );
  },

  /**
   * Delete tag translations (Admin only)
   */
  deleteTranslations: async (
    id: string,
    params: DeleteTranslationParams,
    token: string
  ): Promise<void> => {
    const queryParams = new URLSearchParams();
    if (params.language) queryParams.append('language', params.language);
    if (params.field) queryParams.append('field', params.field);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${TAG_ENDPOINTS.DELETE_TRANSLATIONS(id)}?${queryString}`
      : TAG_ENDPOINTS.DELETE_TRANSLATIONS(id);

    return apiFetch<void>(
      endpoint,
      { method: 'DELETE' },
      { token }
    );
  },

  /**
   * Change tag status (Admin only)
   */
  changeStatus: async (
    id: string,
    status: 'active' | 'inactive',
    token: string
  ): Promise<Tag> => {
    return apiFetch<Tag>(
      TAG_ENDPOINTS.CHANGE_STATUS(id, status),
      { method: 'PUT' },
      { token }
    );
  },

  /**
   * Sync tags for a product (Admin only)
   */
  syncProductTags: async (
    productId: string,
    tagIds: string[],
    token: string
  ): Promise<SyncProductTagsResult> => {
    return apiFetch<SyncProductTagsResult>(
      TAG_ENDPOINTS.SYNC_PRODUCT_TAGS(productId),
      {
        method: 'POST',
        body: JSON.stringify({ tagIds }),
        headers: {
          'Content-Type': 'application/json',
        },
      },
      { token }
    );
  },

  /**
   * Merge two tags (Admin only)
   */
  mergeTags: async (
    sourceTagId: string,
    targetTagId: string,
    token: string
  ): Promise<MergeTagsResult> => {
    return apiFetch<MergeTagsResult>(
      TAG_ENDPOINTS.MERGE_TAGS,
      {
        method: 'POST',
        body: JSON.stringify({ sourceTagId, targetTagId }),
        headers: {
          'Content-Type': 'application/json',
        },
      },
      { token }
    );
  },
} as const;