# PRD: Sistem ERP Kasir Timbangan, Inventory 4 Gudang & Finansial Rongsok
- **Author / Date**: System / 2026-09-26
- **Status**: Approved
- **Client**: PT DAVID
- **Architecture**: Offline-First Web ERP + Web Serial Hardware Integration (Alexa BFS)

---

## 1. Problem Statement & Objectives
PT DAVID mengelola bisnis pengepulan dan pengolahan logam bekas (rongsok) dengan 4 gudang operasional dan 60 karyawan.

### Tiga Masalah Kritis Bisnis:
1. **Risiko Kebocoran Kasir (Cash Fraud)**: Kasir memegang puluhan juta uang tunai setiap hari tanpa pencatatan shift buka/tutup kasir yang sinkron dengan nota fisik.
2. **Ketergantungan Internet di Gudang**: Sinyal Wi-Fi di area gudang rongsok sering tidak stabil. Sistem cloud murni akan melumpuhkan antrean timbangan jika internet mati.
3. **Kekacauan Harga & Transaksi Lambat**: Penjual membawa banyak jenis barang (besi, tembaga, kardus), pembacaan timbangan manual rawan salah ketik, dan pembedaan harga mitra langganan vs umum sering tertukar.

---

## 2. User Personas & User Stories

### Persona 1: Owner (`OWNER`)
- **As an** Owner, **I want to** memantau omzet global, laba/rugi riil, arus kas masuk/keluar, audit selisih kasir, dan ekspor laporan finansial, **so that** operasional 4 gudang transparan dan bebas dari kecurangan.

### Persona 2: Admin Gudang / Kasir (`ADMIN`)
- **As an** Admin Gudang, **I want to** membuka/menutup shift kasir, menimbang barang via Alexa BFS, cetak struk nota multi-item, input penjualan pabrik, kasbon, dan absensi cepat, **so that** antrean cepat dan tidak terhambat internet mati.
- *Strict Constraint*: Role `ADMIN` **DILARANG KERAS** melihat Dashboard Laba/Rugi, Total Kas Perusahaan, dan Ekspor Laporan Finansial.

---

## 3. Functional Scope

### In Scope:
- [x] **FR-01: Buka & Tutup Shift Kasir (Cash Reconciliation)**: Modal awal kas pagi, rekonsiliasi kas sore, deteksi selisih otomatis.
- [x] **FR-02: Kasir Timbangan Alexa BFS & Multi-Item Cart**: Stream berat timbangan via Web Serial API (RS-232), keranjang multi-item, tare/zero, potongan kotoran (kg / %).
- [x] **FR-03: Cetak Struk Thermal Otomatis**: Nota digital instan ke printer thermal 58mm/80mm via Web USB / ESC/POS.
- [x] **FR-04: Master Komoditas & Harga Bertingkat**: Master barang dengan 2 level harga (`Harga Langganan` vs `Harga Bukan Langganan`).
- [x] **FR-05: Penjualan Borongan ke Pabrik**: Form pengeluaran barang partai besar ke pabrik peleburan dengan harga kontrak per kg.
- [x] **FR-06: Manajemen Kasbon & Pinjaman Karyawan**: Pencatatan kasbon per karyawan dan akumulasi potongan gaji bulanan.
- [x] **FR-07: Absensi Cepat 60 Karyawan (4 Gudang)**: Bulk checklist hadir pagi & pulang untuk 10–15 karyawan per gudang dalam 30 detik.
- [x] **FR-08: Ekspor Laporan Excel Multi-Sheet**: Generator `.xlsx` untuk rekap absensi, pembelian, penjualan, dan laba rugi (khusus Owner).

### Out of Scope:
- [ ] Integrasi payment gateway / kartu kredit (100% operasional kas tunai fisik & transfer bank manual).
- [ ] Fitur e-commerce toko online untuk pembeli eceran.
- [ ] Aplikasi mobile untuk karyawan/kuli (absensi terpusat di PC/tablet admin gudang).

---

## 4. Non-Functional Requirements (NFR)
- **Offline-First & Resilience**: Transaksi timbangan wajib tersimpan instan ke IndexedDB lokal (Dexie.js) sebelum background sync ke Supabase Cloud.
- **Hardware Integration**: Web Serial API (`navigator.serial`) tanpa driver proprietary pihak ketiga, dengan fallback input manual bila kabel terputus.
- **Performance**: Latensi input timbangan < 100ms, cetak struk < 1 detik.
- **Security & Privacy**: RBAC ketat (Owner vs Admin), isolasi data finansial, OWASP compliance.

---

## 5. Acceptance Criteria
- [ ] Kasir dapat menimbang multi-item dan mencetak struk thermal saat offline 100%.
- [ ] Data otomatis tersinkronisasi ke Supabase saat koneksi kembali online.
- [ ] Selisih kas fisik vs hitungan sistem tercatat dan terflag merah jika terjadi ketidaksesuaian.
- [ ] Role Admin tidak bisa mengakses endpoint maupun halaman laporan laba/rugi.
