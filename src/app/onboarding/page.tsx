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
}

const STEPS = [
  { id: 1, label: 'Personal Info', icon: '👤' },
  { id: 2, label: 'Address',       icon: '🏠' },
  { id: 3, label: 'Contact',       icon: '📞' },
  { id: 4, label: 'ID Verification', icon: '🪪' },
  { id: 5, label: 'Employment',    icon: '💼' },
];

const ID_TYPES = [
  'National ID (NIN)',
  "Driver\'s Licence",
  'International Passport',
  'Voter\'s Card',
  'BVN',
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
    if (!data.address.trim()) errs.push('Address is required.');
    if (!data.state) errs.push('State is required.');
  }
  if (step === 3) {
    if (!data.phone.trim()) errs.push('Phone number is required.');
    if (!/^(\+234|0)[789]\d{9}$/.test(data.phone.replace(/\s/g, '')))
      errs.push('Enter a valid Nigerian phone number.');
  }
  if (step === 4) {
    if (!data.idType) errs.push('ID type is required.');
    if (!data.idNumber.trim()) errs.push('ID number is required.');
  }
  if (step === 5) {
    if (!data.occupation.trim()) errs.push('Occupation is required.');
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

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user) router.replace('/');
  }, [user, loading]);

  // Check if KYC already completed
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data } = await supabase
          .from('members')
          .select('kyc_completed, first_name')
          .eq('user_id', user.id)
          .maybeSingle();
        if (data?.kyc_completed) {
          router.replace('/member-dashboard');
          return;
        }
        // Pre-fill name from auth metadata
        if (data?.first_name) {
          setForm(f => ({ ...f, firstName: data.first_name }));
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
  }, [user]);

  const set = (field: keyof KYCFormData, value: string) =>
    setForm(f => ({ ...f, [field]: value }));

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
    const errs = validateStep(5, form);
    if (errs.length) { setErrors(errs); return; }
    setErrors([]);
    setSubmitting(true);
    setSubmitError('');
    try {
      // Upsert into members table
      const { error } = await supabase
        .from('members')
        .update({
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
          kyc_completed: true,
          kyc_completed_at: new Date().toISOString(),
        })
        .eq('user_id', user?.id);

      if (error) throw error;
      router.replace('/member-dashboard');
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to save KYC details. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || checkingKyc) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image
            src="/assets/images/WhatsApp_Image_2026-09-19_at_12.24.54-1789999920386.jpeg"
            alt="CLIMPS Cooperative Logo"
            width={32}
            height={32}
            className="rounded-lg object-cover"
          />
          <span className="font-bold text-base text-primary tracking-tight">CLIMPS</span>
        </div>
        <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full font-medium">
          KYC Verification · Step {step} of {STEPS.length}
        </span>
      </header>

      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-2xl">

          {/* Welcome banner */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Identity Verification Required
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Complete Your KYC Profile
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              To access your dashboard and apply for products, we need to verify your identity. This takes about 3 minutes.
            </p>
          </div>

          {/* Step indicators */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              {STEPS.map((s, i) => (
                <React.Fragment key={s.id}>
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        step > s.id
                          ? 'bg-accent text-white shadow-sm'
                          : step === s.id
                          ? 'bg-primary text-white shadow-md ring-4 ring-primary/20'
                          : 'bg-muted text-muted-foreground'
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
                    <span className={`text-[10px] font-medium hidden sm:block ${step === s.id ? 'text-primary' : 'text-muted-foreground'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 mx-1 h-0.5 rounded-full overflow-hidden bg-muted">
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
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-8">
            {/* Step title */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="text-xl">{STEPS[step - 1]?.icon}</span>
                {STEPS[step - 1]?.label}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {step === 1 && 'Enter your full legal name and personal details.'}
                {step === 2 && 'Provide your current residential address.'}
                {step === 3 && 'Add your active phone number.'}
                {step === 4 && 'Select a valid government-issued ID.'}
                {step === 5 && 'Tell us about your current employment.'}
              </p>
            </div>

            {/* Error messages */}
            {errors.length > 0 && (
              <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-red-700 mb-1">Please fix the following:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {errors.map((e, i) => (
                    <li key={i} className="text-sm text-red-600">{e}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Step 1: Personal Info ── */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={e => set('firstName', e.target.value)}
                      placeholder="e.g. Adaeze"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={e => set('lastName', e.target.value)}
                      placeholder="e.g. Okonkwo"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Middle Name <span className="text-muted-foreground text-xs">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.middleName}
                    onChange={e => set('middleName', e.target.value)}
                    placeholder="e.g. Chioma"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.gender}
                      onChange={e => set('gender', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.dateOfBirth}
                      onChange={e => set('dateOfBirth', e.target.value)}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: Address ── */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.address}
                    onChange={e => set('address', e.target.value)}
                    rows={3}
                    placeholder="e.g. 12 Adeola Odeku Street, Victoria Island"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.state}
                      onChange={e => set('state', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    >
                      <option value="">Select state</option>
                      {NIGERIAN_STATES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      LGA <span className="text-muted-foreground text-xs">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={form.lga}
                      onChange={e => set('lga', e.target.value)}
                      placeholder="e.g. Eti-Osa"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Contact ── */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">🇳🇬</span>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => set('phone', e.target.value)}
                      placeholder="e.g. 08012345678"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">Enter a valid Nigerian phone number (e.g. 0801 234 5678 or +234 801 234 5678)</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                  <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-blue-700">
                    This number will be used for transaction alerts, loan notifications, and account recovery. Make sure it is active and accessible.
                  </p>
                </div>
              </div>
            )}

            {/* ── Step 4: ID Verification ── */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    ID Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {ID_TYPES.map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => set('idType', type)}
                        className={`px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all duration-150 ${
                          form.idType === type
                            ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20' :'border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                {form.idType && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      {form.idType} Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.idNumber}
                      onChange={e => set('idNumber', e.target.value)}
                      placeholder={`Enter your ${form.idType} number`}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                )}
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                  <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-sm text-amber-700">
                    Ensure the ID number matches exactly as it appears on your document. Incorrect details may delay account approval.
                  </p>
                </div>
              </div>
            )}

            {/* ── Step 5: Employment ── */}
            {step === 5 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Occupation / Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.occupation}
                    onChange={e => set('occupation', e.target.value)}
                    placeholder="e.g. Software Engineer, Trader, Civil Servant"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Employer / Business Name <span className="text-muted-foreground text-xs">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.employer}
                    onChange={e => set('employer', e.target.value)}
                    placeholder="e.g. Dangote Group, Self-Employed"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>

                {/* Summary review */}
                <div className="mt-2 bg-muted/50 rounded-xl p-4 border border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Review Summary</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Full Name</span>
                      <p className="font-medium text-foreground truncate">{[form.firstName, form.middleName, form.lastName].filter(Boolean).join(' ') || '—'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gender</span>
                      <p className="font-medium text-foreground">{form.gender || '—'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone</span>
                      <p className="font-medium text-foreground">{form.phone || '—'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">State</span>
                      <p className="font-medium text-foreground">{form.state || '—'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ID Type</span>
                      <p className="font-medium text-foreground">{form.idType || '—'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ID Number</span>
                      <p className="font-medium text-foreground">{form.idNumber ? `••••${form.idNumber.slice(-4)}` : '—'}</p>
                    </div>
                  </div>
                </div>

                {submitError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-sm text-red-700">{submitError}</p>
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
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-all"
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
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
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
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 active:scale-95 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Complete KYC
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            Your information is encrypted and stored securely. CLIMPS will never share your data with third parties.
          </p>
        </div>
      </div>
    </div>
  );
}
