"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/lib/auth";
import { joinCouple } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";

export default function InvitePage() {
  const { token, user, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const leftCouple = searchParams.get("left") === "true";
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const inviteCode = user?.invite_code ?? null;

  async function handleCopy() {
    if (!inviteCode) return;
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleJoin(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError("");
    setLoading(true);
    try {
      await joinCouple(token, code.trim().toUpperCase());
      await refreshUser();
      router.push("/balance");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Código inválido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-8">
      {leftCouple && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
          Saliste de tu pareja anterior. Podés crear una nueva o unirte a una
          existente.
        </div>
      )}

      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">Invitar pareja</h1>
        <p className="text-sm text-slate-500 mt-1">
          Compartí tu código para gestionar las finanzas juntos
        </p>
      </div>

      {/* Your invite code */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h2 className="text-sm font-medium text-slate-700">
          Tu código de invitación
        </h2>
        {inviteCode ? (
          <>
            <div className="flex items-center gap-3">
              <code className="flex-1 text-center text-lg font-mono tracking-widest bg-slate-50 rounded-lg px-4 py-3 text-slate-900 border border-slate-200">
                {inviteCode}
              </code>
              <button
                onClick={handleCopy}
                className="px-4 py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap"
              >
                {copied ? "¡Copiado!" : "Copiar"}
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Compartí este código con tu pareja para que se una.
            </p>
          </>
        ) : (
          <p className="text-sm text-slate-400">No tenés un código de invitación.</p>
        )}
      </div>

      {/* Join with a code */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h2 className="text-sm font-medium text-slate-700">
          ¿Tenés un código?
        </h2>
        <form onSubmit={handleJoin} className="space-y-3">
          <input
            type="text"
            required
            maxLength={8}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-center font-mono uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="ABCD1234"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
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
            {loading ? "Uniéndose..." : "Unirme"}
          </button>
        </form>
      </div>
    </div>
  );
}
