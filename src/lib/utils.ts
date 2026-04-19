import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercent(n: number, digits = 1) {
  return `${(n * 100).toFixed(digits)}%`;
}

export function truncate(s: string, max = 280) {
  if (!s) return "";
  return s.length <= max ? s : s.slice(0, max - 1) + "…";
}
