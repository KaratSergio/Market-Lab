import { useTranslations } from 'next-intl';

export function useCategoryTranslations() {
  const t = useTranslations('Categories');

  const translateCategory = (categoryKey: string): string => {
    if (!categoryKey || categoryKey.trim() === '') return '';

    try {
      return t(`main.${categoryKey}` as any);
    } catch {
      return categoryKey;
    }
  };

  const translateSubcategory = (
    mainCategory: string,
    subcategoryKey: string
  ): string => {
    if (!mainCategory || !subcategoryKey) return subcategoryKey || '';

    try {
      return t(`${mainCategory}.${subcategoryKey}` as any);
    } catch {
      return subcategoryKey;
    }
  };

  return {
    translateCategory,
    translateSubcategory
  };
}

export function getTranslatedCategory(
  t: (key: string) => string,
  categoryKey: string
): string {
  if (!categoryKey || categoryKey.trim() === '') return '';

  try {
    return t(`Categories.main.${categoryKey}`);
  } catch {
    return categoryKey;
  }
}