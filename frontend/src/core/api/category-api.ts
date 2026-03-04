import { apiFetch } from '@/core/utils/api-utils';
import { CATEGORY_ENDPOINTS } from '@/core/constants/api-config';
import { Category, CategoryTreeNode, CreateCategoryDto, UpdateCategoryDto } from '../types';
import { Locale } from '../constants/locales';

export const categoryApi = {
  /**
   * Get all categories with tree structure
   */
  getAll: async (language?: Locale): Promise<CategoryTreeNode[]> => {
    const params = language ? `?language=${language}` : '';
    return apiFetch<CategoryTreeNode[]>(
      `${CATEGORY_ENDPOINTS.GET_ALL}${params}`,
      { method: 'GET' }
    );
  },

  /**
   * Get parent categories only
   */
  getParents: async (language?: Locale): Promise<Category[]> => {
    const params = language ? `?language=${language}` : '';
    return apiFetch<Category[]>(
      `${CATEGORY_ENDPOINTS.GET_PARENTS}${params}`,
      { method: 'GET' }
    );
  },

  /**
   * Get children of a category
   */
  getChildren: async (parentId: string, language?: Locale): Promise<Category[]> => {
    const params = language ? `?language=${language}` : '';
    return apiFetch<Category[]>(
      `${CATEGORY_ENDPOINTS.GET_CHILDREN(parentId)}${params}`,
      { method: 'GET' }
    );
  },

  /**
   * Get category by ID
   */
  getById: async (id: string, language?: Locale): Promise<Category> => {
    const params = language ? `?language=${language}` : '';
    return apiFetch<Category>(
      `${CATEGORY_ENDPOINTS.GET_BY_ID(id)}${params}`,
      { method: 'GET' }
    );
  },

  /**
   * Get category by slug
   */
  getBySlug: async (slug: string, language?: Locale): Promise<Category> => {
    const params = language ? `?language=${language}` : '';
    return apiFetch<Category>(
      `${CATEGORY_ENDPOINTS.GET_BY_SLUG(slug)}${params}`,
      { method: 'GET' }
    );
  },

  // Admin endpoints
  create: async (data: CreateCategoryDto, token: string): Promise<Category> => {
    return apiFetch<Category>(
      CATEGORY_ENDPOINTS.CREATE,
      {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      },
      { token }
    );
  },

  update: async (id: string, data: UpdateCategoryDto, token: string): Promise<Category> => {
    return apiFetch<Category>(
      CATEGORY_ENDPOINTS.UPDATE(id),
      {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      },
      { token }
    );
  },

  delete: async (id: string, token: string): Promise<void> => {
    return apiFetch<void>(
      CATEGORY_ENDPOINTS.DELETE(id),
      { method: 'DELETE' },
      { token }
    );
  },
} as const;