"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { User } from "firebase/auth";

import type { Account } from "@/lib/types";
import { reserveAccount, releaseAccount } from "@/lib/firestore";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useToast } from "@/components/providers/ToastProvider";

interface QuickReservationCardProps {
  accounts: Account[] | undefined;
  isLoading: boolean;
  user: User | null;
}

export function QuickReservationCard({ accounts, isLoading, user }: QuickReservationCardProps) {
  const [isReserving, setIsReserving] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const { showToast } = useToast();

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
      showToast({
        title: "Faça login",
        description: "Entre com sua conta corporativa para reservar uma credencial.",
        intent: "warning",
      });
      return;
    }
    if (!accounts || isLoading) {
      return;
    }
    if (activeAccount) {
      showToast({
        title: "Conta já reservada",
        description: "Libere a conta atual antes de pegar outra.",
        intent: "info",
      });
      return;
    }

    const freeAccounts = accounts.filter((account) => account.status === "free");
    if (freeAccounts.length === 0) {
      showToast({
        title: "Sem contas disponíveis",
        description: "Todas as contas estão em uso. Tente novamente em instantes.",
        intent: "info",
      });
      return;
    }

    const selectedAccount = freeAccounts[Math.floor(Math.random() * freeAccounts.length)];

    setIsReserving(true);
    try {
      await reserveAccount(selectedAccount.id, {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
      });
      const now = format(new Date(), "HH:mm", { locale: ptBR });
      showToast({
        title: `Conta ${selectedAccount.username} reservada`,
        description: `Retirada registrada às ${now}. Senha: ${selectedAccount.password ?? "-"}.`,
        intent: "success",
      });
    } catch (err) {
      console.error(err);
      showToast({
        title: "Erro ao reservar conta",
        description: (err as Error).message ?? "Tente novamente em instantes.",
        intent: "error",
      });
    } finally {
      setIsReserving(false);
    }
  };

  const handleRelease = async () => {
    if (!user || !activeAccount) {
      return;
    }
    setIsReleasing(true);
    try {
      await releaseAccount(activeAccount.id, {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
      });
      const now = format(new Date(), "HH:mm", { locale: ptBR });
      showToast({
        title: `Conta ${activeAccount.username} devolvida`,
        description: `Devolução registrada às ${now}.`,
        intent: "success",
      });
    } catch (err) {
      console.error(err);
      showToast({
        title: "Erro ao liberar conta",
        description: (err as Error).message ?? "Tente novamente em instantes.",
        intent: "error",
      });
    } finally {
      setIsReleasing(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">Uso rápido</h2>
        <p className="text-sm text-slate-500">
          Clique em &quot;Pegar conta&quot; para receber automaticamente uma credencial livre. O horário de retirada e devolução é salvo
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
            Nenhuma conta reservada. Clique abaixo para pegar a pr&oacute;xima disponível.
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
      </div>
    </section>
  );
}
