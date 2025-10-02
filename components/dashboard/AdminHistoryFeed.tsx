"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { Account } from "@/lib/types";
import { useAccountLogs } from "@/hooks/useAccountLogs";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { safeParseTimestamp } from "@/lib/date";

interface AdminHistoryFeedProps {
  accounts: Account[];
}

export function AdminHistoryFeed({ accounts }: AdminHistoryFeedProps) {
  const { logs, loading, error, refresh } = useAccountLogs(200);

  const accountIndex = useMemo(() => {
    return accounts.reduce<Record<string, { username: string; email: string }>>(
      (acc, account) => {
        acc[account.id] = {
          username: account.username,
          email: account.email,
        };
        return acc;
      },
      {}
    );
  }, [accounts]);

  const historySections = useMemo(() => {
    const groups = new Map<
      string,
      {
        label: string;
        items: {
          id: string;
          title: string;
          userLabel: string;
          accountEmail: string;
          timeLabel: string;
          timestampValue: number;
        }[];
      }
    >();

    logs.forEach((log) => {
      const parsed = safeParseTimestamp(log.timestamp);
      const groupKey = parsed ? format(parsed, "yyyy-MM-dd") : "sem-data";
      const groupLabel = parsed
        ? format(parsed, "dd 'de' MMMM", { locale: ptBR })
        : "Sem data";

      const accountInfo = accountIndex[log.accountId];
      const entry = groups.get(groupKey) ?? { label: groupLabel, items: [] };

      entry.items.push({
        id: log.id,
        title: `${log.action === "checkout" ? "Reserva" : "Devolução"} – ${
          accountInfo?.username ?? log.accountId
        }`,
        userLabel: log.userName ?? log.email ?? log.userId ?? "Usuário desconhecido",
        accountEmail: accountInfo?.email ?? "-",
        timeLabel: parsed
          ? format(parsed, "HH:mm", { locale: ptBR })
          : "-",
        timestampValue: parsed ? parsed.getTime() : 0,
      });

      groups.set(groupKey, entry);
    });

    return Array.from(groups.entries())
      .sort(([aKey], [bKey]) => (aKey < bKey ? 1 : -1))
      .map(([, value]) => ({
        label: value.label,
        items: value.items.sort((a, b) => b.timestampValue - a.timestampValue),
      }));
  }, [accountIndex, logs]);

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">Histórico geral</h2>
          <p className="text-sm text-slate-500">
            Acompanhe as últimas movimentações das contas em um só lugar.
          </p>
        </div>
        <PrimaryButton type="button" onClick={refresh} disabled={loading}>
          {loading ? "Atualizando..." : "Atualizar"}
        </PrimaryButton>
      </header>

      {error && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600">
          Erro ao carregar o histórico de uso.
        </p>
      )}

      {loading && logs.length === 0 ? (
        <p className="text-sm text-slate-500">Carregando histórico...</p>
      ) : null}

      {!loading && historySections.length === 0 ? (
        <p className="text-sm text-slate-500">Nenhum evento registrado até o momento.</p>
      ) : null}

      <div className="space-y-6">
        {historySections.map((section) => (
          <div key={section.label} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-500" aria-hidden />
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {section.label}
              </h3>
            </div>
            <ol className="space-y-3">
              {section.items.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 shadow-inner"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                    <span className="text-xs font-medium text-slate-500">
                      {item.timeLabel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Usuário: {item.userLabel}</p>
                  <p className="text-xs text-slate-500">Conta: {item.accountEmail}</p>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
