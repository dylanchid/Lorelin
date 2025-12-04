-- ============================================================================
-- NEW TABLES FOR AUTH & ELIGIBILITY WORKFLOWS
-- This file ONLY creates the new authorizations and eligibilities tables
-- Your existing visits, work_items, and disputes tables will NOT be touched
-- ============================================================================

-- ============================================================================
-- AUTHORIZATIONS TABLE
-- Stores prior authorization requests for medical procedures
-- ============================================================================

CREATE TABLE IF NOT EXISTS authorizations (
  id TEXT PRIMARY KEY,
  visit_id TEXT,
  
  -- Patient information
  patient_name TEXT NOT NULL,
  patient_id TEXT,
  patient_dob TEXT,
  
  -- Provider and payer info
  provider TEXT,
  payer TEXT NOT NULL,
  plan_id TEXT,
  
  -- Visit details
  visit_date TEXT,
  visit_time TEXT,
  visit_reason TEXT,
  procedure_type TEXT,
  location TEXT,
  
  -- Authorization status and details
  status TEXT NOT NULL DEFAULT 'needed', -- needed, draft-ready, submitting, submitted, approved, denied
  clinical_justification TEXT,
  cpt_codes JSONB DEFAULT '[]'::jsonb,
  icd10_codes JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  
  -- Submission tracking
  submitted_date TIMESTAMPTZ,
  submitted_by TEXT,
  submission_method TEXT, -- auto, manual
  
  -- Decision tracking
  pa_id TEXT,
  valid_from TEXT,
  valid_to TEXT,
  approved_date TIMESTAMPTZ,
  approved_by TEXT,
  denied_date TIMESTAMPTZ,
  denied_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups by visit
CREATE INDEX IF NOT EXISTS idx_authorizations_visit_id ON authorizations(visit_id);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_authorizations_status ON authorizations(status);

-- ============================================================================
-- ELIGIBILITIES TABLE
-- Stores eligibility verification checks for patient insurance
-- ============================================================================

CREATE TABLE IF NOT EXISTS eligibilities (
  id TEXT PRIMARY KEY,
  visit_id TEXT,
  
  -- Patient information
  patient_name TEXT NOT NULL,
  patient_id TEXT,
  patient_dob TEXT,
  patient_sex TEXT,
  
  -- Provider and payer info
  provider TEXT,
  payer TEXT NOT NULL,
  plan_id TEXT,
  member_id TEXT,
  group_number TEXT,
  
  -- Visit details
  visit_date TEXT,
  visit_time TEXT,
  visit_reason TEXT,
  service_type TEXT,
  location TEXT,
  benefit_type TEXT DEFAULT 'Medical benefits',
  
  -- Eligibility status
  status TEXT NOT NULL DEFAULT 'pending', -- pending, verified, failed
  lorelin_available BOOLEAN DEFAULT true,
  
  -- Current result (JSON object with coverage details)
  current_result JSONB,
  
  -- History of checks (JSON array of check records)
  history JSONB DEFAULT '[]'::jsonb,
  
  -- Notes
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups by visit
CREATE INDEX IF NOT EXISTS idx_eligibilities_visit_id ON eligibilities(visit_id);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_eligibilities_status ON eligibilities(status);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibilities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Allow all operations for service role" ON authorizations;
DROP POLICY IF EXISTS "Allow all operations for service role" ON eligibilities;

-- Create permissive policies for service role (backend access)
CREATE POLICY "Allow all operations for service role" ON authorizations
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for service role" ON eligibilities
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- SAMPLE DATA FOR AUTHORIZATIONS
-- ============================================================================

INSERT INTO authorizations (
  id, visit_id, patient_name, patient_id, patient_dob, provider, payer, plan_id,
  visit_date, visit_time, visit_reason, procedure_type, location, status,
  clinical_justification, cpt_codes, icd10_codes, notes
) VALUES
(
  'auth_001',
  'visit_kwilliams_001',
  'K. Williams',
  '12345',
  '03/15/1949',
  'Dr. Ganti',
  'BCBS PPO',
  '12345',
  'Dec 8',
  '10:30 AM',
  'Cataract surgery – Right eye',
  'Ophthalmic surgery',
  'Main Office · Suite 200',
  'draft-ready',
  '76-year-old patient with visually significant cataract OD. Best corrected visual acuity 20/60 with significant glare and difficulty with daily activities including reading and driving. Conservative measures including updated glasses prescription have been unsuccessful. Patient is appropriate candidate for cataract extraction with IOL implantation.',
  '[{"code": "66984", "description": "Cataract extraction with IOL"}]'::jsonb,
  '[{"code": "H25.13", "description": "Age-related nuclear cataract, bilateral"}]'::jsonb,
  ''
),
(
  'auth_002',
  'visit_jsmith_001',
  'John Smith',
  '67890',
  '05/22/1952',
  'Dr. Patel',
  'Medicare',
  '98765',
  'Dec 9',
  '2:00 PM',
  'Retinal surgery',
  'Retinal surgery',
  'Main Office · Suite 200',
  'approved',
  'Patient presents with retinal detachment in the left eye requiring immediate surgical intervention.',
  '[{"code": "67108", "description": "Repair of retinal detachment"}]'::jsonb,
  '[{"code": "H33.001", "description": "Unspecified retinal detachment with retinal break, right eye"}]'::jsonb,
  ''
)
ON CONFLICT (id) DO NOTHING;

-- Update auth_002 with approval details
UPDATE authorizations
SET
  submitted_date = NOW() - INTERVAL '2 days',
  submitted_by = 'Amy',
  submission_method = 'auto',
  pa_id = 'PA987654',
  valid_from = '12/01/25',
  valid_to = '02/28/26',
  approved_date = NOW() - INTERVAL '1 day',
  approved_by = 'Amy'
WHERE id = 'auth_002';

-- ============================================================================
-- SAMPLE DATA FOR ELIGIBILITIES
-- ============================================================================

INSERT INTO eligibilities (
  id, visit_id, patient_name, patient_id, patient_dob, patient_sex, provider, payer,
  plan_id, member_id, group_number, visit_date, visit_time, visit_reason, service_type,
  location, benefit_type, status, lorelin_available, current_result, history, notes
) VALUES
(
  'elig_001',
  'visit_kwilliams_001',
  'K. Williams',
  '12345',
  '03/15/1949',
  'Female',
  'Dr. Ganti',
  'BCBS PPO',
  '12345',
  'W123456789',
  '98765',
  'Dec 8',
  '10:30 AM',
  'Cataract surgery – Right eye',
  'Ophthalmic surgery',
  'Main Office · Suite 200',
  'Medical benefits',
  'pending',
  true,
  NULL,
  '[
    {"timestamp": "Nov 1 · 10:02 AM", "status": "failed", "method": "lorelin", "note": "Coverage terminated 10/31/2025"},
    {"timestamp": "Oct 1 · 09:30 AM", "status": "verified", "method": "manual", "note": "Patient switching plans"}
  ]'::jsonb,
  ''
),
(
  'elig_002',
  'visit_mgarcia_001',
  'Maria Garcia',
  '67890',
  '07/18/1978',
  'Female',
  'Dr. Lee',
  'UHC',
  '54321',
  'UHC456789',
  'GRP003',
  'Dec 9',
  '11:00 AM',
  'Retina follow-up',
  'Outpatient visit',
  'Main Office · Suite 200',
  'Medical benefits',
  'verified',
  true,
  '{
    "status": "active",
    "planName": "UnitedHealthcare PPO",
    "effectiveDates": "01/01/2025–12/31/2025",
    "officeVisitCopay": "$35",
    "deductibleRemaining": "$450"
  }'::jsonb,
  '[
    {"timestamp": "Today · 09:15 AM", "status": "verified", "method": "lorelin", "note": "Real-time check via Lorelin"}
  ]'::jsonb,
  ''
)
ON CONFLICT (id) DO NOTHING;