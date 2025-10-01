"use client";

import { useMemo, useRef, useState } from "react";
import { createAccount } from "@/lib/firestore";
import type { Account } from "@/lib/types";

interface AccountImportExportProps {
  accounts?: Account[];
}

interface ImportFeedback {
  type: "success" | "error";
  message: string;
}

interface ImportAccountPayload {
  username: string;
  email: string;
  password: string;
}

function normalizeAccountsPayload(data: unknown): ImportAccountPayload[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item) => {
      if (typeof item !== "object" || item === null) return null;
      const username = "username" in item ? (item.username as unknown) : null;
      const email = "email" in item ? (item.email as unknown) : null;
      const password = "password" in item ? (item.password as unknown) : null;

      if (
        typeof username !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string"
      ) {
        return null;
      }

      return {
        username: username.trim(),
        email: email.trim(),
        password,
      } satisfies ImportAccountPayload;
    })
    .filter((item): item is ImportAccountPayload => Boolean(item));
}

export function AccountImportExport({ accounts }: AccountImportExportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [feedback, setFeedback] = useState<ImportFeedback | null>(null);

  const exportData = useMemo(() => {
    if (!accounts?.length) {
      return "[]";
    }

    const simplified = accounts.map((account) => ({
      username: account.username,
      email: account.email,
      password: account.password ?? "",
      status: account.status,
      owner: account.owner ?? null,
      ownerId: account.ownerId ?? null,
      lastUsedAt: account.lastUsedAt ?? null,
      lastReturnedAt: account.lastReturnedAt ?? null,
    }));

    return JSON.stringify(simplified, null, 2);
  }, [accounts]);

  const handleExport = () => {
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "contas-browserstack.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    const file = fileInputRef.current?.files?.[0];
    setFeedback(null);

    if (!file) {
      setFeedback({
        type: "error",
        message: "Selecione um arquivo JSON antes de importar.",
      });
      return;
    }

    let payload: ImportAccountPayload[] = [];

    try {
      const fileContent = await file.text();
      const parsed = JSON.parse(fileContent) as unknown;
      payload = normalizeAccountsPayload(parsed);
    } catch (error) {
      console.error("Falha ao ler arquivo de importação", error);
      setFeedback({
        type: "error",
        message: "Não foi possível ler o arquivo informado. Verifique o formato.",
      });
      return;
    }

    if (!payload.length) {
      setFeedback({
        type: "error",
        message: "Nenhuma conta válida encontrada no arquivo selecionado.",
      });
      return;
    }

    setIsImporting(true);

    try {
      for (const account of payload) {
        // eslint-disable-next-line no-await-in-loop
        await createAccount(account);
      }

      setFeedback({
        type: "success",
        message: `${payload.length} conta(s) importada(s) com sucesso.`,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Falha ao importar contas", error);
      setFeedback({
        type: "error",
        message:
          "Ocorreu um erro durante a importação. Algumas contas podem não ter sido criadas.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-slate-900">
          Importar/Exportar contas
        </h3>
        <p className="text-sm text-slate-500">
          Realize o backup das contas cadastradas ou importe um arquivo JSON
          com novos acessos. Disponível apenas para administradores.
        </p>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={handleExport}
          className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          disabled={!accounts?.length}
        >
          Exportar lista de contas (JSON)
        </button>
        {!accounts?.length && (
          <p className="text-xs text-slate-500">
            É necessário possuir contas cadastradas para exportar.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Importar contas
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900"
        />
        <button
          type="button"
          onClick={handleImport}
          disabled={isImporting}
          className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
        >
          {isImporting ? "Importando contas..." : "Importar do arquivo selecionado"}
        </button>
      </div>

      {feedback && (
        <p
          className={`text-sm ${
            feedback.type === "success" ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {feedback.message}
        </p>
      )}
    </section>
  );
}
