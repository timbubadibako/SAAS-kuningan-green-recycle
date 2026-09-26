'use client';

import React, { useState } from 'react';
import { Calculator, Sparkles, AlertCircle } from 'lucide-react';
import { MOCK_PRODUCTS } from '../../lib/mock-data';

export default function BudgetCalculatorPage() {
  const [selectedProductId, setSelectedProductId] = useState<string>(MOCK_PRODUCTS[0].id);
  const [retailPrice, setRetailPrice] = useState<number>(185000);
  const [cogsPrice, setCogsPrice] = useState<number>(28000);
  const [targetNetMargin, setTargetNetMargin] = useState<number>(80000);
  const [estimatedOngkir, setEstimatedOngkir] = useState<number>(25000);
  const [estimatedReturnRatePct, setEstimatedReturnRatePct] = useState<number>(10);
  const [codFeePct, setCodFeePct] = useState<number>(3);

  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = MOCK_PRODUCTS.find((p) => p.id === prodId);
    if (prod) {
      setRetailPrice(prod.retailPrice);
      setCogsPrice(prod.cogsPrice);
    }
  };

  const codFeeAmount = (retailPrice * codFeePct) / 100;
  const returnRateDecimal = estimatedReturnRatePct / 100;
  const rtsCostPerOrder = returnRateDecimal * (estimatedOngkir + 15000);
  const grossMargin = retailPrice - cogsPrice - codFeeAmount - estimatedOngkir;
  const breakEvenCpr = Math.max(0, Math.round(grossMargin - rtsCostPerOrder));
  const maxSafeCpr = Math.max(0, Math.round(breakEvenCpr - targetNetMargin));

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  const getStatus = () => {
    if (maxSafeCpr > 45000) return { label: 'HEALTHY / AMAN', color: 'bg-emerald-500 text-slate-950 font-bold', barColor: 'from-emerald-500 to-emerald-400' };
    if (maxSafeCpr > 25000) return { label: 'MODERATE / WASPADA', color: 'bg-amber-500 text-slate-950 font-bold', barColor: 'from-amber-500 to-amber-400' };
    return { label: 'TIGHT / KRITIS', color: 'bg-rose-500 text-white font-bold', barColor: 'from-rose-500 to-rose-400' };
  };

  const status = getStatus();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <span>Kalkulator Safe CPR & Simulasi Toleransi</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            Algoritma D2C
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Simulasi batas maksimal biaya per closing (CPR) sebelum advertiser menyalakan iklan, memperhitungkan risiko retur & fee COD.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form with Interactive Sliders */}
        <div className="lg:col-span-7 card-theme rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Slider Parameter Finansial Produk</span>
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Preset:</span>
              <select
                value={selectedProductId}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-2.5 py-1 font-medium focus:ring-1 focus:ring-emerald-500"
              >
                {MOCK_PRODUCTS.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Target Net Margin Slider */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-2.5">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-slate-800 dark:text-slate-200">Target Net Margin Laba Bersih:</label>
                <span className="font-mono font-bold text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-500/20">
                  {formatIDR(targetNetMargin)}
                </span>
              </div>
              <input
                type="range"
                min="20000"
                max="120000"
                step="5000"
                value={targetNetMargin}
                onChange={(e) => setTargetNetMargin(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex gap-1.5 pt-1">
                {[100000, 80000, 50000, 30000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setTargetNetMargin(preset)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      targetNetMargin === preset
                        ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700/60'
                    }`}
                  >
                    {preset / 1000}k
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated Return RTS Rate Slider */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-2.5">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-slate-800 dark:text-slate-200">Estimasi Rasio Retur (RTS %):</label>
                <span className={`font-mono font-bold text-sm px-2.5 py-0.5 rounded-lg border ${
                  estimatedReturnRatePct > 10
                    ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-500/40'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                }`}>
                  {estimatedReturnRatePct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={estimatedReturnRatePct}
                onChange={(e) => setEstimatedReturnRatePct(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Geser untuk mensimulasikan dampak lonjakan retur pada batas aman CPR.</p>
            </div>

            {/* Numeric Inputs */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Harga Jual Retail COD</label>
                <input
                  type="number"
                  value={retailPrice}
                  onChange={(e) => setRetailPrice(Number(e.target.value))}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-3 py-2 font-mono font-semibold"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">HPP Modal Produk</label>
                <input
                  type="number"
                  value={cogsPrice}
                  onChange={(e) => setCogsPrice(Number(e.target.value))}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-3 py-2 font-mono font-semibold"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Estimasi Ongkir</label>
                <input
                  type="number"
                  value={estimatedOngkir}
                  onChange={(e) => setEstimatedOngkir(Number(e.target.value))}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-3 py-2 font-mono font-semibold"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Fee COD Ekspedisi (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={codFeePct}
                  onChange={(e) => setCodFeePct(Number(e.target.value))}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-3 py-2 font-mono font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Output Results with Visual Meter */}
        <div className="lg:col-span-5 card-theme rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between border-emerald-500/30">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Live Health Gauge</span>
              <span className={`text-[10px] px-2.5 py-1 rounded-lg ${status.color}`}>
                {status.label}
              </span>
            </div>

            {/* Big CPR Meter */}
            <div className="bg-slate-50 dark:bg-slate-950/80 rounded-2xl p-5 mt-4 border border-slate-200 dark:border-slate-800 space-y-3 shadow-inner">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block font-mono">
                Batas Maksimal Safe CPR (Cost Per Result)
              </span>
              <p className="text-3xl font-bold text-slate-900 dark:text-white font-mono">
                {formatIDR(maxSafeCpr)}
              </p>

              {/* Visual Health Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, (maxSafeCpr / 60000) * 100)}%` }}
                    className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 transition-all duration-300 shadow-sm"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>0k (Kritis)</span>
                  <span>30k (Waspada)</span>
                  <span>50k+ (Super Aman)</span>
                </div>
              </div>
            </div>

            {/* Breakdown List */}
            <div className="space-y-2 mt-4 text-xs divide-y divide-slate-200 dark:divide-slate-800/80">
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-600 dark:text-slate-400">Break-Even CPR (Titik Impas):</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{formatIDR(breakEvenCpr)}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-600 dark:text-slate-400">Gross Margin Kotor:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{formatIDR(grossMargin)}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-600 dark:text-slate-400">Potongan Fee COD ({codFeePct}%):</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{formatIDR(codFeeAmount)}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-600 dark:text-slate-400">Beban Potensi Retur RTS:</span>
                <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">{formatIDR(rtsCostPerOrder)}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-[11px] text-slate-700 dark:text-slate-300">
            <strong>Panduan Action Media Buyer:</strong> Jika CPR kampanye iklan naik melebihi{' '}
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatIDR(maxSafeCpr)}</span>, segera matikan adset atau optimasi hook video untuk mencegah profit boncos!
          </div>
        </div>
      </div>
    </div>
  );
}
