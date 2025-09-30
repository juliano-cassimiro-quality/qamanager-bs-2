"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAccounts } from "@/hooks/useAccounts";
import { AccountList } from "@/components/dashboard/AccountList";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { InviteSection } from "@/components/dashboard/InviteSection";

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<"all" | "free" | "busy">(
    "all"
  );
  const { accounts, isLoading, error } = useAccounts();

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

  if (!loading && !user) {
    router.replace("/");
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
      />
      <section className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          <AccountList
            accounts={filteredAccounts}
            isLoading={isLoading}
            error={error}
          />
        </div>
        <InviteSection />
      </section>
    </main>
  );
}
