# SRS: Sistem ERP Kasir Timbangan, Inventory 4 Gudang & Finansial Rongsok
- **Related PRD**: `docs/prd/erp-timbangan-rongsok.prd.md`
- **Target Stack**: Next.js 15+ (App Router) + Supabase JS SDK + Dexie.js (IndexedDB) + Web Serial API

---

## 1. Data Models & Schema (PostgreSQL Supabase)

### A. Tabel Utama
1. `warehouses`: Id, nama ('Gudang 1' - 'Gudang 4'), alamat.
2. `user_profiles`: Id (auth.users fk), full_name, role (`OWNER`, `ADMIN`), warehouse_id.
3. `cash_shifts`: Id, warehouse_id, cashier_id, opened_at, closed_at, initial_cash, expected_closing_cash, actual_closing_cash, cash_difference, notes.
4. `products`: Id, name, category, price_regular, price_partner, current_stock_kg, is_active.
5. `scale_transactions`: Id, invoice_number, warehouse_id, cashier_id, shift_id, seller_name, is_partner, total_amount, sync_status, created_at.
6. `scale_transaction_items`: Id, transaction_id, product_id, gross_weight_kg, refaction_kg, refaction_pct, net_weight_kg, price_per_kg, subtotal.
7. `factory_sales`: Id, invoice_number, warehouse_id, factory_name, product_id, weight_kg, contract_price_per_kg, total_revenue, is_paid.
8. `employees`: Id, full_name, warehouse_id, position, is_active.
9. `employee_loans`: Id, employee_id, warehouse_id, loan_date, amount, is_deducted, notes.
10. `attendances`: Id, employee_id, warehouse_id, attendance_date, check_in, check_out, status (`PRESENT`, `PERMISSION`, `ABSENT`), recorded_by.

### B. Security & RLS Policy
- `ADMIN`: Akses baca/tulis terbatas pada gudang masing-masing untuk operasional shift, transaksi, dan absensi. Dilarang melakukan query ke data laporan profit/loss dan total kas.
- `OWNER`: Full bypass access ke semua tabel, audit log, dan rekap finansial lintas 4 gudang.

---

## 2. API Contract & Endpoint Spec

### Standar Format Envelope
```json
// Sukses
{
  "success": true,
  "data": { ... },
  "error": null
}

// Gagal
{
  "success": false,
  "data": null,
  "error": {
    "code": "UNAUTHORIZED | FORBIDDEN | BAD_REQUEST | SERVER_ERROR",
    "message": "Pesan ramah pengguna"
  }
}
```

### Endpoints
1. `POST /api/shifts/open`: Buka shift kasir pagi.
2. `POST /api/shifts/close`: Tutup shift kasir sore & rekonsiliasi kas.
3. `POST /api/scale-transactions`: Simpan transaksi timbangan multi-item.
4. `POST /api/employees/loans`: Input pinjaman/kasbon karyawan.
5. `POST /api/attendances/bulk-check`: Checklist cepat absensi karyawan gudang.
6. `GET /api/reports/export-excel`: Generator streaming XLSX (Role OWNER only untuk profit_loss).

---

## 3. Hardware Integration & Offline-First Protocol
- **Timbangan Alexa BFS**: Web Serial API (`navigator.serial`) baud rate default 9600, parsing continuous weight string stream dengan debouncing dan fallback manual.
- **Printer Struk**: ESC/POS formatting over Web USB / Native Print Dialog (58mm / 80mm).
- **Offline Storage**: Dexie.js (IndexedDB) table `pending_transactions`, `pending_shifts`, `cached_products`. Background sync otomatis saat event window `online` terpanggil.
