'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePublicActiveProducts } from '@/core/hooks';
import { useCategories } from '@/core/hooks';
import { useTranslations, useLocale } from 'next-intl';
import { ProductFilters } from './filters/ProductFilters';
import { ProductStatistics } from './Statistics';
import { ActiveFilters } from './filters/ActiveFilters';
import { ProductList } from './ProductList';
import { Pagination } from '../ui/Pagination';
import { ErrorState } from '../ui/ErrorState';
import { EmptyState } from './filters/EmptyState';


export function ProductCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const locale = useLocale();

  // params from URL
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 12;
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const stock = searchParams.get('stock') || 'all';

  // local state
  const [searchInput, setSearchInput] = useState(search);
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const { data: categories = [] } = useCategories();
  const { data: allProductsData } = usePublicActiveProducts({
    limit: 1000,
    page: 1
  });

  const SORT_MAPPING = {
    newest: { sortBy: 'createdAt' as const, sortOrder: 'DESC' as const },
    oldest: { sortBy: 'createdAt' as const, sortOrder: 'ASC' as const },
    'price-low': { sortBy: 'price' as const, sortOrder: 'ASC' as const },
    'price-high': { sortBy: 'price' as const, sortOrder: 'DESC' as const },
    'name-asc': { sortBy: 'name' as const, sortOrder: 'ASC' as const },
    'name-desc': { sortBy: 'name' as const, sortOrder: 'DESC' as const },
  } as const;

  const getSortParams = (sortValue: string) => {
    const key = Object.keys(SORT_MAPPING).includes(sortValue)
      ? sortValue as keyof typeof SORT_MAPPING
      : 'newest';
    return SORT_MAPPING[key];
  };

  const sortParams = getSortParams(sort);

  const { data, isLoading, error } = usePublicActiveProducts({
    page,
    limit,
    category: category || undefined,
    search: debouncedSearch || undefined,
    sortBy: sortParams.sortBy,
    sortOrder: sortParams.sortOrder,
    stock: stock !== 'all' ? stock : 'all',
  });

  const products = data?.products || [];
  const totalItems = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  // debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      updateUrl({ search: searchInput, page: 1 });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const updateUrl = useCallback((updates: {
    page?: number;
    search?: string;
    category?: string;
    sort?: string;
    stock?: string;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updates.page) params.set('page', updates.page.toString());
    if (updates.search !== undefined) {
      if (updates.search) params.set('search', updates.search);
      else params.delete('search');
    }
    if (updates.category !== undefined) {
      if (updates.category) params.set('category', updates.category);
      else params.delete('category');
    }
    if (updates.sort !== undefined) {
      if (updates.sort) params.set('sort', updates.sort);
      else params.delete('sort');
    }
    if (updates.stock !== undefined) {
      if (updates.stock && updates.stock !== 'all') params.set('stock', updates.stock);
      else params.delete('stock');
    }

    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  // filter statistics
  const allStats = useMemo(() => {
    const allProducts = allProductsData?.products || [];
    return {
      total: allProducts.length,
      inStock: allProducts.filter(p => p.stock > 10).length,
      lowStock: allProducts.filter(p => p.stock > 0 && p.stock <= 10).length,
      outOfStock: allProducts.filter(p => p.stock === 0).length
    };
  }, [allProductsData]);

  // handlers
  const handlePageChange = (newPage: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateUrl({ page: newPage });
  };

  const handleCategoryChange = (categoryId: string) => {
    updateUrl({ category: categoryId, page: 1 });
  };

  const handleSortChange = (sortValue: string) => {
    updateUrl({ sort: sortValue, page: 1 });
  };

  const handleStockChange = (stockValue: string) => {
    updateUrl({ stock: stockValue, page: 1 });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    updateUrl({
      search: '', category: '',
      sort: 'newest', stock: 'all',
      page: 1
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleToggleAdvanced = () => {
    setIsAdvancedOpen(!isAdvancedOpen);
  };

  const allCategoriesList = useMemo(() => {
    return categories.map(category => ({
      id: category.id,
      slug: category.slug,
    })).sort((a, b) => a.slug.localeCompare(b.slug));
  }, [categories]);

  if (error) return <ErrorState error={error} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('Common.allProducts')}</h1>
        <p className="text-gray-600 mt-2">{t('Catalog.mainDescription')}</p>
      </div>

      <ProductFilters
        stats={allStats}
        searchInput={searchInput}
        category={category}
        sort={sort}
        categories={allCategoriesList}
        allCategories={categories}
        isAdvancedOpen={isAdvancedOpen}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
        onSortChange={handleSortChange}
        onToggleAdvanced={handleToggleAdvanced}
        onClearFilters={handleClearFilters}
        onStockFilter={handleStockChange}
        stockFilter={stock}
      />

      <ActiveFilters
        search={search}
        category={category}
        categories={categories}
        sort={sort}
        onClearSearch={() => handleSearchChange('')}
        onClearCategory={() => handleCategoryChange('')}
        onClearSort={() => handleSortChange('')}
        onClearAll={handleClearFilters}
      />

      <ProductStatistics
        isLoading={isLoading}
        totalItems={totalItems}
        totalPages={totalPages}
        page={page}
        search={search}
        category={category}
        categories={categories}
      />

      {products.length === 0 && !isLoading ? (
        <EmptyState
          search={search}
          category={category}
          onClearFilters={handleClearFilters}
        />
      ) : (
        <>
          <ProductList
            products={products}
            isLoading={isLoading}
            limit={limit}
            locale={locale}
          />

          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}