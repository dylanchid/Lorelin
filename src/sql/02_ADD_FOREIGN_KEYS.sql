-- ============================================================================
-- ADD FOREIGN KEYS TO EXISTING TABLES
-- Part 2: Add patient_id, provider_id, payer_id to existing tables
-- Keep existing text fields for backward compatibility during migration
-- ============================================================================

-- ============================================================================
-- UPDATE VISITS TABLE
-- ============================================================================

-- Add foreign key columns (nullable during migration)
ALTER TABLE visits
ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES patients(id),
ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES providers(id),
ADD COLUMN IF NOT EXISTS payer_id UUID REFERENCES payers(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_visits_patient_id ON visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_provider_id ON visits(provider_id);
CREATE INDEX IF NOT EXISTS idx_visits_payer_id ON visits(payer_id);

-- ============================================================================
-- UPDATE AUTHORIZATIONS TABLE
-- ============================================================================

-- Add foreign key columns
ALTER TABLE authorizations
ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES patients(id),
ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES providers(id),
ADD COLUMN IF NOT EXISTS payer_id UUID REFERENCES payers(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_authorizations_patient_id ON authorizations(patient_id);
CREATE INDEX IF NOT EXISTS idx_authorizations_provider_id ON authorizations(provider_id);
CREATE INDEX IF NOT EXISTS idx_authorizations_payer_id ON authorizations(payer_id);

-- ============================================================================
-- UPDATE ELIGIBILITIES TABLE
-- ============================================================================

-- Add foreign key columns
ALTER TABLE eligibilities
ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES patients(id),
ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES providers(id),
ADD COLUMN IF NOT EXISTS payer_id UUID REFERENCES payers(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_eligibilities_patient_id ON eligibilities(patient_id);
CREATE INDEX IF NOT EXISTS idx_eligibilities_provider_id ON eligibilities(provider_id);
CREATE INDEX IF NOT EXISTS idx_eligibilities_payer_id ON eligibilities(payer_id);

-- ============================================================================
-- UPDATE DISPUTES TABLE
-- ============================================================================

-- Add foreign key columns
ALTER TABLE disputes
ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES patients(id),
ADD COLUMN IF NOT EXISTS payer_id UUID REFERENCES payers(id),
ADD COLUMN IF NOT EXISTS claim_id UUID REFERENCES claims(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_disputes_patient_id ON disputes(patient_id);
CREATE INDEX IF NOT EXISTS idx_disputes_payer_id ON disputes(payer_id);
CREATE INDEX IF NOT EXISTS idx_disputes_claim_id ON disputes(claim_id);

-- ============================================================================
-- UPDATE WORK_ITEMS TABLE
-- ============================================================================

-- Add foreign key columns
ALTER TABLE work_items
ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES patients(id),
ADD COLUMN IF NOT EXISTS visit_id UUID REFERENCES visits(id),
ADD COLUMN IF NOT EXISTS claim_id UUID REFERENCES claims(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_work_items_patient_id ON work_items(patient_id);
CREATE INDEX IF NOT EXISTS idx_work_items_visit_id ON work_items(visit_id);
CREATE INDEX IF NOT EXISTS idx_work_items_claim_id ON work_items(claim_id);

-- ============================================================================
-- SUMMARY
-- ============================================================================

-- Foreign keys added to:
-- ✅ visits - patient_id, provider_id, payer_id
-- ✅ authorizations - patient_id, provider_id, payer_id
-- ✅ eligibilities - patient_id, provider_id, payer_id
-- ✅ disputes - patient_id, payer_id, claim_id
-- ✅ work_items - patient_id, visit_id, claim_id

-- Note: All columns are nullable to allow gradual migration
-- After migration is complete, you can optionally make some NOT NULL
