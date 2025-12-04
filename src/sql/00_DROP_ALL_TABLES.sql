-- ============================================================================
-- DROP ALL TABLES - COMPLETE RESET
-- Run this FIRST if you're getting "column does not exist" errors
-- This will delete ALL data and start fresh
-- ============================================================================

-- WARNING: This will delete all data in these tables!
-- Only run this if you're okay with starting over.

-- Drop tables in reverse dependency order (most dependent first)
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

-- Drop the kv_store_e8ce19db table if it exists (this is separate)
-- DROP TABLE IF EXISTS kv_store_e8ce19db CASCADE;  -- Uncomment if you want to drop this too

-- Drop helper functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS exec_sql(TEXT) CASCADE;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- COMPLETION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'ALL TABLES DROPPED SUCCESSFULLY';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'You can now run:';
  RAISE NOTICE '  1. 00_CREATE_ALL_BASE_TABLES.sql';
  RAISE NOTICE '  2. 01_FINANCIAL_TABLES.sql';
  RAISE NOTICE '  3. 02_ADD_FOREIGN_KEYS.sql';
  RAISE NOTICE '  4. 03_MIGRATE_DATA.sql';
  RAISE NOTICE '============================================';
END $$;
