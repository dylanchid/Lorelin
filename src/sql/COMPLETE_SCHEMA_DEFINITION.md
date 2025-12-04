# Complete Lorelin Database Schema Definition

## Schema Design Principles

1. **No forward references** - Tables must be created before they're referenced
2. **Explicit column definitions** - Every column defined before use
3. **Clear dependencies** - Foreign keys only after both tables exist

## Dependency Graph

```
LAYER 0 (No Dependencies):
- visits
- authorizations  
- eligibilities
- work_items
- disputes
- patients
- providers
- payers

LAYER 1 (Depends on Layer 0):
- charges (depends on: visits)
- claims (depends on: visits, patients, payers)

LAYER 2 (Depends on Layer 1):
- payments (depends on: claims)
```

## Table Definitions

### visits
**Dependencies:** None  
**Columns:**
- id UUID PRIMARY KEY DEFAULT gen_random_uuid()
- patient_name TEXT NOT NULL
- patient_age INTEGER
- visit_date DATE NOT NULL
- visit_time TEXT NOT NULL
- provider TEXT NOT NULL
- payer TEXT NOT NULL
- visit_reason TEXT NOT NULL
- status TEXT NOT NULL CHECK (status IN ('to-record', 'transcribing', 'to-review', 'approved', 'sent', 'paid'))
- charge_estimate INTEGER NOT NULL
- member_id TEXT
- group_number TEXT
- pre_visit_step TEXT
- pre_visit_risk TEXT CHECK (pre_visit_risk IN ('ready', 'at-risk', 'blocked'))
- created_at TIMESTAMPTZ DEFAULT NOW()
- updated_at TIMESTAMPTZ DEFAULT NOW()

### authorizations
**Dependencies:** None  
**Columns:**
- id TEXT PRIMARY KEY
- visit_id TEXT
- patient_name TEXT NOT NULL
- patient_id TEXT
- patient_dob TEXT
- provider TEXT
- payer TEXT NOT NULL
- plan_id TEXT
- visit_date TEXT
- visit_time TEXT
- visit_reason TEXT
- procedure_type TEXT
- location TEXT
- status TEXT NOT NULL DEFAULT 'needed'
- clinical_justification TEXT
- cpt_codes JSONB DEFAULT '[]'::jsonb
- icd10_codes JSONB DEFAULT '[]'::jsonb
- notes TEXT
- submitted_date TIMESTAMPTZ
- submitted_by TEXT
- submission_method TEXT
- pa_id TEXT
- valid_from TEXT
- valid_to TEXT
- approved_date TIMESTAMPTZ
- approved_by TEXT
- denied_date TIMESTAMPTZ
- denied_reason TEXT
- created_at TIMESTAMPTZ DEFAULT NOW()
- updated_at TIMESTAMPTZ DEFAULT NOW()

### eligibilities
**Dependencies:** None  
**Columns:**
- id TEXT PRIMARY KEY
- visit_id TEXT
- patient_name TEXT NOT NULL
- patient_id TEXT
- patient_dob TEXT
- patient_sex TEXT
- provider TEXT
- payer TEXT NOT NULL
- plan_id TEXT
- member_id TEXT
- group_number TEXT
- visit_date TEXT
- visit_time TEXT
- visit_reason TEXT
- service_type TEXT
- location TEXT
- benefit_type TEXT DEFAULT 'Medical benefits'
- status TEXT NOT NULL DEFAULT 'pending'
- lorelin_available BOOLEAN DEFAULT true
- current_result JSONB
- history JSONB DEFAULT '[]'::jsonb
- notes TEXT
- created_at TIMESTAMPTZ DEFAULT NOW()
- updated_at TIMESTAMPTZ DEFAULT NOW()

### work_items
**Dependencies:** None (visit_id is TEXT, not FK)  
**Columns:**
- id SERIAL PRIMARY KEY
- type TEXT NOT NULL
- step TEXT NOT NULL
- patient_name TEXT NOT NULL
- description TEXT NOT NULL
- provider TEXT
- payer TEXT
- value NUMERIC
- value_label TEXT
- deadline TEXT
- deadline_label TEXT
- urgency TEXT
- visit_id TEXT
- dispute_id TEXT
- completed BOOLEAN DEFAULT false
- assigned_to TEXT
- created_at TIMESTAMPTZ DEFAULT NOW()
- updated_at TIMESTAMPTZ DEFAULT NOW()

