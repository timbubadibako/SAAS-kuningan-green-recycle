'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  Package,
  Target,
  Truck,
  Tag,
  Calculator,
  FileSpreadsheet,
  Zap,
  Users,
  CornerDownLeft,
  UserCog,
} from 'lucide-react';
import { MOCK_TEAMS, MOCK_PRODUCTS } from '../../lib/mock-data';
import { UserRole } from '../../types';
import { isRouteAllowed } from '../../lib/rbac';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTeam: (teamId: string) => void;
  role?: UserRole;
}

export function CommandPalette({ isOpen, onClose, onSelectTeam, role = 'OWNER' }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const NAV_ACTIONS = [
    { label: 'Executive Dashboard', badge: 'FR-01', href: '/', icon: LayoutDashboard },
    { label: 'Input Pesanan H+1', badge: 'FR-02', href: '/orders', icon: Package },
    { label: 'Log Ads Spend & CPR', badge: 'FR-03', href: '/ads-spend', icon: Target },
    { label: 'Undel & Retur RTS Hub', badge: 'FR-04', href: '/undel-tracking', icon: Truck },
    { label: 'Master Produk & Alias', badge: 'FR-05', href: '/master-products', icon: Tag },
    { label: 'Kalkulator Safe CPR', badge: 'FR-06', href: '/budget-calculator', icon: Calculator },
    { label: 'Laporan Laba Rugi Riil', badge: 'FR-07', href: '/reports/profit-loss', icon: FileSpreadsheet },
    { label: 'AI Forecasting & Leakage', badge: 'FR-08', href: '/forecasting', icon: Zap },
    { label: 'Manajemen Akun & Role (Invite)', badge: 'MASTER', href: '/settings/users', icon: UserCog },
  ].filter((item) => isRouteAllowed(item.href, role));

  const filteredNav = NAV_ACTIONS.filter((n) => n.label.toLowerCase().includes(query.toLowerCase()));
  const filteredTeams = (role === 'ADVERTISER' ? MOCK_TEAMS.slice(0, 1) : MOCK_TEAMS).filter(
    (t) => t.name.toLowerCase().includes(query.toLowerCase()) || t.leaderName.toLowerCase().includes(query.toLowerCase())
  );
  const filteredProducts = MOCK_PRODUCTS.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md z-[100] flex items-start justify-center pt-20 p-4">
      <div className="card-theme border-slate-300 dark:border-slate-700/80 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            autoFocus
            type="text"
            placeholder="Cari menu navigasi, tim media buying, master SKU... (Esc untuk tutup)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none placeholder-slate-400"
          />
          <kbd className="text-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-500 px-2 py-0.5 rounded-md font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-3 text-xs">
          {/* Navigation Section */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
              Menu Navigasi
            </span>
            <div className="space-y-0.5">
              {filteredNav.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      router.push(item.href);
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <span>Buka</span>
                      <CornerDownLeft className="w-3 h-3" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Team Filter Section */}
          {filteredTeams.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
                Pilih Tim Media Buying
              </span>
              <div className="grid grid-cols-2 gap-1">
                {filteredTeams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => {
                      onSelectTeam(team.id.toString());
                      onClose();
                    }}
                    className="text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center justify-between cursor-pointer border border-slate-200/60 dark:border-slate-800/60"
                  >
                    <span className="truncate">{team.name} ({team.leaderName})</span>
                    <span className="text-[10px] text-emerald-500 font-mono">Pilih</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Master Product Section */}
          {filteredProducts.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
                Master Produk & SKU
              </span>
              <div className="space-y-0.5">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-300"
                  >
                    <span className="truncate">{p.name}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">{p.sku}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 px-4">
          <span>Tekan <strong>Cmd/Ctrl + K</strong> untuk pencarian cepat</span>
          <span className="font-mono text-emerald-500 font-semibold">Q-Flow Intelligence</span>
        </div>
      </div>
    </div>
  );
}
