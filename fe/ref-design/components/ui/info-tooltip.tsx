'use client';

import React, { useState } from 'react';

interface InfoTooltipProps {
  term: string;
  explanation: string;
  children?: React.ReactNode;
}

export function InfoTooltip({ term, explanation, children }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center group">
      <span
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-help inline-flex items-center gap-1 border-b border-dotted border-slate-400 hover:border-slate-800 transition-colors"
      >
        {children || term}
        <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold inline-flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-colors">
          ?
        </span>
      </span>

      {isOpen && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 p-2.5 bg-slate-950 text-slate-100 text-[11px] rounded-lg shadow-xl border border-slate-800 pointer-events-none transition-all duration-150 animate-in fade-in">
          <strong className="block text-emerald-400 font-semibold mb-0.5">{term}</strong>
          <span className="text-slate-300 leading-relaxed">{explanation}</span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-950" />
        </span>
      )}
    </span>
  );
}
