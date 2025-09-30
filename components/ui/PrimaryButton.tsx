"use client";

import clsx from "clsx";
import { ButtonHTMLAttributes } from "react";

const baseStyles =
  "inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-teal via-brand-mint to-brand-lime px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-teal/20 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal disabled:cursor-not-allowed disabled:opacity-70 hover:brightness-105 dark:from-brand-mint dark:via-brand-leaf dark:to-brand-lime";

export function PrimaryButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={clsx(baseStyles, className)} {...props} />;
}
