"use client";

import { useEffect, useState } from "react";
import { subscribeToAccounts } from "@/lib/firestore";
import { useToast } from "@/components/providers/ToastProvider";
import type { Account } from "@/lib/types";

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const unsubscribe = subscribeToAccounts(
      (items) => {
        setAccounts(items);
        setIsLoading(false);
        setError(null);
      },
      (subscriptionError) => {
        setError(subscriptionError);
        setIsLoading(false);
        showToast({
          title: "Erro ao carregar contas",
          description: subscriptionError.message,
          intent: "error",
        });
      }
    );

    return () => {
      try {
        unsubscribe();
      } catch (err) {
        const cleanupError = err as Error;
        setError(cleanupError);
        showToast({
          title: "Erro ao encerrar assinatura",
          description: cleanupError.message,
          intent: "warning",
        });
      }
    };
  }, [showToast]);

  return { accounts: accounts ?? undefined, error, isLoading };
}
