'use client';

import { memo, useMemo } from 'react';
import { useProductStore } from '@/core/store/productStore';
import { useTranslations } from 'next-intl';

interface ProductStatsProps {
  onAddProduct: () => void;
  loading: boolean;
}

export const ProductStats = memo(function ProductStats({
  onAddProduct,
  loading
}: ProductStatsProps) {
  const t = useTranslations();
  const products = useProductStore(state => state.products);

  const stats = useMemo(() => {
    let active = 0;
    let lowStock = 0;
    let outOfStock = 0;

    for (const product of products) {
      if (product.status === 'active') active++;
      if (product.stock <= 10 && product.stock > 0) lowStock++;
      if (product.stock === 0) outOfStock++;
    }

    return {
      total: products.length,
      active,
      lowStock,
      outOfStock
    };
  }, [products]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('ProductStats.title')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('ProductStats.subtitle')}
          </p>
        </div>
        <button
          onClick={onAddProduct}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <span>+</span>
          {t('ProductStats.addButton')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">
            {t('Product.totalProducts')}
          </p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600 font-medium">
            {t('Product.status.active')}
          </p>
          <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-600 font-medium">
            {t('Product.lowStock')}
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {stats.lowStock}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-red-600 font-medium">
            {t('Product.outOfStock')}
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {stats.outOfStock}
          </p>
        </div>
      </div>
    </div>
  );
});