# Supabase Setup Instructions for Lorelin

## Quick Start - Run This SQL First

**IMPORTANT:** Run this complete SQL block in your Supabase SQL Editor to set everything up at once:

```sql
-- Step 1: Create the visits table
CREATE TABLE IF NOT EXISTS visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  patient_age INTEGER,
  visit_date DATE NOT NULL,
  visit_time TEXT NOT NULL,
  provider TEXT NOT NULL,
  payer TEXT NOT NULL,
  visit_reason TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('to-record', 'transcribing', 'to-review', 'approved', 'sent')),
  charge_estimate INTEGER NOT NULL,
  member_id TEXT,
  group_number TEXT,
  pre_visit_step TEXT,
  pre_visit_risk TEXT CHECK (pre_visit_risk IN ('ready', 'at-risk', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_visits_date ON visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_visits_status ON visits(status);
CREATE INDEX IF NOT EXISTS idx_visits_pre_visit_risk ON visits(pre_visit_risk);

-- Step 3: Enable RLS
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop any existing policies (to avoid conflicts)
DROP POLICY IF EXISTS "Allow all operations on visits" ON visits;
DROP POLICY IF EXISTS "Enable read access for all users" ON visits;
DROP POLICY IF EXISTS "Enable insert for all users" ON visits;
DROP POLICY IF EXISTS "Enable update for all users" ON visits;
DROP POLICY IF EXISTS "Enable delete for all users" ON visits;

-- Step 5: Create permissive policy
CREATE POLICY "Allow all operations on visits" ON visits
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Step 6: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_visits_updated_at
  BEFORE UPDATE ON visits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Create exec_sql function for raw SQL queries (bypasses PostgREST cache)
CREATE OR REPLACE FUNCTION exec_sql(query TEXT)
RETURNS SETOF JSON AS $$
BEGIN
  RETURN QUERY EXECUTE 'SELECT row_to_json(t) FROM (' || query || ') t';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
```

After running this SQL:
1. Wait 10-15 seconds for the schema cache to reload
2. Refresh the Lorelin app
3. The app will automatically populate sample data on first load

## Database Setup

### 1. Create the Visits Table

**IMPORTANT:** If you already have a `visits` table, skip to step 2 below to fix the RLS policy.

Run this SQL in your Supabase SQL Editor:

```sql
-- Create visits table
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  patient_age INTEGER,
  visit_date DATE NOT NULL,
  visit_time TEXT NOT NULL,
  provider TEXT NOT NULL,
  payer TEXT NOT NULL,
  visit_reason TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('to-record', 'transcribing', 'to-review', 'approved', 'sent')),
  charge_estimate INTEGER NOT NULL,
  member_id TEXT,
  group_number TEXT,
  pre_visit_step TEXT,
  pre_visit_risk TEXT CHECK (pre_visit_risk IN ('ready', 'at-risk', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for common queries
CREATE INDEX idx_visits_date ON visits(visit_date);
CREATE INDEX idx_visits_status ON visits(status);
CREATE INDEX idx_visits_pre_visit_risk ON visits(pre_visit_risk);

-- Enable Row Level Security (RLS)
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust for production)
CREATE POLICY "Allow all operations on visits" ON visits
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_visits_updated_at
  BEFORE UPDATE ON visits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2. Initialize Sample Data

After creating the table, the app will automatically initialize sample data on first load.

Alternatively, you can call the initialization endpoint manually:

```bash
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-e8ce19db/init-visits \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## API Endpoints

The backend provides the following endpoints:

### GET /visits
Get all visits ordered by date and time.

**Response:**
```json
{
  "visits": [
    {
      "id": "uuid",
      "patient_name": "Jane Doe",
      "patient_age": 68,
      "visit_date": "2025-03-02",
      "visit_time": "10:00 AM",
      "provider": "Dr. Lee",
      "payer": "Medicare",
      "visit_reason": "Annual exam",
      "status": "to-record",
      "charge_estimate": 285,
      "member_id": "MED123456",
      "group_number": "GRP001",
      "pre_visit_step": "ready",
      "pre_visit_risk": "ready",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
}
```

### GET /visits/today
Get visits for today only.

### GET /visits/pre-visit?days=7
Get visits for upcoming days (default 7 days ahead).

### PUT /visits/:id
Update a visit by ID.

**Request body:**
```json
{
  "status": "approved",
  "pre_visit_step": "auth-approved"
}
```

### POST /init-visits
Initialize the visits table with sample data (only works if table is empty).

