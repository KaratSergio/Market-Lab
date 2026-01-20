'use client';

import { memo } from 'react';
import { ProductCard } from './ProductCard';
import { useProductStore } from '@/core/store/productStore';
import { useDeleteProduct, useUpdateProductStatus } from '@/core/hooks/useProducts';
import { Product } from '@/core/types/productTypes';
import { useTranslations } from 'next-intl';

interface ProductsListProps {
  onEditProduct: (product: Product) => void;
}

export const ProductsList = memo(function ProductsList({
  onEditProduct
}: ProductsListProps) {
  const t = useTranslations();
  const filteredProducts = useProductStore(state => state.filteredProducts);
  const loading = useProductStore(state => state.loading);

  const deleteProductMutation = useDeleteProduct();
  const updateStatusMutation = useUpdateProductStatus();

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm(t('Product.deleteConfirmation'))) return;

    try {
      await deleteProductMutation.mutateAsync(productId);
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleToggleStatus = async (product: any) => {
    try {
      const newStatus = product.status === 'active' ? 'inactive' : 'active';
      await updateStatusMutation.mutateAsync({
        id: product.id,
        status: newStatus,
      });
    } catch (error) {
      console.error('Failed to update product status:', error);
    }
  };

  if (loading && filteredProducts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={() => onEditProduct(product)}
            onDelete={() => handleDeleteProduct(product.id)}
            onToggleStatus={() => handleToggleStatus(product)}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <div className="text-gray-400 mb-4 text-6xl">📦</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('ProductList.emptyTitle')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('ProductList.emptyDescription')}
          </p>
        </div>
      )}

      {loading && filteredProducts.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </>
  );
});