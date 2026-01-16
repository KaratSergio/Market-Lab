'use client';

import {
  useTranslations, useLocale,
  TranslationValues, AbstractIntlMessages
} from 'next-intl';

import {
  Locale, localeFormats,
  localeLanguageCodes, localeCurrencies
} from '../constants/locales';

// Types for translation keys
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
  ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
  : `${Key}`;
}[keyof ObjectType & (string | number)];

type Messages = AbstractIntlMessages;
type TranslationKey = NestedKeyOf<Messages>;


export function useTranslation() {
  const t = useTranslations();
  const locale = useLocale() as Locale;

  const safeTranslate = (
    key: string,
    fallback?: string
  ): string => {
    try {
      return t(key as TranslationKey);
    } catch (error) {
      console.warn(`Translation key not found: ${key}`);
      return fallback || key;
    }
  };

  const translateCategory = (categoryKey: string): string => {
    const key = `Categories.main.${categoryKey}` as TranslationKey;
    return safeTranslate(key, categoryKey);
  };

  const translateSubcategory = (
    mainCategory: string,
    subcategoryKey: string
  ): string => {
    const key = `Categories.${mainCategory}.${subcategoryKey}` as TranslationKey;
    return safeTranslate(key, subcategoryKey);
  };

  const translateWithParams = (
    key: string,
    params: TranslationValues = {}
  ): string => {
    try {
      return t(key as TranslationKey, params);
    } catch {
      return safeTranslate(key, key);
    }
  };

  // Rich translation with React elements (returns ReactNode)
  const richTranslate = (
    key: string,
    params: Record<string, (chunks: React.ReactNode) => React.ReactNode> = {}
  ): React.ReactNode => {
    try {
      return t.rich(key as TranslationKey, params);
    } catch {
      return safeTranslate(key, key);
    }
  };

  // Pluralization (plural)
  const pluralize = (
    key: string,
    count: number,
    params?: Omit<TranslationValues, 'count'>
  ): string => {
    try {
      return t(key as TranslationKey, { count, ...params });
    } catch {
      return `${count} ${safeTranslate(key, key)}`;
    }
  };

  const formatPrice = (
    amount: number,
    currency?: string
  ): string => {
    const localeCurrency = currency || localeCurrencies[locale];
    const options = localeFormats[locale].price;

    const formatter = new Intl.NumberFormat(
      localeLanguageCodes[locale],
      { ...options, currency: localeCurrency }
    );

    return formatter.format(amount);
  };

  const formatDate = (
    date: Date | string,
    customOptions?: Intl.DateTimeFormatOptions
  ): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const options = {
      ...localeFormats[locale].date,
      ...customOptions
    };

    return new Intl.DateTimeFormat(
      localeLanguageCodes[locale],
      options
    ).format(dateObj);
  };

  // Checking the existence of a translation key
  const hasTranslation = (key: string): boolean => {
    try {
      t(key as TranslationKey);
      return true;
    } catch {
      return false;
    }
  };

  return {
    t,
    locale,
    safeTranslate,
    translateCategory,
    translateSubcategory,
    translateWithParams,
    pluralize,
    formatPrice,
    formatDate,
    hasTranslation,
    richTranslate,

    // Short aliases
    tr: safeTranslate,
    cat: translateCategory,
    subcat: translateSubcategory,
    withParams: translateWithParams,
    rich: richTranslate,
    plural: pluralize,
    price: formatPrice,
    date: formatDate,
    has: hasTranslation,
  };
}

export type UseTranslationReturn = ReturnType<typeof useTranslation>;