import type {
  AuthResponse,
  BalanceResponse,
  CoupleHistory,
  CoupleMember,
  Expense,
  ExpenseUpdate,
  HealthResponse,
  Income,
  SplitSettings,
  User,
} from "@/types";

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(
  path: string,
  token: string | null,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(path, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.detail ?? `Error ${res.status}`);
  }

  return res.json();
}

// --- Auth ---

export function registerUser(
  email: string,
  password: string,
  displayName: string,
): Promise<AuthResponse> {
  return request<AuthResponse>("/api/auth/register", null, {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      display_name: displayName,
    }),
  });
}

export function loginUser(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return request<AuthResponse>("/api/auth/login", null, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getMe(token: string): Promise<User> {
  return request<User>("/api/auth/me", token);
}

export function joinCouple(
  token: string,
  inviteCode: string,
): Promise<{ message: string }> {
  return request<{ message: string }>("/api/auth/join", token, {
    method: "POST",
    body: JSON.stringify({ invite_code: inviteCode }),
  });
}

export function getCoupleMembers(token: string): Promise<CoupleMember[]> {
  return request<CoupleMember[]>("/api/auth/couple/members", token);
}

// --- Couple Lifecycle ---

export function leaveCouple(token: string): Promise<User> {
  return request<User>("/api/couple/leave", token, { method: "POST" });
}

export function getCoupleHistory(token: string): Promise<CoupleHistory[]> {
  return request<CoupleHistory[]>("/api/couples/history", token);
}

export function getCoupleExpenses(
  token: string,
  coupleId: number,
  year?: number,
  month?: number,
): Promise<Expense[]> {
  let path = `/api/couples/${coupleId}/expenses`;
  const params = new URLSearchParams();
  if (year) params.set("year", year.toString());
  if (month) params.set("month", month.toString());
  if (params.toString()) path += `?${params.toString()}`;
  return request<Expense[]>(path, token);
}

// --- Health ---

export function getHealth(): Promise<HealthResponse> {
  return request<HealthResponse>("/api/health", null);
}

// --- Expenses ---

export function getExpenses(
  token: string,
  year: number,
  month: number,
  coupleId?: number | null,
): Promise<Expense[]> {
  let path = `/api/expenses?year=${year}&month=${month}`;
  if (coupleId) path += `&couple_id=${coupleId}`;
  return request<Expense[]>(path, token);
}

export function updateExpense(
  token: string,
  id: number,
  data: ExpenseUpdate,
): Promise<Expense> {
  return request<Expense>(`/api/expenses/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteExpense(
  token: string,
  id: number,
): Promise<{ deleted: boolean; id: number }> {
  return request<{ deleted: boolean; id: number }>(
    `/api/expenses/${id}`,
    token,
    { method: "DELETE" },
  );
}

// --- Incomes ---

export function getIncomes(
  token: string,
  year: number,
  month: number,
): Promise<Income[]> {
  return request<Income[]>(
    `/api/incomes?year=${year}&month=${month}`,
    token,
  );
}

export function updateIncome(
  token: string,
  id: number,
  data: ExpenseUpdate,
): Promise<Income> {
  return request<Income>(`/api/incomes/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteIncome(
  token: string,
  id: number,
): Promise<{ deleted: boolean; id: number }> {
  return request<{ deleted: boolean; id: number }>(
    `/api/incomes/${id}`,
    token,
    { method: "DELETE" },
  );
}

// --- Balance ---

export function getBalance(
  token: string,
  year: number,
  month: number,
  coupleId?: number | null,
): Promise<BalanceResponse> {
  let path = `/api/balance?year=${year}&month=${month}`;
  if (coupleId) path += `&couple_id=${coupleId}`;
  return request<BalanceResponse>(path, token);
}

// --- Split ---

export function getSplit(token: string): Promise<SplitSettings> {
  return request<SplitSettings>("/api/settings/split", token);
}

export function updateSplit(
  token: string,
  splitAru: number,
  splitMon: number,
): Promise<SplitSettings> {
  return request<SplitSettings>("/api/settings/split", token, {
    method: "PUT",
    body: JSON.stringify({ split_aru: splitAru, split_mon: splitMon }),
  });
}
