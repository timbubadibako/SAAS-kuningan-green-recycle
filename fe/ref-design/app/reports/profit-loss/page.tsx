'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, Printer, TrendingUp, CheckCircle2 } from 'lucide-react';
import { MOCK_TEAM_PROFIT_METRICS } from '../../../lib/mock-data';

export default function ProfitLossReportPage() {
  const [selectedTeamId, setSelectedTeamId] = useState<string>('ALL');

  const filteredTeams = selectedTeamId === 'ALL'
    ? MOCK_TEAM_PROFIT_METRICS
    : MOCK_TEAM_PROFIT_METRICS.filter((t) => t.teamId.toString() === selectedTeamId);

  const totalOrders = filteredTeams.reduce((acc, curr) => acc + curr.totalOrders, 0);
  const totalGrossRevenue = filteredTeams.reduce((acc, curr) => acc + curr.grossRevenue, 0);
  const totalCogs = filteredTeams.reduce((acc, curr) => acc + curr.totalCogs, 0);
  const totalAdsSpend = filteredTeams.reduce((acc, curr) => acc + curr.totalAdsSpend, 0);
  const totalRtsFee = filteredTeams.reduce((acc, curr) => acc + curr.totalRtsFee, 0);
  const totalEstimatedOngkir = totalOrders * 25000;
  const totalCodFee = (totalGrossRevenue * 3) / 100;
  const netProfit = totalGrossRevenue - (totalCogs + totalAdsSpend + totalEstimatedOngkir + totalCodFee + totalRtsFee);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2 text-slate-900 dark:text-white">
            <span>Laporan Laba Rugi Margin Riil</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit keuangan laba bersih setelah memotong seluruh komponen biaya operasional COD.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl px-3 py-2 font-medium shadow-xs focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">Semua Tim (Konsolidasi 11 Tim)</option>
            {MOCK_TEAM_PROFIT_METRICS.map((t) => (
              <option key={t.teamId} value={t.teamId.toString()}>{t.teamName}</option>
            ))}
          </select>
          <button
            onClick={() => window.print()}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-2"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* P&L Statement Card */}
      <div className="card-theme rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {selectedTeamId === 'ALL' ? 'Laporan Konsolidasi Seluruh Tim' : `Laporan ${filteredTeams[0]?.teamName}`}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Periode: 1 September 2026 – 25 September 2026</p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 px-3 py-1 rounded-xl">
            Laba Bersih: {formatIDR(netProfit)}
          </span>
        </div>

        <div className="p-6 space-y-6 text-xs">
          {/* Revenue */}
          <div>
            <h3 className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[11px] tracking-wider mb-2">
              1. Pendapatan Penjualan (Revenue)
            </h3>
            <div className="space-y-1.5 divide-y divide-slate-200 dark:divide-slate-800/60">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-700 dark:text-slate-300">Gross Closing COD ({totalOrders} paket terkirim)</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">{formatIDR(totalGrossRevenue)}</span>
              </div>
              <div className="flex justify-between py-2.5 font-bold text-slate-900 dark:text-white border-t border-slate-300 dark:border-slate-700">
                <span>Total Pendapatan Kotor</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">{formatIDR(totalGrossRevenue)}</span>
              </div>
            </div>
          </div>

          {/* Cost of Goods Sold */}
          <div>
            <h3 className="font-bold uppercase text-[11px] tracking-wider mb-2 text-slate-500 dark:text-slate-400">
              2. Beban Pokok Penjualan (COGS / HPP)
            </h3>
            <div className="space-y-1.5 divide-y divide-slate-200 dark:divide-slate-800/60">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-700 dark:text-slate-300">Biaya Modal Fisik Produk Terjual</span>
                <span className="font-mono font-medium text-slate-500 dark:text-slate-400">({formatIDR(totalCogs)})</span>
              </div>
              <div className="flex justify-between py-2.5 font-bold text-slate-900 dark:text-white border-t border-slate-300 dark:border-slate-700">
                <span>Laba Kotor (Gross Profit)</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">{formatIDR(totalGrossRevenue - totalCogs)}</span>
              </div>
            </div>
          </div>

          {/* Operating & Advertising Expenses */}
          <div>
            <h3 className="font-bold uppercase text-[11px] tracking-wider mb-2 text-slate-500 dark:text-slate-400">
              3. Beban Iklan & Operasional COD (Opex)
            </h3>
            <div className="space-y-1.5 divide-y divide-slate-200 dark:divide-slate-800/60">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-700 dark:text-slate-300">Total Spend Iklan Digital (Meta & TikTok Ads)</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">({formatIDR(totalAdsSpend)})</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-700 dark:text-slate-300">Estimasi Ongkos Kirim Sukses</span>
                <span className="font-mono text-slate-500 dark:text-slate-400">({formatIDR(totalEstimatedOngkir)})</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-700 dark:text-slate-300">Fee Penanganan COD Ekspedisi (3%)</span>
                <span className="font-mono text-slate-500 dark:text-slate-400">({formatIDR(totalCodFee)})</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-700 dark:text-slate-300">Beban Penalti Paket Retur Hangus (RTS)</span>
                <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">({formatIDR(totalRtsFee)})</span>
              </div>
            </div>
          </div>

          {/* Net Margin Summary Box */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div>
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                Laba Bersih Riil (Net Profit Real Margin)
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                Margin Bersih: <strong className="text-emerald-700 dark:text-emerald-400">{Math.round((netProfit / totalGrossRevenue) * 100)}%</strong> dari Total Gross Closing COD.
              </p>
            </div>
            <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {formatIDR(netProfit)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
