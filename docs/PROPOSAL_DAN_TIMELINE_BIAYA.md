# Proposal Penawaran Biaya & Timeline Implementasi Sistem
## Proyek: Sistem ERP Kasir Timbangan Digital & Inventory Multi-Gudang
**Klien**: PT DAVID  
**Lingkup Implementasi**: 3 Lokasi Gudang Operasional + 1 Dashboard Sentral Owner  
**Total Nilai Kontrak**: **Rp 12.000.000 (Nett)**  
**Durasi Implementasi**: 4 Minggu Kalender  

---

## 1. Rincian Biaya & Skema Paket Enterprise

| No | Komponen & Lingkup Kerja | Harga Normal | Harga Paket (Nett) |
| :---: | :--- | :---: | :---: |
| 1 | **Core Engine & Database Sentral Cloud**<br>• Setup Next.js, Supabase PostgreSQL & Offline-First (Dexie.js)<br>• Dashboard Eksekutif Owner (Real-time Laba/Rugi & Cashflow)<br>• Modul Penjualan Pabrik, AP/AR Tempo, dan Ekspor Excel Multi-Sheet | Rp 5.000.000 | Termasuk Paket |
| 2 | **Implementasi & Lisensi Gudang 1 (Gudang Pusat)**<br>• Integrasi Web Serial Driver Timbangan Alexa BFS & Printer Thermal<br>• Modul Kasir Timbangan Multi-Item, Shift Buka/Tutup Kasir, OPEX & Kasbon<br>• Modul Absensi 60 Karyawan & Mutasi Antar-Gudang | Rp 4.000.000 | Termasuk Paket |
| 3 | **Implementasi & Lisensi Gudang 2**<br>• Setup hardware serial timbangan, printer thermal, dan akun kasir lokal | Rp 3.000.000 | Termasuk Paket |
| 4 | **Implementasi & Lisensi Gudang 3**<br>• Setup hardware serial timbangan, printer thermal, dan akun kasir lokal | Rp 3.000.000 | Termasuk Paket |
| **TOTAL** | **Subtotal Biaya Normal (Ala Carte)** | **Rp 15.000.000** | |
| **DISKON**| **Multi-Site Deployment Discount (Efisiensi 3 Gudang)** | **- Rp 3.000.000** | |
| **INVESTASI**| **TOTAL NILAI INVESTASI BERSIH (NETT)** | | **Rp 12.000.000** |

---

## 2. Ketentuan Termin Pembayaran (Term of Payment)

1. **Termin 1 (DP 50% - Saat Penandatanganan Kontrak / Kickoff)**: **Rp 6.000.000**  
   *Alokasi*: Komitmen awal, sewa infrastruktur cloud database Supabase, dan setup driver serial timbangan.
2. **Termin 2 (30% - Saat UAT & Demo Sistem Berjalan)**: **Rp 3.600.000**  
   *Alokasi*: Dibayarkan setelah seluruh modul kasir timbangan, cetak struk, dan dashboard owner berhasil didemokan.
3. **Termin 3 (Pelunasan 20% - Saat Go-Live & Training Staf 3 Gudang)**: **Rp 2.400.000**  
   *Alokasi*: Dibayarkan setelah sistem aktif digunakan di 3 gudang dan staf kasir selesai ditraining.

---

## 3. Matriks Timeline & Milestone Mingguan

```
[ MINGGU 1: Core Engine & Hardware ] ────────> DP 50% (Rp 6.000.000)
                 │
                 ▼
[ MINGGU 2: Kasir Multi-Item & Struk ]
                 │
                 ▼
[ MINGGU 3: Dashboard Owner & UAT ] ──────────> Termin 2: 30% (Rp 3.600.000)
                 │
                 ▼
[ MINGGU 4: Go-Live 3 Gudang & Training ] ────> Pelunasan 20% (Rp 2.400.000)
```

### Detail Aktivitas Mingguan:

#### **MINGGU 1: Setup Core Engine, Database & Integrasi Timbangan Alexa BFS**
- Setup database Supabase PostgreSQL & skema IndexedDB offline lokal.
- Integrasi driver **Web Serial API** membaca port COM timbangan digital Alexa BFS.
- Pengujian pembacaan angka berat otomatis (Gross/Netto) tanpa latency.
- *Kriteria Selesai*: Timbangan dicolok USB, angka berat otomatis tampil di layar kasir.

#### **MINGGU 2: Modul Kasir Multi-Item, Cetak Struk & Shift Anti-Maling**
- Modul transaksi timbangan sistem keranjang (multi-item per nota) + potongan kotoran (refaksi kg/%).
- Integrasi cetak struk otomatis ke printer thermal 58mm/80mm via Web USB/ESC/POS.
- Modul **Shift Buka & Tutup Kasir** (rekonsiliasi fisik kas laci vs sistem).
- Modul pencatatan kasbon karyawan dan biaya operasional kasir (OPEX).
- *Kriteria Selesai*: Kasir bisa menimbang 3 jenis barang dalam 1 struk dan kas terhitung otomatis.

#### **MINGGU 3: Dashboard Owner, Mutasi 3 Gudang & UAT Lapangan**
- Modul mutasi stok antar 3 gudang dan penjualan borongan ke pabrik peleburan.
- Dashboard Eksekutif Owner (Real-time omzet, laba rugi, total piutang pabrik, dan stok komoditas).
- Penguncian hak akses (Role Admin diblokir total dari data laba rugi).
- Modul ekspor laporan Excel multi-sheet (Absensi, Pembelian, Penjualan, Laba Rugi).
- *Kriteria Selesai*: Demo sistem end-to-end berhasil di depan Pak David (Trigger Termin 2).

#### **MINGGU 4: Deployment 3 Gudang, Training Staf Kasir & Go-Live**
- Pemasangan dan konfigurasi sistem di PC kasir 3 lokasi gudang.
- Pelatihan (*training*) staf kasir/admin cara operasional harian.
- Pendampingan operasional selama 3 hari pertama go-live.
- Penyerahan Berita Acara Serah Terima (BAST) dan mulai masa garansi maintenance.
- *Kriteria Selesai*: 3 Gudang aktif beroperasi mandiri (Trigger Pelunasan Termin 3).
