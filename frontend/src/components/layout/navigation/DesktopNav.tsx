'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { createNavItems, isPathActive } from '@/core/utils';

export function DesktopNav() {
  const pathname = usePathname();
  const t = useTranslations('Navigation');
  const locale = useLocale();

  const navTranslations = {
    products: t('products'),
    map: t('map'),
    sellers: t('sellers'),
    about: t('about')
  };

  const navItems = createNavItems(locale, navTranslations);

  return (
    <nav className="flex items-center gap-6">
      {navItems.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isPathActive(pathname, item.href)
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}