-- ============================================================
-- CLIMPS Document & Agreement Management System
-- Stores, versions, and manages executed agreements, terms,
-- and supporting documents for loan and investment applications
-- ============================================================

-- 1. DOCUMENT CATEGORY ENUM
DROP TYPE IF EXISTS public.climps_doc_category CASCADE;
CREATE TYPE public.climps_doc_category AS ENUM (
  'application_form',
  'terms_acknowledgement',
  'letter_of_agreement',
  'supporting_document',
  'guarantor_document',
  'collateral_document',
  'payment_receipt',
  'approval_record',
  'identity_document',
  'bank_statement',
  'other'
);

-- 2. DOCUMENT STATUS ENUM
DROP TYPE IF EXISTS public.climps_doc_status CASCADE;
CREATE TYPE public.climps_doc_status AS ENUM (
  'pending',
  'uploaded',
  'verified',
  'rejected',
  'superseded',
  'archived'
);

-- 3. APPLICATION TYPE ENUM
DROP TYPE IF EXISTS public.climps_app_type CASCADE;
CREATE TYPE public.climps_app_type AS ENUM (
  'loan',
  'investment'
);

-- 4. MAIN DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.climps_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,

  -- Application linkage (polymorphic)
  application_type public.climps_app_type NOT NULL,
  loan_application_id UUID REFERENCES public.loan_applications(id) ON DELETE CASCADE,
  investment_application_id UUID REFERENCES public.investor_circle_applications(id) ON DELETE CASCADE,

  -- Document metadata
  document_name TEXT NOT NULL,
  document_category public.climps_doc_category NOT NULL DEFAULT 'other',
  document_description TEXT,
  file_name TEXT,
  file_size_bytes BIGINT,
  mime_type TEXT,
  storage_path TEXT,
  storage_bucket TEXT DEFAULT 'climps-documents',
  public_url TEXT,

  -- Versioning
  version_number INTEGER NOT NULL DEFAULT 1,
  version_label TEXT DEFAULT 'v1',
  is_current_version BOOLEAN DEFAULT true,
  superseded_by UUID REFERENCES public.climps_documents(id) ON DELETE SET NULL,

  -- Terms / agreement specific
  is_terms_document BOOLEAN DEFAULT false,
  terms_version TEXT,
  terms_agreed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  terms_agreed_at TIMESTAMPTZ,
  terms_ip_address TEXT,
  terms_user_agent TEXT,

  -- Admin management
  uploaded_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  verified_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Status
  doc_status public.climps_doc_status DEFAULT 'pending',

  -- Secure download
  download_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  download_token_expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),
  download_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. DOCUMENT AUDIT TRAIL TABLE
CREATE TABLE IF NOT EXISTS public.document_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.climps_documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- uploaded | downloaded | verified | rejected | superseded | deleted | viewed | shared
  action_detail TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. AGREEMENT VERSIONS TABLE (stores canonical text of each terms version)
CREATE TABLE IF NOT EXISTS public.agreement_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_type public.climps_app_type NOT NULL,
  version_label TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_current BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Unique current version per application type
CREATE UNIQUE INDEX IF NOT EXISTS idx_agreement_versions_current
  ON public.agreement_versions (application_type)
  WHERE is_current = true;

