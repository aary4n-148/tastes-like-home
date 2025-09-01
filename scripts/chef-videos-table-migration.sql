-- Chef Videos Table Migration
-- Creates a table to store chef introduction videos similar to food_photos
-- 
-- Instructions:
-- 1. Open Supabase Dashboard > SQL Editor
-- 2. Copy and paste this entire file
-- 3. Click "Run" to execute the migration
--
-- This migration creates the infrastructure for storing chef videos
-- and is safe to run multiple times (uses IF NOT EXISTS checks)

-- Step 1: Create chef_videos table (similar to food_photos)
CREATE TABLE IF NOT EXISTS chef_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chef_id UUID REFERENCES chefs(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  video_type VARCHAR(50) DEFAULT 'introduction', -- future: 'cooking_demo', 'testimonial', etc.
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create helpful indexes
CREATE INDEX IF NOT EXISTS idx_chef_videos_chef_id ON chef_videos(chef_id);
CREATE INDEX IF NOT EXISTS idx_chef_videos_chef_order ON chef_videos(chef_id, display_order);

-- Step 3: Enable RLS on chef_videos table
ALTER TABLE chef_videos ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies (similar to food_photos)
-- Public can view videos for verified chefs
CREATE POLICY IF NOT EXISTS "Anyone can view videos for verified chefs" ON chef_videos 
FOR SELECT USING (
  chef_id IN (
    SELECT id FROM chefs WHERE verified = true
  )
);

-- Service role has full access
CREATE POLICY IF NOT EXISTS "service_role_all_chef_videos" ON chef_videos 
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Step 5: Add helpful comment
COMMENT ON TABLE chef_videos IS 'Stores chef introduction videos and future video types (cooking demos, testimonials, etc.)';

-- Step 6: Verify the table was created
SELECT 'chef_videos table created successfully' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'chef_videos' 
ORDER BY ordinal_position;
