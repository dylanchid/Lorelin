-- ============================================================================
-- PRE-VISIT DATA LINKING V2
-- This script updates existing visits and creates linked auth/eligibility records
-- Works with auto-generated UUIDs instead of custom IDs
-- ============================================================================

-- ============================================================================
-- STEP 1: Find existing visits and update their pre_visit fields
-- ============================================================================

-- Update K. Williams visit (if it exists) to show auth-draft-ready
UPDATE visits
SET 
  pre_visit_step = 'auth-draft-ready',
  pre_visit_risk = 'at-risk'
WHERE patient_name = 'K. Williams'
  AND visit_reason LIKE '%Cataract%'
RETURNING id, patient_name, visit_date, visit_time;

-- Update John Smith visit (if it exists) to show auth-approved
UPDATE visits
SET 
  pre_visit_step = 'auth-approved',
  pre_visit_risk = 'ready'
WHERE patient_name = 'John Smith'
  AND visit_reason LIKE '%Retinal%'
RETURNING id, patient_name, visit_date, visit_time;

-- Update Maria Garcia visit (if it exists) to show eligibility verified
UPDATE visits
SET 
  pre_visit_step = 'ready',
  pre_visit_risk = 'ready'
WHERE patient_name = 'Maria Garcia'
  AND visit_reason LIKE '%Retina%'
RETURNING id, patient_name, visit_date, visit_time;

-- ============================================================================
-- STEP 2: Create auth/eligibility records linked to these visits
-- ============================================================================

-- For K. Williams - create auth record linked to visit
DO $$
DECLARE
  v_visit_id TEXT;
BEGIN
  -- Get the visit ID for K. Williams
  SELECT id INTO v_visit_id
  FROM visits
  WHERE patient_name = 'K. Williams'
    AND visit_reason LIKE '%Cataract%'
  LIMIT 1;
  
  IF v_visit_id IS NOT NULL THEN
    -- Create authorization record
    INSERT INTO authorizations (
      id, visit_id, patient_name, patient_id, patient_dob, provider, payer, plan_id,
      visit_date, visit_time, visit_reason, procedure_type, location, status,
      clinical_justification, cpt_codes, icd10_codes, notes
    )
    SELECT
      'auth_kwilliams_' || SUBSTRING(v_visit_id, 1, 8),
      v_visit_id,
      'K. Williams',
      '12345',
      '03/15/1949',
      'Dr. Ganti',
      'BCBS PPO',
      '12345',
      visit_date,
      visit_time,
      visit_reason,
      'Ophthalmic surgery',
      'Main Office · Suite 200',
      'draft-ready',
      '76-year-old patient with visually significant cataract OD. Best corrected visual acuity 20/60 with significant glare and difficulty with daily activities including reading and driving. Conservative measures including updated glasses prescription have been unsuccessful. Patient is appropriate candidate for cataract extraction with IOL implantation.',
      '[{"code": "66984", "description": "Cataract extraction with IOL"}]'::jsonb,
      '[{"code": "H25.13", "description": "Age-related nuclear cataract, bilateral"}]'::jsonb,
      ''
    FROM visits
    WHERE id = v_visit_id
    ON CONFLICT (id) DO NOTHING;
    
    -- Create eligibility record
    INSERT INTO eligibilities (
      id, visit_id, patient_name, patient_id, patient_dob, patient_sex, provider, payer,
      plan_id, member_id, group_number, visit_date, visit_time, visit_reason, service_type,
      location, benefit_type, status, lorelin_available, current_result, history, notes
    )
    SELECT
      'elig_kwilliams_' || SUBSTRING(v_visit_id, 1, 8),
      v_visit_id,
      'K. Williams',
      '12345',
      '03/15/1949',
      'Female',
      'Dr. Ganti',
      'BCBS PPO',
      '12345',
      member_id,
      group_number,
      visit_date,
      visit_time,
      visit_reason,
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
    FROM visits
    WHERE id = v_visit_id
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Created auth and eligibility for K. Williams (visit_id: %)', v_visit_id;
  END IF;
END $$;

-- For John Smith - create auth record (approved)
DO $$
DECLARE
  v_visit_id TEXT;
BEGIN
  SELECT id INTO v_visit_id
  FROM visits
  WHERE patient_name = 'John Smith'
    AND visit_reason LIKE '%Retinal%'
  LIMIT 1;
  
  IF v_visit_id IS NOT NULL THEN
    INSERT INTO authorizations (
      id, visit_id, patient_name, patient_id, patient_dob, provider, payer, plan_id,
      visit_date, visit_time, visit_reason, procedure_type, location, status,
      clinical_justification, cpt_codes, icd10_codes, notes,
      submitted_date, submitted_by, submission_method, pa_id, valid_from, valid_to,
      approved_date, approved_by
    )
    SELECT
      'auth_jsmith_' || SUBSTRING(v_visit_id, 1, 8),
      v_visit_id,
      'John Smith',
      '67890',
      '05/22/1952',
      provider,
      payer,
      '98765',
      visit_date,
      visit_time,
      visit_reason,
      'Retinal surgery',
      'Main Office · Suite 200',
      'approved',
      'Patient presents with retinal detachment in the left eye requiring immediate surgical intervention.',
      '[{"code": "67108", "description": "Repair of retinal detachment"}]'::jsonb,
      '[{"code": "H33.001", "description": "Unspecified retinal detachment with retinal break, right eye"}]'::jsonb,
      '',
      NOW() - INTERVAL '2 days',
      'Amy',
      'auto',
      'PA987654',
      '12/01/25',
      '02/28/26',
      NOW() - INTERVAL '1 day',
      'Amy'
    FROM visits
    WHERE id = v_visit_id
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Created auth for John Smith (visit_id: %)', v_visit_id;
  END IF;
END $$;

-- For Maria Garcia - create eligibility record (verified)
DO $$
DECLARE
  v_visit_id TEXT;
BEGIN
  SELECT id INTO v_visit_id
  FROM visits
  WHERE patient_name = 'Maria Garcia'
    AND visit_reason LIKE '%Retina%'
  LIMIT 1;
  
  IF v_visit_id IS NOT NULL THEN
    INSERT INTO eligibilities (
      id, visit_id, patient_name, patient_id, patient_dob, patient_sex, provider, payer,
      plan_id, member_id, group_number, visit_date, visit_time, visit_reason, service_type,
      location, benefit_type, status, lorelin_available, current_result, history, notes
    )
    SELECT
      'elig_mgarcia_' || SUBSTRING(v_visit_id, 1, 8),
      v_visit_id,
      'Maria Garcia',
      '67890',
      '07/18/1978',
      'Female',
      provider,
      payer,
      '54321',
      member_id,
      group_number,
      visit_date,
      visit_time,
      visit_reason,
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
    FROM visits
    WHERE id = v_visit_id
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Created eligibility for Maria Garcia (visit_id: %)', v_visit_id;
  END IF;
END $$;

-- ============================================================================
-- STEP 3: Verify the linkages
-- ============================================================================

-- Show all visits with their linked auth/eligibility counts
SELECT 
  v.id as visit_id,
  v.patient_name,
  v.visit_date,
  v.visit_time,
  v.pre_visit_step,
  v.pre_visit_risk,
  (SELECT COUNT(*) FROM authorizations WHERE visit_id = v.id::text) as auth_count,
  (SELECT COUNT(*) FROM eligibilities WHERE visit_id = v.id::text) as elig_count
FROM visits v
WHERE v.patient_name IN ('K. Williams', 'John Smith', 'Maria Garcia')
ORDER BY v.visit_date, v.visit_time;
