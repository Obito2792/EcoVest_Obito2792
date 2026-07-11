"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastVariant = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Safe no-op fallback if a component ever renders outside the provider.
    return { showToast: () => {} };
  }
  return ctx;
}

const VARIANT_BORDER: Record<ToastVariant, string> = {
  success: "border-forest-500/30",
  error: "border-red-300",
  info: "border-blue-300",
};

const VARIANT_DOT: Record<ToastVariant, string> = {
  success: "bg-forest-500",
  error: "bg-red-500",
  info: "bg-blue-500",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4 sm:left-auto sm:right-6 sm:translate-x-0 sm:items-end sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast-enter pointer-events-auto flex w-full items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm text-navy-900 shadow-lg ${VARIANT_BORDER[t.variant]}`}
          >
            <span className={`h-2 w-2 flex-shrink-0 rounded-full ${VARIANT_DOT[t.variant]}`} />
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
