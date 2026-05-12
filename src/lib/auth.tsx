"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getMe, loginUser, registerUser, joinCouple } from "./api";
import type { User } from "@/types";

const TOKEN_KEY = "finbot_token";

interface AuthContextValue {
  token: string | null;
  user: User | null;
  displayName: string | null;
  isAuthenticated: boolean;
  hasCouple: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  loginWithToken: (token: string) => void;
  joinCoupleAction: (code: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeLegacySub(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.sub ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const fetchUser = useCallback(async (t: string) => {
    try {
      const u = await getMe(t);
      setUser(u);
    } catch {
      const legacy = decodeLegacySub(t);
      if (legacy) {
        setUser({
          id: 0,
          email: "",
          display_name: legacy,
          couple_id: null,
          chat_id: null,
          created_at: "",
        });
      } else {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      setToken(stored);
      fetchUser(stored);
    }
  }, [fetchUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await loginUser(email, password);
      localStorage.setItem(TOKEN_KEY, res.access_token);
      setToken(res.access_token);
      await fetchUser(res.access_token);
    },
    [fetchUser],
  );

  const register = useCallback(
    async (email: string, password: string, displayName: string) => {
      const res = await registerUser(email, password, displayName);
      localStorage.setItem(TOKEN_KEY, res.access_token);
      setToken(res.access_token);
      await fetchUser(res.access_token);
    },
    [fetchUser],
  );

  const loginWithToken = useCallback(
    (newToken: string) => {
      localStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);
      fetchUser(newToken);
    },
    [fetchUser],
  );

  const joinCoupleAction = useCallback(
    async (code: string) => {
      if (!token) throw new Error("No autenticado");
      await joinCouple(token, code);
      await fetchUser(token);
    },
    [token, fetchUser],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (token) await fetchUser(token);
  }, [token, fetchUser]);

  const value = useMemo(
    () => ({
      token,
      user,
      displayName: user?.display_name ?? null,
      isAuthenticated: !!token && !!user,
      hasCouple: !!user?.couple_id,
      login,
      register,
      loginWithToken,
      joinCoupleAction,
      logout,
      refreshUser,
    }),
    [token, user, login, register, loginWithToken, joinCoupleAction, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
