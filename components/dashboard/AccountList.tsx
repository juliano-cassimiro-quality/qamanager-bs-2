"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";

import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextInput } from "@/components/ui/TextInput";
import { deleteAccount, updateAccount } from "@/lib/firestore";
import type { Account, AccountStatus, UserRole } from "@/lib/types";

interface AccountListProps {
  accounts: Account[];
  isLoading: boolean;
  error: Error | null;
  role?: UserRole | null;
}

interface EditableAccountState {
  username: string;
  email: string;
  password: string;
  status: AccountStatus;
}

type AccountFeedback =
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export function AccountList({ accounts, isLoading, error, role }: AccountListProps) {
  const isAdmin = role === "admin";
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [formState, setFormState] = useState<EditableAccountState | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, AccountFeedback>>({});

  const orderedAccounts = useMemo(() => {
    return [...accounts].sort((a, b) => a.username.localeCompare(b.username));
  }, [accounts]);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Carregando contas...</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-rose-600">
        Erro ao carregar contas: {error.message}
      </p>
    );
  }

  if (!accounts.length) {
    return <p className="text-sm text-slate-500">Nenhuma conta encontrada.</p>;
  }

  const resetFeedback = (accountId: string) => {
    setFeedbackMap((previous) => {
      const { [accountId]: _removed, ...rest } = previous;
      return rest;
    });
  };

  const handleEditStart = (account: Account) => {
    resetFeedback(account.id);
    setEditingAccountId(account.id);
    setFormState({
      username: account.username,
      email: account.email,
      password: "",
      status: account.status,
    });
  };

  const handleEditCancel = () => {
    setEditingAccountId(null);
    setFormState(null);
  };

  const handleEditSubmit = async () => {
    if (!editingAccountId || !formState) return;
    setSaving(true);
    resetFeedback(editingAccountId);
    try {
      const payload: {
        username: string;
        email: string;
        status: AccountStatus;
        password?: string | null;
      } = {
        username: formState.username.trim(),
        email: formState.email.trim(),
        status: formState.status,
      };

      const passwordValue = formState.password.trim();
      if (passwordValue) {
        payload.password = passwordValue;
      }

      await updateAccount(editingAccountId, payload);
      setFeedbackMap((previous) => ({
        ...previous,
        [editingAccountId]: {
          type: "success",
          message: "Conta atualizada com sucesso.",
        },
      }));
      setEditingAccountId(null);
      setFormState(null);
    } catch (err) {
      setFeedbackMap((previous) => ({
        ...previous,
        [editingAccountId]: {
          type: "error",
          message:
            (err as Error).message ?? "Não foi possível atualizar a conta.",
        },
      }));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (accountId: string, username: string) => {
    resetFeedback(accountId);
    const confirmationMessage = `Deseja realmente excluir a conta ${username}? Esta ação não pode ser desfeita.`;
    if (typeof window !== "undefined" && !window.confirm(confirmationMessage)) {
      return;
    }
    setDeletingId(accountId);
    try {
      await deleteAccount(accountId);
      setFeedbackMap((previous) => ({
        ...previous,
        [accountId]: {
          type: "success",
          message: "Conta removida.",
        },
      }));
    } catch (err) {
      setFeedbackMap((previous) => ({
        ...previous,
        [accountId]: {
          type: "error",
          message: (err as Error).message ?? "Não foi possível excluir a conta.",
        },
      }));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <ul className="space-y-3">
      {orderedAccounts.map((account) => {
        const isBusy = account.status === "busy";
        const isEditing = editingAccountId === account.id;
        const feedback = feedbackMap[account.id];

        if (isAdmin && isEditing && formState) {
          return (
            <li
              key={account.id}
              className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  Editar conta
                </h3>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  ID: {account.username}
                </span>
              </div>
              <div className="space-y-3">
                <TextInput
                  label="Usuário"
                  value={formState.username}
                  onChange={(event) =>
                    setFormState((previous) =>
                      previous
                        ? { ...previous, username: event.target.value }
                        : previous,
                    )
                  }
                  placeholder="qa-team"
                  required
                />
                <TextInput
                  label="E-mail"
                  type="email"
                  value={formState.email}
                  onChange={(event) =>
                    setFormState((previous) =>
                      previous
                        ? { ...previous, email: event.target.value }
                        : previous,
                    )
                  }
                  placeholder="conta@empresa.com"
                  required
                />
                <TextInput
                  label="Atualizar senha"
                  type="text"
                  value={formState.password}
                  onChange={(event) =>
                    setFormState((previous) =>
                      previous
                        ? { ...previous, password: event.target.value }
                        : previous,
                    )
                  }
                  placeholder="Opcional — mantém senha atual se em branco"
                />
                <label className="block space-y-1 text-sm text-slate-600">
                  <span className="font-medium text-slate-700">Status</span>
                  <select
                    value={formState.status}
                    onChange={(event) =>
                      setFormState((previous) =>
                        previous
                          ? {
                              ...previous,
                              status: event.target.value as AccountStatus,
                            }
                          : previous,
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm focus:border-brand-teal focus:outline-none focus:ring-4 focus:ring-brand-teal/20"
                  >
                    <option value="free">Livre</option>
                    <option value="busy">Em uso</option>
                  </select>
                </label>
                <div className="flex flex-wrap gap-2">
                  <PrimaryButton
                    type="button"
                    onClick={handleEditSubmit}
                    disabled={saving}
                  >
                    {saving ? "Salvando..." : "Salvar alterações"}
                  </PrimaryButton>
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-700"
                  >
                    Cancelar
                  </button>
                </div>
                {feedback && (
                  <p
                    className={clsx(
                      "text-xs",
                      feedback.type === "success"
                        ? "text-emerald-700"
                        : "text-rose-600",
                    )}
                  >
                    {feedback.message}
                  </p>
                )}
              </div>
            </li>
          );
        }

        return (
          <li
            key={account.id}
            className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <p className="font-semibold text-slate-900">
                  {account.username}
                </p>
                <p className="text-xs text-slate-500">{account.email}</p>
                {account.password && (
                  <p className="font-mono text-xs text-slate-500">
                    Senha: {account.password}
                  </p>
                )}
              </div>
              <span
                className={clsx(
                  "inline-flex h-fit items-center rounded-full px-3 py-1 text-xs font-semibold",
                  isBusy
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700",
                )}
              >
                {isBusy ? "Em uso" : "Livre"}
              </span>
            </div>

            {isAdmin && (
              <div className="flex flex-wrap gap-2 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => handleEditStart(account)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(account.id, account.username)}
                  disabled={deletingId === account.id}
                  className="rounded-lg border border-rose-200 px-3 py-2 text-rose-600 transition hover:border-rose-300 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {deletingId === account.id ? "Removendo..." : "Excluir"}
                </button>
                {feedback && (
                  <span
                    className={clsx(
                      "self-center",
                      feedback.type === "success"
                        ? "text-emerald-700"
                        : "text-rose-600",
                    )}
                  >
                    {feedback.message}
                  </span>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
