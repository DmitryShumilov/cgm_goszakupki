export interface KpiData {
  total_amount: number;
  contract_count: number;
  avg_contract_amount: number;
  total_quantity: number;
  avg_price_per_unit: number;
  customer_count: number;
}

export interface DynamicsData {
  labels: string[];
  amounts: number[];
  quantities: number[];
}

export interface RegionsData {
  labels: string[];
  amounts: number[];
  counts: number[];
  total: number;
}

export interface SuppliersData {
  top5: {
    labels: string[];
    amounts: number[];
  };
  others: number;
  total: number;
}

export interface CategoriesData {
  labels: string[];
  amounts: number[];
}

export interface HeatmapData {
  products: string[];
  months: string[];
  matrix: Array<Record<string, number | string>>;
}

export interface FilterParams {
  years?: number[];
  months?: number[];
  regions?: string[];
  customers?: string[];
  suppliers?: string[];
  products?: string[];
}
