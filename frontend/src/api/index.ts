import apiClient from './client';
import type { KpiData, DynamicsData, RegionsData, SuppliersData, CategoriesData, HeatmapData, FilterParams } from './types';

// POST запрос для больших фильтров
const postQuery = async <T>(url: string, params: FilterParams = {}): Promise<T> => {
  const response = await apiClient.post<T>(url, params);
  return response.data;
};

export const dashboardApi = {
  // KPI
  getKpi: async (params: FilterParams = {}): Promise<KpiData> => {
    return postQuery<KpiData>('/kpi', params);
  },

  // Charts
  getDynamics: async (params: FilterParams = {}): Promise<DynamicsData> => {
    return postQuery<DynamicsData>('/charts/dynamics', params);
  },

  getRegions: async (params: FilterParams = {}): Promise<RegionsData> => {
    return postQuery<RegionsData>('/charts/regions', params);
  },

  getSuppliers: async (params: FilterParams = {}): Promise<SuppliersData> => {
    return postQuery<SuppliersData>('/charts/suppliers', params);
  },

  getCategories: async (params: FilterParams = {}): Promise<CategoriesData> => {
    return postQuery<CategoriesData>('/charts/categories', params);
  },

  getHeatmap: async (params: FilterParams = {}): Promise<HeatmapData> => {
    return postQuery<HeatmapData>('/charts/heatmap', params);
  },

  // Filters (GET, так как возвращают справочники)
  getYears: async (): Promise<number[]> => {
    const response = await apiClient.get<number[]>('/filters/years');
    return response.data;
  },

  getMonths: async (): Promise<number[]> => {
    const response = await apiClient.get<number[]>('/filters/months');
    return response.data;
  },

  getRegionsList: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/filters/regions');
    return response.data;
  },

  getCustomersList: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/filters/customers');
    return response.data;
  },

  getSuppliersList: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/filters/suppliers');
    return response.data;
  },

  getProductsList: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/filters/products');
    return response.data;
  },
};
