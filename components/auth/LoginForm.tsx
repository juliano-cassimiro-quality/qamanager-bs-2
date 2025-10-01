"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextInput } from "@/components/ui/TextInput";
import { useToast } from "@/components/providers/ToastProvider";

export function LoginForm() {
  const { signInWithEmail, registerWithEmail, sendPasswordReset } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await signInWithEmail(email, password);
        showToast({
          title: "Login realizado",
          description: "Bem-vindo(a) de volta!",
          intent: "success",
          duration: 4000,
        });
      } else {
        await registerWithEmail(email, password, name);
        showToast({
          title: "Conta criada",
          description: "Enviamos um e-mail de verificação para ativar o acesso.",
          intent: "success",
        });
        setName("");
        setPassword("");
        setMode("login");
      }
    } catch (err) {
      console.error(err);
      showToast({
        title: "Não foi possível concluir a solicitação",
        description: (err as Error).message ?? "Tente novamente em instantes.",
        intent: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      showToast({
        title: "Informe seu e-mail",
        description: "Digite um e-mail corporativo para redefinir a senha.",
        intent: "warning",
      });
      return;
    }
    setResetLoading(true);
    try {
      await sendPasswordReset(email);
      showToast({
        title: "Verifique sua caixa de entrada",
        description: "Enviamos um e-mail com instruções para redefinir a senha.",
        intent: "info",
      });
    } catch (err) {
      console.error(err);
      showToast({
        title: "Não foi possível enviar o e-mail",
        description: (err as Error).message ?? "Tente novamente em instantes.",
        intent: "error",
      });
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
        <PrimaryButton type="submit" className="w-full" disabled={loading}>
          {loading ? "Processando..." : mode === "login" ? "Entrar" : "Criar conta"}
        </PrimaryButton>
      </form>

      {mode === "login" && (
        <button
          type="button"
          onClick={handlePasswordReset}
          disabled={resetLoading}
          className="w-full text-center text-xs font-semibold text-brand-teal transition hover:text-brand-mint disabled:opacity-60"
        >
          {resetLoading ? "Enviando..." : "Esqueceu a senha?"}
        </button>
      )}

      <p className="text-center text-xs text-muted">
        {mode === "login" ? "Ainda não tem acesso?" : "Já possui uma conta?"}{" "}
        <button
          type="button"
          className="font-semibold text-brand-teal hover:text-brand-mint"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setPassword("");
          }}
        >
          {mode === "login" ? "Criar conta" : "Entrar"}
        </button>
      </p>
    </div>
  );
}
