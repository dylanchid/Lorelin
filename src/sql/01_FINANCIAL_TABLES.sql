-- ============================================================================
-- FINANCIAL TABLES WITH FOREIGN KEYS
-- Part 1: Create tables that depend on base tables
-- REQUIRES: 00_CREATE_ALL_BASE_TABLES.sql to be run first
-- ============================================================================

-- This script creates Layer 1 and Layer 2 tables:
-- Layer 1: charges (depends on visits), claims (depends on visits, patients, payers)
-- Layer 2: payments (depends on claims)

-- ============================================================================
-- LAYER 1: charges
-- Depends on: visits(id)
-- ============================================================================

CREATE TABLE IF NOT EXISTS charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  cpt_code TEXT NOT NULL,
  description TEXT,
  modifier TEXT,
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  allowed_amount NUMERIC(10,2),
  paid_amount NUMERIC(10,2) DEFAULT 0,
  is_denied BOOLEAN DEFAULT false,
  denial_code TEXT,
  denial_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_charges_visit_id ON charges(visit_id);
CREATE INDEX IF NOT EXISTS idx_charges_cpt_code ON charges(cpt_code);
CREATE INDEX IF NOT EXISTS idx_charges_is_denied ON charges(is_denied);

-- ============================================================================
-- LAYER 1: claims
-- Depends on: visits(id), patients(id), payers(id)
-- ============================================================================

CREATE TABLE IF NOT EXISTS claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES visits(id),
  patient_id UUID REFERENCES patients(id),
  payer_id UUID REFERENCES payers(id),
  claim_number TEXT,
  status TEXT DEFAULT 'draft',
  total_billed NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_allowed NUMERIC(10,2) DEFAULT 0,
  total_paid NUMERIC(10,2) DEFAULT 0,
  insurance_paid NUMERIC(10,2) DEFAULT 0,
  patient_paid NUMERIC(10,2) DEFAULT 0,
  adjustments NUMERIC(10,2) DEFAULT 0,
  patient_responsibility NUMERIC(10,2) DEFAULT 0,
  denial_reason TEXT,
  denial_code TEXT,
  denial_category TEXT,
  submitted_date DATE,
  accepted_date DATE,
  paid_date DATE,
  denial_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_claims_visit_id ON claims(visit_id);
CREATE INDEX IF NOT EXISTS idx_claims_patient_id ON claims(patient_id);
CREATE INDEX IF NOT EXISTS idx_claims_payer_id ON claims(payer_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_claim_number ON claims(claim_number);
CREATE INDEX IF NOT EXISTS idx_claims_submitted_date ON claims(submitted_date);

-- ============================================================================
-- LAYER 2: payments
-- Depends on: claims(id)
-- ============================================================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  payment_date DATE DEFAULT CURRENT_DATE,
  method TEXT,
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_claim_id ON payments(claim_id);
CREATE INDEX IF NOT EXISTS idx_payments_source_type ON payments(source_type);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations for service role" ON charges;
DROP POLICY IF EXISTS "Allow all operations for service role" ON claims;
DROP POLICY IF EXISTS "Allow all operations for service role" ON payments;

CREATE POLICY "Allow all operations for service role" ON charges
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for service role" ON claims
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for service role" ON payments
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- COMPLETION SUMMARY
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'FINANCIAL TABLES CREATED SUCCESSFULLY';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Layer 1 Tables (depend on base tables):';
  RAISE NOTICE '  ✅ charges → visits(id)';
  RAISE NOTICE '  ✅ claims → visits(id), patients(id), payers(id)';
  RAISE NOTICE '';
  RAISE NOTICE 'Layer 2 Tables (depend on layer 1):';
  RAISE NOTICE '  ✅ payments → claims(id)';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Next: Run 02_ADD_FOREIGN_KEYS.sql';
  RAISE NOTICE '============================================';
END $$;
