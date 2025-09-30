"use client";

import { FormEvent, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextInput } from "@/components/ui/TextInput";

interface InviteResponse {
  token: string;
}

export function InviteSection() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [label, setLabel] = useState("");
  const [maxUses, setMaxUses] = useState<number | null>(1);
  const [expiresInHours, setExpiresInHours] = useState<number | null>(24);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentOrigin = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setLoading(true);
    setInviteUrl(null);
    setError(null);
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/invites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          label,
          inviteeEmail: email || undefined,
          expiresInHours,
          maxUses,
        }),
      });
      if (!response.ok) {
        throw new Error("Erro ao gerar convite");
      }
      const data = (await response.json()) as InviteResponse;
      setInviteUrl(`${currentOrigin}/invite/${data.token}`);
      setEmail("");
      setLabel("");
    } catch (err) {
      console.error(err);
      setError("Não foi possível gerar o convite.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">Compartilhar acesso</h2>
        <p className="text-sm text-slate-500">
          Crie convites temporários para colaboradores visualizarem contas livres e fazerem reservas.
        </p>
      </header>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <TextInput
          label="E-mail do convidado (opcional)"
          placeholder="nome@empresa.com"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextInput
          label="Etiqueta do convite"
          placeholder="Ex: Squad Mobile Sprint 12"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextInput
            label="Validade (horas)"
            type="number"
            min={1}
            value={expiresInHours ?? ""}
            onChange={(event) => setExpiresInHours(event.target.value ? Number(event.target.value) : null)}
          />
          <TextInput
            label="Máximo de usos"
            type="number"
            min={1}
            value={maxUses ?? ""}
            onChange={(event) => setMaxUses(event.target.value ? Number(event.target.value) : null)}
          />
        </div>
        {error && <p className="text-xs text-rose-600">{error}</p>}
        <PrimaryButton type="submit" className="w-full" disabled={loading || !user}>
          {loading ? "Gerando..." : "Gerar link"}
        </PrimaryButton>
      </form>

      {inviteUrl && (
        <div className="rounded-xl bg-primary-50 p-4 text-xs text-primary-700">
          <p className="font-semibold">Link gerado</p>
          <p className="mt-2 break-all font-mono">{inviteUrl}</p>
        </div>
      )}
    </aside>
  );
}
