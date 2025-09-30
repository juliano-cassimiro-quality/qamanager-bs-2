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
    <label className="block space-y-1 text-sm text-slate-600" htmlFor={inputId}>
      {label && <span className="font-medium text-slate-700">{label}</span>}
      <input
        id={inputId}
        className={clsx(
          "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200",
          className
        )}
        {...props}
      />
      {helperText && <span className="text-xs text-slate-400">{helperText}</span>}
    </label>
  );
}
