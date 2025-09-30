"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/auth/LoginForm";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

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

  const highlights = [
    {
      title: "Status rápido",
      caption: "Reservas",
      accent: "from-brand-teal/70 via-brand-mint/40 to-transparent"
    },
    {
      title: "Equipe alinhada",
      caption: "Fluxos",
      accent: "from-brand-amber/60 via-brand-terracotta/30 to-transparent"
    },
    {
      title: "Segurança nativa",
      caption: "Acessos",
      accent: "from-brand-leaf/60 via-brand-lime/30 to-transparent"
    }
  ];

  const chips = ["Dark mode", "Gestão ágil", "BrowserStack"];

  return (
    <main className="relative isolate flex min-h-screen flex-col justify-center overflow-hidden px-6 py-16 sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute inset-0 -z-30 bg-soft-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,rgba(0,0,0,0.85)_0%,transparent_70%)]" />
      <div className="absolute -top-24 left-1/2 -z-20 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-mint/25 blur-3xl dark:bg-brand-teal/20" />
      <div className="mx-auto grid w-full max-w-5xl gap-12 lg:grid-cols-[1fr_auto] lg:items-center">
        <header className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-surface/80 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-muted shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-brand-teal" />
              QA Manager
            </div>
            <ThemeToggle />
          </div>

          <div className="space-y-4 text-balance">
            <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">Operação limpa, foco no teste</h1>
            <p className="max-w-xl text-base text-muted">
              Tudo o que importa para controlar reservas BrowserStack com clareza imediata.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-muted">
            {chips.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface-elevated/80 px-4 py-2 font-medium text-foreground/80 shadow-sm"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-brand-mint" />
                {chip}
              </span>
            ))}
          </div>

          <section className="grid gap-4 sm:grid-cols-3">
            {highlights.map((item) => (
              <article
                key={item.title}
                className="relative overflow-hidden rounded-2xl border border-border/60 bg-surface/90 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${item.accent}`} aria-hidden="true" />
                <p className="text-xs uppercase tracking-[0.3em] text-muted">{item.caption}</p>
                <h2 className="mt-3 text-lg font-semibold text-foreground">{item.title}</h2>
              </article>
            ))}
          </section>
        </header>

        <section className="relative">
          <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-brand-teal/30 via-brand-mint/20 to-brand-amber/20 blur-2xl" aria-hidden="true" />
          <div className="relative w-full rounded-3xl border border-border/60 bg-surface/90 p-8 shadow-2xl shadow-brand-teal/10 backdrop-blur-xl dark:border-border/40 dark:bg-surface/80">
            <div className="space-y-3 text-center">
              <span className="inline-flex items-center justify-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-brand-teal">
                Entrar
              </span>
              <h2 className="text-2xl font-semibold text-foreground">Painel QA</h2>
              <p className="text-sm text-muted">Acesso rápido e seguro.</p>
            </div>
            <div className="mt-8">
              <LoginForm />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
