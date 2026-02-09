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