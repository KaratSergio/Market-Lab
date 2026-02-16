export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  unit: string;
  categoryId: string;
  subcategoryId: string;
  stock: number;
  images: string[];
  status: ProductStatus;
  supplierId: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProductStatus = 'active' | 'inactive' | 'archived' | 'draft';

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  categoryId?: string;
  subcategoryId?: string;
  stock?: number;
  status?: ProductStatus;
  tags?: string[];
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  subcategoryId?: string;
  stock?: number;
  status?: ProductStatus;
  tags?: string[];
  images?: string[];
}

export interface RestockProductDto {
  quantity: number;
}

export interface PurchaseProductDto {
  quantity: number;
  shippingAddress?: string;
  paymentMethod?: string;
}

export interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ImageUploadResponse {
  success: boolean;
  urls: string[];
  message: string;
}

export interface OwnershipInfo {
  isOwner: boolean;
  isSupplier: boolean;
  isAdmin: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface ProductStatistics {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  archivedProducts: number;
  draftProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  totalStockValue: number;
  averagePrice: number;
  categoriesCount: { [category: string]: number };
  monthlySales?: number;
  topProducts?: Product[];
}

export interface ProductSearchParams {
  category?: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'name' | 'createdAt' | 'stock';
  sortOrder?: 'ASC' | 'DESC';
}

export interface CategoryInfo {
  name: string;
  productCount: number;
  averagePrice: number;
}

export interface ProductFilters {
  category?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  searchQuery?: string;
}

export type MainCategoryKey =
  | 'vegetables' | 'fruits' | 'dairy-products' | 'meat-poultry'
  | 'eggs' | 'bread-bakery' | 'honey-bee-products' | 'preserves'
  | 'drinks' | 'grains-cereals' | 'nuts-dried-fruits' | 'vegetable-oils'
  | 'spices-herbs' | 'farm-delicacies' | 'baby-food' | 'other';

export type SubcategoryKey = string;