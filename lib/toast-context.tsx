'use client';

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

export type ToastVariant = 'success' | 'danger' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, variant?: ToastVariant, durationMs?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = 'info', durationMs = 3500) => {
      const id = `toast-${++counter}`;
      setToasts((prev) => [...prev, { id, message, variant }]);
      const timer = setTimeout(() => removeToast(id), durationMs);
      timersRef.current.set(id, timer);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

const noopToastApi: ToastContextValue = {
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  return ctx ?? noopToastApi;
}
