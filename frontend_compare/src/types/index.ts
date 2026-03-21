// ============================================
// Типы для сравнения периодов
// ============================================

export interface FilterParams {
  years?: number[];
  months?: number[];
  regions?: string[];
  products?: string[];
}

export interface PeriodFilters {
  years: number[];
  months: number[];
  regions: string[];
  products: string[];
}

// ============================================
// KPI типы
// ============================================

export interface KpiData {
  total_amount: number;
  contract_count: number;
  avg_contract_amount: number;
  total_quantity: number;
  avg_price_per_unit: number;
  customer_count: number;
}

export interface ChangeData {
  absolute: number;
  percent: number;
  trend: 'growth' | 'decline' | 'stable';
}

export interface ComparisonKpiResult {
  periodA: KpiData;
  periodB: KpiData;
  changes: {
    total_amount: ChangeData;
    contract_count: ChangeData;
    avg_contract_amount: ChangeData;
    total_quantity: ChangeData;
    avg_price_per_unit: ChangeData;
    customer_count?: ChangeData;  // Опционально, т.к. может отсутствовать
  };
}

// ============================================
// Типы для диаграмм
// ============================================

export interface DynamicsData {
  labels: string[];
  periodA: {
    amounts: number[];
    quantities: number[];
  };
  periodB: {
    amounts: number[];
    quantities: number[];
  };
}

export interface RegionsData {
  labels: string[];
  periodA: {
    amounts: number[];
    counts: number[];
  };
  periodB: {
    amounts: number[];
    counts: number[];
  };
}

export interface SupplierPoint {
  supplier: string;
  periodA: number;
  periodB: number;
}

export interface SuppliersScatterData {
  points: SupplierPoint[];
}

export interface ComparisonTableRow {
  region: string;
  periodA_amount: number;
  periodB_amount: number;
  periodA_count: number;
  periodB_count: number;
  absoluteDiff: number;
  percentDiff: number;
  trend: 'growth' | 'decline' | 'stable';
}

export interface ComparisonTableData {
  rows: ComparisonTableRow[];
}

// ============================================
// Типы для store
// ============================================

export interface ComparisonState {
  periodA: PeriodFilters;
  periodB: PeriodFilters;
  
  availableYears: number[];
  availableMonths: number[];
  availableRegions: string[];
  availableProducts: string[];
  
  setPeriodAFilters: (filters: Partial<PeriodFilters>) => void;
  setPeriodBFilters: (filters: Partial<PeriodFilters>) => void;
  
  togglePeriodAYear: (year: number) => void;
  togglePeriodBYear: (year: number) => void;
  togglePeriodARegion: (region: string) => void;
  togglePeriodBRegion: (region: string) => void;
  togglePeriodAProduct: (product: string) => void;
  togglePeriodBProduct: (product: string) => void;
  
  swapPeriods: () => void;
  resetPeriodA: () => void;
  resetPeriodB: () => void;
  resetAll: () => void;
  
  setAvailableYears: (years: number[]) => void;
  setAvailableMonths: (months: number[]) => void;
  setAvailableRegions: (regions: string[]) => void;
  setAvailableProducts: (products: string[]) => void;
}

// ============================================
// Типы для форматирования
// ============================================

export interface FormattedValue {
  value: string;
  suffix?: string;
}
