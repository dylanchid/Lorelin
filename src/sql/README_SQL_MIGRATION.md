# SQL Migration Guide for Lorelin Financial Data Model

## Overview

These SQL scripts transform your billing app from denormalized text fields to a proper relational financial data model. After running these scripts, you'll have:

- **Normalized entities:** Patients, providers, and payers as separate tables
- **Financial tracking:** Charges, claims, and payments for the full revenue cycle
- **Linked data:** All your existing visits, authorizations, eligibilities, and disputes connected via foreign keys

## Scripts to Run (In Order)

### 0. `00_CREATE_ALL_BASE_TABLES.sql` ⚠️ **RUN THIS FIRST!**
**What it does:**
- Creates ALL the base tables your app needs: `visits`, `authorizations`, `eligibilities`, `work_items`, `disputes`
- These are the tables your backend code expects to exist
- If you already ran parts of SUPABASE_SCHEMA.sql, this script will skip existing tables

**CRITICAL:** If you get "relation does not exist" errors, you MUST run this first!

**Tables created:**
- ✅ `visits` - Main visit records (was missing from SUPABASE_SCHEMA.sql!)
- ✅ `authorizations` - Prior authorization workflow
- ✅ `eligibilities` - Insurance verification workflow
- ✅ `work_items` - Daily to-do list for billing staff
- ✅ `disputes` - Payment dispute tracking

**Safe to run multiple times:** Yes (uses `IF NOT EXISTS`)

---

### 1. `01_FINANCIAL_TABLES.sql`
**What it does:**
- Creates 6 new tables: `patients`, `providers`, `payers`, `charges`, `claims`, `payments`
- Sets up indexes for fast queries
- Enables Row Level Security (RLS) with policies

**Tables created:**
- ✅ `patients` - Normalized patient records (no more "patient_name" text everywhere)
- ✅ `providers` - Provider records with NPI, specialty
- ✅ `payers` - Insurance companies with auth rules, network status
- ✅ `charges` - Line items (CPT codes) for billing
- ✅ `claims` - Billing submissions with denial tracking
- ✅ `payments` - Payment history (insurance + patient)

**Safe to run multiple times:** Yes (uses `CREATE TABLE IF NOT EXISTS`)

---

### 2. `02_ADD_FOREIGN_KEYS.sql`
**What it does:**
- Adds `patient_id`, `provider_id`, `payer_id` columns to your existing tables
- Creates indexes for fast lookups
- Keeps existing text fields (`patient_name`, `provider`, `payer`) for backward compatibility

**Tables modified:**
- ✅ `visits` - Gets `patient_id`, `provider_id`, `payer_id`
- ✅ `authorizations` - Gets `patient_id`, `provider_id`, `payer_id`
- ✅ `eligibilities` - Gets `patient_id`, `provider_id`, `payer_id`
- ✅ `disputes` - Gets `patient_id`, `payer_id`, `claim_id`
- ✅ `work_items` - Gets `patient_id`, `visit_id`, `claim_id`

**Safe to run multiple times:** Yes (uses `ADD COLUMN IF NOT EXISTS`)

---

### 3. `03_MIGRATE_DATA.sql`
**What it does:**
- Extracts unique patients from `patient_name` fields across all tables
- Extracts unique providers from `provider` fields
- Extracts unique payers from `payer` fields
- Updates all foreign key references
- Sets up payer rules (auth requirements, network status)
- Creates sample claims and charges from existing visits

**Data transformation:**
1. Creates patients from text → Updates all tables to reference patient IDs
2. Creates providers from text → Updates all tables to reference provider IDs
3. Creates payers from text → Updates all tables to reference payer IDs
4. Creates claims for existing visits
5. Creates charge line items based on visit reasons

**Safe to run multiple times:** Yes (uses `ON CONFLICT DO NOTHING` and checks for existing records)

---

## How to Run

### Option 1: Supabase SQL Editor (Recommended)

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run scripts in order:
   - Copy contents of `00_CREATE_ALL_BASE_TABLES.sql` → Run
   - Copy contents of `01_FINANCIAL_TABLES.sql` → Run
   - Copy contents of `02_ADD_FOREIGN_KEYS.sql` → Run
   - Copy contents of `03_MIGRATE_DATA.sql` → Run
3. After all 4 scripts complete:
   - Go to **Settings** → **API** → Click **"Reload schema cache"**

### Option 2: All at Once

You can concatenate all 4 files and run as one script:
```sql
-- Copy all of 00_CREATE_ALL_BASE_TABLES.sql
-- Then all of 01_FINANCIAL_TABLES.sql
-- Then all of 02_ADD_FOREIGN_KEYS.sql
-- Then all of 03_MIGRATE_DATA.sql
-- Run the combined script
```

---

## What Changes

### Before (Denormalized)
```
visits table:
- patient_name: "K. Williams" (text)
- provider: "Dr. Ganti" (text)
- payer: "BCBS PPO" (text)
```

### After (Normalized)
```
visits table:
- patient_name: "K. Williams" (text, kept for compatibility)
- patient_id: uuid → references patients(id)
- provider: "Dr. Ganti" (text, kept for compatibility)
- provider_id: uuid → references providers(id)
- payer: "BCBS PPO" (text, kept for compatibility)
- payer_id: uuid → references payers(id)

patients table:
- id: uuid
- full_name: "K. Williams"
- first_name: "K."
- last_name: "Williams"
- member_id: "W123456789"

claims table (NEW):
- id: uuid
- visit_id: uuid → references visits(id)
- patient_id: uuid → references patients(id)
- payer_id: uuid → references payers(id)
- status: "draft"
- total_billed: 8500.00
```

