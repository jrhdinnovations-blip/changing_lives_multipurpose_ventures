-- ============================================================
-- CLIMPS: Streamline Savings Products to Monthly Contribution & Regular Savings
-- ============================================================

-- Ensure the check constraint on savings_products allows only core categories or deactivates others
UPDATE savings_products
SET is_active = false
WHERE category NOT IN ('monthly_contribution', 'regular_savings');

-- Ensure Monthly Contribution exists with correct cooperative parameters
INSERT INTO savings_products (
  name,
  category,
  description,
  min_contribution,
  contribution_frequency,
  interest_rate,
  duration,
  withdrawal_rules,
  eligibility,
  benefits,
  terms,
  is_active,
  is_mandatory,
  sort_order
) VALUES (
  'Monthly Cooperative Contribution',
  'monthly_contribution',
  'Core mandatory monthly thrift contribution for all verified cooperative members. Builds equity, determines loan eligibility multiples, and accrues annual dividends.',
  5000,
  'monthly',
  9.0,
  '12 – 60 months',
  'Withdrawal upon membership tenure completion (min 12 months); early voluntary exit subject to cooperative by-law notice and 2% administrative charge.',
  'All verified cooperative members',
  ARRAY[
    'Determines 200%–300% credit and loan multiplier',
    'Earns annual cooperative dividend share',
    'Automated monthly deductions & reminders',
    'Official monthly statements and financial certificates'
  ],
  'Contributions are due by the 5th of every month. Minimum ₦5,000 monthly commitment.',
  true,
  true,
  1
)
ON CONFLICT (id) DO NOTHING;

-- Ensure Regular Savings exists with flexible parameters
INSERT INTO savings_products (
  name,
  category,
  description,
  min_contribution,
  contribution_frequency,
  interest_rate,
  duration,
  withdrawal_rules,
  eligibility,
  benefits,
  terms,
  is_active,
  is_mandatory,
  sort_order
) VALUES (
  'Regular Savings Account',
  'regular_savings',
  'Flexible, voluntary liquid savings account. Deposit surplus funds at your convenience and access cash on demand while earning competitive quarterly compound interest.',
  1000,
  'monthly',
  7.0,
  'Flexible / No fixed term',
  'Withdraw up to 2× per calendar month without penalty; minimum retained account balance is ₦500.',
  'All registered members & savers',
  ARRAY[
    'Zero lock-in period — full liquidity',
    'Competitive 7.0% p.a. interest credited quarterly',
    'Instant deposits via Bank Transfer, Card, or USSD',
    'Up to 2 free withdrawals monthly with instant settlement'
  ],
  'Minimum opening balance of ₦1,000. Minimum operating balance of ₦500.',
  true,
  false,
  2
)
ON CONFLICT (id) DO NOTHING;
