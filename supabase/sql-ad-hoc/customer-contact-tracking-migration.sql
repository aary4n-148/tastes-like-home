-- Customer Contact Tracking Database Migration
-- Adds customer inquiry tracking with PII/analytics separation
-- 
-- Instructions:
-- 1. Open Supabase Dashboard > SQL Editor
-- 2. Copy and paste this entire file
-- 3. Click "Run" to execute the migration
--
-- This migration follows established patterns:
-- - Uses existing UUID and timestamp patterns
-- - Follows existing hashing approach for privacy
-- - Maintains consistency with reviews and applications systems
-- - Implements proper RLS policies

-- =================================================================
-- PART 1: CORE TABLES
-- =================================================================

-- Table 1: customer_contacts (Encrypted PII Storage)
CREATE TABLE public.customer_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Contact Information (will be encrypted at application level)
  email TEXT NOT NULL,
  phone TEXT,
  name TEXT,
  
  -- Privacy & Compliance
  email_hash TEXT NOT NULL, -- SHA-256 hash for deduplication (following reviews pattern)
  marketing_opt_in BOOLEAN NOT NULL DEFAULT false,
  consent_timestamp TIMESTAMPTZ,
  consent_source TEXT CHECK (consent_source IN ('contact_form', 'newsletter_signup', 'admin_import')),
  
  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_customer_email_hash UNIQUE (email_hash)
);

-- Table 2: customer_inquiries (Analytics/Non-PII Data)
CREATE TABLE public.customer_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chef_id UUID NOT NULL REFERENCES public.chefs(id) ON DELETE CASCADE,
  customer_ref UUID NOT NULL REFERENCES public.customer_contacts(id) ON DELETE CASCADE,
  
  -- Business Intelligence Data (No PII)
  service_type TEXT NOT NULL CHECK (service_type IN ('weekly_cooking', 'special_event', 'one_time', 'other')),
  budget_range TEXT CHECK (budget_range IN ('under_100', '100_200', '200_500', 'over_500')),
  message TEXT CHECK (length(message) <= 500), -- Reasonable limit, will be scrubbed of PII
  
  -- Lead Management (following chef_applications status pattern)
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'converted', 'closed')),
  contacted_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  
  -- Security & Rate Limiting
  ip_hash TEXT NOT NULL, -- Following reviews pattern for rate limiting
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_customer_chef_inquiry UNIQUE (chef_id, customer_ref)
);

-- Table 3: contact_click_events (Pure Analytics, No PII)
CREATE TABLE public.contact_click_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chef_id UUID NOT NULL REFERENCES public.chefs(id) ON DELETE CASCADE,
  
  -- Event Data
  source TEXT NOT NULL CHECK (source IN ('cta_button', 'modal_submit', 'skip_form')),
  user_agent TEXT,
  referrer TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 4: pii_access_audit (Admin Accountability - following chef_audit_log pattern)
CREATE TABLE public.pii_access_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id),
  
  -- Audit Information
  action TEXT NOT NULL CHECK (action IN ('view', 'export', 'delete', 'update')),
  customer_contact_id UUID REFERENCES public.customer_contacts(id) ON DELETE SET NULL,
  table_name TEXT NOT NULL,
  record_count INTEGER DEFAULT 1,
  
  -- Context
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================
-- PART 2: PERFORMANCE INDEXES
-- =================================================================

-- Customer Contacts Indexes
CREATE INDEX idx_customer_contacts_email_hash ON public.customer_contacts(email_hash);
CREATE INDEX idx_customer_contacts_created_at ON public.customer_contacts(created_at DESC);
CREATE INDEX idx_customer_contacts_marketing_opt_in ON public.customer_contacts(marketing_opt_in, created_at DESC);

