export const locales = ['uk', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'uk';

export const localeNames: Record<Locale, string> = {
  uk: 'Українська',
  en: 'English'
};

export const localeFlags: Record<Locale, string> = {
  uk: 'UA',
  en: 'US'
};

export const localeLanguageCodes: Record<Locale, string> = {
  uk: 'uk-UA',
  en: 'en-US'
};

export const localeCurrencies: Record<Locale, string> = {
  uk: 'UAH',
  en: 'USD'
};

export const localeFormats: Record<Locale, {
  date: Intl.DateTimeFormatOptions;
  price: Intl.NumberFormatOptions;
}> = {
  uk: {
    date: {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
    price: {
      style: 'currency',
      currency: 'UAH',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  },
  en: {
    date: {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
    price: {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  }
};

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}