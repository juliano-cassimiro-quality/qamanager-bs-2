"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextInput } from "@/components/ui/TextInput";

export function LoginForm() {
  const { signInWithGoogle, signInWithEmail, registerWithEmail } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await signInWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, name);
      }
    } catch (err) {
      console.error(err);
      setError(
        mode === "login"
          ? "Não foi possível realizar o login. Verifique as credenciais."
          : "Não foi possível criar a conta."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <PrimaryButton
          type="button"
          onClick={() => signInWithGoogle()}
          className="w-full bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
        >
          <span className="mr-2 inline-flex h-5 w-5 items-center justify-center">
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M21.35 11.1h-9.17v2.91h5.27c-.23 1.24-1.36 3.64-5.27 3.64A6.09 6.09 0 0 1 6.05 11.5 6.09 6.09 0 0 1 12.18 5.4a5.52 5.52 0 0 1 3.77 1.43l2.56-2.56A9.31 9.31 0 0 0 12.18 2 9.5 9.5 0 1 0 21.7 11.5a6.58 6.58 0 0 0-.35-4.4z"
                fill="#4285F4"
              />
            </svg>
          </span>
          Entrar com Google
        </PrimaryButton>
      </div>

      <div className="relative flex items-center justify-center">
        <span className="h-px w-full bg-slate-200" />
        <span className="absolute rounded-full bg-white px-4 text-xs font-medium uppercase tracking-wider text-slate-400">
          ou
        </span>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {mode === "register" && (
          <TextInput
            label="Nome"
            placeholder="Nome completo"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        )}
        <TextInput
          label="E-mail"
          placeholder="nome@empresa.com"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <TextInput
          label="Senha"
          type="password"
          placeholder="Sua senha"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={6}
          required
        />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <PrimaryButton type="submit" className="w-full" disabled={loading}>
          {loading ? "Processando..." : mode === "login" ? "Entrar" : "Criar conta"}
        </PrimaryButton>
      </form>

      <p className="text-center text-xs text-slate-500">
        {mode === "login" ? "Ainda não tem acesso?" : "Já possui uma conta?"}{" "}
        <button
          className="font-medium text-primary-600 hover:text-primary-700"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "Criar conta" : "Entrar"}
        </button>
      </p>
    </div>
  );
}
