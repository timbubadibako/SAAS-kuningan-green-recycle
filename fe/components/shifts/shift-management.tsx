'use client';

import React, { useState } from 'react';
import {
  Clock,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle,
  AlertTriangle,
  BadgeDollarSign,
  Banknote,
  Scale,
} from 'lucide-react';
import { CashShift, UserRole } from '../../types';

interface ShiftManagementProps {
  activeRole: UserRole;
  warehouseId: number;
  warehouseName: string;
  activeShift: CashShift | null;
  onOpenShift: (initialCash: number, notes: string) => void;
  onCloseShift: (actualClosingCash: number, notes: string) => void;
  totalExpenseToday: number; // Kas keluar belanja timbangan
  totalCashInSalesToday: number; // Kas masuk dari penjualan tunai di laci
}

export function ShiftManagement({
  activeRole,
  warehouseId,
  warehouseName,
  activeShift,
  onOpenShift,
  onCloseShift,
  totalExpenseToday,
  totalCashInSalesToday = 0,
}: ShiftManagementProps) {
  const [initialCashInput, setInitialCashInput] = useState<number>(20000000);
  const [openNotes, setOpenNotes] = useState<string>('Modal kas pagi operasional timbangan');
  const [actualCashInput, setActualCashInput] = useState<number>(0);
  const [closeNotes, setCloseNotes] = useState<string>('Hitung fisik kas sore');

  // FORMULA LACI KASIR LENGKAP:
  // Modal Awal + Kas Masuk Penjualan Tunai - Kas Keluar Belanja Timbangan = Sisa Uang Fisik Seharusnya di Laci
  const initialCash = activeShift?.initialCash || 0;
  const expectedClosingCash = Math.max(0, initialCash + totalCashInSalesToday - totalExpenseToday);
  const cashDifference = actualCashInput > 0 ? actualCashInput - expectedClosingCash : 0;

  const handleOpen = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialCashInput <= 0) return;
    onOpenShift(initialCashInput, openNotes);
  };

  const handleClose = (e: React.FormEvent) => {
    e.preventDefault();
    onCloseShift(actualCashInput, closeNotes);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Shift Status */}
      <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-800" />
            <h2 className="text-base font-extrabold text-slate-900">KONTROL SHIFT KASIR & REKONSILIASI LACI</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Perhitungan modal awal, kas keluar belanja timbangan, dan kas masuk penjualan tunai di {warehouseName}.
          </p>
        </div>

        <div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${
              activeShift
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-slate-100 text-slate-600 border border-slate-300'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                activeShift ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            {activeShift ? 'SHIFT AKTIF BERJALAN' : 'SHIFT TERTUTUP'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Kolom Kiri: Form Buka/Tutup */}
        <div className="space-y-6 lg:col-span-7">
          {!activeShift ? (
            /* Buka Shift */
            <form onSubmit={handleOpen} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <ArrowDownRight className="h-5 w-5 text-emerald-800" />
                <h3 className="text-sm font-extrabold text-slate-900">Buka Shift Kasir Pagi</h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Modal Awal Kas Fisik di Laci (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={initialCashInput}
                  onChange={(e) => setInitialCashInput(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base font-numeric font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  required
                />
                <p className="mt-1 text-[11px] text-slate-500 font-medium">
                  Uang tunai fisik yang diserahkan dari brankas ke laci meja timbangan pagi ini.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Shift</label>
                <input
                  type="text"
                  value={openNotes}
                  onChange={(e) => setOpenNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-800 py-3 text-xs font-extrabold text-white shadow-md shadow-emerald-950/20 hover:bg-emerald-900 transition-all"
              >
                Konfirmasi Buka Shift Kasir
              </button>
            </form>
          ) : (
            /* Tutup Shift */
            <form onSubmit={handleClose} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <ArrowUpRight className="h-5 w-5 text-amber-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Tutup Shift Kasir Sore & Hitung Laci</h3>
              </div>

              {/* Rincian Arus Kas Laci */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span className="font-semibold">Modal Awal Pagi:</span>
                  <span className="font-numeric font-bold text-slate-900">
                    Rp{activeShift.initialCash.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-semibold">Kas Masuk (Penjualan Tunai Laci):</span>
                  <span className="font-numeric font-bold text-emerald-700">
                    + Rp{totalCashInSalesToday.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-semibold">Kas Keluar (Belanja Timbangan):</span>
                  <span className="font-numeric font-bold text-red-600">
                    - Rp{totalExpenseToday.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900">
                  <span>Estimasi Uang Fisik di Laci Seharusnya:</span>
                  <span className="font-numeric text-base text-amber-700 font-black">
                    Rp{expectedClosingCash.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Uang Fisik Aktual Hasil Hitungan di Laci (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={actualCashInput || ''}
                  onChange={(e) => setActualCashInput(parseFloat(e.target.value) || 0)}
                  placeholder={`Contoh: Rp${expectedClosingCash}`}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base font-numeric font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  required
                />
              </div>

              {actualCashInput > 0 && (
                <div
                  className={`rounded-xl p-3 text-xs font-bold border ${
                    cashDifference === 0
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : cashDifference < 0
                      ? 'bg-red-50 text-red-800 border-red-300'
                      : 'bg-blue-50 text-blue-800 border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold">
                      {cashDifference === 0 ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <span>Kas Cocok Sempurna (Tidak Ada Selisih)</span>
                        </>
                      ) : cashDifference < 0 ? (
                        <>
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span>SELISIH MINUS (KAS TEKOR)</span>
                        </>
                      ) : (
                        <>
                          <ArrowUpRight className="h-4 w-4 text-blue-600" />
                          <span>SELISIH LEBIH (SURPLUS)</span>
                        </>
                      )}
                    </span>
                    <span className="font-numeric font-black">
                      Rp{Math.abs(cashDifference).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tutup Shift</label>
                <input
                  type="text"
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-slate-900 py-3 text-xs font-extrabold text-amber-300 shadow-md shadow-slate-900/30 hover:bg-slate-800 transition-all"
              >
                Kunci & Tutup Shift Kasir
              </button>
            </form>
          )}
        </div>

        {/* Kolom Kanan: Rincian Shift */}
        <div className="space-y-4 lg:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-3">
              Informasi Shift Kasir
            </h3>
            {activeShift ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-semibold">Kasir Bertugas:</span>
                  <span className="text-slate-900 font-bold">{activeShift.cashierId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-semibold">Jam Buka:</span>
                  <span className="text-slate-900 font-numeric font-bold">
                    {new Date(activeShift.openedAt).toLocaleTimeString('id-ID')} WIB
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-semibold">Modal Awal Laci:</span>
                  <span className="font-numeric font-bold text-slate-900">
                    Rp{activeShift.initialCash.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-semibold">Kas Masuk (Jual Tunai):</span>
                  <span className="font-numeric font-bold text-emerald-700">
                    +Rp{totalCashInSalesToday.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500 font-semibold">Kas Keluar (Beli Rongsok):</span>
                  <span className="font-numeric font-bold text-red-600">
                    -Rp{totalExpenseToday.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400 font-medium">
                Shift belum dibuka. Masukkan modal awal kasir untuk memulai penimbangan hari ini.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
