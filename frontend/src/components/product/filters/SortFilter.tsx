'use client';

import { useTranslations } from 'next-intl';
import { Funnel } from 'lucide-react';

interface SortFilterProps {
  value: string;
  onChange: (sortValue: string) => void;
  label: string;
}

export function SortFilter({ value, onChange, label }: SortFilterProps) {
  const t = useTranslations();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={handleChange}
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
        >
          <option value="newest">{t('Catalog.sortNewest')}</option>
          <option value="oldest">{t('Catalog.sortOldest')}</option>
          <option value="price-low">{t('Catalog.sortPriceLow')}</option>
          <option value="price-high">{t('Catalog.sortPriceHigh')}</option>
          <option value="name-asc">{t('Catalog.sortNameAsc')}</option>
          <option value="name-desc">{t('Catalog.sortNameDesc')}</option>
        </select>
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Funnel />
        </div>
      </div>
    </div>
  );
}