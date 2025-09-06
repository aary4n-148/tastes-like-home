-- Security Cleanup Migration (Fixed Version)
-- Addresses Supabase Security Advisor warnings before implementing new features
-- 
-- Instructions:
-- 1. Open Supabase Dashboard > SQL Editor
-- 2. Copy and paste this script
-- 3. Run section by section to verify each fix

-- =================================================================
-- PART 1: FIX RLS POLICIES ON CHEF_APPLICATIONS
-- =================================================================

-- The chef_applications table has RLS enabled but missing policies
-- Let's add proper policies following your existing patterns

-- Check if policies already exist before creating them
DO $$ 
BEGIN
    -- Policy 1: Allow public to create applications
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'chef_applications' 
        AND policyname = 'Anyone can submit chef applications'
    ) THEN
        CREATE POLICY "Anyone can submit chef applications" ON public.chef_applications
            FOR INSERT WITH CHECK (true);
    END IF;

    -- Policy 2: Admin can view all applications
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'chef_applications' 
        AND policyname = 'Admin can view chef applications'
    ) THEN
        CREATE POLICY "Admin can view chef applications" ON public.chef_applications
            FOR SELECT USING ((auth.jwt()->>'role') = 'admin');
    END IF;

    -- Policy 3: Admin can update applications
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'chef_applications' 
        AND policyname = 'Admin can update chef applications'
    ) THEN
        CREATE POLICY "Admin can update chef applications" ON public.chef_applications
            FOR UPDATE USING ((auth.jwt()->>'role') = 'admin');
    END IF;

    -- Policy 4: Admin can delete applications if needed
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'chef_applications' 
        AND policyname = 'Admin can delete chef applications'
    ) THEN
        CREATE POLICY "Admin can delete chef applications" ON public.chef_applications
            FOR DELETE USING ((auth.jwt()->>'role') = 'admin');
    END IF;
END $$;

-- =================================================================
-- PART 2: SECURE EXISTING FUNCTIONS (SAFE APPROACH)
-- =================================================================

-- First, let's see what functions exist and fix them safely
-- Drop and recreate functions with proper security

-- Fix refresh_chef_ratings function if it exists
DROP FUNCTION IF EXISTS public.refresh_chef_ratings();
CREATE OR REPLACE FUNCTION public.refresh_chef_ratings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Check if materialized view exists before refreshing
  IF EXISTS (
    SELECT 1 FROM pg_matviews 
    WHERE schemaname = 'public' 
    AND matviewname = 'chef_rating_stats'
  ) THEN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.chef_rating_stats;
  END IF;
END;
$$;

-- Fix update functions if they exist
DROP FUNCTION IF EXISTS public.update_chef_updated_at();
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

DROP FUNCTION IF EXISTS public.update_updated_at_column();
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

-- Create a secure function to access rating stats instead of direct view access
DROP FUNCTION IF EXISTS public.get_chef_rating_stats(UUID);
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
  WHERE crs.chef_id = chef_uuid
  AND EXISTS (
    -- Only return stats for verified chefs
    SELECT 1 FROM public.chefs c 
    WHERE c.id = chef_uuid 
    AND c.verified = true
  );
END;
$$;

-- =================================================================
-- PART 4: SPATIAL_REF_SYS SECURITY (CAREFUL WITH POSTGIS)
-- =================================================================

-- Handle spatial_ref_sys table carefully - it's a PostGIS system table
-- Only add RLS if it doesn't already have it
DO $$
BEGIN
  -- Check if RLS is already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'spatial_ref_sys' 
    AND rowsecurity = true
  ) THEN
    -- Enable RLS on spatial_ref_sys
    ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;
    
    -- Create a policy that allows read access but no modifications
    CREATE POLICY "Read-only access to spatial_ref_sys" ON public.spatial_ref_sys
      FOR SELECT USING (true);
      
    -- Restrict all other operations
    CREATE POLICY "No modifications to spatial_ref_sys" ON public.spatial_ref_sys
      FOR ALL USING (false);
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- If there's an issue with spatial_ref_sys, log it but continue
    RAISE NOTICE 'Could not modify spatial_ref_sys: %', SQLERRM;
END $$;

-- =================================================================
-- PART 5: VERIFICATION AND CLEANUP
-- =================================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.chef_rating_stats TO anon, authenticated;

-- Revoke unnecessary permissions
REVOKE ALL ON public.chef_rating_stats FROM public;
GRANT SELECT ON public.chef_rating_stats TO anon, authenticated;

-- =================================================================
-- VERIFICATION QUERIES (Run these to check your security status)
-- =================================================================

-- Uncomment and run these queries to verify the fixes:

-- 1. Check RLS status on all tables
-- SELECT 
--   schemaname, 
--   tablename, 
--   rowsecurity,
--   CASE WHEN rowsecurity THEN 'RLS Enabled' ELSE 'RLS Disabled' END as status
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename NOT LIKE 'pg_%'
-- ORDER BY tablename;

-- 2. Check policies on chef_applications
-- SELECT policyname, cmd, permissive, qual, with_check
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- AND tablename = 'chef_applications'
-- ORDER BY policyname;

-- 3. Check function security settings
-- SELECT 
--   proname as function_name,
--   prosecdef as security_definer,
--   proconfig as config_settings
-- FROM pg_proc p
-- JOIN pg_namespace n ON p.pronamespace = n.oid
-- WHERE n.nspname = 'public'
-- AND proname IN ('refresh_chef_ratings', 'update_chef_updated_at', 'update_updated_at_column', 'get_chef_rating_stats')
-- ORDER BY proname;

-- =================================================================
-- MIGRATION COMPLETE
-- =================================================================

-- Add comments for documentation
COMMENT ON FUNCTION public.refresh_chef_ratings() 
IS 'Securely refreshes chef rating statistics materialized view';

COMMENT ON FUNCTION public.get_chef_rating_stats(UUID) 
IS 'Secure function to access chef rating statistics for verified chefs only';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Security cleanup migration completed successfully!';
  RAISE NOTICE 'Please run the verification queries to confirm all security issues are resolved.';
END $$;
