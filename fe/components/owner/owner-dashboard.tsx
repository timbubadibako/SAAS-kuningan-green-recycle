'use client';

import React from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Lock,
  FileSpreadsheet,
  AlertTriangle,
} from 'lucide-react';
import {
  UserRole,
  ScaleTransaction,
  FactorySale,
  OpexExpense,
  AttendanceRecord,
  EmployeeLoan,
  Product,
} from '../../types';
import { exportEnterpriseReportExcel } from '../../lib/export/excel-generator';

interface OwnerDashboardProps {
  activeRole: UserRole;
  transactions: ScaleTransaction[];
  factorySales: FactorySale[];
  opexList: OpexExpense[];
  attendances: AttendanceRecord[];
  loans: EmployeeLoan[];
  products: Product[];
  onApproveJumboTransaction: (txId: string) => void;
  onUpdateMarketBenchmark: (prodId: string, newBenchmark: number) => void;
}

export function OwnerDashboard({
  activeRole,
  transactions,
  factorySales,
  opexList,
  attendances,
  loans,
  products,
  onApproveJumboTransaction,
  onUpdateMarketBenchmark,
}: OwnerDashboardProps) {
  if (activeRole !== 'OWNER') {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-12 text-center text-red-800 font-sans">
        <Lock className="h-10 w-10 text-red-600 mb-3" />
        <h3 className="text-base font-extrabold">AKSES TERKUNCI</h3>
        <p className="mt-1 max-w-md text-xs text-red-600">
          Role ADMIN tidak memiliki izin untuk melihat Laporan Laba/Rugi, Total Kas Perusahaan, dan Ekspor Finansial.
        </p>
      </div>
    );
  }

  // Perhitungan Keuangan Konsolidasi
  const totalPurchaseExpenses = transactions.reduce((acc, t) => acc + t.totalAmount, 0);
  const totalSalesRevenue = factorySales.reduce((acc, s) => acc + s.totalRevenue, 0);
  const totalOpexExpenses = opexList.reduce((acc, o) => acc + o.amount, 0);
  const estimatedGrossProfit = totalSalesRevenue - totalPurchaseExpenses;
  const estimatedNetProfit = estimatedGrossProfit - totalOpexExpenses;
  const marginPct = totalSalesRevenue > 0 ? ((estimatedGrossProfit / totalSalesRevenue) * 100).toFixed(1) : '0';

  const pendingJumboTransactions = transactions.filter(
    (t) => t.requiresOwnerApproval && !t.isApprovedByOwner
  );

  const handleExportFullExcel = () => {
    exportEnterpriseReportExcel(
      {
        attendances,
        loans,
        purchases: transactions,
        factorySales,
        opex: opexList,
        isOwner: true,
      },
      'REKAP_EKSEKUTIF_PT_DAVID_5_SHEET'
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Owner */}
      <div className="flex flex-col gap-2 rounded-2xl border border-amber-600/40 bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 p-6 shadow-md text-white md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-amber-400" />
            <h2 className="text-lg font-black tracking-tight text-white">
              DASHBOARD LABA / RUGI & KAS GLOBAL (<span className="text-amber-400">OWNER</span>)
            </h2>
          </div>
          <p className="mt-1 text-xs text-emerald-200/90 font-medium">
            Green Cycle Kuningan: Konsolidasi 4 gudang, margin keuntungan riil, penjualan peleburan & approval transaksi jumbo.
          </p>
        </div>

        <button
          onClick={handleExportFullExcel}
          className="flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-2.5 text-xs font-black text-white shadow-md transition-all"
        >
          <FileSpreadsheet className="h-4 w-4 text-emerald-200" />
          Ekspor Excel 5-Sheet Lengkap (.xlsx)
        </button>
      </div>

      {/* Financial Metrics Cards - Daylight Theme */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Penjualan Stok (Omzet)</div>
          <div className="mt-2 font-numeric text-2xl font-black text-emerald-800">
            Rp{totalSalesRevenue.toLocaleString('id-ID')}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Peleburan & Pembeli Biasa</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Belanja Timbangan (4 Gudang)</div>
          <div className="mt-2 font-numeric text-2xl font-black text-red-600">
            Rp{totalPurchaseExpenses.toLocaleString('id-ID')}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-medium">
            Dari {transactions.length} transaksi nota
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Biaya Operasional (OPEX)</div>
          <div className="mt-2 font-numeric text-2xl font-black text-amber-700">
            Rp{totalOpexExpenses.toLocaleString('id-ID')}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-medium">
            Solar truk, karung, servis
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimasi Laba Bersih (Net Profit)</div>
          <div className="mt-2 font-numeric text-2xl font-black text-emerald-900">
            Rp{estimatedNetProfit.toLocaleString('id-ID')}
          </div>
          <div className="mt-1 text-[11px] text-slate-700 font-bold">
            Margin: ~{marginPct}%
          </div>
        </div>
      </div>

      {/* Approval Transaksi Jumbo */}
      <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-amber-200 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-700" />
            <h3 className="text-sm font-extrabold text-slate-900">
              APPROVAL TRANSAKSI JUMBO (&gt; Rp 10.000.000)
            </h3>
          </div>
          <span className="rounded-lg bg-amber-200 px-2.5 py-1 text-xs font-black text-amber-900 border border-amber-300">
            {pendingJumboTransactions.length} Menunggu Persetujuan
          </span>
        </div>

        <div className="mt-3 space-y-2">
          {pendingJumboTransactions.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-500 font-medium">
              Tidak ada nota timbangan jumbo yang pending. Semua transaksi di bawah limit aman.
            </div>
          ) : (
            pendingJumboTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-300 bg-white p-3.5 text-xs shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{tx.invoiceNumber}</span>
                    <span className="text-slate-600">• Gudang {tx.warehouseId} • {tx.sellerName}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    Total Nilai: <span className="font-numeric font-black text-sm text-amber-700">Rp{tx.totalAmount.toLocaleString('id-ID')}</span> • {tx.items.length} Komoditas
                  </div>
                </div>

                <button
                  onClick={() => onApproveJumboTransaction(tx.id)}
                  className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-extrabold text-white hover:bg-emerald-900 shadow-xs"
                >
                  Approve Transaksi Jumbo (PIN Owner)
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Smart Price Fluctuation (Patokan Pasar & Proteksi Margin) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-extrabold text-slate-900 mb-1">
          Smart Price Fluctuation: Patokan Harga Pasar & Proteksi Margin
        </h3>
        <p className="text-xs text-slate-500 font-medium mb-4">
          Owner dapat memantau spread margin keuntungan antara harga beli di timbangan vs patokan harga pasar.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const marginSpread = p.marketPriceBenchmark - p.priceRegular;
            return (
              <div
                key={p.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs space-y-1.5"
              >
                <div className="font-extrabold text-slate-900">{p.name}</div>
                <div className="text-[11px] text-slate-600 flex justify-between font-numeric">
                  <span>Beli Langganan:</span>
                  <span className="font-bold text-slate-800">Rp{p.pricePartner.toLocaleString('id-ID')}/kg</span>
                </div>
                <div className="text-[11px] text-slate-600 flex justify-between font-numeric">
                  <span>Beli Eceran:</span>
                  <span className="font-bold text-slate-800">Rp{p.priceRegular.toLocaleString('id-ID')}/kg</span>
                </div>
                <div className="text-[11px] text-emerald-800 flex justify-between border-t border-slate-200 pt-1 font-numeric">
                  <span className="font-bold">Benchmark Pasar:</span>
                  <span className="font-black">Rp{p.marketPriceBenchmark.toLocaleString('id-ID')}/kg</span>
                </div>
                <div className="text-[10px] text-slate-500 font-numeric font-medium">
                  Estimasi Spread: +Rp{marginSpread.toLocaleString('id-ID')}/kg
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabel Audit Real-Time Pembelian */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-extrabold text-slate-900 mb-3">
          Audit Real-Time Pembelian Timbangan 4 Gudang
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-2.5">No. Nota</th>
                <th className="py-2.5">Gudang</th>
                <th className="py-2.5">Penjual</th>
                <th className="py-2.5">Item</th>
                <th className="py-2.5">Total Nilai</th>
                <th className="py-2.5">Status Approval</th>
                <th className="py-2.5">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-numeric">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50">
                  <td className="py-3 font-mono font-bold text-slate-900">{tx.invoiceNumber}</td>
                  <td className="py-3 font-sans font-medium">Gudang {tx.warehouseId}</td>
                  <td className="py-3 font-sans font-semibold text-slate-900">{tx.sellerName}</td>
                  <td className="py-3 text-slate-500">{tx.items.length} Barang</td>
                  <td className="py-3 font-black text-amber-700">
                    Rp{tx.totalAmount.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3">
                    {tx.requiresOwnerApproval ? (
                      tx.isApprovedByOwner ? (
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          APPROVED
                        </span>
                      ) : (
                        <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                          PENDING
                        </span>
                      )
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">NORMAL</span>
                    )}
                  </td>
                  <td className="py-3 text-slate-400 font-sans">
                    {new Date(tx.createdAt).toLocaleTimeString('id-ID')} WIB
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
