'use client';

import { useState, useEffect, useMemo } from 'react';
import { useProductStore } from '@/core/store/productStore';
import { ProductStatus } from '@/core/types/productTypes';
import { useCategories } from '@/core/hooks';
import { useCategoryTranslations, useStatusTranslations } from '@/core/utils/i18n';
import { useTranslations } from 'next-intl';


export function ProductFilters() {
  const {
    setSearchQuery,
    setSelectedCategory,
    setStatusFilter,
    applyFilters,
    clearFilters,
    searchQuery: storeSearchQuery,
    selectedCategory: storeSelectedCategory,
    statusFilter: storeStatusFilter
  } = useProductStore();

  const products = useProductStore(state => state.products);
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();

  const t = useTranslations();
  const { translateCategory } = useCategoryTranslations();
  const { translateStatus } = useStatusTranslations();

  // Statistics for information
  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter(p => p.status === 'active').length;
    const inactive = products.filter(p => p.status === 'inactive').length;
    const draft = products.filter(p => p.status === 'draft').length;
    const archived = products.filter(p => p.status === 'archived').length;
    const lowStock = products.filter(p => p.stock <= 10 && p.stock > 0).length;
    const outOfStock = products.filter(p => p.stock === 0).length;

    return { total, active, inactive, draft, archived, lowStock, outOfStock };
  }, [products]);

  // Get category name by ID
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return categoryId;
    return translateCategory(category.slug);
  };

  // Extract unique categories from products
  const uniqueCategories = useMemo(() => {
    const categoryIds = new Set<string>();
    products.forEach(product => {
      if (product.categoryId) {
        categoryIds.add(product.categoryId);
      }
    });

    return Array.from(categoryIds)
      .map(categoryId => ({
        id: categoryId,
        name: getCategoryName(categoryId)
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, categories]);

  // local state
  const [search, setSearch] = useState(storeSearchQuery || '');
  const [category, setCategory] = useState(storeSelectedCategory || 'all');
  const [status, setStatus] = useState<ProductStatus | 'all'>(storeStatusFilter);
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Synchronization
  useEffect(() => {
    setSearch(storeSearchQuery);
    setCategory(storeSelectedCategory || 'all');
    setStatus(storeStatusFilter);
  }, [storeSearchQuery, storeSelectedCategory, storeStatusFilter]);

  useEffect(() => {
    applyFilters();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setSearchQuery(value);
    const timeoutId = setTimeout(() => {
      applyFilters();
    }, 300);
    return () => clearTimeout(timeoutId);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCategory(value);
    setSelectedCategory(value === 'all' ? null : value);
    applyFilters();
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as ProductStatus | 'all';
    setStatus(value);
    setStatusFilter(value);
    applyFilters();
  };

  const handleStockFilter = (filter: string) => {
    setStockFilter(filter);
    //! добавить логику фильтрации по стоку
    //! добавить соответствующее поле в store
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('all');
    setStatus('all');
    setStockFilter('all');
    clearFilters();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      {/* Header with information */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {t('ProductFilters.title')}
          </h2>
          <p className="text-gray-600 mt-1">
            {t('ProductFilters.subtitle', {
              total: stats.total,
              active: stats.active,
              lowStock: stats.lowStock
            })}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <span>{isAdvancedOpen ? '▲' : '▼'}</span>
            {isAdvancedOpen
              ? t('ProductFilters.hideAdvanced')
              : t('ProductFilters.showAdvanced')
            }
          </button>

          <button
            onClick={handleClearFilters}
            className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <span>✕</span>
            {t('ProductFilters.clearAll')}
          </button>
        </div>
      </div>

      {/* Basic filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('ProductFilters.searchLabel')}
          </label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder={t('ProductFilters.searchPlaceholder')}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('ProductFilters.categoryLabel')}
          </label>
          <div className="relative">
            <select
              value={category}
              onChange={handleCategoryChange}
              disabled={isLoadingCategories}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="all">
                {isLoadingCategories
                  ? t('ProductFilters.loadingCategories')
                  : t('ProductFilters.allCategories', {
                    count: uniqueCategories.length
                  })
                }
              </option>
              {uniqueCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              📂
            </div>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('ProductFilters.statusLabel')}
          </label>
          <div className="relative">
            <select
              value={status}
              onChange={handleStatusChange}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            >
              <option value="all">
                {t('ProductFilters.allStatuses')}
              </option>
              <option value="active">
                {t('ProductFilters.statusWithCount', {
                  status: t('Product.status.active'),
                  count: stats.active
                })}
              </option>
              <option value="inactive">
                {t('ProductFilters.statusWithCount', {
                  status: t('Product.status.inactive'),
                  count: stats.inactive
                })}
              </option>
              <option value="draft">
                {t('ProductFilters.statusWithCount', {
                  status: t('Product.status.draft'),
                  count: stats.draft
                })}
              </option>
              <option value="archived">
                {t('ProductFilters.statusWithCount', {
                  status: t('Product.status.archived'),
                  count: stats.archived
                })}
              </option>
            </select>
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              📊
            </div>
          </div>
        </div>
      </div>

      {/* Advanced filters */}
      {isAdvancedOpen && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('ProductFilters.advancedTitle')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Filter by stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('ProductFilters.stockLabel')}
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleStockFilter('all')}
                  className={`px-3 py-2 rounded-md transition-colors ${stockFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {t('ProductFilters.stockAll')}
                </button>
                <button
                  onClick={() => handleStockFilter('in-stock')}
                  className={`px-3 py-2 rounded-md transition-colors ${stockFilter === 'in-stock'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {t('ProductFilters.stockInStock')}
                </button>
                <button
                  onClick={() => handleStockFilter('low-stock')}
                  className={`px-3 py-2 rounded-md transition-colors ${stockFilter === 'low-stock'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {t('ProductFilters.stockLowWithCount', { count: stats.lowStock })}
                </button>
                <button
                  onClick={() => handleStockFilter('out-of-stock')}
                  className={`px-3 py-2 rounded-md transition-colors ${stockFilter === 'out-of-stock'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {t('ProductFilters.stockOutWithCount', { count: stats.outOfStock })}
                </button>
              </div>
            </div>

            {/* Sorting */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('ProductFilters.sortLabel')}
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="newest">{t('ProductFilters.sortNewest')}</option>
                <option value="oldest">{t('ProductFilters.sortOldest')}</option>
                <option value="price-low">{t('ProductFilters.sortPriceLow')}</option>
                <option value="price-high">{t('ProductFilters.sortPriceHigh')}</option>
                <option value="stock-low">{t('ProductFilters.sortStockLow')}</option>
                <option value="stock-high">{t('ProductFilters.sortStockHigh')}</option>
                <option value="name-asc">{t('ProductFilters.sortNameAsc')}</option>
                <option value="name-desc">{t('ProductFilters.sortNameDesc')}</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Active filters */}
      {(storeSearchQuery || storeSelectedCategory || storeStatusFilter !== 'all') && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              {t('ProductFilters.activeFilters')}:
            </span>

            {storeSearchQuery && (
              <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                <span>
                  {t('ProductFilters.searchFilter', { query: storeSearchQuery })}
                </span>
                <button
                  onClick={() => {
                    setSearch('');
                    setSearchQuery('');
                    applyFilters();
                  }}
                  className="ml-1 text-blue-700 hover:text-blue-900"
                >
                  ✕
                </button>
              </div>
            )}

            {storeSelectedCategory && (
              <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                <span>
                  {t('ProductFilters.categoryFilter', { category: getCategoryName(storeSelectedCategory) })}
                </span>
                <button
                  onClick={() => {
                    setCategory('all');
                    setSelectedCategory(null);
                    applyFilters();
                  }}
                  className="ml-1 text-green-700 hover:text-green-900"
                >
                  ✕
                </button>
              </div>
            )}

            {storeStatusFilter !== 'all' && (
              <div className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm">
                <span>
                  {t('ProductFilters.statusFilter', { status: translateStatus(storeStatusFilter as ProductStatus) })}
                </span>
                <button
                  onClick={() => {
                    setStatus('all');
                    setStatusFilter('all');
                    applyFilters();
                  }}
                  className="ml-1 text-purple-700 hover:text-purple-900"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}