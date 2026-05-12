"use client";

import { useAuth } from "@/lib/auth";
import { FormEvent, useState } from "react";

export default function JoinModal() {
  const { joinCoupleAction, logout } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await joinCoupleAction(code.trim().toUpperCase());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Código inválido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900">
            Vinculá tu pareja
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Ingresá el código de invitación de tu pareja para compartir las
            finanzas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="inviteCode"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Código de invitación
            </label>
            <input
              id="inviteCode"
              type="text"
              required
              maxLength={8}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-center font-mono uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="ABCD1234"
              value={code}
              onChange={(e) => setCode(e.target.value)}
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
            {loading ? "Vinculando..." : "Vincular"}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={logout}
            className="text-sm text-slate-400 hover:text-red-600 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
