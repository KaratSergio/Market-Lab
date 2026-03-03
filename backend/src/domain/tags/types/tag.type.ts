import { Entity } from "@shared/types";
import { WithTranslations } from "@domain/translations/types";

export const TAG_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
} as const;

export type TagStatus = typeof TAG_STATUS[keyof typeof TAG_STATUS];
export const DEFAULT_TAG_STATUS = TAG_STATUS.ACTIVE;
export const TAG_STATUS_VALUES = Object.values(TAG_STATUS);

export interface TagModel extends Entity, WithTranslations<'tag'> {
  name: string;
  slug: string;
  description?: string;
  status: TagStatus;
  usageCount: number;
  categoryId?: string | null;
}

export interface TagWithProductCount extends TagModel {
  productCount: number;
}

export interface TagWithCategory extends TagModel {
  categoryName?: string;
  categorySlug?: string;
}

export interface PopularTag {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}