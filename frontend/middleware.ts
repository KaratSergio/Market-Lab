import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale, type Locale } from '@/core/constants/locales';

const intlMiddleware = createIntlMiddleware({
  locales: locales as readonly Locale[],
  defaultLocale: defaultLocale as Locale,
  localePrefix: 'always',
  localeDetection: false
});

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}`;
    return NextResponse.redirect(url, 301);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};