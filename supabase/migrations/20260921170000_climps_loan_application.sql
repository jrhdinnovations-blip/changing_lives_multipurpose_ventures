-- ============================================================
-- CLIMPS Loan Application System Migration
-- Extends loan_applications + adds collateral, guarantor, repayment tracking
-- ============================================================

-- 1. EXTEND loan_applications TABLE with all required fields
ALTER TABLE public.loan_applications
  ADD COLUMN IF NOT EXISTS application_number TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,

  -- Terms agreements
  ADD COLUMN IF NOT EXISTS terms_agreed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS terms_agreed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS terms_version TEXT DEFAULT 'v1.0',
  ADD COLUMN IF NOT EXISTS interest_ack_agreed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS interest_ack_agreed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS full_terms_agreed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS full_terms_agreed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS collateral_terms_agreed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS collateral_terms_agreed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS agreement_version TEXT DEFAULT 'v1.0',

  -- Applicant information
  ADD COLUMN IF NOT EXISTS applicant_name TEXT,
  ADD COLUMN IF NOT EXISTS applicant_phone TEXT,
  ADD COLUMN IF NOT EXISTS applicant_address TEXT,
  ADD COLUMN IF NOT EXISTS applicant_gender TEXT,
  ADD COLUMN IF NOT EXISTS applicant_state TEXT,

  -- Loan financial details
  ADD COLUMN IF NOT EXISTS processing_fee_percent NUMERIC DEFAULT 1,
  ADD COLUMN IF NOT EXISTS processing_fee_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS interest_rate_percent NUMERIC DEFAULT 10,
  ADD COLUMN IF NOT EXISTS monthly_interest_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_interest_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_repayment_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS duration_label TEXT,

  -- Bank details
  ADD COLUMN IF NOT EXISTS account_name TEXT,
  ADD COLUMN IF NOT EXISTS account_number TEXT,
  ADD COLUMN IF NOT EXISTS bank_name TEXT,

  -- Role
  ADD COLUMN IF NOT EXISTS resolved_role TEXT DEFAULT 'applicant',

  -- Extended status (text to allow 17 statuses beyond existing enum)
  ADD COLUMN IF NOT EXISTS app_status TEXT DEFAULT 'draft',

  -- Admin fields
  ADD COLUMN IF NOT EXISTS approved_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS disbursed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS processing_fee_paid BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS processing_fee_paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS guarantor_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS guarantor_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS collateral_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS collateral_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- 2. LOAN COLLATERAL TABLE
CREATE TABLE IF NOT EXISTS public.loan_collaterals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.loan_applications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,

  -- Collateral details
  collateral_type TEXT NOT NULL DEFAULT 'undated_cheque', -- undated_cheque | asset | both
  cheque_number TEXT,
  cheque_bank TEXT,
  cheque_amount NUMERIC,

  -- Asset details
  asset_description TEXT,
  asset_value NUMERIC,
  asset_ownership TEXT,
  asset_location TEXT,

  -- Documents
  documents JSONB DEFAULT '[]'::jsonb,

  -- Status
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  verification_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. LOAN GUARANTORS TABLE
CREATE TABLE IF NOT EXISTS public.loan_guarantors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.loan_applications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,

  -- Guarantor details
  guarantor_name TEXT NOT NULL,
  guarantor_phone TEXT NOT NULL,
  guarantor_address TEXT NOT NULL,
  guarantor_member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,

  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  verification_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. LOAN INTEREST TRACKING TABLE (monthly interest engine)
CREATE TABLE IF NOT EXISTS public.loan_interest_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.loan_applications(id) ON DELETE SET NULL,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,

  period_number INTEGER NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  due_date DATE NOT NULL,

  -- Interest calculation
  principal_outstanding NUMERIC NOT NULL,
  interest_rate_percent NUMERIC NOT NULL DEFAULT 10,
  interest_due NUMERIC NOT NULL,
  interest_paid NUMERIC DEFAULT 0,
  interest_outstanding NUMERIC GENERATED ALWAYS AS (interest_due - interest_paid) STORED,

  -- Default tracking
  days_overdue INTEGER DEFAULT 0,
  default_charge NUMERIC DEFAULT 0,
  is_overdue BOOLEAN DEFAULT false,
  is_prorata BOOLEAN DEFAULT false,
  prorata_days INTEGER,

  -- Payment
  payment_date TIMESTAMPTZ,
  payment_method TEXT,
  transaction_ref TEXT,

  -- Status
  record_status TEXT DEFAULT 'upcoming', -- upcoming | paid | partially_paid | overdue | defaulted

  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. LOAN PAYMENT RECEIPTS TABLE
