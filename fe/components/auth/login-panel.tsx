'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Lock, User, ShieldAlert, ArrowRight } from 'lucide-react';
import { UserRole } from '../../types';

interface LoginPanelProps {
  onLoginSuccess: (user: { fullName: string; role: UserRole; username: string }) => void;
}

export function LoginPanel({ onLoginSuccess }: LoginPanelProps) {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const cleanUser = username.trim().toLowerCase();
      const cleanPin = pin.trim();

      // Autentikasi Kredensial Default Gudang (Owner vs Kasir)
      if (cleanUser === 'owner' && (cleanPin === '8888' || cleanPin === '123456')) {
        onLoginSuccess({
          fullName: 'Bpk. David (Pimpinan)',
          role: 'OWNER',
          username: 'owner',
        });
      } else if ((cleanUser === 'kasir' || cleanUser === 'admin') && (cleanPin === '1234' || cleanPin === '123456')) {
        onLoginSuccess({
          fullName: 'Siti Rahmawati (Kasir)',
          role: 'ADMIN',
          username: cleanUser,
        });
      } else {
        setErrorMsg('Username atau PIN keamanan salah. Hubungi administrator.');
        setIsLoading(false);
      }
    }, 400);
  };

  // Quick fill helper for testing
  const setDemoAccount = (u: string, p: string) => {
    setUsername(u);
    setPin(p);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50/30 font-sans">
      <div className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-xl border border-slate-200/80">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex relative w-14 h-14 rounded-2xl overflow-hidden shadow-xs border border-amber-600/30 p-1 bg-white mb-1">
            <Image
              src="/logo.png"
              alt="Green Cycle Kuningan"
              fill
              className="object-contain p-1"
              priority
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Green Cycle Kuningan
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Sistem ERP Kasir Timbangan Digital Terintegrasi
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200 animate-in fade-in">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="mt-5 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ID Pengguna / Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Misal: kasir atau owner"
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition-all font-medium"
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              PIN Keamanan Akses
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Masukkan 4-6 digit PIN"
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition-all font-medium font-mono"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 py-3 text-xs font-bold text-white shadow-md shadow-emerald-950/20 transition-all disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? 'Memverifikasi...' : 'Masuk ke Sistem'}
            {!isLoading && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </form>

        {/* Demo Fast Fill */}
        <div className="mt-6 border-t border-slate-100 pt-4 text-center">
          <p className="text-[11px] text-slate-400 font-medium mb-2">Akses Cepat Pengujian:</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDemoAccount('kasir', '1234')}
              className="flex-1 py-1.5 px-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 transition-colors"
            >
              Kasir (1234)
            </button>
            <button
              type="button"
              onClick={() => setDemoAccount('owner', '8888')}
              className="flex-1 py-1.5 px-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-amber-900 transition-colors"
            >
              Owner (8888)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
