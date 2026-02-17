'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ArrowBigLeft } from 'lucide-react';
import { useMemo } from 'react';

interface BackButtonProps {
  className?: string;
  classText?: string;
  classIcon?: string;
  showText?: boolean;
  text?: string;
}

export function BackButton({
  className = '',
  classText = '',
  classIcon = '',
  showText = true,
  text
}: BackButtonProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();

  const backPath = useMemo(() => {
    const pathWithoutLocale = pathname.replace(`/${locale}`, '');

    const supplierId = searchParams.get('supplierId');

    if (pathWithoutLocale.includes('/products/')) {
      if (supplierId) return `/sellers/${supplierId}`;
      return '/products';
    }

    if (pathWithoutLocale.includes('/sellers/')) return '/sellers';

    return '/';
  }, [pathname, locale, searchParams]);


  return (
    <Link
      href={`/${locale}${backPath}`}
      className={`flex items-center space-x-3 text-amber-700 hover:text-amber-400 transition-colors group ${className}`}
    >
      <div className={`w-10 h-10 flex items-center justify-center transition-all ${classIcon}`}>
        <ArrowBigLeft className="w-5 h-5" />
      </div>
      {showText && (
        <span className={`${classText}`}>{text}</span>
      )}
    </Link>
  );
}