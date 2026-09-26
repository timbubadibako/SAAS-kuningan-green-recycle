'use client';

import React, { useState } from 'react';
import { Users, DollarSign, Plus, CheckCircle, Search, Filter, CheckCheck } from 'lucide-react';
import { Employee, EmployeeLoan, AttendanceRecord, AttendanceStatus } from '../../types';

interface AttendanceManagementProps {
  employees: Employee[];
  loans: EmployeeLoan[];
  attendances: AttendanceRecord[];
  warehouseId: number;
  warehouseName: string;
  onUpdateAttendance: (empId: string, status: AttendanceStatus) => void;
  onBulkUpdateAll: (status: AttendanceStatus) => void;
  onAddLoan: (empId: string, amount: number, notes: string) => void;
}

export function AttendanceManagement({
  employees,
  loans,
  attendances,
  warehouseId,
  warehouseName,
  onUpdateAttendance,
  onBulkUpdateAll,
  onAddLoan,
}: AttendanceManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmpForLoan, setSelectedEmpForLoan] = useState<string>(employees[0]?.id || '');
  const [loanAmount, setLoanAmount] = useState<number>(100000);
  const [loanNotes, setLoanNotes] = useState<string>('Kasbon mingguan');

  // Filter karyawan di gudang ini
  const warehouseEmployees = employees.filter((e) => e.warehouseId === warehouseId);
  const filteredEmployees = warehouseEmployees.filter((e) =>
    e.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presentCount = warehouseEmployees.filter((e) => {
    const a = attendances.find((att) => att.employeeId === e.id);
    return a?.status === 'PRESENT';
  }).length;

  const handleLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpForLoan || loanAmount <= 0) return;
    onAddLoan(selectedEmpForLoan, loanAmount, loanNotes);
    setLoanAmount(100000);
    setLoanNotes('');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header UX Friendly */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-800" />
            <h2 className="text-base font-extrabold text-slate-900">
              ABSENSI CEPAT 50 KARYAWAN ({warehouseName})
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Dirancang agar admin bisa menyelesaikan absensi seluruh kuli & tukang sortir dalam 15 detik.
          </p>
        </div>

        {/* Quick Stats & 1-Click Hadir Semua */}
        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700">
            Hadir: <span className="font-numeric text-emerald-800 font-black">{presentCount}</span> / {warehouseEmployees.length} Orang
          </div>

          <button
            onClick={() => onBulkUpdateAll('PRESENT')}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-800 px-3 py-1.5 text-xs font-extrabold text-white shadow-xs hover:bg-emerald-900 transition-all"
          >
            <CheckCheck className="h-4 w-4" />
            1-Klik: Tandai Semua Hadir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Kolom Kiri: Tabel Checklist Absensi Massal */}
        <div className="space-y-4 lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {/* Search Box Karyawan */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama karyawan / posisi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
              <span className="text-[11px] font-bold text-slate-400">
                {filteredEmployees.length} Karyawan
              </span>
            </div>

            {/* List Absensi Cepat */}
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-1">
              {filteredEmployees.map((emp) => {
                const att = attendances.find((a) => a.employeeId === emp.id);
                const currentStatus = att?.status || 'ABSENT';

                return (
                  <div key={emp.id} className="flex items-center justify-between py-3 hover:bg-slate-50 px-2 rounded-lg transition-all">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{emp.fullName}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{emp.position}</div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onUpdateAttendance(emp.id, 'PRESENT')}
                        className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition-all ${
                          currentStatus === 'PRESENT'
                            ? 'bg-emerald-800 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Hadir
                      </button>
                      <button
                        onClick={() => onUpdateAttendance(emp.id, 'PERMISSION')}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-extrabold transition-all ${
                          currentStatus === 'PERMISSION'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Izin
                      </button>
                      <button
                        onClick={() => onUpdateAttendance(emp.id, 'ABSENT')}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-extrabold transition-all ${
                          currentStatus === 'ABSENT'
                            ? 'bg-red-700 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Alfa
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Kasbon & Limit Potongan */}
        <div className="space-y-4 lg:col-span-5">
          {/* Form Kasbon */}
          <form onSubmit={handleLoanSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <DollarSign className="h-4 w-4 text-emerald-800" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Pencatatan Kasbon Karyawan
              </h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Karyawan</label>
              <select
                value={selectedEmpForLoan}
                onChange={(e) => setSelectedEmpForLoan(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
              >
                {warehouseEmployees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.fullName} ({e.position})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nominal Pinjaman (Rp)</label>
              <input
                type="number"
                min="10000"
                step="10000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-numeric font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Keperluan / Keterangan</label>
              <input
                type="text"
                value={loanNotes}
                onChange={(e) => setLoanNotes(e.target.value)}
                placeholder="Contoh: Beli beras / obat"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-800 py-3 text-xs font-extrabold text-white shadow-md shadow-emerald-950/20 hover:bg-emerald-900 transition-all"
            >
              Simpan Pinjaman Kasbon
            </button>
          </form>

          {/* List Kasbon Aktif */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              Kasbon Berjalan (Belum Dipotong Gaji)
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {loans.map((loan) => (
                <div
                  key={loan.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{loan.employeeName}</div>
                    <div className="text-[11px] text-slate-500">
                      {loan.loanDate} • {loan.notes || 'Kasbon'}
                    </div>
                  </div>
                  <div className="font-numeric font-black text-amber-700">
                    Rp{loan.amount.toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
