-- Remove All Cuisine Data for Standardization
-- Since cuisine questions are no longer on the application form,
-- remove all existing cuisine data from chef profiles for consistency
-- 
-- Instructions:
-- 1. Open Supabase Dashboard > SQL Editor
-- 2. Copy and paste this script
-- 3. Click "Run" to execute

-- Remove ALL cuisine entries from all chefs
DELETE FROM chef_cuisines;

-- Verify cleanup - this should return 0 rows
SELECT COUNT(*) as remaining_cuisines FROM chef_cuisines;

-- Standardization complete!
-- Now all chefs have consistent data - no cuisine information
-- Future applications will only collect what's actually on the form
