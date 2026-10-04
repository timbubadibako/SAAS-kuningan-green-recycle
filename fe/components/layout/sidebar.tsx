'use client';

import React from 'react';
import Image from 'next/image';
import {
  Scale,
  Clock,
  Users,
  BarChart3,
  Store,
  ShieldCheck,
  Fuel,
  Truck,
  Landmark,
  BadgeDollarSign,
  Leaf,
} from 'lucide-react';
import { UserRole, Warehouse } from '../../types';

interface SidebarProps {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  activeWarehouseId: number;
  setActiveWarehouseId: (id: number) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  warehouses: Warehouse[];
  isOnline?: boolean;
}

export function Sidebar({
  activeRole,
  setActiveRole,
  activeWarehouseId,
  setActiveWarehouseId,
  activeTab,
  setActiveTab,
  warehouses,
  isOnline = true,
}: SidebarProps) {
  const allNavItems = [
    {
      id: 'pos',
      label: 'Kasir Timbangan (Beli)',
      badge: 'OFFLINE',
      icon: Scale,
      roleRequired: 'ALL',
      description: 'Timbang rongsok & nota keluar',
    },
    {
      id: 'sales',
      label: 'Penjualan Stok (Kas Masuk)',
      badge: 'KAS MASUK',
      icon: BadgeDollarSign,
      roleRequired: 'ALL',
      description: 'Peleburan & pembeli eceran',
    },
    {
      id: 'shifts',
      label: 'Shift & Rekonsiliasi Kas',
      badge: 'KASIR',
      icon: Clock,
      roleRequired: 'ALL',
      description: 'Modal awal, arus kas & fisik laci',
    },
    {
      id: 'opex',
      label: 'Biaya Operasional (OPEX)',
      badge: 'KAS KECIL',
      icon: Fuel,
      roleRequired: 'ALL',
      description: 'Bensin truk, karung, servis',
    },
    {
      id: 'mutations',
      label: 'Mutasi Stok Antar Gudang',
      badge: 'SURAT JALAN',
      icon: Truck,
      roleRequired: 'ALL',
      description: 'Kirim antar Gudang 1, 2, 3, 4',
    },
    {
      id: 'attendance',
      label: 'Absensi Cepat Karyawan',
      badge: '1-KLIK',
      icon: Users,
      roleRequired: 'ALL',
      description: 'Checklist massal & kasbon',
    },
    {
      id: 'debts',
      label: 'Hutang & Piutang (AP/AR)',
      badge: 'TEMPO',
      icon: Landmark,
      roleRequired: 'ALL',
      description: 'Tempo pabrik & titip timbang',
    },
    {
      id: 'owner',
      label: 'Laba / Rugi & Kas Global',
      badge: 'FINANSIAL',
      icon: BarChart3,
      roleRequired: 'OWNER',
      description: 'Omzet riil, margin & ekspor Excel',
    },
  ];

  const visibleNavItems = allNavItems.filter((item) => {
    if (item.roleRequired === 'OWNER') {
      return activeRole === 'OWNER';
    }
    return true;
  });

  return (
    <aside className="w-72 h-screen flex flex-col flex-shrink-0 border-r border-slate-200 bg-white text-slate-800 select-none shadow-xs">
      {/* Brand Header with GC Logo */}
      <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center space-x-2.5">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-xs border border-amber-600/30 flex-shrink-0 bg-white">
            <Image
              src="/logo.png"
              alt="Green Cycle Kuningan Logo"
              fill
              className="object-contain p-0.5"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h1 className="font-black text-xs tracking-tight text-emerald-950 uppercase leading-none">
                Green Cycle
              </h1>
              <span className="text-[10px] font-black text-amber-700 tracking-wider">
                KUNINGAN
              </span>
            </div>
            <p className="text-[10px] text-emerald-800 font-semibold italic tracking-tight mt-0.5">
              Bersih, Hijau, Berkelanjutan
            </p>
          </div>
        </div>

        {/* Online / Offline status */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-0.5 rounded-full shadow-2xs">
          <span
            className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-emerald-600 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span className="text-[9px] font-mono font-bold text-slate-600">
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Global Filter Bar: Active Warehouse & Role Switcher */}
      <div className="px-4 py-3 border-b border-slate-200 space-y-3 bg-slate-50/40">
        {/* Warehouse Selector */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1.5">
            <Store className="w-3.5 h-3.5 text-emerald-800" />
            <span>Lokasi Gudang</span>
          </label>
          <select
            value={activeWarehouseId}
            onChange={(e) => setActiveWarehouseId(Number(e.target.value))}
            className="w-full text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-800 border bg-white text-slate-900 border-slate-300 font-bold shadow-2xs cursor-pointer"
          >
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Akses User */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
              <span>Akses Terverifikasi</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">SUPABASE</span>
          </label>
          <div className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 border border-slate-200">
            <span className="text-xs font-black text-slate-800 uppercase tracking-tight">
              {activeRole === 'OWNER' ? 'Owner / Pimpinan' : 'Kasir Gudang'}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold font-mono ${
                activeRole === 'OWNER'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}
            >
              {activeRole}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {activeRole === 'OWNER' ? 'Menu Eksekutif & Gudang' : 'Menu Operasional Gudang'}
        </div>

        {visibleNavItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 text-left relative group ${
                isActive
                  ? 'bg-emerald-900 text-amber-300 font-bold shadow-md shadow-emerald-950/20'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-emerald-800'
                  }`}
                />
                <div>
                  <div className={isActive ? 'text-white font-bold' : 'text-slate-800 font-semibold'}>
                    {item.label}
                  </div>
                  <div
                    className={`text-[10px] truncate max-w-[130px] ${
                      isActive ? 'text-amber-200/80 font-medium' : 'text-slate-500'
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
              </div>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {item.badge}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Profile Footer */}
      <div className="p-3.5 border-t border-slate-200 bg-slate-50/80 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-900 text-amber-400 font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-xs border border-amber-600/30">
            {activeRole === 'OWNER' ? 'GC' : 'KS'}
          </div>
          <div className="truncate flex-1 min-w-0">
            <p className="text-xs font-bold truncate text-slate-900">
              {activeRole === 'OWNER' ? 'Owner / Pimpinan' : 'Kasir Gudang'}
            </p>
            <p className="text-[11px] text-emerald-800 font-bold flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Role: {activeRole}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
