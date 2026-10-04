'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'info', title?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type, title }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const success = useCallback((message: string, title?: string) => toast(message, 'success', title), [toast]);
  const error = useCallback((message: string, title?: string) => toast(message, 'error', title), [toast]);
  const warning = useCallback((message: string, title?: string) => toast(message, 'warning', title), [toast]);
  const info = useCallback((message: string, title?: string) => toast(message, 'info', title), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-lg border text-xs transition-all duration-200 animate-in slide-in-from-bottom-2 ${
              t.type === 'success'
                ? 'bg-slate-900 text-white border-emerald-500/40 ring-1 ring-emerald-500/20'
                : t.type === 'error'
                ? 'bg-slate-900 text-white border-red-500/40 ring-1 ring-red-500/20'
                : t.type === 'warning'
                ? 'bg-slate-900 text-white border-amber-500/40 ring-1 ring-amber-500/20'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {t.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-400" />}
              {t.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
              {t.type === 'info' && <Info className="w-4 h-4 text-sky-400" />}
            </div>

            <div className="flex-1 min-w-0">
              {t.title && <div className="font-semibold text-slate-100">{t.title}</div>}
              <div className="text-slate-300 leading-relaxed font-normal">{t.message}</div>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-white p-0.5 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
