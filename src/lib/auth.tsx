"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getMe,
  loginUser,
  registerUser,
  getCoupleMembers,
} from "./api";
import type { CoupleMember, User } from "@/types";

const TOKEN_KEY = "finduo_token";

interface AuthContextValue {
  token: string | null;
  user: User | null;
  displayName: string | null;
  inviteCode: string | null;
  isAuthenticated: boolean;
  hasCouple: boolean;
  coupleMembers: CoupleMember[];
  memberNames: [string, string];
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [coupleMembers, setCoupleMembers] = useState<CoupleMember[]>([]);

  const fetchUser = useCallback(async (t: string) => {
    try {
      const u = await getMe(t);
      setUser(u);
      if (u.couple_id) {
        try {
          const members = await getCoupleMembers(t);
          setCoupleMembers(members);
        } catch {
          setCoupleMembers([]);
        }
      } else {
        setCoupleMembers([]);
      }
    } catch {
      setUser(null);
      setCoupleMembers([]);
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

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setCoupleMembers([]);
  }, []);

  const refreshUser = useCallback(async () => {
    if (token) await fetchUser(token);
  }, [token, fetchUser]);

  const inviteCode = user?.invite_code ?? null;

  const memberNames: [string, string] = useMemo(() => {
    if (coupleMembers.length >= 2) {
      return [coupleMembers[0].display_name, coupleMembers[1].display_name];
    }
    if (user) return [user.display_name, "Pareja"];
    return ["", ""];
  }, [coupleMembers, user]);

  const value = useMemo(
    () => ({
      token,
      user,
      displayName: user?.display_name ?? null,
      inviteCode,
      isAuthenticated: !!token && !!user,
      hasCouple: !!user?.couple_id,
      coupleMembers,
      memberNames,
      login,
      register,
      logout,
      refreshUser,
    }),
    [
      token,
      user,
      inviteCode,
      coupleMembers,
      memberNames,
      login,
      register,
      logout,
      refreshUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
