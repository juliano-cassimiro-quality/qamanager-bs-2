"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchRecentAccountLogs } from "@/lib/firestore";
import { useToast } from "@/components/providers/ToastProvider";
import type { AccountLog } from "@/lib/types";

export function useAccountLogs(limitCount = 100) {
  const [logs, setLogs] = useState<AccountLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { showToast } = useToast();

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchRecentAccountLogs(limitCount);
      setLogs(data);
      setError(null);
    } catch (err) {
      const loadError = err as Error;
      setError(loadError);
      showToast({
        title: "Erro ao carregar histórico",
        description: loadError.message,
        intent: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [limitCount, showToast]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  return { logs, loading, error, refresh: loadLogs };
}
