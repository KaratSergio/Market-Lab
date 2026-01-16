'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const getCurrentLocale = (): string => {
    const segments = pathname.split('/');
    return segments[1] || 'uk';
  };

  const [currentLocale, setCurrentLocale] = useState<string>(getCurrentLocale());

  useEffect(() => {
    setCurrentLocale(getCurrentLocale());
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const changeLanguage = () => {
    const newLocale = currentLocale === 'uk' ? 'en' : 'uk';
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');

    router.push(newPath);
    setCurrentLocale(newLocale);
  };

  if (!mounted) {
    return (
      <div className="w-12 h-12 rounded-full bg-gray-100 shadow-sm"></div>
    );
  }

  const flagEmojis = {
    uk: 'UA',
    en: 'US'
  };

  const tooltips = {
    uk: 'Switch to English',
    en: 'Переключити на Українську'
  };

  return (
    <button
      onClick={changeLanguage}
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
      aria-label={tooltips[currentLocale as keyof typeof tooltips]}
      title={tooltips[currentLocale as keyof typeof tooltips]}
    >
      <div className="
        w-10 h-10 
        rounded-full 
        bg-gray-50 
        flex items-center justify-center
        text-gray-800 
        font-medium
        text-sm
      ">
        {flagEmojis[currentLocale as keyof typeof flagEmojis]}
      </div>
    </button>
  );
}