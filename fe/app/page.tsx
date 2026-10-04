'use client';

import React, { useState } from 'react';
import { Sidebar } from '../components/layout/sidebar';
import { KasirPos } from '../components/pos/kasir-pos';
import { WarehouseSalesManagement } from '../components/sales/warehouse-sales';
import { ShiftManagement } from '../components/shifts/shift-management';
import { AttendanceManagement } from '../components/attendance/attendance-management';
import { OwnerDashboard } from '../components/owner/owner-dashboard';
import { OpexManagement } from '../components/opex/opex-management';
import { StockMutationManagement } from '../components/mutation/stock-mutation';
import { DebtReceivableManagement } from '../components/debt/debt-receivable';
import {
  MOCK_WAREHOUSES,
  MOCK_PRODUCTS,
  MOCK_ACTIVE_SHIFT,
  MOCK_RECENT_TRANSACTIONS,
  MOCK_EMPLOYEES,
  MOCK_EMPLOYEE_LOANS,
  MOCK_ATTENDANCES,
  MOCK_OPEX,
  MOCK_MUTATIONS,
  MOCK_DEBTS,
  MOCK_FACTORY_SALES,
} from '../lib/mock/data';
import {
  UserRole,
  ScaleTransaction,
  CashShift,
  AttendanceStatus,
  EmployeeLoan,
  AttendanceRecord,
  OpexExpense,
  StockMutation,
  DebtRecord,
  MutationStatus,
  FactorySale,
} from '../types';
import { Sparkles } from 'lucide-react';
import { OfflineSyncService } from '../lib/db/sync-service';
import { localDB } from '../lib/db/dexie-db';
import { LoginPanel } from '../components/auth/login-panel';
import { useToast } from '../components/ui/toast-notification';

