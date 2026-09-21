-- ============================================================
-- KYC Onboarding Migration
-- Adds KYC completion tracking to the members table
-- ============================================================

-- Add KYC tracking columns to members table
ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS kyc_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS kyc_completed_at TIMESTAMPTZ;

-- Create index for fast KYC status lookups
CREATE INDEX IF NOT EXISTS idx_members_kyc_completed ON public.members(kyc_completed);
CREATE INDEX IF NOT EXISTS idx_members_user_id ON public.members(user_id);

-- ============================================================
-- RLS: members table already has RLS enabled
-- Add policy so authenticated users can update their own member row
-- ============================================================

DROP POLICY IF EXISTS "members_update_own" ON public.members;
CREATE POLICY "members_update_own"
ON public.members
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "members_select_own" ON public.members;
CREATE POLICY "members_select_own"
ON public.members
FOR SELECT
TO authenticated
USING (user_id = auth.uid());
