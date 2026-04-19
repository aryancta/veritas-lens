"use client";

import * as React from "react";

const STORAGE_KEY = "veritaslens_api_keys";

export type ApiKeys = {
  groq: string;
  gemini: string;
  huggingface: string;
};

const DEFAULT: ApiKeys = { groq: "", gemini: "", huggingface: "" };

function read(): ApiKeys {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw);
    return {
      groq: typeof parsed.groq === "string" ? parsed.groq : "",
      gemini: typeof parsed.gemini === "string" ? parsed.gemini : "",
      huggingface: typeof parsed.huggingface === "string" ? parsed.huggingface : "",
    };
  } catch {
    return DEFAULT;
  }
}

export function useApiKeys() {
  const [keys, setKeys] = React.useState<ApiKeys>(DEFAULT);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setKeys(read());
    setHydrated(true);
    const sync = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setKeys(read());
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const save = React.useCallback((next: ApiKeys) => {
    setKeys(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* localStorage may be disabled */
    }
  }, []);

  const clear = React.useCallback(() => {
    setKeys(DEFAULT);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
  }, []);

  return { keys, save, clear, hydrated };
}

export function buildAuthHeaders(keys: ApiKeys): Record<string, string> {
  const h: Record<string, string> = {};
  if (keys.groq) h["x-user-groq-key"] = keys.groq;
  if (keys.gemini) h["x-user-gemini-key"] = keys.gemini;
  if (keys.huggingface) h["x-user-hf-key"] = keys.huggingface;
  return h;
}
