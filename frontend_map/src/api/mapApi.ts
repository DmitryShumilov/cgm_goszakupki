import apiClient from './client';
import { normalizeRegionName } from '../utils/regionMapping';

export interface RegionData {
  region: string;
  sum: number;
  count: number;
  quantity: number;
  avg_price: number;
}

export interface FilterParams {
  years?: number[];
  regions?: string[];
  suppliers?: string[];
  products?: string[];
}

// Вспомогательная функция для форматирования параметров
const formatParams = (params?: FilterParams): Record<string, string> => {
  const formatted: Record<string, string> = {};
  
  if (params?.years && params.years.length > 0) {
    formatted.years = params.years.join(',');
  }
  if (params?.regions && params.regions.length > 0) {
    formatted.regions = params.regions.join(',');
  }
  if (params?.suppliers && params.suppliers.length > 0) {
    formatted.suppliers = params.suppliers.join(',');
  }
  if (params?.products && params.products.length > 0) {
    formatted.products = params.products.join(',');
  }
  
  return formatted;
};

export const mapApi = {
  // Получение данных по всем регионам с фильтрацией
  getRegions: async (params?: FilterParams): Promise<RegionData[]> => {
    try {
      const formattedParams = formatParams(params);
      const response = await apiClient.get<RegionData[]>('/api/map/regions', { 
        params: formattedParams 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching regions:', error);
      throw error;
    }
  },

  // Получение доступных лет
  getYears: async (): Promise<number[]> => {
    try {
      const response = await apiClient.get<number[]>('/api/filters/years');
      return response.data;
    } catch (error) {
      console.error('Error fetching years:', error);
      throw error;
    }
  },

  // Получение доступных регионов
  getRegionsList: async (): Promise<string[]> => {
    try {
      const response = await apiClient.get<string[]>('/api/filters/regions');
      return response.data;
    } catch (error) {
      console.error('Error fetching regions:', error);
      throw error;
    }
  },

  // Получение доступных поставщиков
  getSuppliers: async (): Promise<string[]> => {
    try {
      const response = await apiClient.get<string[]>('/api/filters/suppliers');
      return response.data;
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
  },

  // Получение доступных продуктов
  getProducts: async (): Promise<string[]> => {
    try {
      const response = await apiClient.get<string[]>('/api/filters/products');
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },
};
