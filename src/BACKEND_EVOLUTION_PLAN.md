# Lorelin Backend Evolution Plan

## Current State vs. Proposal Analysis

### What You Have (Back-Office Billing Focus)
- ✅ **visits** - Denormalized (patient_name, provider as text)
- ✅ **work_items** - Daily to-do list for billing staff
- ✅ **disputes** - Payment disputes (OON/NSA/IDR vs In-network)
- ✅ **authorizations** - Prior auth workflow
- ✅ **eligibilities** - Insurance verification
- ✅ Screens: Home, Pre-Visit, Visits, Disputes, Auth/Eligibility workspaces
- 🎯 **Core value:** Help billing staff manage denials, disputes, and pre-visit requirements

### What the Proposal Suggests (Clinical Workflow Focus)
- Normalized patients/providers tables
- Visit state machine (scheduled → checked_in → in_progress → completed)
- Previsit intakes (questionnaires, consents)
- Charges (line items from visit)
- Claims (billing submissions)
- Payments (insurance + patient)
- 🎯 **Core value:** Full patient journey from scheduling → clinical encounter → payment

## Recommended Hybrid Approach

Keep your **billing-focused core** but add **structured financial data** to power better workflows.

### Phase 1: Add Core Financial Tables (Do This)

These directly support your billing staff's work:

#### 1. **patients** (Normalize patient data)
```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  email TEXT,
  phone TEXT,
  member_id TEXT, -- Insurance member ID
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Why:** Right now you have `patient_name` as text in multiple tables. Normalizing lets you:
- Track patient history across visits, auths, eligibilities, disputes
- Avoid duplicate patient records
- Link everything for a patient view

#### 2. **providers** (Normalize provider data)
```sql
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  npi TEXT, -- National Provider Identifier
  specialty TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Why:** Same reason - track which providers have the most denials, auths needed, etc.

#### 3. **payers** (Track insurance companies)
```sql
CREATE TABLE payers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- "BCBS PPO", "UHC", "Medicare"
  type TEXT, -- "commercial", "medicare", "medicaid"
  is_in_network BOOLEAN DEFAULT true,
  auth_required_for TEXT[], -- Array of procedure types requiring auth
  typical_turnaround_days INTEGER, -- For auth approvals
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Why:** Critical for your dispute/denial workflows:
- Know which payers are in-network vs OON (your key distinction!)
- Track which payers require auth for which procedures
- Analyze denial patterns by payer

#### 4. **charges** (Line items for billing)
```sql
CREATE TABLE charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  cpt_code TEXT NOT NULL, -- Procedure code
  description TEXT,
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  allowed_amount NUMERIC(10,2), -- What insurance allows
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Why:** Your app shows `charge_estimate` but doesn't track actual charges. This lets you:
- See what was actually billed vs what was paid
- Calculate underpayments/denials per line item
- Power your disputes with actual charge data

#### 5. **claims** (Billing submissions)
```sql
CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES visits(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  payer_id UUID NOT NULL REFERENCES payers(id),
  claim_number TEXT, -- Insurance claim #
  status TEXT DEFAULT 'draft', -- draft, submitted, paid, denied, appealed
  total_billed NUMERIC(10,2) NOT NULL,
  total_allowed NUMERIC(10,2), -- What insurance allows
  total_paid NUMERIC(10,2) DEFAULT 0,
  patient_responsibility NUMERIC(10,2),
  denial_reason TEXT,
  denial_code TEXT, -- CARC/RARC codes
  submitted_date DATE,
  paid_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Why:** This is THE core of your billing workflow:
- Track claim status (paid vs denied)
- Store denial reasons (feeds disputes)
- Calculate what's still owed

#### 6. **payments** (Track all payment activity)
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL, -- 'insurance' or 'patient'
  amount NUMERIC(10,2) NOT NULL,
  payment_date DATE DEFAULT CURRENT_DATE,
  method TEXT, -- 'ERA', 'check', 'card', 'adjustment'
  reference TEXT, -- Check #, transaction ID
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Why:** See full payment history:
- Partial payments → trigger follow-up
- Zero payments → potential dispute
- Track insurance vs patient portions

### Phase 2: Update Existing Tables (Normalize References)

#### Update **visits** table
```sql
-- Add foreign keys (keep existing text fields for now for backwards compatibility)
ALTER TABLE visits
ADD COLUMN patient_id UUID REFERENCES patients(id),
ADD COLUMN provider_id UUID REFERENCES providers(id),
ADD COLUMN payer_id UUID REFERENCES payers(id);

