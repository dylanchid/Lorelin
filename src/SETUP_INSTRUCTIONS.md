# Lorelin Auth & Eligibility Database Setup

## Step 1: Create Tables in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `/SUPABASE_SCHEMA.sql`
4. Click **Run** to execute the SQL

This will create:
- `authorizations` table with sample data
- `eligibilities` table with sample data
- Indexes for performance
- Row Level Security (RLS) policies

## Step 2: Reload Schema Cache

After creating the tables:

1. Go to **Settings → API** in your Supabase Dashboard
2. Click **Reload schema cache**
3. Wait 10-15 seconds for the cache to refresh

## Step 3: Verify Backend

The backend endpoints are now live at:

### Authorization Endpoints:
- `GET /authorizations` - Get all auth requests
- `GET /authorizations/:id` - Get single auth request
- `GET /authorizations/by-visit/:visitId` - Get auth requests for a visit
- `POST /authorizations` - Create new auth request
- `PUT /authorizations/:id` - Update auth request
- `DELETE /authorizations/:id` - Delete auth request

### Eligibility Endpoints:
- `GET /eligibilities` - Get all eligibility checks
- `GET /eligibilities/:id` - Get single eligibility check
- `GET /eligibilities/by-visit/:visitId` - Get eligibility checks for a visit
- `POST /eligibilities` - Create new eligibility check
- `PUT /eligibilities/:id` - Update eligibility check
- `DELETE /eligibilities/:id` - Delete eligibility check
- `POST /eligibilities/:id/check` - Run eligibility check (simulated)
- `POST /eligibilities/:id/manual` - Record manual verification

## Step 4: Test the Backend

You can test by visiting these URLs in your browser (replace with your project ID):

```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-e8ce19db/authorizations
https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-e8ce19db/eligibilities
```

You should see JSON responses with the sample data.

## Database Schema Overview

### Authorizations Table
Stores prior authorization requests with:
- Patient & visit information
- Auth status (needed, draft-ready, submitting, submitted, approved, denied)
- Clinical justification & codes (CPT, ICD-10)
- Submission tracking
- Approval/denial details

### Eligibilities Table
Stores eligibility verification checks with:
- Patient & insurance information
- Eligibility status (pending, verified, failed)
- Lorelin availability flag
- Current result (coverage details)
- History of checks (JSONB array)

## Next Steps

The backend is now ready! You can wire up your frontend components to use these endpoints by:

1. Using the existing API utilities
2. Calling the endpoints from your React components
3. Managing loading/error states
4. Displaying the data in your UI

All sample data is already loaded and ready to use!
