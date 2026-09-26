'use client';

import React, { useState } from 'react';
import { BadgeDollarSign, Plus, CheckCircle, Truck, UserCheck, Banknote, ArrowUpRight, Search, Landmark } from 'lucide-react';
import { FactorySale, Product, BuyerType } from '../../types';

interface WarehouseSalesProps {
  currentWarehouseId: number;
  warehouseName: string;
  products: Product[];
  salesList: FactorySale[];
  onAddSale: (sale: FactorySale) => void;
}

export function WarehouseSalesManagement({
  currentWarehouseId,
  warehouseName,
  products,
  salesList,
  onAddSale,
}: WarehouseSalesProps) {
  const [buyerType, setBuyerType] = useState<BuyerType>('PEMBELI_BIASA');
  const [buyerName, setBuyerName] = useState<string>('Bengkel Las Mandiri');
  const [productId, setProductId] = useState<string>(products[0]?.id || '');
  const [weightKg, setWeightKg] = useState<number>(150);
  const [contractPricePerKg, setContractPricePerKg] = useState<number>(6000);
  const [paymentMethod, setPaymentMethod] = useState<'CASH_LACI' | 'TRANSFER_BANK'>('CASH_LACI');

  const activeProduct = products.find((p) => p.id === productId) || products[0];
  const totalRevenue = weightKg * contractPricePerKg;

  // Filter penjualan gudang ini
  const warehouseSales = salesList.filter((s) => s.warehouseId === currentWarehouseId);
  const totalCashInToday = warehouseSales
    .filter((s) => s.paymentMethod === 'CASH_LACI' && s.isPaid)
    .reduce((acc, curr) => acc + curr.totalRevenue, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (weightKg <= 0 || contractPricePerKg <= 0) return;

    const newSale: FactorySale = {
      id: `sale-${Date.now()}`,
      invoiceNumber: `JL/${buyerType === 'PELEBURAN_BESAR' ? 'PBRK' : 'RETAIL'}/${new Date().toISOString().slice(0, 10).replace(/-/g, '')}/${Math.floor(100 + Math.random() * 900)}`,
      warehouseId: currentWarehouseId,
      buyerType,
      factoryName: buyerName.trim() || (buyerType === 'PELEBURAN_BESAR' ? 'Pabrik Peleburan' : 'Pembeli Biasa'),
      productId: activeProduct.id,
      productName: activeProduct.name,
      weightKg,
      contractPricePerKg,
      totalRevenue,
      paymentMethod,
      isPaid: true,
      createdAt: new Date().toISOString(),
    };

    onAddSale(newSale);
    alert(`Penjualan berhasil dicatat! Total Kas Masuk: Rp ${totalRevenue.toLocaleString('id-ID')} (${paymentMethod === 'CASH_LACI' ? 'Masuk Laci Kasir' : 'Transfer Bank'})`);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Info Kas Masuk */}
      <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BadgeDollarSign className="h-5 w-5 text-emerald-800" />
            <h2 className="text-base font-extrabold text-slate-900">PENJUALAN STOK GUDANG (KAS MASUK)</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Pencatatan pengeluaran barang & penerimaan uang dari pabrik peleburan atau pembeli biasa/eceran di {warehouseName}.
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-right">
          <div className="text-xs font-bold text-slate-600">Total Kas Masuk Laci Tunai Hari Ini:</div>
          <div className="font-numeric text-xl font-black text-emerald-800">
            Rp{totalCashInToday.toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Form Penjualan Stok Baru */}
        <div className="lg:col-span-5">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              Input Penjualan & Kas Masuk
            </h3>

            {/* Tipe Pembeli */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tipe Pembeli</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setBuyerType('PEMBELI_BIASA');
                    setBuyerName('Bengkel Bubut / Pembeli Biasa');
                    setPaymentMethod('CASH_LACI');
                  }}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    buyerType === 'PEMBELI_BIASA'
                      ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-emerald-50'
                  }`}
                >
                  Pembeli Biasa / Eceran
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBuyerType('PELEBURAN_BESAR');
                    setBuyerName('Pabrik Peleburan');
                    setPaymentMethod('TRANSFER_BANK');
                  }}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    buyerType === 'PELEBURAN_BESAR'
                      ? 'bg-slate-900 text-amber-300 border-slate-950 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Peleburan Tonase Besar
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pembeli / Pabrik</label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Contoh: Bengkel Las / Pabrik Peleburan 1"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Komoditas Logam yang Dijual</label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stok: {p.currentStockKg} kg)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Berat Jual (Kg)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 font-numeric focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Harga Jual / Kg (Rp)</label>
                <input
                  type="number"
                  min="100"
                  step="50"
                  value={contractPricePerKg}
                  onChange={(e) => setContractPricePerKg(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-emerald-800 font-numeric focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  required
                />
              </div>
            </div>

            {/* Metode Pembayaran: Masuk Kasir Laci vs Rekening */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tujuan Kas Masuk</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH_LACI')}
                  className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg border transition-all ${
                    paymentMethod === 'CASH_LACI'
                      ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Banknote className="h-4 w-4" />
                  <span>Masuk Laci Kasir (Tunai)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('TRANSFER_BANK')}
                  className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg border transition-all ${
                    paymentMethod === 'TRANSFER_BANK'
                      ? 'bg-slate-900 text-amber-300 border-slate-950 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Landmark className="h-4 w-4" />
                  <span>Transfer Bank</span>
                </button>
              </div>
            </div>

            {/* Total Tagihan Penjualan */}
            <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Total Nilai Penjualan:</span>
              <span className="font-numeric text-base font-black text-emerald-800">
                Rp{totalRevenue.toLocaleString('id-ID')}
              </span>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-800 py-3 text-xs font-extrabold text-white shadow-md shadow-emerald-950/20 hover:bg-emerald-900 transition-all"
            >
              Simpan Penjualan & Tambah Kas Masuk
            </button>
          </form>
        </div>

        {/* Tabel Riwayat Penjualan */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-3">
              Riwayat Penjualan Stok ({warehouseName})
            </h3>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {warehouseSales.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-medium">
                  Belum ada transaksi penjualan stok di gudang ini.
                </div>
              ) : (
                warehouseSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900">{sale.invoiceNumber}</span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          sale.paymentMethod === 'CASH_LACI'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-200 text-slate-800 border border-slate-300'
                        }`}
                      >
                        {sale.paymentMethod === 'CASH_LACI' ? 'KAS TUNAI LACI' : 'TRANSFER BANK'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-bold">{sale.factoryName}</span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {sale.buyerType === 'PELEBURAN_BESAR' ? 'Peleburan' : 'Pembeli Biasa'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-[11px] text-slate-600">
                      <div>
                        {sale.productName} • <span className="font-numeric font-bold">{sale.weightKg} Kg</span> @ Rp{sale.contractPricePerKg.toLocaleString('id-ID')}
                      </div>
                      <div className="font-numeric font-black text-emerald-800 text-sm">
                        Rp{sale.totalRevenue.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
