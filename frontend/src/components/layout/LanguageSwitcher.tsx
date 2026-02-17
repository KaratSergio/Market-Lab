'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();

  const newLocale = locale === 'uk' ? 'en' : 'uk';
  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';

  const supplierId = searchParams.get('supplierId');
  const queryString = supplierId ? `?supplierId=${supplierId}` : '';

  const newPath = `/${newLocale}${pathWithoutLocale}${queryString}`;

  const flagEmojis = {
    uk: '🇺🇦',
    en: '🇺🇸'
  };

  const tooltips = {
    uk: 'Switch to English',
    en: 'Переключити на Українську'
  };

  return (
    <Link
      href={newPath}
      className="
        w-12 h-12 
        rounded-full 
        bg-white 
        flex items-center justify-center
        shadow-lg
        hover:shadow-xl
        active:shadow-md
        transition-shadow duration-200
        border border-gray-100
        focus:outline-none focus:ring-2 focus:ring-gray-300
      "
      aria-label={tooltips[locale as keyof typeof tooltips]}
      title={tooltips[locale as keyof typeof tooltips]}
      prefetch={false}
    >
      <div className="
        w-10 h-10 
        rounded-full 
        flex items-center justify-center
        text-xl pb-1
      ">
        {flagEmojis[locale as keyof typeof flagEmojis]}
      </div>
    </Link>
  );
}