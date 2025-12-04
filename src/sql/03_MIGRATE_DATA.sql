-- ============================================================================
-- MIGRATE EXISTING DATA
-- Part 3: Extract normalized entities from denormalized data and populate FKs
-- ============================================================================

-- This script:
-- 1. Creates patients from unique patient_name values across all tables
-- 2. Creates providers from unique provider values
-- 3. Creates payers from unique payer values
-- 4. Updates all foreign keys in visits, authorizations, eligibilities, disputes
-- 5. Creates sample payer rules (auth requirements, network status)

-- ============================================================================
-- STEP 1: CREATE PATIENTS FROM VISITS
-- ============================================================================

-- Insert unique patients from visits table
INSERT INTO patients (first_name, last_name, member_id)
SELECT DISTINCT
  -- Try to split name (assumes "First Last" format)
  SPLIT_PART(v.patient_name, ' ', 1) as first_name,
  CASE 
    WHEN LENGTH(v.patient_name) - LENGTH(REPLACE(v.patient_name, ' ', '')) > 0
    THEN SUBSTRING(v.patient_name FROM POSITION(' ' IN v.patient_name) + 1)
    ELSE v.patient_name
  END as last_name,
  v.member_id
FROM visits v
WHERE v.patient_name IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM patients p WHERE p.full_name = v.patient_name
  )
ON CONFLICT DO NOTHING;

-- Also get patients from authorizations (in case they're not in visits)
INSERT INTO patients (first_name, last_name)
SELECT DISTINCT
  SPLIT_PART(a.patient_name, ' ', 1) as first_name,
  CASE 
    WHEN LENGTH(a.patient_name) - LENGTH(REPLACE(a.patient_name, ' ', '')) > 0
    THEN SUBSTRING(a.patient_name FROM POSITION(' ' IN a.patient_name) + 1)
    ELSE a.patient_name
  END as last_name
FROM authorizations a
WHERE a.patient_name IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM patients p WHERE p.full_name = a.patient_name
  )
ON CONFLICT DO NOTHING;

-- Also get patients from eligibilities
INSERT INTO patients (first_name, last_name, member_id)
SELECT DISTINCT
  SPLIT_PART(e.patient_name, ' ', 1) as first_name,
  CASE 
    WHEN LENGTH(e.patient_name) - LENGTH(REPLACE(e.patient_name, ' ', '')) > 0
    THEN SUBSTRING(e.patient_name FROM POSITION(' ' IN e.patient_name) + 1)
    ELSE e.patient_name
  END as last_name,
  e.member_id
FROM eligibilities e
WHERE e.patient_name IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM patients p WHERE p.full_name = e.patient_name
  )
ON CONFLICT DO NOTHING;

-- Also get patients from disputes (if patient_name field exists)
INSERT INTO patients (first_name, last_name)
SELECT DISTINCT
  SPLIT_PART(d.patient_name, ' ', 1) as first_name,
  CASE 
    WHEN LENGTH(d.patient_name) - LENGTH(REPLACE(d.patient_name, ' ', '')) > 0
    THEN SUBSTRING(d.patient_name FROM POSITION(' ' IN d.patient_name) + 1)
    ELSE d.patient_name
  END as last_name
FROM disputes d
WHERE d.patient_name IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM patients p WHERE p.full_name = d.patient_name
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 2: CREATE PROVIDERS
-- ============================================================================

-- Insert unique providers from visits
INSERT INTO providers (name)
SELECT DISTINCT v.provider
FROM visits v
WHERE v.provider IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM providers p WHERE p.name = v.provider
  )
ON CONFLICT DO NOTHING;

-- Also from authorizations
INSERT INTO providers (name)
SELECT DISTINCT a.provider
FROM authorizations a
WHERE a.provider IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM providers p WHERE p.name = a.provider
  )
ON CONFLICT DO NOTHING;

-- Also from eligibilities
INSERT INTO providers (name)
SELECT DISTINCT e.provider
FROM eligibilities e
WHERE e.provider IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM providers p WHERE p.name = e.provider
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 3: CREATE PAYERS
-- ============================================================================

