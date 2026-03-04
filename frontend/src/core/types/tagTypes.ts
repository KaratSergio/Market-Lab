import { Locale } from "../constants/locales";

export interface Tag {
  id: string;
  slug: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  metaTitle?: string;
  metaDescription?: string;
  productCount?: number;
  categoryId?: string;
  createdAt: string;
  updatedAt: string;
  translations?: TagTranslation[];
}

export interface TagTranslation {
  id: string;
  language: Locale;
  name: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface TagWithTranslations extends Tag {
  translations: TagTranslation[];
}

export interface TagWithProductCount extends Tag {
  productCount: number;
}

export interface PopularTag extends Tag {
  productCount: number;
  usageCount: number;
}

export interface CreateTagDto {
  slug: string;
  name: string;
  description?: string;
  status?: 'active' | 'inactive';
  metaTitle?: string;
  metaDescription?: string;
  categoryId?: string;
  translations?: Record<Locale, {
    name: string;
    description?: string;
    metaTitle?: string;
    metaDescription?: string;
  }>;
}

export interface UpdateTagDto {
  slug?: string;
  name?: string;
  description?: string;
  status?: 'active' | 'inactive';
  metaTitle?: string;
  metaDescription?: string;
  categoryId?: string;
  translations?: Record<Locale, {
    name: string;
    description?: string;
    metaTitle?: string;
    metaDescription?: string;
  }>;
}

export interface TagFilters {
  language?: Locale;
  search?: string;
  status?: 'active' | 'inactive';
  page?: number;
  limit?: number;
  categoryId?: string;
}

export interface SyncProductTagsResult {
  message: string;
  addedTags: Tag[];
  removedTags: Tag[];
}

export interface MergeTagsResult {
  message: string;
  targetTag: Tag;
  mergedCount: number;
}

export interface DeleteTranslationParams {
  language?: Locale;
  field?: string;
}