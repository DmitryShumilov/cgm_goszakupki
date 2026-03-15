import apiClient from './client';
import { normalizeRegionName } from '../utils/regionMapping';

export interface RegionData {
  region: string;
  sum: number;
  count: number;
  quantity: number;
  avg_price: number;
}

export interface SupplierData {
  distributor: string;
  amount: number;
  contracts_count: number;
}

export interface CategoryData {
  what_purchased: string;
  amount: number;
  contracts_count: number;
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

  // Топ поставщиков региона
  getRegionSuppliers: async (
    region: string,
    params?: { years?: number[]; limit?: number }
  ): Promise<SupplierData[]> => {
    try {
      const formattedParams: Record<string, string> = {};
      
      if (params?.years && params.years.length > 0) {
        formattedParams.years = params.years.join(',');
      }
      if (params?.limit) {
        formattedParams.limit = params.limit.toString();
      }
      
      const response = await apiClient.get<SupplierData[]>(
        `/api/map/regions/${encodeURIComponent(region)}/suppliers`,
        { params: formattedParams }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching region suppliers:', error);
      throw error;
    }
  },

  // Категории продуктов региона
  getRegionCategories: async (
    region: string,
    params?: { years?: number[]; limit?: number }
  ): Promise<CategoryData[]> => {
    try {
      const formattedParams: Record<string, string> = {};
      
      if (params?.years && params.years.length > 0) {
        formattedParams.years = params.years.join(',');
      }
      if (params?.limit) {
        formattedParams.limit = params.limit.toString();
      }
      
      const response = await apiClient.get<CategoryData[]>(
        `/api/map/regions/${encodeURIComponent(region)}/categories`,
        { params: formattedParams }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching region categories:', error);
      throw error;
    }
  },
};
