-- Video Upload Feature Migration
-- Adds video support to the chef application system
-- 
-- Instructions:
-- 1. Open Supabase Dashboard > SQL Editor
-- 2. Copy and paste this entire file
-- 3. Click "Run" to execute the migration
--
-- This migration is safe and backward-compatible:
-- - Extends existing field_type enum to include 'video'
-- - Adds video question to chef_questions table
-- - No existing data is modified

-- Step 1: Add 'video' to the field_type enum
-- First check if the value already exists to avoid errors
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'video' 
        AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'chef_questions_field_type_check'
        )
    ) THEN
        -- Add video to the existing check constraint
        ALTER TABLE chef_questions 
        DROP CONSTRAINT IF EXISTS chef_questions_field_type_check;
        
        ALTER TABLE chef_questions 
        ADD CONSTRAINT chef_questions_field_type_check 
        CHECK (field_type IN ('text', 'textarea', 'email', 'phone', 'number', 'photo', 'video'));
    END IF;
END $$;

-- Step 2: Add the video question to chef_questions table
-- Check if it already exists to avoid duplicates
INSERT INTO chef_questions (text, hint_text, field_type, is_required, is_visible, display_order) 
SELECT 
    'Introduction Video',
    'Optional 60-second video introducing yourself and your cooking style (MP4/WebM, max 50MB)',
    'video',
    false,
    true,
    9
WHERE NOT EXISTS (
    SELECT 1 FROM chef_questions 
    WHERE text = 'Introduction Video' AND field_type = 'video'
);

-- Step 3: Create helpful comment for future reference
COMMENT ON CONSTRAINT chef_questions_field_type_check ON chef_questions 
IS 'Updated to support video field type for chef introduction videos';

-- Step 4: Verify the migration worked
-- This will show all questions including the new video one
SELECT id, text, field_type, is_required, display_order 
FROM chef_questions 
ORDER BY display_order;
