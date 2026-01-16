import { ProductStatus } from "../types/productTypes";

/**
 * Determines the unit of measurement based on category and subcategory
 */
export const getProductUnit = (
  categorySlug: string,
  subcategorySlug?: string
): string => {
  // Meat and poultry - always kg
  if (categorySlug === 'm-yaso-ta-ptitsya') return 'кг';

  // Vegetables and fruits - usually kg
  if (['ovochi', 'frukty'].includes(categorySlug)) return 'кг';

  // Dairy products
  if (categorySlug === 'molochni-produkty') {
    // Liquid dairy - liters
    if (['moloko', 'vershki'].includes(subcategorySlug || '')) return 'л';
    // Solid dairy - kg
    return 'кг';
  }

  // Eggs - pieces
  if (categorySlug === 'yajtsya') return 'шт';

  // Bread and bakery
  if (categorySlug === 'khlib-ta-vipichka') {
    // Bread, buns, pies - pieces
    if (['khlib', 'bulochky', 'pyrohy', 'kruasany'].includes(subcategorySlug || '')) return 'шт';
    // Cakes, cookies - kg
    return 'кг';
  }

  // Drinks - liters
  if (categorySlug === 'napoї') return 'л';

  // Honey - kg
  if (categorySlug === 'med-ta-bdzhilini-produkty') return 'кг';

  // Preserves
  if (categorySlug === 'konservatsiya')
    return subcategorySlug?.includes('соки') ? 'л' : 'кг';

  // Grains and cereals - kg
  if (categorySlug === 'zernovi-ta-krupi') return 'кг';

  // Nuts and dried fruits - kg
  if (categorySlug === 'gorikhi-ta-sukhofrukty') return 'кг';

  // Oils - liters
  if (categorySlug === 'roslinni-olii') return 'л';

  // Spices and herbs - grams
  if (categorySlug === 'spetsii-ta-travi') return 'г';

  // Farm delicacies - kg
  if (categorySlug === 'fermerski-delikatesi') return 'кг';

  // Baby food
  if (categorySlug === 'dityache-kharchuvannya')
    return subcategorySlug?.includes('снеки') ? 'шт' : 'кг';

  // Default
  return 'шт';
};

// Formats price with unit of measurement
export const formatPriceWithUnit = (
  price: number,
  categorySlug: string,
  subcategorySlug?: string
): string => {
  const unit = getProductUnit(categorySlug, subcategorySlug);
  return `${price.toFixed(2)} ₴ / ${unit}`;
};

//Formats stock with unit of measurement
export const formatStockWithUnit = (
  stock: number,
  categorySlug: string,
  subcategorySlug?: string
): string => {
  const unit = getProductUnit(categorySlug, subcategorySlug);
  return `${stock} ${unit}`;
};



/**
 * Translates product status from English to Ukrainian
 */
export const translateStatusToUkrainian = (status: ProductStatus): string => {
  const translations: Record<ProductStatus, string> = {
    active: 'Активний',
    inactive: 'Неактивний',
    draft: 'Чернетка',
    archived: 'Архівований'
  };

  return translations[status] || status;
};

//Gets status color classes
export const getStatusColors = (status: ProductStatus): string => {
  const statusColors: Record<ProductStatus, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    draft: 'bg-yellow-100 text-yellow-800',
    archived: 'bg-red-100 text-red-800',
  };

  return statusColors[status];
};

export const getStatusInfo = (status: ProductStatus) => {
  return {
    label: translateStatusToUkrainian(status),
    colors: getStatusColors(status)
  };
}