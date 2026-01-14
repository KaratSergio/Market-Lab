import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, ProductStatus } from '@/core/types/productTypes';

interface ProductState {
  // Products data
  products: Product[];
  filteredProducts: Product[];
  selectedProduct: Product | null;

  // UI state
  loading: boolean;
  error: string | null;
  successMessage: string | null;

  // Filters
  searchQuery: string;
  selectedCategory: string | null;
  statusFilter: ProductStatus | 'all';

  // Actions
  setProducts: (products: Product[]) => void;
  setFilteredProducts: (products: Product[]) => void;
  setSelectedProduct: (product: Product | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccessMessage: (message: string | null) => void;

  // Product CRUD actions
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  restockProduct: (id: string, quantity: number) => void;
  toggleProductStatus: (id: string, status: ProductStatus) => void;

  // Filter actions
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setStatusFilter: (status: ProductStatus | 'all') => void;

  applyFilters: () => void;
  clearFilters: () => void;

  // Reset
  reset: () => void;
}

const getInitialState = () => ({
  products: [] as Product[],
  filteredProducts: [] as Product[],
  selectedProduct: null as Product | null,
  loading: false,
  error: null as string | null,
  successMessage: null as string | null,
  searchQuery: '',
  selectedCategory: null as string | null,
  statusFilter: 'all' as ProductStatus | 'all',
});

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      setProducts: (products) => set({
        products,
        filteredProducts: products,
      }),

      setFilteredProducts: (products) => set({ filteredProducts: products }),

      setSelectedProduct: (product) => set({ selectedProduct: product }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      setSuccessMessage: (message) => set({ successMessage: message }),

      addProduct: (product) => {
        const { products } = get();
        set({
          products: [product, ...products],
          filteredProducts: [product, ...products],
          successMessage: 'Product created successfully',
        });
      },

      updateProduct: (id, updates) => {
        const { products } = get();
        const updatedProducts = products.map(p =>
          p.id === id ? { ...p, ...updates } : p
        );
        set({
          products: updatedProducts,
          filteredProducts: updatedProducts,
          successMessage: 'Product updated successfully',
        });
      },

      deleteProduct: (id) => {
        const { products } = get();
        const updatedProducts = products.filter(p => p.id !== id);
        set({
          products: updatedProducts,
          filteredProducts: updatedProducts,
          successMessage: 'Product deleted successfully',
        });
      },

      restockProduct: (id, quantity) => {
        const { products } = get();
        const updatedProducts = products.map(p =>
          p.id === id ? { ...p, stock: p.stock + quantity } : p
        );
        set({
          products: updatedProducts,
          filteredProducts: updatedProducts,
          successMessage: `Restocked ${quantity} units`,
        });
      },

      toggleProductStatus: (id, status) => {
        const { products } = get();
        const updatedProducts = products.map(p =>
          p.id === id ? { ...p, status, isActive: status === 'active' } : p
        );
        set({
          products: updatedProducts,
          filteredProducts: updatedProducts,
          successMessage: `Product ${status === 'active' ? 'activated' : 'deactivated'}`,
        });
      },

      setSearchQuery: (query) => set({ searchQuery: query }),

      setSelectedCategory: (category) => set({ selectedCategory: category }),

      setStatusFilter: (status) => set({ statusFilter: status }),

      applyFilters: () => {
        const { products, searchQuery, selectedCategory, statusFilter } = get();

        let filtered = products;

        // Apply search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query)
          );
        }

        // Apply status filter
        if (statusFilter !== 'all') {
          filtered = filtered.filter(p => p.status === statusFilter);
        }

        set({ filteredProducts: filtered });
      },

      clearFilters: () => {
        const { products } = get();
        set({
          filteredProducts: products,
          searchQuery: '',
          selectedCategory: null,
          statusFilter: 'all' as ProductStatus | 'all',
        });
      },

      reset: () => set(getInitialState()),
    }),
    {
      name: 'product-storage',
      partialize: (state) => ({
        products: state.products,
        selectedProduct: state.selectedProduct,
      }),
    }
  )
);