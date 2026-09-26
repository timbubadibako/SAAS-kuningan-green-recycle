'use client';

import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';

interface DataPoint {
  label: string;
  spend: number;
  revenue: number;
  netProfit: number;
}

const DEFAULT_DATA: DataPoint[] = [
  { label: 'Tim 1', spend: 5700000, revenue: 26270000, netProfit: 16429000 },
  { label: 'Tim 2', spend: 5400000, revenue: 18130000, netProfit: 9573500 },
  { label: 'Tim 3', spend: 4200000, revenue: 14060000, netProfit: 7402000 },
  { label: 'Tim 4', spend: 4800000, revenue: 22885000, netProfit: 13840000 },
  { label: 'Tim 5', spend: 3800000, revenue: 14520000, netProfit: 8674000 },
  { label: 'Tim 6', spend: 5100000, revenue: 24050000, netProfit: 15117500 },
  { label: 'Tim 7', spend: 4600000, revenue: 19240000, netProfit: 11453000 },
  { label: 'Tim 8', spend: 3100000, revenue: 9990000, netProfit: 4993000 },
  { label: 'Tim 9', spend: 2100000, revenue: 11470000, netProfit: 7551500 },
  { label: 'Tim 10', spend: 2600000, revenue: 8880000, netProfit: 4798500 },
  { label: 'Tim 11', spend: 2900000, revenue: 12950000, netProfit: 7925000 },
];

export function RevenueTrendChart() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [activeMetric, setActiveMetric] = useState<'all' | 'netOnly'>('all');

  const maxVal = 28000000;
  const chartHeight = 180;

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            <span>Perbandingan Spend vs Net Profit Antar Tim</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Arahkan kursor pada bar untuk melihat detail performa</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveMetric('all')}
            className={`px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer ${
              activeMetric === 'all'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Semua Metrik
          </button>
          <button
            onClick={() => setActiveMetric('netOnly')}
            className={`px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer ${
              activeMetric === 'netOnly'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Fokus Net Margin
          </button>
        </div>
      </div>

      {/* Interactive Chart Container */}
      <div className="relative pt-6">
        {/* Tooltip Overlay */}
        {hoveredIdx !== null && (
          <div
            className="absolute -top-4 z-30 bg-slate-950 text-white rounded-xl p-3 text-xs shadow-2xl pointer-events-none transition-all duration-150 transform -translate-x-1/2 border border-slate-700/80 ring-1 ring-emerald-500/30 backdrop-blur-md"
            style={{
              left: `${((hoveredIdx + 0.5) / DEFAULT_DATA.length) * 100}%`,
            }}
          >
            <p className="font-bold text-emerald-400 border-b border-slate-800 pb-1 mb-1.5 font-mono">
              {DEFAULT_DATA[hoveredIdx].label}
            </p>
            <div className="space-y-1 text-[11px]">
              <p className="flex justify-between gap-4 text-slate-400">
                <span>Gross COD:</span>
                <span className="font-mono font-semibold text-slate-200">
                  {formatIDR(DEFAULT_DATA[hoveredIdx].revenue)}
                </span>
              </p>
              <p className="flex justify-between gap-4 text-indigo-400">
                <span>Ads Spend:</span>
                <span className="font-mono font-semibold text-indigo-300">
                  {formatIDR(DEFAULT_DATA[hoveredIdx].spend)}
                </span>
              </p>
              <p className="flex justify-between gap-4 text-emerald-400 font-bold">
                <span>Net Profit:</span>
                <span className="font-mono text-emerald-300">
                  {formatIDR(DEFAULT_DATA[hoveredIdx].netProfit)}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Bar Visualizer */}
        <div className="flex items-end justify-between gap-2 h-48 border-b border-slate-200 dark:border-slate-800 pb-2 px-2">
          {DEFAULT_DATA.map((item, idx) => {
            const revHeight = (item.revenue / maxVal) * chartHeight;
            const netHeight = (item.netProfit / maxVal) * chartHeight;
            const spendHeight = (item.spend / maxVal) * chartHeight;
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={item.label}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer relative"
              >
                <div className="w-full flex items-end justify-center gap-1 px-0.5 h-full">
                  {activeMetric === 'all' && (
                    <div
                      style={{ height: `${revHeight}px` }}
                      className={`w-full max-w-[12px] rounded-t transition-all duration-200 ${
                        isHovered ? 'bg-slate-400' : 'bg-slate-300 dark:bg-slate-700/80 group-hover:bg-slate-400'
                      }`}
                    />
                  )}
                  <div
                    style={{ height: `${spendHeight}px` }}
                    className={`w-full max-w-[12px] rounded-t transition-all duration-200 ${
                      isHovered ? 'bg-indigo-600 shadow-md shadow-indigo-500/50' : 'bg-indigo-500/80 group-hover:bg-indigo-600'
                    }`}
                  />
                  <div
                    style={{ height: `${netHeight}px` }}
                    className={`w-full max-w-[12px] rounded-t transition-all duration-200 ${
                      isHovered
                        ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50 ring-1 ring-emerald-300'
                        : 'bg-emerald-500/80 group-hover:bg-emerald-500'
                    }`}
                  />
                </div>
                <span
                  className={`text-[10px] mt-2 font-mono transition-colors ${
                    isHovered ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  {item.label.replace('Tim ', 'T')}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-600 dark:text-slate-400">
          {activeMetric === 'all' && (
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-slate-300 dark:bg-slate-600" />
              <span>Gross COD</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-indigo-500" />
            <span>Ads Spend Harian</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-emerald-500 shadow-xs shadow-emerald-500/50" />
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Net Profit Riil</span>
          </div>
        </div>
      </div>
    </div>
  );
}
