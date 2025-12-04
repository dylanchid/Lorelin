# Pre-Visit Data Linking Guide

## The Problem

Currently, the Pre-Visit screen shows a work list of upcoming visits, but when you click on a visit to view its details (auth/eligibility), the detail pages don't load the actual data for that specific visit. This is because:

1. ❌ The visits in the work list don't have matching records in the authorizations/eligibilities tables
2. ❌ The `visit_id` field in auth/eligibility records doesn't match actual visit IDs
3. ❌ The frontend doesn't pass the visit ID when opening detail pages

## The Solution

### Database Level: Link Records via visit_id

The authorizations and eligibilities tables already have a `visit_id` field. We need to:
1. Create visits with specific, known IDs
2. Create auth/eligibility records with matching `visit_id` values

### API Level: Fetch by Visit ID

The backend already has endpoints to fetch related records:
- ✅ `GET /authorizations/by-visit/:visitId`
- ✅ `GET /eligibilities/by-visit/:visitId`

### Frontend Level: Pass Visit ID to Detail Pages

When clicking a visit in the Pre-Visit work list, we need to:
1. Pass the `visit.id` to the detail workspace
2. Fetch auth/eligibility records for that specific visit
3. Display the actual data instead of mock data

## Setup Steps

### Step 1: Run the Linking SQL

This creates sample visits with known IDs and links them to auth/eligibility records.

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `/PREVISIT_DATA_LINKING.sql`
3. Click "Run"

**What this does:**
- Creates/updates 4 sample visits with specific IDs:
  - `visit_kwilliams_001` - Has auth (draft-ready) + eligibility (pending)
  - `visit_jsmith_001` - Has auth (approved)
  - `visit_mgarcia_001` - Has eligibility (verified)
  - `visit_sthompson_001` - Has eligibility (pending)
- Updates existing auth/eligibility records to use these visit IDs
- Creates a new eligibility record for Sarah Thompson

### Step 2: Verify the Links

Run this query in Supabase SQL Editor to see the connections:

```sql
SELECT 
  v.id as visit_id,
  v.patient_name,
  v.visit_date,
  v.pre_visit_step,
  v.pre_visit_risk,
  (SELECT COUNT(*) FROM authorizations WHERE visit_id = v.id) as auth_count,
  (SELECT COUNT(*) FROM eligibilities WHERE visit_id = v.id) as elig_count
FROM visits v
WHERE v.id IN ('visit_kwilliams_001', 'visit_jsmith_001', 'visit_mgarcia_001', 'visit_sthompson_001')
ORDER BY v.visit_date;
```

You should see:
- K. Williams: 1 auth, 1 eligibility
- John Smith: 1 auth, 0 eligibilities
- Maria Garcia: 0 auths, 1 eligibility
- Sarah Thompson: 0 auths, 1 eligibility

### Step 3: Update Frontend Components (Next Phase)

The API utilities are ready (`/utils/api.ts` now has all the functions). Next, we need to:

1. **Update PreVisitScreen** to pass visit ID when opening detail pages:
   ```typescript
   onOpenAuthWorkspace?({ visitId: item.id, status: 'needed' })
   ```

2. **Update AuthWorkspaceScreen** to:
   - Accept `visitId` prop
   - Fetch authorization via `getAuthorizationsByVisit(visitId)`
   - Display real data instead of mock data

3. **Update EligibilityWorkspaceScreen** to:
   - Accept `visitId` prop
   - Fetch eligibility via `getEligibilitiesByVisit(visitId)`
   - Display real data instead of mock data

## Data Structure

### Visit Record
```typescript
{
  id: 'visit_kwilliams_001',
  patient_name: 'K. Williams',
  visit_date: '2025-12-05',
  visit_time: '10:30 AM',
  payer: 'BCBS PPO',
  provider: 'Dr. Ganti',
  pre_visit_step: 'auth-draft-ready', // Determines what action is needed
  pre_visit_risk: 'at-risk' // Determines urgency
}
```

### Authorization Record
```typescript
{
  id: 'auth_001',
  visit_id: 'visit_kwilliams_001', // Links to visit
  status: 'draft-ready',
  clinical_justification: '...',
  cpt_codes: [...],
  icd10_codes: [...]
}
```

### Eligibility Record
```typescript
{
  id: 'elig_001',
  visit_id: 'visit_kwilliams_001', // Links to visit
  status: 'pending',
  current_result: null,
  history: [...]
}
```

## API Usage Examples

### Fetch Auth for a Visit
```typescript
import { getAuthorizationsByVisit } from '../utils/api';

const response = await getAuthorizationsByVisit('visit_kwilliams_001');
const auths = response.authorizations; // Array of auth records
```

### Fetch Eligibility for a Visit
```typescript
import { getEligibilitiesByVisit } from '../utils/api';

const response = await getEligibilitiesByVisit('visit_kwilliams_001');
const eligibilities = response.eligibilities; // Array of eligibility records
```

### Run Eligibility Check
```typescript
import { runEligibilityCheck } from '../utils/api';

const response = await runEligibilityCheck('elig_001');
const updatedEligibility = response.eligibility;
```

## Testing

After running the SQL:

1. Go to Pre-Visit screen
2. You should see visits for K. Williams, John Smith, Maria Garcia, and Sarah Thompson
3. Click on K. Williams - should see auth in "draft-ready" state
4. Click on Maria Garcia - should see eligibility "verified"
5. Click on Sarah Thompson - should see eligibility "pending" (ready to check)

## Summary

**What's done:**
- ✅ Database schema with proper foreign key fields
- ✅ Backend endpoints to fetch by visit ID
- ✅ API utility functions
- ✅ Sample data linking SQL script

**What's next:**
- ⏳ Update PreVisitScreen to pass visit ID to detail pages
- ⏳ Update AuthWorkspaceScreen to fetch and display real auth data
- ⏳ Update EligibilityWorkspaceScreen to fetch and display real eligibility data
