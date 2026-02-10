'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useCart } from '@/core/hooks/useCart';
import { useAuthStore } from '@/core/store/authStore';
import { ShoppingCart } from 'lucide-react';


export function CartIcon() {
  const locale = useLocale();
  const t = useTranslations();
  const { isAuthenticated } = useAuthStore();

  const { data: cart } = useCart();

  const cartItemsCount = isAuthenticated ? cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0 : 0;

  return (
    <Link
      href={`/${locale}/cart`}
      className="relative flex items-center gap-2 p-2 hover:bg-green-100 rounded-lg transition-colors"
      aria-label={t('Cart.cart')}
    >
      <ShoppingCart className="w-5 h-5 text-gray-700" />
      <span className="hidden md:inline text-sm font-medium">
        {t('Cart.cart')}
      </span>
      {cartItemsCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {cartItemsCount > 99 ? '99+' : cartItemsCount}
        </span>
      )}
    </Link>
  );
}