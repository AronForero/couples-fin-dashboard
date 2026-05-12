import type {
  AuthResponse,
  BalanceResponse,
  Expense,
  ExpenseUpdate,
  HealthResponse,
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

function formBody(data: Record<string, string>): string {
  return Object.entries(data)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
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
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formBody({ username: email, password }),
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

// --- Health ---

export function getHealth(): Promise<HealthResponse> {
  return request<HealthResponse>("/api/health", null);
}

// --- Expenses ---

export function getExpenses(
  token: string,
  year: number,
  month: number,
): Promise<Expense[]> {
  return request<Expense[]>(
    `/api/expenses?year=${year}&month=${month}`,
    token,
  );
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

// --- Balance ---

export function getBalance(
  token: string,
  year: number,
  month: number,
): Promise<BalanceResponse> {
  return request<BalanceResponse>(
    `/api/balance?year=${year}&month=${month}`,
    token,
  );
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
