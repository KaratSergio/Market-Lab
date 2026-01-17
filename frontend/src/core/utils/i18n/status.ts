import { ProductStatus } from '../../types/productTypes';
import { useTranslations } from 'next-intl';


export function useStatusTranslations() {
  const t = useTranslations('Product.status');

  const translateStatus = (status: ProductStatus): string => {
    try {
      return t(status as ProductStatus);
    } catch {
      return status;
    }
  };

  const getStatusColors = (status: ProductStatus): string => {
    const statusColors: Record<ProductStatus, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-red-100 text-red-800',
    };

    return statusColors[status];
  };

  const getStatusInfo = (status: ProductStatus) => {
    return {
      label: translateStatus(status),
      colors: getStatusColors(status)
    };
  };

  return {
    translateStatus,
    getStatusColors,
    getStatusInfo
  };
}