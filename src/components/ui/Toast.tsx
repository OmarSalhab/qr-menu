"use client";
import React, { createContext, useContext, useState, useCallback } from "react";

type ToastKind = "success" | "error" | "info";
type ToastMsg = { id: number; kind: ToastKind; message: string };

const ToastContext = createContext<{ push: (kind: ToastKind, message: string) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx.push;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = useState<ToastMsg[]>([]);
  const push = useCallback((kind: ToastKind, message: string) => {
    const id = Date.now() + Math.random();
    setList((l) => [...l, { id, kind, message }]);
    setTimeout(() => setList((l) => l.filter((t) => t.id !== id)), 3500);
  }, []);
  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed z-[100] start-1/2 -translate-x-1/2 bottom-4 space-y-2 w-[92vw] max-w-[420px]">
        {list.map((t) => (
          <div
            key={t.id}
            className={`rounded-[12px] px-4 py-3 shadow-md border text-sm backdrop-blur-md ${
              t.kind === "success"
                ? "bg-[color-mix(in_oklab,var(--brand-600),white_85%)] text-gray-800 border-[var(--brand-500)]"
                : t.kind === "error"
                ? "bg-[color-mix(in_oklab,crimson,white_88%)] text-gray-800 border-[color-mix(in_oklab,crimson,black_10%)]"
                : "bg-[var(--surface)] text-gray-800 border-[var(--border)]"
            }`}
            role="status"
            aria-live="polite"
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
