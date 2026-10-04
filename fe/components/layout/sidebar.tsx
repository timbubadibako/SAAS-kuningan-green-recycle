import React from 'react';
import Image from 'next/image';
import {
  Scale,
  Clock,
  Users,
  BarChart3,
  Fuel,
  Truck,
  Landmark,
  BadgeDollarSign,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { UserRole } from '../../types';

interface SidebarProps {
  activeRole: UserRole;
  setActiveRole?: (role: UserRole) => void;
  activeWarehouseId?: number;
  setActiveWarehouseId?: (id: number) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  warehouses?: unknown[];
  isOnline?: boolean;
}

export function Sidebar({
  activeRole,
  activeTab,
  setActiveTab,
  isOnline = true,
}: SidebarProps) {
  const allNavItems = [
    {
      id: 'pos',
      label: 'Kasir Timbangan',
      icon: Scale,
      roleRequired: 'ALL',
      description: 'Timbang & nota masuk',
    },
    {
      id: 'sales',
      label: 'Penjualan Stok',
      icon: BadgeDollarSign,
      roleRequired: 'ALL',
      description: 'Kas masuk pabrik & eceran',
    },
    {
      id: 'shifts',
      label: 'Shift & Kas Laci',
      icon: Clock,
      roleRequired: 'ALL',
      description: 'Rekonsiliasi modal awal & kasir',
    },
    {
      id: 'opex',
      label: 'Biaya Operasional',
      icon: Fuel,
      roleRequired: 'ALL',
      description: 'Kas kecil, solar truk & servis',
    },
    {
      id: 'mutations',
      label: 'Mutasi Stok',
      icon: Truck,
      roleRequired: 'ALL',
      description: 'Surat jalan tonase antar gudang',
    },
    {
      id: 'attendance',
      label: 'Absensi & Kasbon',
      icon: Users,
      roleRequired: 'ALL',
      description: 'Karyawan harian & kasbon',
    },
    {
      id: 'debts',
      label: 'Hutang & Piutang',
      icon: Landmark,
      roleRequired: 'ALL',
      description: 'Tempo pabrik & titip timbang',
    },
    {
      id: 'owner',
      label: 'Laba / Rugi Global',
      icon: BarChart3,
      roleRequired: 'OWNER',
      description: 'Omzet riil, margin & ekspor',
    },
  ];

  const visibleNavItems = allNavItems.filter((item) => {
    if (item.roleRequired === 'OWNER') {
      return activeRole === 'OWNER';
    }
    return true;
  });

  const handleLogout = () => {
    if (confirm('Keluar dari sistem Green Cycle Kuningan?')) {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.reload();
      }
    }
  };

  return (
    <aside className="w-64 h-screen flex flex-col flex-shrink-0 border-r border-slate-200 bg-white text-slate-800 select-none shadow-xs">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center space-x-3">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-xs border border-amber-600/30 flex-shrink-0 bg-white">
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
              <h1 className="font-bold text-xs tracking-tight text-emerald-950 uppercase leading-none">
                Green Cycle
              </h1>
              <span className="text-[10px] font-semibold text-amber-700 tracking-wider">
                KUNINGAN
              </span>
            </div>
            <p className="text-[10px] text-emerald-800 font-medium italic tracking-tight mt-0.5">
              Bersih, Hijau, Berkelanjutan
            </p>
          </div>
        </div>

        {/* Online Status Dot */}
        <div
          title={isOnline ? 'Online' : 'Offline'}
          className="flex items-center"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-emerald-600' : 'bg-amber-500'
            }`}
          />
        </div>
      </div>

      {/* Role Profile Badge */}
      <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50/40 flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-600 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
          <span>{activeRole === 'OWNER' ? 'Executive Owner' : 'Kasir Timbangan'}</span>
        </span>
        <span
          className={`rounded px-1.5 py-0.5 text-[9px] font-mono font-semibold ${
            activeRole === 'OWNER'
              ? 'bg-amber-100 text-amber-900 border border-amber-300'
              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
          }`}
        >
          {activeRole}
        </span>
      </div>

      {/* Navigation Links - Solid Color Transition (No Resize Jump) */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
          Menu Sistem
        </div>

        {visibleNavItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-3 py-2.5 rounded-xl text-xs transition-colors duration-150 text-left ${
                isActive
                  ? 'bg-emerald-900 text-white shadow-xs font-semibold'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium'
              }`}
            >
              <Icon
                className={`w-4 h-4 mr-3 flex-shrink-0 ${
                  isActive ? 'text-amber-400' : 'text-slate-500'
                }`}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate leading-tight">
                  {item.label}
                </div>
                <div
                  className={`text-[10px] truncate leading-tight mt-0.5 ${
                    isActive ? 'text-emerald-200/90' : 'text-slate-400'
                  }`}
                >
                  {item.description}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Logout Footer Button */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/80 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white hover:bg-red-50 hover:border-red-300 py-2 px-3 text-xs font-bold text-red-700 transition-colors shadow-2xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar (Logout)</span>
        </button>
      </div>
    </aside>
  );
}
