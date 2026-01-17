import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './src/core/constants/locales';

export default createMiddleware({
  locales,
  defaultLocale,
  localeDetection: false,
  localePrefix: 'always'
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};