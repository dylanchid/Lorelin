# What Changed - Fixed Migration Scripts

## The Problem

You were getting errors like:
- ❌ `relation "visits" does not exist`
- ❌ `relation "authorizations" does not exist`
- ❌ `relation "disputes" does not exist`
- ❌ `column "visit_date" does not exist`

## Root Causes Found

### 1. **Missing visits table**
The `visits` table was documented in SUPABASE_SETUP.md but was NOT in SUPABASE_SCHEMA.sql. The migration scripts assumed it existed, but it didn't.

### 2. **Wrong column name in disputes**
The backend code uses `payer_name` but the schema definition used `payer`. This caused insert failures.

### 3. **Forward references**
Scripts were trying to add foreign keys to tables that didn't exist yet.

### 4. **Circular dependencies**
Scripts were creating tables in the wrong order, referencing tables before they were created.

---

## The Solution

I rewrote the migration from first principles with a clear dependency graph:

### Layer 0 (No Dependencies)
These tables have NO foreign keys to other tables:
- visits
- authorizations  
- eligibilities
- work_items
- disputes
- patients
- providers
- payers

### Layer 1 (Depends on Layer 0)
These tables have foreign keys to Layer 0 tables:
- charges (→ visits)
- claims (→ visits, patients, payers)

### Layer 2 (Depends on Layer 1)
These tables have foreign keys to Layer 1 tables:
- payments (→ claims)

---

## New Files Created

### `/sql/00_CREATE_ALL_BASE_TABLES_CORRECTED.sql`
**What's different:**
- ✅ Creates the missing `visits` table
- ✅ Uses correct `payer_name` column for disputes (not `payer`)
- ✅ Creates ALL base tables (visits, authorizations, eligibilities, work_items, disputes, patients, providers, payers)
- ✅ NO foreign keys between these tables (they're standalone)
- ✅ Includes helper functions (exec_sql, update_updated_at_column)

### `/sql/01_FINANCIAL_TABLES_CORRECTED.sql`
**What's different:**
- ✅ Only creates tables that depend on base tables
- ✅ Creates charges, claims, payments in the correct order
- ✅ Proper foreign key references to existing tables
- ✅ No forward references

### `/sql/02_ADD_FOREIGN_KEYS.sql`
**No changes needed** - this script was already correct

### `/sql/03_MIGRATE_DATA.sql`
**No changes needed** - this script was already correct

---

## Changes from Original Schema

### visits table
**Before:** Didn't exist  
**After:** 
```sql
CREATE TABLE visits (
  id UUID PRIMARY KEY,
  patient_name TEXT NOT NULL,
  visit_date DATE NOT NULL,  -- Now exists!
  visit_time TEXT NOT NULL,
  provider TEXT NOT NULL,
  payer TEXT NOT NULL,
  -- ... other columns
);
```

### disputes table
**Before:**
```sql
payer TEXT NOT NULL,  -- WRONG! Backend uses payer_name
```

**After:**
```sql
payer_name TEXT NOT NULL,  -- CORRECT! Matches backend
```

### patients, providers, payers
**Before:** Mixed with financial tables  
**After:** Created in base tables script (Layer 0) so they exist before claims/charges need them

---

## Files You Should Use

### ✅ Use These (CORRECTED):
- `/sql/00_CREATE_ALL_BASE_TABLES_CORRECTED.sql`
- `/sql/01_FINANCIAL_TABLES_CORRECTED.sql`
- `/sql/02_ADD_FOREIGN_KEYS.sql` (unchanged)
- `/sql/03_MIGRATE_DATA.sql` (unchanged)

### ❌ Don't Use These (OLD):
- `/sql/00_CREATE_BASE_TABLES.sql` (missing visits, wrong payer column)
- `/sql/00_CREATE_ALL_BASE_TABLES.sql` (missing visits, wrong payer column)
- `/sql/01_FINANCIAL_TABLES.sql` (wrong table order, patients/providers in wrong layer)

---

## Verification

After running the corrected scripts, this query should work:

```sql
-- All these tables should exist
SELECT 
  'visits' as table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'visits' AND column_name = 'visit_date') as has_visit_date_column,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'disputes' AND column_name = 'payer_name') as has_payer_name_column
FROM information_schema.tables 
WHERE table_name = 'visits';
```

Expected result:
- `has_visit_date_column` = 1
- `has_payer_name_column` = 1

---

## Summary

The migration was failing because:
1. ❌ visits table didn't exist
2. ❌ disputes had wrong column name (payer instead of payer_name)
3. ❌ Tables were created in wrong order

Now:
1. ✅ visits table is created first
2. ✅ disputes uses correct column name (payer_name)
3. ✅ All tables created in correct dependency order

**Just run the 4 CORRECTED scripts in order and you're done!**
