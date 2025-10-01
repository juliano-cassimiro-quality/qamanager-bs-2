"use client";

import { useMemo } from "react";
import type { ReactNode } from "react";
import { differenceInCalendarDays, format, isToday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { Account } from "@/lib/types";
import { useAccountLogs } from "@/hooks/useAccountLogs";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { PieChart } from "@/components/dashboard/PieChart";

const ACCOUNT_PALETTE: string[] = [
  "#2563eb",
  "#7c3aed",
  "#f97316",
  "#14b8a6",
  "#ec4899",
  "#22c55e",
];

interface AdminUsageInsightsProps {
  accounts: Account[];
}

interface LegendItem {
  label: string;
  value: number;
  color: string;
  percentage: number;
}

function safeParseTimestamp(timestamp: string | null | undefined) {
  if (!timestamp) return null;
  try {
    return parseISO(timestamp);
  } catch (error) {
    console.warn("Timestamp inválido detectado", error);
    return null;
  }
}

function buildLegend(data: { label: string; value: number; color: string }[]) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) {
    return data.map((item) => ({ ...item, percentage: 0 }));
  }
  return data.map((item) => ({
    ...item,
    percentage: Math.round((item.value / total) * 100),
  }));
}

export function AdminUsageInsights({ accounts }: AdminUsageInsightsProps) {
  const { logs, loading, refresh } = useAccountLogs(150);

  const accountNames = useMemo(() => {
    return accounts.reduce<Record<string, { username: string; email: string }>>(
      (acc, account) => {
        acc[account.id] = { username: account.username, email: account.email };
        return acc;
      },
      {}
    );
  }, [accounts]);

  const reservationLogs = useMemo(
    () => logs.filter((log) => log.action === "checkout"),
    [logs]
  );

  const statusSummary = useMemo(() => {
    const busy = accounts.filter((account) => account.status === "busy").length;
    const total = accounts.length;
    const free = total - busy;
    const occupancy = total > 0 ? Math.round((busy / total) * 100) : 0;
    return { busy, free, total, occupancy };
  }, [accounts]);

  const summaryStats = useMemo(() => {
    const today = reservationLogs.filter((log) => {
      const parsed = safeParseTimestamp(log.timestamp);
      return parsed ? isToday(parsed) : false;
    }).length;

    const lastSevenDays = reservationLogs.filter((log) => {
      const parsed = safeParseTimestamp(log.timestamp);
      if (!parsed) return false;
      return differenceInCalendarDays(new Date(), parsed) <= 6;
    }).length;

    const uniqueUsers = new Set(
      reservationLogs
        .map((log) => log.userName ?? log.email ?? log.userId)
        .filter(Boolean)
    );

    return {
      today,
      lastSevenDays,
      uniqueUsers: uniqueUsers.size,
      totalReservations: reservationLogs.length,
    };
  }, [reservationLogs]);

  const userRanking = useMemo(() => {
    const counts = new Map<string, { total: number; label: string }>();
    reservationLogs.forEach((log) => {
      const label = log.userName ?? log.email ?? log.userId;
      const key = label ?? log.userId;
      if (!key) return;
      const entry = counts.get(key) ?? { total: 0, label: label ?? log.userId };
      entry.total += 1;
      counts.set(key, entry);
    });
    return Array.from(counts.values()).sort((a, b) => b.total - a.total);
  }, [reservationLogs]);

  const usageByAccount = useMemo(() => {
    const counter = new Map<
      string,
      { total: number; label: string; email?: string }
    >();
    reservationLogs.forEach((log) => {
      const accountId = log.accountId;
      const accountInfo = accountNames[accountId];
      const entry = counter.get(accountId) ?? {
        total: 0,
        label: accountInfo?.username ?? accountId,
        email: accountInfo?.email,
      };
      entry.total += 1;
      counter.set(accountId, entry);
    });
    return Array.from(counter.entries())
      .map(([accountId, data]) => ({ accountId, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [accountNames, reservationLogs]);

  const statusSegments = useMemo(
    () => [
      { label: "Em uso", value: statusSummary.busy, color: "#f59e0b" },
      { label: "Livres", value: statusSummary.free, color: "#10b981" },
    ],
    [statusSummary.busy, statusSummary.free]
  );

  const statusLegend = useMemo<LegendItem[]>(
    () => buildLegend(statusSegments),
    [statusSegments]
  );

  const accountSegments = useMemo(() => {
    if (!reservationLogs.length) {
      return [];
    }

    const topEntries = usageByAccount.slice(0, 5).map((entry, index) => ({
      label: entry.label,
      value: entry.total,
      color: ACCOUNT_PALETTE[index % ACCOUNT_PALETTE.length],
    }));

    const usedTotal = topEntries.reduce((sum, item) => sum + item.value, 0);
    const remainder = reservationLogs.length - usedTotal;
    if (remainder > 0) {
      topEntries.push({
        label: "Outros",
        value: remainder,
        color: "#cbd5f5",
      });
    }

    return topEntries;
  }, [reservationLogs.length, usageByAccount]);

  const accountLegend = useMemo<LegendItem[]>(
    () => buildLegend(accountSegments),
    [accountSegments]
  );

  const historyByAccount = useMemo(() => {
    return logs.reduce<Record<string, typeof logs>>((acc, log) => {
      const current = acc[log.accountId] ?? [];
      acc[log.accountId] = [...current, log];
      return acc;
    }, {});
  }, [logs]);

  return (
    <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">
            Visão administrativa
          </h2>
          <p className="text-sm text-slate-500">
            Acompanhe o pulso das reservas e identifique oportunidades de
            otimização.
          </p>
        </div>
        <PrimaryButton type="button" onClick={refresh} disabled={loading}>
          {loading ? "Atualizando..." : "Atualizar"}
        </PrimaryButton>
      </header>

      <div className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Reservas hoje"
            value={summaryStats.today}
            helper="Registros de checkout nas últimas 24h"
          />
          <StatCard
            title="Últimos 7 dias"
            value={summaryStats.lastSevenDays}
            helper="Reservas concluídas na última semana"
          />
          <StatCard
            title="Usuários ativos"
            value={summaryStats.uniqueUsers}
            helper="Pessoas diferentes que reservaram"
          />
          <StatCard
            title="Taxa de ocupação"
            value={`${statusSummary.occupancy}%`}
            helper={`${statusSummary.busy} de ${statusSummary.total} contas em uso`}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <InsightPanel
            title="Status das contas"
            description="Distribuição atual das licenças cadastradas."
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:flex-wrap lg:items-start">
              <div className="flex w-full justify-center lg:w-auto lg:justify-start">
                <PieChart
                  data={statusSegments}
                  centralLabel={{
                    title: "Total",
                    value: String(statusSummary.total),
                    subtitle: "contas",
                  }}
                />
              </div>
              <div className="w-full lg:min-w-[14rem] lg:flex-1">
                <LegendList
                  items={statusLegend}
                  emptyLabel="Nenhuma conta cadastrada."
                />
              </div>
            </div>
          </InsightPanel>

          <InsightPanel
            title="Contas mais acessadas"
            description="Como as reservas se distribuem entre as contas."
          >
            {reservationLogs.length === 0 ? (
              <EmptyState
                message={
                  loading
                    ? "Carregando dados de uso..."
                    : "Nenhuma reserva registrada."
                }
              />
            ) : (
              <div className="flex flex-col gap-6 lg:flex-row lg:flex-wrap lg:items-start">
                <div className="flex w-full justify-center lg:w-auto lg:justify-start">
                  <PieChart
                    data={accountSegments}
                    centralLabel={{
                      title: "Reservas",
                      value: String(summaryStats.totalReservations),
                      subtitle: "registradas",
                    }}
                  />
                </div>
                <div className="w-full lg:min-w-[14rem] lg:flex-1">
                  <LegendList
                    items={accountLegend}
                    emptyLabel="Nenhuma reserva registrada."
                  />
                </div>
              </div>
            )}
          </InsightPanel>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
          <InsightPanel
            title="Ranking de usuários"
            description="Usuários que mais reservaram contas."
          >
            {userRanking.length === 0 ? (
              <EmptyState
                message={
                  loading ? "Carregando ranking..." : "Nenhum uso registrado."
                }
              />
            ) : (
              <ol className="space-y-3 text-sm text-slate-600">
                {userRanking.slice(0, 8).map((entry, index) => (
                  <li
                    key={entry.label}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 shadow-inner"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                        #{index + 1}
                      </span>
                      {entry.label}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {entry.total} reservas
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </InsightPanel>

          <InsightPanel
            title="Visão cronológica"
            description="Eventos mais recentes registrados no sistema."
          >
            <div className="max-h-72 space-y-3 overflow-auto pr-2 text-xs text-slate-600">
              {loading && <p>Carregando histórico...</p>}
              {!loading && logs.length === 0 && (
                <p>Nenhum evento registrado.</p>
              )}
              {!loading &&
                logs.map((log) => {
                  const timestamp = safeParseTimestamp(log.timestamp);
                  const accountInfo = accountNames[log.accountId];
                  const formattedDate = timestamp
                    ? `${format(timestamp, "dd/MM/yyyy", {
                        locale: ptBR,
                      })} às ${format(timestamp, "HH:mm", { locale: ptBR })}`
                    : "-";
                  return (
                    <div
                      key={`${log.id}`}
                      className="rounded-lg border border-slate-100 bg-white/60 px-3 py-2 shadow-sm"
                    >
                      <p className="font-medium text-slate-700">
                        {log.action === "checkout" ? "Reserva" : "Devolução"} –{" "}
                        {accountInfo?.username ?? log.accountId}
                      </p>
                      <p>Usuário: {log.userName ?? log.email ?? log.userId}</p>
                      <p>Conta: {accountInfo?.email ?? "-"}</p>
                      <p className="text-slate-500">{formattedDate}</p>
                    </div>
                  );
                })}
            </div>
          </InsightPanel>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  title,
  value,
  helper,
}: {
  title: string;
  value: number | string;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-inner">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{helper}</p>
    </div>
  );
}

function InsightPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="space-y-1">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        <p className="text-xs text-slate-500">{description}</p>
      </header>
      {children}
    </section>
  );
}

function LegendList({
  items,
  emptyLabel,
}: {
  items: LegendItem[];
  emptyLabel: string;
}) {
  if (!items.length) {
    return <p className="text-xs text-slate-500">{emptyLabel}</p>;
  }

  return (
    <ul className="w-full space-y-2 text-xs text-slate-600">
      {items.map((item) => (
        <li
          key={item.label}
          className="flex items-center justify-between gap-4"
        >
          <span className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </span>
          <span className="font-medium text-slate-700">
            {item.value}
            <span className="ml-1 text-[0.65rem] font-normal text-slate-400">
              {item.percentage}%
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
      {message}
    </p>
  );
}
