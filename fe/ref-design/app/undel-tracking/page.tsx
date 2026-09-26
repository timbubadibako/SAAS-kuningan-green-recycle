'use client';

import React, { useState } from 'react';
import { Truck, AlertTriangle, ShieldCheck, Check, Clock } from 'lucide-react';
import { MOCK_UNDEL_ITEMS } from '../../lib/mock-data';
import { AttemptStatus, UndelItem } from '../../types';
import { useToast } from '../../components/ui/toast';
import { InfoTooltip } from '../../components/ui/info-tooltip';

export default function UndelTrackingPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<UndelItem[]>(MOCK_UNDEL_ITEMS);
  const [activeTab, setActiveTab] = useState<string>('ALL');

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  const handleUpdateStatus = (id: string, newStatus: AttemptStatus, fee: number = 0) => {
    const targetItem = items.find((i) => i.id === id);
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              attemptStatus: newStatus,
              rtsFee: fee,
              lastContactDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
              notes: newStatus === 'RETURNED_RTS' ? 'Paket dinyatakan retur (RTS) dan ongkir dibebankan.' : item.notes,
            }
          : item
      )
    );

    if (newStatus === 'RETURNED_RTS') {
      showToast(`Paket ${targetItem?.orderNumber} ditetapkan Retur (RTS). Penalti ${formatIDR(fee)} dibebankan!`, 'error');
    } else {
      showToast(`Status paket ${targetItem?.orderNumber} diupdate ke ${newStatus.replace('_', ' ')}!`, 'success');
    }
  };

  const filteredItems = items.filter((item) => activeTab === 'ALL' || item.attemptStatus === activeTab);
  const totalRtsLoss = items.reduce((acc, curr) => acc + curr.rtsFee, 0);

  const getStatusBadge = (st: AttemptStatus) => {
    switch (st) {
      case 'ATTEMPT_1':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'ATTEMPT_2':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'ATTEMPT_3':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'HOLD':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'DELIVERED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'RETURNED_RTS':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <span>Undel & Retur (RTS) Logistics Hub</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
            <span>Manajemen paket kurir gagal antar dan perhitungan beban hangus</span>
            <InfoTooltip
              term="RTS (Return To Sender)"
              explanation="Paket COD yang gagal terkirim setelah attempt maksimal. Ekspedisi mengenakan ongkir hangus + biaya retur balik yang memotong laba tim media buying."
            />
            <span>secara otomatis.</span>
          </p>
        </div>
        <div className="card-theme border-rose-500/30 px-4 py-2 rounded-xl flex items-center gap-2.5 shadow-lg">
          <span className="text-xs text-rose-400 font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Total Beban RTS Hangus:</span>
          </span>
          <span className="text-xs font-bold text-rose-300 font-mono">{formatIDR(totalRtsLoss)}</span>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="card-theme p-2 rounded-2xl flex items-center gap-1.5 overflow-x-auto">
        {(
          [
            { key: 'ALL', label: 'Semua Status' },
            { key: 'ATTEMPT_1', label: 'Attempt 1' },
            { key: 'ATTEMPT_2', label: 'Attempt 2' },
            { key: 'ATTEMPT_3', label: 'Attempt 3 (Kritis)' },
            { key: 'HOLD', label: 'Hold Warehouse' },
            { key: 'RETURNED_RTS', label: 'Retur (RTS)' },
          ] as const
        ).map((tab) => {
          const count = tab.key === 'ALL' ? items.length : items.filter((i) => i.attemptStatus === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition-all duration-150 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold shadow-xs'
                  : 'bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  activeTab === tab.key ? 'bg-black/20 text-white dark:text-slate-950 font-extrabold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Undel Cards List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="card-theme rounded-2xl p-12 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
            <p className="text-sm font-medium">📦 Tidak ada paket dengan status {activeTab.replace('_', ' ')}.</p>
            <button
              onClick={() => setActiveTab('ALL')}
              className="text-emerald-600 dark:text-emerald-400 font-semibold underline text-xs cursor-pointer"
            >
              Tampilkan Semua Status
            </button>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="card-theme rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left Info */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-xs text-slate-900 dark:text-white font-mono">{item.orderNumber}</span>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-md font-bold border font-mono ${getStatusBadge(item.attemptStatus)}`}>
                    {item.attemptStatus.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">[{item.expeditionName} - {item.trackingNumber}]</span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-700 dark:text-slate-300">
                  <p>Customer: <strong className="text-slate-900 dark:text-white">{item.customerName}</strong> ({item.customerPhone})</p>
                  <p>Kota: <strong className="text-slate-800 dark:text-slate-200">{item.city}</strong></p>
                  <p>Produk: <strong className="text-slate-800 dark:text-slate-200">{item.productName}</strong></p>
                  <p>Nilai COD: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{formatIDR(item.totalCodAmount)}</strong></p>
                  <p>Tim: <strong className="text-slate-800 dark:text-slate-200">{item.teamName}</strong></p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-2.5 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2 mt-1">
                  <span className="font-semibold text-amber-900 dark:text-amber-400">Kendala Kurir:</span>
                  <span>{item.issueReason}</span>
                </div>

                {item.notes && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">Catatan CS: {item.notes}</p>
                )}
              </div>

              {/* Right Action Buttons */}
              <div className="flex flex-wrap md:flex-col items-end gap-2.5 flex-shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Beban Retur (RTS):</span>
                  <span className={`text-sm font-bold font-mono ${item.rtsFee > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {formatIDR(item.rtsFee)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {item.attemptStatus !== 'DELIVERED' && item.attemptStatus !== 'RETURNED_RTS' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'HOLD', 0)}
                        className="text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30 hover:bg-purple-200 dark:hover:bg-purple-500/20 transition-all cursor-pointer"
                      >
                        Hold
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'ATTEMPT_3', 0)}
                        className="text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-500/30 hover:bg-orange-200 dark:hover:bg-orange-500/20 transition-all cursor-pointer"
                      >
                        Attempt 3
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'RETURNED_RTS', 27500)}
                        className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700 shadow-lg shadow-rose-600/30 transition-all duration-150 cursor-pointer"
                      >
                        Tetapkan RTS (+Fee)
                      </button>
                    </>
                  )}
                  {item.attemptStatus === 'RETURNED_RTS' && (
                    <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/30 px-2.5 py-1 rounded-xl">
                      Sudah Dihitung Beban Retur
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
