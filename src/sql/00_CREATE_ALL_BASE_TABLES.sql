-- ============================================================================
-- LORELIN BASE TABLES - COMPLETE SCHEMA
-- This script creates ALL base tables with NO cross-table foreign keys
-- Run this FIRST before any other migration scripts
-- ============================================================================

-- ============================================================================
-- TABLE 1: visits
-- No dependencies
-- ============================================================================

CREATE TABLE IF NOT EXISTS visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  patient_age INTEGER,
  visit_date DATE NOT NULL,
  visit_time TEXT NOT NULL,
  provider TEXT NOT NULL,
  payer TEXT NOT NULL,
  visit_reason TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('to-record', 'transcribing', 'to-review', 'approved', 'sent', 'paid')),
  charge_estimate INTEGER NOT NULL,
  member_id TEXT,
  group_number TEXT,
  pre_visit_step TEXT,
  pre_visit_risk TEXT CHECK (pre_visit_risk IN ('ready', 'at-risk', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visits_date ON visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_visits_status ON visits(status);
CREATE INDEX IF NOT EXISTS idx_visits_pre_visit_risk ON visits(pre_visit_risk);

-- ============================================================================
-- TABLE 2: authorizations
-- No dependencies (visit_id is TEXT, not a foreign key)
-- ============================================================================

CREATE TABLE IF NOT EXISTS authorizations (
  id TEXT PRIMARY KEY,
  visit_id TEXT,
  patient_name TEXT NOT NULL,
  patient_id TEXT,
  patient_dob TEXT,
  provider TEXT,
  payer TEXT NOT NULL,
  plan_id TEXT,
  visit_date TEXT,
  visit_time TEXT,
  visit_reason TEXT,
  procedure_type TEXT,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'needed',
  clinical_justification TEXT,
  cpt_codes JSONB DEFAULT '[]'::jsonb,
  icd10_codes JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  submitted_date TIMESTAMPTZ,
  submitted_by TEXT,
  submission_method TEXT,
  pa_id TEXT,
  valid_from TEXT,
  valid_to TEXT,
  approved_date TIMESTAMPTZ,
  approved_by TEXT,
  denied_date TIMESTAMPTZ,
  denied_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_authorizations_visit_id ON authorizations(visit_id);
CREATE INDEX IF NOT EXISTS idx_authorizations_status ON authorizations(status);

-- ============================================================================
-- TABLE 3: eligibilities
-- No dependencies (visit_id is TEXT, not a foreign key)
-- ============================================================================

CREATE TABLE IF NOT EXISTS eligibilities (
  id TEXT PRIMARY KEY,
  visit_id TEXT,
  patient_name TEXT NOT NULL,
  patient_id TEXT,
  patient_dob TEXT,
  patient_sex TEXT,
  provider TEXT,
  payer TEXT NOT NULL,
  plan_id TEXT,
  member_id TEXT,
  group_number TEXT,
  visit_date TEXT,
  visit_time TEXT,
  visit_reason TEXT,
  service_type TEXT,
  location TEXT,
  benefit_type TEXT DEFAULT 'Medical benefits',
  status TEXT NOT NULL DEFAULT 'pending',
  lorelin_available BOOLEAN DEFAULT true,
  current_result JSONB,
  history JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eligibilities_visit_id ON eligibilities(visit_id);
CREATE INDEX IF NOT EXISTS idx_eligibilities_status ON eligibilities(status);

-- ============================================================================
-- TABLE 4: work_items  
-- No dependencies (visit_id and dispute_id are TEXT, not foreign keys)
-- ============================================================================

CREATE TABLE IF NOT EXISTS work_items (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  step TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  description TEXT NOT NULL,
  provider TEXT,
  payer TEXT,
  value NUMERIC,
  value_label TEXT,
  deadline TEXT,
  deadline_label TEXT,
  urgency TEXT,
  visit_id TEXT,
  dispute_id TEXT,
  completed BOOLEAN DEFAULT false,
  assigned_to TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_work_items_type ON work_items(type);
CREATE INDEX IF NOT EXISTS idx_work_items_step ON work_items(step);
CREATE INDEX IF NOT EXISTS idx_work_items_completed ON work_items(completed);

-- ============================================================================
-- TABLE 5: disputes
-- No dependencies (claim_id is TEXT, not a foreign key)
-- CRITICAL: Backend uses payer_name, NOT payer
-- ============================================================================

CREATE TABLE IF NOT EXISTS disputes (
  id SERIAL PRIMARY KEY,
  patient_name TEXT NOT NULL,
  claim_id TEXT NOT NULL,
  procedure_name TEXT NOT NULL,
  procedure_code TEXT,
  payer_name TEXT NOT NULL,
  plan_type TEXT,
  billed NUMERIC NOT NULL,
  paid NUMERIC NOT NULL,
  potential NUMERIC,
  contract_expected NUMERIC,
  contract_gap NUMERIC,
  type TEXT NOT NULL,
  path TEXT,
  issue TEXT,
  status TEXT NOT NULL,
  next_action TEXT,
  deadline_date TEXT,
  deadline_label TEXT,
  path_tooltip TEXT,
  is_urgent BOOLEAN DEFAULT false,
  assigned_to TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_deadline ON disputes(deadline_date);
CREATE INDEX IF NOT EXISTS idx_disputes_urgent ON disputes(is_urgent);

-- ============================================================================
-- TABLE 6: patients
-- No dependencies
-- ============================================================================

CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  date_of_birth DATE,
  email TEXT,
  phone TEXT,
  member_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_full_name ON patients(full_name);
CREATE INDEX IF NOT EXISTS idx_patients_member_id ON patients(member_id);

-- ============================================================================
-- TABLE 7: providers
-- No dependencies
-- ============================================================================

CREATE TABLE IF NOT EXISTS providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  npi TEXT,
  specialty TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_providers_name ON providers(name);
CREATE INDEX IF NOT EXISTS idx_providers_npi ON providers(npi);

-- ============================================================================
-- TABLE 8: payers
-- No dependencies
-- ============================================================================

CREATE TABLE IF NOT EXISTS payers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  short_name TEXT,
  type TEXT,
  is_in_network BOOLEAN DEFAULT true,
  requires_auth BOOLEAN DEFAULT false,
  auth_procedures TEXT[],
  auth_turnaround_days INTEGER DEFAULT 5,
  typical_denial_rate NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payers_name ON payers(name);
CREATE INDEX IF NOT EXISTS idx_payers_short_name ON payers(short_name);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations for service role" ON visits;
DROP POLICY IF EXISTS "Allow all operations on visits" ON visits;
DROP POLICY IF EXISTS "Allow all operations for service role" ON authorizations;
DROP POLICY IF EXISTS "Allow all operations for service role" ON eligibilities;
DROP POLICY IF EXISTS "Allow all operations for service role" ON work_items;
DROP POLICY IF EXISTS "Allow all operations for service role" ON disputes;
DROP POLICY IF EXISTS "Allow all operations for service role" ON patients;
DROP POLICY IF EXISTS "Allow all operations for service role" ON providers;
DROP POLICY IF EXISTS "Allow all operations for service role" ON payers;

-- Create permissive policies
CREATE POLICY "Allow all operations for service role" ON visits
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for service role" ON authorizations
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for service role" ON eligibilities
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for service role" ON work_items
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for service role" ON disputes
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for service role" ON patients
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for service role" ON providers
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for service role" ON payers
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for visits
DROP TRIGGER IF EXISTS update_visits_updated_at ON visits;
CREATE TRIGGER update_visits_updated_at
  BEFORE UPDATE ON visits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Exec SQL function (for bypassing PostgREST cache)
CREATE OR REPLACE FUNCTION exec_sql(query TEXT)
RETURNS SETOF JSON AS $$
BEGIN
  RETURN QUERY EXECUTE 'SELECT row_to_json(t) FROM (' || query || ') t';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- COMPLETION SUMMARY
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'BASE TABLES CREATED SUCCESSFULLY';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Layer 0 Tables (no dependencies):';
  RAISE NOTICE '  ✅ visits';
  RAISE NOTICE '  ✅ authorizations';
  RAISE NOTICE '  ✅ eligibilities';
  RAISE NOTICE '  ✅ work_items';
  RAISE NOTICE '  ✅ disputes (with payer_name column)';
  RAISE NOTICE '  ✅ patients';
  RAISE NOTICE '  ✅ providers';
  RAISE NOTICE '  ✅ payers';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Next: Run 01_FINANCIAL_TABLES.sql';
  RAISE NOTICE '============================================';
END $$;
