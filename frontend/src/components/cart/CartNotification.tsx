'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ShoppingCart, X } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

interface CartNotificationProps {
  itemName: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  onClose: () => void;
}

export function CartNotification({
  itemName,
  quantity,
  price,
  imageUrl,
  onClose,
}: CartNotificationProps) {
  const t = useTranslations('Cart');
  const locale = useLocale();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md w-full bg-white rounded-2xl shadow-2xl border border-green-200 transition-all duration-300 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
              <ShoppingCart size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">{t('itemAdded')}</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={t('close')}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center space-x-4 mb-4">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={itemName}
              className="w-16 h-16 object-cover rounded-xl"
            />
          ) : (
            <div className="w-16 h-16 bg-linear-to-br from-green-100 to-amber-100 rounded-xl flex items-center justify-center text-2xl">
              🛍️
            </div>
          )}

          <div className="flex-1">
            <h4 className="font-medium text-gray-800">{itemName}</h4>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-gray-600">
                {quantity} × ₴{price.toFixed(2)}
              </span>
              <span className="font-bold text-green-600">
                ₴{(quantity * price).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleClose}
            className="py-3 px-4 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            {t('continueShopping')}
          </button>
          <Link
            href={`/${locale}/cart`}
            onClick={handleClose}
            className="py-3 px-4 bg-linear-to-r from-green-600 to-amber-500 text-white rounded-xl
              font-medium flex items-center justify-center text-center hover:shadow-lg transition-all duration-300"
          >
            {t('viewCart')}
          </Link>
        </div>
      </div>
    </div>
  );
}