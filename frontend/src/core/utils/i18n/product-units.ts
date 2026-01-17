import { useTranslations } from 'next-intl';

// Defines a unit of measurement based on a category and subcategory
export const getProductUnit = (
  categorySlug: string,
  subcategorySlug?: string
): string => {
  // Meat and poultry - always kg
  if (categorySlug === 'meat-poultry') return 'kg';

  // Vegetables and fruits - usually kg
  if (['vegetables', 'fruits'].includes(categorySlug)) return 'kg';

  // Dairy products
  if (categorySlug === 'dairy-products') {
    // Liquid dairy products - liters
    if (['milk', 'cream'].includes(subcategorySlug || '')) return 'l';
    // Solid dairy products - kg
    return 'kg';
  }

  // Eggs - pieces
  if (categorySlug === 'eggs') return 'piece';

  // Bread and baked goods
  if (categorySlug === 'bread-bakery') {
    // Bread, buns, pies - pieces
    if (['bread', 'buns', 'pies', 'croissants'].includes(subcategorySlug || '')) return 'piece';
    // Cakes, cookies - kg
    return 'kg';
  }

  // Drinks - liters
  if (categorySlug === 'drinks') return 'l';

  // Honey - kg
  if (categorySlug === 'honey-bee-products') return 'kg';

  // Preserves
  if (categorySlug === 'preserves') {
    return subcategorySlug?.includes('juices') ? 'l' : 'kg';
  }

  // Grains and cereals - kg
  if (categorySlug === 'grains-cereals') return 'kg';

  // Nuts and dried fruits - kg
  if (categorySlug === 'nuts-dried-fruits') return 'kg';

  // Oils - liters
  if (categorySlug === 'vegetable-oils') return 'l';

  // Spices and herbs - grams
  if (categorySlug === 'spices-herbs') return 'g';

  // Farm delicacies - kg
  if (categorySlug === 'farm-delicacies') return 'kg';

  // Baby food
  if (categorySlug === 'baby-food') {
    return subcategorySlug === 'snacks' ? 'piece' : 'kg';
  }

  return 'piece';
};

export function useProductUnits() {
  const t = useTranslations('Product.units');

  const translateUnit = (unitKey: string): string => {
    try {
      return t(unitKey as any);
    } catch {
      return unitKey;
    }
  };

  const formatPriceWithUnit = (
    price: number,
    categorySlug: string,
    subcategorySlug?: string,
    locale: string = 'uk'
  ): string => {
    const unit = getProductUnit(categorySlug, subcategorySlug);
    const translatedUnit = translateUnit(unit);
    const formattedPrice = new Intl.NumberFormat(locale || 'uk-UA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);

    return `${formattedPrice} ₴ / ${translatedUnit}`;
  };

  const formatStockWithUnit = (
    stock: number,
    categorySlug: string,
    subcategorySlug?: string
  ): string => {
    const unit = getProductUnit(categorySlug, subcategorySlug);
    const translatedUnit = translateUnit(unit);
    return `${stock} ${translatedUnit}`;
  };

  return {
    getProductUnit,
    translateUnit,
    formatPriceWithUnit,
    formatStockWithUnit
  };
}