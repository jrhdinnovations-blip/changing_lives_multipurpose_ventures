-- ============================================================
-- CLIMPS Investors Circle Migration
-- ============================================================

-- 1. ENUM TYPES
DROP TYPE IF EXISTS public.investor_circle_app_status CASCADE;
CREATE TYPE public.investor_circle_app_status AS ENUM (
  'draft',
  'submitted',
  'under_review',
  'awaiting_payment',
  'payment_verification',
  'approved',
  'agreement_pending',
  'active',
  'matured',
  'early_liquidation_requested',
  'early_liquidation_approved',
  'early_liquidation_rejected',
  'completed',
  'cancelled'
);

DROP TYPE IF EXISTS public.investor_circle_gender CASCADE;
CREATE TYPE public.investor_circle_gender AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');

-- 2. INVESTOR CIRCLE APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.investor_circle_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number TEXT UNIQUE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,

  -- Terms agreement
  terms_agreed BOOLEAN NOT NULL DEFAULT false,
  terms_agreed_at TIMESTAMPTZ,
  terms_version TEXT DEFAULT 'v1.0',
  terms_ip_address TEXT,
  terms_user_agent TEXT,

  -- Processing fee agreement
  processing_fee_agreed BOOLEAN NOT NULL DEFAULT false,
  processing_fee_amount NUMERIC DEFAULT 3000,
  processing_fee_agreed_at TIMESTAMPTZ,

  -- Investor information
  investor_name TEXT NOT NULL,
  investor_phone TEXT NOT NULL,
  investor_address TEXT NOT NULL,
  investor_gender TEXT,
  investor_email TEXT NOT NULL,

  -- Next of kin
  nok_name TEXT NOT NULL,
  nok_address TEXT NOT NULL,
  nok_phone TEXT NOT NULL,

  -- Investment details
  investment_amount NUMERIC NOT NULL,
  investment_duration_label TEXT NOT NULL,
  investment_duration_months INTEGER NOT NULL,
  investment_start_date DATE,
  investment_maturity_date DATE,
  indicative_monthly_return NUMERIC,
  indicative_total_return NUMERIC,
  indicative_maturity_value NUMERIC,

  -- Bank details
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bank_name TEXT NOT NULL,

  -- Role
  declared_role TEXT DEFAULT 'investor',
  resolved_role TEXT DEFAULT 'investor',

  -- Status
  app_status public.investor_circle_app_status DEFAULT 'draft'::public.investor_circle_app_status,
  review_notes TEXT,
  reviewed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. INVESTOR CIRCLE RECORDS TABLE (activated investments)
