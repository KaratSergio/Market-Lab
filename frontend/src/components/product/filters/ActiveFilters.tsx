'use client';

import { useTranslations } from 'next-intl';

interface ActiveFiltersProps {
  search: string;
  category: string;
  categories: Array<{ id: string; name: string }>;
  sort: string;
  onClearSearch: () => void;
  onClearCategory: () => void;
  onClearSort: () => void;
  onClearAll: () => void;
}

export function ActiveFilters({
  search,
  category,
  categories,
  sort,
  onClearSearch,
  onClearCategory,
  onClearSort,
  onClearAll,
}: ActiveFiltersProps) {
  const t = useTranslations();

  const getCategoryName = (categoryId: string): string => {
    const categoryObj = categories.find(c => c.id === categoryId);
    return categoryObj?.name || categoryId;
  };

  const getSortLabel = () => {
    const sortLabels: Record<string, string> = {
      'newest': t('Catalog.sortNewest'),
      'oldest': t('Catalog.sortOldest'),
      'price-low': t('Catalog.sortPriceLow'),
      'price-high': t('Catalog.sortPriceHigh'),
      'name-asc': t('Catalog.sortNameAsc'),
      'name-desc': t('Catalog.sortNameDesc'),
    };
    return sortLabels[sort];
  };

  const sortLabel = getSortLabel();
  const hasActiveFilters = search || category || (sort !== 'newest' && sortLabel);

  if (!hasActiveFilters) return null;

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            {t('Catalog.activeFilters')}:
          </span>

          {search && (
            <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
              <span>
                {t('Catalog.searchFilter', { query: search })}
              </span>
              <button
                onClick={onClearSearch}
                className="ml-1 text-blue-700 hover:text-blue-900"
              >
                ✕
              </button>
            </div>
          )}

          {category && (
            <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
              <span>
                {t('Catalog.categoryFilter', {
                  category: getCategoryName(category)
                })}
              </span>
              <button
                onClick={onClearCategory}
                className="ml-1 text-green-700 hover:text-green-900"
              >
                ✕
              </button>
            </div>
          )}

          {sort !== 'newest' && sortLabel && (
            <div className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm">
              <span>
                {t('Catalog.sortFilter', { sort: sortLabel })}
              </span>
              <button
                onClick={onClearSort}
                className="ml-1 text-purple-700 hover:text-purple-900"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onClearAll}
          className="text-sm text-red-600 hover:text-red-800 font-medium"
        >
          {t('Catalog.clearAll')}
        </button>
      </div>
    </div>
  );
}