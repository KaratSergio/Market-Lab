import { useCategoryTranslations } from '@/core/utils/i18n';
import { FolderOpen } from 'lucide-react';

interface CategoryFilterProps {
  value: string;
  categories: Array<{ id: string; slug: string }>;
  onChange: (categoryId: string) => void;
  label: string;
  allCategoriesLabel: string;
}

export function CategoryFilter({
  value,
  categories,
  onChange,
  label,
  allCategoriesLabel,
}: CategoryFilterProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  const { translateCategory } = useCategoryTranslations();

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
          <option value="">{allCategoriesLabel}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {translateCategory(category.slug)}
            </option>
          ))}
        </select>
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <FolderOpen />
        </div>
      </div>
    </div>
  );
}