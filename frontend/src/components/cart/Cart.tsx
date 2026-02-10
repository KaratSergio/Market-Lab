'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { X, Plus, Minus, ShoppingBag, Truck, Shield, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/core/store/authStore';

import {
  useCart, useUpdateCartItem,
  useRemoveFromCart, useApplyDiscount,
  useClearCart, usePrepareCheckout,
} from '@/core/hooks';


export default function Cart() {
  const locale = useLocale();
  const t = useTranslations('Cart');
  const { isAuthenticated } = useAuthStore();
  const [isVisible, setIsVisible] = useState(false);
  const [promoCode, setPromoCode] = useState('');

  const { data: cart, isLoading, error } = useCart();
  const updateItemMutation = useUpdateCartItem();
  const removeItemMutation = useRemoveFromCart();
  const applyDiscountMutation = useApplyDiscount();
  const clearCartMutation = useClearCart();
  const checkoutMutation = usePrepareCheckout();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 via-amber-50 to-white flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-green-100">
          <div className="w-16 h-16 bg-linear-to-r from-amber-100 to-green-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">
            🔒
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            {t('authenticationRequired')}
          </h3>
          <p className="text-gray-600 mb-6">
            {t('pleaseLoginToViewCart')}
          </p>
          <Link
            href={`/${locale}/login`}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-linear-to-r from-green-600 to-amber-500 text-white font-medium rounded-full hover:shadow-lg transition-all duration-300"
          >
            <span>{t('login')}</span>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 via-amber-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loadingCart')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 via-amber-50 to-white flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-green-100">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-3xl text-red-500 mx-auto mb-6">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            {t('errorLoadingCart')}
          </h3>
          <p className="text-gray-600 mb-6">
            {error.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-linear-to-r from-green-600 to-amber-500 text-white font-medium rounded-full hover:shadow-lg transition-all duration-300"
          >
            <span>{t('retry')}</span>
          </button>
        </div>
      </div>
    );
  }

  const cartItems = cart?.items || [];
  const subtotal = cart?.totalAmount || 0;
  const discountAmount = cart?.discountAmount || 0;

  const hasItems = cartItems.length > 0;
  const deliveryFee = hasItems ? 2.99 : 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = hasItems ? taxableAmount * 0.08 : 0;
  const total = taxableAmount + deliveryFee + tax;

  const freeDeliveryThreshold = 1500;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const progressPercentage = Math.min((subtotal / freeDeliveryThreshold) * 100, 100);

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(productId);
      return;
    }
    updateItemMutation.mutate({ productId, quantity: newQuantity });
  };

  const removeItem = (productId: string) => {
    removeItemMutation.mutate(productId);
  };

  const applyPromoCode = () => {
    if (promoCode.trim()) {
      applyDiscountMutation.mutate({ code: promoCode });
      setPromoCode('');
    }
  };

  const handleClearCart = () => {
    if (window.confirm(t('confirmClearCart'))) {
      clearCartMutation.mutate();
    }
  };

  const handleCheckout = () => {
    checkoutMutation.mutate();
    //! переходимо до оформлення заказу
    // window.location.href = `/${locale}/checkout`;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-amber-50 to-white p-4 md:p-8">
      <div className={`max-w-7xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href={`/${locale}/products`}
                className="flex items-center space-x-3 text-green-700 hover:text-green-800 transition-colors"
              >
                <div className="w-10 h-10 bg-linear-to-r from-green-200 to-amber-100 rounded-xl flex items-center justify-center shadow-lg">
                  ←
                </div>
                <span className="font-medium">{t('continueShopping')}</span>
              </Link>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-700 font-medium">
                {cartItems.length} {t('items')}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Cart Items */}
          <div className="lg:col-span-2">
            {/* Cart Header */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 mb-6 border border-green-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
                    🛒
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-linear-to-r from-green-700 to-amber-600 bg-clip-text text-transparent">
                      {t('yourCart')}
                    </h1>
                    <p className="text-gray-600">{t('cartDescription')}</p>
                  </div>
                </div>

                {cartItems.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    disabled={clearCartMutation.isPending}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {clearCartMutation.isPending ? t('clearing') : t('clearAll')}
                  </button>
                )}
              </div>

              {/* Progress Bar */}
              {hasItems && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>
                      {remainingForFreeDelivery > 0
                        ? t('freeDeliveryProgress', { amount: remainingForFreeDelivery.toFixed(2) })
                        : t('freeDeliveryAchieved')}
                    </span>
                    <span className="font-bold text-green-600">
                      ₴{subtotal.toFixed(2)} / ₴{freeDeliveryThreshold}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-linear-to-r from-green-500 to-amber-500 h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  {remainingForFreeDelivery <= 0 && (
                    <p className="text-green-600 text-sm mt-2">
                      🎉 {t('freeDeliveryUnlocked')}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Cart Items List */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="flex items-start space-x-6">
                    {/* Product Image */}
                    <div className="relative">
                      <div className="w-24 h-24 bg-linear-to-br from-green-100 to-amber-100 rounded-2xl flex items-center justify-center text-4xl shadow-md">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        ) : (
                          '🛍️'
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        disabled={removeItemMutation.isPending}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110 disabled:opacity-50"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                          <div className="flex items-center space-x-3 mt-2">
                            {item.category && (
                              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                                {item.category}
                              </span>
                            )}
                            {item.farmer && (
                              <span className="text-gray-600 text-sm">
                                {t('from')} {item.farmer}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-green-700">
                          ₴{((item.price - item.discount) * item.quantity).toFixed(2)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="text-gray-600">
                          <span className="text-sm">{t('price')}: </span>
                          <span className="font-medium">
                            ₴{(item.price - item.discount).toFixed(2)}
                            {item.discount > 0 && (
                              <span className="text-red-500 ml-2 line-through">
                                ₴{item.price.toFixed(2)}
                              </span>
                            )}
                          </span>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2 bg-green-50 rounded-full p-1">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              disabled={updateItemMutation.isPending}
                              className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-green-700 hover:bg-green-100 transition-colors shadow-sm disabled:opacity-50"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-8 text-center font-bold text-gray-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              disabled={updateItemMutation.isPending || item.quantity >= item.maxQuantity}
                              className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-green-700 hover:bg-green-100 transition-colors shadow-sm disabled:opacity-50"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {cartItems.length === 0 && (
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-12 text-center border border-green-100">
                <div className="w-24 h-24 bg-linear-to-r from-green-100 to-amber-100 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6">
                  🛒
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{t('emptyCartTitle')}</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">{t('emptyCartDescription')}</p>
                <Link
                  href={`/${locale}/products`}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-linear-to-r from-green-600 to-amber-500 text-white font-medium rounded-full hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  <ShoppingBag size={20} />
                  <span>{t('startShopping')}</span>
                </Link>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Order Summary */}
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 mb-6 border border-green-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('orderSummary')}</h2>

                {/* Summary Items */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>{t('subtotal')}</span>
                    <span className="font-medium">₴{subtotal.toFixed(2)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>{t('discount')}</span>
                      <span className="font-medium">-₴{discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>{t('delivery')}</span>
                    <span className="font-medium">₴{deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{t('tax')}</span>
                    <span className="font-medium">₴{tax.toFixed(2)}</span>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-xl font-bold text-gray-800">
                      <span>{t('total')}</span>
                      <span className="bg-linear-to-r from-green-700 to-amber-600 bg-clip-text text-transparent">
                        ₴{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0 || checkoutMutation.isPending}
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${cartItems.length === 0 || checkoutMutation.isPending
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-linear-to-r from-green-600 to-amber-500 text-white hover:shadow-xl hover:-translate-y-0.5'
                    }`}
                >
                  {checkoutMutation.isPending ? t('preparing') :
                    cartItems.length === 0 ? t('emptyCart') : t('proceedToCheckout')}
                </button>
              </div>

              {/* Benefits Section */}
              <div className="bg-linear-to-br from-green-50 to-amber-50 rounded-3xl shadow-xl p-6 border border-green-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{t('benefits.title')}</h3>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 shrink-0">
                      <Truck size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{t('benefits.freshDelivery')}</h4>
                      <p className="text-sm text-gray-600">{t('benefits.deliveryDescription')}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                      <Shield size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{t('benefits.qualityGuarantee')}</h4>
                      <p className="text-sm text-gray-600">{t('benefits.qualityDescription')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mt-6 bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-green-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{t('promoCode')}</h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder={t('enterPromoCode')}
                    className="flex-1 px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    onClick={applyPromoCode}
                    disabled={applyDiscountMutation.isPending || !promoCode.trim()}
                    className="px-6 py-3 bg-linear-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                  >
                    {applyDiscountMutation.isPending ? t('applying') : t('apply')}
                  </button>
                </div>
                {applyDiscountMutation.error && (
                  <p className="text-red-500 text-sm mt-2">
                    {applyDiscountMutation.error.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Farmer Support Note */}
        {hasItems && (
          <div className="mt-8 bg-linear-to-r from-green-50 via-amber-50 to-green-50 rounded-3xl shadow-xl p-8 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-linear-to-r from-green-500 to-amber-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
                  👨‍🌾
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{t('farmerSupport.title')}</h3>
                  <p className="text-gray-600">{t('farmerSupport.description')}</p>
                </div>
              </div>
              <div className="text-green-700 font-bold text-lg">
                ₴{(taxableAmount * 0.15).toFixed(2)} {t('farmerSupport.donated')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}