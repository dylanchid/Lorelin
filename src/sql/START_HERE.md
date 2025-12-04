# 🚀 START HERE: Database Migration for Lorelin

## ⚠️ YOU ARE GETTING ERRORS BECAUSE:

Your database is missing tables. Follow these steps **in exact order**.

---

## ✅ Step-by-Step Instructions

### Step 1: Open Supabase SQL Editor
1. Go to your **Supabase Dashboard**
2. Click **SQL Editor** in the left sidebar

---

### Step 2: Run Script 00 (Base Tables)

**File:** `/sql/00_CREATE_ALL_BASE_TABLES_CORRECTED.sql`

1. Open the file in your code editor
2. Copy the **entire contents**
3. Paste into Supabase SQL Editor
4. Click **Run**
5. Wait for success message

**This creates:**
- visits
- authorizations
- eligibilities
- work_items
- disputes (with correct `payer_name` column)
- patients
- providers
- payers

✅ **After this runs successfully, move to Step 3**

---

### Step 3: Run Script 01 (Financial Tables)

**File:** `/sql/01_FINANCIAL_TABLES_CORRECTED.sql`

1. Copy the **entire contents**
2. Paste into Supabase SQL Editor
3. Click **Run**
4. Wait for success message

**This creates:**
- charges (with FK to visits)
- claims (with FK to visits, patients, payers)
- payments (with FK to claims)

✅ **After this runs successfully, move to Step 4**

---

### Step 4: Run Script 02 (Add Foreign Keys)

**File:** `/sql/02_ADD_FOREIGN_KEYS.sql`

1. Copy the **entire contents**
2. Paste into Supabase SQL Editor
3. Click **Run**
4. Wait for success message

**This adds:**
- patient_id, provider_id, payer_id to visits
- patient_id, provider_id, payer_id to authorizations
- patient_id, provider_id, payer_id to eligibilities
- patient_id, payer_id, claim_id to disputes
- patient_id, visit_id, claim_id to work_items

✅ **After this runs successfully, move to Step 5**

---

### Step 5: Run Script 03 (Migrate Data)

**File:** `/sql/03_MIGRATE_DATA.sql`

1. Copy the **entire contents**
2. Paste into Supabase SQL Editor
3. Click **Run**
4. Wait for success message
5. You'll see a summary showing how many records were created

**This migrates:**
- Extracts patients from patient_name fields
- Extracts providers from provider fields
- Extracts payers from payer/payer_name fields
- Updates all foreign keys
- Creates sample claims and charges

✅ **After this runs successfully, move to Step 6**

---

### Step 6: Reload Schema Cache

1. In Supabase Dashboard, go to **Settings** → **API**
2. Scroll down to "PostgREST schema cache"
3. Click **"Reload schema cache"**
4. Wait 10-15 seconds

---

## 🎉 Done!

Your database now has:
- ✅ All base tables (visits, authorizations, etc.)
- ✅ All financial tables (patients, providers, payers, claims, etc.)
- ✅ All foreign key relationships
- ✅ Migrated data

---

## 🐛 Troubleshooting

### "relation already exists"
**This is SAFE to ignore.** The scripts check `IF NOT EXISTS`, so if a table already exists, it won't be recreated.

### "column already exists"  
**This is SAFE to ignore.** The scripts check `IF NOT EXISTS`, so existing columns won't be duplicated.

### "column visit_date does not exist"
**You skipped Step 2.** The visits table wasn't created. Go back and run script 00.

### "relation visits does not exist"
**You skipped Step 2.** Go back and run script 00.

### "relation disputes does not exist"
**You skipped Step 2.** Go back and run script 00.

### "violates foreign key constraint"
**You ran the scripts out of order.** Start over:
1. Drop all tables (see below)
2. Run scripts 00, 01, 02, 03 in order

---

## 🔄 Start Over (If Needed)

If you need to completely reset and start over:

```sql
-- Drop all tables in reverse dependency order
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS claims CASCADE;
DROP TABLE IF EXISTS charges CASCADE;
DROP TABLE IF EXISTS payers CASCADE;
DROP TABLE IF EXISTS providers CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS disputes CASCADE;
DROP TABLE IF EXISTS work_items CASCADE;
DROP TABLE IF EXISTS eligibilities CASCADE;
DROP TABLE IF EXISTS authorizations CASCADE;
DROP TABLE IF EXISTS visits CASCADE;
```

Then run scripts 00, 01, 02, 03 in order.

---

## 📊 Verify Success

After running all scripts, test with this query:

```sql
SELECT 
  'visits' as table_name, COUNT(*) as count FROM visits
UNION ALL
SELECT 'patients', COUNT(*) FROM patients
UNION ALL
SELECT 'providers', COUNT(*) FROM providers
UNION ALL
SELECT 'payers', COUNT(*) FROM payers
UNION ALL
SELECT 'disputes', COUNT(*) FROM disputes
UNION ALL
SELECT 'authorizations', COUNT(*) FROM authorizations
UNION ALL
SELECT 'eligibilities', COUNT(*) FROM eligibilities
UNION ALL
SELECT 'work_items', COUNT(*) FROM work_items;
```

You should see counts > 0 (if you had data) or 0 (if starting fresh).

---

## 📝 Schema Reference

See `/sql/COMPLETE_SCHEMA_DEFINITION.md` for the complete schema definition.

---

## ❓ Still Having Issues?

Make sure you:
1. ✅ Ran scripts in order (00, 01, 02, 03)
2. ✅ Waited for each script to complete successfully before running the next
3. ✅ Used the CORRECTED versions of scripts 00 and 01
4. ✅ Reloaded the schema cache after all scripts completed

If still stuck, share the **exact error message** you're seeing.
