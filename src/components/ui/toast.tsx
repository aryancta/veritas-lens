"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "success" | "error" | "info";
type Toast = { id: number; title: string; description?: string; variant: ToastVariant };

type ToastContextType = {
  toast: (t: Omit<Toast, "id">) => void;
};

const ToastContext = React.createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const toast = React.useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((cur) => [...cur, { id, ...t }]);
    setTimeout(() => {
      setToasts((cur) => cur.filter((x) => x.id !== id));
    }, 4500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {mounted &&
        createPortal(
          <div className="pointer-events-none fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
            {toasts.map((t) => (
              <div
                key={t.id}
                className={cn(
                  "pointer-events-auto flex items-start gap-3 rounded-lg border bg-card p-4 shadow-lg animate-fade-in",
                  t.variant === "success" && "border-success/40",
                  t.variant === "error" && "border-destructive/40",
                  t.variant === "info" && "border-primary/40"
                )}
              >
                {t.variant === "success" && (
                  <CheckCircle2 className="size-5 text-success shrink-0" />
                )}
                {t.variant === "error" && (
                  <AlertCircle className="size-5 text-destructive shrink-0" />
                )}
                {t.variant === "info" && (
                  <Info className="size-5 text-primary shrink-0" />
                )}
                {t.variant === "default" && (
                  <Info className="size-5 text-muted-foreground shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{t.title}</p>
                  {t.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() =>
                    setToasts((cur) => cur.filter((x) => x.id !== t.id))
                  }
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Dismiss"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}
