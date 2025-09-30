"use client";

import { FormEvent, useState } from "react";

import { createAccount } from "@/lib/firestore";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextInput } from "@/components/ui/TextInput";
import { useAuth } from "@/hooks/useAuth";

export function AccountRegistrationForm() {
  const { role } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (role !== "admin") {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username || !email || !password) {
      setError("Preencha todos os campos para cadastrar uma nova conta.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await createAccount({ username, email, password });
      setSuccess(`Conta ${username} adicionada com sucesso.`);
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error(err);
      setError((err as Error).message ?? "Erro ao cadastrar conta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">Cadastrar conta</h2>
        <p className="text-sm text-slate-500">
          Registre rapidamente novas credenciais do BrowserStack informando usuário, e-mail e senha.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <TextInput
          label="Usuário"
          name="username"
          placeholder="ex: qa-team-01"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
        <TextInput
          type="email"
          label="E-mail"
          name="email"
          placeholder="conta@empresa.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextInput
          type="text"
          label="Senha"
          name="password"
          placeholder="Senha do BrowserStack"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <PrimaryButton type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Salvando..." : "Adicionar conta"}
        </PrimaryButton>
      </form>

      {success && <p className="mt-3 text-xs text-emerald-700">{success}</p>}
      {error && <p className="mt-3 text-xs text-rose-600">{error}</p>}
    </section>
  );
}
