-- ==============================================================================
-- Migration: Delete all users and make raymondlongdiem22@gmail.com the admin
-- Date: 2026-09-22
-- ==============================================================================

-- 1. Ensure admin delete permission
DROP POLICY IF EXISTS "members_delete_admin" ON public.members;
CREATE POLICY "members_delete_admin"
ON public.members FOR DELETE TO authenticated
USING (public.is_admin_or_staff());

-- 2. Clear foreign key reviewer/assignee references
UPDATE public.contributions SET recorded_by = NULL;
UPDATE public.loan_applications SET reviewed_by = NULL;
UPDATE public.loans SET disbursed_by = NULL;
UPDATE public.complaints SET assigned_to = NULL;
UPDATE public.system_settings SET updated_by = NULL;

-- 3. Delete records belonging to other members
DELETE FROM public.contributions 
WHERE member_id IN (SELECT id FROM public.members WHERE LOWER(email) != 'raymondlongdiem22@gmail.com');

DELETE FROM public.savings_goals 
WHERE member_id IN (SELECT id FROM public.members WHERE LOWER(email) != 'raymondlongdiem22@gmail.com');

DELETE FROM public.loan_repayment_schedules 
WHERE loan_id IN (
  SELECT id FROM public.loans WHERE member_id IN (
    SELECT id FROM public.members WHERE LOWER(email) != 'raymondlongdiem22@gmail.com'
  )
);

DELETE FROM public.loans 
WHERE member_id IN (SELECT id FROM public.members WHERE LOWER(email) != 'raymondlongdiem22@gmail.com');

DELETE FROM public.loan_applications 
WHERE member_id IN (SELECT id FROM public.members WHERE LOWER(email) != 'raymondlongdiem22@gmail.com');

DELETE FROM public.investments 
WHERE member_id IN (SELECT id FROM public.members WHERE LOWER(email) != 'raymondlongdiem22@gmail.com');

-- 4. Delete applications table
DELETE FROM public.applications;

-- 5. Delete all members except Raymond
DELETE FROM public.members 
WHERE LOWER(email) != 'raymondlongdiem22@gmail.com';

-- 6. Delete all user profiles except Raymond
DELETE FROM public.user_profiles 
WHERE LOWER(email) != 'raymondlongdiem22@gmail.com';

-- 7. Delete all auth users except Raymond
DELETE FROM auth.users 
WHERE LOWER(email) != 'raymondlongdiem22@gmail.com';

-- 8. Set Raymond as super_admin in user_profiles
INSERT INTO public.user_profiles (
  id,
  email,
  full_name,
  role,
  is_active,
  created_at,
  updated_at
)
SELECT 
  id,
  'raymondlongdiem22@gmail.com',
  'Raymond Longdiem',
  'super_admin',
  true,
  NOW(),
  NOW()
FROM auth.users 
WHERE LOWER(email) = 'raymondlongdiem22@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'super_admin',
    full_name = 'Raymond Longdiem',
    is_active = true,
    updated_at = NOW();

-- 9. Ensure Raymond exists in members table (remove existing first to avoid duplicate or conflict errors)
DELETE FROM public.members 
WHERE LOWER(email) = 'raymondlongdiem22@gmail.com';

INSERT INTO public.members (
  user_id,
  member_number,
  first_name,
  last_name,
  email,
  phone,
  gender,
  membership_status,
  membership_date,
  monthly_contribution_amount,
  total_savings,
  total_contributions,
  active_loan_balance,
  investment_portfolio_value,
  kyc_completed,
  created_at,
  updated_at
)
SELECT 
  id,
  'ADM/2026/0001',
  'Raymond',
  'Longdiem',
  'raymondlongdiem22@gmail.com',
  '+234 803 000 0000',
  'male',
  'active'::public.membership_status,
  CURRENT_DATE,
  50000,
  0,
  0,
  0,
  0,
  true,
  NOW(),
  NOW()
FROM auth.users 
WHERE LOWER(email) = 'raymondlongdiem22@gmail.com';