-- Insert unique payers from visits
INSERT INTO payers (name)
SELECT DISTINCT v.payer
FROM visits v
WHERE v.payer IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM payers p WHERE p.name = v.payer
  )
ON CONFLICT DO NOTHING;

-- Also from authorizations
INSERT INTO payers (name)
SELECT DISTINCT a.payer
FROM authorizations a
WHERE a.payer IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM payers p WHERE p.name = a.payer
  )
ON CONFLICT DO NOTHING;

-- Also from eligibilities
INSERT INTO payers (name)
SELECT DISTINCT e.payer
FROM eligibilities e
WHERE e.payer IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM payers p WHERE p.name = e.payer
  )
ON CONFLICT DO NOTHING;

-- Also from disputes (CRITICAL: use payer_name, not payer)
INSERT INTO payers (name)
SELECT DISTINCT d.payer_name
FROM disputes d
WHERE d.payer_name IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM payers p WHERE p.name = d.payer_name
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 4: UPDATE PAYER METADATA (Rules and network status)
-- ============================================================================

-- Set network status and auth requirements based on common payer patterns
UPDATE payers SET 
  is_in_network = true,
  requires_auth = true,
  auth_procedures = ARRAY['surgery', 'Ophthalmic surgery', 'Retinal surgery'],
  type = 'commercial'
WHERE name ILIKE '%BCBS%' OR name ILIKE '%Blue Cross%';

UPDATE payers SET 
  is_in_network = true,
  requires_auth = true,
  auth_procedures = ARRAY['surgery', 'Ophthalmic surgery', 'Retinal surgery'],
  type = 'commercial'
WHERE name ILIKE '%UHC%' OR name ILIKE '%United%';

UPDATE payers SET 
  is_in_network = true,
  requires_auth = false,
  type = 'medicare'
WHERE name ILIKE '%Medicare%';

UPDATE payers SET 
  is_in_network = true,
  requires_auth = true,
  auth_procedures = ARRAY['surgery', 'specialist visit'],
  type = 'commercial'
WHERE name ILIKE '%Aetna%';

UPDATE payers SET 
  is_in_network = true,
  requires_auth = true,
  auth_procedures = ARRAY['surgery', 'specialist visit'],
  type = 'commercial'
WHERE name ILIKE '%Cigna%';

-- ============================================================================
-- STEP 5: UPDATE FOREIGN KEYS IN VISITS
-- ============================================================================

-- Link visits to patients
UPDATE visits v
SET patient_id = p.id
FROM patients p
WHERE v.patient_name = p.full_name
  AND v.patient_id IS NULL;

-- Link visits to providers
UPDATE visits v
SET provider_id = pr.id
FROM providers pr
WHERE v.provider = pr.name
  AND v.provider_id IS NULL;

-- Link visits to payers
UPDATE visits v
SET payer_id = py.id
FROM payers py
WHERE v.payer = py.name
  AND v.payer_id IS NULL;

-- ============================================================================
-- STEP 6: UPDATE FOREIGN KEYS IN AUTHORIZATIONS
-- ============================================================================

-- Link authorizations to patients
UPDATE authorizations a
SET patient_id = p.id
FROM patients p
WHERE a.patient_name = p.full_name
  AND a.patient_id IS NULL;

-- Link authorizations to providers
UPDATE authorizations a
SET provider_id = pr.id
FROM providers pr
WHERE a.provider = pr.name
  AND a.provider_id IS NULL;

-- Link authorizations to payers
UPDATE authorizations a
SET payer_id = py.id
FROM payers py
WHERE a.payer = py.name
  AND a.payer_id IS NULL;

-- ============================================================================
-- STEP 7: UPDATE FOREIGN KEYS IN ELIGIBILITIES
-- ============================================================================

-- Link eligibilities to patients
UPDATE eligibilities e
SET patient_id = p.id
FROM patients p
WHERE e.patient_name = p.full_name
  AND e.patient_id IS NULL;

-- Link eligibilities to providers
UPDATE eligibilities e
SET provider_id = pr.id
FROM providers pr
WHERE e.provider = pr.name
  AND e.provider_id IS NULL;

