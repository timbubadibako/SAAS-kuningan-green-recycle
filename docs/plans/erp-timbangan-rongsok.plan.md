# Plan: Setup & Implementasi ERP Timbangan Rongsok PT DAVID
- **Related PRD**: `docs/prd/erp-timbangan-rongsok.prd.md`
- **Related SRS**: `docs/srs/erp-timbangan-rongsok.srs.md`
- **Related ADR**: `docs/adr/20260926-offline-first-web-serial.adr.md`

---

## 1. Target Directory & Files
- Core Docs: `docs/prd/`, `docs/srs/`, `docs/adr/`, `docs/plans/`, `docs/devlogs/`, `docs/qa/`
- Frontend App: `fe/` (Next.js 15 App Router)
  - `fe/lib/supabase/`: Client & server Supabase connections
  - `fe/lib/db/`: Dexie.js offline schema & sync manager
  - `fe/lib/hardware/`: Web Serial parser (Alexa BFS) & ESC/POS builder
  - `fe/app/api/`: Standardized REST API endpoints (Shifts, Scale Transactions, Loans, Attendance, Export)
  - `fe/app/(dashboard)/`: UI Kasir Timbangan, Shift Management, Absensi, Owner Reporting

---

## 2. Granular Task Checklist

### Phase 1 & 2: Specs & ADR (Done)
- [x] PRD standardized (`docs/prd/erp-timbangan-rongsok.prd.md`)
- [x] SRS standardized (`docs/srs/erp-timbangan-rongsok.srs.md`)
- [x] ADR standardized (`docs/adr/20260926-offline-first-web-serial.adr.md`)

### Phase 3: Architecture & Structure Preparation (In Progress)
- [x] Repository documentation layout restructuring
- [ ] Align Next.js app in `fe/` with root structure or integrate unified scripts
- [ ] Setup Supabase client types and local Dexie schemas

### Phase 4: Development Execution
- [x] Task 4.1: Database schema & RLS migration script (Postgres Supabase: `supabase/migrations/20260926000001_init_schema.sql`)
- [x] Task 4.2: Web Serial API hook for Alexa BFS with Virtual Mock Mode (`fe/lib/hardware/use-scale-serial.ts`)
- [ ] Task 4.3: Local IndexedDB offline queue & sync engine
- [x] Task 4.4: Kasir Timbangan multi-item UI & ESC/POS receipt printing (`fe/components/pos/kasir-pos.tsx`)
- [x] Task 4.5: Shift Kasir buka/tutup reconciliation & audit selisih (`fe/components/shifts/shift-management.tsx`)
- [x] Task 4.6: Bulk attendance 60 employees & employee loans (`fe/components/attendance/attendance-management.tsx`)
- [x] Task 4.7: Owner dashboard with strict RBAC guard & Excel export trigger (`fe/components/owner/owner-dashboard.tsx`)

### Phase 5: QA, Security Audit & Verification
- [ ] Unit & integration tests for offline sync & calculations
- [ ] RBAC verification (Owner vs Admin access control)
- [ ] Cracker security audit (OWASP, SQLi, input sanitization)

### Phase 6: Release & Changelog
- [ ] CHANGELOG.md update
- [ ] Atomic git commit
