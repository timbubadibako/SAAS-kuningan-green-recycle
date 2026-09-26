'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Target,
  Truck,
  Tag,
  Calculator,
  FileSpreadsheet,
  Zap,
  Search,
  Users,
  ShieldCheck,
  Activity,
  Sun,
  Moon,
  Lock,
  UserCog,
} from 'lucide-react';
import { MOCK_TEAMS } from '../../lib/mock-data';
import { UserRole } from '../../types';
import { ToastProvider, useToast } from '../ui/toast';
import { CommandPalette } from '../ui/command-palette';
import { ThemeProvider, useTheme } from '../theme/theme-context';
import { isRouteAllowed, getDefaultRouteForRole } from '../../lib/rbac';

interface AppShellProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: '/', label: 'Executive Dashboard', badge: 'FR-01', icon: LayoutDashboard },
  { href: '/orders', label: 'Pesanan H+1', badge: 'FR-02', icon: Package },
  { href: '/ads-spend', label: 'Ads Spend & CPR', badge: 'FR-03', icon: Target },
  { href: '/undel-tracking', label: 'Undel & Retur RTS', badge: 'FR-04', icon: Truck },
  { href: '/master-products', label: 'Master Produk & Alias', badge: 'FR-05', icon: Tag },
  { href: '/budget-calculator', label: 'Safe CPR Calculator', badge: 'FR-06', icon: Calculator },
  { href: '/reports/profit-loss', label: 'Laporan Laba Rugi', badge: 'FR-07', icon: FileSpreadsheet },
  { href: '/forecasting', label: 'AI Forecasting & Leakage', badge: 'FR-08', icon: Zap },
  { href: '/settings/users', label: 'Manajemen Akun & Role', badge: 'MASTER', icon: UserCog },
];

function InnerAppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [selectedTeam, setSelectedTeam] = useState<string>('ALL');
  const [activeRole, setActiveRole] = useState<UserRole>('OWNER');
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // Auto route guard: redirect to role's default page if current route is unauthorized
  useEffect(() => {
    if (!isRouteAllowed(pathname, activeRole)) {
      const defaultRoute = getDefaultRouteForRole(activeRole);
      showToast(`Akses ke halaman ini dibatasi untuk role ${activeRole}. Dialihkan ke ${defaultRoute}`, 'error');
      router.replace(defaultRoute);
    }
  }, [pathname, activeRole, router, showToast]);

  // Handle Team Selection locking for ADVERTISER
  useEffect(() => {
    if (activeRole === 'ADVERTISER') {
      setSelectedTeam('1'); // Kunci ke Tim 1 (Jabar ScaleUp)
    }
  }, [activeRole]);

  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  const isDark = theme === 'dark';

  // Filter NAV_ITEMS strictly based on RBAC permissions
  const visibleNavItems = NAV_ITEMS.filter((item) => isRouteAllowed(item.href, activeRole));

  return (
    <div className={`h-screen w-screen flex overflow-hidden ${isDark ? 'dark-canvas' : 'light-canvas'} antialiased font-sans`}>
      {/* Fixed Sidebar */}
      <aside className={`w-64 h-screen flex flex-col flex-shrink-0 border-r shadow-2xl relative z-30 overflow-hidden ${
        isDark
          ? 'bg-slate-950/90 backdrop-blur-xl text-slate-200 border-slate-800/80'
          : 'bg-white text-slate-800 border-slate-200'
      }`}>
        {/* Brand Header */}
        <div className={`p-5 border-b flex-shrink-0 ${isDark ? 'border-slate-800/80' : 'border-slate-100'}`}>
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-bold text-slate-950 text-sm shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/50">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className={`font-bold text-sm tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Q-Flow ERP</h1>
                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-mono">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Predictive Intelligence</p>
            </div>
          </div>
        </div>

        {/* Quick Search Shortcut */}
        <div className={`p-3 border-b flex-shrink-0 ${isDark ? 'border-slate-800/60 bg-slate-950/40' : 'border-slate-100 bg-slate-50/60'}`}>
          <button
            onClick={() => setIsCommandOpen(true)}
            className={`w-full border rounded-xl px-3 py-2 text-xs flex items-center justify-between transition-all duration-150 cursor-pointer group ${
              isDark
                ? 'bg-slate-900/90 hover:bg-slate-850 border-slate-800 text-slate-400'
                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            <span className="flex items-center gap-2 group-hover:text-emerald-500">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
              <span>Quick Search...</span>
            </span>
            <kbd className={`text-[10px] border px-1.5 py-0.5 rounded font-mono shadow-xs ${
              isDark ? 'bg-slate-800/80 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600'
            }`}>
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Global Filter Bar */}
        <div className={`px-4 py-3 border-b space-y-2.5 flex-shrink-0 ${isDark ? 'border-slate-800/60' : 'border-slate-100'}`}>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users className="w-3 h-3 text-emerald-500" />
                <span>Active Team</span>
              </label>
              {activeRole === 'ADVERTISER' && (
                <span className="text-[9px] font-bold text-amber-500 flex items-center gap-0.5">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Terkunci</span>
                </span>
              )}
            </div>
            <select
              value={selectedTeam}
              disabled={activeRole === 'ADVERTISER'}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className={`w-full text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 border ${
                activeRole === 'ADVERTISER'
                  ? 'opacity-80 cursor-not-allowed bg-slate-100 dark:bg-slate-900/60 text-slate-500 border-slate-300 dark:border-slate-800'
                  : isDark
                  ? 'bg-slate-900 text-slate-200 border-slate-700/80'
                  : 'bg-slate-50 text-slate-800 border-slate-200'
              }`}
            >
              {activeRole !== 'ADVERTISER' && <option value="ALL">Konsolidasi 11 Tim</option>}
              {MOCK_TEAMS.map((t) => (
                <option key={t.id} value={t.id.toString()}>
                  {t.name} ({t.leaderName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
              <ShieldCheck className="w-3 h-3 text-indigo-500" />
              <span>Simulasi RBAC</span>
            </label>
            <select
              value={activeRole}
              onChange={(e) => {
                const newRole = e.target.value as UserRole;
                setActiveRole(newRole);
              }}
              className={`w-full text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 border font-semibold ${
                isDark ? 'bg-slate-900 text-emerald-400 border-slate-700/80' : 'bg-slate-50 text-emerald-700 border-slate-200'
              }`}
            >
              <option value="OWNER">OWNER (Executive Suite)</option>
              <option value="ADVERTISER">ADVERTISER (Media Buyer)</option>
              <option value="ADMIN_INPUT">ADMIN_INPUT (Closing H+1)</option>
              <option value="ADMIN_UNDEL">ADMIN_UNDEL (Retur Hub)</option>
              <option value="FINANCE">FINANCE (Margin Auditor)</option>
            </select>
          </div>
        </div>

        {/* Scrollable Navigation Links - Filtered Dynamically */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 relative ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-bold shadow-lg shadow-emerald-500/20'
                    : isDark
                    ? 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isActive
                      ? 'bg-slate-950/20 text-slate-950 font-extrabold'
                      : isDark
                      ? 'bg-slate-900 text-slate-500 border border-slate-800'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {item.badge}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className={`p-4 border-t flex-shrink-0 ${isDark ? 'border-slate-800/80 bg-slate-950/90' : 'border-slate-100 bg-slate-50'}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 font-bold flex items-center justify-center text-xs flex-shrink-0 border border-emerald-500/30">
              SY
            </div>
            <div className="truncate flex-1 min-w-0">
              <p className={`text-xs font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>Syifa Pajril Yaum</p>
              <p className="text-[11px] text-emerald-500 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Role: {activeRole}
              </p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/50 flex-shrink-0" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar Header with Theme Switcher */}
        <header className={`h-14 backdrop-blur-xl border-b px-6 flex items-center justify-between flex-shrink-0 z-20 ${
          isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-white/80 border-slate-200'
        }`}>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-medium text-slate-400">Q-Flow Intelligence /</span>
            <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              {NAV_ITEMS.find((n) => n.href === pathname)?.label || 'Overview'}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Animated Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-1.5 text-xs font-medium ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-amber-300 hover:bg-slate-800'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title="Toggle Dark / Light Mode"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                  <span className="text-[11px] text-slate-300">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-700" />
                  <span className="text-[11px] text-slate-700">Dark</span>
                </>
              )}
            </button>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              COD Engine Online
            </span>
            <span className="text-xs text-slate-400 font-mono">25 Sep 2026</span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 relative z-10">
          {children}
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onSelectTeam={(teamId) => setSelectedTeam(teamId)}
        role={activeRole}
      />
    </div>
  );
}

export function AppShell({ children }: AppShellProps) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <InnerAppShell>{children}</InnerAppShell>
      </ToastProvider>
    </ThemeProvider>
  );
}
