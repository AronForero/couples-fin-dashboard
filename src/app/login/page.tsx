"use client";

import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const { login, loginWithToken, isAuthenticated } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    router.replace("/balance");
    return null;
  }

  async function handleEmailLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/balance");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  function handleTokenSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const trimmed = token.trim();
    if (!trimmed) {
      setError("Pega tu token de acceso");
      return;
    }
    try {
      const payload = JSON.parse(atob(trimmed.split(".")[1]));
      if (!payload.sub) throw new Error();
      loginWithToken(trimmed);
      router.push("/balance");
    } catch {
      setError("Token inválido. Usá el comando /token en Telegram.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">A&M Finanzas</h1>
          <p className="text-slate-500 mt-2">Dashboard de finanzas en pareja</p>
        </div>

        {!showToken ? (
          <form
            onSubmit={handleEmailLogin}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>

            <div className="flex items-center justify-between text-sm">
              <Link
                href="/register"
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Crear cuenta
              </Link>
              <button
                type="button"
                onClick={() => setShowToken(true)}
                className="text-slate-400 hover:text-slate-600"
              >
                Usar token de Telegram
              </button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={handleTokenSubmit}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4"
          >
            <div>
              <label
                htmlFor="token"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Token de acceso
              </label>
              <textarea
                id="token"
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="Pegá acá el token que recibiste por Telegram..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Ingresar con token
            </button>

            <div className="flex items-center justify-between text-sm">
              <Link
                href="/register"
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Crear cuenta
              </Link>
              <button
                type="button"
                onClick={() => {
                  setShowToken(false);
                  setError("");
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                Usar email y contraseña
              </button>
            </div>

            <p className="text-xs text-slate-400 text-center">
              Escribí{" "}
              <code className="bg-slate-100 px-1 py-0.5 rounded">/token</code>{" "}
              al bot de Telegram para obtener tu token.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
