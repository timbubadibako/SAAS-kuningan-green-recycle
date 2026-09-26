'use client';

import React, { useState } from 'react';
import {
  UserCog,
  UserPlus,
  Mail,
  Shield,
  Users,
  Search,
  CheckCircle2,
  Clock,
  Ban,
  Trash2,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { MOCK_USER_ACCOUNTS, MOCK_TEAMS } from '../../../lib/mock-data';
import { UserAccount, UserRole, AccountStatus } from '../../../types';
import { useToast } from '../../../components/ui/toast';

export default function UserSettingsPage() {
  const { showToast } = useToast();
  const [accounts, setAccounts] = useState<UserAccount[]>(MOCK_USER_ACCOUNTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Invite Form State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFullName, setInviteFullName] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('ADVERTISER');
  const [inviteTeamId, setInviteTeamId] = useState<number>(1);

  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || acc.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      showToast('Masukkan alamat email valid!', 'error');
      return;
    }
    if (!inviteFullName.trim()) {
      showToast('Nama lengkap pengguna wajib diisi!', 'error');
      return;
    }

    const assignedTeam = inviteRole === 'ADVERTISER' ? MOCK_TEAMS.find((t) => t.id === inviteTeamId) : undefined;

    const newAccount: UserAccount = {
      id: `usr-${Date.now()}`,
      email: inviteEmail.trim().toLowerCase(),
      fullName: inviteFullName.trim(),
      role: inviteRole,
      teamId: assignedTeam?.id,
      teamName: assignedTeam?.name,
      status: 'INVITED',
      invitedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };

    setAccounts([newAccount, ...accounts]);
    setShowInviteModal(false);
    showToast(`Undangan akun terkirim ke ${newAccount.email} melalui Supabase Auth!`, 'success');

    // Reset Form
    setInviteEmail('');
    setInviteFullName('');
    setInviteRole('ADVERTISER');
    setInviteTeamId(1);
  };

  const handleChangeRole = (userId: string, newRole: UserRole) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === userId) {
          const updatedTeam = newRole === 'ADVERTISER' ? acc.teamName || 'Tim 1' : undefined;
          const updatedTeamId = newRole === 'ADVERTISER' ? acc.teamId || 1 : undefined;
          return { ...acc, role: newRole, teamName: updatedTeam, teamId: updatedTeamId };
        }
        return acc;
      })
    );
    showToast(`Role berhasil diubah menjadi ${newRole}`, 'success');
  };

  const handleToggleStatus = (userId: string, currentStatus: AccountStatus) => {
    const newStatus: AccountStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === userId ? { ...acc, status: newStatus } : acc))
    );
    showToast(`Status akun berhasil diubah menjadi ${newStatus}`, newStatus === 'ACTIVE' ? 'success' : 'error');
  };

  const handleDeleteAccount = (userId: string, userEmail: string) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== userId));
    showToast(`Akun ${userEmail} berhasil dicabut hak aksesnya`, 'info');
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'OWNER':
        return 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-500/30';
      case 'ADVERTISER':
        return 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500/30';
      case 'ADMIN_INPUT':
        return 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30';
      case 'ADMIN_UNDEL':
        return 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/30';
      case 'FINANCE':
        return 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-500/30';
    }
  };

  const getStatusBadge = (status: AccountStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>Aktif</span>
          </span>
        );
      case 'INVITED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30">
            <Clock className="w-3 h-3" />
            <span>Menunggu Verifikasi</span>
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30">
            <Ban className="w-3 h-3" />
            <span>Ditangguhkan</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2 text-slate-900 dark:text-white">
            <UserCog className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Manajemen Pengguna & Otoritas Role (Master)</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30 font-mono">
              Owner / Master Exclusive
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Undang akun baru melalui email terverifikasi Supabase, atur pembatasan role media buyer, dan kelola hak akses tim.
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all duration-150 self-start sm:self-auto cursor-pointer flex items-center gap-1.5"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Akun Baru</span>
        </button>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card-theme p-4.5 rounded-2xl">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Total Akun Terdaftar</span>
          </span>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1.5">{accounts.length}</p>
        </div>
        <div className="card-theme p-4.5 rounded-2xl">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Akun Advertiser Aktif</span>
          </span>
          <p className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1.5">
            {accounts.filter((a) => a.role === 'ADVERTISER' && a.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="card-theme p-4.5 rounded-2xl">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Undangan Menunggu</span>
          </span>
          <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1.5">
            {accounts.filter((a) => a.status === 'INVITED').length}
          </p>
        </div>
        <div className="card-theme p-4.5 rounded-2xl">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Master / Owner Account</span>
          </span>
          <p className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-1.5">
            {accounts.filter((a) => a.role === 'OWNER').length}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-theme p-3.5 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, email akun..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:max-w-xs text-xs rounded-xl pl-8 pr-3 py-1.5 border border-slate-300 dark:border-slate-700/60 bg-white dark:bg-slate-900/40 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Shield className="w-3 h-3" />
            <span>Role:</span>
          </span>
          {(['ALL', 'OWNER', 'ADVERTISER', 'ADMIN_INPUT', 'ADMIN_UNDEL', 'FINANCE'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition-all duration-150 cursor-pointer ${
                roleFilter === r
                  ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700/60'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="card-theme rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-900/80 text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Pengguna & Email</th>
                <th className="px-4 py-3.5">Hak Akses (Role)</th>
                <th className="px-4 py-3.5">Scope Penugasan Tim</th>
                <th className="px-4 py-3.5">Status Akun</th>
                <th className="px-4 py-3.5">Waktu Diundang</th>
                <th className="px-4 py-3.5 text-center">Aksi & Otoritas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {filteredAccounts.map((acc) => {
                const isOwnerAccount = acc.role === 'OWNER';
                return (
                  <tr key={acc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                          {acc.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{acc.fullName}</span>
                            {isOwnerAccount && (
                              <span className="text-[9px] bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/40 px-1 rounded font-bold font-mono">
                                MASTER
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{acc.email}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {isOwnerAccount ? (
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border font-mono ${getRoleBadge(acc.role)}`}>
                          OWNER (Full Master Access)
                        </span>
                      ) : (
                        <select
                          value={acc.role}
                          onChange={(e) => handleChangeRole(acc.id, e.target.value as UserRole)}
                          className={`text-xs rounded-xl px-2.5 py-1 font-semibold border ${getRoleBadge(acc.role)} bg-white dark:bg-slate-900 focus:outline-none cursor-pointer`}
                        >
                          <option value="ADVERTISER" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                            ADVERTISER (Media Buyer)
                          </option>
                          <option value="ADMIN_INPUT" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                            ADMIN_INPUT (Closing H+1)
                          </option>
                          <option value="ADMIN_UNDEL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                            ADMIN_UNDEL (Retur Hub)
                          </option>
                          <option value="FINANCE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                            FINANCE (Margin Auditor)
                          </option>
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {acc.role === 'ADVERTISER' ? (
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-300 dark:border-slate-700">
                          {acc.teamName || 'Tim 1 (Default)'}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Konsolidasi Seluruh Tim</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getStatusBadge(acc.status)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {acc.invitedAt}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-center">
                      {!isOwnerAccount ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(acc.id, acc.status)}
                            className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                              acc.status === 'SUSPENDED'
                                ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-amber-500 border-slate-300 dark:border-slate-700'
                            }`}
                            title={acc.status === 'SUSPENDED' ? 'Aktifkan Kembali' : 'Tangguhkan Akun'}
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAccount(acc.id, acc.email)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-500 border border-slate-300 dark:border-slate-700 text-xs cursor-pointer transition-colors"
                            title="Cabut Akses Pengguna"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic font-mono">Master Protected</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal Dialog */}
      {showInviteModal && (
        <div className="modal-overlay">
          <div className="card-theme rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Undang Akun via Supabase Auth</span>
              </h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInviteUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Akun Terverifikasi
                </label>
                <input
                  required
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="advertiser@qiyarmedia.com"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Undangan link aktivasi resmi akan dikirim otomatis ke alamat email ini.
                </p>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap Pengguna
                </label>
                <input
                  required
                  type="text"
                  value={inviteFullName}
                  onChange={(e) => setInviteFullName(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="Contoh: Rian Pratama"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Hak Akses (Role)
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                >
                  <option value="ADVERTISER" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    ADVERTISER (Media Buyer Tim)
                  </option>
                  <option value="ADMIN_INPUT" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    ADMIN_INPUT (Closing H+1)
                  </option>
                  <option value="ADMIN_UNDEL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    ADMIN_UNDEL (Retur & Undel Hub)
                  </option>
                  <option value="FINANCE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    FINANCE (Margin & Keuangan)
                  </option>
                </select>
              </div>

              {inviteRole === 'ADVERTISER' && (
                <div className="bg-indigo-50/60 dark:bg-indigo-950/20 p-3 rounded-xl border border-indigo-200 dark:border-indigo-500/30 space-y-1.5">
                  <label className="block font-semibold text-indigo-900 dark:text-indigo-300">
                    Pilih Penugasan Tim Media Buying
                  </label>
                  <select
                    value={inviteTeamId}
                    onChange={(e) => setInviteTeamId(Number(e.target.value))}
                    className="w-full border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-slate-900 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white font-medium text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                  >
                    {MOCK_TEAMS.map((t) => (
                      <option key={t.id} value={t.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {t.name} ({t.leaderName})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400">
                    Akun ini akan terkunci hanya dapat mengakses performa & input spend tim ini saja.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3.5 py-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Kirim Email Undangan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
