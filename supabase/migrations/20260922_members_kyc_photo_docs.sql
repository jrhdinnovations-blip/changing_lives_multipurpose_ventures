-- ============================================================
-- Migration: Add profile_photo_url and supporting_docs to members
-- These columns are required by the KYC onboarding flow
-- ============================================================

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS supporting_docs TEXT[] DEFAULT '{}';
