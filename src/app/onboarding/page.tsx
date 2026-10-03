'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────
interface KYCFormData {
  // Step 1 — Personal Info
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  // Step 2 — Address
  address: string;
  state: string;
  lga: string;
  // Step 3 — Contact
  phone: string;
  // Step 4 — ID Verification
  idType: string;
  idNumber: string;
  // Step 5 — Employment
  occupation: string;
  employer: string;
  // Step 6 — Next of Kin
  nokName: string;
  nokRelationship: string;
  nokPhone: string;
  nokAddress: string;
}

const STEPS = [
  { id: 1, label: 'Personal Info',    icon: '👤' },
  { id: 2, label: 'Address',          icon: '🏠' },
  { id: 3, label: 'Contact',          icon: '📞' },
  { id: 4, label: 'ID Verification',  icon: '🪪' },
  { id: 5, label: 'Employment',       icon: '💼' },
  { id: 6, label: 'Next of Kin',      icon: '👥' },
  { id: 7, label: 'Documents',        icon: '📁' },
];

const ID_TYPES = [
  'National ID (NIN)',
  "Driver's Licence",
  'International Passport',
  "Voter's Card",
  'BVN',
];

const RELATIONSHIPS = [
  'Spouse',
  'Parent',
  'Sibling',
  'Child',
  'Relative',
  'Guardian',
  'Business Partner',
  'Other',
];

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara',
];

const EMPTY_FORM: KYCFormData = {
  firstName: '', middleName: '', lastName: '', gender: '', dateOfBirth: '',
  address: '', state: '', lga: '',
  phone: '',
  idType: '', idNumber: '',
  occupation: '', employer: '',
  nokName: '', nokRelationship: '', nokPhone: '', nokAddress: '',
};