### disputes
**Dependencies:** None (claim_id is TEXT, not FK)  
**Columns:**
- id SERIAL PRIMARY KEY
- patient_name TEXT NOT NULL
- claim_id TEXT NOT NULL
- procedure_name TEXT NOT NULL
- procedure_code TEXT
- **payer_name** TEXT NOT NULL  ⚠️ NOTE: Backend uses payer_name, not payer
- plan_type TEXT
- billed NUMERIC NOT NULL
- paid NUMERIC NOT NULL
- potential NUMERIC
- contract_expected NUMERIC
- contract_gap NUMERIC
- type TEXT NOT NULL
- path TEXT
- issue TEXT
- status TEXT NOT NULL
- next_action TEXT
- deadline_date TEXT
- deadline_label TEXT
- path_tooltip TEXT
- is_urgent BOOLEAN DEFAULT false
- assigned_to TEXT
- notes TEXT
- created_at TIMESTAMPTZ DEFAULT NOW()
- updated_at TIMESTAMPTZ DEFAULT NOW()

### patients
**Dependencies:** None  
**Columns:**
- id UUID PRIMARY KEY DEFAULT gen_random_uuid()
- first_name TEXT NOT NULL
- last_name TEXT NOT NULL
- full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED
- date_of_birth DATE
- email TEXT
- phone TEXT
- member_id TEXT
- created_at TIMESTAMPTZ DEFAULT NOW()
- updated_at TIMESTAMPTZ DEFAULT NOW()

### providers
**Dependencies:** None  
**Columns:**
- id UUID PRIMARY KEY DEFAULT gen_random_uuid()
- name TEXT NOT NULL
- npi TEXT
- specialty TEXT
- created_at TIMESTAMPTZ DEFAULT NOW()
- updated_at TIMESTAMPTZ DEFAULT NOW()

### payers
**Dependencies:** None  
**Columns:**
- id UUID PRIMARY KEY DEFAULT gen_random_uuid()
- name TEXT NOT NULL
- short_name TEXT
- type TEXT
- is_in_network BOOLEAN DEFAULT true
- requires_auth BOOLEAN DEFAULT false
- auth_procedures TEXT[]
- auth_turnaround_days INTEGER DEFAULT 5
- typical_denial_rate NUMERIC(5,2)
- created_at TIMESTAMPTZ DEFAULT NOW()
- updated_at TIMESTAMPTZ DEFAULT NOW()

### charges
**Dependencies:** visits  
**Columns:**
- id UUID PRIMARY KEY DEFAULT gen_random_uuid()
- visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE
- cpt_code TEXT NOT NULL
- description TEXT
- modifier TEXT
- quantity INTEGER DEFAULT 1
- unit_price NUMERIC(10,2) NOT NULL
- allowed_amount NUMERIC(10,2)
- paid_amount NUMERIC(10,2) DEFAULT 0
- is_denied BOOLEAN DEFAULT false
- denial_code TEXT
- denial_reason TEXT
- created_at TIMESTAMPTZ DEFAULT NOW()
- updated_at TIMESTAMPTZ DEFAULT NOW()

### claims
**Dependencies:** visits, patients, payers  
**Columns:**
- id UUID PRIMARY KEY DEFAULT gen_random_uuid()
- visit_id UUID NOT NULL REFERENCES visits(id)
- patient_id UUID REFERENCES patients(id)
- payer_id UUID REFERENCES payers(id)
- claim_number TEXT
- status TEXT DEFAULT 'draft'
- total_billed NUMERIC(10,2) NOT NULL DEFAULT 0
- total_allowed NUMERIC(10,2) DEFAULT 0
- total_paid NUMERIC(10,2) DEFAULT 0
- insurance_paid NUMERIC(10,2) DEFAULT 0
- patient_paid NUMERIC(10,2) DEFAULT 0
- adjustments NUMERIC(10,2) DEFAULT 0
- patient_responsibility NUMERIC(10,2) DEFAULT 0
- denial_reason TEXT
- denial_code TEXT
- denial_category TEXT
- submitted_date DATE
- accepted_date DATE
- paid_date DATE
- denial_date DATE
- notes TEXT
- created_at TIMESTAMPTZ DEFAULT NOW()
- updated_at TIMESTAMPTZ DEFAULT NOW()

### payments
**Dependencies:** claims  
**Columns:**
- id UUID PRIMARY KEY DEFAULT gen_random_uuid()
- claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE
- source_type TEXT NOT NULL
- amount NUMERIC(10,2) NOT NULL
- payment_date DATE DEFAULT CURRENT_DATE
- method TEXT
- reference TEXT
- notes TEXT
- created_at TIMESTAMPTZ DEFAULT NOW()

## Migration Strategy

### Phase 1: Base Tables (Script 00)
Create all Layer 0 tables with NO foreign key relationships between them

### Phase 2: Financial Tables (Script 01)
Create Layer 1 and Layer 2 tables with foreign keys to Layer 0

### Phase 3: Add Foreign Keys (Script 02)
Add nullable UUID foreign key columns to existing tables

### Phase 4: Migrate Data (Script 03)
Populate the new normalized tables and update foreign keys
