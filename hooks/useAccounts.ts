"use client";

import { useEffect, useState } from "react";
import { subscribeToAccounts } from "@/lib/firestore";
import type { Account } from "@/lib/types";

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAccounts((items) => {
      setAccounts(items);
      setIsLoading(false);
    });

    return () => {
      try {
        unsubscribe();
      } catch (err) {
        setError(err as Error);
      }
    };
  }, []);

  return { accounts: accounts ?? undefined, error, isLoading };
}
