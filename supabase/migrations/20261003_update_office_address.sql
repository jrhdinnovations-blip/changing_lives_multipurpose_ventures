-- Update registered cooperative office address in system_settings
INSERT INTO public.system_settings (id, setting_key, setting_value, description)
VALUES (
  gen_random_uuid(),
  'cooperative_address',
  'Behind Deeperlife Bible Church, Rayfield adjacent House 7, Rayfield, Jos, Plateau State',
  'Official registered office address'
)
ON CONFLICT (setting_key) DO UPDATE
SET setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

-- Also ensure Raymond's member record reflects the official office location
UPDATE public.members
SET address = 'Behind Deeperlife Bible Church, Rayfield adjacent House 7, Rayfield, Jos',
    state = 'Plateau',
    lga = 'Jos South',
    updated_at = NOW()
WHERE email = 'raymondlongdiem22@gmail.com';
