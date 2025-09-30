"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAccounts } from "@/hooks/useAccounts";
import { AccountList } from "@/components/dashboard/AccountList";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QuickReservationCard } from "@/components/dashboard/QuickReservationCard";
import { AccountRegistrationForm } from "@/components/dashboard/AccountRegistrationForm";
import { AdminUsageInsights } from "@/components/dashboard/AdminUsageInsights";

export default function DashboardPage() {
  const { user, loading, signOut, role } = useAuth();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<"all" | "free" | "busy">(
    "all"
  );
  const { accounts, isLoading, error } = useAccounts();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const hourPart = parts.find((part) => part.type === "hour")?.value ?? "00";
    const datePart = `${parts.find((part) => part.type === "year")?.value ?? "0000"}-${parts.find((part) => part.type === "month")?.value ?? "00"}-${parts.find((part) => part.type === "day")?.value ?? "00"}`;
    const hour = Number.parseInt(hourPart, 10);

    if (Number.isNaN(hour) || hour < 18) {
      return;
    }

    const storageKey = `bs-daily-reset-${datePart}`;
    const alreadyReset = window.localStorage.getItem(storageKey);
    if (alreadyReset) {
      return;
    }

    fetch("/api/reset", { method: "POST" }).catch((err) => {
      console.error("Falha ao resetar contas automaticamente", err);
    });
    window.localStorage.setItem(storageKey, new Date().toISOString());
  }, []);

  const filteredAccounts = useMemo(() => {
    if (!accounts) return [];
    if (statusFilter === "free") {
      return accounts.filter((account) => account.status === "free");
    }
    if (statusFilter === "busy") {
      return accounts.filter((account) => account.status === "busy");
    }
    return accounts;
  }, [accounts, statusFilter]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setRedirecting(true);
      router.replace("/");
    }
  }, [loading, router, user]);

  if (redirecting) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">Redirecionando...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-10">
      <DashboardHeader
        onSignOut={signOut}
        statusFilter={statusFilter}
        onFilterChange={setStatusFilter}
        totalAccounts={accounts?.length ?? 0}
        busyAccounts={
          accounts?.filter((acc) => acc.status === "busy").length ?? 0
        }
        user={user}
        role={role}
      />
      <section className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          <AccountList
            accounts={filteredAccounts}
            isLoading={isLoading}
            error={error}
          />
        </div>
        <div className="space-y-4">
          <QuickReservationCard accounts={accounts} isLoading={isLoading} user={user} />
          {role === "admin" && <AccountRegistrationForm />}
          {role === "admin" && accounts && <AdminUsageInsights accounts={accounts} />}
        </div>
      </section>
    </main>
  );
}
