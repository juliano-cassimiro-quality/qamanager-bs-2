"use client";

import clsx from "clsx";
import { InputHTMLAttributes } from "react";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
}

export function TextInput({ label, helperText, className, id, ...props }: TextInputProps) {
  const inputId = id ?? props.name ?? `input-${label?.toLowerCase().replace(/\s+/g, "-") ?? crypto.randomUUID()}`;
  return (
    <label className="block space-y-1 text-sm text-muted" htmlFor={inputId}>
      {label && <span className="font-medium text-foreground/80 dark:text-foreground">{label}</span>}
      <input
        id={inputId}
        className={clsx(
          "w-full rounded-xl border border-border/60 bg-surface-elevated/80 px-3.5 py-2.5 text-sm text-foreground shadow-sm transition placeholder:text-muted/70 focus:border-brand-teal focus:outline-none focus:ring-4 focus:ring-brand-teal/20 dark:border-border/40 dark:bg-surface-elevated/70 dark:focus:border-brand-mint dark:focus:ring-brand-mint/25",
          className
        )}
        {...props}
      />
      {helperText && <span className="text-xs text-muted/80">{helperText}</span>}
    </label>
  );
}
