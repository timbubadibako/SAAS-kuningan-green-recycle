'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Zap,
  Sparkles,
  Search,
} from 'lucide-react';
import { MOCK_TEAM_PROFIT_METRICS } from '../lib/mock-data';
import { RevenueTrendChart } from '../components/charts/revenue-trend-chart';
import { MarginDonutChart } from '../components/charts/margin-donut-chart';

export default function DashboardPage() {
  const [teamSearch, setTeamSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<'netProfit' | 'grossRevenue' | 'returnRatePct'>('netProfit');

  const totalSpend = MOCK_TEAM_PROFIT_METRICS.reduce((acc, curr) => acc + curr.totalAdsSpend, 0);
  const totalRevenue = MOCK_TEAM_PROFIT_METRICS.reduce((acc, curr) => acc + curr.grossRevenue, 0);
  const totalNetProfit = MOCK_TEAM_PROFIT_METRICS.reduce((acc, curr) => acc + curr.netProfit, 0);
  const totalOrders = MOCK_TEAM_PROFIT_METRICS.reduce((acc, curr) => acc + curr.totalOrders, 0);
  const avgReturnRate = (
    MOCK_TEAM_PROFIT_METRICS.reduce((acc, curr) => acc + curr.returnRatePct, 0) /
    MOCK_TEAM_PROFIT_METRICS.length
  ).toFixed(1);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  const sortedTeams = [...MOCK_TEAM_PROFIT_METRICS]
    .filter((t) => t.teamName.toLowerCase().includes(teamSearch.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'netProfit') return b.netProfit - a.netProfit;
      if (sortBy === 'grossRevenue') return b.grossRevenue - a.grossRevenue;
      if (sortBy === 'returnRatePct') return a.returnRatePct - b.returnRatePct;
      return 0;
    });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Executive Cockpit & Real Margin</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              Realtime Synced
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Konsolidasi performa keuangan riil 11 Tim Media Buying Qiyar Media (Periode September 2026).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="card-theme px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-2 shadow-xs">
            <span className="text-slate-400 font-medium">Periode:</span>
            <strong className="text-slate-800 dark:text-slate-200">Bulan Berjalan (Sep 2026)</strong>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid with Vibrant High-Contrast Styling & Hover Lift */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spend */}
        <div className="card-theme p-5 rounded-2xl hover:-translate-y-1 transition-all duration-200 cursor-default group">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-semibold">
              <Zap className="w-4 h-4 text-indigo-500" />
              <span>Total Ads Spend</span>
            </span>
            <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono">
              11 TIM
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-3">{formatIDR(totalSpend)}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +8.4%
            </span>
            <span>efisiensi budget mingguan</span>
          </p>
        </div>

        {/* Gross Revenue COD */}
        <div className="card-theme p-5 rounded-2xl hover:-translate-y-1 transition-all duration-200 cursor-default group">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-semibold">
              <ShoppingBag className="w-4 h-4 text-blue-500" />
              <span>Gross Closing COD</span>
            </span>
            <span className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono">
              {totalOrders} PKT
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-3">{formatIDR(totalRevenue)}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">Total omzet kotor pesanan terkirim</p>
        </div>

        {/* Net Profit Riil */}
        <div className="card-theme p-5 rounded-2xl border-emerald-500/40 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white dark:from-emerald-950/60 dark:to-slate-900 dark:text-emerald-400 hover:-translate-y-1 transition-all duration-200 shadow-md shadow-emerald-500/10 cursor-default group">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-100 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4 text-white dark:text-emerald-400" />
              <span>Laba Bersih Riil (Net)</span>
            </span>
            <span className="text-emerald-950 dark:text-emerald-300 bg-emerald-200 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40 px-2 py-0.5 rounded-md text-[10px] font-bold">
              REAL MARGIN
            </span>
          </div>
          <p className="text-2xl font-bold text-white dark:text-emerald-400 font-mono mt-3">{formatIDR(totalNetProfit)}</p>
          <p className="text-[11px] text-emerald-100 dark:text-slate-400 mt-1.5">Setelah potong HPP, Ads, Fee COD & RTS</p>
        </div>

        {/* Return Rate RTS */}
        <div className="card-theme p-5 rounded-2xl hover:-translate-y-1 transition-all duration-200 cursor-default group">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-semibold">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Rasio Retur (RTS)</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                Number(avgReturnRate) > 10
                  ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40'
                  : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {Number(avgReturnRate) > 10 ? 'Perhatian' : 'Optimal (<10%)'}
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-3">{avgReturnRate}%</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">Rasio paket gagal antar seluruh tim</p>
        </div>
      </div>

      {/* Interactive Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 card-theme rounded-2xl overflow-hidden hover:shadow-md transition-all">
          <RevenueTrendChart />
        </div>
        <div className="lg:col-span-5 card-theme rounded-2xl overflow-hidden hover:shadow-md transition-all">
          <MarginDonutChart />
        </div>
      </div>

      {/* Team Comparison Matrix */}
      <div className="card-theme rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-950/40">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Performa Real Margin per Tim Media Buying</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Breakdown HPP, spend iklan, beban retur hangus, dan net profit riil</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama tim..."
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                className="text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-1.5 font-medium text-slate-800 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="netProfit">Sort: Net Profit Tertinggi</option>
              <option value="grossRevenue">Sort: Gross Omzet Tertinggi</option>
              <option value="returnRatePct">Sort: Retur Terendah (Terbaik)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/90 dark:bg-slate-900 text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Nama Tim</th>
                <th className="px-4 py-3.5 text-right">Orders</th>
                <th className="px-4 py-3.5 text-right">Gross COD</th>
                <th className="px-4 py-3.5 text-right">Total COGS (HPP)</th>
                <th className="px-4 py-3.5 text-right">Ads Spend</th>
                <th className="px-4 py-3.5 text-right">Beban Retur (RTS)</th>
                <th className="px-4 py-3.5 text-right font-bold text-slate-900 dark:text-white">Net Profit Riil</th>
                <th className="px-4 py-3.5 text-center">Net Margin</th>
                <th className="px-4 py-3.5 text-center">RTS %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/60">
              {sortedTeams.map((team, idx) => (
                <tr key={team.teamId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white whitespace-nowrap flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 text-[10px] flex items-center justify-center font-mono font-bold border border-slate-300 dark:border-slate-700">
                      #{idx + 1}
                    </span>
                    <span>{team.teamName}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-slate-700 dark:text-slate-300">{team.totalOrders}</td>
                  <td className="px-4 py-3.5 text-right font-mono font-medium text-slate-900 dark:text-slate-200">{formatIDR(team.grossRevenue)}</td>
                  <td className="px-4 py-3.5 text-right font-mono text-slate-600 dark:text-slate-400">{formatIDR(team.totalCogs)}</td>
                  <td className="px-4 py-3.5 text-right font-mono text-indigo-600 dark:text-indigo-400 font-bold">{formatIDR(team.totalAdsSpend)}</td>
                  <td className="px-4 py-3.5 text-right font-mono text-rose-600 dark:text-rose-400 font-bold">{formatIDR(team.totalRtsFee)}</td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatIDR(team.netProfit)}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono">
                      {team.marginPct}%
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                        team.returnRatePct > 10
                          ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {team.returnRatePct}%
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