CREATE TABLE IF NOT EXISTS public.loan_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number TEXT UNIQUE NOT NULL,
  loan_id UUID REFERENCES public.loans(id) ON DELETE SET NULL,
  application_id UUID REFERENCES public.loan_applications(id) ON DELETE SET NULL,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  interest_record_id UUID REFERENCES public.loan_interest_records(id) ON DELETE SET NULL,

  -- Payment details
  payment_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  amount NUMERIC NOT NULL,
  interest_allocation NUMERIC DEFAULT 0,
  principal_allocation NUMERIC DEFAULT 0,
  default_charge_allocation NUMERIC DEFAULT 0,
  payment_method TEXT DEFAULT 'cash',
  transaction_reference TEXT,

  -- Outstanding after payment
  outstanding_balance NUMERIC,
  interest_outstanding_after NUMERIC,

  -- Verification
  verified_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  is_verified BOOLEAN DEFAULT false,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. LOAN AUDIT TRAIL TABLE
CREATE TABLE IF NOT EXISTS public.loan_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.loan_applications(id) ON DELETE CASCADE,
  loan_id UUID REFERENCES public.loans(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,

  action TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. EXTEND system_settings with loan configuration keys
INSERT INTO public.system_settings (setting_key, setting_value, description)
VALUES
  ('loan_processing_fee_percent', '1', 'Loan processing/administrative fee as percentage of loan amount'),
  ('loan_interest_rate_percent', '10', 'Monthly interest rate for loans (%)'),
  ('loan_default_fee_percent_daily', '1', 'Daily default fee on unpaid interest (%)'),
  ('loan_overdue_threshold_days', '15', 'Days after which interest is considered overdue'),
  ('loan_prorata_days', '14', 'Days within which pro-rata interest calculation applies'),
  ('loan_durations_months', '1,2,3', 'Available loan durations in months (comma-separated)'),
  ('loan_guarantor_required', 'true', 'Whether a guarantor is required for loan applications'),
  ('loan_collateral_required', 'true', 'Whether collateral is required for loan applications'),
  ('loan_terms_version', 'v1.0', 'Current version of loan terms and conditions'),
  ('loan_agreement_version', 'v1.0', 'Current version of loan agreement')
ON CONFLICT (setting_key) DO NOTHING;

-- 8. INDEXES
CREATE INDEX IF NOT EXISTS idx_loan_app_user_id ON public.loan_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_loan_app_app_status ON public.loan_applications(app_status);
CREATE INDEX IF NOT EXISTS idx_loan_app_number ON public.loan_applications(application_number);
CREATE INDEX IF NOT EXISTS idx_loan_collateral_app_id ON public.loan_collaterals(application_id);
CREATE INDEX IF NOT EXISTS idx_loan_guarantor_app_id ON public.loan_guarantors(application_id);
CREATE INDEX IF NOT EXISTS idx_loan_interest_loan_id ON public.loan_interest_records(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_interest_status ON public.loan_interest_records(record_status);
CREATE INDEX IF NOT EXISTS idx_loan_receipts_loan_id ON public.loan_receipts(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_audit_app_id ON public.loan_audit_trail(application_id);

-- 9. SEQUENCE FUNCTION FOR APPLICATION NUMBER
CREATE OR REPLACE FUNCTION public.generate_loan_app_number()
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
  FROM public.loan_applications
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  app_number := 'LNA/' || year_part || '/' || LPAD(seq_num::TEXT, 5, '0');
  RETURN app_number;
END;
$$;

-- 10. SEQUENCE FUNCTION FOR RECEIPT NUMBER
CREATE OR REPLACE FUNCTION public.generate_loan_receipt_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  year_part TEXT;
  seq_num INTEGER;
  receipt_number TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  SELECT COUNT(*) + 1 INTO seq_num
  FROM public.loan_receipts
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  receipt_number := 'RCP/' || year_part || '/' || LPAD(seq_num::TEXT, 5, '0');
  RETURN receipt_number;
END;
$$;

-- 11. TRANSACTION REF FUNCTION
CREATE OR REPLACE FUNCTION public.generate_txn_ref()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  year_part TEXT;
  seq_num INTEGER;
  txn_ref TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  SELECT COUNT(*) + 1 INTO seq_num
  FROM public.transactions
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  txn_ref := 'TXN/' || year_part || '/' || LPAD(seq_num::TEXT, 6, '0');
  RETURN txn_ref;
END;
$$;

-- 12. UPDATED_AT TRIGGER FUNCTION (reuse pattern)
CREATE OR REPLACE FUNCTION public.update_loan_tables_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- 13. TRIGGERS
DROP TRIGGER IF EXISTS trg_loan_collaterals_updated_at ON public.loan_collaterals;
CREATE TRIGGER trg_loan_collaterals_updated_at
  BEFORE UPDATE ON public.loan_collaterals
  FOR EACH ROW EXECUTE FUNCTION public.update_loan_tables_updated_at();

DROP TRIGGER IF EXISTS trg_loan_guarantors_updated_at ON public.loan_guarantors;
CREATE TRIGGER trg_loan_guarantors_updated_at
  BEFORE UPDATE ON public.loan_guarantors
  FOR EACH ROW EXECUTE FUNCTION public.update_loan_tables_updated_at();

DROP TRIGGER IF EXISTS trg_loan_interest_updated_at ON public.loan_interest_records;
CREATE TRIGGER trg_loan_interest_updated_at
  BEFORE UPDATE ON public.loan_interest_records
  FOR EACH ROW EXECUTE FUNCTION public.update_loan_tables_updated_at();

-- 14. ENABLE RLS
ALTER TABLE public.loan_collaterals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_guarantors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_interest_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_audit_trail ENABLE ROW LEVEL SECURITY;

-- 15. ADMIN FUNCTION (reuse existing is_admin_user if exists, else create)
CREATE OR REPLACE FUNCTION public.is_loan_admin()
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

-- 16. RLS POLICIES — loan_collaterals
DROP POLICY IF EXISTS "users_view_own_loan_collaterals" ON public.loan_collaterals;
CREATE POLICY "users_view_own_loan_collaterals"
ON public.loan_collaterals FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_loan_admin());

DROP POLICY IF EXISTS "users_insert_own_loan_collaterals" ON public.loan_collaterals;
CREATE POLICY "users_insert_own_loan_collaterals"
ON public.loan_collaterals FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR public.is_loan_admin());

DROP POLICY IF EXISTS "users_update_own_loan_collaterals" ON public.loan_collaterals;
CREATE POLICY "users_update_own_loan_collaterals"
ON public.loan_collaterals FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR public.is_loan_admin())
WITH CHECK (user_id = auth.uid() OR public.is_loan_admin());