-- Later, you can migrate data:
-- 1. Create patients from unique patient_name values
-- 2. Update visits.patient_id to reference patients
-- 3. Eventually drop patient_name column
```

#### Update **authorizations** table
```sql
ALTER TABLE authorizations
ADD COLUMN patient_id UUID REFERENCES patients(id),
ADD COLUMN provider_id UUID REFERENCES providers(id),
ADD COLUMN payer_id UUID REFERENCES payers(id);
```

#### Update **eligibilities** table
```sql
ALTER TABLE eligibilities
ADD COLUMN patient_id UUID REFERENCES patients(id),
ADD COLUMN provider_id UUID REFERENCES providers(id),
ADD COLUMN payer_id UUID REFERENCES payers(id);
```

#### Update **disputes** table
```sql
ALTER TABLE disputes
ADD COLUMN claim_id UUID REFERENCES claims(id),
ADD COLUMN patient_id UUID REFERENCES patients(id),
ADD COLUMN payer_id UUID REFERENCES payers(id);
```

### Phase 3: Skip These (Not Relevant for Back-Office Billing)

**DON'T implement:**
- ❌ `previsit_intakes` - You're not collecting patient forms, you're verifying eligibility/auth
- ❌ Visit statuses like 'checked_in', 'in_progress' - You work after the visit, not during
- ❌ Patient portal (`user_id` → `auth.users`) - Your users are billing staff, not patients

**Your visit flow is simpler:**
- scheduled → (visit happens) → to-review → billed → paid/disputed

### What This Enables

#### For Your Existing Screens:

**TodayScreen (Home):**
- Show work items with linked patient/provider/payer info
- "3 denials from BCBS this week" (query claims by payer + status)
- Click patient name → see all their visits, auths, disputes

**PreVisitScreen:**
- Show upcoming visits with:
  - Patient insurance on file (from patients.member_id)
  - Whether payer requires auth for the procedure (from payers.auth_required_for)
  - Auto-create auth records when needed based on payer rules

**VisitsScreen:**
- Filter by payer, provider, claim status
- See charge details per visit
- Identify underpayments (total_billed vs total_paid)

**DisputesScreen:**
- Link disputes to specific claims
- Show denial reason + denial code
- Track dispute through appeal workflow
- See all disputes for a payer (pattern analysis)

**New Screen: ClaimsScreen**
- List all claims with status
- Filter: denied, underpaid, pending
- Drill into claim → see charges, payments, related auth/eligibility
- Create dispute directly from denied claim

## Implementation Plan

### Step 1: Create New Tables (1 script)
```
/LORELIN_FINANCIAL_SCHEMA.sql
```
Creates: patients, providers, payers, charges, claims, payments

### Step 2: Add Foreign Keys to Existing Tables (1 script)
```
/ADD_FOREIGN_KEYS.sql
```
Adds patient_id, provider_id, payer_id to visits, authorizations, eligibilities, disputes

### Step 3: Migration Script (1 script)
```
/MIGRATE_EXISTING_DATA.sql
```
- Extract unique patients from visits.patient_name → create patients rows
- Extract unique providers from visits.provider → create providers rows
- Extract unique payers from visits.payer → create payers rows
- Update all foreign keys

### Step 4: Update API Layer
- Add endpoints for patients, providers, payers, charges, claims, payments
- Update existing endpoints to include related data (joins)

### Step 5: Update Screens
- Add patient/provider/payer selectors (dropdowns instead of text input)
- Show claim status in visits list
- Add charges/payments views
- Link disputes to claims

## Summary: What Changes

### Keep (Your Core Value Prop)
- ✅ Focus on back-office billing staff
- ✅ Disputes workflow (OON/NSA/IDR)
- ✅ Auth/eligibility workflows
- ✅ Work items for daily to-do lists
- ✅ All your existing screens

### Add (Better Data Structure)
- ✅ Normalized patients/providers/payers
- ✅ Charges (line items)
- ✅ Claims (billing submissions)
- ✅ Payments (insurance + patient)
- ✅ Foreign key relationships
- ✅ Ability to track full payment lifecycle

### Skip (Not Your Focus)
- ❌ Clinical workflows (check-in, encounter)
- ❌ Previsit intake forms (you do eligibility checks instead)
- ❌ Patient portal
- ❌ Complex state machines

## Next Steps

Would you like me to:

1. **Create the 3 SQL scripts** (financial schema, foreign keys, data migration)?
2. **Update the API layer** with new endpoints?
3. **Create a new ClaimsScreen** to show claims/charges/payments?
4. **All of the above**?

This approach keeps your billing focus while adding the structure to track the full revenue cycle: visit → charges → claim → payments → disputes.
