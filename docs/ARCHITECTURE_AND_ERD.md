# Architecture & Database ERD Specification
## Project: David-Beckham (Sistem ERP Kasir Timbangan & Inventory Rongsok PT DAVID)

---

## 1. High-Level Architecture & Offline-First Strategy

```
[ Timbangan Alexa BFS ] ──(RS-232 to USB)──> [ Web Serial API (Browser) ]
                                                        │
                                                        ▼
[ Printer Thermal 58/80mm ] <──(Web ESC/POS)── [ Frontend Next.js (App Router) ]
                                                        │
                                                        ▼
                                       [ IndexedDB Local DB (Dexie.js) ]
                                       (Transaksi tersimpan & struk keluar instan)
                                                        │
                                         (Koneksi Tersedia? Background Sync)
                                                        ▼
                                       [ Supabase Cloud (PostgreSQL 16) ]
                                       (Audit Log, Rekap 4 Gudang, Dashboard Owner)
```

---

## 2. Database Schema & SQL DDL (Supabase Postgres)

```sql
-- 1. Master 4 Gudang
CREATE TABLE public.warehouses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE, -- 'Gudang 1', 'Gudang 2', 'Gudang 3', 'Gudang 4'
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Master Roles & Users (RBAC)
CREATE TYPE user_role AS ENUM ('OWNER', 'ADMIN');

CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'ADMIN',
    warehouse_id INT REFERENCES public.warehouses(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Shift Buka / Tutup Kasir (Anti-Maling)
CREATE TABLE public.cash_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id INT NOT NULL REFERENCES public.warehouses(id),
    cashier_id UUID NOT NULL REFERENCES public.user_profiles(id),
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    initial_cash NUMERIC(12, 2) NOT NULL, -- Modal awal pagi
    expected_closing_cash NUMERIC(12, 2), -- Modal - Belanja - Kasbon - OPEX
    actual_closing_cash NUMERIC(12, 2),   -- Fisik uang di laci
    cash_difference NUMERIC(12, 2),       -- Selisih minus/plus
    notes TEXT
);

-- 4. Biaya Operasional Harian (OPEX Kasir)
CREATE TABLE public.operating_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id UUID REFERENCES public.cash_shifts(id),
    warehouse_id INT NOT NULL REFERENCES public.warehouses(id),
    recorded_by UUID NOT NULL REFERENCES public.user_profiles(id),
    category VARCHAR(50) NOT NULL, -- 'BENSIN_TRUK', 'KONSUMSI', 'PERALATAN_KARUNG', 'SERVIS_MESIN', 'LAINNYA'
    amount NUMERIC(12, 2) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Master Komoditas & Harga Bertingkat
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE, -- 'Besi Super', 'Tembaga Merah', 'Kardus'
    category VARCHAR(50) NOT NULL,     -- 'LOGAM_BESI', 'LOGAM_NON_BESI', 'KERTAS_PLASTIK'
    price_regular NUMERIC(12, 2) NOT NULL, -- Harga eceran / non-langganan
    price_partner NUMERIC(12, 2) NOT NULL, -- Harga khusus langganan
    current_stock_kg NUMERIC(12, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Transaksi Timbang Masuk (Pembelian dari Pengepul)
CREATE TABLE public.scale_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    warehouse_id INT NOT NULL REFERENCES public.warehouses(id),
    cashier_id UUID NOT NULL REFERENCES public.user_profiles(id),
    shift_id UUID REFERENCES public.cash_shifts(id),
    seller_name VARCHAR(100) NOT NULL,
    is_partner BOOLEAN DEFAULT FALSE,
    total_amount NUMERIC(12, 2) NOT NULL,
    is_paid BOOLEAN DEFAULT TRUE, -- False jika supplier titip timbang (Hutang Supplier)
    sync_status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.scale_transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES public.scale_transactions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    gross_weight_kg NUMERIC(10, 2) NOT NULL,
    refaction_kg NUMERIC(10, 2) DEFAULT 0.00,
    refaction_pct NUMERIC(5, 2) DEFAULT 0.00,
    net_weight_kg NUMERIC(10, 2) NOT NULL,
    price_per_kg NUMERIC(12, 2) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL
);

-- 7. Mutasi Stok Antar 4 Gudang (Inter-Warehouse Transfer)
CREATE TABLE public.warehouse_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_number VARCHAR(50) NOT NULL UNIQUE,
    from_warehouse_id INT NOT NULL REFERENCES public.warehouses(id),
    to_warehouse_id INT NOT NULL REFERENCES public.warehouses(id),
    driver_name VARCHAR(100),
    truck_plate_number VARCHAR(20),
    status VARCHAR(20) DEFAULT 'IN_TRANSIT', -- 'IN_TRANSIT', 'RECEIVED', 'CANCELLED'
    created_by UUID REFERENCES public.user_profiles(id),
    received_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    received_at TIMESTAMPTZ
);

CREATE TABLE public.warehouse_transfer_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_id UUID NOT NULL REFERENCES public.warehouse_transfers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    weight_kg NUMERIC(10, 2) NOT NULL
);

-- 8. Transaksi Penjualan Barang ke Pabrik & Piutang (AR)
CREATE TABLE public.factory_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    warehouse_id INT NOT NULL REFERENCES public.warehouses(id),
    factory_name VARCHAR(150) NOT NULL,
    product_id UUID NOT NULL REFERENCES public.products(id),
    weight_kg NUMERIC(12, 2) NOT NULL,
    contract_price_per_kg NUMERIC(12, 2) NOT NULL,
    total_revenue NUMERIC(12, 2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'UNPAID', -- 'PAID', 'PARTIAL', 'UNPAID' (Tempo)
    due_date DATE,
    paid_amount NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Karyawan, Kasbon & Absensi 4 Gudang
CREATE TABLE public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    warehouse_id INT NOT NULL REFERENCES public.warehouses(id),
    position VARCHAR(50) DEFAULT 'KULI_TIMBANG',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.employee_loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id),
    warehouse_id INT NOT NULL REFERENCES public.warehouses(id),
    shift_id UUID REFERENCES public.cash_shifts(id),
    loan_date DATE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    is_deducted BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.attendances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id),
    warehouse_id INT NOT NULL REFERENCES public.warehouses(id),
    attendance_date DATE NOT NULL,
    check_in TIMESTAMPTZ,
    check_out TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'PRESENT',
    recorded_by UUID REFERENCES public.user_profiles(id),
    UNIQUE (employee_id, attendance_date)
);
```

---

## 3. Row Level Security (RLS) Policy
- Role `ADMIN` **DILARANG MELAKUKAN QUERY** ke view `vw_profit_loss` dan kolom margin laba/rugi.
- Role `OWNER` memiliki akses penuh ke seluruh tabel, rekonsiliasi kas global, dan piutang pabrik.
