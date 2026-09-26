# Product Requirement Document (PRD) & Software Requirement Specification (SRS)
## Project: David-Beckham (Sistem ERP Kasir Timbangan, Inventory 4 Gudang & Finansial Rongsok)
**Client**: PT DAVID | **Arsitektur**: Offline-First Web ERP + Web Serial Hardware Integration

---

## 1. Problem Statement & Executive Summary
PT DAVID mengelola bisnis pengepulan dan pengolahan logam bekas (rongsok) dengan 4 gudang operasional dan 60 karyawan.

### Tiga Masalah Kritis Bisnis:
1. **Risiko Kebocoran Kasir (Cash Fraud)**: Kasir memegang puluhan juta uang tunai setiap hari tanpa pencatatan shift buka/tutup kasir yang sinkron dengan nota fisik.
2. **Ketergantungan Internet di Gudang**: Sinyal Wi-Fi di area gudang rongsok sering tidak stabil. Sistem cloud murni akan melumpuhkan antrean timbangan jika internet mati.
3. **Kekacauan Harga & Transaksi Lambat**: Penjual membawa banyak jenis barang (besi, tembaga, kardus), pembacaan timbangan manual rawan salah ketik, dan pembedaan harga mitra langganan vs umum sering tertukar.

---

## 2. User Personas & Strict RBAC Matrix

1. **Owner (`OWNER`)**:
   - Memantau omzet global, laba/rugi riil, arus kas masuk/keluar, audit selisih kasir, dan ekspor laporan Excel finansial.
2. **Admin Gudang / Kasir (`ADMIN`)**:
   - Buka/tutup shift kasir, timbang barang via Alexa BFS, cetak struk nota multi-item, input penjualan ke pabrik, catat kasbon, dan checklist absensi karyawan per gudang.
   - **DILARANG KERAS** melihat Dashboard Laba/Rugi, Total Kas Perusahaan, dan Ekspor Laporan Finansial.

---

## 3. Functional Requirements (Ruang Lingkup Fitur)

* **FR-01: Buka & Tutup Shift Kasir (Cash Reconciliation)**:
  - Input modal awal kas pagi (misal Rp 20.000.000).
  - Rekonsiliasi sore: menghitung total belanja timbangan + kasbon vs sisa uang fisik di laci kas. Alarm otomatis jika ada selisih.
* **FR-02: Kasir Timbangan Alexa BFS & Multi-Item Cart**:
  - Membaca stream berat timbangan digital via **Web Serial API** (`RS-232 to USB`).
  - Keranjang timbangan multi-item: 1 penjual bisa nimbang banyak barang dalam 1 nota.
  - Tombol Tara / Reset Nol dan Potongan Kotoran (bisa pilih potong Kg atau %).
* **FR-03: Cetak Struk Thermal Otomatis**:
  - Cetak nota digital instan ke printer thermal 58mm/80mm via Web USB / ESC/POS.
* **FR-04: Master Barang & Harga Bertingkat (Tiered Pricing)**:
  - Master komoditas dengan 2 kolom harga: `Harga Langganan` vs `Harga Bukan Langganan`.
* **FR-05: Penjualan Borongan ke Pabrik**:
  - Form pengeluaran barang partai besar ke pabrik peleburan dengan harga kontrak per kg.
* **FR-06: Manajemen Kasbon & Pinjaman Karyawan**:
  - Pencatatan kasbon per karyawan dan akumulasi saldo potongan gaji bulanan.
* **FR-07: Absensi Cepat 60 Karyawan (4 Gudang)**:
  - Admin gudang melakukan *bulk checklist* hadir pagi & pulang untuk 10–15 karyawan per gudang dalam 30 detik.
* **FR-08: Ekspor Laporan Excel Multi-Sheet**:
  - Generator file `.xlsx` untuk rekap absensi bulanan, pembelian, penjualan, dan laba rugi (khusus Owner).

---

## 4. Strict Non-Goals (Dilarang Dibuat)
- ❌ Tidak ada integrasi payment gateway / kartu kredit (100% operasional kas tunai fisik & transfer bank manual).
- ❌ Tidak ada fitur e-commerce toko online untuk pembeli eceran.
- ❌ Tidak mewajibkan karyawan/kuli menginstall aplikasi di smartphone pribadi (absensi sentral di PC admin).