-- Customer Inquiries Indexes (following existing patterns)
CREATE INDEX idx_customer_inquiries_chef_id ON public.customer_inquiries(chef_id, created_at DESC);
CREATE INDEX idx_customer_inquiries_status ON public.customer_inquiries(status, created_at DESC);
CREATE INDEX idx_customer_inquiries_customer_ref ON public.customer_inquiries(customer_ref);
CREATE INDEX idx_customer_inquiries_service_type ON public.customer_inquiries(service_type);

-- Click Events Indexes
CREATE INDEX idx_contact_click_events_chef_id ON public.contact_click_events(chef_id, created_at DESC);
CREATE INDEX idx_contact_click_events_source ON public.contact_click_events(source, created_at DESC);

-- PII Access Audit Indexes (following chef_audit_log pattern)
CREATE INDEX idx_pii_access_audit_admin_user ON public.pii_access_audit(admin_user_id, created_at DESC);
CREATE INDEX idx_pii_access_audit_customer_contact ON public.pii_access_audit(customer_contact_id, created_at DESC);

-- =================================================================
-- PART 3: ROW LEVEL SECURITY (RLS) POLICIES
-- =================================================================

-- Enable RLS on all tables
ALTER TABLE public.customer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_click_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pii_access_audit ENABLE ROW LEVEL SECURITY;

-- Customer Contacts Policies (Most restrictive - PII data)
CREATE POLICY "Admin only access to customer contacts" ON public.customer_contacts
  FOR ALL USING ((auth.jwt()->>'role') = 'admin');

-- Customer Inquiries Policies (Admin read, system write)
CREATE POLICY "Admin can view customer inquiries" ON public.customer_inquiries
  FOR SELECT USING ((auth.jwt()->>'role') = 'admin');

CREATE POLICY "System can create customer inquiries" ON public.customer_inquiries
  FOR INSERT WITH CHECK (true); -- Will be controlled by server action

-- Click Events Policies (Analytics data)
CREATE POLICY "System can create click events" ON public.contact_click_events
  FOR INSERT WITH CHECK (true); -- Will be controlled by server action

CREATE POLICY "Admin can view click events" ON public.contact_click_events
  FOR SELECT USING ((auth.jwt()->>'role') = 'admin');

-- PII Access Audit Policies (Admin accountability)
CREATE POLICY "System can create audit logs" ON public.pii_access_audit
  FOR INSERT WITH CHECK (true); -- Automatic logging

CREATE POLICY "Admin can view audit logs" ON public.pii_access_audit
  FOR SELECT USING ((auth.jwt()->>'role') = 'admin');

-- =================================================================
-- PART 4: HELPER FUNCTIONS (Optional - for future use)
-- =================================================================

-- Function to get inquiry statistics (following chef_rating_stats pattern)
CREATE OR REPLACE VIEW chef_inquiry_stats AS
SELECT 
  chef_id,
  COUNT(*) as total_inquiries,
  COUNT(*) FILTER (WHERE status = 'converted') as conversions,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as inquiries_last_30_days,
  MAX(created_at) as latest_inquiry_date
FROM public.customer_inquiries 
GROUP BY chef_id;

-- =================================================================
-- MIGRATION COMPLETE
-- =================================================================

-- Verification queries to run after migration:
-- SELECT COUNT(*) FROM public.customer_contacts; -- Should be 0
-- SELECT COUNT(*) FROM public.customer_inquiries; -- Should be 0  
-- SELECT COUNT(*) FROM public.contact_click_events; -- Should be 0
-- SELECT COUNT(*) FROM public.pii_access_audit; -- Should be 0
-- SELECT * FROM chef_inquiry_stats; -- Should be empty

COMMENT ON TABLE public.customer_contacts IS 'Encrypted PII storage for customer contact information';
COMMENT ON TABLE public.customer_inquiries IS 'Analytics and business intelligence data for customer inquiries';
COMMENT ON TABLE public.contact_click_events IS 'Pure analytics tracking for contact button interactions';
COMMENT ON TABLE public.pii_access_audit IS 'Audit trail for PII data access and modifications';
