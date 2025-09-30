"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/auth/LoginForm";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, router, user]);

  if (loading || user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-slate-500">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="space-y-6">
          <header className="text-center">
            <h1 className="text-3xl font-semibold text-slate-900">QA Manager</h1>
            <p className="mt-2 text-sm text-slate-500">
              Faça login para gerenciar as contas do BrowserStack.
            </p>
          </header>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
