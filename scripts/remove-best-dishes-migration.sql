-- Remove Best Dishes Field Migration
-- Removes the "Best Dishes" question from chef_questions table
-- 
-- Instructions:
-- 1. Open Supabase Dashboard > SQL Editor
-- 2. Copy and paste this entire file
-- 3. Click "Run" to execute the migration
--
-- This migration is safe and backward-compatible:
-- - Removes only the "Best Dishes" question from chef_questions
-- - Does not affect existing application data in chef_applications
-- - Does not affect existing chef profiles or cuisines
-- - Applications will continue to work, just without the Best Dishes field

-- Step 1: Remove the "Best Dishes" question from chef_questions table
DELETE FROM chef_questions 
WHERE text = 'Best Dishes';

-- Step 2: Verify the deletion (optional - for confirmation)
-- This query should return 0 rows after the migration
-- SELECT * FROM chef_questions WHERE text = 'Best Dishes';

-- Migration complete!
-- The "Best Dishes" field will no longer appear on new application forms
-- Existing application data remains intact but the field will be ignored
