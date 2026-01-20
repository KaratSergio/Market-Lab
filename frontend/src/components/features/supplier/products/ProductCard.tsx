'use client';

import { memo } from 'react';
import { Product } from '@/core/types/productTypes';
import { useCategoryById } from '@/core/hooks';
import { useTranslations, useLocale } from 'next-intl';

import {
  useStatusTranslations,
  useProductUnits,
  useCategoryTranslations
} from '@/core/utils/i18n';

interface ProductCardProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}

export const ProductCard = memo(function ProductCard({
  product,
  onEdit,
  onDelete,
  onToggleStatus
}: ProductCardProps) {
  const t = useTranslations();
  const locale = useLocale();

  const { getStatusInfo } = useStatusTranslations();
  const { formatPriceWithUnit, formatStockWithUnit } = useProductUnits();
  const { translateCategory } = useCategoryTranslations();

  const { data: category } = useCategoryById(product.categoryId);
  const categorySlug = category?.slug || '';

  const statusInfo = getStatusInfo(product.status);
  const translatedCategoryName = translateCategory(categorySlug);
  const formattedPrice = formatPriceWithUnit(
    product.price,
    categorySlug,
    product.subcategoryId,
    locale
  );
  const stockText = formatStockWithUnit(
    product.stock,
    categorySlug,
    product.subcategoryId
  );

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-48 bg-gray-200 relative overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400 text-4xl">📷</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.colors}`}>
            {statusInfo.label}
          </span>
        </div>
        {product.stock === 0 && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
              {t('Product.outOfStock')}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h3>
          <span className="text-xl font-bold text-green-600 whitespace-nowrap">
            {formattedPrice}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span className="bg-gray-100 px-2 py-1 rounded">#{translatedCategoryName}</span>
          <span className={`${product.stock < 10 ? 'text-red-600' : 'text-gray-600'}`}>
            {t('Product.stockLabel')}: {stockText}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
          >
            {t('Common.edit')}
          </button>
          <button
            onClick={onToggleStatus}
            className={`flex-1 px-3 py-2 text-sm rounded transition-colors ${product.status === 'active'
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-green-600 text-white hover:bg-green-700'
              }`}
          >
            {product.status === 'active'
              ? t('Product.deactivate')
              : t('Product.activate')
            }
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-2 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors"
          >
            {t('Common.delete')}
          </button>
        </div>
      </div>
    </div>
  );
});