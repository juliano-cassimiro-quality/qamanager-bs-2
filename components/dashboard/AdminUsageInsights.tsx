"use client";

import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { Account } from "@/lib/types";
import { useAccountLogs } from "@/hooks/useAccountLogs";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

interface AdminUsageInsightsProps {
  accounts: Account[];
}

export function AdminUsageInsights({ accounts }: AdminUsageInsightsProps) {
  const { logs, loading, error, refresh } = useAccountLogs(150);

  const accountNames = useMemo(() => {
    return accounts.reduce<Record<string, { username: string; email: string }>>((acc, account) => {
      acc[account.id] = { username: account.username, email: account.email };
      return acc;
    }, {});
  }, [accounts]);

  const ranking = useMemo(() => {
    const counts = new Map<string, { total: number; label: string }>();
    logs
      .filter((log) => log.action === "checkout")
      .forEach((log) => {
        const label = log.email ?? log.userName ?? log.userId;
        const key = label ?? log.userId;
        if (!key) return;
        const entry = counts.get(key) ?? { total: 0, label: label ?? log.userId };
        entry.total += 1;
        counts.set(key, entry);
      });
    return Array.from(counts.values()).sort((a, b) => b.total - a.total);
  }, [logs]);

  const historyByAccount = useMemo(() => {
    return logs.reduce<Record<string, typeof logs>>((acc, log) => {
      const current = acc[log.accountId] ?? [];
      acc[log.accountId] = [...current, log];
      return acc;
    }, {});
  }, [logs]);

  return (
    <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Visão administrativa</h2>
          <p className="text-sm text-slate-500">
            Acompanhe o uso das contas e identifique os usuários mais ativos.
          </p>
        </div>
        <PrimaryButton type="button" onClick={refresh} disabled={loading}>
          {loading ? "Atualizando..." : "Atualizar"}
        </PrimaryButton>
      </header>

      {error && <p className="text-sm text-rose-600">Erro ao carregar dados de uso.</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Ranking de usuários</h3>
          {ranking.length === 0 ? (
            <p className="mt-3 text-xs text-slate-500">
              {loading ? "Carregando ranking..." : "Nenhum uso registrado."}
            </p>
          ) : (
            <ol className="mt-3 space-y-2 text-sm text-slate-600">
              {ranking.map((entry, index) => (
                <li
                  key={entry.label}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                >
                  <span>
                    <span className="mr-2 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700">
                      #{index + 1}
                    </span>
                    {entry.label}
                  </span>
                  <span className="text-xs text-slate-500">{entry.total} reservas</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-700">Histórico geral</h3>
          <div className="mt-3 max-h-72 space-y-2 overflow-auto pr-2 text-xs text-slate-600">
            {loading && <p>Carregando histórico...</p>}
            {!loading && logs.length === 0 && <p>Nenhum evento registrado.</p>}
            {!loading &&
              logs.map((log) => {
                const timestamp = log.timestamp ? parseISO(log.timestamp) : null;
                const accountInfo = accountNames[log.accountId];
                const formattedDate = timestamp
                  ? `${format(timestamp, "dd/MM/yyyy", { locale: ptBR })} às ${format(timestamp, "HH:mm", { locale: ptBR })}`
                  : "-";
                return (
                  <div
                    key={`${log.id}`}
                    className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                  >
                    <p className="font-medium text-slate-700">
                      {log.action === "checkout" ? "Reserva" : "Devolução"} – {accountInfo?.username ?? log.accountId}
                    </p>
                    <p>
                      Usuário: {log.email ?? log.userName ?? log.userId}
                    </p>
                    <p>
                      Conta: {accountInfo?.email ?? "-"}
                    </p>
                    <p className="text-slate-500">{formattedDate}</p>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700">Histórico por conta</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {accounts.map((account) => {
            const accountHistory = historyByAccount[account.id] ?? [];
            return (
              <div key={account.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-600">
                <p className="font-semibold text-slate-700">{account.username}</p>
                <p className="font-mono text-slate-500">{account.email}</p>
                {accountHistory.length === 0 ? (
                  <p className="mt-2 text-slate-500">Sem registros recentes.</p>
                ) : (
                  <ul className="mt-2 space-y-1">
                    {accountHistory.slice(0, 5).map((entry) => {
                      const timestamp = entry.timestamp ? parseISO(entry.timestamp) : null;
                      const formatted = timestamp
                        ? `${format(timestamp, "dd/MM", { locale: ptBR })} ${format(timestamp, "HH:mm", { locale: ptBR })}`
                        : "-";
                      return (
                        <li key={entry.id} className="flex justify-between gap-2">
                          <span className="font-medium text-slate-700">
                            {entry.action === "checkout" ? "Reservado" : "Liberado"} por {entry.email ?? entry.userName ?? entry.userId}
                          </span>
                          <span className="text-slate-500">{formatted}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