## Database Schema

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| patient_name | TEXT | Patient's name |
| patient_age | INTEGER | Patient's age |
| visit_date | DATE | Date of visit |
| visit_time | TEXT | Time of visit (e.g., "10:00 AM") |
| provider | TEXT | Provider name (e.g., "Dr. Lee") |
| payer | TEXT | Insurance payer name |
| visit_reason | TEXT | Reason for visit |
| status | TEXT | Visit status: to-record, transcribing, to-review, approved, sent |
| charge_estimate | INTEGER | Estimated charge in dollars |
| member_id | TEXT | Insurance member ID |
| group_number | TEXT | Insurance group number |
| pre_visit_step | TEXT | Pre-visit workflow step |
| pre_visit_risk | TEXT | Pre-visit risk level: ready, at-risk, blocked |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Record last update time |

## Frontend Integration

The frontend uses the `/utils/api.ts` utility to communicate with the backend:

```typescript
import { getVisits, initVisits, updateVisit } from '../utils/api';

// Get all visits
const { visits } = await getVisits();

// Get visits for next 7 days
const { visits } = await getPreVisitItems(7);

// Update a visit
await updateVisit(visitId, { status: 'approved' });
```

## Screens Using Backend Data

1. **Visits Screen** (`/components/VisitsScreen.tsx`)
   - Fetches all visits
   - Displays visits in different status tabs
   - Shows pipeline statistics

2. **Pre-Visit V2 Screen** (`/components/PreVisitV2Screen.tsx`)
   - Fetches upcoming visits based on date filter
   - Shows pre-visit workflow status
   - Displays risk levels

3. **Today/Home Screen** (future integration)
   - Will show work items for today

## Environment Variables

The backend uses these Supabase environment variables (automatically configured):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The frontend uses (from `/utils/supabase/info.tsx`):
- `projectId`
- `publicAnonKey`

## Troubleshooting

### Error: "relation 'visits' already exists"

If you get this error, your table already exists. The issue is likely with Row Level Security (RLS) policies. Run this SQL to fix it:

```sql
-- Enable RLS if not already enabled
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow all operations on visits" ON visits;
DROP POLICY IF EXISTS "Enable read access for all users" ON visits;
DROP POLICY IF EXISTS "Enable insert for all users" ON visits;
DROP POLICY IF EXISTS "Enable update for all users" ON visits;
DROP POLICY IF EXISTS "Enable delete for all users" ON visits;

-- Create a permissive policy for all operations
CREATE POLICY "Allow all operations on visits" ON visits
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

### Error: "Could not find the table 'public.visits' in the schema cache"

This means the table exists but Supabase's PostgREST API needs to refresh its cache. You have two options:

**Option 1: Reload Schema Cache (Recommended)**
1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Scroll down and click **"Reload schema cache"** button
4. Wait a few seconds and refresh the Lorelin app

**Option 2: Run SQL Command**
Run this in your Supabase SQL Editor:

```sql
NOTIFY pgrst, 'reload schema';
```

Then refresh the Lorelin app.

**If the error persists after trying both options:**

The issue might be that the table was created in a different schema or there's a permission problem. Run this diagnostic SQL:

```sql
-- Check if the table exists and in which schema
SELECT schemaname, tablename, tableowner, rowsecurity
FROM pg_tables 
WHERE tablename = 'visits';

-- Check RLS policies
SELECT schemaname, tablename, policyname
FROM pg_policies 
WHERE tablename = 'visits';

-- Check if PostgREST can see the table
SELECT * FROM information_schema.tables 
WHERE table_name = 'visits';
```

If the table is in the `public` schema but still not working:

1. **Drop and recreate the table** - Run the full SQL from step 1 above
2. **Verify RLS policy** - Make sure the permissive policy exists
3. **Restart PostgREST** - Go to Settings → API → Click "Reload schema cache"
4. **Check service role key** - Ensure your service role key is correct

### Error: "Could not find the table 'public.visits'"

This means RLS is blocking access. Follow the steps in the error above to fix the RLS policy.

### Verify Database Setup

Visit this URL to check if the backend can access the database:

```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-e8ce19db/diagnose
```

This will return diagnostic information about the visits table.

### No Data Showing

If the table exists but has no data, click the "Retry" button in the app and it will automatically populate sample data.

### Pre-Visit Screen is Empty

If the Visits screen shows data but the Pre-Visit screen is empty, the issue is that your visit dates are in the past. The Pre-Visit screen only shows upcoming visits (today + next 7 days).

**Fix:** Delete the old data and let the app re-initialize with current dates:

```sql
DELETE FROM visits;
```

Then refresh the Lorelin app. It will automatically detect the empty table and populate it with visits dated for today and the next few days.