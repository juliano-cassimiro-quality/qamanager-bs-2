"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Toast, type ToastIntent, type ToastOptions } from "@/components/ui/Toast";

interface ToastContextValue {
  showToast: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
}

interface ToastRecord extends ToastOptions {
  id: string;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timers = useRef<Record<string, number>>({});

  const dismissToast = useCallback((id: string) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
    const timeoutId = timers.current[id];
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      delete timers.current[id];
    }
  }, []);

  const showToast = useCallback<ToastContextValue["showToast"]>(
    ({ duration = 6000, intent = "info", ...rest }) => {
      const id = `toast-${typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2, 11)}`;
      setToasts((previous) => [
        ...previous,
        {
          ...rest,
          id,
          intent,
          duration,
        },
      ]);

      if (duration > 0) {
        timers.current[id] = window.setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
  );

  const value = useMemo(() => ({ showToast, dismissToast }), [dismissToast, showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== "undefined"
        ? createPortal(
            <div className="pointer-events-none fixed inset-x-0 top-4 z-[9999] flex flex-col items-center gap-3 px-4 sm:items-end sm:px-6">
              {toasts.map((toast) => (
                <Toast key={toast.id} {...toast} onDismiss={() => dismissToast(toast.id)} />
              ))}
            </div>,
            document.body
          )
        : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser usado dentro de ToastProvider");
  }
  return context;
}

export type { ToastIntent };
