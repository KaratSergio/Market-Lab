import { apiFetch } from '@/core/utils/api-utils';
import { CATEGORY_ENDPOINTS } from '@/core/constants/api-config';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId: string | null;
  order: number;
  status: 'active' | 'inactive' | 'archived';
  imageUrl?: string;
  children?: Category[];
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

export interface CreateCategoryDto {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  order?: number;
  status?: 'active' | 'inactive' | 'archived';
  imageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  order?: number;
  status?: 'active' | 'inactive' | 'archived';
  imageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export const categoryApi = {
  /**
   * Get all categories with tree structure
   */
  getAll: async (): Promise<CategoryTreeNode[]> => {
    return apiFetch<CategoryTreeNode[]>(
      CATEGORY_ENDPOINTS.GET_ALL,
      { method: 'GET' }
    );
  },

  /**
   * Get parent categories only
   */
  getParents: async (): Promise<Category[]> => {
    return apiFetch<Category[]>(
      CATEGORY_ENDPOINTS.GET_PARENTS,
      { method: 'GET' }
    );
  },

  /**
   * Get children of a category
   */
  getChildren: async (parentId: string): Promise<Category[]> => {
    return apiFetch<Category[]>(
      CATEGORY_ENDPOINTS.GET_CHILDREN(parentId),
      { method: 'GET' }
    );
  },

  /**
   * Get category by ID
   */
  getById: async (id: string): Promise<Category> => {
    return apiFetch<Category>(
      CATEGORY_ENDPOINTS.GET_BY_ID(id),
      { method: 'GET' }
    );
  },

  /**
   * Get category by slug
   */
  getBySlug: async (slug: string): Promise<Category> => {
    return apiFetch<Category>(
      CATEGORY_ENDPOINTS.GET_BY_SLUG(slug),
      { method: 'GET' }
    );
  },

  /**
   * Create new category (Admin only)
   */
  create: async (data: CreateCategoryDto, token: string): Promise<Category> => {
    return apiFetch<Category>(
      CATEGORY_ENDPOINTS.CREATE,
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
   * Update category (Admin only)
   */
  update: async (
    id: string,
    data: UpdateCategoryDto,
    token: string
  ): Promise<Category> => {
    return apiFetch<Category>(
      CATEGORY_ENDPOINTS.UPDATE(id),
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
   * Delete category (Admin only)
   */
  delete: async (id: string, token: string): Promise<void> => {
    return apiFetch<void>(
      CATEGORY_ENDPOINTS.DELETE(id),
      { method: 'DELETE' },
      { token }
    );
  },
} as const;