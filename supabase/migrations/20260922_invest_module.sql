-- =====================================================
-- CLIMPS INVEST Module — Database Migration
-- Run this in the Supabase SQL Editor
-- =====================================================

-- ── 1. Investment Products Table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS investment_products (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  text NOT NULL,
  product_code          text NOT NULL UNIQUE,
  category              text NOT NULL,
  tagline               text,
  description           text NOT NULL,
  minimum_investment    numeric NOT NULL DEFAULT 0 CHECK (minimum_investment >= 0),
  maximum_investment    numeric CHECK (maximum_investment IS NULL OR maximum_investment >= minimum_investment),
  duration_months       int NOT NULL CHECK (duration_months > 0),
  projected_return_rate numeric NOT NULL CHECK (projected_return_rate >= 0), -- annual % (e.g. 16.5 = 16.5% p.a.)
  return_method         text NOT NULL DEFAULT 'Simple Annual Return',
  opening_date          date NOT NULL DEFAULT CURRENT_DATE,
  closing_date          date,
  maturity_date         date,
  risk_level            text NOT NULL DEFAULT 'Low' CHECK (risk_level IN ('Low', 'Low–Medium', 'Medium', 'Medium–High', 'High')),
  risk_information      text,
  eligibility           text DEFAULT 'All active cooperative members',
  total_capacity        numeric NOT NULL DEFAULT 0,
  total_subscribed      numeric NOT NULL DEFAULT 0 CHECK (total_subscribed >= 0),
  product_status        text NOT NULL DEFAULT 'open' CHECK (product_status IN ('draft', 'open', 'fully_subscribed', 'closed', 'matured', 'suspended')),
  is_guaranteed         boolean NOT NULL DEFAULT false,
  terms                 text[],
  benefits              text[],
  is_active             boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- Seed Default Investment Products
INSERT INTO investment_products (
  name, product_code, category, tagline, description, minimum_investment, maximum_investment,
  duration_months, projected_return_rate, return_method, opening_date, closing_date, maturity_date,
  risk_level, total_capacity, total_subscribed, product_status, is_guaranteed
) VALUES
  (
    'Cooperative Equity Shares', 'INV-SHR-2026', 'Equity & Shares', 'Own a piece. Earn annual dividends.',
    'Purchase shares in CLIMPS Cooperative and earn annual dividends from the society net trading surplus.',
    25000, 5000000, 12, 16.5, 'Annual AGM Surplus Dividend', '2026-01-15', '2026-11-30', '2026-12-31',
    'Low', 50000000, 36500000, 'open', false
  ),
  (
    'Fixed Income Investment Plan', 'INV-FIX-2026', 'Fixed Income', 'Predictable returns. Contractually protected.',
    'Commit a lump sum for a defined duration and lock in guaranteed contractual returns paid at maturity or monthly.',
    50000, 10000000, 12, 15.0, 'Fixed Contractual Return', '2026-01-01', '2026-12-31', '2027-01-01',
    'Low', 100000000, 82000000, 'open', true
  ),
  (
    'Real Estate Growth Fund', 'INV-REF-2026', 'Real Estate', 'Commercial property wealth. Shared rental yield.',
    'Pool capital with cooperative investors into titled residential estates, shopping plazas, and land banking.',
    100000, 25000000, 24, 20.0, 'Semi-annual Rental Yield + Exit Gain', '2026-02-01', '2026-10-31', '2028-02-01',
    'Medium', 75000000, 54000000, 'open', false
  ),
  (
    'Agro-Ventures Cycle Note', 'INV-AGR-2026', 'Agriculture', 'Farm the future. Harvest predictable yields.',
    'Finance cooperative agro-processing, poultry, and grain farming cycles with NAIC comprehensive agricultural insurance.',
    50000, 5000000, 9, 22.0, 'Harvest Cycle Surplus', '2026-03-01', '2026-08-31', '2026-12-15',
    'Medium–High', 40000000, 38000000, 'open', false
  ),
  (
    'SME Commercial Credit Fund', 'INV-SME-2026', 'SME Lending', 'Fuel local enterprise. Share in cashflow profits.',
    'Co-fund short-term working capital loans to verified cooperative merchant traders and supply chain vendors.',
    75000, 15000000, 12, 18.0, 'Quarterly Profit Sharing', '2026-01-01', '2026-11-15', '2027-01-15',
    'Medium', 60000000, 60000000, 'fully_subscribed', false
  ),
  (
    'Sovereign Treasury Notes', 'INV-TBY-2026', 'Government Securities', 'Zero default risk. Institutional yields.',
    'Gain institutional access to Nigerian Treasury Bills and FGN Bonds pooled by CLIMPS investment desk.',
    20000, 20000000, 12, 14.5, 'Discounted Upfront or Maturity Yield', '2026-01-01', '2026-12-31', '2027-01-01',
    'Low', 150000000, 98000000, 'open', true
  )
ON CONFLICT (product_code) DO NOTHING;


-- ── 2. Member Investments Holdings Table ──────────────────────────────────
CREATE TABLE IF NOT EXISTS investments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_number text NOT NULL UNIQUE,      -- e.g. "INV/2026/00001"
  member_id         uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  product_id        uuid REFERENCES investment_products(id) ON DELETE SET NULL,
  amount_invested   numeric NOT NULL CHECK (amount_invested > 0),
  projected_return  numeric NOT NULL DEFAULT 0,
  actual_return     numeric NOT NULL DEFAULT 0,
  current_value     numeric NOT NULL DEFAULT 0,
  investment_date   date NOT NULL DEFAULT CURRENT_DATE,
  maturity_date     date,
  investment_status text NOT NULL DEFAULT 'active' CHECK (investment_status IN ('pending', 'active', 'matured', 'cancelled')),
  certificate_url   text,
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_investments_member ON investments(member_id);
CREATE INDEX IF NOT EXISTS idx_investments_product ON investments(product_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(investment_status);


-- ── 3. Investment Subscriptions (Application / Verification Queue) ─────────
CREATE TABLE IF NOT EXISTS investment_subscriptions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number      text NOT NULL UNIQUE,  -- e.g. "INV/2026/00001"
  member_id             uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  product_id            uuid NOT NULL REFERENCES investment_products(id) ON DELETE RESTRICT,
  amount                numeric NOT NULL CHECK (amount > 0),
  payment_method        text NOT NULL,         -- 'bank_transfer' | 'savings_wallet' | 'card'
  transaction_reference text,
  terms_accepted        boolean NOT NULL DEFAULT false,
  risk_acknowledged     boolean NOT NULL DEFAULT false,
  subscription_status   text NOT NULL DEFAULT 'pending' CHECK (subscription_status IN ('pending', 'verified', 'rejected')),
  verified_by           uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at           timestamptz,
  notes                 text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_member ON investment_subscriptions(member_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON investment_subscriptions(subscription_status);


-- ── 4. Row Level Security ─────────────────────────────────────────────────
ALTER TABLE investment_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_subscriptions ENABLE ROW LEVEL SECURITY;

-- Anyone can view open/active investment products
CREATE POLICY "Public can view active investment products"
  ON investment_products FOR SELECT
  USING (is_active = true);

-- Admins can manage investment products
CREATE POLICY "Admins can manage investment_products"
  ON investment_products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
        AND (u.raw_user_meta_data->>'role') IN ('admin', 'super_admin', 'manager', 'staff')
    )
  );

-- Members can see their own investments
CREATE POLICY "Members view own investments"
  ON investments FOR SELECT
  USING (
    member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

-- Admins can view and manage all investments
CREATE POLICY "Admins manage all investments"
  ON investments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
        AND (u.raw_user_meta_data->>'role') IN ('admin', 'super_admin', 'manager', 'staff')
    )
  );

-- Members can submit and view their own subscriptions
CREATE POLICY "Members manage own subscriptions"
  ON investment_subscriptions FOR ALL
  USING (
    member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

-- Admins manage all subscriptions
CREATE POLICY "Admins manage all subscriptions"
  ON investment_subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
        AND (u.raw_user_meta_data->>'role') IN ('admin', 'super_admin', 'manager', 'staff')
    )
  );
