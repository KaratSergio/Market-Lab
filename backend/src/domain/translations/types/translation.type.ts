import { Entity } from "@shared/types";

export interface TranslationModel extends Entity {
  entityId: string;
  entityType: TranslationEntityType;
  languageCode: LanguageCode;
  fieldName: string;
  translationText: string;
}

export type TranslationEntityType =
  | 'category'
  | 'product'
  | 'supplier'
  | 'customer'
  | 'attribute';

export const SUPPORTED_LANGUAGES = {
  EN: 'en',
  UK: 'uk'
} as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[keyof typeof SUPPORTED_LANGUAGES];
export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES.UK;

export type TranslatableCategoryFields = 'name' | 'description' | 'metaTitle' | 'metaDescription';
export type TranslatableProductFields = 'name' | 'description' | 'shortDescription' | 'metaTitle' | 'metaDescription';
export type TranslatableSupplierFields = 'firstName' | 'lastName' | 'companyName' | 'description' | 'address';
export type TranslatableAttributeFields = 'name' | 'description';

export const TRANSLATABLE_FIELDS = {
  category: ['name', 'description', 'metaTitle', 'metaDescription'] as TranslatableCategoryFields[],
  product: ['name', 'description', 'shortDescription', 'metaTitle', 'metaDescription'] as TranslatableProductFields[],
  supplier: ['name', 'description', 'contactPerson', 'address'] as TranslatableSupplierFields[],
  attribute: ['name', 'description'] as TranslatableAttributeFields[]
} as const;

export type TranslatableFields<T extends TranslationEntityType> =
  T extends 'category' ? TranslatableCategoryFields :
  T extends 'product' ? TranslatableProductFields :
  T extends 'supplier' ? TranslatableSupplierFields :
  T extends 'attribute' ? TranslatableAttributeFields :
  never;

export interface WithTranslations<T extends TranslationEntityType> {
  translations?: Partial<Record<LanguageCode, Partial<Record<TranslatableFields<T>, string>>>>;
}

export interface LocalizedEntity<T extends TranslationEntityType> {
  entityId: string;
  entityType: T;
  languageCode: LanguageCode;
  fields: Record<string, string>;
}

export type TranslationCreateData = {
  entityId: string;
  entityType: TranslationEntityType;
  languageCode: LanguageCode;
  fieldName: string;
  translationText: string;
};