// ─── Step Validators ──────────────────────────────────────────────────────────
function validateStep(step: number, data: KYCFormData): string[] {
  const errs: string[] = [];
  if (step === 1) {
    if (!data.firstName.trim()) errs.push('First name is required.');
    if (!data.lastName.trim()) errs.push('Last name is required.');
    if (!data.gender) errs.push('Gender is required.');
    if (!data.dateOfBirth) errs.push('Date of birth is required.');
  }
  if (step === 2) {
    if (!data.address.trim()) errs.push('Residential address is required.');
    if (!data.state) errs.push('State is required.');
  }
  if (step === 3) {
    if (!data.phone.trim()) errs.push('Phone number is required.');
    if (!/^(\+234|0)[789]\d{9}$/.test(data.phone.replace(/\s/g, '')))
      errs.push('Enter a valid Nigerian phone number (e.g. 08012345678).');
  }
  if (step === 4) {
    if (!data.idType) errs.push('ID type is required.');
    if (!data.idNumber.trim()) errs.push('ID number is required.');
  }
  if (step === 5) {
    if (!data.occupation.trim()) errs.push('Occupation is required.');
  }
  if (step === 6) {
    if (!data.nokName.trim()) errs.push('Next of kin full name is required.');
    if (!data.nokRelationship) errs.push('Next of kin relationship is required.');
    if (!data.nokPhone.trim()) errs.push('Next of kin phone number is required.');
    if (!data.nokAddress.trim()) errs.push('Next of kin address is required.');
  }
  return errs;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<KYCFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [checkingKyc, setCheckingKyc] = useState(true);

  // Document uploads
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docFileName, setDocFileName] = useState<string>('');

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  // Check if KYC already completed
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data } = await supabase
          .from('members')
          .select('kyc_completed, membership_status, first_name, middle_name, last_name, phone, state, lga, address, occupation, employer, nok_name, nok_relationship, nok_phone, nok_address, id_type, id_number')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data?.kyc_completed) {
          if (['pending', 'under_review'].includes(data.membership_status)) {
            router.replace('/onboarding/pending');
          } else {
            router.replace('/member-dashboard');
          }
          return;
        }

        // Pre-fill form if data already partially exists
        if (data) {
          setForm(f => ({
            ...f,
            firstName: data.first_name || f.firstName,
            middleName: data.middle_name || f.middleName,
            lastName: data.last_name || f.lastName,
            phone: data.phone || f.phone,
            state: data.state || f.state,
            lga: data.lga || f.lga,
            address: data.address || f.address,
            occupation: data.occupation || f.occupation,
            employer: data.employer || f.employer,
            nokName: data.nok_name || f.nokName,
            nokRelationship: data.nok_relationship || f.nokRelationship,
            nokPhone: data.nok_phone || f.nokPhone,
            nokAddress: data.nok_address || f.nokAddress,
            idType: data.id_type || f.idType,
            idNumber: data.id_number || f.idNumber,
          }));
        } else {
          const meta = user?.user_metadata;
          const parts = (meta?.full_name || '').split(' ');
          setForm(f => ({
            ...f,
            firstName: parts[0] || '',
            lastName: parts.slice(1).join(' ') || '',
          }));
        }
      } catch {
        // no member row yet — that's fine
      } finally {
        setCheckingKyc(false);
      }
    })();
  }, [user, router, supabase]);

  const set = (field: keyof KYCFormData, value: string) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocFile(file);
      setDocFileName(file.name);
    }
  };

  const handleNext = () => {
    const errs = validateStep(step, form);
    if (errs.length) { setErrors(errs); return; }
    setErrors([]);
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setErrors([]);
    setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    const errs = validateStep(6, form);
    if (errs.length) { setErrors(errs); return; }
    setErrors([]);
    setSubmitting(true);
    setSubmitError('');

    try {
      if (!user) throw new Error('User session not found.');

      let profilePhotoUrl: string | null = profilePhotoPreview || null;
      let docUrl: string | null = null;

      // Upload profile photo to storage if bucket exists
      if (profilePhotoFile) {
        try {
          const ext = profilePhotoFile.name.split('.').pop() || 'jpg';
          const filePath = `${user.id}/avatar_${Date.now()}.${ext}`;
          const { error: uploadErr } = await supabase.storage
            .from('member-docs')
            .upload(filePath, profilePhotoFile, { upsert: true });

          if (!uploadErr) {
            const { data: { publicUrl } } = supabase.storage
              .from('member-docs')
              .getPublicUrl(filePath);
            profilePhotoUrl = publicUrl;
          }
        } catch {
          // Fallback to base64 or proceed
        }
      }

      // Upload document to storage if bucket exists
      if (docFile) {
        try {
          const ext = docFile.name.split('.').pop() || 'pdf';
          const filePath = `${user.id}/id_document_${Date.now()}.${ext}`;
          const { error: uploadErr } = await supabase.storage
            .from('member-docs')
            .upload(filePath, docFile, { upsert: true });

          if (!uploadErr) {
            const { data: { publicUrl } } = supabase.storage
              .from('member-docs')
              .getPublicUrl(filePath);
            docUrl = publicUrl;
          }
        } catch {
          // Fallback
        }
      }

      // Check if existing member row exists
      const { data: existingMember } = await supabase
        .from('members')
        .select('id, membership_status')
        .eq('user_id', user.id)
        .maybeSingle();

      const memberPayload = {
        user_id: user.id,
        email: user.email,
        first_name: form.firstName.trim(),
        middle_name: form.middleName.trim() || null,
        last_name: form.lastName.trim(),
        gender: form.gender,
        date_of_birth: form.dateOfBirth || null,
        address: form.address.trim(),
        state: form.state,
        lga: form.lga.trim() || null,
        phone: form.phone.trim(),
        id_type: form.idType,
        id_number: form.idNumber.trim(),
        occupation: form.occupation.trim(),
        employer: form.employer.trim() || null,
        nok_name: form.nokName.trim(),
        nok_relationship: form.nokRelationship,
        nok_phone: form.nokPhone.trim(),
        nok_address: form.nokAddress.trim(),
        profile_photo_url: profilePhotoUrl,
        supporting_docs: docUrl ? [docUrl] : [],
        kyc_completed: true,
        kyc_completed_at: new Date().toISOString(),
        membership_status: existingMember?.membership_status || 'pending',
      };

      if (existingMember) {
        const { error } = await supabase
          .from('members')
          .update(memberPayload)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('members')
          .insert([memberPayload]);
        if (error) throw error;
      }

      // Save photo/doc URLs to user_profiles.avatar_url and raw_user_meta_data
      // as a temporary store until the members table columns are added via migration.
      if (profilePhotoUrl || docUrl) {
        const profileUpdate: Record<string, any> = {};
        if (profilePhotoUrl) profileUpdate.avatar_url = profilePhotoUrl;
        await supabase
          .from('user_profiles')
          .update(profileUpdate)
          .eq('id', user.id);
      }

      // Successfully saved KYC! Route to pending approval page
      router.replace('/onboarding/pending');
    } catch (err: any) {
      console.error('KYC submission error:', err);
      setSubmitError(err?.message || 'Failed to save KYC details. Please check all fields and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || checkingKyc) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading your profile…</p>
        </div>
      </div>
    );
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col text-slate-100">
      {/* Top bar */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image
            src="/assets/images/WhatsApp_Image_2026-09-19_at_12.24.54-1789999920386.jpeg"
            alt="CLIMPS Cooperative Logo"
            width={34}
            height={34}
            className="rounded-xl object-cover"
          />
          <span className="font-bold text-base text-white tracking-tight">CLIMPS</span>
        </div>
        <span className="text-xs text-slate-300 bg-white/10 px-3.5 py-1.5 rounded-full font-medium border border-white/10">
          KYC Onboarding · Step {step} of {STEPS.length}
        </span>
      </header>

      <div className="flex-1 flex items-start justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-2xl">

          {/* Welcome banner */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 bg-accent/20 text-accent text-xs font-semibold px-4 py-1.5 rounded-full mb-3 border border-accent/30">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Member Onboarding
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Complete Your Member Registration
            </h1>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Please provide your personal details, next of kin, and ID to complete your membership application.
            </p>
          </div>

          {/* Step indicators */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              {STEPS.map((s, i) => (
                <React.Fragment key={s.id}>
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 ${
                        step > s.id
                          ? 'bg-accent text-white shadow-sm'
                          : step === s.id
                          ? 'bg-primary text-white shadow-md ring-4 ring-primary/20'
                          : 'bg-white/10 text-slate-400 border border-white/10'
                      }`}
                    >
                      {step > s.id ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span>{s.icon}</span>
                      )}
                    </div>
                    <span className={`text-[10px] font-medium hidden sm:block ${step === s.id ? 'text-primary font-semibold' : 'text-slate-400'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 mx-1 h-0.5 rounded-full overflow-hidden bg-white/10">
                      <div
                        className="h-full bg-accent transition-all duration-500"
                        style={{ width: step > s.id ? '100%' : '0%' }}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            {/* Progress bar */}
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Card */}
          <div className="bg-white/[0.05] backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8">
            {/* Step title */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-xl">{STEPS[step - 1]?.icon}</span>
                {STEPS[step - 1]?.label}
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                {step === 1 && 'Enter your full legal name and personal information.'}
                {step === 2 && 'Provide your current residential address in Nigeria.'}
                {step === 3 && 'Enter your active mobile phone number for verification.'}
                {step === 4 && 'Select your government-issued identification.'}
                {step === 5 && 'Provide your occupation and employment or business details.'}
                {step === 6 && 'Specify your next of kin for membership records.'}
                {step === 7 && 'Upload your profile photo and supporting identification document.'}
              </p>
            </div>

            {/* Error messages */}
            {errors.length > 0 && (
              <div className="mb-5 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-sm font-semibold text-red-400 mb-1">Please correct the following:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {errors.map((e, i) => (
                    <li key={i} className="text-sm text-red-300">{e}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Step 1: Personal Info ── */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1.5">
                      First Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={e => set('firstName', e.target.value)}
                      placeholder="e.g. Adaeze"
                      className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1.5">
                      Last Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={e => set('lastName', e.target.value)}
                      placeholder="e.g. Okonkwo"
                      className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1.5">
                    Middle Name <span className="text-slate-400 text-xs">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.middleName}
                    onChange={e => set('middleName', e.target.value)}
                    placeholder="e.g. Chioma"
                    className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 transition-all"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1.5">
                      Gender <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={form.gender}
                      onChange={e => set('gender', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-white/20 bg-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 transition-all"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1.5">
                      Date of Birth <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.dateOfBirth}
                      onChange={e => set('dateOfBirth', e.target.value)}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      className="w-full px-4 py-3 rounded-xl border border-white/20 bg-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: Address ── */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1.5">
                    Residential Street Address <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={form.address}
                    onChange={e => set('address', e.target.value)}
                    rows={3}
                    placeholder="e.g. 12 Adeola Odeku Street, Victoria Island"
                    className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 transition-all resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1.5">
                      State <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={form.state}
                      onChange={e => set('state', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-white/20 bg-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 transition-all"
                    >
                      <option value="">Select state</option>
                      {NIGERIAN_STATES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1.5">
                      LGA <span className="text-slate-400 text-xs">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={form.lga}
                      onChange={e => set('lga', e.target.value)}
                      placeholder="e.g. Eti-Osa"
                      className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Contact ── */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1.5">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-300 font-medium">🇳🇬</span>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => set('phone', e.target.value)}
                      placeholder="e.g. 08012345678"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 transition-all"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">Enter a valid Nigerian phone number (e.g. 08012345678 or +2348012345678)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1.5">
                    Registered Email Address
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-slate-400 text-sm cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-1">Associated with your authentication account</p>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex gap-3">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    This phone number and email will receive transaction receipts, loan alerts, and cooperative governance ballots.
                  </p>
                </div>
              </div>
            )}

            {/* ── Step 4: ID Verification ── */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1.5">
                    Identification Document Type <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {ID_TYPES.map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => set('idType', type)}
                        className={`px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all duration-150 ${
                          form.idType === type
                            ? 'border-primary bg-primary/20 text-white ring-2 ring-primary/40'
                            : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                {form.idType && (
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1.5">
                      {form.idType} Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.idNumber}
                      onChange={e => set('idNumber', e.target.value)}
                      placeholder={`Enter your ${form.idType} number`}
                      className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 transition-all"
                    />
                  </div>
                )}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3">
                  <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-xs text-amber-300 leading-relaxed">
                    Ensure the ID number matches your official document exactly. An accurate ID accelerates approval by the verification team.
                  </p>
                </div>
              </div>
            )}

            {/* ── Step 5: Employment ── */}
            {step === 5 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1.5">
                    Occupation / Profession <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.occupation}
                    onChange={e => set('occupation', e.target.value)}
                    placeholder="e.g. Software Engineer, Trader, Civil Servant, Entrepreneur"
                    className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1.5">
                    Employer or Business Name <span className="text-slate-400 text-xs">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.employer}
                    onChange={e => set('employer', e.target.value)}
                    placeholder="e.g. Self-Employed / Company Ltd"
                    className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 transition-all"
                  />
                </div>
              </div>
            )}

            {/* ── Step 6: Next of Kin ── */}
            {step === 6 && (
              <div className="space-y-4">
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-3.5 flex gap-2.5">
                  <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-xs text-slate-300">
                    A Next of Kin is required by statutory cooperative regulations for emergency contact and estate beneficiary records.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1.5">
                      Next of Kin Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.nokName}
                      onChange={e => set('nokName', e.target.value)}
                      placeholder="e.g. Emeka Okonkwo"
                      className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1.5">
                      Relationship <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={form.nokRelationship}
                      onChange={e => set('nokRelationship', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-white/20 bg-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 transition-all"
                    >
                      <option value="">Select relationship</option>
                      {RELATIONSHIPS.map(rel => (
                        <option key={rel} value={rel}>{rel}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1.5">
                    Next of Kin Phone Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.nokPhone}
                    onChange={e => set('nokPhone', e.target.value)}
                    placeholder="e.g. 08098765432"
                    className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1.5">
                    Next of Kin Residential Address <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={form.nokAddress}
                    onChange={e => set('nokAddress', e.target.value)}
                    rows={2}
                    placeholder="e.g. 15 Marina Road, Lagos Island"
                    className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/60 transition-all resize-none"
                  />
                </div>
              </div>
            )}

            {/* ── Step 7: Documents & Profile Photo ── */}
            {step === 7 && (
              <div className="space-y-6">
                {/* Profile Photo */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Profile Photo / Passport Photograph
                  </label>
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {profilePhotoPreview ? (
                        <img src={profilePhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        id="profile-photo-input"
                        onChange={handleProfilePhotoChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="profile-photo-input"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer border border-white/20 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Choose Photo
                      </label>
                      <p className="text-xs text-slate-400 mt-1.5">PNG or JPG up to 5MB. Clean white background recommended.</p>
                    </div>
                  </div>
                </div>

                {/* Supporting Document */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Supporting ID Document (Front or Slip)
                  </label>
                  <div className="border-2 border-dashed border-white/20 rounded-2xl p-6 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      id="doc-upload-input"
                      onChange={handleDocChange}
                      className="hidden"
                    />
                    <label htmlFor="doc-upload-input" className="cursor-pointer block">
                      <svg className="w-10 h-10 text-primary mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {docFileName ? (
                        <p className="text-sm font-semibold text-accent">{docFileName}</p>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-white">Click to upload document</p>
                          <p className="text-xs text-slate-400 mt-1">PDF, JPG, or PNG (NIN Slip, Voter Card, Driver License, etc.)</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Summary review */}
                <div className="bg-black/20 rounded-2xl p-5 border border-white/10">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Application Summary</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:text-sm">
                    <div>
                      <span className="text-slate-400 text-xs block">Full Name</span>
                      <span className="font-medium text-white truncate block">{[form.firstName, form.middleName, form.lastName].filter(Boolean).join(' ') || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs block">Phone</span>
                      <span className="font-medium text-white block">{form.phone || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs block">State / LGA</span>
                      <span className="font-medium text-white block">{form.state ? `${form.state} (${form.lga || 'N/A'})` : '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs block">ID Document</span>
                      <span className="font-medium text-white block">{form.idType ? `${form.idType}` : '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs block">Next of Kin</span>
                      <span className="font-medium text-white block">{form.nokName ? `${form.nokName} (${form.nokRelationship})` : '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs block">Occupation</span>
                      <span className="font-medium text-white block">{form.occupation || '—'}</span>
                    </div>
                  </div>
                </div>

                {submitError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <p className="text-sm text-red-300">{submitError}</p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-8 flex items-center justify-between gap-4">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/20 text-sm font-semibold text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              ) : (
                <div />
              )}

              {step < STEPS.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/25 cursor-pointer"
                >
                  Continue
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-bold hover:bg-accent/90 active:scale-95 transition-all shadow-lg shadow-accent/25 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting Application…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Submit KYC Application
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-slate-500 mt-6">
            Your information is encrypted and stored securely following data privacy guidelines. CLIMPS will never share your personal data.
          </p>
        </div>
      </div>
    </div>
  );
}
