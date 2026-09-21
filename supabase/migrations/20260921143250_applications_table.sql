-- ============================================================
-- Applications Table Migration
-- Unified form submissions for savings/loan/investment products
-- ============================================================

-- Applications table
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('savings', 'loan', 'investment')),
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  duration_months INTEGER NOT NULL,
  eligibility_score INTEGER NOT NULL DEFAULT 0,
  is_eligible BOOLEAN NOT NULL DEFAULT false,
  application_status TEXT NOT NULL DEFAULT 'pending' CHECK (application_status IN ('pending', 'under_review', 'approved', 'rejected', 'cancelled')),
  notes TEXT,
  reviewed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  review_notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_member_id ON public.applications(member_id);
CREATE INDEX IF NOT EXISTS idx_applications_product_type ON public.applications(product_type);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(application_status);
CREATE INDEX IF NOT EXISTS idx_applications_submitted_at ON public.applications(submitted_at DESC);

-- Updated_at trigger function (reuse if exists)
CREATE OR REPLACE FUNCTION public.update_applications_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS applications_updated_at ON public.applications;
CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_applications_updated_at();

-- Enable RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Authenticated users can insert their own applications
DROP POLICY IF EXISTS "users_can_insert_applications" ON public.applications;
CREATE POLICY "users_can_insert_applications"
ON public.applications
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Authenticated users can view their own applications
DROP POLICY IF EXISTS "users_can_view_own_applications" ON public.applications;
CREATE POLICY "users_can_view_own_applications"
ON public.applications
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Unauthenticated (public) users can also insert (for public /apply form)
DROP POLICY IF EXISTS "public_can_insert_applications" ON public.applications;
CREATE POLICY "public_can_insert_applications"
ON public.applications
FOR INSERT
TO anon
WITH CHECK (true);

-- Admins can view all applications (using auth metadata)
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
  SELECT 1 FROM public.user_profiles up
  WHERE up.id = auth.uid()
  AND up.role IN ('super_admin', 'admin', 'manager', 'staff')
)
$$;

DROP POLICY IF EXISTS "admins_can_view_all_applications" ON public.applications;
CREATE POLICY "admins_can_view_all_applications"
ON public.applications
FOR SELECT
TO authenticated
USING (public.is_admin_user());

DROP POLICY IF EXISTS "admins_can_update_applications" ON public.applications;
CREATE POLICY "admins_can_update_applications"
ON public.applications
FOR UPDATE
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());
