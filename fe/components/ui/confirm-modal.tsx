'use client';

import React from 'react';
import { AlertCircle, HelpCircle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  isDestructive = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95">
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-xl flex-shrink-0 ${
              isDestructive ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {isDestructive ? <AlertCircle className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-colors ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-emerald-800 hover:bg-emerald-900'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
