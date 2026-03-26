"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

interface Toast {
  id: number;
  message: string;
  leaving: boolean;
}

const ToastCtx = createContext<(msg: string) => void>(() => {});

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  useEffect(() => {
    return () => {
      for (const t of timers.current) clearTimeout(t);
    };
  }, []);

  const push = useCallback((message: string) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev.slice(-2), { id, message, leaving: false }]);
    const t1 = setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
      );
      const t2 = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        timers.current.delete(t2);
      }, 250);
      timers.current.add(t2);
      timers.current.delete(t1);
    }, 2000);
    timers.current.add(t1);
  }, []);

  return (
    <ToastCtx value={push}>
      {children}
      <div className="fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-lg border border-white/10 bg-[#1a1530]/95 backdrop-blur-md px-4 py-2.5 text-sm text-white/90 shadow-lg shadow-black/30 ${
              t.leaving ? "animate-toast-out" : "animate-toast-in"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx>
  );
}
