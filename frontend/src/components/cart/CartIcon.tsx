'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export function CartIcon() {
  const locale = useLocale();
  const t = useTranslations();

  const cartItemsCount = 3; //! mock data

  return (
    <Link
      href={`/${locale}/cart`}
      className="relative flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <span className="text-gray-700">🛒</span>
      <span className="hidden md:inline text-sm font-medium">
        {t('Cart.cart')}
      </span>
      {cartItemsCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {cartItemsCount}
        </span>
      )}
    </Link>
  );
}