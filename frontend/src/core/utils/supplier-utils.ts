import { Supplier, SupplierStatus, UpdateSupplierDto } from '@/core/types/supplierTypes';

/**
 * Get display name for supplier
 */
export const getSupplierDisplayName = (supplier: Supplier): string => {
  return supplier.companyName || `${supplier.firstName} ${supplier.lastName}`;
};

/**
 * Get status badge color
 */
export const getStatusColor = (status: SupplierStatus) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    suspended: 'bg-orange-100 text-orange-800 border-orange-200',
  };
  return `border ${colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`;
};

/**
 * Get status display text
 */
export const getStatusText = (status: SupplierStatus): string => {
  const texts = {
    pending: 'Under review',
    approved: 'Approved',
    rejected: 'Rejected',
    suspended: 'Suspended',
  };
  return texts[status];
};

/**
 * Check if supplier has required documents
 */
export const hasRequiredDocuments = (supplier: Supplier): boolean => {
  const requiredDocs = ['registration', 'tax_certificate', 'bank_account'];
  return requiredDocs.every(doc =>
    supplier.documents?.some(d => d.includes(doc))
  );
};

/**
 * Calculate supplier rating
 */
export const calculateSupplierRating = (stats: {
  totalProducts: number;
  activeOrders: number;
  totalRevenue: number;
  rating: number;
}): number => {
  const { rating, totalProducts, activeOrders } = stats;

  // Weighted rating calculation
  const ratingWeight = 0.4;
  const productsWeight = 0.3;
  const ordersWeight = 0.3;

  const maxProducts = 1000; // Maximum expected products
  const maxOrders = 500;   // Maximum expected orders

  const normalizedProducts = Math.min(totalProducts / maxProducts, 1);
  const normalizedOrders = Math.min(activeOrders / maxOrders, 1);

  return (
    rating * ratingWeight +
    normalizedProducts * productsWeight +
    normalizedOrders * ordersWeight
  ) * 5; // Scale to 5-star rating
};

/**
 * Filter suppliers by category
 */
export const filterSuppliersByCategory = (
  suppliers: Supplier[],
  category: string
): Supplier[] => {
  // This would need category data from supplier
  // For now, returns all suppliers
  return suppliers;
};

/**
 * Sort suppliers by various criteria
 */
export const sortSuppliers = (
  suppliers: Supplier[],
  sortBy: 'companyName' | 'createdAt' | 'status' | 'rating',
  sortOrder: 'asc' | 'desc' = 'asc'
): Supplier[] => {
  const sorted = [...suppliers];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'companyName':
        comparison = a.companyName.localeCompare(b.companyName);
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime();
        break;
      case 'status':
        const statusOrder = { pending: 0, approved: 1, suspended: 2, rejected: 3 };
        comparison = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
        break;
      case 'rating':
        // Would need rating data
        comparison = 0;
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return sorted;
};

/**
 * Validate supplier data before submission
 */
export const validateSupplierData = (data: Partial<UpdateSupplierDto>): string[] => {
  const errors: string[] = [];

  if (!data.companyName?.trim()) errors.push('Company name is required');
  if (!data.firstName?.trim()) errors.push('First name is required');
  if (!data.lastName?.trim()) errors.push('Last name is required');
  if (!data.registrationNumber?.trim()) errors.push('Registration number is required');
  if (!data.phone?.trim()) errors.push('Phone number is required');
  if (!data.address?.country?.trim()) errors.push('Country is required');
  if (!data.address?.city?.trim()) errors.push('City is required');
  if (!data.email?.trim()) errors.push('Email is required');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push('Incorrect email');

  return errors;
};