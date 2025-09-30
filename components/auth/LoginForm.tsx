"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextInput } from "@/components/ui/TextInput";

export function LoginForm() {
  const { signInWithEmail, registerWithEmail, sendPasswordReset, authError } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await signInWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, name);
        setInfo("Conta criada. Enviamos um e-mail de verificação para ativar o acesso.");
        setMode("login");
      }
    } catch (err) {
      console.error(err);
      setError((err as Error).message ?? "Não foi possível concluir a solicitação.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError("Informe um e-mail corporativo para redefinir a senha.");
      return;
    }
    setError(null);
    setInfo(null);
    setResetLoading(true);
    try {
      await sendPasswordReset(email);
      setInfo("Enviamos um e-mail com instruções para redefinir sua senha.");
    } catch (err) {
      console.error(err);
      setError((err as Error).message ?? "Não foi possível enviar o e-mail de redefinição.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="space-y-6">
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
          label="E-mail corporativo"
          placeholder="nome@qualitydigital.global"
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
        {(error || (mode === "login" && authError)) && (
          <p className="text-sm text-rose-600">{error ?? authError}</p>
        )}
        {info && <p className="text-sm text-emerald-700">{info}</p>}
        <PrimaryButton type="submit" className="w-full" disabled={loading}>
          {loading ? "Processando..." : mode === "login" ? "Entrar" : "Criar conta"}
        </PrimaryButton>
      </form>

      {mode === "login" && (
        <button
          type="button"
          onClick={handlePasswordReset}
          disabled={resetLoading}
          className="w-full text-center text-xs font-medium text-primary-600 hover:text-primary-700 disabled:opacity-60"
        >
          {resetLoading ? "Enviando..." : "Esqueceu a senha?"}
        </button>
      )}

      <p className="text-center text-xs text-slate-500">
        {mode === "login" ? "Ainda não tem acesso?" : "Já possui uma conta?"}{" "}
        <button
          type="button"
          className="font-medium text-primary-600 hover:text-primary-700"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError(null);
            setInfo(null);
          }}
        >
          {mode === "login" ? "Criar conta" : "Entrar"}
        </button>
      </p>
    </div>
  );
}
