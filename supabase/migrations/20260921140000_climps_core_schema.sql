-- ============================================================
-- CLIMPS Core Schema Migration
-- Changing Lives Multipurpose Ventures Cooperative Platform
-- ============================================================

-- ============================================================
-- 1. ENUMS / TYPES
-- ============================================================

DROP TYPE IF EXISTS public.user_role CASCADE;
CREATE TYPE public.user_role AS ENUM ('super_admin', 'admin', 'manager', 'staff', 'member', 'borrower');

DROP TYPE IF EXISTS public.membership_status CASCADE;
CREATE TYPE public.membership_status AS ENUM ('pending', 'under_review', 'approved', 'active', 'suspended', 'inactive');

DROP TYPE IF EXISTS public.contribution_status CASCADE;
CREATE TYPE public.contribution_status AS ENUM ('paid', 'partially_paid', 'unpaid', 'overdue');

DROP TYPE IF EXISTS public.savings_goal_status CASCADE;
CREATE TYPE public.savings_goal_status AS ENUM ('active', 'completed', 'paused', 'cancelled');

DROP TYPE IF EXISTS public.loan_status CASCADE;
CREATE TYPE public.loan_status AS ENUM ('pending', 'under_review', 'approved', 'rejected', 'disbursed', 'active', 'overdue', 'completed', 'restructured', 'cancelled');

DROP TYPE IF EXISTS public.investment_status CASCADE;
CREATE TYPE public.investment_status AS ENUM ('pending', 'active', 'matured', 'cancelled');

DROP TYPE IF EXISTS public.investment_product_status CASCADE;
CREATE TYPE public.investment_product_status AS ENUM ('draft', 'open', 'fully_subscribed', 'closed', 'matured', 'suspended');

DROP TYPE IF EXISTS public.transaction_type CASCADE;
CREATE TYPE public.transaction_type AS ENUM (
  'contribution', 'savings_deposit', 'savings_withdrawal',
  'loan_disbursement', 'loan_repayment',
  'investment_subscription', 'investment_return', 'investment_maturity',
  'penalty', 'charge', 'adjustment', 'refund', 'reversal'
);

DROP TYPE IF EXISTS public.transaction_status CASCADE;
CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'failed', 'reversed', 'cancelled');

DROP TYPE IF EXISTS public.complaint_status CASCADE;
CREATE TYPE public.complaint_status AS ENUM ('submitted', 'open', 'in_review', 'resolved', 'closed');

DROP TYPE IF EXISTS public.repayment_status CASCADE;
CREATE TYPE public.repayment_status AS ENUM ('upcoming', 'paid', 'partially_paid', 'overdue');

DROP TYPE IF EXISTS public.notification_type CASCADE;
CREATE TYPE public.notification_type AS ENUM (
  'contribution_due', 'contribution_overdue', 'payment_received',
  'loan_submitted', 'loan_approved', 'loan_rejected', 'loan_repayment_due', 'loan_overdue',
  'investment_accepted', 'investment_maturity', 'investment_matured', 'new_investment',
  'complaint_update', 'announcement', 'general'
);

-- ============================================================
-- 2. CORE TABLES
-- ============================================================

