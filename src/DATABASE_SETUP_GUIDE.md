# Database Setup Guide for Lorelin

## Current Database Status

Your Lorelin app currently has these tables **already working**:
- ✅ `visits` - Contains visit data, used by VisitsScreen and PreVisitScreen
- ✅ `work_items` - Contains work items, used by TodayScreen  
- ✅ `disputes` - Contains dispute data, used by DisputesScreen

## What Needs to Be Added

For the new Auth & Eligibility workflows, you need to add **2 new tables**:
- ⭐ `authorizations` - NEW - For prior authorization requests
- ⭐ `eligibilities` - NEW - For eligibility verification checks

## Setup Instructions

### Option 1: Add Only What's New (Recommended)

Run the **cleaner** schema that only creates the 2 new tables:

1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `/SUPABASE_AUTH_ELIGIBILITY_SCHEMA.sql`
3. Click "Run"
4. Go to Settings → API → Click "Reload schema cache"

**This will:**
- ✅ Create `authorizations` table with sample data
- ✅ Create `eligibilities` table with sample data
- ✅ Leave your existing `visits`, `work_items`, and `disputes` tables completely untouched

### Option 2: Run Full Schema (Safe but Redundant)

If you want to run the full schema (`/SUPABASE_SCHEMA.sql`):

**This will:**
- ✅ Create `authorizations` and `eligibilities` (new)
- ⚠️ Try to create `work_items` and `disputes` - but since they already exist, it will skip them (due to `IF NOT EXISTS`)
- ✅ Your data in existing tables will NOT be affected
- ✅ `visits` table is not mentioned, so it stays untouched

## Summary

**Your existing tables:**
- `visits` - Stays as is, not touched by any schema file
- `work_items` - Already exists, won't be recreated
- `disputes` - Already exists, won't be recreated

**What you're adding:**
- `authorizations` - New table for auth workflow
- `eligibilities` - New table for eligibility workflow

**Recommendation:** Use `/SUPABASE_AUTH_ELIGIBILITY_SCHEMA.sql` for a clean setup that only adds what's needed.
