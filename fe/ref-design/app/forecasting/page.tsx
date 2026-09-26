'use client';

import React from 'react';
import { Zap, AlertTriangle, TrendingUp, Sparkles } from 'lucide-react';

interface WarningItem {
  id: string;
  team: string;
  campaign: string;
  platform: string;
  currentCpr: number;
  safeCpr: number;
  severity: 'CRITICAL' | 'WARNING';
  reason: string;
  recommendation: string;
}

const WARNING_ITEMS: WarningItem[] = [
  {
    id: 'w-01',
    team: 'Tim 2 (Sumatera Direct)',
    campaign: 'Luban_Sumatera_AdvPlus_01',
    platform: 'Meta Ads',
    currentCpr: 57894,
    safeCpr: 45000,
    severity: 'CRITICAL',
    reason: 'CPR melebihi ambang batas aman sebesar +28.6% & retur wilayah Aceh-Sumut mencapai 14.2%.',
    recommendation: 'Matikan adset broad, persempit ke kota tier-1, atau turunkan budget harian 50%.',
  },
  {
    id: 'w-02',
    team: 'Tim 8 (East Indonesia)',
    campaign: 'MaduHitam_EastExpansion_02',
    platform: 'TikTok Ads',
    currentCpr: 52000,
    safeCpr: 42000,
    severity: 'WARNING',
    reason: 'Ongkos kirim ke NTT/Maluku tinggi (>Rp 45k/pkt) menekan margin bersih hingga <30k.',
    recommendation: 'Terapkan minimal order 2 botol (bundle) atau nonaktifkan target provinsi remote.',
  },
];

const FORECAST_DAYS = [
  { day: 'Besok (H+1)', projectedSpend: 6200000, projectedOrders: 145, projectedNetProfit: 3850000, riskStatus: 'LOW' },
  { day: 'H+2', projectedSpend: 6400000, projectedOrders: 148, projectedNetProfit: 3920000, riskStatus: 'LOW' },
  { day: 'H+3 (Weekend)', projectedSpend: 8100000, projectedOrders: 190, projectedNetProfit: 4750000, riskStatus: 'MEDIUM' },
  { day: 'H+4 (Weekend)', projectedSpend: 8500000, projectedOrders: 205, projectedNetProfit: 5120000, riskStatus: 'MEDIUM' },
  { day: 'H+5', projectedSpend: 6000000, projectedOrders: 140, projectedNetProfit: 3700000, riskStatus: 'LOW' },
  { day: 'H+6', projectedSpend: 6100000, projectedOrders: 142, projectedNetProfit: 3780000, riskStatus: 'LOW' },
  { day: 'H+7', projectedSpend: 6300000, projectedOrders: 146, projectedNetProfit: 3890000, riskStatus: 'LOW' },
];

export default function ForecastingPage() {
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <span>AI Forecasting & Budget Leakage Alarm</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            SARIMAX + LightGBM
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Deteksi dini kebocoran anggaran iklan (*budget leakage*) dan proyeksi spend & profit 7 hari ke depan.
        </p>
      </div>

      {/* Early Warning Alarms */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
          <span>Early Warning Campaign Boncos</span>
          <span className="text-xs bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 font-bold px-2.5 py-0.5 rounded-full font-mono">
            {WARNING_ITEMS.length} Campaign Tindakan Cepat
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {WARNING_ITEMS.map((warn) => (
            <div
              key={warn.id}
              className={`card-theme rounded-2xl p-5 space-y-3 shadow-lg ${
                warn.severity === 'CRITICAL'
                  ? 'border-rose-300 dark:border-rose-500/40 bg-rose-50/50 dark:bg-rose-950/20'
                  : 'border-amber-300 dark:border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg ${
                    warn.severity === 'CRITICAL' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-slate-950'
                  }`}>
                    {warn.severity}
                  </span>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-2">{warn.campaign}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{warn.team} • {warn.platform}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">CPR Aktual vs Batas:</span>
                  <span className="text-xs font-bold font-mono text-rose-600 dark:text-rose-400">
                    {formatIDR(warn.currentCpr)} <span className="text-slate-400 font-normal">/ {formatIDR(warn.safeCpr)}</span>
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed">
                <strong className="text-slate-900 dark:text-white">Penyebab:</strong> {warn.reason}
              </div>

              <div className="text-xs text-slate-800 dark:text-slate-200 bg-indigo-50/70 dark:bg-slate-900/90 p-3 rounded-xl border border-indigo-100 dark:border-slate-800 leading-relaxed">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block text-[11px] mb-0.5">Rekomendasi Tindakan:</span>
                <span>{warn.recommendation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Forecast Table */}
      <div className="card-theme rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Proyeksi Model AI (7 Hari ke Depan)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Estimasi spend, closing volume, dan net profit riil berbasis tren historis</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-300 dark:border-emerald-500/30 font-mono">
            Model: Ensemble LightGBM
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-900/80 text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Hari Proyeksi</th>
                <th className="px-4 py-3.5 text-right">Proyeksi Ads Spend</th>
                <th className="px-4 py-3.5 text-right">Estimasi Closing COD</th>
                <th className="px-4 py-3.5 text-right font-bold text-slate-900 dark:text-white">Proyeksi Net Profit</th>
                <th className="px-4 py-3.5 text-center">Status Risiko</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {FORECAST_DAYS.map((fc, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">{fc.day}</td>
                  <td className="px-4 py-3.5 text-right font-mono text-indigo-600 dark:text-indigo-400 font-medium">{formatIDR(fc.projectedSpend)}</td>
                  <td className="px-4 py-3.5 text-right font-mono text-slate-700 dark:text-slate-200">{fc.projectedOrders} Paket</td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatIDR(fc.projectedNetProfit)}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono ${
                      fc.riskStatus === 'LOW'
                        ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20'
                        : 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/20'
                    }`}>
                      {fc.riskStatus === 'LOW' ? 'Normal / Aman' : 'Weekend Spike'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
