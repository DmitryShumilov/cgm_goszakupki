import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface FilterState {
  // Выбранные значения фильтров
  selectedYears: number[];
  selectedRegions: string[];
  selectedSuppliers: string[];
  selectedProducts: string[];

  // Доступные значения для фильтров
  availableYears: number[];
  availableRegions: string[];
  availableSuppliers: string[];
  availableProducts: string[];

  // Actions
  setAvailableYears: (years: number[]) => void;
  setAvailableRegions: (regions: string[]) => void;
  setAvailableSuppliers: (suppliers: string[]) => void;
  setAvailableProducts: (products: string[]) => void;

  toggleYear: (year: number) => void;
  toggleRegion: (region: string) => void;
  toggleSupplier: (supplier: string) => void;
  toggleProduct: (product: string) => void;

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
      selectedYears: [],
      selectedRegions: [],
      selectedSuppliers: [],
      selectedProducts: [],

      availableYears: [2024, 2025, 2026],
      availableRegions: [],
      availableSuppliers: [],
      availableProducts: [],

      // Set available values
      setAvailableYears: (years) => set({ availableYears: years, selectedYears: [] }),
      setAvailableRegions: (regions) => set({ availableRegions: regions, selectedRegions: regions }),
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

      toggleRegion: (region) => {
        const { selectedRegions } = get();
        const newSelection = selectedRegions.includes(region)
          ? selectedRegions.filter((r) => r !== region)
          : [...selectedRegions, region];
        set({ selectedRegions: newSelection });
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

      // Reset
      resetFilters: () => {
        set({
          selectedYears: [],
          selectedRegions: [],
          selectedSuppliers: [],
          selectedProducts: [],
        });
      },
    }),
    {
      name: 'cgm-map-filter-storage', // Ключ в localStorage
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        // Сохраняем только выбранные фильтры
        selectedYears: state.selectedYears,
        selectedRegions: state.selectedRegions,
        selectedSuppliers: state.selectedSuppliers,
        selectedProducts: state.selectedProducts,
      }),
    }
  )
);
