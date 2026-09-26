'use client';

import React, { useState } from 'react';
import { Plus, Search, Check, AlertCircle, PackageCheck, Filter, RotateCcw } from 'lucide-react';
import { MOCK_ORDERS, MOCK_PRODUCTS, MOCK_TEAMS } from '../../lib/mock-data';
import { Order, OrderStatus } from '../../types';
import { useToast } from '../../components/ui/toast';
import { InfoTooltip } from '../../components/ui/info-tooltip';

export default function OrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);

  const [newOrder, setNewOrder] = useState({
    customerName: '',
    customerPhone: '',
    destinationProvince: 'Jawa Barat',
    destinationCity: '',
    addressDetail: '',
    isAddressValid: true,
    productId: MOCK_PRODUCTS[0].id,
    quantity: 1,
    teamId: 1,
    expeditionName: 'JNT COD',
    trackingNumber: '',
  });

  const filteredOrders = orders.filter((ord) => {
    const matchStatus = statusFilter === 'ALL' || ord.status === statusFilter;
    const matchSearch =
      ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.destinationCity.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedPhone = newOrder.customerPhone.replace(/\D/g, '');
    if (cleanedPhone.length < 10) {
      showToast('Nomor HP tidak valid! Minimal 10 digit angka.', 'error');
      return;
    }
    if (newOrder.quantity <= 0) {
      showToast('Jumlah quantity harus minimal 1 pcs!', 'error');
      return;
    }

    const product = MOCK_PRODUCTS.find((p) => p.id === newOrder.productId) || MOCK_PRODUCTS[0];
    const team = MOCK_TEAMS.find((t) => t.id === newOrder.teamId) || MOCK_TEAMS[0];
    const created: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `QM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      orderDate: new Date().toISOString().slice(0, 10),
      customerName: newOrder.customerName.trim(),
      customerPhone: newOrder.customerPhone.trim(),
      destinationProvince: newOrder.destinationProvince,
      destinationCity: newOrder.destinationCity.trim(),
      destinationDistrict: 'Kecamatan',
      addressDetail: newOrder.addressDetail.trim(),
      isAddressValid: newOrder.isAddressValid,
      productId: product.id,
      productName: product.name,
      quantity: Number(newOrder.quantity),
      totalCodAmount: product.retailPrice * Number(newOrder.quantity),
      teamId: team.id,
      teamName: team.name,
      advertiserId: 'adv-01',
      advertiserName: team.leaderName,
      status: 'COMPLETE',
      expeditionName: newOrder.expeditionName,
      trackingNumber: newOrder.trackingNumber.trim() || `JX${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      createdAt: new Date().toISOString(),
    };

    setOrders([created, ...orders]);
    setShowModal(false);
    showToast(`Order ${created.orderNumber} berhasil dicatat!`, 'success');

    setNewOrder({
      customerName: '',
      customerPhone: '',
      destinationProvince: 'Jawa Barat',
      destinationCity: '',
      addressDetail: '',
      isAddressValid: true,
      productId: MOCK_PRODUCTS[0].id,
      quantity: 1,
      teamId: 1,
      expeditionName: 'JNT COD',
      trackingNumber: '',
    });
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'COMPLETE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'SUSULAN':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'UNPAID':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'CANCEL':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Manajemen Pesanan Closing H+1</h1>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
            <span>Verifikasi order COD, kelengkapan</span>
            <InfoTooltip
              term="Validasi RT/RW"
              explanation="Memastikan format alamat memiliki nomor RT/RW dan patokan jelas untuk memangkas potensi retur paket kurir gagal (RTS) hingga 40%."
            />
            <span>dan tracking resi ekspedisi.</span>
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg shadow-emerald-600/20 transition-all duration-150 self-start sm:self-auto cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Input Order Closing</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card-theme p-3.5 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
          <input
            type="text"
            placeholder="Cari customer, no order, kota..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:max-w-xs text-xs rounded-xl pl-8 pr-3 py-1.5 border border-slate-300 dark:border-slate-700/60 bg-white dark:bg-slate-900/40 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" />
            <span>Status:</span>
          </span>
          {(['ALL', 'COMPLETE', 'SUSULAN', 'UNPAID', 'CANCEL'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition-all duration-150 cursor-pointer ${
                statusFilter === st
                  ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700/60'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="card-theme rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-900/80 text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">No Order & Tgl</th>
                <th className="px-4 py-3.5">Customer & Kontak</th>
                <th className="px-4 py-3.5">Alamat & Validasi RT/RW</th>
                <th className="px-4 py-3.5">Produk & Qty</th>
                <th className="px-4 py-3.5 text-right">Nilai COD</th>
                <th className="px-4 py-3.5">Tim & Adv</th>
                <th className="px-4 py-3.5">Ekspedisi & Resi</th>
                <th className="px-4 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-xs text-slate-500 dark:text-slate-400 space-y-2">
                    <p className="text-sm font-medium">Tidak ada pesanan yang cocok dengan filter.</p>
                    <button
                      onClick={() => {
                        setStatusFilter('ALL');
                        setSearchQuery('');
                      }}
                      className="text-emerald-600 dark:text-emerald-400 font-semibold underline text-xs cursor-pointer inline-flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Filter</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="font-semibold text-slate-900 dark:text-white">{ord.orderNumber}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{ord.orderDate}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{ord.customerName}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{ord.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3.5 max-w-xs">
                      <p className="truncate text-slate-700 dark:text-slate-300">{ord.addressDetail}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{ord.destinationCity}, {ord.destinationProvince}</span>
                        {ord.isAddressValid ? (
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-1.5 py-0.2 rounded font-semibold border border-emerald-300 dark:border-emerald-500/20 inline-flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" />
                            <span>RT/RW Valid</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/10 px-1.5 py-0.2 rounded font-semibold border border-rose-300 dark:border-rose-500/20 inline-flex items-center gap-0.5">
                            <AlertCircle className="w-2.5 h-2.5" />
                            <span>Perlu RT/RW</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{ord.productName}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{ord.quantity} pcs</p>
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap font-mono">
                      {formatIDR(ord.totalCodAmount)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{ord.teamName}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{ord.advertiserName}</p>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="text-slate-700 dark:text-slate-300 font-medium">{ord.expeditionName}</p>
                      <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{ord.trackingNumber}</p>
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border font-mono ${getStatusBadge(ord.status)}`}>
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Input Order */}
      {showModal && (
        <div className="modal-overlay">
          <div className="card-theme rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Input Order Closing H+1</span>
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateOrder} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Customer</label>
                  <input
                    required
                    type="text"
                    value={newOrder.customerName}
                    onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder="Contoh: Budi Santoso"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Nomor WhatsApp (Min 10 digit)</label>
                  <input
                    required
                    type="tel"
                    value={newOrder.customerPhone}
                    onChange={(e) => setNewOrder({ ...newOrder, customerPhone: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder="0812xxxxxxxx"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Alamat Lengkap Detail</label>
                <textarea
                  required
                  rows={2}
                  value={newOrder.addressDetail}
                  onChange={(e) => setNewOrder({ ...newOrder, addressDetail: e.target.value })}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="Jl. / Dusun, No Rumah, RT/RW, Patokan Rumah"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Kota / Kabupaten</label>
                  <input
                    required
                    type="text"
                    value={newOrder.destinationCity}
                    onChange={(e) => setNewOrder({ ...newOrder, destinationCity: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder="Contoh: Kuningan"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Pilih Produk</label>
                  <select
                    value={newOrder.productId}
                    onChange={(e) => setNewOrder({ ...newOrder, productId: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  >
                    {MOCK_PRODUCTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({formatIDR(p.retailPrice)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={newOrder.quantity}
                    onChange={(e) => setNewOrder({ ...newOrder, quantity: Number(e.target.value) })}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Tim Media Buying</label>
                  <select
                    value={newOrder.teamId}
                    onChange={(e) => setNewOrder({ ...newOrder, teamId: Number(e.target.value) })}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  >
                    {MOCK_TEAMS.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Ekspedisi</label>
                  <select
                    value={newOrder.expeditionName}
                    onChange={(e) => setNewOrder({ ...newOrder, expeditionName: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="JNT COD">JNT COD</option>
                    <option value="SiCepat COD">SiCepat COD</option>
                    <option value="Ninja Van COD">Ninja Van COD</option>
                    <option value="SAP Express COD">SAP Express COD</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
                <input
                  type="checkbox"
                  id="validRTRW"
                  checked={newOrder.isAddressValid}
                  onChange={(e) => setNewOrder({ ...newOrder, isAddressValid: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="validRTRW" className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium cursor-pointer">
                  Konfirmasi: Alamat memiliki RT/RW dan patokan jelas (Lolos verifikasi).
                </label>
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
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  Simpan Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
