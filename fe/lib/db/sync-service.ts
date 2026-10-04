import { localDB } from './dexie-db';
import { supabase, isSupabaseConfigured } from '../supabase/client';
import { ScaleTransaction, CashShift, FactorySale, OpexExpense } from '../../types';

export class OfflineSyncService {
  /**
   * Simpan transaksi timbangan (Offline-first write)
   */
  static async saveScaleTransaction(tx: ScaleTransaction): Promise<{ synced: boolean }> {
    // 1. Simpan selalu ke IndexedDB lokal terlebih dahulu (jaminan anti mati listrik)
    await localDB.scaleTransactions.put({
      ...tx,
      syncStatus: false,
    });

    // 2. Jika online dan Supabase dikonfigurasi, sync langsung
    if (navigator.onLine && isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('scale_transactions').insert({
          id: tx.id,
          invoice_number: tx.invoiceNumber,
          warehouse_id: tx.warehouseId,
          cashier_id: tx.cashierId,
          seller_name: tx.sellerName,
          is_partner: tx.isPartner,
          total_amount: tx.totalAmount,
          sync_status: true,
          created_at: tx.createdAt,
        });

        if (!error) {
          // Tandai status sync di localDB
          await localDB.scaleTransactions.update(tx.id, { syncStatus: true });
          return { synced: true };
        }
      } catch (err) {
        console.warn('[Sync] Gagal sync langsung ke Supabase, tetap tersimpan di lokal:', err);
      }
    }

    return { synced: false };
  }

  /**
   * Sync semua antrean transaksi lokal yang tertunda ke Supabase
   */
  static async syncPendingTransactions(): Promise<number> {
    if (!navigator.onLine || !isSupabaseConfigured) return 0;

    const pending = await localDB.scaleTransactions.where('syncStatus').equals(0).toArray();
    let syncedCount = 0;

    for (const tx of pending) {
      try {
        const { error } = await supabase.from('scale_transactions').upsert({
          id: tx.id,
          invoice_number: tx.invoiceNumber,
          warehouse_id: tx.warehouseId,
          cashier_id: tx.cashierId,
          seller_name: tx.sellerName,
          is_partner: tx.isPartner,
          total_amount: tx.totalAmount,
          sync_status: true,
          created_at: tx.createdAt,
        });

        if (!error) {
          await localDB.scaleTransactions.update(tx.id, { syncStatus: true });
          syncedCount++;
        }
      } catch (err) {
        console.error('[Sync] Gagal upload item:', tx.id, err);
      }
    }

    return syncedCount;
  }
}
