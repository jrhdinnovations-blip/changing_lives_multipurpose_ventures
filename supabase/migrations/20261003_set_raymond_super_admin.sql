-- ==============================================================================
-- Migration: Set raymondlongdiem22@gmail.com as Admin / Super Admin
-- Password: R@ymond22
--
-- Note: In PostgreSQL, if adding a new value to an enum, it must be committed
-- before being referenced. To ensure this script runs in a SINGLE run without
-- error 55P04, we set role to 'admin' in user_profiles (which is already valid)
-- and 'super_admin' in auth user metadata and the application context.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Update Raymond's password, confirmation status, and super_admin metadata in auth.users
UPDATE auth.users
SET 
  encrypted_password = crypt('R@ymond22', gen_salt('bf', 10)),
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  raw_user_meta_data = jsonb_build_object(
    'full_name', 'Raymond Longdiem',
    'role', 'super_admin'
  ),
  raw_app_meta_data = jsonb_build_object(
    'provider', 'email',
    'providers', ARRAY['email']::TEXT[],
    'role', 'super_admin'
  ),
  updated_at = NOW()
WHERE LOWER(email) = 'raymondlongdiem22@gmail.com';

-- 2. If Raymond's auth account does not exist yet, create it
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  raw_app_meta_data,
  created_at,
  updated_at
)
SELECT 
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'raymondlongdiem22@gmail.com',
  crypt('R@ymond22', gen_salt('bf', 10)),
  NOW(),
  jsonb_build_object('full_name', 'Raymond Longdiem', 'role', 'super_admin'),
  jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[], 'role', 'super_admin'),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE LOWER(email) = 'raymondlongdiem22@gmail.com'
);

-- 3. Upsert into public.user_profiles with 'admin' role
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
  u.id,
  u.email,
  'Raymond Longdiem',
  'admin'::public.user_role,
  true,
  NOW(),
  NOW()
FROM auth.users u
WHERE LOWER(u.email) = 'raymondlongdiem22@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET 
  role = 'admin'::public.user_role,
  full_name = 'Raymond Longdiem',
  is_active = true,
  updated_at = NOW();

-- 4. Ensure Raymond is active in public.members
UPDATE public.members
SET 
  first_name = 'Raymond',
  last_name = 'Longdiem',
  status = 'active',
  membership_no = COALESCE(membership_no, 'ADM/2026/0001'),
  updated_at = NOW()
WHERE LOWER(email) = 'raymondlongdiem22@gmail.com';
