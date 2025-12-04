-- ============================================================================
-- PRE-VISIT DATA LINKING
-- This script creates sample visits and links them to auth/eligibility records
-- Run this AFTER creating the authorizations and eligibilities tables
-- ============================================================================

-- First, let's update the existing auth/eligibility records to use real visit IDs

-- We'll create a few sample visits with known IDs that match the auth/elig data
-- These visits will have pre_visit_step and pre_visit_risk fields

-- ============================================================================
-- STEP 1: Check if visits table exists and has the right columns
-- ============================================================================

-- If your visits table doesn't have these columns, you'll need to add them:
-- ALTER TABLE visits ADD COLUMN IF NOT EXISTS pre_visit_step TEXT;
-- ALTER TABLE visits ADD COLUMN IF NOT EXISTS pre_visit_risk TEXT;

-- ============================================================================
-- STEP 2: Insert or update sample visits with specific IDs
-- ============================================================================

-- Visit 1: K. Williams - needs auth (draft ready) + has eligibility (pending)
INSERT INTO visits (
  id, patient_name, patient_age, visit_date, visit_time, 
  provider, payer, visit_reason, status, charge_estimate,
  member_id, group_number, pre_visit_step, pre_visit_risk
) VALUES (
  'visit_kwilliams_001',
  'K. Williams',
  76,
  (CURRENT_DATE + INTERVAL '5 days')::text,
  '10:30 AM',
  'Dr. Ganti',
  'BCBS PPO',
  'Cataract surgery – Right eye',
  'to-record',
  8500,
  'W123456789',
  '98765',
  'auth-draft-ready',
  'at-risk'
)
ON CONFLICT (id) DO UPDATE SET
  patient_name = EXCLUDED.patient_name,
  payer = EXCLUDED.payer,
  provider = EXCLUDED.provider,
  visit_reason = EXCLUDED.visit_reason,
  visit_date = EXCLUDED.visit_date,
  visit_time = EXCLUDED.visit_time,
  member_id = EXCLUDED.member_id,
  group_number = EXCLUDED.group_number,
  pre_visit_step = EXCLUDED.pre_visit_step,
  pre_visit_risk = EXCLUDED.pre_visit_risk;

-- Visit 2: John Smith - approved auth
INSERT INTO visits (
  id, patient_name, patient_age, visit_date, visit_time, 
  provider, payer, visit_reason, status, charge_estimate,
  member_id, group_number, pre_visit_step, pre_visit_risk
) VALUES (
  'visit_jsmith_001',
  'John Smith',
  73,
  (CURRENT_DATE + INTERVAL '6 days')::text,
  '2:00 PM',
  'Dr. Patel',
  'Medicare',
  'Retinal surgery',
  'to-record',
  12500,
  'MCARE78901',
  'N/A',
  'auth-approved',
  'ready'
)
ON CONFLICT (id) DO UPDATE SET
  patient_name = EXCLUDED.patient_name,
  payer = EXCLUDED.payer,
  provider = EXCLUDED.provider,
  visit_reason = EXCLUDED.visit_reason,
  visit_date = EXCLUDED.visit_date,
  visit_time = EXCLUDED.visit_time,
  member_id = EXCLUDED.member_id,
  group_number = EXCLUDED.group_number,
  pre_visit_step = EXCLUDED.pre_visit_step,
  pre_visit_risk = EXCLUDED.pre_visit_risk;

-- Visit 3: Maria Garcia - eligibility verified
INSERT INTO visits (
  id, patient_name, patient_age, visit_date, visit_time, 
  provider, payer, visit_reason, status, charge_estimate,
  member_id, group_number, pre_visit_step, pre_visit_risk
) VALUES (
  'visit_mgarcia_001',
  'Maria Garcia',
  47,
  (CURRENT_DATE + INTERVAL '6 days')::text,
  '11:00 AM',
  'Dr. Lee',
  'UHC',
  'Retina follow-up',
  'to-record',
  450,
  'UHC456789',
  'GRP003',
  'ready',
  'ready'
)
ON CONFLICT (id) DO UPDATE SET
  patient_name = EXCLUDED.patient_name,
  payer = EXCLUDED.payer,
  provider = EXCLUDED.provider,
  visit_reason = EXCLUDED.visit_reason,
  visit_date = EXCLUDED.visit_date,
  visit_time = EXCLUDED.visit_time,
  member_id = EXCLUDED.member_id,
  group_number = EXCLUDED.group_number,
  pre_visit_step = EXCLUDED.pre_visit_step,
  pre_visit_risk = EXCLUDED.pre_visit_risk;

-- Visit 4: Sarah Thompson - needs eligibility check
INSERT INTO visits (
  id, patient_name, patient_age, visit_date, visit_time, 
  provider, payer, visit_reason, status, charge_estimate,
  member_id, group_number, pre_visit_step, pre_visit_risk
) VALUES (
  'visit_sthompson_001',
  'Sarah Thompson',
  52,
  (CURRENT_DATE + INTERVAL '4 days')::text,
  '9:00 AM',
  'Dr. Kim',
  'Aetna HMO',
  'Annual exam',
  'to-record',
  385,
  'AET789456',
  'GRP008',
  'eligibility-pending',
  'at-risk'
)
ON CONFLICT (id) DO UPDATE SET
  patient_name = EXCLUDED.patient_name,
  payer = EXCLUDED.payer,
  provider = EXCLUDED.provider,
  visit_reason = EXCLUDED.visit_reason,
  visit_date = EXCLUDED.visit_date,
  visit_time = EXCLUDED.visit_time,
  member_id = EXCLUDED.member_id,
  group_number = EXCLUDED.group_number,
  pre_visit_step = EXCLUDED.pre_visit_step,
  pre_visit_risk = EXCLUDED.pre_visit_risk;

-- ============================================================================
-- STEP 3: Create additional eligibility check for Sarah Thompson
-- ============================================================================

INSERT INTO eligibilities (
  id, visit_id, patient_name, patient_id, patient_dob, patient_sex, provider, payer,
  plan_id, member_id, group_number, visit_date, visit_time, visit_reason, service_type,
  location, benefit_type, status, lorelin_available, current_result, history, notes
) VALUES (
  'elig_003',
  'visit_sthompson_001',
  'Sarah Thompson',
  'PT789456',
  '11/15/1973',
  'Female',
  'Dr. Kim',
  'Aetna HMO',
  'AET001',
  'AET789456',
  'GRP008',
  (CURRENT_DATE + INTERVAL '4 days')::text,
  '9:00 AM',
  'Annual exam',
  'Office visit',
  'Main Office · Suite 200',
  'Medical benefits',
  'pending',
  true,
  NULL,
  '[]'::jsonb,
  ''
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 4: Verify the linkages
-- ============================================================================

-- This query should show you all visits with their related auth/elig records
SELECT 
  v.id as visit_id,
  v.patient_name,
  v.visit_date,
  v.visit_time,
  v.pre_visit_step,
  v.pre_visit_risk,
  (SELECT COUNT(*) FROM authorizations WHERE visit_id = v.id) as auth_count,
  (SELECT COUNT(*) FROM eligibilities WHERE visit_id = v.id) as elig_count
FROM visits v
WHERE v.id IN ('visit_kwilliams_001', 'visit_jsmith_001', 'visit_mgarcia_001', 'visit_sthompson_001')
ORDER BY v.visit_date;
