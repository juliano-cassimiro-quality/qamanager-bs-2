"use client";

import { User } from "firebase/auth";
import clsx from "clsx";
import type { UserRole } from "@/lib/types";

interface DashboardHeaderProps {
  user: User | null;
  totalAccounts: number;
  busyAccounts: number;
  statusFilter: "all" | "free" | "busy";
  onFilterChange: (filter: "all" | "free" | "busy") => void;
  onSignOut: () => Promise<void>;
  role?: UserRole | null;
}

const filterOptions: { label: string; value: "all" | "free" | "busy" }[] = [
  { label: "Todas", value: "all" },
  { label: "Livres", value: "free" },
  { label: "Em uso", value: "busy" },
];

export function DashboardHeader({
  user,
  totalAccounts,
  busyAccounts,
  statusFilter,
  onFilterChange,
  onSignOut,
  role,
}: DashboardHeaderProps) {
  const freeAccounts = totalAccounts - busyAccounts;
  const roleLabel = role === "admin" ? "Administrador" : "Colaborador";
  return (
    <header className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard de contas</h1>
        <div className="space-y-1">
          <p className="text-sm text-slate-500">
            Monitoramento em tempo real das licenças do BrowserStack. Olá, {user?.displayName ?? user?.email ?? "QA"}!
          </p>
          {role && (
            <span className="inline-flex items-center gap-2 text-xs text-slate-500">
              <span className="h-2 w-2 rounded-full bg-primary-500" aria-hidden />
              {roleLabel}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
            Total: {totalAccounts}
          </span>
          <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-700">
            Livres: {freeAccounts}
          </span>
          <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-700">
            Em uso: {busyAccounts}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex rounded-full border border-slate-200 bg-slate-100 p-1 text-xs font-medium text-slate-600">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onFilterChange(option.value)}
              className={clsx(
                "rounded-full px-4 py-1 transition",
                option.value === statusFilter
                  ? "bg-white text-primary-600 shadow"
                  : "text-slate-500 hover:text-primary-600"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <button
          onClick={onSignOut}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-primary-200 hover:text-primary-600"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
