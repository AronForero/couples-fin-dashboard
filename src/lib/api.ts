import type {
  BalanceResponse,
  Expense,
  HealthResponse,
  SplitSettings,
} from "@/types";

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) throw new Error("NEXT_PUBLIC_API_URL is not set");
  return url;
}

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

  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.detail ?? `Error ${res.status}`);
  }

  return res.json();
}

export function getHealth(): Promise<HealthResponse> {
  return request<HealthResponse>("/api/health", null);
}

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
