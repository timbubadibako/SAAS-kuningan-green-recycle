'use client';

import React, { useState } from 'react';
import { Tag, Plus, Check } from 'lucide-react';
import { MOCK_PRODUCTS } from '../../lib/mock-data';
import { Product } from '../../types';

export default function MasterProductsPage() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [newAliasInput, setNewAliasInput] = useState<{ [key: string]: string }>({});

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  const handleAddAlias = (productId: string) => {
    const aliasText = (newAliasInput[productId] || '').trim();
    if (!aliasText) return;

    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId && !p.aliases.includes(aliasText)
          ? { ...p, aliases: [...p.aliases, aliasText] }
          : p
      )
    );

    setNewAliasInput({ ...newAliasInput, [productId]: '' });
  };

  const handleRemoveAlias = (productId: string, aliasToRemove: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, aliases: p.aliases.filter((a) => a !== aliasToRemove) }
          : p
      )
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <span>Master Produk & Alias Dictionary</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Anti-Alias Hell
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Petakan nama campaign iklan liar advertiser secara otomatis ke Master SKU induk agar HPP dan margin 100% akurat.
        </p>
      </div>

      {/* Product Cards List */}
      <div className="grid grid-cols-1 gap-4">
        {products.map((prod) => (
          <div key={prod.id} className="card-theme rounded-2xl p-6 shadow-lg space-y-4">
            {/* Top Product Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-500/20">
                    {prod.sku}
                  </span>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">{prod.name}</h2>
                </div>
              </div>
              <div className="flex items-center gap-5 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">HPP (Modal Dasar):</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{formatIDR(prod.cogsPrice)}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Harga Jual COD:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{formatIDR(prod.retailPrice)}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Gross Margin:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                    {formatIDR(prod.retailPrice - prod.cogsPrice)} ({Math.round(((prod.retailPrice - prod.cogsPrice) / prod.retailPrice) * 100)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Alias Mapping Section */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Tag Alias Campaign Iklan Terdaftar ({prod.aliases.length}):</span>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  Auto-link HPP {formatIDR(prod.cogsPrice)}
                </span>
              </div>

              {/* Badges List */}
              <div className="flex flex-wrap items-center gap-2">
                {prod.aliases.map((alias) => (
                  <span
                    key={alias}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700/80 shadow-xs"
                  >
                    <span>{alias}</span>
                    <button
                      onClick={() => handleRemoveAlias(prod.id, alias)}
                      className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer text-xs"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Alias Input */}
              <div className="flex items-center gap-2 pt-2 max-w-md">
                <input
                  type="text"
                  placeholder="Ketik nama alias baru (contoh: Minyak Tulang Sakit)..."
                  value={newAliasInput[prod.id] || ''}
                  onChange={(e) =>
                    setNewAliasInput({ ...newAliasInput, [prod.id]: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAlias(prod.id);
                    }
                  }}
                  className="flex-1 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddAlias(prod.id)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  + Tambah Alias
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