CREATE TABLE IF NOT EXISTS public.investor_circle_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_number TEXT UNIQUE NOT NULL,
  application_id UUID REFERENCES public.investor_circle_applications(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,

  investor_name TEXT NOT NULL,
  investor_email TEXT NOT NULL,
  investor_phone TEXT NOT NULL,

  -- Financial
  principal NUMERIC NOT NULL,
  processing_fee NUMERIC DEFAULT 3000,
  interest_rate_percent NUMERIC DEFAULT 4,
  investment_start_date DATE NOT NULL,
  investment_tenure_months INTEGER NOT NULL,
  investment_tenure_label TEXT NOT NULL,
  maturity_date DATE NOT NULL,
  monthly_return NUMERIC NOT NULL,
  projected_total_return NUMERIC NOT NULL,
  projected_maturity_value NUMERIC NOT NULL,
  actual_return NUMERIC DEFAULT 0,

  -- Bank
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bank_name TEXT NOT NULL,

  -- Agreement
  agreement_reference TEXT,
  agreement_accepted_at TIMESTAMPTZ,

  -- Status
  record_status public.investor_circle_app_status DEFAULT 'active'::public.investor_circle_app_status,
  matured_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Documents / notes
  documents JSONB DEFAULT '[]'::jsonb,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. EARLY LIQUIDATION REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.investor_circle_liquidation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID NOT NULL REFERENCES public.investor_circle_records(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,

  liquidation_type TEXT NOT NULL DEFAULT 'full', -- 'full' | 'partial'
  amount_requested NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  requested_date DATE NOT NULL,
  is_early_liquidation BOOLEAN DEFAULT true,

  -- Charges
  forfeited_returns NUMERIC DEFAULT 0,
  early_liquidation_charge NUMERIC DEFAULT 0,
  net_payable NUMERIC,

  -- Status
  request_status TEXT DEFAULT 'pending', -- pending | approved | rejected
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_ica_user_id ON public.investor_circle_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_ica_member_id ON public.investor_circle_applications(member_id);
CREATE INDEX IF NOT EXISTS idx_ica_status ON public.investor_circle_applications(app_status);
CREATE INDEX IF NOT EXISTS idx_icr_user_id ON public.investor_circle_records(user_id);
CREATE INDEX IF NOT EXISTS idx_icr_member_id ON public.investor_circle_records(member_id);
CREATE INDEX IF NOT EXISTS idx_icr_status ON public.investor_circle_records(record_status);
CREATE INDEX IF NOT EXISTS idx_iclr_record_id ON public.investor_circle_liquidation_requests(record_id);

-- 6. SEQUENCE FUNCTION FOR APPLICATION NUMBER
CREATE OR REPLACE FUNCTION public.generate_investor_circle_app_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  year_part TEXT;
  seq_num INTEGER;
  app_number TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  SELECT COUNT(*) + 1 INTO seq_num
  FROM public.investor_circle_applications
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  app_number := 'ICA/' || year_part || '/' || LPAD(seq_num::TEXT, 5, '0');
  RETURN app_number;
END;
$$;

-- 7. SEQUENCE FUNCTION FOR INVESTMENT NUMBER
CREATE OR REPLACE FUNCTION public.generate_investor_circle_inv_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  year_part TEXT;
  seq_num INTEGER;
  inv_number TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  SELECT COUNT(*) + 1 INTO seq_num
  FROM public.investor_circle_records
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  inv_number := 'INV/' || year_part || '/' || LPAD(seq_num::TEXT, 5, '0');
  RETURN inv_number;
END;
$$;

-- 8. UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.update_investor_circle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- 9. TRIGGERS
DROP TRIGGER IF EXISTS trg_ica_updated_at ON public.investor_circle_applications;
CREATE TRIGGER trg_ica_updated_at
  BEFORE UPDATE ON public.investor_circle_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_investor_circle_updated_at();

DROP TRIGGER IF EXISTS trg_icr_updated_at ON public.investor_circle_records;
CREATE TRIGGER trg_icr_updated_at
  BEFORE UPDATE ON public.investor_circle_records
  FOR EACH ROW EXECUTE FUNCTION public.update_investor_circle_updated_at();

DROP TRIGGER IF EXISTS trg_iclr_updated_at ON public.investor_circle_liquidation_requests;
CREATE TRIGGER trg_iclr_updated_at
  BEFORE UPDATE ON public.investor_circle_liquidation_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_investor_circle_updated_at();

-- 10. ENABLE RLS
ALTER TABLE public.investor_circle_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_circle_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_circle_liquidation_requests ENABLE ROW LEVEL SECURITY;

-- 11. ADMIN ROLE FUNCTION
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
  SELECT 1 FROM auth.users au
  WHERE au.id = auth.uid()
  AND (
    au.raw_user_meta_data->>'role' IN ('super_admin','admin','manager','staff')
    OR au.raw_app_meta_data->>'role' IN ('super_admin','admin','manager','staff')
  )
)
$$;

-- 12. RLS POLICIES — investor_circle_applications
DROP POLICY IF EXISTS "ica_select_own" ON public.investor_circle_applications;
CREATE POLICY "ica_select_own"
ON public.investor_circle_applications FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS "ica_insert_own" ON public.investor_circle_applications;
CREATE POLICY "ica_insert_own"
ON public.investor_circle_applications FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS "ica_insert_anon" ON public.investor_circle_applications;
CREATE POLICY "ica_insert_anon"
ON public.investor_circle_applications FOR INSERT
TO anon
WITH CHECK (true);

DROP POLICY IF EXISTS "ica_update_own" ON public.investor_circle_applications;
CREATE POLICY "ica_update_own"
ON public.investor_circle_applications FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin_user())
WITH CHECK (user_id = auth.uid() OR public.is_admin_user());

-- 13. RLS POLICIES — investor_circle_records
DROP POLICY IF EXISTS "icr_select_own" ON public.investor_circle_records;
CREATE POLICY "icr_select_own"
ON public.investor_circle_records FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS "icr_insert_admin" ON public.investor_circle_records;
CREATE POLICY "icr_insert_admin"
ON public.investor_circle_records FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS "icr_update_admin" ON public.investor_circle_records;
CREATE POLICY "icr_update_admin"
ON public.investor_circle_records FOR UPDATE
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- 14. RLS POLICIES — investor_circle_liquidation_requests
DROP POLICY IF EXISTS "iclr_select_own" ON public.investor_circle_liquidation_requests;
CREATE POLICY "iclr_select_own"
ON public.investor_circle_liquidation_requests FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS "iclr_insert_own" ON public.investor_circle_liquidation_requests;
CREATE POLICY "iclr_insert_own"
ON public.investor_circle_liquidation_requests FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS "iclr_update_admin" ON public.investor_circle_liquidation_requests;
CREATE POLICY "iclr_update_admin"
ON public.investor_circle_liquidation_requests FOR UPDATE
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- 15. SYSTEM SETTINGS for Investors Circle
INSERT INTO public.system_settings (setting_key, setting_value, description)
VALUES
  ('investors_circle_min_amount', '750000', 'Minimum investment amount for CLIMPS Investors Circle (NGN)'),
  ('investors_circle_processing_fee', '3000', 'Processing/administrative fee for Investors Circle applications (NGN)'),
  ('investors_circle_interest_rate', '4', 'Monthly interest rate percentage for Investors Circle investments'),
  ('investors_circle_coop_account_name', 'Changing Lives Multipurpose Cooperative Society', 'Cooperative receiving account name'),
  ('investors_circle_coop_account_number', '2044406437', 'Cooperative receiving account number'),
  ('investors_circle_coop_bank_name', 'First Bank', 'Cooperative receiving bank name'),
  ('investors_circle_terms_version', 'v1.0', 'Current version of Investors Circle terms and conditions')
ON CONFLICT (setting_key) DO NOTHING;
