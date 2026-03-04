'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Product, ProductStatus } from '@/core/types/productTypes';
import { useTranslations, useLocale } from 'next-intl';
import { ImageUploader, TagMultiSelect, TagOption } from '@/components/ui';

import {
  useLockScroll,
  useCreateSupplierProduct,
  useUpdateSupplierProduct,
  useParentCategories,
  useCategoryChildren,
  useTagsByCategoryId,
  useProductTags,
} from '@/core/hooks';
import { Locale } from '@/core/constants/locales';

interface ProductFormModalProps {
  product?: Product | null;
  onCancel: () => void;
}

export function ProductFormModal({ product, onCancel }: ProductFormModalProps) {
  useLockScroll(true);

  const t = useTranslations();
  const locale = useLocale() as Locale;

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<TagOption[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    subcategoryId: '',
    stock: 0,
    status: 'draft' as ProductStatus,
  });

  // Load parent categories
  const { data: parentCategories = [], isLoading: loadingParents } = useParentCategories(locale);

  // Load subcategories when a parent category is selected
  const { data: childCategories = [], isLoading: loadingChildren } = useCategoryChildren(
    formData.categoryId || undefined,
    locale
  );

  // Load tags for selected category
  const { data: categoryTags = [], isLoading: loadingTags } = useTagsByCategoryId(
    formData.categoryId || undefined,
    locale
  );

  // Load product's current tags if editing
  const { data: productTags = [], isLoading: loadingProductTags } = useProductTags(
    product?.id,
    locale
  );

  // Mutations
  const createProductMutation = useCreateSupplierProduct();
  const updateProductMutation = useUpdateSupplierProduct();

  const loading = createProductMutation.isPending || updateProductMutation.isPending;

  // Transform tags to options
  const tagOptions: TagOption[] = useMemo(() =>
    categoryTags.map((tag) => ({
      value: tag.id,
      label: tag.name,
    })),
    [categoryTags]
  );

  // Initialize form with product data
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        categoryId: product.categoryId || '',
        subcategoryId: product.subcategoryId || '',
        stock: product.stock || 0,
        status: product.status || 'draft',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        categoryId: '',
        subcategoryId: '',
        stock: 0,
        status: 'draft',
      });
      setSelectedTags([]);
    }
  }, [product]);

  // Set selected tags when product tags are loaded
  useEffect(() => {
    if (productTags.length > 0) {
      setSelectedTags(
        productTags.map((tag) => ({
          value: tag.id,
          label: tag.name,
        }))
      );
    }
  }, [productTags]);

  // Reset tags when category changes (only for new products)
  useEffect(() => {
    if (!product) {
      setSelectedTags([]);
    }
  }, [formData.categoryId, product]);

  // Cleanup image previews
  useEffect(() => {
    return () => imagePreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [imagePreviews]);

  const handleImageSelect = useCallback((files: File[]) => {
    setSelectedImages((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  }, []);

  const handleImageRemove = useCallback((index: number, isNewImage: boolean) => {
    if (isNewImage) {
      setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    }
    setImagePreviews((prev) => {
      const newPreviews = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index]);
      return newPreviews;
    });
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        const productData = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          stock: formData.stock,
          status: formData.status,
          tagIds: selectedTags.map((tag) => tag.value),
          ...(formData.categoryId && { categoryId: formData.categoryId }),
          ...(formData.subcategoryId && { subcategoryId: formData.subcategoryId }),
        };

        if (product) {
          await updateProductMutation.mutateAsync({
            id: product.id,
            data: productData,
            images: selectedImages,
          });
        } else {
          await createProductMutation.mutateAsync({
            data: productData,
            images: selectedImages,
          });
        }

        // Cleanup
        setSelectedImages([]);
        setImagePreviews([]);
        setSelectedTags([]);
        onCancel();
      } catch (error) {
        console.error('Failed to save product:', error);
      }
    },
    [
      formData,
      selectedImages,
      selectedTags,
      product,
      createProductMutation,
      updateProductMutation,
      onCancel,
    ]
  );

  const handleCancel = useCallback(() => {
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    onCancel();
  }, [imagePreviews, onCancel]);

  const existingImagesCount = product?.images?.length || 0;
  const newImagesCount = selectedImages.length;
  const isLoadingTags = loadingTags || (product && loadingProductTags);

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {product ? t('ProductForm.editTitle') : t('ProductForm.createTitle')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
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

            {/* Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('ProductForm.categoryLabel')} *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      categoryId: e.target.value,
                      subcategoryId: '',
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading || loadingParents}
                  required
                >
                  <option value="">{t('ProductForm.categoryPlaceholder')}</option>
                  {parentCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
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
                      {subcategory.name}
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

            {/* Tags */}
            <TagMultiSelect
              categoryId={formData.categoryId}
              isLoading={isLoadingTags ?? false}
              options={tagOptions}
              value={selectedTags}
              onChange={setSelectedTags}
              disabled={loading}
              placeholder={t('ProductForm.tagsPlaceholder')}
              noOptionsMessage={t('ProductForm.noTagsAvailable')}
              loadingMessage={t('ProductForm.loadingTags')}
              selectCategoryFirstMessage={t('ProductForm.selectCategoryFirst')}
              noTagsMessage={t('ProductForm.noTagsForCategory')}
            />

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('ProductForm.descriptionLabel')} *
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

            {/* Price and Stock */}
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

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('ProductForm.statusLabel')}
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="draft">{t('Product.status.draft')}</option>
                <option value="active">{t('Product.status.active')}</option>
                <option value="inactive">{t('Product.status.inactive')}</option>
              </select>
            </div>

            {/* Images */}
            <ImageUploader
              existingImagesCount={existingImagesCount}
              newImagesCount={newImagesCount}
              maxImages={4}
              onImageSelect={handleImageSelect}
              onImageRemove={handleImageRemove}
              imagePreviews={imagePreviews}
              disabled={loading}
            />

            {/* Actions */}
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
                {product ? t('ProductForm.updateButton') : t('ProductForm.createButton')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}