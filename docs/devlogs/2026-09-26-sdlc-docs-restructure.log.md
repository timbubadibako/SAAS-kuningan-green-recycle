# Dev Log: Standardisasi SDLC & Reposisi Dokumentasi
- **Date**: 2026-09-26
- **Engineer**: Antigravity Assistant

---

## Session Timeline
- `[19:46]`: Mengaktifkan skill SDLC Workflow Engine.
- `[19:47]`: Audit direktori dan membaca dokumen awal (`PRD_AND_SRS.md`, `ARCHITECTURE_AND_ERD.md`, `API_SPECIFICATION.md`, `workflow-rules.md`).
- `[19:48]`: Menganalisis inkonsistensi struktur dokumen (dokumen lama tersimpan flat di root `docs/` tanpa pemisahan fase SDLC).
- `[19:49]`: Membuat folder terstandar SDLC (`docs/prd/`, `docs/srs/`, `docs/adr/`, `docs/plans/`, `docs/devlogs/`, `docs/qa/`).
- `[19:50]`: Menghasilkan dokumen fase 1-3 lengkap dan terstruktur (PRD, SRS, ADR, Plan).
- `[19:53]`: Membaca dan memindahkan seluruh file referensi UI design (`app/` dan `components/` di root) ke dalam `fe/ref-design/` agar root project bersih dan referensi design terpusat di frontend.
- `[19:57]`: Menyiapkan skema database Supabase PostgreSQL + RLS (`supabase/migrations/20260926000001_init_schema.sql`), strict domain types (`fe/types/index.ts`), mock data domain lengkap (`fe/lib/mock/data.ts`), dan Web Serial Hardware Hook Alexa BFS dengan switch Virtual/Mock Mode (`fe/lib/hardware/use-scale-serial.ts` + `escpos-builder.ts`).
- `[20:11]`: Mengimplementasikan seluruh UI multi-role & modul POS Timbangan lengkap (`fe/components/pos/kasir-pos.tsx`, `fe/components/shifts/shift-management.tsx`, `fe/components/attendance/attendance-management.tsx`, `fe/components/owner/owner-dashboard.tsx`).
- `[20:14]`: Menerapkan navigasi **Sidebar** (`fe/components/layout/sidebar.tsx`) mengadopsi struktur visual referensi design (brand header, quick indicator, global warehouse selector, role switch, dynamic locked tabs, dan user profile footer).
- `[20:33]`: Mengimplementasikan arsitektur enterprise lengkap:
  - **Strict Hide RBAC**: Menu finansial/laba rugi otomatis di-hide 100% dari sidebar akun ADMIN.
  - **Pustaka Baru Terverifikasi**: Menambahkan `dexie` (IndexedDB schema di `fe/lib/db/dexie-db.ts`) dan `xlsx` (5-Sheet generator di `fe/lib/export/excel-generator.ts`).
  - **Modul Baru Selesai**: Biaya OPEX Gudang (`fe/components/opex/opex-management.tsx`), Mutasi Stok Antar 4 Gudang (`fe/components/mutation/stock-mutation.tsx`), Hutang & Piutang AP/AR (`fe/components/debt/debt-receivable.tsx`).
  - **Enterprise Scale Guard**: Proteksi margin dengan Smart Price Fluctuation (benchmark harian) dan Approval Nota Jumbo (> Rp 10.000.000) oleh Owner.
- `[21:05]`: **Daylight Theme & UX Overhaul**:
  - Mengubah tema tampilan dari dark mode menjadi **Putih & Oranye / Krem Hangat** (`#fffcf7` + aksen `#ea580c`) dengan kontras tajam yang nyaman untuk operasional siang hari di gudang.
  - Tipografi angka menggunakan `font-numeric` (tabular numerals) agar berat kg dan nominal rupiah sejajar rapi.
  - Custom scrollbar oranye ergonomis dan dropdown custom rounded-xl.
  - Nama gudang disederhanakan menjadi **Gudang 1, Gudang 2, Gudang 3, Gudang 4**.
  - Pengepul diubah natural tanpa embel-embel daerah (`Pengepul Langganan`, `Pengepul Keliling`, `Mitra Borongan`).
  - Menambahkan modul **Penjualan Stok Gudang (Kas Masuk)** (`fe/components/sales/warehouse-sales.tsx`) untuk peleburan tonase besar maupun pembeli eceran/biasa (dengan opsi uang masuk laci tunai vs transfer bank yang terintegrasi ke formula tutup shift kasir).
  - Mengembangkan sistem **Absensi Cepat 50 Karyawan** dengan tombol 1-Klik Hadir Semua, search filter cepat, dan pembagian rata per gudang.
  - Menyediakan input kondisi bebas (input nama penjual bebas, komoditas bebas, dan kategori OPEX bebas bila tidak ada di dropdown).
  - Build Next.js 100% lolos compile tanpa error.

---

## Blockers & Solutions
- **Issue**: Folder `fe/ref-design` memicu type error karena modul mock lamanya belum lengkap.
- **Fix**: Menambahkan `"ref-design"` ke `exclude` di `fe/tsconfig.json` agar Next.js hanya meng-compile kode aktif aplikasi. Build berhasil 100%.

---

## Artifacts Created / Moved
- `docs/prd/erp-timbangan-rongsok.prd.md`
- `docs/srs/erp-timbangan-rongsok.srs.md`
- `docs/adr/20260926-offline-first-web-serial.adr.md`
- `docs/plans/erp-timbangan-rongsok.plan.md`
- `docs/devlogs/2026-09-26-sdlc-docs-restructure.log.md`
- `supabase/migrations/20260926000001_init_schema.sql`
- `fe/types/index.ts`
- `fe/lib/mock/data.ts`
- `fe/lib/hardware/use-scale-serial.ts`
- `fe/lib/hardware/escpos-builder.ts`
- `fe/ref-design/app/` (Referensi UI)
- `fe/ref-design/components/` (Komponen UI)
