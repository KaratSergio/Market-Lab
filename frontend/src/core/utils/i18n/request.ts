import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale, type Locale } from '../../constants/locales';


function validateLocale(locale: string | undefined): Locale {
  if (locale && locales.includes(locale as Locale)) {
    return locale as Locale;
  }
  return defaultLocale;
}


export default getRequestConfig(async ({ locale }) => {
  const validatedLocale = validateLocale(locale);

  return {
    locale: validatedLocale,
    messages: (await import(`../../../../messages/${validatedLocale}.json`)).default,
    timeZone: 'Europe/Kiev'
  };
});