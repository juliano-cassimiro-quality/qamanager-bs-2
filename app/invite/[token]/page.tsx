"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccounts } from "@/hooks/useAccounts";
import { reserveAccount, releaseAccount } from "@/lib/firestore";
import { consumeInvite, InviteVerificationResult, verifyInvite } from "@/lib/invites";

export default function InvitePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const { accounts, isLoading } = useAccounts();
  const [verification, setVerification] = useState<InviteVerificationResult | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function runVerification() {
      if (!params?.token) return;
      const result = await verifyInvite(params.token);
      if (!result.valid) {
        setError(result.message ?? "Convite inválido ou expirado");
        setTimeout(() => router.replace("/"), 4000);
      }
      setVerification(result);
    }
    runVerification();
  }, [params?.token, router]);

  const freeAccounts = useMemo(
    () => accounts?.filter((account) => account.status === "free") ?? [],
    [accounts]
  );

  const handleReserve = async (accountId: string) => {
    if (!verification?.valid || !verification.inviteeEmail) return;
    setActionLoading(accountId);
    try {
      await reserveAccount(accountId, {
        uid: verification.inviteeEmail,
        displayName: verification.inviteeEmail,
        email: verification.inviteeEmail,
      });
      await consumeInvite(params.token);
    } catch (err) {
      console.error(err);
      setError("Não foi possível reservar a conta.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRelease = async (accountId: string) => {
    if (!verification?.valid || !verification.inviteeEmail) return;
    setActionLoading(accountId);
    try {
      await releaseAccount(accountId, {
        uid: verification.inviteeEmail,
        displayName: verification.inviteeEmail,
        email: verification.inviteeEmail,
      });
    } catch (err) {
      console.error(err);
      setError("Não foi possível liberar a conta.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-4 py-10">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold text-slate-900">Contas disponíveis</h1>
        <p className="text-sm text-slate-500">
          Utilize o convite compartilhado para reservar uma conta livre.
        </p>
        {verification?.label && (
          <p className="text-xs text-slate-400">Convite destinado a: {verification.label}</p>
        )}
      </header>

      {error && (
        <div className="rounded-md bg-rose-100 p-4 text-sm text-rose-700">{error}</div>
      )}

      <section className="grid gap-4">
        {isLoading && <p className="text-center text-sm text-slate-500">Carregando contas...</p>}
        {!isLoading && freeAccounts.length === 0 && (
          <p className="text-center text-sm text-slate-500">
            Nenhuma conta livre no momento. Tente novamente mais tarde.
          </p>
        )}
        {freeAccounts.map((account) => (
          <article key={account.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <header className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{account.username}</h2>
                <p className="text-xs text-slate-500">{account.email}</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">
                Livre
              </span>
            </header>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => handleReserve(account.id)}
                disabled={actionLoading === account.id}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-70"
              >
                {actionLoading === account.id ? "Reservando..." : "Reservar"}
              </button>
              <button
                onClick={() => handleRelease(account.id)}
                disabled={actionLoading === account.id}
                className="rounded-lg border border-primary-600 px-4 py-2 text-sm font-medium text-primary-600 disabled:opacity-70"
              >
                {actionLoading === account.id ? "Processando..." : "Liberar"}
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
