'use client';

import React, { useState } from 'react';
import { Plus, Target, DollarSign, Users, Sparkles } from 'lucide-react';
import { MOCK_ADS_SPEND, MOCK_PRODUCTS, MOCK_TEAMS } from '../../lib/mock-data';
import { AdPlatform, AdsSpend } from '../../types';
import { useToast } from '../../components/ui/toast';
import { InfoTooltip } from '../../components/ui/info-tooltip';

export default function AdsSpendPage() {
  const { showToast } = useToast();
  const [spendLogs, setSpendLogs] = useState<AdsSpend[]>(MOCK_ADS_SPEND);
  const [platformFilter, setPlatformFilter] = useState<string>('ALL');
  const [showModal, setShowModal] = useState<boolean>(false);

  const [newSpend, setNewSpend] = useState({
    spendDate: new Date().toISOString().slice(0, 10),
    teamId: 1,
    platform: 'META_ADS' as AdPlatform,
    campaignName: '',
    productId: MOCK_PRODUCTS[0].id,
    amountSpent: 1500000,
    impressions: 45000,
    clicks: 1200,
    leadsCount: 35,
  });

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  const handleAddSpend = (e: React.FormEvent) => {
    e.preventDefault();

    if (newSpend.amountSpent <= 0) {
      showToast('Nominal spend iklan harus lebih dari Rp 0!', 'error');
      return;
    }
    if (!newSpend.campaignName.trim()) {
      showToast('Nama campaign iklan wajib diisi!', 'error');
      return;
    }

    const team = MOCK_TEAMS.find((t) => t.id === Number(newSpend.teamId)) || MOCK_TEAMS[0];
    const product = MOCK_PRODUCTS.find((p) => p.id === newSpend.productId) || MOCK_PRODUCTS[0];
    const cpr = newSpend.leadsCount > 0 ? Math.round(newSpend.amountSpent / newSpend.leadsCount) : newSpend.amountSpent;

    const created: AdsSpend = {
      id: `ads-${Date.now()}`,
      spendDate: newSpend.spendDate,
      teamId: team.id,
      teamName: team.name,
      advertiserName: team.leaderName,
      platform: newSpend.platform,
      campaignName: newSpend.campaignName.trim(),
      productId: product.id,
      productName: product.name,
      amountSpent: Number(newSpend.amountSpent),
      impressions: Number(newSpend.impressions),
      clicks: Number(newSpend.clicks),
      leadsCount: Number(newSpend.leadsCount),
      cpr,
    };

    setSpendLogs([created, ...spendLogs]);
    setShowModal(false);
    showToast(`Log spend campaign ${created.campaignName} berhasil disimpan!`, 'success');

    setNewSpend({
      spendDate: new Date().toISOString().slice(0, 10),
      teamId: 1,
      platform: 'META_ADS',
      campaignName: '',
      productId: MOCK_PRODUCTS[0].id,
      amountSpent: 1500000,
      impressions: 45000,
      clicks: 1200,
      leadsCount: 35,
    });
  };

  const filteredLogs = spendLogs.filter(
    (log) => platformFilter === 'ALL' || log.platform === platformFilter
  );

  const totalSpent = filteredLogs.reduce((acc, curr) => acc + curr.amountSpent, 0);
  const totalLeads = filteredLogs.reduce((acc, curr) => acc + curr.leadsCount, 0);
  const overallCpr = totalLeads > 0 ? Math.round(totalSpent / totalLeads) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Log Spending & CPR Intelligence Hub</h1>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
            <span>Pencatatan spend iklan harian per Tim dengan indikator</span>
            <InfoTooltip
              term="CPR (Cost Per Result)"
              explanation="Biaya iklan yang dikeluarkan dibagi dengan jumlah leads/pesanan closing COD. Tolok ukur utama kesehatan budget advertiser."
            />
            <span>dan deteksi dini campaign boncos.</span>
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-150 self-start sm:self-auto cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Input Log Spend</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-theme p-4.5 rounded-2xl">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Total Filtered Spend</span>
          </span>
          <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-2">{formatIDR(totalSpent)}</p>
        </div>
        <div className="card-theme p-4.5 rounded-2xl">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Total Closing Leads</span>
          </span>
          <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-2">{totalLeads} Closing</p>
        </div>
        <div className="card-theme p-4.5 rounded-2xl border-indigo-200 dark:border-indigo-500/30">
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Rata-Rata CPR Aktual</span>
          </span>
          <p className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-2">{formatIDR(overallCpr)} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ lead</span></p>
        </div>
      </div>

      {/* Platform Filter */}
      <div className="card-theme p-3.5 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Platform:</span>
          {(['ALL', 'META_ADS', 'TIKTOK_ADS'] as const).map((plt) => (
            <button
              key={plt}
              onClick={() => setPlatformFilter(plt)}
              className={`text-xs px-3 py-1 rounded-xl font-medium transition-all duration-150 cursor-pointer ${
                platformFilter === plt
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white font-bold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700/60'
              }`}
            >
              {plt === 'ALL' ? 'Semua Platform' : plt.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card-theme rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-900/80 text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Tanggal</th>
                <th className="px-4 py-3.5">Tim & Advertiser</th>
                <th className="px-4 py-3.5">Platform & Campaign</th>
                <th className="px-4 py-3.5">Produk</th>
                <th className="px-4 py-3.5 text-right">Spend Harian</th>
                <th className="px-4 py-3.5 text-right">Leads Closing</th>
                <th className="px-4 py-3.5 text-right">CPR (Cost / Result)</th>
                <th className="px-4 py-3.5 text-center">Status CPR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {filteredLogs.map((log) => {
                const isCprHigh = log.cpr > 50000;
                return (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-slate-500 dark:text-slate-400">{log.spendDate}</td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-slate-900 dark:text-white">{log.teamName}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{log.advertiserName}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-slate-700 mr-1.5 font-mono">
                        {log.platform.replace('_', ' ')}
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{log.campaignName}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300">{log.productName}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900 dark:text-white font-mono">{formatIDR(log.amountSpent)}</td>
                    <td className="px-4 py-3.5 text-right font-semibold text-slate-800 dark:text-slate-200 font-mono">{log.leadsCount}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-indigo-600 dark:text-indigo-400 font-mono">{formatIDR(log.cpr)}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border font-mono ${
                          isCprHigh
                            ? 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/30'
                            : 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30'
                        }`}
                      >
                        {isCprHigh ? 'CPR Boros (>50k)' : 'Safe CPR'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Input Spend */}
      {showModal && (
        <div className="modal-overlay">
          <div className="card-theme rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Input Log Ads Spend Harian</span>
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleAddSpend} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal Spend</label>
                  <input
                    type="date"
                    required
                    value={newSpend.spendDate}
                    onChange={(e) => setNewSpend({ ...newSpend, spendDate: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Tim Media Buying</label>
                  <select
                    value={newSpend.teamId}
                    onChange={(e) => setNewSpend({ ...newSpend, teamId: Number(e.target.value) })}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  >
                    {MOCK_TEAMS.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Platform Iklan</label>
                  <select
                    value={newSpend.platform}
                    onChange={(e) => setNewSpend({ ...newSpend, platform: e.target.value as AdPlatform })}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="META_ADS">Meta Ads (FB/IG)</option>
                    <option value="TIKTOK_ADS">TikTok Ads</option>
                    <option value="GOOGLE_ADS">Google Ads</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Pilih Produk</label>
                  <select
                    value={newSpend.productId}
                    onChange={(e) => setNewSpend({ ...newSpend, productId: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  >
                    {MOCK_PRODUCTS.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Campaign Iklan</label>
                <input
                  required
                  type="text"
                  value={newSpend.campaignName}
                  onChange={(e) => setNewSpend({ ...newSpend, campaignName: e.target.value })}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="Contoh: Luban_ScaleUp_Jabar_Adv01"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Nominal Spend (Rp)</label>
                  <input
                    type="number"
                    required
                    min="10000"
                    value={newSpend.amountSpent}
                    onChange={(e) => setNewSpend({ ...newSpend, amountSpent: Number(e.target.value) })}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Jumlah Closing Leads</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newSpend.leadsCount}
                    onChange={(e) => setNewSpend({ ...newSpend, leadsCount: Number(e.target.value) })}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  Simpan Log Spend
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
