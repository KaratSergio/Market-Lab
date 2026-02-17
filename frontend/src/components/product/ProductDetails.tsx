'use client';

import { usePublicProduct } from '@/core/hooks';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import Link from 'next/link';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { Share2 } from 'lucide-react';
import { BackButton } from '../ui/button/BackButton';

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
  const [selectedImage, setSelectedImage] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-3xl text-red-500 mx-auto mb-6">
            ❌
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">{t('productNotFound')}</h3>
          <BackButton text={t('backToCatalog')} />
        </div>
      </div>
    );
  }

  const hasStock = product.stock > 0;
  const isLowStock = product.stock <= 10 && product.stock > 0;
  const images = product.images || [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <BackButton className='ml-4' classIcon='mr-0' text={t('backToCatalog')} />

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
            {/* Category badge with better styling */}
            {/* {product.category && (
              <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {product.category.name}
              </span>
            )} */}
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

          {/* Farmer/Seller Info */}
          {/* {product.supplier && (
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                  👨‍🌾
                </div>
                <div>
                  <p className="font-medium text-gray-800">{t('soldBy')}</p>
                  <p className="text-amber-700 font-semibold">{product.supplier.businessName}</p>
                  <p className="text-sm text-gray-600 mt-1">{product.supplier.description}</p>
                </div>
              </div>
            </div>
          )} */}

          {/* Price and Stock */}
          <div className="bg-linear-to-r from-green-50 to-amber-50 p-6 rounded-2xl border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-4xl font-bold text-green-600">
                  {formatPrice(product.price)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {t('pricePerUnit')}
                </div>
              </div>

              <div className={`text-lg font-medium ${hasStock ? 'text-green-700' : 'text-red-700'}`}>
                {hasStock ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>{t('inStock')}: {product.stock}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>{t('outOfStock')}</span>
                  </div>
                )}
              </div>
            </div>

            {isLowStock && hasStock && (
              <div className="mt-3 px-4 py-2 bg-yellow-100 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-700">⚠️</span>
                  <span className="text-yellow-800 font-medium">{t('hurryUp')}</span>
                  <span className="text-yellow-600 text-sm">- {t('onlyLeft', { count: product.stock })}</span>
                </div>
              </div>
            )}
          </div>

          {/* Add to Cart Button */}
          <div className="pt-4">
            <AddToCartButton
              productId={product.id}
              price={product.price}
              name={product.name}
              imageUrl={images[0]}
              maxQuantity={Math.min(product.stock, 99)}
              className="mt-2"
            />
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">{tCommon('tags')}</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white border border-green-200 text-green-700 rounded-full text-sm hover:bg-green-50 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Product Details */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('details')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">{t('weight')}</p>
                  <p className="font-medium">1 кг</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">{t('organic')}</p>
                  <p className="font-medium text-green-600">🌿 {t('yes')}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">{t('deliveryTime')}</p>
                  <p className="font-medium">1-2 {t('days')}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">{t('country')}</p>
                  <p className="font-medium">🇺🇦 Україна</p>
                </div>
              </div>
            </div>
          </div>

          {/* Other Actions */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
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
                className="flex-1 px-6 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5"
              >
                🔔 {t('notifyWhenAvailable')}
              </button>
            )}

            {/* Share button */}
            <button
              onClick={() => navigator.share?.({
                title: product.name,
                text: product.description,
                url: window.location.href,
              })}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Share2 /> {t('share')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}