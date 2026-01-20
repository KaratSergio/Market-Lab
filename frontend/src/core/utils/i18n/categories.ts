import { useTranslations } from 'next-intl';
import type { MainCategoryKey } from '@/core/types/productTypes';

const MAIN_CATEGORIES: MainCategoryKey[] = [
  'vegetables', 'fruits', 'dairy-products', 'meat-poultry',
  'eggs', 'bread-bakery', 'honey-bee-products', 'preserves',
  'drinks', 'grains-cereals', 'nuts-dried-fruits', 'vegetable-oils',
  'spices-herbs', 'farm-delicacies', 'baby-food', 'other'
];

export function useCategoryTranslations() {
  const t = useTranslations('Categories');

  const translateMainCategory = (categoryKey: MainCategoryKey | string): string => {
    if (!categoryKey) return '';

    try {
      return t(`main.${categoryKey}`);
    } catch {
      return categoryKey;
    }
  };

  const translateSubcategory = (
    mainCategoryKey: MainCategoryKey | string,
    subcategoryKey: string
  ): string => {
    if (!mainCategoryKey || !subcategoryKey) return subcategoryKey || '';

    try {
      return t(`${mainCategoryKey}.${subcategoryKey}`);
    } catch {
      return subcategoryKey;
    }
  };

  const translateCategory = (categoryKey: string, parentCategory?: string): string => {
    if (!categoryKey) return '';

    if (parentCategory) {
      try {
        return t(`${parentCategory}.${categoryKey}`);
      } catch {
        try {
          return t(`main.${categoryKey}`);
        } catch {
          return categoryKey;
        }
      }
    }

    try {
      return t(`main.${categoryKey}`);
    } catch {
      for (const mainCat of MAIN_CATEGORIES) {
        try {
          return t(`${mainCat}.${categoryKey}`);
        } catch {
          continue;
        }
      }

      return categoryKey;
    }
  };

  const getSubcategoriesForMain = (mainCategoryKey: MainCategoryKey | string): string[] => {
    try {
      const subcategories = t.raw(mainCategoryKey);
      return subcategories ? Object.keys(subcategories) : [];
    } catch {
      return [];
    }
  };

  return {
    translateMainCategory,
    translateSubcategory,
    translateCategory,
    getSubcategoriesForMain,
    MAIN_CATEGORIES
  };
}