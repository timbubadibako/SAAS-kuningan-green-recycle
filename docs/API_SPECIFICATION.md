# API Contract & Schema Specification
## Project: David-Beckham (Sistem ERP Kasir Timbangan PT DAVID)

---

## 1. Standar Format Respons JSON

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "UNAUTHORIZED | FORBIDDEN | BAD_REQUEST | SERVER_ERROR",
    "message": "Pesan kesalahan yang mudah dipahami kasir/admin"
  }
}
```

---

## 2. Definisi Endpoint Utama

### A. Shift Kasir (`/api/shifts`)

#### `POST /api/shifts/open` (Buka Shift Pagi)
- **Request Body**:
```json
{
  "warehouseId": 1,
  "initialCash": 20000000
}
```

#### `POST /api/shifts/close` (Tutup Shift Sore & Rekonsiliasi)
- **Request Body**:
```json
{
  "shiftId": "uuid-shift-123",
  "actualClosingCash": 6500000,
  "notes": "Fisik kas laci cocok dengan nota belanja"
}
```

---

### B. Transaksi Timbangan Multi-Item (`/api/scale-transactions`)

#### `POST /api/scale-transactions` (Simpan Transaksi & Cetak Struk)
- **Request Body**:
```json
{
  "warehouseId": 1,
  "shiftId": "uuid-shift-123",
  "sellerName": "Pak Slamet (Pengepul)",
  "isPartner": true,
  "items": [
    {
      "productId": "uuid-besi-super",
      "grossWeightKg": 120.5,
      "refactionKg": 2.5,
      "refactionPct": 0,
      "netWeightKg": 118.0,
      "pricePerKg": 5500,
      "subtotal": 649000
    },
    {
      "productId": "uuid-tembaga-merah",
      "grossWeightKg": 12.0,
      "refactionKg": 0,
      "refactionPct": 0,
      "netWeightKg": 12.0,
      "pricePerKg": 95000,
      "subtotal": 1140000
    }
  ],
  "totalAmount": 1789000
}
```

---

### C. Kasbon & Absensi 4 Gudang

#### `POST /api/employees/loans` (Input Kasbon)
- **Request Body**:
```json
{
  "employeeId": "uuid-karyawan-1",
  "warehouseId": 1,
  "loanDate": "2026-10-05",
  "amount": 100000,
  "notes": "Kasbon transport"
}
```

#### `POST /api/attendances/bulk-check` (Checklist Cepat per Gudang)
- **Request Body**:
```json
{
  "warehouseId": 1,
  "attendanceDate": "2026-10-05",
  "records": [
    { "employeeId": "uuid-1", "status": "PRESENT" },
    { "employeeId": "uuid-2", "status": "PRESENT" },
    { "employeeId": "uuid-3", "status": "PERMISSION" }
  ]
}
```

---

### D. Ekspor Laporan Excel (`/api/reports/export-excel`)

#### `GET /api/reports/export-excel?type=attendance|sales|purchases|profit_loss&month=10&year=2026`
- **Otorisasi**:
  - `type=profit_loss` **HANYA BISA DIAKSES OLEH ROLE `OWNER`** (Admin akan menerima `403 Forbidden`).
- **Response**: File binary streaming `.xlsx` langsung memicu download di browser kasir/owner.
