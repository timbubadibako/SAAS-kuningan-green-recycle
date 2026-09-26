# ADR: Offline-First Architecture & Web Serial Hardware Integration
- **Date**: 2026-09-26
- **Status**: Accepted
- **Decision Makers**: Lead Architect / Core Dev

---

## 1. Context & Problem Statement
Operasional timbangan rongsok PT DAVID di 4 gudang menghadapi dua kendala kritis:
1. Koneksi internet di area gudang sering putus/tidak stabil. Sistem cloud murni akan melumpuhkan antrean truk/pengepul.
2. Timbangan Alexa BFS mengirim data via kabel serial (RS-232 to USB) dan kasir mencetak struk thermal cepat. Penggunaan aplikasi native/desktop terpisah (Electron/C#) menambah kompleksitas deployment di banyak PC gudang.

---

## 2. Decision
1. **Offline-First dengan Dexie.js (IndexedDB)**:
   - Setiap transaksi timbangan disimpan secara sinkron ke IndexedDB lokal terlebih dahulu.
   - Struk thermal langsung dicetak dari data lokal tanpa menunggu respons server.
   - Background worker/sync manager mengunggah antrean transaksi ke Supabase Cloud saat koneksi terdeteksi aktif.

2. **Web Serial API Native (`navigator.serial`)**:
   - Berkomunikasi langsung dari browser modern (Chrome/Edge) ke timbangan Alexa BFS tanpa perlu instalasi driver proprietary atau local agent terpisah.
   - Disediakan fallback input manual jika port serial terputus atau gagal diakses.

3. **Supabase Native Client (Tanpa ORM Tambahan)**:
   - Menggunakan `@supabase/supabase-js` langsung dengan PostgreSQL RLS untuk proteksi data Owner vs Admin.

---

## 3. Consequences & Trade-offs
- **Pros**:
  - Nol downtime saat internet gudang mati.
  - Zero-bloat: Tidak memerlukan runtime tambahan seperti Electron.
  - Kecepatan cetak struk instan (< 1 detik).
- **Cons & Mitigations**:
  - Browser requirement: Wajib menggunakan browser Chromium modern (Chrome, Edge) yang mendukung Web Serial API.
  - Sync conflict handling: Digunakan strategi idempotent UUID dan audit timestamp untuk rekonsiliasi ke Supabase Cloud.
