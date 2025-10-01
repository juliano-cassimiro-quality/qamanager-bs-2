"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";

export type ToastIntent = "info" | "success" | "warning" | "error";

export interface ToastOptions {
  title: string;
  description?: string;
  intent?: ToastIntent;
  duration?: number;
}

interface ToastProps extends ToastOptions {
  id: string;
  onDismiss: () => void;
}

const intentStyles: Record<ToastIntent, string> = {
  info: "border-slate-200 bg-white text-slate-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  error: "border-rose-200 bg-rose-50 text-rose-700",
};

const descriptionStyles: Record<ToastIntent, string> = {
  info: "text-slate-600",
  success: "text-emerald-700",
  warning: "text-amber-700",
  error: "text-rose-700",
};

export function Toast({ title, description, intent = "info", onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <div
      className={clsx(
        "pointer-events-auto w-full max-w-sm rounded-2xl border p-4 shadow-xl transition-all duration-300",
        "ring-1 ring-black/5",
        intentStyles[intent],
        visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
      )}
      role="status"
      aria-live="assertive"
    >
      <div className="flex gap-3">
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold leading-5">{title}</p>
          {description ? (
            <p className={clsx("text-xs leading-relaxed", descriptionStyles[intent])}>{description}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => {
            setVisible(false);
            window.setTimeout(onDismiss, 200);
          }}
          className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-slate-400 transition hover:bg-black/5 hover:text-slate-600"
          aria-label="Fechar notificação"
        >
          ×
        </button>
      </div>
    </div>
  );
}
