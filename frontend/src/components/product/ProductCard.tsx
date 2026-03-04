'use client';

import { memo } from 'react';
import { Product } from '@/core/types/productTypes';
import { useCategoryById } from '@/core/hooks';
import { useTranslations, useLocale } from 'next-intl';
import { Locale } from '@/core/constants/locales';

import {
  useProductUnits,
  useStatusTranslations,
} from '@/core/utils/i18n';

interface ProductCardProps {
  product: Product;
  // Supplier mode props
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleStatus?: () => void;
  // Public mode props
  showSupplier?: boolean;
  showStatus?: boolean;
  onClick?: () => void;
  // General
  showActions?: boolean;
  compact?: boolean;
}

export const ProductCard = memo(function ProductCard({
  product,
  // Supplier actions
  onEdit,
  onDelete,
  onToggleStatus,
  // Public mode
  showSupplier = false,
  showStatus = true,
  onClick,
  // General
  showActions = true,
  compact = false,
}: ProductCardProps) {
  const t = useTranslations();
  const locale = useLocale() as Locale;

  const { getStatusInfo } = useStatusTranslations();
  const { formatPriceWithUnit, formatStockWithUnit } = useProductUnits();

  const { data: category } = useCategoryById(product.categoryId, locale);

  const translatedCategoryName = category?.name || product.categoryId || '';

  const statusInfo = getStatusInfo(product.status);
  const formattedPrice = formatPriceWithUnit(
    product.price,
    category?.slug ?? '',
    product.subcategoryId,
    locale
  );
  const stockText = formatStockWithUnit(
    product.stock,
    category?.slug ?? '',
    product.subcategoryId
  );

  const isSupplierMode = !!onEdit || !!onDelete || !!onToggleStatus;
  const hasStock = product.stock > 0;
  const isLowStock = product.stock <= 10 && product.stock > 0;

  const handleClick = (e: React.MouseEvent) => {
    if (onClick && !isSupplierMode) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm overflow-hidden
          hover:shadow-md transition-shadow border border-gray-100
          ${onClick && !isSupplierMode ? 'cursor-pointer' : ''
        } ${compact ? 'h-full flex flex-col' : ''}`}
      onClick={handleClick}
    >
      {/* Image */}
      <div className={`${compact ? 'h-40' : 'h-48'} bg-gray-200 relative overflow-hidden`}>
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400 text-4xl">📷</span>
          </div>
        )}

        {/* Status badge (top right) - SUPPLIER MODE */}
        {showStatus && product.status && isSupplierMode && (
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.colors} font-medium`}>
              {statusInfo.label}
            </span>
          </div>
        )}

        {/* Stock badges (top left) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {!hasStock && (
            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-medium">
              {t('Product.outOfStock')}
            </span>
          )}
          {isLowStock && hasStock && (
            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 font-medium">
              {t('Product.lowStock')}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`p-4 ${compact ? 'grow flex flex-col' : ''}`}>
        <div className="flex justify-between items-start mb-2">
          <h3 className={`font-semibold text-gray-900 truncate ${compact ? 'text-base' : 'text-lg'}`}>
            {product.name}
          </h3>
          <span className={`font-bold text-green-600 whitespace-nowrap ${compact ? 'text-lg' : 'text-xl'}`}>
            {formattedPrice}
          </span>
        </div>

        {!compact && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.shortDescription}
          </p>
        )}

        {/* Category and stock info */}
        <div className={`flex items-center justify-between text-sm text-gray-500 mb-4 ${compact ? 'mt-auto' : ''}`}>
          <span className="bg-gray-100 px-2 py-1 rounded text-xs">
            #{translatedCategoryName}
          </span>
          <span className={`${!hasStock ? 'text-red-600' : isLowStock ? 'text-yellow-600' : 'text-gray-600'}`}>
            {t('Product.stockLabel')}: {stockText}
          </span>
        </div>

        {/* Actions - SUPPLIER MODE */}
        {showActions && isSupplierMode && (
          <div className={`flex gap-2 ${compact ? 'mt-2' : ''}`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
              className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
            >
              {t('Common.edit')}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStatus?.();
              }}
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
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              className="px-3 py-2 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors"
            >
              {t('Common.delete')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
});