---

## Verification

After running all 4 scripts, the migration script will output a summary:

```
============================================
MIGRATION COMPLETE
============================================
Patients created: 15
Providers created: 5
Payers created: 8
Visits linked: 20
Claims created: 20
============================================
```

You can also run this query to check your data:

```sql
SELECT 
  v.id as visit_id,
  p.full_name as patient,
  pr.name as provider,
  py.name as payer,
  py.is_in_network,
  py.requires_auth,
  c.claim_number,
  c.status as claim_status,
  c.total_billed,
  (SELECT COUNT(*) FROM charges WHERE visit_id = v.id) as charge_count,
  (SELECT COUNT(*) FROM payments WHERE claim_id = c.id) as payment_count
FROM visits v
LEFT JOIN patients p ON v.patient_id = p.id
LEFT JOIN providers pr ON v.provider_id = pr.id
LEFT JOIN payers py ON v.payer_id = py.id
LEFT JOIN claims c ON c.visit_id = v.id
ORDER BY v.visit_date DESC
LIMIT 10;
```

---

## What You Get

### New Capabilities

**1. Patient-centric view:**
```sql
-- Get all data for a patient
SELECT * FROM patients WHERE full_name = 'K. Williams';
-- Get their visits
SELECT * FROM visits WHERE patient_id = '...';
-- Get their claims
SELECT * FROM claims WHERE patient_id = '...';
-- Get their disputes
SELECT * FROM disputes WHERE patient_id = '...';
```

**2. Payer analytics:**
```sql
-- Which payers have the most denials?
SELECT 
  py.name,
  COUNT(*) as denial_count
FROM claims c
JOIN payers py ON c.payer_id = py.id
WHERE c.status = 'denied'
GROUP BY py.name
ORDER BY denial_count DESC;
```

**3. Financial tracking:**
```sql
-- Show underpaid claims
SELECT 
  c.claim_number,
  p.full_name as patient,
  c.total_billed,
  c.total_paid,
  (c.total_billed - c.total_paid) as outstanding
FROM claims c
JOIN patients p ON c.patient_id = p.id
WHERE c.total_paid < c.total_billed
ORDER BY outstanding DESC;
```

**4. Authorization rules:**
```sql
-- Check if a visit needs auth based on payer rules
SELECT 
  v.patient_name,
  v.visit_reason,
  py.name as payer,
  py.requires_auth,
  py.auth_procedures
FROM visits v
JOIN payers py ON v.payer_id = py.id
WHERE py.requires_auth = true;
```

---

## Rollback (If Needed)

If something goes wrong, you can remove the new tables:

```sql
-- Drop new tables (cascades to foreign keys)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS claims CASCADE;
DROP TABLE IF EXISTS charges CASCADE;
DROP TABLE IF EXISTS payers CASCADE;
DROP TABLE IF EXISTS providers CASCADE;
DROP TABLE IF EXISTS patients CASCADE;

-- Remove foreign key columns from existing tables
ALTER TABLE visits DROP COLUMN IF EXISTS patient_id;
ALTER TABLE visits DROP COLUMN IF EXISTS provider_id;
ALTER TABLE visits DROP COLUMN IF EXISTS payer_id;
-- (repeat for other tables)
```

Your original text fields (`patient_name`, `provider`, `payer`) are preserved, so your app will still work.

---

## Next Steps

After running these scripts:

1. **Update API layer** - Add endpoints for patients, providers, payers, charges, claims, payments
2. **Update screens** - Use dropdowns for patient/provider/payer selection instead of text input
3. **Add ClaimsScreen** - Show claims with charges, payments, denial tracking
4. **Update DisputesScreen** - Link disputes to claims, show claim details
5. **Add analytics** - Denial rates by payer, revenue by provider, etc.

---

## Troubleshooting

### Error: "column already exists"
- Safe to ignore - the script checks `IF NOT EXISTS`
- Or: You already ran script 2, just proceed to script 3

### Error: "relation already exists"
- Safe to ignore - the script checks `IF NOT EXISTS`
- Or: You already ran script 1, just proceed to script 2

### Error: "policy already exists"
- Fixed in the scripts - we `DROP POLICY IF EXISTS` before creating

### Migration shows 0 patients/providers/payers created
- Check if your `visits` table has data
- Run: `SELECT COUNT(*) FROM visits;`
- If empty, run your visit initialization first

### Some visits don't have patient_id populated
- Check if `patient_name` is NULL in those visits
- The migration only links visits where patient_name matches
- You can manually fix: `UPDATE visits SET patient_id = '...' WHERE id = '...';`

---

## Schema Diagram (After Migration)

```
patients
├── visits (1:many)
│   ├── authorizations (1:many)
│   ├── eligibilities (1:many)
│   ├── charges (1:many)
│   └── claims (1:1 typically)
│       ├── payments (1:many)
│       └── disputes (1:many)
├── claims (1:many)
└── disputes (1:many)

providers
├── visits (1:many)
├── authorizations (1:many)
└── eligibilities (1:many)

payers
├── visits (1:many)
├── authorizations (1:many)
├── eligibilities (1:many)
├── claims (1:many)
└── disputes (1:many)
```