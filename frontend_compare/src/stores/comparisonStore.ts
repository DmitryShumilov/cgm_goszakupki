import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ComparisonState, PeriodFilters } from '../types';

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

const defaultPeriodA: PeriodFilters = {
  years: [],
  months: [],
  regions: [],
  products: [],
};

const defaultPeriodB: PeriodFilters = {
  years: [],
  months: [],
  regions: [],
  products: [],
};

export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set, get) => ({
      // Начальные значения
      periodA: defaultPeriodA,
      periodB: defaultPeriodB,

      availableYears: [],
      availableMonths: [],
      availableRegions: [],
      availableProducts: [],

      // Установка фильтров периода А
      setPeriodAFilters: (filters) => {
        set((state) => ({
          periodA: { ...state.periodA, ...filters },
        }));
      },

      // Установка фильтров периода Б
      setPeriodBFilters: (filters) => {
        set((state) => ({
          periodB: { ...state.periodB, ...filters },
        }));
      },

      // Переключение года периода А
      togglePeriodAYear: (year) => {
        const { periodA } = get();
        const newYears = periodA.years.includes(year)
          ? periodA.years.filter((y) => y !== year)
          : [...periodA.years, year];
        set({ periodA: { ...periodA, years: newYears } });
      },

      // Переключение года периода Б
      togglePeriodBYear: (year) => {
        const { periodB } = get();
        const newYears = periodB.years.includes(year)
          ? periodB.years.filter((y) => y !== year)
          : [...periodB.years, year];
        set({ periodB: { ...periodB, years: newYears } });
      },

      // Переключение региона периода А
      togglePeriodARegion: (region) => {
        const { periodA } = get();
        const newRegions = periodA.regions.includes(region)
          ? periodA.regions.filter((r) => r !== region)
          : [...periodA.regions, region];
        set({ periodA: { ...periodA, regions: newRegions } });
      },

      // Переключение региона периода Б
      togglePeriodBRegion: (region) => {
        const { periodB } = get();
        const newRegions = periodB.regions.includes(region)
          ? periodB.regions.filter((r) => r !== region)
          : [...periodB.regions, region];
        set({ periodB: { ...periodB, regions: newRegions } });
      },

      // Переключение продукта периода А
      togglePeriodAProduct: (product) => {
        const { periodA } = get();
        const newProducts = periodA.products.includes(product)
          ? periodA.products.filter((p) => p !== product)
          : [...periodA.products, product];
        set({ periodA: { ...periodA, products: newProducts } });
      },

      // Переключение продукта периода Б
      togglePeriodBProduct: (product) => {
        const { periodB } = get();
        const newProducts = periodB.products.includes(product)
          ? periodB.products.filter((p) => p !== product)
          : [...periodB.products, product];
        set({ periodB: { ...periodB, products: newProducts } });
      },

      // Обмен периодов местами
      swapPeriods: () => {
        const { periodA, periodB } = get();
        set({ periodA: periodB, periodB: periodA });
      },

      // Сброс периода А
      resetPeriodA: () => set({ periodA: defaultPeriodA }),

      // Сброс периода Б
      resetPeriodB: () => set({ periodB: defaultPeriodB }),

      // Сброс всех фильтров
      resetAll: () => set({
        periodA: defaultPeriodA,
        periodB: defaultPeriodB,
      }),

      // Установка доступных значений
      setAvailableYears: (years) => set({ availableYears: years }),
      setAvailableMonths: (months) => set({ availableMonths: months }),
      setAvailableRegions: (regions) => set({ availableRegions: regions }),
      setAvailableProducts: (products) => set({ availableProducts: products }),
    }),
    {
      name: 'cgm-comparison-storage', // Ключ в localStorage
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        // Сохраняем только выбранные фильтры
        periodA: state.periodA,
        periodB: state.periodB,
      }),
    }
  )
);
