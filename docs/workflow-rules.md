# Workflow Rules & Coding Standards
## Project: David-Beckham (Sistem ERP Timbangan Rongsok PT DAVID)

Setiap developer dan AI agent yang bekerja di direktori ini **WAJIB MENGIKUTI STANDAR KETAT BERIKUT**:

---

## 1. Zero Bloat & Strict Dependencies
- **DILARANG** menambah pustaka baru tanpa konfirmasi eksplisit.
- Pustaka resmi yang diizinkan:
  - Frontend: `next@15+`, `react@19`, `tailwindcss@4`, `shadcn/ui`, `lucide-react`.
  - Database & Sync: `@supabase/supabase-js` (Native SDK) + `dexie` (IndexedDB Wrapper untuk Offline-First).
  - Excel Export: `xlsx` atau `exceljs`.
  - Printer & Hardware: Native Web Serial API (`navigator.serial`) dan Web USB / ESC/POS string builder. **DILARANG memakai driver proprietary desktop pihak ketiga**.

---

## 2. Strict Type Safety & Quality Enforcement
- **DILARANG** menggunakan tipe `any` di TypeScript. Definisikan interface data secara strictly-typed di `types/`.
- **Haram** menggunakan placeholder seperti `// ... rest of code` atau `// TODO`. Hasilkan kode lengkap dan utuh.
- **Surgical Edits Only**: Ubah hanya blok kode yang relevan.

---

## 3. Strict RBAC & Security Guard
- **Penjagaan Finansial**: Role `ADMIN` **TIDAK BOLEH MEMILIKI AKSES KE ROUTE ATAU DATA LABA/RUGI & TOTAL KAS**.
  - Lakukan validasi hak akses ganda: di UI (Client Component) dan di Middleware/Server Action (Server-side check).

---

## 4. Hardware Failure & Offline Handling
- Operasi Web Serial API timbangan Alexa BFS wajib dibungkus dalam blok `try...catch` dengan notifikasi fallback manual jika kabel USB terputus.
- Setiap kali transaksi timbangan selesai dibuat, simpan ke IndexedDB lokal terlebih dahulu sebelum mencoba sinkronisasi ke Supabase Cloud.