-- Link eligibilities to payers
UPDATE eligibilities e
SET payer_id = py.id
FROM payers py
WHERE e.payer = py.name
  AND e.payer_id IS NULL;

-- ============================================================================
-- STEP 8: UPDATE FOREIGN KEYS IN DISPUTES
-- ============================================================================

-- Link disputes to patients
UPDATE disputes d
SET patient_id = p.id
FROM patients p
WHERE d.patient_name = p.full_name
  AND d.patient_id IS NULL;

-- Link disputes to payers (CRITICAL: use payer_name, not payer)
UPDATE disputes d
SET payer_id = py.id
FROM payers py
WHERE d.payer_name = py.name
  AND d.payer_id IS NULL;

-- ============================================================================
-- STEP 9: CREATE SAMPLE CLAIMS FROM EXISTING VISITS
-- ============================================================================

-- For visits that don't have claims yet, create draft claims
-- This gives you something to work with in the Claims screen

INSERT INTO claims (
  visit_id,
  patient_id,
  payer_id,
  status,
  total_billed,
  claim_number
)
SELECT 
  v.id,
  v.patient_id,
  v.payer_id,
  CASE 
    WHEN v.status = 'paid' THEN 'paid'
    WHEN v.status = 'approved' THEN 'submitted'
    WHEN v.status IN ('to-review', 'to-record') THEN 'draft'
    ELSE 'draft'
  END,
  COALESCE(v.charge_estimate, 0),
  'CLM-' || SUBSTRING(v.id::text, 1, 8)
FROM visits v
WHERE v.patient_id IS NOT NULL
  AND v.payer_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM claims c WHERE c.visit_id = v.id
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 10: CREATE SAMPLE CHARGES FROM VISIT DATA
-- ============================================================================

-- Create a single charge line item for each visit based on visit_reason
-- In a real system, you'd have multiple CPT codes per visit

INSERT INTO charges (
  visit_id,
  cpt_code,
  description,
  quantity,
  unit_price
)
SELECT 
  v.id,
  -- Map visit reasons to sample CPT codes
  CASE 
    WHEN v.visit_reason ILIKE '%surgery%' THEN '66984'
    WHEN v.visit_reason ILIKE '%injection%' THEN '67028'
    WHEN v.visit_reason ILIKE '%exam%' THEN '92014'
    WHEN v.visit_reason ILIKE '%follow-up%' THEN '99213'
    ELSE '99213'
  END,
  v.visit_reason,
  1,
  COALESCE(v.charge_estimate, 0)
FROM visits v
WHERE v.id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM charges ch WHERE ch.visit_id = v.id
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Show migration summary
DO $$
DECLARE
  patient_count INTEGER;
  provider_count INTEGER;
  payer_count INTEGER;
  visits_linked INTEGER;
  claims_created INTEGER;
BEGIN
  SELECT COUNT(*) INTO patient_count FROM patients;
  SELECT COUNT(*) INTO provider_count FROM providers;
  SELECT COUNT(*) INTO payer_count FROM payers;
  SELECT COUNT(*) INTO visits_linked FROM visits WHERE patient_id IS NOT NULL;
  SELECT COUNT(*) INTO claims_created FROM claims;
  
  RAISE NOTICE '============================================';
  RAISE NOTICE 'MIGRATION COMPLETE';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Patients created: %', patient_count;
  RAISE NOTICE 'Providers created: %', provider_count;
  RAISE NOTICE 'Payers created: %', payer_count;
  RAISE NOTICE 'Visits linked: %', visits_linked;
  RAISE NOTICE 'Claims created: %', claims_created;
  RAISE NOTICE '============================================';
END $$;

-- Show sample linked data
SELECT 
  'Sample Data' as info,
  v.id as visit_id,
  p.full_name as patient,
  pr.name as provider,
  py.name as payer,
  c.claim_number,
  c.status as claim_status,
  c.total_billed
FROM visits v
LEFT JOIN patients p ON v.patient_id = p.id
LEFT JOIN providers pr ON v.provider_id = pr.id
LEFT JOIN payers py ON v.payer_id = py.id
LEFT JOIN claims c ON c.visit_id = v.id
LIMIT 5;
