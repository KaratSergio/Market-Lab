'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface AdvancedFiltersProps {
  stats: {
    inStock: number;
    lowStock: number;
    outOfStock: number;
  };
  stockFilter: string;
  onStockFilter: (filter: string) => void;
}

export function AdvancedFilters({ stats, stockFilter, onStockFilter }: AdvancedFiltersProps) {
  const t = useTranslations();

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('Catalog.advancedTitle')}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('Catalog.stockLabel')}
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onStockFilter('all')}
              className={`px-3 py-2 rounded-md transition-colors ${stockFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {t('Catalog.stockAll')}
            </button>
            <button
              onClick={() => onStockFilter('in-stock')}
              className={`px-3 py-2 rounded-md transition-colors ${stockFilter === 'in-stock'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {t('Catalog.stockInStock', { count: stats.inStock })}
            </button>
            <button
              onClick={() => onStockFilter('low-stock')}
              className={`px-3 py-2 rounded-md transition-colors ${stockFilter === 'low-stock'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {t('Catalog.stockLowWithCount', { count: stats.lowStock })}
            </button>
            <button
              onClick={() => onStockFilter('out-of-stock')}
              className={`px-3 py-2 rounded-md transition-colors ${stockFilter === 'out-of-stock'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {t('Catalog.stockOutWithCount', { count: stats.outOfStock })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}