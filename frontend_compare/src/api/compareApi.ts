import apiClient from './client';
import type {
  FilterParams,
  ComparisonKpiResult,
  DynamicsData,
  RegionsData,
  SuppliersScatterData,
  ComparisonTableData,
} from '../types';

export const compareApi = {
  /**
   * Сравнение KPI двух периодов
   */
  getKpiComparison: async (
    paramsA: FilterParams,
    paramsB: FilterParams
  ): Promise<ComparisonKpiResult> => {
    const response = await apiClient.post('/compare/kpi', {
      periodA: paramsA,
      periodB: paramsB,
    });
    return response.data;
  },

  /**
   * Сравнение динамики закупок по месяцам
   */
  getDynamicsComparison: async (
    paramsA: FilterParams,
    paramsB: FilterParams
  ): Promise<DynamicsData> => {
    const response = await apiClient.post('/compare/dynamics', {
      periodA: paramsA,
      periodB: paramsB,
    });
    return response.data;
  },

  /**
   * Сравнение топ-10 регионов
   */
  getRegionsComparison: async (
    paramsA: FilterParams,
    paramsB: FilterParams
  ): Promise<RegionsData> => {
    const response = await apiClient.post('/compare/regions', {
      periodA: paramsA,
      periodB: paramsB,
    });
    return response.data;
  },

  /**
   * Данные для scatter plot поставщиков
   */
  getSuppliersScatter: async (
    paramsA: FilterParams,
    paramsB: FilterParams
  ): Promise<SuppliersScatterData> => {
    const response = await apiClient.post('/compare/suppliers', {
      periodA: paramsA,
      periodB: paramsB,
    });
    return response.data;
  },

  /**
   * Детальная таблица сравнения по регионам
   */
  getComparisonTable: async (
    paramsA: FilterParams,
    paramsB: FilterParams
  ): Promise<ComparisonTableData> => {
    const response = await apiClient.post('/compare/table', {
      periodA: paramsA,
      periodB: paramsB,
    });
    return response.data;
  },

  /**
   * Получить доступные годы
   */
  getYears: async (): Promise<number[]> => {
    const response = await apiClient.get('/api/filters/years');
    return response.data;
  },

  /**
   * Получить доступные месяцы
   */
  getMonths: async (): Promise<number[]> => {
    const response = await apiClient.get('/api/filters/months');
    return response.data;
  },

  /**
   * Получить список регионов
   */
  getRegions: async (): Promise<string[]> => {
    const response = await apiClient.get('/api/filters/regions');
    return response.data;
  },

  /**
   * Получить список продуктов
   */
  getProducts: async (): Promise<string[]> => {
    const response = await apiClient.get('/api/filters/products');
    return response.data;
  },
};
