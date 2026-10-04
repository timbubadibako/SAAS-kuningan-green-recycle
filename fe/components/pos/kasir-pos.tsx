import React, { useState, useEffect } from 'react';
import {
  Scale,
  Printer,
  Plus,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  UserX,
  Banknote,
  DollarSign,
  Camera,
  History,
  Trash2,
} from 'lucide-react';
import { Product, ScaleTransaction, ScaleTransactionItem } from '../../types';
import { useScaleSerial } from '../../lib/hardware/use-scale-serial';
import { buildThermalReceiptESC, printThermalReceipt } from '../../lib/hardware/escpos-builder';

interface KasirPosProps {
  products: Product[];
  warehouseId: number;
  warehouseName: string;
  onSaveTransaction: (tx: ScaleTransaction) => void;
}

export function KasirPos({ products, warehouseId, warehouseName, onSaveTransaction }: KasirPosProps) {
  const {
    currentWeight,
    isConnected,
    isMock,
    portInfo,
    connectHardware,
    disconnectHardware,
    setSimulatedWeight,
    resetTare,
  } = useScaleSerial({ mockMode: true });

  // Pilihan nama penjual umum/keliling + Opsi input bebas
  const defaultSellers = [
    'Pak Madun (Pengepul Langganan)',
    'H. Hasanudin (Mitra Borongan)',
    'Wawan (Pengepul Keliling)',
    'Suryadi (Pengepul Rongsok)',
    'Penjual Umum / Eceran',
  ];

  const [sellerName, setSellerName] = useState<string>(defaultSellers[0]);
  const [isCustomSeller, setIsCustomSeller] = useState<boolean>(false);
  const [customSellerName, setCustomSellerName] = useState<string>('');
  const [isPartner, setIsPartner] = useState<boolean>(true);

  // Komoditas + Opsi Komoditas Bebas
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [isCustomProduct, setIsCustomProduct] = useState<boolean>(false);
  const [customProductName, setCustomProductName] = useState<string>('');
  const [customPricePerKg, setCustomPricePerKg] = useState<number>(5000);

  // Potongan kotoran (Refaksi)
  const [refactionType, setRefactionType] = useState<'kg' | 'pct'>('kg');
  const [refactionValue, setRefactionValue] = useState<number>(0);
  const [cartItems, setCartItems] = useState<ScaleTransactionItem[]>([]);

  // Pembayaran & Estimasi Uang Kasir
  const [cashGiven, setCashGiven] = useState<number>(0);

  // State Deteksi Pulih Mati Lampu (Power Outage Recovery Banner)
  const [recoveredDraftFound, setRecoveredDraftFound] = useState<boolean>(false);
  const draftStorageKey = `gc_kuningan_cart_draft_wh_${warehouseId}`;

  // 1. Cek draft tersimpan saat inisialisasi
  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.cartItems) && parsed.cartItems.length > 0) {
          setRecoveredDraftFound(true);
        }
      }
    } catch (e) {
      console.warn('Gagal membaca draft lokal:', e);
    }
  }, [draftStorageKey]);

  // 2. Auto-save keranjang setiap kali cartItems atau sellerName berubah
  useEffect(() => {
    try {
      if (cartItems.length > 0) {
        localStorage.setItem(
          draftStorageKey,
          JSON.stringify({
            cartItems,
            sellerName,
            isCustomSeller,
            customSellerName,
            isPartner,
            timestamp: new Date().toISOString(),
          })
        );
      } else {
        localStorage.removeItem(draftStorageKey);
      }
    } catch (e) {
      console.warn('Gagal menyimpan auto-draft:', e);
    }
  }, [cartItems, sellerName, isCustomSeller, customSellerName, isPartner, draftStorageKey]);

  const handleRestoreDraft = () => {
    try {
      const saved = localStorage.getItem(draftStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.cartItems) setCartItems(parsed.cartItems);
        if (parsed.sellerName) setSellerName(parsed.sellerName);
        if (parsed.isCustomSeller !== undefined) setIsCustomSeller(parsed.isCustomSeller);
        if (parsed.customSellerName) setCustomSellerName(parsed.customSellerName);
        if (parsed.isPartner !== undefined) setIsPartner(parsed.isPartner);
      }
    } catch (e) {
      console.warn('Gagal memulihkan draft:', e);
    }
    setRecoveredDraftFound(false);
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(draftStorageKey);
    setRecoveredDraftFound(false);
  };

  // Detail produk aktif
  const activeProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const unitPrice = isCustomProduct
    ? customPricePerKg
    : activeProduct
    ? isPartner
      ? activeProduct.pricePartner
      : activeProduct.priceRegular
    : 0;

  const currentProductName = isCustomProduct
    ? customProductName || 'Barang Campur / Bebas'
    : activeProduct?.name || 'Komoditas';

  // Perhitungan berat & subtotal
  const grossWeight = currentWeight;
  const refactionKg = refactionType === 'kg' ? refactionValue : (grossWeight * refactionValue) / 100;
  const netWeight = Math.max(0, Number((grossWeight - refactionKg).toFixed(2)));
  const currentItemSubtotal = Math.round(netWeight * unitPrice);

  const totalBillToPay = cartItems.reduce((acc, item) => acc + item.subtotal, 0);

  // Estimasi kembalian / kurang bayar
  const changeAmount = cashGiven > totalBillToPay ? cashGiven - totalBillToPay : 0;
  const underpaidAmount = cashGiven > 0 && cashGiven < totalBillToPay ? totalBillToPay - cashGiven : 0;

  const handleAddItemToCart = () => {
    if (netWeight <= 0) return;

    const newItem: ScaleTransactionItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      transactionId: '',
      productId: isCustomProduct ? 'custom-prod' : activeProduct.id,
      productName: currentProductName,
      grossWeightKg: grossWeight,
      refactionKg: refactionType === 'kg' ? refactionValue : 0,
      refactionPct: refactionType === 'pct' ? refactionValue : 0,
      netWeightKg: netWeight,
      pricePerKg: unitPrice,
      subtotal: currentItemSubtotal,
    };

    setCartItems((prev) => [...prev, newItem]);
    resetTare();
    setRefactionValue(0);
    if (isCustomProduct) {
      setIsCustomProduct(false);
      setCustomProductName('');
    }
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCompleteTransaction = () => {
    if (cartItems.length === 0) return;

    const requiresApproval = totalBillToPay > 10000000;
    const finalSeller = isCustomSeller ? customSellerName.trim() || 'Penjual Umum' : sellerName;

    const newTx: ScaleTransaction = {
      id: `tx-${Date.now()}`,
      invoiceNumber: `NOTA/${new Date().toISOString().slice(0, 10).replace(/-/g, '')}/G${warehouseId}/${Math.floor(
        1000 + Math.random() * 9000
      )}`,
      warehouseId,
      cashierId: 'Kasir Gudang',
      shiftId: 'shift-active-01',
      sellerName: finalSeller,
      isPartner,
      totalAmount: totalBillToPay,
      syncStatus: true,
      requiresOwnerApproval: requiresApproval,
      isApprovedByOwner: !requiresApproval,
      items: cartItems,
      createdAt: new Date().toISOString(),
    };

    onSaveTransaction(newTx);

    // Cetak struk ESC/POS
    const receiptText = buildThermalReceiptESC(newTx, warehouseName);
    printThermalReceipt(receiptText);

    if (requiresApproval) {
      alert(
        `PERINGATAN: Transaksi Jumbo > Rp 10.000.000 (Total: Rp ${totalBillToPay.toLocaleString(
          'id-ID'
        )}). Struk dicetak dan ditandai membutuhkan approval PIN Owner.`
      );
    }

    setCartItems([]);
    setCashGiven(0);
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Banner Pemulihan Mati Listrik / Crash Recovery */}
      {recoveredDraftFound && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-sm text-slate-900 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-200 p-2 text-amber-900">
              <History className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-black text-amber-950 uppercase tracking-tight">
                Draft Transaksi Ditemukan (Proteksi Mati Listrik)
              </div>
              <div className="text-[11px] text-amber-800 font-medium">
                Ada nota timbangan yang belum diselesaikan sebelum browser tertutup atau mati lampu.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleRestoreDraft}
              className="flex-1 sm:flex-none rounded-xl bg-emerald-800 hover:bg-emerald-900 px-3.5 py-1.5 text-xs font-black text-white shadow-xs transition-all"
            >
              Pulihkan Nota
            </button>
            <button
              onClick={handleDiscardDraft}
              className="flex-1 sm:flex-none rounded-xl bg-white hover:bg-slate-100 border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 transition-all"
            >
              Buang
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Kolom Kiri: Layar Timbangan Digital & Input */}
        <div className="space-y-5 lg:col-span-7">
          {/* Timbangan Box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-emerald-800" />
              <span className="text-sm font-black text-slate-900 tracking-tight">TIMBANGAN DIGITAL (ALEXA BFS)</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                  isMock
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}
              >
                {isMock ? 'Simulasi Virtual' : 'Serial Port RS-232'}
              </span>
            </div>

            <div>
              {isMock ? (
                <button
                  onClick={connectHardware}
                  className="rounded-lg bg-slate-100 border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Hubungkan Port Kabel
                </button>
              ) : (
                <button
                  onClick={disconnectHardware}
                  className="rounded-lg bg-red-100 border border-red-300 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-200"
                >
                  Putus Koneksi
                </button>
              )}
            </div>
          </div>

          {/* Big Digital Scale Display - Forest Green & Navy Accent */}
          <div className="my-5 flex flex-col items-center justify-center rounded-xl border border-slate-300 bg-gradient-to-b from-slate-50 to-emerald-50/40 py-6 text-slate-900 shadow-inner">
            <div className="text-xs uppercase tracking-widest font-bold text-slate-500">Berat Timbangan Saat Ini</div>
            <div className="flex items-baseline gap-2">
              <span className="font-numeric text-6xl font-black tracking-tight text-emerald-900">
                {currentWeight.toFixed(2)}
              </span>
              <span className="text-2xl font-black text-amber-700">KG</span>
            </div>
            <div className="mt-1 text-xs font-medium text-slate-500">
              {portInfo || 'Stream data aktif'}
            </div>
          </div>

          {/* Virtual Scale Slider (Bila kabel belum dicolok) */}
          {isMock && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                <span>Simulasi Berat Timbangan (Slider)</span>
                <span className="font-numeric">{currentWeight.toFixed(2)} Kg</span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                step="0.5"
                value={currentWeight}
                onChange={(e) => setSimulatedWeight(parseFloat(e.target.value))}
                className="w-full accent-emerald-800 cursor-pointer"
              />
              <div className="flex flex-wrap gap-1.5 items-center">
                {[5, 12.5, 25, 50, 100, 250].map((w) => (
                  <button
                    key={w}
                    onClick={() => setSimulatedWeight(w)}
                    className="rounded bg-white border border-amber-300 px-2.5 py-1 text-xs font-bold text-slate-800 hover:bg-amber-100"
                  >
                    +{w}kg
                  </button>
                ))}
                <button
                  onClick={resetTare}
                  className="flex items-center gap-1 rounded bg-slate-900 px-3 py-1 text-xs text-amber-300 hover:bg-slate-800 font-bold ml-auto shadow-xs"
                >
                  <RotateCcw className="h-3 w-3" />
                  Nol-kan / Tare (0 Kg)
                </button>
              </div>
            </div>
          )}

          {/* Form Input Detail Transaksi */}
          <div className="mt-5 space-y-4">
            {/* Penjual dengan Opsi Input Bebas */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Nama Pengepul / Penjual</label>
                  <button
                    type="button"
                    onClick={() => setIsCustomSeller(!isCustomSeller)}
                    className="text-[11px] font-bold text-emerald-800 hover:underline"
                  >
                    {isCustomSeller ? 'Pilih dari List' : '+ Ketik Nama Baru'}
                  </button>
                </div>

                {isCustomSeller ? (
                  <input
                    type="text"
                    value={customSellerName}
                    onChange={(e) => setCustomSellerName(e.target.value)}
                    placeholder="Ketik nama penjual bebas..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    autoFocus
                  />
                ) : (
                  <select
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    {defaultSellers.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Harga Mitra</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPartner(true)}
                    className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-2 text-xs font-bold border transition-all ${
                      isPartner
                        ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    Langganan (VIP)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPartner(false)}
                    className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-2 text-xs font-bold border transition-all ${
                      !isPartner
                        ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <UserX className="h-3.5 w-3.5" />
                    Umum / Eceran
                  </button>
                </div>
              </div>
            </div>

            {/* Komoditas dengan Pilihan Grid Cepat + Input Bebas */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Komoditas Logam / Rongsok</label>
                <button
                  type="button"
                  onClick={() => setIsCustomProduct(!isCustomProduct)}
                  className="text-[11px] font-bold text-emerald-800 hover:underline"
                >
                  {isCustomProduct ? 'Pilih dari Master' : '+ Input Komoditas Bebas'}
                </button>
              </div>

              {isCustomProduct ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-xl border border-emerald-300 bg-emerald-50/50">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Barang Baru</label>
                    <input
                      type="text"
                      value={customProductName}
                      onChange={(e) => setCustomProductName(e.target.value)}
                      placeholder="Misal: Besi Pipa Tebal Campur"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Harga Beli per Kg (Rp)</label>
                    <input
                      type="number"
                      value={customPricePerKg}
                      onChange={(e) => setCustomPricePerKg(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 max-h-48 overflow-y-auto pr-1">
                  {products.map((p) => {
                    const price = isPartner ? p.pricePartner : p.priceRegular;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedProductId(p.id)}
                        className={`rounded-xl p-2.5 text-left border transition-all ${
                          p.id === selectedProductId
                            ? 'bg-emerald-50 border-emerald-700 shadow-xs ring-1 ring-emerald-600'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs font-extrabold text-slate-900 truncate">{p.name}</div>
                        <div className="mt-1 flex items-baseline justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">{p.category.replace('_', ' ')}</span>
                          <span className="font-numeric font-black text-emerald-800">
                            Rp{price.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Potongan Kotoran (Refaksi) */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">Potongan Kotoran (Refaksi)</span>
                <div className="flex gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setRefactionType('kg')}
                    className={`rounded px-2.5 py-0.5 text-xs font-bold ${
                      refactionType === 'kg' ? 'bg-emerald-800 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Potong Kg
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefactionType('pct')}
                    className={`rounded px-2.5 py-0.5 text-xs font-bold ${
                      refactionType === 'pct' ? 'bg-emerald-800 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Potong %
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={refactionValue || ''}
                  onChange={(e) => setRefactionValue(parseFloat(e.target.value) || 0)}
                  placeholder={`Nilai potongan dalam ${refactionType.toUpperCase()}`}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
                <div className="text-right text-xs text-slate-600">
                  <span>Netto: </span>
                  <span className="font-numeric font-black text-slate-900 text-sm">{netWeight} Kg</span>
                </div>
              </div>
            </div>

            {/* Action Button: Masukkan ke Nota Multi-Item */}
            <button
              type="button"
              onClick={handleAddItemToCart}
              disabled={netWeight <= 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3.5 text-sm font-extrabold text-white shadow-md shadow-emerald-950/20 hover:bg-emerald-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Plus className="h-4 w-4" />
              Masukkan ke Nota (Subtotal: Rp{currentItemSubtotal.toLocaleString('id-ID')})
            </button>
          </div>
        </div>
      </div>

      {/* Kolom Kanan: Keranjang Nota & Estimasi Uang Kasir */}
      <div className="space-y-5 lg:col-span-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-800" />
              <h2 className="text-sm font-extrabold text-slate-900">KERANJANG TIMBANGAN (NOTA)</h2>
            </div>
            <span className="text-xs font-bold text-slate-500">{cartItems.length} Item</span>
          </div>

          {/* List Barang di Nota */}
          <div className="my-3 max-h-56 space-y-2 overflow-y-auto pr-1">
            {cartItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-medium">
                Belum ada barang di nota. Timbang dan klik 'Masukkan ke Nota'.
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs"
                >
                  <div className="flex-1 pr-2">
                    <div className="font-bold text-slate-900">{item.productName}</div>
                    <div className="text-[11px] text-slate-500 font-numeric">
                      {item.netWeightKg} Kg × Rp{item.pricePerKg.toLocaleString('id-ID')}
                      {item.refactionKg > 0 && ` (Potong ${item.refactionKg}kg)`}
                      {item.refactionPct > 0 && ` (Potong ${item.refactionPct}%)`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-numeric font-black text-emerald-800">
                      Rp{item.subtotal.toLocaleString('id-ID')}
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="mt-1 text-[11px] font-bold text-red-600 hover:text-red-700"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Total Tagihan Timbangan (Kas Keluar) */}
          <div className="border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold">Total Biaya Belanja (Uang Keluar):</span>
              <span className="font-numeric text-xl font-black text-amber-700">
                Rp{totalBillToPay.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Estimasi Kasir Uang Masuk / Pembayaran & Kembalian */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Banknote className="h-4 w-4 text-emerald-800" />
              <span>Estimasi Uang Diserahkan & Kembalian</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Uang Tunai Diserahkan Kasir ke Penjual (Rp):
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={cashGiven || ''}
                onChange={(e) => setCashGiven(parseFloat(e.target.value) || 0)}
                placeholder={`Contoh: Rp${totalBillToPay}`}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-numeric font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />

              {/* Quick Cash Buttons */}
              <div className="mt-2 flex flex-wrap gap-1">
                {[
                  totalBillToPay,
                  Math.ceil(totalBillToPay / 50000) * 50000,
                  Math.ceil(totalBillToPay / 100000) * 100000,
                ]
                  .filter((v, i, a) => v > 0 && a.indexOf(v) === i)
                  .map((val) => (
                    <button
                      key={val}
                      onClick={() => setCashGiven(val)}
                      className="rounded bg-white border border-slate-300 px-2 py-0.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100 font-numeric"
                    >
                      Rp{val.toLocaleString('id-ID')}
                    </button>
                  ))}
              </div>
            </div>

            {/* Status Kembalian & Kurang Bayar */}
            <div className="space-y-1 border-t border-slate-200 pt-2 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-semibold">Kembalian dari Penjual:</span>
                <span className="font-numeric font-bold text-emerald-700">
                  Rp{changeAmount.toLocaleString('id-ID')}
                </span>
              </div>

              {underpaidAmount > 0 && (
                <div className="flex items-center justify-between text-amber-800">
                  <span className="font-semibold">Sisa Kurang Bayar:</span>
                  <span className="font-numeric font-bold">Rp{underpaidAmount.toLocaleString('id-ID')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Selesaikan & Cetak Struk */}
          <div className="mt-4 space-y-2">
            <button
              onClick={handleCompleteTransaction}
              disabled={cartItems.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-extrabold text-amber-300 shadow-md shadow-slate-900/30 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Printer className="h-4 w-4" />
              Selesaikan Transaksi & Cetak Struk Thermal
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
