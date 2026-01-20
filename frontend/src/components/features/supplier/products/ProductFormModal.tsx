'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product, ProductStatus } from '@/core/types/productTypes';
import { useCategoryTranslations } from '@/core/utils/i18n/categories';
import { useTranslations } from 'next-intl';

import {
  useLockScroll,
  useCreateProduct, useUpdateProduct,
  useParentCategories, useCategoryChildren,
} from '@/core/hooks';

interface ProductFormModalProps {
  product?: Product;
  onCancel: () => void;
}

export function ProductFormModal({ product, onCancel }: ProductFormModalProps) {
  useLockScroll(true);

  const t = useTranslations();
  const { translateMainCategory, translateSubcategory } = useCategoryTranslations();

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    subcategoryId: '',
    stock: 0,
    isActive: true,
  });

  // Load parent categories
  const { data: parentCategories = [], isLoading: loadingParents } =
    useParentCategories();

  // Load subcategories when a parent category is selected
  const { data: childCategories = [], isLoading: loadingChildren } =
    useCategoryChildren(formData.categoryId || undefined);

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const loading = createProductMutation.isPending || updateProductMutation.isPending;

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        categoryId: product.categoryId || '',
        subcategoryId: product.subcategoryId || '',
        stock: product.stock || 0,
        isActive: product.status === 'active' || true,
      });
      if (product.images) setImagePreviews(product.images);
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        categoryId: '',
        subcategoryId: '',
        stock: 0,
        isActive: true,
      });
    }
  }, [product]);

  useEffect(() => {
    return () => imagePreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [imagePreviews]);

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const newImages = Array.from(files);
      setSelectedImages((prev) => [...prev, ...newImages]);

      const newPreviews = newImages.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    },
    []
  );

  const removeImage = useCallback(
    (index: number, isNewImage: boolean) => {
      if (isNewImage) setSelectedImages((prev) => prev.filter((_, i) => i !== index));

      setImagePreviews((prev) => {
        const newPreviews = prev.filter((_, i) => i !== index);
        URL.revokeObjectURL(prev[index]);
        return newPreviews;
      });
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        const baseData = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          stock: formData.stock,
          ...(formData.categoryId && { categoryId: formData.categoryId }),
          ...(formData.subcategoryId && { subcategoryId: formData.subcategoryId }),
        };

        if (product) {
          const updateData: any = {};

          if (formData.name !== product.name) updateData.name = formData.name;
          if (formData.description !== product.description) updateData.description = formData.description;
          if (formData.price !== product.price) updateData.price = formData.price;
          if (formData.stock !== product.stock) updateData.stock = formData.stock;
          if (formData.categoryId !== product.categoryId) updateData.categoryId = formData.categoryId || null;
          if (formData.subcategoryId !== product.subcategoryId) updateData.subcategoryId = formData.subcategoryId || null;

          const newStatus = formData.isActive ? 'active' : 'inactive';
          if (newStatus !== product.status) updateData.status = newStatus;

          await updateProductMutation.mutateAsync({
            id: product.id,
            data: updateData,
            images: selectedImages,
          });
        } else {
          await createProductMutation.mutateAsync({
            data: {
              ...baseData,
              status: (formData.isActive ? 'active' : 'draft') as ProductStatus,
            },
            images: selectedImages,
          });
        }

        setSelectedImages([]);
        setImagePreviews([]);
        onCancel();
      } catch (error) {
        console.error('Failed to save product:', error);
      }
    },
    [formData, selectedImages, product, createProductMutation, updateProductMutation, onCancel]
  );

  const handleCancel = useCallback(() => {
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    onCancel();
  }, [imagePreviews, onCancel]);

  // Determine which images are new
  const existingImagesCount = product?.images?.length || 0;
  const newImagesCount = selectedImages.length;
  const totalImages = existingImagesCount + newImagesCount;

  const getCategoryName = (category: any): string => {
    if (!category?.slug) return category?.name || '';

    return translateMainCategory(category.slug);
  };

  const getSubcategoryName = (subcategory: any, parentCategoryId: string): string => {
    if (!subcategory?.slug) return subcategory?.name || '';

    const parentCategory = parentCategories.find(cat => cat.id === parentCategoryId);
    if (!parentCategory?.slug) return translateMainCategory(subcategory.slug);

    return translateSubcategory(parentCategory.slug, subcategory.slug);
  };

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {product
              ? t('ProductForm.editTitle')
              : t('ProductForm.createTitle')
            }
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('ProductForm.nameLabel')} *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('ProductForm.namePlaceholder')}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('ProductForm.categoryLabel')} *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, subcategoryId: '' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading || loadingParents}
                  required
                >
                  <option value="">{t('ProductForm.categoryPlaceholder')}</option>
                  {parentCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {getCategoryName(category)}
                    </option>
                  ))}
                </select>
                {loadingParents && (
                  <div className="mt-1 text-sm text-gray-500">
                    {t('ProductForm.loadingCategories')}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('ProductForm.subcategoryLabel')}
                </label>
                <select
                  value={formData.subcategoryId}
                  onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading || !formData.categoryId || loadingChildren}
                >
                  <option value="">{t('ProductForm.subcategoryPlaceholder')}</option>
                  {childCategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {getSubcategoryName(subcategory, formData.categoryId)}
                    </option>
                  ))}
                </select>
                {loadingChildren && (
                  <div className="mt-1 text-sm text-gray-500">
                    {t('ProductForm.loadingSubcategories')}
                  </div>
                )}
                {!loadingChildren && formData.categoryId && childCategories.length === 0 && (
                  <div className="mt-1 text-sm text-gray-500">
                    {t('ProductForm.noSubcategories')}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('ProductForm.descriptionLabel')}*
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('ProductForm.descriptionPlaceholder')}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('ProductForm.priceLabel')} *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('ProductForm.stockLabel')} *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('ProductForm.imagesLabel', {
                  current: totalImages,
                  max: 4
                })}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                  id="product-images"
                  disabled={loading || totalImages >= 4}
                />
                <label
                  htmlFor="product-images"
                  className={`cursor-pointer block ${(loading || totalImages >= 4) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="text-gray-400 mb-2 text-4xl">📷</div>
                  <p className="text-gray-600">
                    {t('ProductForm.imagesClickToSelect')}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    {t('ProductForm.imagesSupportedFormats')}
                  </p>
                  {totalImages >= 4 && (
                    <p className="text-red-500 text-sm mt-1">
                      {t('ProductForm.imagesMaxReached')}
                    </p>
                  )}
                </label>

                {imagePreviews.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">
                      {t('ProductForm.imagesPreviews')}:
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {imagePreviews.map((preview, index) => {
                        const isNewImage = index >= existingImagesCount;
                        return (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-20 object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index, isNewImage)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                              disabled={loading}
                              title={isNewImage
                                ? t('ProductForm.removeNewImage')
                                : t('ProductForm.removeExistingImage')
                              }
                            >
                              ×
                            </button>
                            {isNewImage && (
                              <div className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-xs py-0.5 text-center">
                                {t('ProductForm.newImageBadge')}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {product?.images && product.images.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        {t('ProductForm.imagesSummary', {
                          existing: product.images.length,
                          new: selectedImages.length
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={loading}
                />
                <span className="text-sm font-medium text-gray-700">
                  {t('ProductForm.statusLabel')}
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {t('Common.cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                disabled={loading}
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {product
                  ? t('ProductForm.updateButton')
                  : t('ProductForm.createButton')
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}