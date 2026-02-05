'use client';

import { usePublicProduct } from '@/core/hooks';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import Link from 'next/link';

interface ProductDetailsProps {
  productId: string;
  onAddToCart?: (quantity: number) => void;
  onSave?: () => void;
}

export function ProductDetails({
  productId,
  onAddToCart,
  onSave
}: ProductDetailsProps) {
  const locale = useLocale();
  const t = useTranslations('Product');
  const tCommon = useTranslations('Common');
  const { data: product, isLoading } = usePublicProduct(productId);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  if (isLoading) return <p>Loading...</p>
  if (!product) return <p>Product not found</p>;

  const hasStock = product.stock > 0;
  const isLowStock = product.stock <= 10 && product.stock > 0;
  const images = product.images || [];

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > product.stock) return;
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (onAddToCart && hasStock) onAddToCart(quantity);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      {/* Back button */}
      <div className="mb-4 mt-1 ml-2">
        <Link
          href={`/${locale}/products`}
          className="text-green-600 hover:text-green-700 hover:underline inline-flex items-center gap-2"
        >
          ← {t('backToCatalog')}
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mx-4">
        {/* Left Column - Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative rounded-2xl overflow-hidden shadow-lg bg-gray-100 flex h-[600px]">
            {images.length > 0 ? (
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-400 text-6xl">📷</span>
              </div>
            )}

            {/* Stock Badge */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {!hasStock && (
                <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-medium">
                  {t('outOfStock')}
                </span>
              )}
              {isLowStock && hasStock && (
                <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">
                  {t('lowStock')}
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`rounded-lg overflow-hidden cursor-pointer transition-all ${selectedImage === index
                    ? 'ring-2 ring-green-500 ring-offset-2'
                    : 'hover:opacity-80'
                    }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} - ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Category */}
          <div>
            {/* <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
              {product.categoryId ? `${t('category')}: ${product.categoryId.slice(0, 8)}...` : t('noCategory')}
            </span> */}
          </div>

          {/* Title and Description */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Price and Stock */}
          <div className="flex items-center justify-between bg-green-50 p-4 rounded-xl">
            <div className="text-3xl font-bold text-green-600">
              {formatPrice(product.price)}
            </div>
            <div className={`text-lg font-medium ${hasStock ? 'text-green-700' : 'text-red-700'}`}>
              {hasStock ? `${t('inStock')}: ${product.stock}` : t('outOfStock')}
            </div>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">{tCommon('tags')}</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Quantity Selector and Add to Cart */}
            {hasStock && (
              <div className="flex gap-4 items-center">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="px-4 py-2 text-gray-600 disabled:opacity-50 hover:bg-gray-100 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-medium min-w-10 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock}
                    className="px-4 py-2 text-gray-600 disabled:opacity-50 hover:bg-gray-100 transition-colors"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!hasStock}
                >
                  🛒 {tCommon('addToCart')}
                </button>
              </div>
            )}

            {/* Other Actions */}
            <div className="flex gap-4">
              {onSave && (
                <button
                  onClick={onSave}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  💖 {t('save')}
                </button>
              )}
              {!hasStock && (
                <button
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors opacity-75 cursor-not-allowed"
                  disabled
                >
                  🔔 {t('notifyWhenAvailable')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}