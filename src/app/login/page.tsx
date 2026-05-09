"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  if (isAuthenticated) {
    router.replace("/balance");
    return null;
  }

  function handleSubmit(e: FormEvent) {
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
      login(trimmed);
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

        <form
          onSubmit={handleSubmit}
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
            Ingresar
          </button>

          <p className="text-xs text-slate-400 text-center">
            Escribí{" "}
            <code className="bg-slate-100 px-1 py-0.5 rounded">/token</code> al
            bot de Telegram para obtener tu token.
          </p>
        </form>
      </div>
    </div>
  );
}
