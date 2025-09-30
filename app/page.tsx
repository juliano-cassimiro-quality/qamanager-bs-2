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

  const features = [
    {
      title: "Reservas inteligentes",
      description: "Visualize rapidamente quem está usando as licenças e antecipe conflitos com alertas automáticos.",
      gradient: "from-brand-teal/20 to-brand-mint/10",
      text: "text-brand-teal"
    },
    {
      title: "Fluxo colaborativo",
      description: "Convide times, distribua acessos e acompanhe status com um painel intuitivo e responsivo.",
      gradient: "from-brand-amber/25 to-brand-terracotta/10",
      text: "text-brand-amber dark:text-brand-peach"
    },
    {
      title: "Insights em tempo real",
      description: "Monitoramento contínuo de reservas, devoluções e bloqueios para decisões baseadas em dados.",
      gradient: "from-brand-leaf/20 to-brand-lime/10",
      text: "text-brand-leaf"
    },
    {
      title: "Segurança corporativa",
      description: "Autenticação e redefinição de senha com proteção reforçada e rastreabilidade.",
      gradient: "from-brand-olive/25 to-brand-teal/10",
      text: "text-brand-olive"
    }
  ];

  const badges = [
    "Dark & Light mode automáticos",
    "Interface responsiva",
    "Paleta QA exclusiva"
  ];

  return (
    <main className="relative isolate flex min-h-screen flex-col justify-center overflow-hidden px-4 py-16 sm:px-6 lg:px-12">
      <div className="pointer-events-none absolute inset-0 -z-30 bg-soft-grid opacity-50 [mask-image:radial-gradient(ellipse_at_center,rgba(0,0,0,0.9)_0%,transparent_70%)]" />
      <div className="absolute -left-32 top-24 -z-20 h-80 w-80 rounded-full bg-brand-teal/20 blur-3xl dark:bg-brand-mint/20" />
      <div className="absolute -right-24 bottom-16 -z-20 h-96 w-96 rounded-full bg-brand-amber/25 blur-3xl dark:bg-brand-olive/25" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 rounded-full border border-border/60 bg-surface/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-muted shadow-sm backdrop-blur">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-teal" />
            <span>Quality Digital</span>
          </div>
          <ThemeToggle />
        </div>

        <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <section className="space-y-10 text-balance">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface-elevated/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal shadow-sm">
                Novo visual
              </span>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold leading-tight text-foreground sm:text-5xl">
                  Um layout dinâmico para acelerar a gestão do BrowserStack
                </h1>
                <p className="text-lg text-muted">
                  Modernizamos o QA Manager com uma experiência elegante, centrada no fluxo do time e pronta para o modo claro ou escuro.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="group relative overflow-hidden rounded-2xl border border-border/60 bg-surface/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${feature.gradient}`} aria-hidden="true" />
                  <h3 className={`text-base font-semibold ${feature.text}`}>{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted">{feature.description}</p>
                </article>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-muted">
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface-elevated/80 px-4 py-2 font-medium text-foreground/80 shadow-sm"
                >
                  <span className="h-2 w-2 rounded-full bg-brand-mint" />
                  {badge}
                </span>
              ))}
            </div>
          </section>

          <section className="relative">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-brand-teal/25 via-brand-mint/10 to-brand-amber/25 blur-2xl" aria-hidden="true" />
            <div className="relative rounded-3xl border border-border/60 bg-surface/90 p-8 shadow-2xl shadow-brand-teal/10 backdrop-blur-xl dark:border-border/40 dark:bg-surface/80">
              <header className="space-y-3 text-center lg:text-left">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-teal">
                  Acesso seguro
                </span>
                <h2 className="text-2xl font-semibold text-foreground">QA Manager</h2>
                <p className="text-sm text-muted">
                  Faça login com seu e-mail corporativo e organize os testes no BrowserStack sem fricções.
                </p>
              </header>
              <div className="mt-8">
                <LoginForm />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
