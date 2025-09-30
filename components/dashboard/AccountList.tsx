"use client";

import type { Account } from "@/lib/types";

interface AccountListProps {
  accounts: Account[];
  isLoading: boolean;
  error: Error | null;
}

export function AccountList({ accounts, isLoading, error }: AccountListProps) {
  if (isLoading) {
    return <p className="text-sm text-slate-500">Carregando contas...</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-rose-600">
        Erro ao carregar contas: {error.message}
      </p>
    );
  }

  if (!accounts.length) {
    return <p className="text-sm text-slate-500">Nenhuma conta encontrada.</p>;
  }

  return (
    <ul className="space-y-3">
      {accounts.map((account) => {
        const isBusy = account.status === "busy";
        return (
          <li
            key={account.id}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div>
              <p className="font-semibold text-slate-900">{account.username}</p>
              <p className="text-xs text-slate-500">{account.email}</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isBusy
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {isBusy ? "Em uso" : "Livre"}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