-- User Profiles (intermediary for auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  role public.user_role DEFAULT 'member'::public.user_role,
  is_active BOOLEAN DEFAULT true,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Members
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  member_number TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  gender TEXT,
  date_of_birth DATE,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT,
  state TEXT,
  lga TEXT,
  occupation TEXT,
  employer TEXT,
  nok_name TEXT,
  nok_relationship TEXT,
  nok_phone TEXT,
  nok_address TEXT,
  id_type TEXT,
  id_number TEXT,
  membership_status public.membership_status DEFAULT 'pending'::public.membership_status,
  membership_date DATE,
  monthly_contribution_amount NUMERIC(15,2) DEFAULT 10000,
  total_savings NUMERIC(15,2) DEFAULT 0,
  total_contributions NUMERIC(15,2) DEFAULT 0,
  active_loan_balance NUMERIC(15,2) DEFAULT 0,
  investment_portfolio_value NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Savings Products
CREATE TABLE IF NOT EXISTS public.savings_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  minimum_amount NUMERIC(15,2) DEFAULT 0,
  interest_rate NUMERIC(5,2) DEFAULT 0,
  frequency TEXT DEFAULT 'monthly',
  duration_months INTEGER,
  withdrawal_rules TEXT,
  eligibility TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Contributions
CREATE TABLE IF NOT EXISTS public.contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  contribution_month INTEGER NOT NULL,
  contribution_year INTEGER NOT NULL,
  expected_amount NUMERIC(15,2) NOT NULL,
  amount_paid NUMERIC(15,2) DEFAULT 0,
  outstanding_amount NUMERIC(15,2) GENERATED ALWAYS AS (expected_amount - amount_paid) STORED,
  payment_date TIMESTAMPTZ,
  payment_method TEXT,
  transaction_reference TEXT,
  contribution_status public.contribution_status DEFAULT 'unpaid'::public.contribution_status,
  notes TEXT,
  recorded_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Savings Goals
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  goal_name TEXT NOT NULL,
  target_amount NUMERIC(15,2) NOT NULL,
  current_amount NUMERIC(15,2) DEFAULT 0,
  target_date DATE,
  frequency TEXT DEFAULT 'monthly',
  goal_status public.savings_goal_status DEFAULT 'active'::public.savings_goal_status,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Loan Products
CREATE TABLE IF NOT EXISTS public.loan_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  product_code TEXT UNIQUE,
  description TEXT,
  minimum_amount NUMERIC(15,2) DEFAULT 0,
  maximum_amount NUMERIC(15,2),
  interest_rate NUMERIC(5,2) NOT NULL,
  interest_method TEXT DEFAULT 'flat',
  duration_months INTEGER NOT NULL,
  repayment_frequency TEXT DEFAULT 'monthly',
  eligibility_criteria TEXT,
  guarantor_required BOOLEAN DEFAULT false,
  processing_fee_percent NUMERIC(5,2) DEFAULT 0,
  late_payment_penalty NUMERIC(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Loan Applications
CREATE TABLE IF NOT EXISTS public.loan_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  loan_product_id UUID REFERENCES public.loan_products(id),
  requested_amount NUMERIC(15,2) NOT NULL,
  loan_purpose TEXT,
  duration_months INTEGER NOT NULL,
  application_status public.loan_status DEFAULT 'pending'::public.loan_status,
  reviewed_by UUID REFERENCES public.user_profiles(id),
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Loans
CREATE TABLE IF NOT EXISTS public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_number TEXT UNIQUE NOT NULL,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  loan_product_id UUID REFERENCES public.loan_products(id),
  application_id UUID REFERENCES public.loan_applications(id),
  principal NUMERIC(15,2) NOT NULL,
  interest_amount NUMERIC(15,2) NOT NULL,
  total_repayable NUMERIC(15,2) NOT NULL,
  amount_repaid NUMERIC(15,2) DEFAULT 0,
  outstanding_balance NUMERIC(15,2),
  repayment_amount NUMERIC(15,2) NOT NULL,
  repayment_frequency TEXT DEFAULT 'monthly',
  disbursement_date DATE,
  start_date DATE,
  maturity_date DATE,
  next_repayment_date DATE,
  loan_status public.loan_status DEFAULT 'pending'::public.loan_status,
  disbursed_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Loan Repayment Schedules
CREATE TABLE IF NOT EXISTS public.loan_repayment_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE,
  instalment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  expected_amount NUMERIC(15,2) NOT NULL,
  amount_paid NUMERIC(15,2) DEFAULT 0,
  payment_date TIMESTAMPTZ,
  schedule_status public.repayment_status DEFAULT 'upcoming'::public.repayment_status,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Investment Products
CREATE TABLE IF NOT EXISTS public.investment_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  product_code TEXT UNIQUE,
  category TEXT,
  description TEXT,
  minimum_investment NUMERIC(15,2) NOT NULL,
  maximum_investment NUMERIC(15,2),
  duration_months INTEGER NOT NULL,
  projected_return_rate NUMERIC(5,2) NOT NULL,
  return_method TEXT DEFAULT 'simple',
  opening_date DATE,
  closing_date DATE,
  maturity_date DATE,
  risk_information TEXT,
  eligibility TEXT,
  total_capacity NUMERIC(15,2),
  total_subscribed NUMERIC(15,2) DEFAULT 0,
  product_status public.investment_product_status DEFAULT 'draft'::public.investment_product_status,
  terms TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Investments
CREATE TABLE IF NOT EXISTS public.investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_number TEXT UNIQUE NOT NULL,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.investment_products(id),
  amount_invested NUMERIC(15,2) NOT NULL,
  projected_return NUMERIC(15,2),
  actual_return NUMERIC(15,2) DEFAULT 0,
  current_value NUMERIC(15,2),
  investment_date DATE NOT NULL,
  maturity_date DATE,
  investment_status public.investment_status DEFAULT 'pending'::public.investment_status,
  processed_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Transactions (Central Ledger)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_ref TEXT UNIQUE NOT NULL,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  transaction_type public.transaction_type NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  is_debit BOOLEAN NOT NULL DEFAULT true,
  description TEXT NOT NULL,
  payment_method TEXT DEFAULT 'cash',
  related_loan_id UUID REFERENCES public.loans(id) ON DELETE SET NULL,
  related_investment_id UUID REFERENCES public.investments(id) ON DELETE SET NULL,
  related_contribution_id UUID REFERENCES public.contributions(id) ON DELETE SET NULL,
  tx_status public.transaction_status DEFAULT 'completed'::public.transaction_status,
  recorded_by UUID REFERENCES public.user_profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Receipts
CREATE TABLE IF NOT EXISTS public.receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number TEXT UNIQUE NOT NULL,
  transaction_id UUID REFERENCES public.transactions(id),
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  amount NUMERIC(15,2) NOT NULL,
  description TEXT NOT NULL,
  payment_method TEXT,
  issued_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  notification_type public.notification_type DEFAULT 'general'::public.notification_type,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  related_id UUID,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Complaints
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  complaint_status public.complaint_status DEFAULT 'submitted'::public.complaint_status,
  assigned_to UUID REFERENCES public.user_profiles(id),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  user_role TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  previous_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- System Settings
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  updated_by UUID REFERENCES public.user_profiles(id),
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_members_user_id ON public.members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_member_number ON public.members(member_number);
CREATE INDEX IF NOT EXISTS idx_members_status ON public.members(membership_status);
CREATE INDEX IF NOT EXISTS idx_contributions_member_id ON public.contributions(member_id);
CREATE INDEX IF NOT EXISTS idx_contributions_year_month ON public.contributions(contribution_year, contribution_month);
CREATE INDEX IF NOT EXISTS idx_savings_goals_member_id ON public.savings_goals(member_id);
CREATE INDEX IF NOT EXISTS idx_loans_member_id ON public.loans(member_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON public.loans(loan_status);
CREATE INDEX IF NOT EXISTS idx_loan_schedules_loan_id ON public.loan_repayment_schedules(loan_id);
CREATE INDEX IF NOT EXISTS idx_investments_member_id ON public.investments(member_id);
CREATE INDEX IF NOT EXISTS idx_transactions_member_id ON public.transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_transactions_ref ON public.transactions(transaction_ref);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON public.complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- ============================================================
-- 4. FUNCTIONS
-- ============================================================

-- Auto-create user_profiles on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')::public.user_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- Check if user is admin/staff
CREATE OR REPLACE FUNCTION public.is_admin_or_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
  SELECT 1 FROM auth.users au
  WHERE au.id = auth.uid()
  AND (
    au.raw_user_meta_data->>'role' IN ('super_admin', 'admin', 'manager', 'staff')
    OR au.raw_app_meta_data->>'role' IN ('super_admin', 'admin', 'manager', 'staff')
  )
)
$$;

-- Get member_id for current user
CREATE OR REPLACE FUNCTION public.get_my_member_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT id FROM public.members WHERE user_id = auth.uid() LIMIT 1
$$;

-- ============================================================
-- 5. ENABLE RLS
-- ============================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_repayment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. RLS POLICIES
-- ============================================================

-- user_profiles: own row only (Pattern 1 - no function to avoid recursion)
DROP POLICY IF EXISTS "users_manage_own_profile" ON public.user_profiles;
CREATE POLICY "users_manage_own_profile"
ON public.user_profiles FOR ALL TO authenticated
USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- members: own record or admin
DROP POLICY IF EXISTS "members_view_own" ON public.members;
CREATE POLICY "members_view_own"
ON public.members FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin_or_staff());

DROP POLICY IF EXISTS "members_insert_admin" ON public.members;
CREATE POLICY "members_insert_admin"
ON public.members FOR INSERT TO authenticated
WITH CHECK (public.is_admin_or_staff() OR user_id = auth.uid());

DROP POLICY IF EXISTS "members_update_admin" ON public.members;
CREATE POLICY "members_update_admin"
ON public.members FOR UPDATE TO authenticated
USING (public.is_admin_or_staff() OR user_id = auth.uid())
WITH CHECK (public.is_admin_or_staff() OR user_id = auth.uid());

-- savings_products: public read
DROP POLICY IF EXISTS "savings_products_public_read" ON public.savings_products;
CREATE POLICY "savings_products_public_read"
ON public.savings_products FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "savings_products_admin_write" ON public.savings_products;
CREATE POLICY "savings_products_admin_write"
ON public.savings_products FOR ALL TO authenticated
USING (public.is_admin_or_staff()) WITH CHECK (public.is_admin_or_staff());

-- contributions: own or admin
DROP POLICY IF EXISTS "contributions_own_or_admin" ON public.contributions;
CREATE POLICY "contributions_own_or_admin"
ON public.contributions FOR SELECT TO authenticated
USING (member_id = public.get_my_member_id() OR public.is_admin_or_staff());

DROP POLICY IF EXISTS "contributions_admin_write" ON public.contributions;
CREATE POLICY "contributions_admin_write"
ON public.contributions FOR ALL TO authenticated
USING (public.is_admin_or_staff()) WITH CHECK (public.is_admin_or_staff());

-- savings_goals: own or admin
DROP POLICY IF EXISTS "savings_goals_own_or_admin" ON public.savings_goals;
CREATE POLICY "savings_goals_own_or_admin"
ON public.savings_goals FOR ALL TO authenticated
USING (member_id = public.get_my_member_id() OR public.is_admin_or_staff())
WITH CHECK (member_id = public.get_my_member_id() OR public.is_admin_or_staff());

-- loan_products: public read
DROP POLICY IF EXISTS "loan_products_public_read" ON public.loan_products;
CREATE POLICY "loan_products_public_read"
ON public.loan_products FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "loan_products_admin_write" ON public.loan_products;
CREATE POLICY "loan_products_admin_write"
ON public.loan_products FOR ALL TO authenticated
USING (public.is_admin_or_staff()) WITH CHECK (public.is_admin_or_staff());

-- loan_applications: own or admin
DROP POLICY IF EXISTS "loan_apps_own_or_admin" ON public.loan_applications;
CREATE POLICY "loan_apps_own_or_admin"
ON public.loan_applications FOR ALL TO authenticated
USING (member_id = public.get_my_member_id() OR public.is_admin_or_staff())
WITH CHECK (member_id = public.get_my_member_id() OR public.is_admin_or_staff());

-- loans: own or admin
DROP POLICY IF EXISTS "loans_own_or_admin" ON public.loans;
CREATE POLICY "loans_own_or_admin"
ON public.loans FOR SELECT TO authenticated
USING (member_id = public.get_my_member_id() OR public.is_admin_or_staff());

DROP POLICY IF EXISTS "loans_admin_write" ON public.loans;
CREATE POLICY "loans_admin_write"
ON public.loans FOR ALL TO authenticated
USING (public.is_admin_or_staff()) WITH CHECK (public.is_admin_or_staff());

-- loan_repayment_schedules: own or admin
DROP POLICY IF EXISTS "loan_schedules_own_or_admin" ON public.loan_repayment_schedules;
CREATE POLICY "loan_schedules_own_or_admin"
ON public.loan_repayment_schedules FOR SELECT TO authenticated
USING (
  loan_id IN (SELECT id FROM public.loans WHERE member_id = public.get_my_member_id())
  OR public.is_admin_or_staff()
);

DROP POLICY IF EXISTS "loan_schedules_admin_write" ON public.loan_repayment_schedules;
CREATE POLICY "loan_schedules_admin_write"
ON public.loan_repayment_schedules FOR ALL TO authenticated
USING (public.is_admin_or_staff()) WITH CHECK (public.is_admin_or_staff());

-- investment_products: public read
DROP POLICY IF EXISTS "inv_products_public_read" ON public.investment_products;
CREATE POLICY "inv_products_public_read"
ON public.investment_products FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "inv_products_admin_write" ON public.investment_products;
CREATE POLICY "inv_products_admin_write"
ON public.investment_products FOR ALL TO authenticated
USING (public.is_admin_or_staff()) WITH CHECK (public.is_admin_or_staff());

-- investments: own or admin
DROP POLICY IF EXISTS "investments_own_or_admin" ON public.investments;
CREATE POLICY "investments_own_or_admin"
ON public.investments FOR SELECT TO authenticated
USING (member_id = public.get_my_member_id() OR public.is_admin_or_staff());

DROP POLICY IF EXISTS "investments_admin_write" ON public.investments;
CREATE POLICY "investments_admin_write"
ON public.investments FOR ALL TO authenticated
USING (public.is_admin_or_staff()) WITH CHECK (public.is_admin_or_staff());

-- transactions: own or admin
DROP POLICY IF EXISTS "transactions_own_or_admin" ON public.transactions;
CREATE POLICY "transactions_own_or_admin"
ON public.transactions FOR SELECT TO authenticated
USING (member_id = public.get_my_member_id() OR public.is_admin_or_staff());

DROP POLICY IF EXISTS "transactions_admin_write" ON public.transactions;
CREATE POLICY "transactions_admin_write"
ON public.transactions FOR ALL TO authenticated
USING (public.is_admin_or_staff()) WITH CHECK (public.is_admin_or_staff());

-- receipts: own or admin
DROP POLICY IF EXISTS "receipts_own_or_admin" ON public.receipts;
CREATE POLICY "receipts_own_or_admin"
ON public.receipts FOR SELECT TO authenticated
USING (member_id = public.get_my_member_id() OR public.is_admin_or_staff());

DROP POLICY IF EXISTS "receipts_admin_write" ON public.receipts;
CREATE POLICY "receipts_admin_write"
ON public.receipts FOR ALL TO authenticated
USING (public.is_admin_or_staff()) WITH CHECK (public.is_admin_or_staff());

-- notifications: own only
DROP POLICY IF EXISTS "notifications_own" ON public.notifications;
CREATE POLICY "notifications_own"
ON public.notifications FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_admin_insert" ON public.notifications;
CREATE POLICY "notifications_admin_insert"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (public.is_admin_or_staff() OR user_id = auth.uid());

-- complaints: own or admin
DROP POLICY IF EXISTS "complaints_own_or_admin" ON public.complaints;
CREATE POLICY "complaints_own_or_admin"
ON public.complaints FOR ALL TO authenticated
USING (user_id = auth.uid() OR public.is_admin_or_staff())
WITH CHECK (user_id = auth.uid() OR public.is_admin_or_staff());

-- audit_logs: admin only
DROP POLICY IF EXISTS "audit_logs_admin_read" ON public.audit_logs;
CREATE POLICY "audit_logs_admin_read"
ON public.audit_logs FOR SELECT TO authenticated
USING (public.is_admin_or_staff());

DROP POLICY IF EXISTS "audit_logs_insert_authenticated" ON public.audit_logs;
CREATE POLICY "audit_logs_insert_authenticated"
ON public.audit_logs FOR INSERT TO authenticated
WITH CHECK (true);

-- system_settings: admin only
DROP POLICY IF EXISTS "system_settings_admin" ON public.system_settings;
CREATE POLICY "system_settings_admin"
ON public.system_settings FOR ALL TO authenticated
USING (public.is_admin_or_staff()) WITH CHECK (public.is_admin_or_staff());

-- ============================================================
-- 7. TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS members_updated_at ON public.members;
CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS loans_updated_at ON public.loans;
CREATE TRIGGER loans_updated_at
  BEFORE UPDATE ON public.loans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS investments_updated_at ON public.investments;
CREATE TRIGGER investments_updated_at
  BEFORE UPDATE ON public.investments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS contributions_updated_at ON public.contributions;
CREATE TRIGGER contributions_updated_at
  BEFORE UPDATE ON public.contributions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 8. MOCK / SEED DATA
-- ============================================================

DO $$
DECLARE
  admin_uuid UUID := gen_random_uuid();
  member_uuid UUID := gen_random_uuid();
  manager_uuid UUID := gen_random_uuid();
  staff_uuid UUID := gen_random_uuid();
  member2_uuid UUID := gen_random_uuid();
  member3_uuid UUID := gen_random_uuid();

  member_row_id UUID;
  member2_row_id UUID;
  member3_row_id UUID;

  loan_product_id UUID;
  inv_product1_id UUID;
  inv_product2_id UUID;
  savings_product_id UUID;

  loan1_id UUID := gen_random_uuid();
  inv1_id UUID := gen_random_uuid();
  inv2_id UUID := gen_random_uuid();
BEGIN

  -- ---- Auth Users ----
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at, email_change_token_new, email_change,
    email_change_sent_at, email_change_token_current, email_change_confirm_status,
    reauthentication_token, reauthentication_sent_at, phone, phone_change,
    phone_change_token, phone_change_sent_at
  ) VALUES
    (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'admin@climps.ng', crypt('Admin@2026!', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Chukwuemeka Adeyemi', 'role', 'admin'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),

    (member_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'adaeze.okonkwo@climps.ng', crypt('Member@2026!', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Adaeze Okonkwo', 'role', 'member'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),

    (manager_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'manager.ibrahim@climps.ng', crypt('Manager@2026!', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Ibrahim Musa', 'role', 'manager'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),

    (staff_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'staff.ngozi@climps.ng', crypt('Staff@2026!', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Ngozi Eze', 'role', 'staff'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),

    (member2_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'emeka.nwosu@climps.ng', crypt('Member@2026!', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Emeka Nwosu', 'role', 'member'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),

    (member3_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'fatima.bello@climps.ng', crypt('Member@2026!', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Fatima Bello', 'role', 'member'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null)
  ON CONFLICT (id) DO NOTHING;

  -- ---- Members ----
  member_row_id := gen_random_uuid();
  member2_row_id := gen_random_uuid();
  member3_row_id := gen_random_uuid();

  INSERT INTO public.members (
    id, user_id, member_number, first_name, last_name, gender, date_of_birth,
    phone, email, address, state, lga, occupation, employer,
    nok_name, nok_relationship, nok_phone,
    membership_status, membership_date, monthly_contribution_amount,
    total_savings, total_contributions, active_loan_balance, investment_portfolio_value
  ) VALUES
    (member_row_id, member_uuid, 'CLMV/2026/0047', 'Adaeze', 'Okonkwo', 'female', '1990-03-15',
     '08012345678', 'adaeze.okonkwo@climps.ng', '12 Adeola Odeku Street, Victoria Island', 'Lagos', 'Eti-Osa',
     'Software Engineer', 'TechCorp Nigeria Ltd',
     'Emeka Okonkwo', 'spouse', '08098765432',
     'active'::public.membership_status, '2024-01-15', 10000,
     847250, 120000, 412500, 650000),

    (member2_row_id, member2_uuid, 'CLMV/2026/0048', 'Emeka', 'Nwosu', 'male', '1985-07-22',
     '08023456789', 'emeka.nwosu@climps.ng', '45 Awolowo Road, Ikoyi', 'Lagos', 'Lagos Island',
     'Accountant', 'First Bank Nigeria',
     'Chioma Nwosu', 'spouse', '08034567890',
     'active'::public.membership_status, '2024-02-01', 15000,
     520000, 180000, 0, 300000),

    (member3_row_id, member3_uuid, 'CLMV/2026/0049', 'Fatima', 'Bello', 'female', '1992-11-08',
     '08045678901', 'fatima.bello@climps.ng', '7 Maitama Close, Abuja', 'FCT', 'Abuja Municipal',
     'Civil Servant', 'Federal Ministry of Finance',
     'Abubakar Bello', 'sibling', '08056789012',
     'active'::public.membership_status, '2024-03-10', 10000,
     310000, 90000, 150000, 200000)
  ON CONFLICT (id) DO NOTHING;

  -- ---- Savings Products ----
  savings_product_id := gen_random_uuid();
  INSERT INTO public.savings_products (id, name, description, minimum_amount, interest_rate, frequency, duration_months, withdrawal_rules, eligibility, is_active)
  VALUES
    (savings_product_id, 'Monthly Cooperative Contribution', 'Mandatory monthly contribution for all cooperative members', 5000, 0, 'monthly', NULL, 'Withdrawal subject to board approval', 'Active cooperative members only', true),
    (gen_random_uuid(), 'Regular Savings', 'Flexible voluntary savings with competitive returns', 1000, 5.5, 'monthly', NULL, 'Withdrawal after 30 days notice', 'All members', true),
    (gen_random_uuid(), 'Target Savings', 'Goal-based savings for specific financial objectives', 2000, 6.0, 'monthly', 12, 'Withdrawal at target date or goal completion', 'All members', true),
    (gen_random_uuid(), 'Emergency Savings', 'Quick-access savings for unexpected needs', 500, 3.5, 'monthly', NULL, 'Withdrawal within 48 hours', 'All members', true),
    (gen_random_uuid(), 'Business Savings', 'Dedicated savings for business capital accumulation', 5000, 7.0, 'monthly', 24, 'Withdrawal after 6 months', 'Members with registered businesses', true)
  ON CONFLICT (id) DO NOTHING;

  -- ---- Loan Products ----
  loan_product_id := gen_random_uuid();
  INSERT INTO public.loan_products (id, name, product_code, description, minimum_amount, maximum_amount, interest_rate, interest_method, duration_months, repayment_frequency, eligibility_criteria, guarantor_required, processing_fee_percent, is_active)
  VALUES
    (loan_product_id, 'Personal Loan', 'LP/PERSONAL/001', 'General purpose personal loan for members', 50000, 2000000, 2.5, 'flat', 12, 'monthly', 'Active member for at least 6 months, consistent contributions', true, 1.0, true),
    (gen_random_uuid(), 'Emergency Loan', 'LP/EMERGENCY/001', 'Quick disbursement for urgent financial needs', 10000, 500000, 2.0, 'flat', 6, 'monthly', 'Active member, no outstanding overdue loans', false, 0.5, true),
    (gen_random_uuid(), 'Business Loan', 'LP/BUSINESS/001', 'Capital loan for business expansion and development', 100000, 5000000, 3.0, 'flat', 24, 'monthly', 'Active member for at least 12 months, business documentation required', true, 1.5, true),
    (gen_random_uuid(), 'Salary Loan', 'LP/SALARY/001', 'Salary advance loan for employed members', 20000, 1000000, 1.5, 'flat', 12, 'monthly', 'Employed member with salary domiciliation', false, 0.5, true)
  ON CONFLICT (id) DO NOTHING;

  -- ---- Investment Products ----
  inv_product1_id := gen_random_uuid();
  inv_product2_id := gen_random_uuid();
  INSERT INTO public.investment_products (id, name, product_code, category, description, minimum_investment, maximum_investment, duration_months, projected_return_rate, return_method, opening_date, closing_date, maturity_date, risk_information, total_capacity, total_subscribed, product_status)
  VALUES
    (inv_product1_id, 'Agro Fund I', 'INV/AGRO/001', 'Agriculture', 'Investment in cooperative agricultural ventures with projected returns', 50000, 5000000, 12, 11.5, 'simple', '2026-01-01', '2026-03-31', '2027-01-01', 'Medium risk. Returns are projected and not guaranteed.', 50000000, 32000000, 'open'::public.investment_product_status),
    (inv_product2_id, 'Fixed Income Bond II', 'INV/BOND/002', 'Fixed Income', 'Cooperative fixed income bond with stable projected returns', 100000, 10000000, 18, 13.0, 'simple', '2026-02-01', '2026-04-30', '2027-08-01', 'Low-medium risk. Returns are projected and not guaranteed.', 100000000, 48000000, 'open'::public.investment_product_status),
    (gen_random_uuid(), 'Real Estate Fund I', 'INV/REALTY/001', 'Real Estate', 'Cooperative real estate investment fund', 200000, NULL, 24, 15.0, 'compound', '2026-06-01', '2026-08-31', '2028-06-01', 'Medium-high risk. Returns are projected and not guaranteed.', 200000000, 0, 'draft'::public.investment_product_status)
  ON CONFLICT (id) DO NOTHING;

  -- ---- Contributions for member 1 ----
  INSERT INTO public.contributions (id, member_id, contribution_month, contribution_year, expected_amount, amount_paid, payment_date, payment_method, transaction_reference, contribution_status)
  VALUES
    (gen_random_uuid(), member_row_id, 9, 2026, 10000, 10000, '2026-09-04 10:30:00+01', 'bank_transfer', 'TXN/2026/004821', 'paid'::public.contribution_status),
    (gen_random_uuid(), member_row_id, 8, 2026, 10000, 10000, '2026-08-02 09:15:00+01', 'bank_transfer', 'TXN/2026/004088', 'paid'::public.contribution_status),
    (gen_random_uuid(), member_row_id, 7, 2026, 10000, 10000, '2026-07-03 11:00:00+01', 'bank_transfer', 'TXN/2026/003650', 'paid'::public.contribution_status),
    (gen_random_uuid(), member_row_id, 6, 2026, 10000, 10000, '2026-06-05 10:00:00+01', 'bank_transfer', 'TXN/2026/003100', 'paid'::public.contribution_status)
  ON CONFLICT (id) DO NOTHING;

  -- ---- Savings Goals for member 1 ----
  INSERT INTO public.savings_goals (id, member_id, goal_name, target_amount, current_amount, target_date, frequency, goal_status)
  VALUES
    (gen_random_uuid(), member_row_id, 'School Fees 2027', 450000, 285000, '2027-01-15', 'monthly', 'active'::public.savings_goal_status),
    (gen_random_uuid(), member_row_id, 'Emergency Fund', 200000, 200000, '2026-06-01', 'monthly', 'completed'::public.savings_goal_status),
    (gen_random_uuid(), member_row_id, 'Business Capital', 1000000, 320000, '2027-12-31', 'monthly', 'active'::public.savings_goal_status)
  ON CONFLICT (id) DO NOTHING;

  -- ---- Loan for member 1 ----
  INSERT INTO public.loans (id, loan_number, member_id, loan_product_id, principal, interest_amount, total_repayable, amount_repaid, outstanding_balance, repayment_amount, repayment_frequency, disbursement_date, start_date, maturity_date, next_repayment_date, loan_status)
  VALUES
    (loan1_id, 'LN/2026/00001', member_row_id, loan_product_id, 550000, 137500, 687500, 275000, 412500, 57291.67, 'monthly', '2026-03-01', '2026-03-25', '2027-03-25', '2026-09-25', 'active'::public.loan_status)
  ON CONFLICT (id) DO NOTHING;

  -- ---- Loan Repayment Schedule ----
  INSERT INTO public.loan_repayment_schedules (id, loan_id, instalment_number, due_date, expected_amount, amount_paid, payment_date, schedule_status)
  VALUES
    (gen_random_uuid(), loan1_id, 1, '2026-04-25', 57291.67, 57291.67, '2026-04-24', 'paid'::public.repayment_status),
    (gen_random_uuid(), loan1_id, 2, '2026-05-25', 57291.67, 57291.67, '2026-05-23', 'paid'::public.repayment_status),
    (gen_random_uuid(), loan1_id, 3, '2026-06-25', 57291.67, 57291.67, '2026-06-25', 'paid'::public.repayment_status),
    (gen_random_uuid(), loan1_id, 4, '2026-07-25', 57291.67, 57291.67, '2026-07-24', 'paid'::public.repayment_status),
    (gen_random_uuid(), loan1_id, 5, '2026-08-25', 57291.67, 57291.67, '2026-08-25', 'paid'::public.repayment_status),
    (gen_random_uuid(), loan1_id, 6, '2026-09-25', 57291.67, 0, NULL, 'upcoming'::public.repayment_status),
    (gen_random_uuid(), loan1_id, 7, '2026-10-25', 57291.67, 0, NULL, 'upcoming'::public.repayment_status),
    (gen_random_uuid(), loan1_id, 8, '2026-11-25', 57291.67, 0, NULL, 'upcoming'::public.repayment_status),
    (gen_random_uuid(), loan1_id, 9, '2026-12-25', 57291.67, 0, NULL, 'upcoming'::public.repayment_status),
    (gen_random_uuid(), loan1_id, 10, '2027-01-25', 57291.67, 0, NULL, 'upcoming'::public.repayment_status),
    (gen_random_uuid(), loan1_id, 11, '2027-02-25', 57291.67, 0, NULL, 'upcoming'::public.repayment_status),
    (gen_random_uuid(), loan1_id, 12, '2027-03-25', 57291.63, 0, NULL, 'upcoming'::public.repayment_status)
  ON CONFLICT (id) DO NOTHING;

  -- ---- Investments for member 1 ----
  INSERT INTO public.investments (id, investment_number, member_id, product_id, amount_invested, projected_return, actual_return, current_value, investment_date, maturity_date, investment_status)
  VALUES
    (inv1_id, 'INV/2026/00001', member_row_id, inv_product1_id, 200000, 23000, 0, 200000, '2026-02-15', '2027-02-15', 'active'::public.investment_status),
    (inv2_id, 'INV/2026/00002', member_row_id, inv_product2_id, 450000, 58500, 0, 450000, '2026-03-01', '2027-09-01', 'active'::public.investment_status)
  ON CONFLICT (id) DO NOTHING;

  -- ---- Transactions for member 1 ----
  INSERT INTO public.transactions (id, transaction_ref, member_id, transaction_type, amount, is_debit, description, payment_method, related_loan_id, related_investment_id, tx_status, created_at)
  VALUES
    (gen_random_uuid(), 'TXN/2026/004821', member_row_id, 'contribution'::public.transaction_type, 10000, true, 'Sep 2026 Cooperative Contribution', 'bank_transfer', NULL, NULL, 'completed'::public.transaction_status, '2026-09-04 10:30:00+01'),
    (gen_random_uuid(), 'TXN/2026/004690', member_row_id, 'savings_deposit'::public.transaction_type, 15000, true, 'Regular Savings Deposit', 'bank_transfer', NULL, NULL, 'completed'::public.transaction_status, '2026-09-18 14:00:00+01'),
    (gen_random_uuid(), 'TXN/2026/004512', member_row_id, 'loan_repayment'::public.transaction_type, 57291.67, true, 'Personal Loan Repayment - Instalment #5', 'bank_transfer', loan1_id, NULL, 'completed'::public.transaction_status, '2026-08-25 09:00:00+01'),
    (gen_random_uuid(), 'TXN/2026/004201', member_row_id, 'investment_return'::public.transaction_type, 24000, false, 'Agro Fund I - Investment Return', 'bank_transfer', NULL, inv1_id, 'completed'::public.transaction_status, '2026-08-15 11:00:00+01'),
    (gen_random_uuid(), 'TXN/2026/004088', member_row_id, 'contribution'::public.transaction_type, 10000, true, 'Aug 2026 Cooperative Contribution', 'bank_transfer', NULL, NULL, 'completed'::public.transaction_status, '2026-08-02 09:15:00+01'),
    (gen_random_uuid(), 'TXN/2026/003950', member_row_id, 'savings_deposit'::public.transaction_type, 20000, true, 'Target Savings Deposit - Education', 'bank_transfer', NULL, NULL, 'completed'::public.transaction_status, '2026-07-20 10:00:00+01'),
    (gen_random_uuid(), 'TXN/2026/003812', member_row_id, 'loan_repayment'::public.transaction_type, 57291.67, true, 'Personal Loan Repayment - Instalment #4', 'bank_transfer', loan1_id, NULL, 'completed'::public.transaction_status, '2026-07-24 09:00:00+01'),
    (gen_random_uuid(), 'TXN/2026/003650', member_row_id, 'investment_subscription'::public.transaction_type, 450000, true, 'Fixed Income Bond II - Subscription', 'bank_transfer', NULL, inv2_id, 'completed'::public.transaction_status, '2026-07-10 14:00:00+01')
  ON CONFLICT (transaction_ref) DO NOTHING;

  -- ---- Notifications for member 1 ----
  INSERT INTO public.notifications (id, user_id, notification_type, title, message, is_read, created_at)
  VALUES
    (gen_random_uuid(), member_uuid, 'loan_repayment_due'::public.notification_type, 'Loan Repayment Due', 'Your loan repayment of ₦57,291.67 is due on 25 Sep 2026. Please ensure funds are available.', false, '2026-09-18 08:00:00+01'),
    (gen_random_uuid(), member_uuid, 'contribution_due'::public.notification_type, 'October Contribution Reminder', 'Your October 2026 cooperative contribution of ₦10,000 will be due on 1 Oct 2026.', false, '2026-09-20 08:00:00+01'),
    (gen_random_uuid(), member_uuid, 'new_investment'::public.notification_type, 'New Investment Opportunity', 'Real Estate Fund I is now open for subscription. Minimum investment: ₦200,000. Projected return: 15%.', false, '2026-09-15 10:00:00+01'),
    (gen_random_uuid(), member_uuid, 'payment_received'::public.notification_type, 'Payment Confirmed', 'Your September 2026 contribution of ₦10,000 has been received and confirmed.', true, '2026-09-04 11:00:00+01')
  ON CONFLICT (id) DO NOTHING;

  -- ---- System Settings ----
  INSERT INTO public.system_settings (id, setting_key, setting_value, description)
  VALUES
    (gen_random_uuid(), 'default_monthly_contribution', '10000', 'Default monthly contribution amount in Naira'),
    (gen_random_uuid(), 'contribution_due_day', '5', 'Day of month when contributions are due'),
    (gen_random_uuid(), 'grace_period_days', '7', 'Grace period in days before contribution is marked overdue'),
    (gen_random_uuid(), 'late_payment_penalty_percent', '2', 'Late payment penalty as percentage of outstanding amount'),
    (gen_random_uuid(), 'currency', 'NGN', 'Platform currency'),
    (gen_random_uuid(), 'currency_symbol', '₦', 'Currency display symbol'),
    (gen_random_uuid(), 'cooperative_name', 'Changing Lives Multipurpose Ventures', 'Full cooperative name'),
    (gen_random_uuid(), 'platform_name', 'CLIMPS', 'Platform short name')
  ON CONFLICT (setting_key) DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Mock data insertion error: %', SQLERRM;
END $$;
