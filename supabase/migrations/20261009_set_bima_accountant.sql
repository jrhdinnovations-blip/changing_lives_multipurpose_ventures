-- ==============================================================================
-- Migration: Set bimaeteng4@gmail.com as Accountant
-- Member: Bima Josiah Emmanuel (CLM/2025/0013)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Attempt adding 'accountant' to user_role enum if not already present
DO $$
BEGIN
  ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'accountant';
EXCEPTION
  WHEN duplicate_object THEN null;
  WHEN others THEN null;
END $$;

-- 2. Update Bima's role and metadata in auth.users
UPDATE auth.users
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"accountant"'
  ),
  raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    '"accountant"'
  ),
  updated_at = NOW()
WHERE LOWER(email) = 'bimaeteng4@gmail.com';

-- 3. Update public.user_profiles for Bima
-- Note: 'staff' is guaranteed valid on all user_role enums, while 'accountant'
-- is resolved automatically by the frontend ROLE_OVERRIDES and user_metadata
DO $$
BEGIN
  -- Try updating with 'accountant' if enum supports it in this transaction
  BEGIN
    UPDATE public.user_profiles
    SET 
      role = 'accountant'::public.user_role,
      full_name = 'Bima Josiah Emmanuel',
      is_active = true,
      updated_at = NOW()
    WHERE LOWER(email) = 'bimaeteng4@gmail.com';
  EXCEPTION WHEN OTHERS THEN
    -- Fallback to 'staff' if enum value 'accountant' cannot be used in same txn
    UPDATE public.user_profiles
    SET 
      role = 'staff'::public.user_role,
      full_name = 'Bima Josiah Emmanuel',
      is_active = true,
      updated_at = NOW()
    WHERE LOWER(email) = 'bimaeteng4@gmail.com';
  END;
END $$;

-- 4. If profile doesn't exist yet, insert it from auth.users
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE LOWER(email) = 'bimaeteng4@gmail.com' LIMIT 1;
  IF v_user_id IS NOT NULL THEN
    BEGIN
      INSERT INTO public.user_profiles (id, email, full_name, role, is_active, created_at, updated_at)
      VALUES (v_user_id, 'bimaeteng4@gmail.com', 'Bima Josiah Emmanuel', 'accountant'::public.user_role, true, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET is_active = true, updated_at = NOW();
    EXCEPTION WHEN OTHERS THEN
      INSERT INTO public.user_profiles (id, email, full_name, role, is_active, created_at, updated_at)
      VALUES (v_user_id, 'bimaeteng4@gmail.com', 'Bima Josiah Emmanuel', 'staff'::public.user_role, true, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET is_active = true, updated_at = NOW();
    END;
  END IF;
END $$;

-- 5. Ensure Bima is active in public.members
UPDATE public.members
SET 
  first_name = 'Bima',
  last_name = 'Josiah Emmanuel',
  status = 'active',
  kyc_completed = true,
  membership_no = COALESCE(membership_no, 'CLM/2025/0013'),
  updated_at = NOW()
WHERE LOWER(email) = 'bimaeteng4@gmail.com';
