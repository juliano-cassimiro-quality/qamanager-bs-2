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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950/5 px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-30 bg-soft-grid opacity-40 [mask-image:radial-gradient(circle_at_center,rgba(0,0,0,0.92)_0%,transparent_70%)]" />
      <div className="absolute -top-32 left-1/2 -z-20 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-brand-mint/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 -z-10 h-64 w-64 translate-x-1/3 translate-y-1/3 rounded-full bg-brand-amber/10 blur-3xl" />
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-border/40 bg-surface/80 shadow-2xl backdrop-blur-xl md:grid-cols-[1.1fr,1fr]">
        <aside className="relative hidden flex-col justify-between bg-gradient-to-br from-brand-teal via-brand-mint to-brand-lime p-8 text-white md:flex">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-white/80">
              <span className="h-2 w-2 rounded-full bg-white" />
              QA Manager
            </span>
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold leading-tight">Controle compacto das contas BrowserStack</h1>
              <p className="text-sm text-white/80">
                Visão rápida do status das licenças e fluxo de reserva/desbloqueio com poucos cliques. Segurança e rastreabilidade para o time de QA.
              </p>
            </div>
          </div>
          <ul className="space-y-3 text-sm text-white/80">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white" /> Status ao vivo das contas
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white" /> Histórico de uso centralizado
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white" /> Reservas em um toque
            </li>
          </ul>
        </aside>
        <section className="flex flex-col gap-8 p-8 sm:p-10">
          <header className="space-y-3 text-center md:text-left">
            <span className="inline-flex items-center justify-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-brand-teal">
              Acesso seguro
            </span>
            <h2 className="text-2xl font-semibold text-foreground">Entre no painel</h2>
            <p className="text-sm text-muted">
              Utilize seu e-mail corporativo Quality Digital para liberar o dashboard.
            </p>
          </header>
          <div className="rounded-2xl border border-border/60 bg-white/70 p-6 shadow-lg shadow-brand-teal/5">
            <LoginForm />
          </div>
          <p className="text-center text-[0.75rem] text-muted md:text-left">
            Dica: cadastre-se uma vez para validar o e-mail. Depois é só entrar com a mesma senha.
          </p>
        </section>
      </div>
    </main>
  );
}
