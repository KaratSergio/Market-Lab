import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { locales, defaultLocale } from './src/core/constants/locales';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localeDetection: false,
  localePrefix: 'always'
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  // console.log('Middleware processing:', pathname, 'first segment:', firstSegment);

  if (pathname === '/') {
    console.log('Redirecting root to default locale');
    const url = new URL(`/${defaultLocale}`, request.url);
    return Response.redirect(url);
  }

  if (firstSegment && !locales.includes(firstSegment as any)) {
    console.log('Adding locale prefix to:', pathname);
    if (
      pathname.startsWith('/api') ||
      pathname.startsWith('/_next') ||
      pathname.includes('.')
    ) {
      return intlMiddleware(request);
    }

    const url = new URL(`/${defaultLocale}${pathname}`, request.url);
    return Response.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/(uk|en)/:path*'
  ]
};