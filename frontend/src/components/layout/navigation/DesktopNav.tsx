'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';

export function DesktopNav() {
  const pathname = usePathname();
  const t = useTranslations('Navigation');
  const locale = useLocale();

  const navItems = [
    { key: 'products', path: 'products', label: t('products') },
    { key: 'map', path: 'map', label: t('map') },
    { key: 'sellers', path: 'sellers', label: t('sellers') },
    { key: 'about', path: 'about', label: t('about') },
  ];

  const isActive = (path: string) => {
    const fullPath = `/${locale}/${path}`;
    return pathname === fullPath || pathname.startsWith(`${fullPath}/`);
  };

  return (
    <nav className="flex items-center gap-6">
      {navItems.map((item) => (
        <Link
          key={`${item.key}-${locale}`}
          href={`/${locale}/${item.path}`}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(item.path)
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