-- Security Cleanup Migration
-- Addresses Supabase Security Advisor warnings before implementing new features
-- 
-- Instructions:
-- 1. Open Supabase Dashboard > SQL Editor
-- 2. Copy and paste this script
-- 3. Run section by section to verify each fix
--
-- This migration addresses:
-- - RLS policies on chef_applications
-- - Function security with search_path
-- - Materialized view access controls

-- =================================================================
-- PART 1: FIX RLS POLICIES ON CHEF_APPLICATIONS
-- =================================================================

-- The chef_applications table has RLS enabled but missing policies
-- Let's add proper policies following your existing patterns

-- Policy 1: Allow public to create applications (like your current flow)
CREATE POLICY "Anyone can submit chef applications" ON public.chef_applications
  FOR INSERT WITH CHECK (true);

-- Policy 2: Admin can view all applications
CREATE POLICY "Admin can view chef applications" ON public.chef_applications
  FOR SELECT USING ((auth.jwt()->>'role') = 'admin');

-- Policy 3: Admin can update applications (for approval/rejection)
CREATE POLICY "Admin can update chef applications" ON public.chef_applications
  FOR UPDATE USING ((auth.jwt()->>'role') = 'admin');

-- Policy 4: Admin can delete applications if needed
CREATE POLICY "Admin can delete chef applications" ON public.chef_applications
  FOR DELETE USING ((auth.jwt()->>'role') = 'admin');

-- =================================================================
-- PART 2: SECURE DATABASE FUNCTIONS
-- =================================================================

-- Fix search_path issues for existing functions
-- This prevents function hijacking attacks

-- Update chef rating refresh function (if it exists)
CREATE OR REPLACE FUNCTION public.refresh_chef_ratings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.chef_rating_stats;
END;
$$;

-- Update chef updated_at trigger function (if it exists)
CREATE OR REPLACE FUNCTION public.update_chef_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Update general updated_at function (if it exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- =================================================================
-- PART 3: SECURE MATERIALIZED VIEW ACCESS
-- =================================================================

-- The chef_rating_stats materialized view should not be directly accessible via API
-- Let's create a security policy or remove API access

-- Option 1: Add RLS to materialized view (if supported)
-- ALTER TABLE public.chef_rating_stats ENABLE ROW LEVEL SECURITY;

-- Option 2: Create a secure function to access rating stats instead
CREATE OR REPLACE FUNCTION public.get_chef_rating_stats(chef_uuid UUID)
RETURNS TABLE (
  chef_id UUID,
  review_count BIGINT,
  avg_rating NUMERIC,
  latest_review_date TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    crs.chef_id,
    crs.review_count,
    crs.avg_rating,
    crs.latest_review_date
  FROM public.chef_rating_stats crs
  WHERE crs.chef_id = chef_uuid;
END;
$$;

-- =================================================================
-- PART 4: ADDITIONAL SECURITY HARDENING
-- =================================================================

-- Ensure spatial_ref_sys is not accessible via API (it's a PostGIS system table)
-- This is usually handled by PostGIS, but let's be explicit
ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Create a restrictive policy for spatial_ref_sys
CREATE POLICY "No direct access to spatial_ref_sys" ON public.spatial_ref_sys
  FOR ALL USING (false);

-- =================================================================
-- PART 5: VERIFICATION QUERIES
-- =================================================================

-- Run these queries after migration to verify security:

-- 1. Check RLS is enabled on all user tables
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename NOT LIKE 'pg_%' 
-- ORDER BY tablename;

-- 2. Check all policies exist
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies 
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- 3. Verify function security
-- SELECT proname, prosecdef, proconfig
-- FROM pg_proc 
-- WHERE pronamespace = 'public'::regnamespace
-- AND proname LIKE '%chef%' OR proname LIKE '%update%';

-- =================================================================
-- MIGRATION COMPLETE
-- =================================================================

COMMENT ON POLICY "Anyone can submit chef applications" ON public.chef_applications 
IS 'Allows public application submissions while maintaining security';

COMMENT ON FUNCTION public.get_chef_rating_stats(UUID) 
IS 'Secure function to access chef rating statistics without direct materialized view access';
