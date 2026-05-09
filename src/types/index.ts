export interface Expense {
  id: number;
  fecha: string;
  quien_pago: string;
  subcategoria: string | null;
  categoria: string | null;
  concepto: string;
  valor: number;
  compartida: string;
  valor_a_pagar: number | null;
  observacion: string | null;
  created_at: string;
}

export interface CategoryBreakdown {
  [categoria: string]: number;
}

export interface PersonalBalance {
  viewer: string;
  viewer_gasto: number;
  gastos_totales: number;
  por_categoria: CategoryBreakdown;
}

export interface SharedBalance {
  aron_gasto: number;
  mon_gasto: number;
  gastos_totales: number;
  aron_debe: number;
  mon_debe: number;
  balance_key: string;
  deuda_total: number;
  por_categoria: CategoryBreakdown;
}

export interface BalanceResponse {
  mes: string;
  personal: PersonalBalance;
  compartido: SharedBalance;
}

export interface SplitSettings {
  split_aru: number;
  split_mon: number;
}

export interface HealthResponse {
  status: string;
}
