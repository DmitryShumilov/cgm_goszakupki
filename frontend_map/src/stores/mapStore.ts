import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mapApi } from '../api/mapApi';
import type { RegionData, FilterParams } from '../api/mapApi';
import { useFilterStore } from './filterStore';

interface MapState {
  selectedRegion: string | null;
  regionData: RegionData[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setSelectedRegion: (region: string | null) => void;
  loadRegionData: (params?: FilterParams) => Promise<void>;
  refreshData: () => Promise<void>;
  clearSelection: () => void;
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

export const useMapStore = create<MapState>()(
  persist(
    (set, get) => ({
      selectedRegion: null,
      regionData: [],
      isLoading: false,
      error: null,

      setSelectedRegion: (region) => {
        set({ selectedRegion: region });
      },

      clearSelection: () => {
        set({ selectedRegion: null });
      },

      loadRegionData: async (params?: FilterParams) => {
        set({ isLoading: true, error: null });
        try {
          // Получаем текущие фильтры из filterStore
          const { 
            selectedYears, 
            selectedRegions, 
            selectedSuppliers, 
            selectedProducts 
          } = useFilterStore.getState();
          
          // Формируем параметры для API
          const apiParams: FilterParams = {
            years: params?.years ?? selectedYears,
            regions: params?.regions ?? selectedRegions,
            suppliers: params?.suppliers ?? selectedSuppliers,
            products: params?.products ?? selectedProducts,
          };
          
          // Запрос к API
          const data = await mapApi.getRegions(apiParams);
          
          set({ 
            regionData: data, 
            isLoading: false,
            error: null 
          });
          
          console.log('✅ Map data loaded:', data.length, 'regions');
        } catch (error) {
          console.error('❌ Error loading map data:', error);
          set({ 
            isLoading: false, 
            error: 'Не удалось загрузить данные карты' 
          });
        }
      },
      
      refreshData: async () => {
        await get().loadRegionData();
      },
    }),
    {
      name: 'cgm-map-storage',
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        // Сохраняем только выбранный регион
        selectedRegion: state.selectedRegion,
      }),
    }
  )
);
