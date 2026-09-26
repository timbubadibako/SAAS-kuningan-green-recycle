'use client';

import React, { useState } from 'react';
import { PieChart } from 'lucide-react';

interface CostSlice {
  label: string;
  amount: number;
  percentage: number;
  color: string;
  description: string;
}

const SLICES: CostSlice[] = [
  { label: 'Laba Bersih Riil (Net)', amount: 107664500, percentage: 58.5, color: '#10b981', description: 'Laba bersih setelah seluruh biaya operasional COD' },
  { label: 'Ads Spend Digital', amount: 43400000, percentage: 23.6, color: '#6366f1', description: 'Biaya iklan Meta Ads & TikTok Ads 11 Tim' },
  { label: 'HPP / COGS Produk', amount: 28000000, percentage: 15.2, color: '#f59e0b', description: 'Modal dasar manufaktur produk herbal fisik' },
  { label: 'Beban Retur (RTS Fee)', amount: 2378500, percentage: 1.3, color: '#f43f5e', description: 'Penalti ongkos kirim hangus akibat paket gagal COD' },
  { label: 'Handling Fee COD', amount: 2600000, percentage: 1.4, color: '#8b5cf6', description: 'Fee 3% penanganan COD dari mitra kurir' },
];

export function MarginDonutChart() {
  const [selectedSlice, setSelectedSlice] = useState<CostSlice>(SLICES[0]);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="p-5 space-y-4 flex flex-col justify-between">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <PieChart className="w-4 h-4 text-indigo-500" />
          <span>Alokasi Struktur Biaya COD (Real Breakdown)</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Pilih segmen untuk melihat beban riil omzet COD</p>
      </div>

      <div className="space-y-4">
        {/* Visual Progress Segments Bar */}
        <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden flex shadow-inner border border-slate-200 dark:border-slate-800">
          {SLICES.map((slice) => (
            <div
              key={slice.label}
              onMouseEnter={() => setSelectedSlice(slice)}
              onClick={() => setSelectedSlice(slice)}
              style={{
                width: `${slice.percentage}%`,
                backgroundColor: slice.color,
              }}
              className="h-full transition-all duration-200 cursor-pointer hover:opacity-80"
              title={`${slice.label}: ${slice.percentage}%`}
            />
          ))}
        </div>

        {/* Dynamic Detail Card */}
        <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedSlice.color }} />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{selectedSlice.label}</h4>
            </div>
            <span className="font-mono text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {selectedSlice.percentage}% Porsi
            </span>
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 dark:text-white">
            {formatIDR(selectedSlice.amount)}
          </p>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800/60 leading-relaxed">
            {selectedSlice.description}
          </p>
        </div>

        {/* Small Badges List */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          {SLICES.map((slice) => {
            const isSelected = selectedSlice.label === slice.label;
            return (
              <button
                key={slice.label}
                onMouseEnter={() => setSelectedSlice(slice)}
                onClick={() => setSelectedSlice(slice)}
                className={`text-left p-2 rounded-lg text-[11px] transition-all duration-150 cursor-pointer border ${
                  isSelected
                    ? 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold shadow-xs'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: slice.color }} />
                  <span className="truncate">{slice.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
