"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchRecentAccountLogs } from "@/lib/firestore";
import type { AccountLog } from "@/lib/types";

export function useAccountLogs(limitCount = 100) {
  const [logs, setLogs] = useState<AccountLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchRecentAccountLogs(limitCount);
      setLogs(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [limitCount]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  return { logs, loading, error, refresh: loadLogs };
}