DROP POLICY IF EXISTS "anon_insert_loan_collaterals" ON public.loan_collaterals;
CREATE POLICY "anon_insert_loan_collaterals"
ON public.loan_collaterals FOR INSERT TO anon
WITH CHECK (true);

-- 17. RLS POLICIES — loan_guarantors
DROP POLICY IF EXISTS "users_view_own_loan_guarantors" ON public.loan_guarantors;
CREATE POLICY "users_view_own_loan_guarantors"
ON public.loan_guarantors FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_loan_admin());

DROP POLICY IF EXISTS "users_insert_own_loan_guarantors" ON public.loan_guarantors;
CREATE POLICY "users_insert_own_loan_guarantors"
ON public.loan_guarantors FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR public.is_loan_admin());

DROP POLICY IF EXISTS "users_update_own_loan_guarantors" ON public.loan_guarantors;
CREATE POLICY "users_update_own_loan_guarantors"
ON public.loan_guarantors FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR public.is_loan_admin())
WITH CHECK (user_id = auth.uid() OR public.is_loan_admin());

DROP POLICY IF EXISTS "anon_insert_loan_guarantors" ON public.loan_guarantors;
CREATE POLICY "anon_insert_loan_guarantors"
ON public.loan_guarantors FOR INSERT TO anon
WITH CHECK (true);

-- 18. RLS POLICIES — loan_interest_records
DROP POLICY IF EXISTS "users_view_own_loan_interest" ON public.loan_interest_records;
CREATE POLICY "users_view_own_loan_interest"
ON public.loan_interest_records FOR SELECT TO authenticated
USING (member_id IN (
  SELECT id FROM public.members WHERE user_id = auth.uid()
) OR public.is_loan_admin());

DROP POLICY IF EXISTS "admin_manage_loan_interest" ON public.loan_interest_records;
CREATE POLICY "admin_manage_loan_interest"
ON public.loan_interest_records FOR ALL TO authenticated
USING (public.is_loan_admin())
WITH CHECK (public.is_loan_admin());

-- 19. RLS POLICIES — loan_receipts
DROP POLICY IF EXISTS "users_view_own_loan_receipts" ON public.loan_receipts;
CREATE POLICY "users_view_own_loan_receipts"
ON public.loan_receipts FOR SELECT TO authenticated
USING (member_id IN (
  SELECT id FROM public.members WHERE user_id = auth.uid()
) OR public.is_loan_admin());

DROP POLICY IF EXISTS "admin_manage_loan_receipts" ON public.loan_receipts;
CREATE POLICY "admin_manage_loan_receipts"
ON public.loan_receipts FOR ALL TO authenticated
USING (public.is_loan_admin())
WITH CHECK (public.is_loan_admin());

-- 20. RLS POLICIES — loan_audit_trail
DROP POLICY IF EXISTS "users_view_own_loan_audit" ON public.loan_audit_trail;
CREATE POLICY "users_view_own_loan_audit"
ON public.loan_audit_trail FOR SELECT TO authenticated
USING (
  application_id IN (
    SELECT id FROM public.loan_applications WHERE user_id = auth.uid()
  ) OR public.is_loan_admin()
);

DROP POLICY IF EXISTS "admin_insert_loan_audit" ON public.loan_audit_trail;
CREATE POLICY "admin_insert_loan_audit"
ON public.loan_audit_trail FOR INSERT TO authenticated
WITH CHECK (public.is_loan_admin() OR user_id = auth.uid());
