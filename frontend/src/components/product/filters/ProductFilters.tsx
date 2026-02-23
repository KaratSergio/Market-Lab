'use client';

import { useTranslations } from 'next-intl';
import { SearchFilter } from './SearchFilter';
import { CategoryFilter } from './CategoryFilter';
import { SortFilter } from './SortFilter';
import { AdvancedFilters } from './AdvancedFilters';
import { FilterControls } from './FilterControls';

interface ProductFiltersProps {
  stats: {
    total: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
  };
  searchInput: string;
  category: string;
  sort: string;
  categories: Array<{ id: string; slug: string }>;
  isAdvancedOpen: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onSortChange: (sortValue: string) => void;
  onToggleAdvanced: () => void;
  onClearFilters: () => void;
  onStockFilter: (filter: string) => void;
  stockFilter: string;
}

export function ProductFilters({
  stats,
  searchInput,
  category,
  sort,
  categories,
  isAdvancedOpen,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onToggleAdvanced,
  onClearFilters,
  onStockFilter,
  stockFilter,
}: ProductFiltersProps) {
  const t = useTranslations();

  const hasActiveFilters = Boolean(searchInput || category || sort !== 'newest' || stockFilter !== 'all');

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {t('Catalog.filtersTitle')}
          </h2>
        </div>

        <FilterControls
          isAdvancedOpen={isAdvancedOpen}
          hasActiveFilters={hasActiveFilters}
          onToggleAdvanced={onToggleAdvanced}
          onClearFilters={onClearFilters}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <SearchFilter
          value={searchInput}
          onChange={onSearchChange}
          placeholder={t('Catalog.searchPlaceholder')}
          label={t('Catalog.searchLabel')}
        />

        <CategoryFilter
          value={category}
          categories={categories}
          onChange={onCategoryChange}
          label={t('Catalog.categoryLabel')}
          allCategoriesLabel={t('Catalog.allCategories')}
        />

        <SortFilter
          value={sort}
          onChange={onSortChange}
          label={t('Catalog.sortLabel')}
        />
      </div>

      {isAdvancedOpen && (
        <AdvancedFilters
          stats={stats}
          stockFilter={stockFilter}
          onStockFilter={onStockFilter}
        />
      )}
    </div>
  );
}