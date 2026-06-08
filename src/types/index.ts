export type UserStatus = "trial" | "active" | "suspended";

export interface User {
  id: number;
  email: string;
  display_name: string;
  couple_id: number | null;
  invite_code: string | null;
  chat_id: number | null;
  status: UserStatus;
  status_updated_at: string | null;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

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
  couple_id: number;
  created_at: string;
}

export interface Income {
  id: number;
  fecha: string;
  concepto: string;
  valor: number;
  user_id: number;
  created_at: string;
}

export type TransactionType = "expense" | "income";

export interface Transaction {
  id: number;
  fecha: string;
  concepto: string;
  valor: number;
  type: TransactionType;
  created_at: string;
  // expense-only fields (optional)
  quien_pago?: string;
  subcategoria?: string | null;
  categoria?: string | null;
  compartida?: string;
  valor_a_pagar?: number | null;
  couple_id?: number;
  // income-only fields
  user_id?: number;
}

export type TransactionFilter = "all" | "expenses" | "incomes";

export interface ExpenseUpdate {
  fecha?: string;
  quien_pago?: string;
  subcategoria?: string;
  categoria?: string;
  concepto?: string;
  valor?: number;
  compartida?: string;
}

export interface CategoryBreakdown {
  [categoria: string]: number;
}

export interface PersonalBalance {
  viewer_id: number;
  viewer_name: string;
  viewer_gasto: number;
  gastos_totales: number;
  por_categoria: CategoryBreakdown;
}

export interface SharedBalance {
  gastos: number[];
  deudas: number[];
  gastos_totales: number;
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

export interface CoupleMember {
  id: number;
  display_name: string;
  email: string;
}

export interface CoupleHistory {
  couple_id: number;
  partner_name: string;
  joined_at: string;
  left_at: string | null;
  total_spent: number;
  is_active: boolean;
}

export interface HealthResponse {
  status: string;
}
