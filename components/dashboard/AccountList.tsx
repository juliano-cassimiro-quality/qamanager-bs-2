"use client";

import { useState } from "react";
import { format, formatRelative, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { reserveAccount, releaseAccount, fetchAccountHistory } from "@/lib/firestore";
import type { Account, AccountHistoryEntry } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

interface AccountListProps {
  accounts: Account[];
  isLoading: boolean;
  error: Error | null;
}

export function AccountList({ accounts, isLoading, error }: AccountListProps) {
  const { user } = useAuth();
  const [history, setHistory] = useState<Record<string, AccountHistoryEntry[]>>({});
  const [loadingHistory, setLoadingHistory] = useState<Record<string, boolean>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, "reserve" | "release" | null>>({});

  const handleReserve = async (account: Account) => {
    if (!user) return;
    setActionLoading((prev) => ({ ...prev, [account.id]: "reserve" }));
    try {
      await reserveAccount(account.id, {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [account.id]: null }));
    }
  };

  const handleRelease = async (account: Account) => {
    if (!user) return;
    setActionLoading((prev) => ({ ...prev, [account.id]: "release" }));
    try {
      await releaseAccount(account.id, {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [account.id]: null }));
    }
  };

  const loadHistory = async (accountId: string) => {
    setLoadingHistory((prev) => ({ ...prev, [accountId]: true }));
    try {
      const data = await fetchAccountHistory(accountId);
      setHistory((prev) => ({ ...prev, [accountId]: data }));
    } finally {
      setLoadingHistory((prev) => ({ ...prev, [accountId]: false }));
    }
  };

  if (isLoading) {
    return <p className="text-sm text-slate-500">Carregando contas...</p>;
  }

  if (error) {
    return <p className="text-sm text-rose-600">Erro ao carregar contas: {error.message}</p>;
  }

  if (!accounts.length) {
    return <p className="text-sm text-slate-500">Nenhuma conta encontrada.</p>;
  }

  return (
    <div className="grid gap-4">
      {accounts.map((account) => {
        const isBusy = account.status === "busy";
        const isOwner = account.ownerId && user?.uid === account.ownerId;
        const currentHistory = history[account.id] ?? [];
        const historyLoaded = !!history[account.id];

        return (
          <article key={account.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{account.username}</h2>
                <p className="text-xs text-slate-500">{account.email}</p>
              </div>
              <span
                className={`rounded-full px-4 py-1 text-xs font-semibold ${
                  isBusy ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {isBusy ? "Em uso" : "Livre"}
              </span>
            </header>

            <dl className="mt-4 grid gap-3 text-sm text-slate-500 md:grid-cols-2 lg:grid-cols-5">
              <div>
                <dt className="font-medium text-slate-600">Responsável</dt>
                <dd>{account.owner ?? "-"}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-600">Último uso</dt>
                <dd>
                  {account.lastUsedAt
                    ? formatRelative(parseISO(account.lastUsedAt), new Date(), { locale: ptBR })
                    : "Nunca"}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-600">Última devolução</dt>
                <dd>
                  {account.lastReturnedAt
                    ? formatRelative(parseISO(account.lastReturnedAt), new Date(), { locale: ptBR })
                    : "-"}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-600">Senha</dt>
                <dd className="font-mono text-slate-700">
                  {account.password
                    ? isBusy && !isOwner
                      ? "Em uso"
                      : account.password
                    : "-"}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-600">Ações</dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  <PrimaryButton
                    onClick={() => handleReserve(account)}
                    disabled={isBusy && !isOwner}
                    className="bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300"
                  >
                    {actionLoading[account.id] === "reserve" ? "Reservando..." : "Reservar"}
                  </PrimaryButton>
                  <button
                    onClick={() => handleRelease(account)}
                    disabled={!isBusy || (isBusy && !isOwner)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:border-primary-200 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionLoading[account.id] === "release" ? "Liberando..." : "Liberar"}
                  </button>
                </dd>
              </div>
            </dl>

            <section className="mt-4 border-t border-slate-100 pt-4">
              <header className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">Histórico recente</h3>
                <button
                  className="text-xs font-medium text-primary-600 hover:text-primary-700"
                  onClick={() => loadHistory(account.id)}
                >
                  {loadingHistory[account.id] ? "Carregando..." : historyLoaded ? "Atualizar" : "Ver histórico"}
                </button>
              </header>
              <ul className="mt-3 space-y-2 text-xs text-slate-500">
                {loadingHistory[account.id] && <li>Carregando histórico...</li>}
                {!loadingHistory[account.id] && historyLoaded && currentHistory.length === 0 && (
                  <li>Nenhum registro encontrado.</li>
                )}
                {!loadingHistory[account.id] &&
                  currentHistory.map((entry) => (
                    <li key={entry.id} className="flex items-center justify-between">
                      <span className="font-medium text-slate-600">
                        {entry.action === "checkout" ? "Reservado" : "Liberado"} por {entry.userName ?? entry.email ?? entry.userId}
                      </span>
                      <span>
                        {entry.timestamp
                          ? `${format(new Date(entry.timestamp), "dd/MM/yyyy", { locale: ptBR })} às ${format(
                              new Date(entry.timestamp),
                              "HH:mm",
                              { locale: ptBR }
                            )}`
                          : "-"}
                      </span>
                    </li>
                  ))}
              </ul>
            </section>
          </article>
        );
      })}
    </div>
  );
}
