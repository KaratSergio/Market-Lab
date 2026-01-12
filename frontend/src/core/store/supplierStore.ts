import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Supplier,
  SupplierProfile,
  SupplierStatus,
  SupplierDocument,
} from '@/core/types/supplierTypes';

interface SupplierState {
  // Current supplier data
  currentSupplier: Supplier | null;
  supplierProfile: SupplierProfile | null;

  // Lists and filters
  suppliers: Supplier[];
  filteredSuppliers: Supplier[];
  selectedSupplier: Supplier | null;

  // Documents
  documents: string[];

  // UI state
  loading: boolean;
  error: string | null;

  // Actions
  setCurrentSupplier: (supplier: Supplier | null) => void;
  setSuppliers: (suppliers: Supplier[]) => void;
  setFilteredSuppliers: (suppliers: Supplier[]) => void;
  setSelectedSupplier: (supplier: Supplier | null) => void;
  setDocuments: (documents: string[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Filter actions
  filterByStatus: (status: SupplierStatus | 'all') => void;
  searchSuppliers: (query: string) => void;
  clearFilters: () => void;

  // Document actions
  addDocuments: (documentUrls: string[]) => void;
  removeDocumentByUrl: (documentUrl: string) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  currentSupplier: null,
  supplierProfile: null,
  suppliers: [],
  filteredSuppliers: [],
  selectedSupplier: null,
  documents: [],
  loading: false,
  error: null,
};

export const useSupplierStore = create<SupplierState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentSupplier: (supplier) => set({ currentSupplier: supplier }),

      setSuppliers: (suppliers) => set({
        suppliers,
        filteredSuppliers: suppliers
      }),

      setFilteredSuppliers: (suppliers) => set({ filteredSuppliers: suppliers }),

      setSelectedSupplier: (supplier) => set({ selectedSupplier: supplier }),

      setDocuments: (documents) => set({ documents }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      filterByStatus: (status) => {
        const { suppliers } = get();

        if (status === 'all') {
          set({ filteredSuppliers: suppliers });
          return;
        }

        const filtered = suppliers.filter(
          (supplier) => supplier.status === status
        );

        set({ filteredSuppliers: filtered });
      },

      searchSuppliers: (query) => {
        const { suppliers } = get();

        if (!query.trim()) {
          set({ filteredSuppliers: suppliers });
          return;
        }

        const searchTerm = query.toLowerCase();
        const filtered = suppliers.filter(
          (supplier) =>
            supplier.companyName.toLowerCase().includes(searchTerm) ||
            supplier.firstName.toLowerCase().includes(searchTerm) ||
            supplier.lastName.toLowerCase().includes(searchTerm) ||
            supplier.email?.toLowerCase().includes(searchTerm) ||
            supplier.registrationNumber.toLowerCase().includes(searchTerm)
        );

        set({ filteredSuppliers: filtered });
      },

      clearFilters: () => {
        const { suppliers } = get();
        set({ filteredSuppliers: suppliers });
      },

      addDocuments: (documentUrls) => {
        const { documents } = get();
        set({
          documents: [...documents, ...documentUrls]
        });
      },

      removeDocumentByUrl: (documentUrl) => {
        const { documents } = get();
        set({
          documents: documents.filter(url => url !== documentUrl)
        });
      },

      reset: () => set(initialState),
    }),
    {
      name: 'supplier-storage',
      partialize: (state) => ({
        currentSupplier: state.currentSupplier,
        supplierProfile: state.supplierProfile,
        documents: state.documents,
      }),
    }
  )
);

// Selectors for better performance
export const supplierSelectors = {
  // Get current supplier
  currentSupplier: (state: SupplierState) => state.currentSupplier,

  // Get supplier profile
  profile: (state: SupplierState) => state.supplierProfile,

  // Get all suppliers
  allSuppliers: (state: SupplierState) => state.suppliers,

  // Get filtered suppliers
  filteredSuppliers: (state: SupplierState) => state.filteredSuppliers,

  // Get selected supplier
  selectedSupplier: (state: SupplierState) => state.selectedSupplier,

  // Get documents
  documents: (state: SupplierState) => state.documents,

  // Get loading state
  isLoading: (state: SupplierState) => state.loading,

  // Get error
  error: (state: SupplierState) => state.error,

  // Get statistics
  supplierStats: (state: SupplierState) => state.supplierProfile?.stats,

  // Get supplier by ID
  getSupplierById: (state: SupplierState) => (id: string) =>
    state.suppliers.find(supplier => supplier.id === id),

  // Check if supplier is approved
  isApproved: (state: SupplierState) =>
    state.currentSupplier?.status === 'approved',

  // Check if supplier is pending
  isPending: (state: SupplierState) =>
    state.currentSupplier?.status === 'pending',

  // Check if supplier is rejected
  isRejected: (state: SupplierState) =>
    state.currentSupplier?.status === 'rejected',

  // Check if supplier is suspended
  isSuspended: (state: SupplierState) =>
    state.currentSupplier?.status === 'suspended',
};