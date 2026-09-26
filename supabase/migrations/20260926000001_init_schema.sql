-- Migration: 20260926000001_init_schema.sql
-- ERP Kasir Timbangan, Inventory 4 Gudang & Finansial Rongsok PT DAVID

-- 1. Enum Roles & Warehouse
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('OWNER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('PRESENT', 'PERMISSION', 'ABSENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Master 4 Gudang
CREATE TABLE IF NOT EXISTS public.warehouses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial 4 warehouses
INSERT INTO public.warehouses (id, name, address)
VALUES 
    (1, 'Gudang 1 - Pusat (Cakung)', 'Jl. Raya Cakung No. 12'),
    (2, 'Gudang 2 - Logam Berat (Bekasi)', 'Kawasan Industri MM2100'),
    (3, 'Gudang 3 - Pengepulan Kardus & Plastik (Tangerang)', 'Jl. Industri Manis IV'),
    (4, 'Gudang 4 - Peleburan & Transit (Semarang)', 'Pelabuhan Tanjung Emas')
ON CONFLICT (id) DO NOTHING;

-- 3. User Profiles & RBAC
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'ADMIN',
    warehouse_id INT REFERENCES public.warehouses(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Shift Kasir (Buka / Tutup & Rekonsiliasi Kas)
CREATE TABLE IF NOT EXISTS public.cash_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id INT NOT NULL REFERENCES public.warehouses(id),
    cashier_id UUID NOT NULL REFERENCES public.user_profiles(id),
    opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    initial_cash NUMERIC(12, 2) NOT NULL,
    expected_closing_cash NUMERIC(12, 2),
    actual_closing_cash NUMERIC(12, 2),
    cash_difference NUMERIC(12, 2),
    notes TEXT
);

-- 5. Master Komoditas & Tiered Pricing
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    price_regular NUMERIC(12, 2) NOT NULL,
    price_partner NUMERIC(12, 2) NOT NULL,
    current_stock_kg NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Transaksi Timbang Masuk (Pembelian Rongsok)
CREATE TABLE IF NOT EXISTS public.scale_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    warehouse_id INT NOT NULL REFERENCES public.warehouses(id),
    cashier_id UUID NOT NULL REFERENCES public.user_profiles(id),
    shift_id UUID REFERENCES public.cash_shifts(id),
    seller_name VARCHAR(100) NOT NULL,
    is_partner BOOLEAN NOT NULL DEFAULT FALSE,
    total_amount NUMERIC(12, 2) NOT NULL,
    sync_status BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.scale_transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES public.scale_transactions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    gross_weight_kg NUMERIC(10, 2) NOT NULL,
    refaction_kg NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    refaction_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    net_weight_kg NUMERIC(10, 2) NOT NULL,
    price_per_kg NUMERIC(12, 2) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL
);

-- 7. Penjualan Borongan ke Pabrik
CREATE TABLE IF NOT EXISTS public.factory_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    warehouse_id INT NOT NULL REFERENCES public.warehouses(id),
    factory_name VARCHAR(150) NOT NULL,
    product_id UUID NOT NULL REFERENCES public.products(id),
    weight_kg NUMERIC(12, 2) NOT NULL,
    contract_price_per_kg NUMERIC(12, 2) NOT NULL,
    total_revenue NUMERIC(12, 2) NOT NULL,
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Karyawan, Kasbon & Absensi 4 Gudang
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    warehouse_id INT NOT NULL REFERENCES public.warehouses(id),
    position VARCHAR(50) NOT NULL DEFAULT 'KULI_TIMBANG',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.employee_loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    warehouse_id INT NOT NULL REFERENCES public.warehouses(id),
    loan_date DATE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    is_deducted BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.attendances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    warehouse_id INT NOT NULL REFERENCES public.warehouses(id),
    attendance_date DATE NOT NULL,
    check_in TIMESTAMPTZ,
    check_out TIMESTAMPTZ,
    status attendance_status NOT NULL DEFAULT 'PRESENT',
    recorded_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_employee_daily_attendance UNIQUE (employee_id, attendance_date)
);

-- Indexing for high performance
CREATE INDEX IF NOT EXISTS idx_scale_tx_warehouse ON public.scale_transactions(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_scale_tx_created ON public.scale_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_attendances_date ON public.attendances(attendance_date, warehouse_id);
CREATE INDEX IF NOT EXISTS idx_shifts_warehouse ON public.cash_shifts(warehouse_id, cashier_id);

-- RLS Enablement
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scale_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scale_transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factory_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;

-- Helper function: Get Current User Role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- RLS Policies: Products (All authenticated users can read, Owner can write)
CREATE POLICY "Allow read products for all authenticated users"
ON public.products FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Allow write products for OWNER only"
ON public.products FOR ALL TO authenticated
USING (public.get_current_user_role() = 'OWNER');

-- RLS Policies: Factory Sales (Owner only)
CREATE POLICY "Allow factory sales for OWNER only"
ON public.factory_sales FOR ALL TO authenticated
USING (public.get_current_user_role() = 'OWNER');

-- RLS Policies: Shift Kasir (Admin can see their own warehouse, Owner can see all)
CREATE POLICY "Allow read/insert shift kasir"
ON public.cash_shifts FOR ALL TO authenticated
USING (
    public.get_current_user_role() = 'OWNER' OR
    cashier_id = auth.uid()
);