export default function Home() {
  const { success, info } = useToast();
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<{ fullName: string; role: UserRole; username: string } | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole>('ADMIN');
  const [activeWarehouseId, setActiveWarehouseId] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>('pos');

  // Application state
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [transactions, setTransactions] = useState<ScaleTransaction[]>(MOCK_RECENT_TRANSACTIONS);
  const [salesList, setSalesList] = useState<FactorySale[]>(MOCK_FACTORY_SALES);
  const [activeShift, setActiveShift] = useState<CashShift | null>(MOCK_ACTIVE_SHIFT);
  const [employees] = useState(MOCK_EMPLOYEES);
  const [loans, setLoans] = useState<EmployeeLoan[]>(MOCK_EMPLOYEE_LOANS);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>(MOCK_ATTENDANCES);
  const [opexList, setOpexList] = useState<OpexExpense[]>(MOCK_OPEX);
  const [mutations, setMutations] = useState<StockMutation[]>(MOCK_MUTATIONS);
  const [debts, setDebts] = useState<DebtRecord[]>(MOCK_DEBTS);

  const activeWarehouse = MOCK_WAREHOUSES.find((w) => w.id === activeWarehouseId) || MOCK_WAREHOUSES[0];

  // Inisialisasi: Cek session user & baca transaksi lokal dari IndexedDB
  React.useEffect(() => {
    try {
      const savedUser = localStorage.getItem('gc_kuningan_auth_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        setActiveRole(parsed.role);
      }
    } catch (e) {
      console.warn('Gagal membaca sesi lokal:', e);
    }

    async function loadLocalDB() {
      try {
        const localTxs = await localDB.scaleTransactions.toArray();
        if (localTxs.length > 0) {
          // Gabungkan data lokal dengan mock
          setTransactions((prev) => {
            const ids = new Set(localTxs.map((t) => t.id));
            const merged = [...localTxs, ...prev.filter((t) => !ids.has(t.id))];
            return merged;
          });
        }
      } catch (e) {
        console.warn('Gagal membaca IndexedDB lokal:', e);
      }
    }

    loadLocalDB();

    // Auto-sync antrean tertunda jika terhubung internet
    const handleOnline = () => {
      OfflineSyncService.syncPendingTransactions().then((count) => {
        if (count > 0) info(`Berhasil sinkronisasi ${count} transaksi tertunda ke Supabase`);
      });
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [info]);

  const handleLoginSuccess = (user: { fullName: string; role: UserRole; username: string }) => {
    setCurrentUser(user);
    setActiveRole(user.role);
    localStorage.setItem('gc_kuningan_auth_user', JSON.stringify(user));
    success(`Selamat datang, ${user.fullName}`, 'Login Berhasil');
  };

  // Kas keluar belanja timbangan pada shift aktif gudang ini
  const totalExpenseToday = transactions
    .filter((t) => t.warehouseId === activeWarehouseId)
    .reduce((acc, t) => acc + t.totalAmount, 0);

  // Kas masuk penjualan tunai ke laci pada hari ini
  const totalCashInSalesToday = salesList
    .filter((s) => s.warehouseId === activeWarehouseId && s.paymentMethod === 'CASH_LACI' && s.isPaid)
    .reduce((acc, s) => acc + s.totalRevenue, 0);

  // Handlers
  const handleSaveTransaction = async (newTx: ScaleTransaction) => {
    // 1. Simpan ke local state UI
    setTransactions((prev) => [newTx, ...prev]);

    // 2. Simpan aman ke IndexedDB + Sync Supabase
    await OfflineSyncService.saveScaleTransaction(newTx);
  };

  const handleAddSale = (newSale: FactorySale) => {
    setSalesList((prev) => [newSale, ...prev]);
  };

  const handleOpenShift = (initialCash: number, notes: string) => {
    const newShift: CashShift = {
      id: `shift-${Date.now()}`,
      warehouseId: activeWarehouseId,
      cashierId: currentUser ? currentUser.fullName : 'Kasir Gudang',
      openedAt: new Date().toISOString(),
      closedAt: null,
      initialCash,
      expectedClosingCash: null,
      actualClosingCash: null,
      cashDifference: null,
      notes,
    };
    setActiveShift(newShift);
    success(`Shift kasir dibuka dengan modal Rp${initialCash.toLocaleString('id-ID')}`, 'Shift Dibuka');
  };

  const handleCloseShift = (actualClosingCash: number, notes: string) => {
    if (!activeShift) return;
    const expected = Math.max(0, activeShift.initialCash + totalCashInSalesToday - totalExpenseToday);
    const diff = actualClosingCash - expected;

    setActiveShift(null);
    info(
      `Fisik Kas: Rp${actualClosingCash.toLocaleString('id-ID')} | Selisih: Rp${diff.toLocaleString('id-ID')}`,
      'Shift Kasir Ditutup'
    );
  };

  const handleUpdateAttendance = (empId: string, status: AttendanceStatus) => {
    setAttendances((prev) => {
      const exists = prev.find((a) => a.employeeId === empId);
      if (exists) {
        return prev.map((a) => (a.employeeId === empId ? { ...a, status } : a));
      }
      return [
        ...prev,
        {
          id: `att-${Date.now()}`,
          employeeId: empId,
          warehouseId: activeWarehouseId,
          attendanceDate: new Date().toISOString().slice(0, 10),
          checkIn: new Date().toISOString(),
          checkOut: null,
          status,
          recordedBy: 'Admin Gudang',
          createdAt: new Date().toISOString(),
        },
      ];
    });
  };

  const handleBulkUpdateAllAttendance = (status: AttendanceStatus) => {
    setAttendances((prev) =>
      prev.map((a) => (a.warehouseId === activeWarehouseId ? { ...a, status } : a))
    );
  };

  const handleAddLoan = (empId: string, amount: number, notes: string) => {
    const emp = employees.find((e) => e.id === empId);
    const newLoan: EmployeeLoan = {
      id: `loan-${Date.now()}`,
      employeeId: empId,
      employeeName: emp?.fullName || 'Karyawan',
      warehouseId: activeWarehouseId,
      loanDate: new Date().toISOString().slice(0, 10),
      amount,
      isDeducted: false,
      notes,
      createdAt: new Date().toISOString(),
    };
    setLoans((prev) => [newLoan, ...prev]);
  };

  const handleAddOpex = (expense: OpexExpense) => {
    setOpexList((prev) => [expense, ...prev]);
  };

  const handleAddMutation = (mut: StockMutation) => {
    setMutations((prev) => [mut, ...prev]);
  };

  const handleUpdateMutationStatus = (id: string, status: MutationStatus) => {
    setMutations((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m))
    );
  };

  const handleAddDebt = (debt: DebtRecord) => {
    setDebts((prev) => [debt, ...prev]);
  };

  const handlePayDebt = (id: string, payAmount: number) => {
    setDebts((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const newPaid = d.paidAmount + payAmount;
          const remaining = Math.max(0, d.totalAmount - newPaid);
          return {
            ...d,
            paidAmount: newPaid,
            remainingAmount: remaining,
            status: remaining === 0 ? 'PAID' : 'PARTIAL',
          };
        }
        return d;
      })
    );
  };

  const handleApproveJumbo = (txId: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, isApprovedByOwner: true } : t))
    );
    success('Transaksi Jumbo disetujui Owner dengan otorisasi PIN.', 'Approval Berhasil');
  };

  const handleUpdateMarketBenchmark = (prodId: string, newBenchmark: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === prodId ? { ...p, marketPriceBenchmark: newBenchmark } : p))
    );
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'pos':
        return 'Kasir Timbangan Digital & Struk';
      case 'sales':
        return 'Penjualan Stok Gudang (Kas Masuk)';
      case 'shifts':
        return 'Manajemen Shift & Rekonsiliasi Kasir';
      case 'opex':
        return 'Biaya Operasional Gudang (Kas Kecil)';
      case 'mutations':
        return 'Mutasi Stok Antar Gudang (Surat Jalan)';
      case 'attendance':
        return 'Absensi Cepat 50 Karyawan & Kasbon';
      case 'debts':
        return 'Manajemen Hutang & Piutang (AP / AR)';
      case 'owner':
        return 'Executive Overview: Laba / Rugi Konsolidasi';
      default:
        return 'Dashboard';
    }
  };

  // Jika belum login, tampilkan Panel Login
  if (!currentUser) {
    return <LoginPanel onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-slate-100 text-slate-900 font-sans antialiased">
      {/* Sidebar Daylight Theme */}
      <Sidebar
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        activeWarehouseId={activeWarehouseId}
        setActiveWarehouseId={setActiveWarehouseId}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        warehouses={MOCK_WAREHOUSES}
        isOnline={true}
      />

      {/* Main Content Area */}
      <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden bg-slate-50/80">
        {/* Top Navbar Header */}
        <header className="h-14 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0 z-20 bg-white shadow-2xs">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-slate-400">Green Cycle Kuningan</span>
            <span className="text-xs text-slate-300">/</span>
            <span className="text-sm font-semibold text-slate-800 tracking-tight">{getTabTitle()}</span>
          </div>

          <div className="flex items-center space-x-3">
            {activeRole === 'ADMIN' ? (
              <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-800 border border-slate-300 shadow-2xs">
                <span>Kasir Operasional</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-900 px-3 py-1 text-[11px] font-bold text-amber-300 border border-amber-600/40 shadow-xs">
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span>Executive Owner Mode</span>
              </div>
            )}
          </div>
        </header>

        {/* Scrollable Page Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 max-w-7xl w-full mx-auto">
          {activeTab === 'pos' && (
            <KasirPos
              products={products}
              warehouseId={activeWarehouseId}
              warehouseName={activeWarehouse.name}
              onSaveTransaction={handleSaveTransaction}
            />
          )}

          {activeTab === 'sales' && (
            <WarehouseSalesManagement
              currentWarehouseId={activeWarehouseId}
              warehouseName={activeWarehouse.name}
              products={products}
              salesList={salesList}
              onAddSale={handleAddSale}
            />
          )}

          {activeTab === 'shifts' && (
            <ShiftManagement
              activeRole={activeRole}
              warehouseId={activeWarehouseId}
              warehouseName={activeWarehouse.name}
              activeShift={activeShift}
              onOpenShift={handleOpenShift}
              onCloseShift={handleCloseShift}
              totalExpenseToday={totalExpenseToday}
              totalCashInSalesToday={totalCashInSalesToday}
            />
          )}

          {activeTab === 'opex' && (
            <OpexManagement
              warehouseId={activeWarehouseId}
              warehouseName={activeWarehouse.name}
              opexList={opexList}
              onAddOpex={handleAddOpex}
            />
          )}

          {activeTab === 'mutations' && (
            <StockMutationManagement
              currentWarehouseId={activeWarehouseId}
              warehouses={MOCK_WAREHOUSES}
              products={products}
              mutations={mutations}
              onAddMutation={handleAddMutation}
              onUpdateStatus={handleUpdateMutationStatus}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceManagement
              employees={employees}
              loans={loans}
              attendances={attendances}
              warehouseId={activeWarehouseId}
              warehouseName={activeWarehouse.name}
              onUpdateAttendance={handleUpdateAttendance}
              onBulkUpdateAll={handleBulkUpdateAllAttendance}
              onAddLoan={handleAddLoan}
            />
          )}

          {activeTab === 'debts' && (
            <DebtReceivableManagement
              debts={debts}
              onAddDebt={handleAddDebt}
              onPayDebt={handlePayDebt}
            />
          )}

          {activeTab === 'owner' && (
            <OwnerDashboard
              activeRole={activeRole}
              transactions={transactions}
              factorySales={salesList}
              opexList={opexList}
              attendances={attendances}
              loans={loans}
              products={products}
              onApproveJumboTransaction={handleApproveJumbo}
              onUpdateMarketBenchmark={handleUpdateMarketBenchmark}
            />
          )}
        </main>
      </div>
    </div>
  );
}
