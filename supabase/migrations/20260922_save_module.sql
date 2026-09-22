-- =====================================================
-- CLIMPS SAVE Module — Database Migration
-- Run this in the Supabase SQL Editor
-- =====================================================

-- ── 1. Savings Products (admin-configurable) ──────────────────────────────
CREATE TABLE IF NOT EXISTS savings_products (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  category        text NOT NULL CHECK (category IN (
                    'monthly_contribution', 'regular_savings', 'target_savings',
                    'emergency_savings', 'business_savings', 'education_savings',
                    'special_purpose', 'fixed_deposit', 'daily_thrift'
                  )),
  description     text,
  min_contribution numeric NOT NULL DEFAULT 0,
  contribution_frequency text,                -- 'daily' | 'weekly' | 'monthly' | 'yearly'
  interest_rate   numeric,                    -- annual % (e.g. 9.5 = 9.5% p.a.)
  duration        text,                       -- human readable, e.g. "12 – 60 months"
  withdrawal_rules text,
  eligibility     text,
  benefits        text[],
  terms           text,
  is_active       boolean NOT NULL DEFAULT true,
  is_mandatory    boolean NOT NULL DEFAULT false,
  sort_order      int NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Seed default products
INSERT INTO savings_products (name, category, description, min_contribution, contribution_frequency, interest_rate, duration, withdrawal_rules, is_mandatory, sort_order) VALUES
  ('Monthly Cooperative Contribution', 'monthly_contribution', 'Core mandatory contribution for all active members.', 5000, 'monthly', 9.0, '12 – 60 months', 'Withdraw after 12 months; early exit incurs 2% penalty', true, 1),
  ('Regular Savings', 'regular_savings', 'Flexible voluntary savings with no lock-in period.', 1000, 'monthly', 7.0, 'No fixed term', 'Withdraw up to 2× per month; minimum balance ₦500', false, 2),
  ('Goal Savings', 'target_savings', 'Save toward a specific personal financial target.', 2000, 'monthly', 10.0, '3 – 36 months', 'Full withdrawal on goal date; partial after 50% reached', false, 3),
  ('Emergency Savings', 'emergency_savings', 'A dedicated safety net with instant, penalty-free access.', 3000, 'monthly', 8.0, 'Ongoing', 'Unlimited withdrawals; no penalty', false, 4),
  ('Business Savings', 'business_savings', 'Build business capital and unlock preferential loan rates.', 10000, 'monthly', 11.0, '6 – 48 months', 'Quarterly withdrawal; early exit requires 30-day notice', false, 5),
  ('Education Savings', 'education_savings', 'Save for school fees, tuition, or certifications.', 2500, 'monthly', 10.5, '6 – 60 months', 'Withdrawal tied to academic calendar', false, 6),
  ('Fixed Deposit', 'fixed_deposit', 'Highest guaranteed interest rate in the portfolio.', 100000, 'monthly', 12.0, '6 – 24 months', 'No withdrawal before maturity; early exit forfeits interest', false, 7),
  ('Daily Thrift Savings', 'daily_thrift', 'Save as little as ₦500/day — ideal for daily income earners.', 500, 'daily', 8.0, 'Flexible', 'Withdraw anytime after 90 days', false, 8)
ON CONFLICT DO NOTHING;


-- ── 2. Member Savings Accounts ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS savings_accounts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  product_id      uuid REFERENCES savings_products(id) ON DELETE SET NULL,
  account_number  text NOT NULL UNIQUE,
  balance         numeric NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_deposited numeric NOT NULL DEFAULT 0,
  total_withdrawn numeric NOT NULL DEFAULT 0,
  status          text NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'closed', 'suspended', 'pending')),
  opened_at       timestamptz NOT NULL DEFAULT now(),
  closed_at       timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);


-- ── 3. Savings Enrollments (pending applications before account setup) ────
CREATE TABLE IF NOT EXISTS savings_enrollments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  product_id      uuid REFERENCES savings_products(id) ON DELETE SET NULL,
  amount          numeric NOT NULL,
  frequency       text NOT NULL,               -- 'daily' | 'weekly' | 'monthly'
  start_date      date,
  terms_accepted  boolean NOT NULL DEFAULT false,
  status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  notes           text,
  reviewed_by     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);


-- ── 4. Contributions (if table not yet created) ───────────────────────────
-- NOTE: If the contributions table already exists, skip this block.
CREATE TABLE IF NOT EXISTS contributions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id             uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  contribution_month    int NOT NULL CHECK (contribution_month BETWEEN 1 AND 12),
  contribution_year     int NOT NULL,
  expected_amount       numeric NOT NULL DEFAULT 0,
  amount_paid           numeric NOT NULL DEFAULT 0,
  outstanding_amount    numeric GENERATED ALWAYS AS (expected_amount - amount_paid) STORED,
  payment_date          date,
  payment_method        text,
  transaction_reference text,
  contribution_status   text NOT NULL DEFAULT 'unpaid'
                          CHECK (contribution_status IN ('paid', 'partially_paid', 'unpaid', 'overdue')),
  notes                 text,
  recorded_by           uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (member_id, contribution_month, contribution_year)
);


-- ── 5. Savings Goals (if table not yet created) ───────────────────────────
CREATE TABLE IF NOT EXISTS savings_goals (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id     uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  goal_name     text NOT NULL,
  category      text,
  target_amount numeric NOT NULL CHECK (target_amount > 0),
  current_amount numeric NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  target_date   date,
  frequency     text,                          -- contribution frequency
  goal_status   text NOT NULL DEFAULT 'active'
                  CHECK (goal_status IN ('active', 'completed', 'paused', 'cancelled')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);


-- ── 6. Row Level Security ─────────────────────────────────────────────────
-- Enable RLS on all new tables
ALTER TABLE savings_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

-- Public read access to active savings products (for marketing pages)
CREATE POLICY "Public can view active savings products"
  ON savings_products FOR SELECT
  USING (is_active = true);

-- Admins can manage savings products
CREATE POLICY "Admins can manage savings_products"
  ON savings_products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
        AND (u.raw_user_meta_data->>'role') IN ('admin', 'super_admin', 'manager', 'staff')
    )
  );

-- Members can see their own savings accounts
CREATE POLICY "Members view own savings accounts"
  ON savings_accounts FOR SELECT
  USING (
    member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

-- Members view own contributions
CREATE POLICY "Members view own contributions"
  ON contributions FOR SELECT
  USING (
    member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

-- Staff/admin manage contributions
CREATE POLICY "Staff manage contributions"
  ON contributions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
        AND (u.raw_user_meta_data->>'role') IN ('admin', 'super_admin', 'manager', 'staff')
    )
  );

-- Members manage own savings goals
CREATE POLICY "Members manage own goals"
  ON savings_goals FOR ALL
  USING (
    member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

-- Members manage own enrollments
CREATE POLICY "Members manage own enrollments"
  ON savings_enrollments FOR ALL
  USING (
    member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );
