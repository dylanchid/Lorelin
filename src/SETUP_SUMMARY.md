# Lorelin Database Setup - Complete Summary

## What You Need to Do (3 SQL Scripts)

### 1️⃣ Create Auth & Eligibility Tables
**File:** `/SUPABASE_AUTH_ELIGIBILITY_SCHEMA.sql`
**What it does:** Creates the 2 new tables needed for auth/eligibility workflows

### 2️⃣ Link Pre-Visit Data
**File:** `/PREVISIT_DATA_LINKING.sql`
**What it does:** Creates sample visits and links them to auth/eligibility records

### 3️⃣ Reload Schema Cache
After running both SQL scripts, go to Supabase Settings → API → Click "Reload schema cache"

## Your Database Tables

### Already Exist (Don't Touch)
- ✅ `visits` - Visit records
- ✅ `work_items` - Daily work items
- ✅ `disputes` - Payment disputes

### Need to Create (New)
- ⭐ `authorizations` - Prior auth requests
- ⭐ `eligibilities` - Eligibility checks

## Quick Setup (10 minutes)

1. **Supabase Dashboard → SQL Editor**
2. **Copy/paste `/SUPABASE_AUTH_ELIGIBILITY_SCHEMA.sql`** → Run
3. **Copy/paste `/PREVISIT_DATA_LINKING.sql`** → Run
4. **Settings → API → Reload schema cache**
5. **Done!**

## What Works After Setup

### Backend (Already Complete)
- ✅ All auth/eligibility endpoints working
- ✅ Disputes and work items endpoints restored
- ✅ API utilities updated with new functions

### Frontend (Needs Work)
- ✅ TodayScreen - Will load work items (no more 404)
- ✅ DisputesScreen - Will load disputes
- ⏳ PreVisitScreen - Shows visits but needs to pass visit ID to detail pages
- ⏳ AuthWorkspaceScreen - Needs to fetch real auth data by visit ID
- ⏳ EligibilityWorkspaceScreen - Needs to fetch real eligibility data by visit ID

## Expected Results

After running both SQL scripts, you'll have:

1. **K. Williams** - Visit with auth (draft-ready) + eligibility (pending)
2. **John Smith** - Visit with auth (approved)
3. **Maria Garcia** - Visit with eligibility (verified)
4. **Sarah Thompson** - Visit with eligibility (pending, ready to check)

## Troubleshooting

### 404 Errors on Work Items?
- Make sure you ran `/SUPABASE_AUTH_ELIGIBILITY_SCHEMA.sql` (it includes work_items table)
- Reload schema cache
- The backend will auto-initialize sample data on first request

### Pre-Visit Items Don't Match Detail Pages?
- This is expected - you need to run `/PREVISIT_DATA_LINKING.sql`
- Then update frontend to fetch by visit ID (see `/PREVISIT_LINKING_GUIDE.md`)

### Existing Data Lost?
- Won't happen - all SQL uses `ON CONFLICT` or `IF NOT EXISTS`
- Your existing visits, work_items, disputes are safe
