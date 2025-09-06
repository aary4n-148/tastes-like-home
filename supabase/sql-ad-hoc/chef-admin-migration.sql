-- Chef Admin Editor Database Migration
-- Adds status management and audit logging capabilities
-- 
-- Instructions:
-- 1. Open Supabase Dashboard > SQL Editor
-- 2. Copy and paste this entire file
-- 3. Click "Run" to execute the migration
--
-- This migration is safe and backward-compatible:
-- - Keeps existing 'verified' column working
-- - Adds new 'status' column for better control
-- - Creates audit trail for admin accountability

-- Step 1: Add chef_status enum type
CREATE TYPE chef_status AS ENUM ('published', 'unpublished', 'deleted');

-- Step 2: Add status column to chefs table (keeping verified for compatibility)
ALTER TABLE chefs 
ADD COLUMN status chef_status DEFAULT 'published' NOT NULL;

-- Step 3: Sync existing verified status with new status column
UPDATE chefs 
SET status = CASE 
  WHEN verified = true THEN 'published'::chef_status
  ELSE 'unpublished'::chef_status
END;

-- Step 4: Add updated_by tracking to chefs table
ALTER TABLE chefs 
ADD COLUMN updated_by UUID REFERENCES auth.users(id);

-- Step 5: Create chef audit log table
CREATE TABLE chef_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chef_id UUID REFERENCES chefs(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'created', 'updated', 'published', 'unpublished', 'deleted'
  metadata JSONB DEFAULT '{}', -- flexible data: what changed, old/new values if needed
  admin_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 6: Add helpful indexes for admin queries
CREATE INDEX idx_chefs_status ON chefs(status);
CREATE INDEX idx_chef_audit_log_chef_id ON chef_audit_log(chef_id, created_at DESC);
CREATE INDEX idx_chef_audit_log_admin ON chef_audit_log(admin_user_id, created_at DESC);

-- Step 7: Enable RLS on audit log table
ALTER TABLE chef_audit_log ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policy for admin access to audit logs
CREATE POLICY "Admins can view audit logs" ON chef_audit_log
FOR SELECT USING ((auth.jwt()->>'role') = 'admin');

-- Step 9: Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_chef_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chef_updated_at_trigger
  BEFORE UPDATE ON chefs
  FOR EACH ROW
  EXECUTE FUNCTION update_chef_updated_at();

-- Migration complete!
-- 
-- What this adds to your database:
-- ✅ chef_status enum (published, unpublished, deleted)
-- ✅ status column on chefs table 
-- ✅ updated_by tracking for admin accountability
-- ✅ chef_audit_log table for tracking changes
-- ✅ Performance indexes for fast admin queries
-- ✅ Row Level Security policies
-- ✅ Auto-updating timestamps
--
-- Backward compatibility:
-- ✅ verified column still works exactly as before
-- ✅ All existing code continues to function
-- ✅ New status column synced with verified values