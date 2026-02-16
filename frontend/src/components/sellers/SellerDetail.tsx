'use client'

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useSupplierPublic } from '@/core/hooks';
import { Product } from '@/core/types';

export function SellerDetail({ supplierId }: { supplierId: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('products');

  const router = useRouter();
  const t = useTranslations('SellerDetail');
  const locale = useLocale();

  const { data: supplier, isLoading, error } = useSupplierPublic(supplierId);
  const currentTranslations = supplier?.translations?.[locale] || {};

  console.log('====================================');
  console.log('seller detail', supplier);
  console.log('====================================');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 via-amber-50 to-white flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12 text-center max-w-md border border-red-100">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('notFound.title')}</h2>
          <p className="text-gray-600 mb-6">{t('notFound.description')}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-linear-to-r from-green-500 to-amber-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            {t('notFound.goBack')}
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !supplier) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 via-amber-50 to-white flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12 max-w-md w-full">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-200 rounded-2xl"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const productsCount = supplier.products?.length || 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-amber-50 to-white">
      <div className="absolute top-80 right-80 w-64 h-64 bg-green-200 rounded-full -translate-y-32 translate-x-32 opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-200 rounded-full translate-y-48 -translate-x-48 opacity-20"></div>

      <div className="max-w-7xl mx-auto px-4 py-8 relative">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors group"
        >
          <div className="w-10 h-10 bg-linear-to-r from-green-200 to-amber-100 rounded-xl flex items-center justify-center shadow-lg">
            ←
          </div>
          <span>{t('back')}</span>
        </button>

        {/* Card */}
        <div className={`bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-green-100 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>

          {/* header */}
          <div className="h-32 bg-linear-to-r from-green-500 to-amber-500 relative">
            <div className="absolute -bottom-16 left-8">
              <div className="w-32 h-32 bg-white rounded-2xl shadow-xl flex items-center justify-center text-5xl border-4 border-white">
                {supplier.companyName?.charAt(0)}
              </div>
            </div>
          </div>

          {/* seller info */}
          <div className="pt-20 p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                  {supplier.companyName}
                </h1>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-400">⭐</span>
                    <span>4.8</span>
                    <span className="text-gray-400">(127 {t('reviews')})</span>
                  </div>
                </div>
              </div>

              <button className="mt-4 md:mt-0 px-6 py-3 bg-linear-to-r from-green-500 to-amber-500 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:-translate-y-0.5">
                {t('contact')}
              </button>
            </div>

            {/* contact info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-linear-to-r from-green-50 to-amber-50 rounded-2xl border border-green-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">
                  📞
                </div>
                <div>
                  <div className="text-sm text-gray-500">{t('phone')}</div>
                  <div className="font-medium">{supplier.phone}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">
                  📧
                </div>
                <div>
                  <div className="text-sm text-gray-500">{t('email')}</div>
                  <div className="font-medium">{supplier.email}</div>
                </div>
              </div>

              {supplier.address && (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">
                      📍
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">{t('address')}</div>
                      <div className="font-medium">
                        {supplier.address.fullAddress || `${supplier.address.city}, ${supplier.address.country}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">
                      🕒
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">{t('workingHours')}</div>
                      <div className="font-medium">9:00 - 18:00</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* tabs */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex space-x-8">
                {['products', 'about', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${activeTab === tab
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    {t(`tabs.${tab}`)}
                    {tab === 'products' && productsCount > 0 && (
                      <span className="absolute -top-1 -right-2 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                        {productsCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* tab content */}
            <div className="min-h-96">
              {activeTab === 'products' && (
                <>
                  {productsCount === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🛒</div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{t('products.noProducts')}</h3>
                      <p className="text-gray-600">{t('products.noProductsDescription')}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {supplier.products?.map((product: Product) => (
                        <div
                          key={product.id}
                          className="bg-white rounded-xl p-4 border border-green-100 hover:shadow-lg transition-all group cursor-pointer"
                          onClick={() => router.push(`/${locale}/products/${product.id}`)}
                        >
                          <div className="relative mb-3">
                            <div className="aspect-square bg-linear-to-br from-green-100 to-amber-100 rounded-lg flex items-center justify-center text-4xl group-hover:scale-105 transition-transform overflow-hidden">
                              {product.images && product.images.length > 0 ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>🥕</span>
                              )}
                            </div>
                            {product.stock <= 5 && product.stock > 0 && (
                              <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                                {t('products.lowStock')}
                              </span>
                            )}
                            {product.stock === 0 && (
                              <span className="absolute top-2 right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                                {t('products.outOfStock')}
                              </span>
                            )}
                          </div>

                          <h4 className="font-bold text-gray-800 mb-1 line-clamp-1">{product.name}</h4>

                          {product.description && (
                            <p className="text-sm text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                          )}

                          <div className="flex items-center justify-between mt-2">
                            <div>
                              <span className="text-lg font-bold text-green-600">
                                {formatPrice(product.price)}
                              </span>
                              <span className="text-xs text-gray-400 ml-1">/{product.unit}</span>
                            </div>

                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-gray-500">{product.stock} {t('products.stock')}</span>
                              <button
                                className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600 hover:bg-green-200 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  //! додавання в кошик
                                  console.log('Add to cart:', product.id);
                                }}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'about' && (
                <div className="space-y-6">
                  <p className="text-gray-600 leading-relaxed">
                    {currentTranslations.description}
                  </p>

                  <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">{t('certificates')}</h3>
                    <div className="flex flex-wrap gap-3">
                      <span className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-green-700 shadow-sm">
                        {t('certificatesList.organic')}
                      </span>
                      <span className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-amber-700 shadow-sm">
                        {t('certificatesList.quality')}
                      </span>
                      <span className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-green-700 shadow-sm">
                        {t('certificatesList.family')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  {[1, 2, 3].map((review) => (
                    <div key={review} className="bg-white rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-linear-to-r from-green-500 to-amber-500 rounded-full"></div>
                          <div>
                            <span className="font-medium">Ім'я покупця</span>
                            <span className="text-sm text-gray-500 ml-2">2 {t('reviewsSection.daysAgo')}</span>
                          </div>
                        </div>
                        <div className="flex text-yellow-400">
                          {'★'.repeat(5)}
                        </div>
                      </div>
                      <p className="text-gray-600">
                        {t('reviewsSection.reviewText')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}