-- 7. TERMS ACCEPTANCES TABLE (records each user's acceptance of terms)
CREATE TABLE IF NOT EXISTS public.terms_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  agreement_version_id UUID REFERENCES public.agreement_versions(id) ON DELETE SET NULL,
  application_type public.climps_app_type NOT NULL,
  loan_application_id UUID REFERENCES public.loan_applications(id) ON DELETE CASCADE,
  investment_application_id UUID REFERENCES public.investor_circle_applications(id) ON DELETE CASCADE,
  acceptance_type TEXT NOT NULL, -- terms | processing_fee | interest_ack | collateral_terms | full_terms
  accepted BOOLEAN NOT NULL DEFAULT false,
  accepted_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  terms_version TEXT,
  terms_text_snapshot TEXT, -- snapshot of terms text at time of acceptance
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. INDEXES
CREATE INDEX IF NOT EXISTS idx_climps_documents_user_id ON public.climps_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_climps_documents_member_id ON public.climps_documents(member_id);
CREATE INDEX IF NOT EXISTS idx_climps_documents_loan_app ON public.climps_documents(loan_application_id);
CREATE INDEX IF NOT EXISTS idx_climps_documents_inv_app ON public.climps_documents(investment_application_id);
CREATE INDEX IF NOT EXISTS idx_climps_documents_category ON public.climps_documents(document_category);
CREATE INDEX IF NOT EXISTS idx_climps_documents_status ON public.climps_documents(doc_status);
CREATE INDEX IF NOT EXISTS idx_climps_documents_download_token ON public.climps_documents(download_token);
CREATE INDEX IF NOT EXISTS idx_doc_audit_document_id ON public.document_audit_trail(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_audit_user_id ON public.document_audit_trail(user_id);
CREATE INDEX IF NOT EXISTS idx_terms_acceptances_user ON public.terms_acceptances(user_id);
CREATE INDEX IF NOT EXISTS idx_terms_acceptances_loan ON public.terms_acceptances(loan_application_id);
CREATE INDEX IF NOT EXISTS idx_terms_acceptances_inv ON public.terms_acceptances(investment_application_id);

-- 9. UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.set_updated_at_documents()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_climps_documents_updated_at ON public.climps_documents;
CREATE TRIGGER trg_climps_documents_updated_at
  BEFORE UPDATE ON public.climps_documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_documents();

DROP TRIGGER IF EXISTS trg_agreement_versions_updated_at ON public.agreement_versions;
CREATE TRIGGER trg_agreement_versions_updated_at
  BEFORE UPDATE ON public.agreement_versions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_documents();

-- 10. AUTO AUDIT TRAIL TRIGGER
CREATE OR REPLACE FUNCTION public.auto_audit_document_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.document_audit_trail (document_id, user_id, action, action_detail)
    VALUES (NEW.id, NEW.uploaded_by, 'uploaded', 'Document created: ' || NEW.document_name);
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.doc_status <> NEW.doc_status THEN
      INSERT INTO public.document_audit_trail (document_id, user_id, action, action_detail)
      VALUES (NEW.id, NEW.verified_by, 'status_changed',
        'Status changed from ' || OLD.doc_status::TEXT || ' to ' || NEW.doc_status::TEXT);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_audit_document ON public.climps_documents;
CREATE TRIGGER trg_auto_audit_document
  AFTER INSERT OR UPDATE ON public.climps_documents
  FOR EACH ROW EXECUTE FUNCTION public.auto_audit_document_change();

-- 11. HELPER FUNCTION: is_admin_user
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND role IN ('super_admin', 'admin', 'manager', 'staff')
  )
$$;

-- 12. ENABLE RLS
ALTER TABLE public.climps_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreement_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terms_acceptances ENABLE ROW LEVEL SECURITY;

-- 13. RLS POLICIES — climps_documents
DROP POLICY IF EXISTS "members_view_own_documents" ON public.climps_documents;
CREATE POLICY "members_view_own_documents"
  ON public.climps_documents FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS "members_insert_own_documents" ON public.climps_documents;
CREATE POLICY "members_insert_own_documents"
  ON public.climps_documents FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS "admin_update_documents" ON public.climps_documents;
CREATE POLICY "admin_update_documents"
  ON public.climps_documents FOR UPDATE
  TO authenticated
  USING (public.is_admin_user() OR user_id = auth.uid())
  WITH CHECK (public.is_admin_user() OR user_id = auth.uid());

DROP POLICY IF EXISTS "admin_delete_documents" ON public.climps_documents;
CREATE POLICY "admin_delete_documents"
  ON public.climps_documents FOR DELETE
  TO authenticated
  USING (public.is_admin_user());

-- 14. RLS POLICIES — document_audit_trail
DROP POLICY IF EXISTS "members_view_own_audit" ON public.document_audit_trail;
CREATE POLICY "members_view_own_audit"
  ON public.document_audit_trail FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_admin_user()
    OR EXISTS (
      SELECT 1 FROM public.climps_documents d
      WHERE d.id = document_id AND d.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "system_insert_audit" ON public.document_audit_trail;
CREATE POLICY "system_insert_audit"
  ON public.document_audit_trail FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 15. RLS POLICIES — agreement_versions
DROP POLICY IF EXISTS "public_read_agreement_versions" ON public.agreement_versions;
CREATE POLICY "public_read_agreement_versions"
  ON public.agreement_versions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "admin_manage_agreement_versions" ON public.agreement_versions;
CREATE POLICY "admin_manage_agreement_versions"
  ON public.agreement_versions FOR ALL
  TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- 16. RLS POLICIES — terms_acceptances
DROP POLICY IF EXISTS "members_view_own_acceptances" ON public.terms_acceptances;
CREATE POLICY "members_view_own_acceptances"
  ON public.terms_acceptances FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS "members_insert_own_acceptances" ON public.terms_acceptances;
CREATE POLICY "members_insert_own_acceptances"
  ON public.terms_acceptances FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_admin_user());

-- 17. SEED AGREEMENT VERSIONS
DO $$
BEGIN
  INSERT INTO public.agreement_versions (
    application_type, version_label, title, content, effective_date, is_current
  ) VALUES (
    'investment'::public.climps_app_type,
    'v1.0',
    'CLIMPS Investors Circle — Terms & Conditions v1.0',
    'The Investor shall give the Cooperative not less than one (1) month''s written notice of any intention to withdraw or liquidate, whether in part or in full, the invested sum. Where the Investor fails to provide the required notice and requests an early liquidation, the Cooperative may, at its sole discretion and subject to liquidity availability, approve the request. In such circumstances, the Investor shall forfeit any accrued but unpaid returns applicable to the notice period, and an early liquidation administrative charge of 1% of the amount withdrawn may be deducted to cover processing and associated costs. The principal investment shall, however, remain payable in accordance with the terms of this Agreement.',
    CURRENT_DATE,
    true
  ) ON CONFLICT DO NOTHING;

  INSERT INTO public.agreement_versions (
    application_type, version_label, title, content, effective_date, is_current
  ) VALUES (
    'loan'::public.climps_app_type,
    'v1.0',
    'CLIMPS Loan Application — Terms & Conditions v1.0',
    'WE CHARGE ONE PERCENT (1%) OF THE LOAN SUM UPFRONT AS PROCESSING AND ADMINISTRATIVE FEE RESPECTIVELY. INTEREST MUST BE PAID MONTHLY. DEFAULT IN REPAYMENT OF THE INTEREST WILL ATTRACT THE DEFAULTING FEE OF ONE PERCENT (1%) OF INTEREST DAILY. ANY INTEREST REMAINING UNPAID ON OR BEYOND FIFTEEN (15) DAYS SHALL BE CONSIDERED OVERDUE AND SHALL ATTRACT CHARGES APPLICABLE FOR THE FULL MONTH. INTEREST PAYMENT MADE WITHIN THE FIRST 14 DAYS SHALL BE CALCULATED ON A PRO-RATA BASIS. THE COOPERATIVE WILL SELL THE COLLATERAL OFFERED TO RECOVER ITS LOAN IF YOU DEFAULT IN PAYING YOUR LOAN AFTER 3 MONTHS.',
    CURRENT_DATE,
    true
  ) ON CONFLICT DO NOTHING;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Seed data insertion skipped: %', SQLERRM;
END $$;
