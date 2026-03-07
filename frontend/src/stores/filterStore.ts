import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface FilterState {
  // Выбранные значения фильтров
  selectedYears: number[];
  selectedMonths: number[];
  selectedRegions: string[];
  selectedCustomers: string[];
  selectedSuppliers: string[];
  selectedProducts: string[];

  // Доступные значения для фильтров
  availableYears: number[];
  availableMonths: number[];
  availableRegions: string[];
  availableCustomers: string[];
  availableSuppliers: string[];
  availableProducts: string[];

  // Actions
  setAvailableYears: (years: number[]) => void;
  setAvailableMonths: (months: number[]) => void;
  setAvailableRegions: (regions: string[]) => void;
  setAvailableCustomers: (customers: string[]) => void;
  setAvailableSuppliers: (suppliers: string[]) => void;
  setAvailableProducts: (products: string[]) => void;

  toggleYear: (year: number) => void;
  toggleMonth: (month: number) => void;
  toggleRegion: (region: string) => void;
  toggleCustomer: (customer: string) => void;
  toggleSupplier: (supplier: string) => void;
  toggleProduct: (product: string) => void;

  selectAllYears: () => void;
  selectAllMonths: () => void;

  resetFilters: () => void;
}

// Безопасное хранилище для SSR
const safeStorage = {
  getItem: (key: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    return null;
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // Игнорируем ошибки localStorage
      }
    }
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Игнорируем ошибки localStorage
      }
    }
  },
};

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      // Начальные значения
      selectedYears: [2024],
      selectedMonths: [],
      selectedRegions: [],
      selectedCustomers: [],
      selectedSuppliers: [],
      selectedProducts: [],

      availableYears: [],
      availableMonths: [],
      availableRegions: [],
      availableCustomers: [],
      availableSuppliers: [],
      availableProducts: [],

      // Set available values
      setAvailableYears: (years) => {
        const initialYear = 2024;
        const defaultSelection = years.includes(initialYear) ? [initialYear] : years;
        set({ availableYears: years, selectedYears: defaultSelection });
      },
      setAvailableMonths: (months) => set({ availableMonths: months, selectedMonths: months }),
      setAvailableRegions: (regions) => set({ availableRegions: regions, selectedRegions: regions }),
      setAvailableCustomers: (customers) => set({ availableCustomers: customers, selectedCustomers: customers }),
      setAvailableSuppliers: (suppliers) => set({ availableSuppliers: suppliers, selectedSuppliers: suppliers }),
      setAvailableProducts: (products) => set({ availableProducts: products, selectedProducts: products }),

      // Toggle functions
      toggleYear: (year) => {
        const { selectedYears } = get();
        const newSelection = selectedYears.includes(year)
          ? selectedYears.filter((y) => y !== year)
          : [...selectedYears, year];
        set({ selectedYears: newSelection });
      },

      toggleMonth: (month) => {
        const { selectedMonths } = get();
        const newSelection = selectedMonths.includes(month)
          ? selectedMonths.filter((m) => m !== month)
          : [...selectedMonths, month];
        set({ selectedMonths: newSelection });
      },

      toggleRegion: (region) => {
        const { selectedRegions } = get();
        const newSelection = selectedRegions.includes(region)
          ? selectedRegions.filter((r) => r !== region)
          : [...selectedRegions, region];
        set({ selectedRegions: newSelection });
      },

      toggleCustomer: (customer) => {
        const { selectedCustomers } = get();
        const newSelection = selectedCustomers.includes(customer)
          ? selectedCustomers.filter((c) => c !== customer)
          : [...selectedCustomers, customer];
        set({ selectedCustomers: newSelection });
      },

      toggleSupplier: (supplier) => {
        const { selectedSuppliers } = get();
        const newSelection = selectedSuppliers.includes(supplier)
          ? selectedSuppliers.filter((s) => s !== supplier)
          : [...selectedSuppliers, supplier];
        set({ selectedSuppliers: newSelection });
      },

      toggleProduct: (product) => {
        const { selectedProducts } = get();
        const newSelection = selectedProducts.includes(product)
          ? selectedProducts.filter((p) => p !== product)
          : [...selectedProducts, product];
        set({ selectedProducts: newSelection });
      },

      // Select all
      selectAllYears: () => set({ selectedYears: get().availableYears }),
      selectAllMonths: () => set({ selectedMonths: get().availableMonths }),

      // Reset
      resetFilters: () => {
        const { availableYears } = get();
        const initialYear = 2024;
        const defaultYear = availableYears.includes(initialYear) ? [initialYear] : availableYears;
        set({
          selectedYears: defaultYear,
          selectedMonths: get().availableMonths,
          selectedRegions: [],
          selectedCustomers: [],
          selectedSuppliers: [],
          selectedProducts: [],
        });
      },
    }),
    {
      name: 'cgm-filter-storage', // Ключ в localStorage
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        // Сохраняем только выбранные фильтры
        selectedYears: state.selectedYears,
        selectedMonths: state.selectedMonths,
        selectedRegions: state.selectedRegions,
        selectedCustomers: state.selectedCustomers,
        selectedSuppliers: state.selectedSuppliers,
        selectedProducts: state.selectedProducts,
      }),
    }
  )
);
