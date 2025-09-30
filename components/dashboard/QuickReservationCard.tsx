"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { User } from "firebase/auth";

import type { Account } from "@/lib/types";
import { reserveAccount, releaseAccount } from "@/lib/firestore";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

interface QuickReservationCardProps {
  accounts: Account[] | undefined;
  isLoading: boolean;
  user: User | null;
}

export function QuickReservationCard({ accounts, isLoading, user }: QuickReservationCardProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReserving, setIsReserving] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);

  const activeAccount = useMemo(() => {
    if (!accounts || !user) return undefined;
    return accounts.find((account) => account.status === "busy" && account.ownerId === user.uid);
  }, [accounts, user]);

  const formattedPickup = useMemo(() => {
    if (!activeAccount?.lastUsedAt) return "-";
    try {
      return format(parseISO(activeAccount.lastUsedAt), "HH:mm", { locale: ptBR });
    } catch (err) {
      return "-";
    }
  }, [activeAccount?.lastUsedAt]);

  const handleReserve = async () => {
    if (!user) {
      setError("Faça login para reservar uma conta.");
      return;
    }
    if (!accounts || isLoading) {
      return;
    }
    if (activeAccount) {
      setError("Você já está com uma conta reservada. Libere antes de pegar outra.");
      return;
    }

    const freeAccounts = accounts.filter((account) => account.status === "free");
    if (freeAccounts.length === 0) {
      setError("Nenhuma conta livre no momento.");
      return;
    }

    const selectedAccount = freeAccounts[Math.floor(Math.random() * freeAccounts.length)];

    setIsReserving(true);
    setError(null);
    try {
      await reserveAccount(selectedAccount.id, {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
      });
      const now = format(new Date(), "HH:mm", { locale: ptBR });
      setFeedback(`Conta ${selectedAccount.username} reservada às ${now}. Senha: ${selectedAccount.password ?? "-"}.`);
    } catch (err) {
      console.error(err);
      setError((err as Error).message ?? "Erro ao reservar conta.");
    } finally {
      setIsReserving(false);
    }
  };

  const handleRelease = async () => {
    if (!user || !activeAccount) {
      return;
    }
    setIsReleasing(true);
    setError(null);
    try {
      await releaseAccount(activeAccount.id, {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
      });
      const now = format(new Date(), "HH:mm", { locale: ptBR });
      setFeedback(`Conta ${activeAccount.username} liberada às ${now}.`);
    } catch (err) {
      console.error(err);
      setError((err as Error).message ?? "Erro ao liberar conta.");
    } finally {
      setIsReleasing(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">Uso rápido</h2>
        <p className="text-sm text-slate-500">
          Clique em "Pegar conta" para receber automaticamente uma credencial livre. O horário de retirada e devolução é salvo
          no histórico.
        </p>
      </header>

      <div className="mt-4 space-y-4">
        {activeAccount ? (
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            <p>
              <span className="font-semibold text-slate-700">Conta em uso:</span> {activeAccount.username}
            </p>
            <p className="font-mono text-slate-700">{activeAccount.email}</p>
            {activeAccount.password && (
              <p className="font-mono text-primary-600">Senha: {activeAccount.password}</p>
            )}
            <p>
              Pegou às <span className="font-medium">{formattedPickup}</span>
            </p>
          </div>
        ) : (
          <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
            Nenhuma conta reservada. Clique abaixo para pegar a próxima disponível.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <PrimaryButton onClick={handleReserve} disabled={isReserving || isLoading}>
            {isReserving ? "Buscando..." : "Pegar conta"}
          </PrimaryButton>
          <button
            onClick={handleRelease}
            disabled={!activeAccount || isReleasing}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:border-primary-200 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isReleasing ? "Liberando..." : "Devolver conta"}
          </button>
        </div>

        {feedback && <p className="text-xs text-emerald-700">{feedback}</p>}
        {error && <p className="text-xs text-rose-600">{error}</p>}
      </div>
    </section>
  );
}
