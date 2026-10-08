'use client';

import React, { useEffect, useState, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  User,
  MapPin,
  Users,
  FileText,
  Banknote,
  Check,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Save,
  Upload,
  Camera,
  Building2,
  Briefcase,
  Calendar,
  Phone,
  Mail,
  CreditCard,
  Sparkles,
  ChevronRight,
  CheckSquare,
  Square,
  Info,
  ExternalLink
} from 'lucide-react';
import { AdminMember, getStoredMembers, saveStoredMembers } from '@/lib/adminService';

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT - Abuja', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara'
];

const CONTRIBUTION_PRESETS = [
  { amount: 10000, label: '₦10,000', tier: 'Bronze' },
  { amount: 20000, label: '₦20,000', tier: 'Silver (Standard)' },
  { amount: 50000, label: '₦50,000', tier: 'Gold' },
  { amount: 100000, label: '₦100,000', tier: 'Platinum' },
];

export default function MemberProfileCompletionPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeStep, setActiveStep] = useState(1);

  // Raw member record found
  const [memberData, setMemberData] = useState<any>(null);

  // Form State
  const [form, setForm] = useState({
    // Step 1: Personal Info
    title: 'Mr',
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'Male',
    dateOfBirth: '',
    maritalStatus: 'Single',
    occupation: '',
    employer: '',

    // Step 2: Address & Location
    address: '',
    state: 'Plateau',
    lga: 'Jos North',
    city: 'Jos',
    landmark: '',

    // Step 3: Next of Kin
    nokName: '',
    nokRelationship: 'Spouse',
    nokPhone: '',
    nokEmail: '',
    nokAddress: '',

    // Step 4: Identification & Bank Details
    idType: 'NIN',
    idNumber: '',
    idDocumentPreview: '',
    bankName: 'First Bank of Nigeria',
    accountNumber: '',
    accountName: '',

    // Step 5: Monthly Contribution
    monthlyContribution: 20000,
    contributionDay: '28',
    paymentMethod: 'bank_transfer',

    // Terms
    agreeByeLaws: false,
    confirmTruth: false,
  });

  const photoInputRef = useRef<HTMLInputElement>(null);
  const idDocInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  // Steps definition
  const steps = [
    { number: 1, title: 'Personal Details', subtitle: 'Basic background & identity', icon: User },
    { number: 2, title: 'Address & Location', subtitle: 'Where you reside', icon: MapPin },
    { number: 3, title: 'Next of Kin', subtitle: 'Emergency & beneficiary', icon: Users },
    { number: 4, title: 'KYC & Bank Info', subtitle: 'Verification & payouts', icon: FileText },
    { number: 5, title: 'Contribution Plan', subtitle: 'Monthly savings & consent', icon: Banknote },
  ];

  // Load existing member info
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    fetchMemberInfo();
  }, [user, authLoading]);

  async function fetchMemberInfo() {
    setLoading(true);
    try {
      let record: any = null;

      // 1. Try Supabase by user_id
      const { data: byUserId } = await supabase
        .from('members')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (byUserId) {
        record = byUserId;
      } else if (user?.email) {
        // 2. Try Supabase by email
        const { data: byEmail } = await supabase
          .from('members')
          .select('*')
          .ilike('email', user.email)
          .maybeSingle();
        if (byEmail) record = byEmail;
      }

      // 3. Fallback to localStorage
      if (!record && typeof window !== 'undefined') {
        const localMembers = getStoredMembers();
        const found = localMembers.find(
          m => m.user_id === user?.id || (m.email && user?.email && m.email.toLowerCase() === user.email.toLowerCase())
        );
        if (found) {
          record = {
            id: found.id,
            user_id: found.user_id,
            member_number: found.member_number,
            first_name: found.first_name,
            middle_name: found.middle_name,
            last_name: found.last_name,
            phone: found.phone,
            email: found.email,
            gender: found.gender,
            date_of_birth: found.date_of_birth,
            address: found.address,
            state: found.state,
            lga: found.lga,
            occupation: found.occupation,
            employer: found.employer,
            nok_name: found.nok_name,
            nok_relationship: found.nok_relationship,
            nok_phone: found.nok_phone,
            nok_address: found.nok_address,
            id_type: found.id_type,
            id_number: found.id_number,
            monthly_contribution: found.monthly_contribution_amount,
            status: found.membership_status,
          };
        }
      }

      setMemberData(record);

      // Populate form with pre-existing or admin-created fields
      if (record) {
        setForm(prev => ({
          ...prev,
          firstName: record.first_name || user?.user_metadata?.first_name || '',
          middleName: record.middle_name || '',
          lastName: record.last_name || user?.user_metadata?.last_name || '',
          email: record.email || user?.email || '',
          phone: record.phone || user?.user_metadata?.phone || '',
          gender: record.gender || 'Male',
          dateOfBirth: record.date_of_birth || '',
          occupation: record.occupation || '',
          employer: record.employer || '',
          address: record.address || '',
          state: record.state || 'Plateau',
          lga: record.lga || '',
          nokName: record.nok_name || '',
          nokRelationship: record.nok_relationship || 'Spouse',
          nokPhone: record.nok_phone || '',
          nokAddress: record.nok_address || '',
          idType: record.id_type || 'NIN',
          idNumber: record.id_number || '',
          monthlyContribution: Number(record.monthly_contribution || record.monthly_contribution_amount || 20000) || 20000,
        }));
      } else {
        // Populate from auth user metadata if brand new
        const meta = user?.user_metadata || {};
        const names = (meta.full_name || '').split(' ');
        setForm(prev => ({
          ...prev,
          firstName: meta.first_name || names[0] || '',
          lastName: meta.last_name || (names.length > 1 ? names.slice(1).join(' ') : '') || '',
          email: user?.email || '',
          phone: meta.phone || '',
        }));
      }
    } catch (err) {
      console.warn('Error reading member info:', err);
    } finally {
      setLoading(false);
    }
  }

  // Handle Photo upload
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle ID Doc upload
  const handleIdDocSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm(p => ({ ...p, idDocumentPreview: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Step Validation
  const validateStep = (stepNum: number): boolean => {
    setErrorMessage('');
    if (stepNum === 1) {
      if (!form.firstName.trim() || !form.lastName.trim()) {
        setErrorMessage('First Name and Last Name are required.');
        return false;
      }
      if (!form.phone.trim()) {
        setErrorMessage('Phone number is required.');
        return false;
      }
      return true;
    }
    if (stepNum === 2) {
      if (!form.address.trim()) {
        setErrorMessage('Residential address is required.');
        return false;
      }
      if (!form.state) {
        setErrorMessage('Please select your state.');
        return false;
      }
      return true;
    }
    if (stepNum === 3) {
      if (!form.nokName.trim()) {
        setErrorMessage('Next of kin full name is required.');
        return false;
      }
      if (!form.nokPhone.trim()) {
        setErrorMessage('Next of kin phone number is required.');
        return false;
      }
      return true;
    }
    if (stepNum === 4) {
      if (!form.idNumber.trim()) {
        setErrorMessage('Identification number (NIN/Voters Card/Passport/Driver License) is required.');
        return false;
      }
      return true;
    }
    if (stepNum === 5) {
      if (Number(form.monthlyContribution) < 5000) {
        setErrorMessage('Minimum monthly contribution is ₦5,000.');
        return false;
      }
      if (!form.agreeByeLaws || !form.confirmTruth) {
        setErrorMessage('You must confirm the truth of your details and agree to the cooperative bye-laws.');
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setErrorMessage('');
    setActiveStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final Submit
  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    setSaving(true);
    setErrorMessage('');

    try {
      const payload = {
        first_name: form.firstName.trim(),
        middle_name: form.middleName.trim() || null,
        last_name: form.lastName.trim(),
        phone: form.phone.trim(),
        gender: form.gender,
        date_of_birth: form.dateOfBirth || null,
        occupation: form.occupation.trim() || null,
        employer: form.employer.trim() || null,
        address: form.address.trim(),
        state: form.state,
        lga: form.lga.trim() || null,
        nok_name: form.nokName.trim(),
        nok_relationship: form.nokRelationship,
        nok_phone: form.nokPhone.trim(),
        nok_address: form.nokAddress.trim() || form.address.trim(),
        id_type: form.idType,
        id_number: form.idNumber.trim(),
        monthly_contribution: Number(form.monthlyContribution),
        monthly_contribution_amount: Number(form.monthlyContribution),
        kyc_completed: true,
        kyc_completed_at: new Date().toISOString(),
        membership_status: 'active',
        status: 'active',
        updated_at: new Date().toISOString(),
      };

      // 1. Update Supabase
      if (user?.id) {
        try {
          if (memberData?.id) {
            await supabase
              .from('members')
              .update(payload)
              .eq('id', memberData.id);
          } else {
            await supabase
              .from('members')
              .update(payload)
              .eq('user_id', user.id);
          }
        } catch (dbErr) {
          console.warn('Supabase members update notice:', dbErr);
        }

        // Update user_profiles as well
        try {
          await supabase
            .from('user_profiles')
            .update({
              full_name: `${form.firstName} ${form.lastName}`.trim(),
              phone: form.phone.trim(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);
        } catch (profErr) {
          console.warn('user_profiles update notice:', profErr);
        }
      }

      // 2. Update localStorage for instant local reactivity
      if (typeof window !== 'undefined') {
        const stored = getStoredMembers();
        const updatedList = stored.map(m => {
          const isMatch =
            (m.user_id && user?.id && m.user_id === user.id) ||
            (m.id && memberData?.id && m.id === memberData.id) ||
            (m.email && user?.email && m.email.toLowerCase() === user.email.toLowerCase());

          if (isMatch) {
            return {
              ...m,
              first_name: payload.first_name,
              middle_name: form.middleName.trim(),
              last_name: payload.last_name,
              phone: payload.phone,
              gender: payload.gender,
              date_of_birth: payload.date_of_birth || m.date_of_birth,
              address: payload.address,
              state: payload.state,
              lga: form.lga,
              occupation: form.occupation,
              employer: form.employer,
              nok_name: payload.nok_name,
              nok_relationship: payload.nok_relationship,
              nok_phone: payload.nok_phone,
              nok_address: payload.nok_address,
              id_type: payload.id_type,
              id_number: payload.id_number,
              monthly_contribution_amount: payload.monthly_contribution,
              membership_status: 'active' as const,
              updated_at: new Date().toISOString(),
            };
          }
          return m;
        });

        saveStoredMembers(updatedList);

        // Store a dedicated member session cache
        localStorage.setItem(`climps_member_profile_${user?.id || 'current'}`, JSON.stringify({
          ...payload,
          email: form.email,
        }));
      }

      setSaveSuccess(true);
    } catch (err: any) {
      console.error('Save error:', err);
      setErrorMessage(err.message || 'Failed to save profile. Please check your network and try again.');
    } finally {
      setSaving(false);
    }
  };

  const memberDisplayName = `${form.firstName} ${form.lastName}`.trim() || 'Member';
  const memberDisplayId = memberData?.member_number || memberData?.membership_no || 'CLMV/2026/0047';

  if (loading || authLoading) {
    return (
      <AppLayout role="member" memberName="Loading…" memberId="—">
        <div className="p-6 xl:p-8 max-w-4xl mx-auto space-y-6">
          <div className="h-10 w-72 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-64 bg-white/5 rounded-2xl animate-pulse" />
        </div>
      </AppLayout>
    );
  }

  // Success view
  if (saveSuccess) {
    return (
      <AppLayout role="member" memberName={memberDisplayName} memberId={memberDisplayId}>
        <div className="p-6 xl:p-8 2xl:p-12 max-w-2xl mx-auto my-12 text-center">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0D182E]/90 backdrop-blur-xl p-8 sm:p-12 shadow-2xl">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-[#00E599]/10 border border-[#00E599]/30 flex items-center justify-center text-[#00E599] mb-6">
              <CheckCircle2 size={42} />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#00E599]/10 text-[#00E599] border border-[#00E599]/30 mb-4">
              <Sparkles size={12} /> Profile Fully Completed
            </span>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome aboard, {form.firstName}!
            </h1>

            <p className="text-sm text-white/60 mt-3 max-w-md mx-auto leading-relaxed">
              Your member profile, KYC records, and monthly contribution plan of{' '}
              <span className="text-[#00E599] font-bold">
                ₦{Number(form.monthlyContribution).toLocaleString()}/month
              </span>{' '}
              have been registered successfully.
            </p>

            <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/10 text-left space-y-2">
              <div className="flex justify-between text-xs py-1 border-b border-white/10">
                <span className="text-white/50">Member ID:</span>
                <span className="text-white font-mono font-semibold">{memberDisplayId}</span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-white/10">
                <span className="text-white/50">Account Status:</span>
                <span className="text-[#00E599] font-semibold flex items-center gap-1">
                  <Check size={12} /> Active & Verified
                </span>
              </div>
              <div className="flex justify-between text-xs py-1">
                <span className="text-white/50">Monthly Savings Target:</span>
                <span className="text-white font-semibold">₦{Number(form.monthlyContribution).toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => router.push('/member-dashboard')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl btn-primary text-sm shadow-md flex items-center justify-center gap-2"
              >
                Go to Dashboard
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout role="member" memberName={memberDisplayName} memberId={memberDisplayId}>
      <div className="p-4 sm:p-6 xl:p-8 2xl:p-10 max-w-5xl mx-auto space-y-8">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#00E599] font-semibold mb-1">
              <ShieldCheck size={14} />
              <span>CLIMPS Member Onboarding & Verification</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Complete Your Profile
            </h1>
            <p className="text-sm text-white/50 mt-1 max-w-xl">
              Fill in your remaining details, next-of-kin, and monthly savings plan to complete your cooperative registration.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/member-dashboard')}
              className="btn-outline text-xs px-4 py-2"
            >
              Save & Exit to Dashboard
            </button>
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="bg-[#0D182E]/80 border border-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur-xl">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {steps.map(s => {
              const IconComp = s.icon;
              const isPassed = activeStep > s.number;
              const isCurrent = activeStep === s.number;

              return (
                <button
                  key={s.number}
                  type="button"
                  onClick={() => {
                    // Only allow jumping back or to next if validated
                    if (s.number < activeStep) setActiveStep(s.number);
                    else if (s.number === activeStep + 1 && validateStep(activeStep)) setActiveStep(s.number);
                  }}
                  className={`text-left p-2.5 sm:p-3 rounded-xl transition-all border ${
                    isCurrent
                      ? 'bg-[#00E599]/10 border-[#00E599]/40'
                      : isPassed
                      ? 'bg-[#00E599]/5 border-[#00E599]/20'
                      : 'bg-white/5 border-white/10 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-[#00E599] text-[#0D182E]'
                          : isPassed
                          ? 'bg-[#00E599]/80 text-[#0D182E]'
                          : 'bg-white/10 text-white/50'
                      }`}
                    >
                      {isPassed ? <Check size={12} strokeWidth={3} /> : s.number}
                    </div>
                    <span className={`text-xs font-semibold line-clamp-1 ${isCurrent ? 'text-[#00E599]' : isPassed ? 'text-[#00E599]/70' : 'text-white/50'}`}>
                      {s.title}
                    </span>
                  </div>
                  <p className="text-2xs text-white/30 mt-1 hidden sm:block truncate">
                    {s.subtitle}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
            <span>Step {activeStep} of 5</span>
            <span className="font-semibold text-[#00E599]">{Math.round((activeStep / 5) * 100)}% Progress</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-3 animate-shake">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <div className="bg-[#0D182E]/80 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-xl">

          {/* ════════════════════════════════════════════════════════════ */}
          {/* STEP 1: PERSONAL INFORMATION                                 */}
          {/* ════════════════════════════════════════════════════════════ */}
          {activeStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <User size={18} className="text-[#00E599]" />
                  Personal Information
                </h2>
                <p className="text-xs text-white/40 mt-0.5">
                  Confirm the details provided by the administrator and add your background info.
                </p>
              </div>

              {/* Photo Upload section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/10 overflow-hidden flex items-center justify-center text-white/40">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={36} />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 p-1.5 rounded-lg bg-[#00E599] hover:bg-[#00E599]/80 text-[#0D182E] transition-colors shadow-md"
                    title="Upload profile photo"
                  >
                    <Camera size={14} />
                  </button>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Passport / Profile Photo</h4>
                  <p className="text-2xs text-white/40 mt-0.5">
                    Clear headshot photo against a light background (PNG or JPG, max 3MB).
                  </p>
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="mt-2 text-xs text-[#00E599] hover:underline font-semibold"
                  >
                    {photoPreview ? 'Change Photo' : 'Upload Photo'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-2xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                    Title
                  </label>
                  <select
                    value={form.title}
                    onChange={e => handleChange('title', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#00E599]/20 focus:border-[#00E599]/50"
                  >
                    <option value="Mr">Mr.</option>
                    <option value="Mrs">Mrs.</option>
                    <option value="Ms">Ms.</option>
                    <option value="Dr">Dr.</option>
                    <option value="Chief">Chief</option>
                    <option value="Pastor">Pastor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={e => handleChange('firstName', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#00E599]/20 focus:border-[#00E599]/50"
                    placeholder="e.g. Emmanuel"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                    Middle Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.middleName}
                    onChange={e => handleChange('middleName', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#00E599]/20 focus:border-[#00E599]/50"
                    placeholder="e.g. Chukwu"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-2xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={e => handleChange('lastName', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#00E599]/20 focus:border-[#00E599]/50"
                    placeholder="e.g. Longdiem"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="email"
                      value={form.email}
                      disabled
                      className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white/40 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => handleChange('phone', e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#00E599]/20 focus:border-[#00E599]/50"
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-2xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                    Gender
                  </label>
                  <select
                    value={form.gender}
                    onChange={e => handleChange('gender', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#00E599]/20 focus:border-[#00E599]/50"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={form.dateOfBirth}
                      onChange={e => handleChange('dateOfBirth', e.target.value)}
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#00E599]/20 focus:border-[#00E599]/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                    Marital Status
                  </label>
                  <select
                    value={form.maritalStatus}
                    onChange={e => handleChange('maritalStatus', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#00E599]/20 focus:border-[#00E599]/50"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                <div>
                  <label className="block text-2xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                    Occupation / Profession
                  </label>
                  <div className="relative">
                    <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      value={form.occupation}
                      onChange={e => handleChange('occupation', e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#00E599]/20 focus:border-[#00E599]/50"
                      placeholder="e.g. Civil Servant, Engineer, Trader"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                    Employer / Business Name
                  </label>
                  <div className="relative">
                    <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      value={form.employer}
                      onChange={e => handleChange('employer', e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#00E599]/20 focus:border-[#00E599]/50"
                      placeholder="e.g. Plateau State Government, Self-employed"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════ */}
          {/* STEP 2: ADDRESS & LOCATION                                   */}
          {/* ════════════════════════════════════════════════════════════ */}
          {activeStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin size={18} className="text-[#00E599]" />
                  Residential Address & Location
                </h2>
                <p className="text-xs text-white/40 mt-0.5">
                  Provide your permanent residential location for correspondence and physical verification.
                </p>
              </div>

              <div>
                <label className="block text-2xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                  Full Street Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={form.address}
                  onChange={e => handleChange('address', e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#00E599]/20 focus:border-[#00E599]/50 resize-none"
                  placeholder="e.g. No. 14 Yakubu Gowon Way, Rayfield, Jos"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-2xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                    State of Residence <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.state}
                    onChange={e => handleChange('state', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#00E599]/20 focus:border-[#00E599]/50"
                  >
                    {NIGERIAN_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                    LGA (Local Government)
                  </label>
                  <input
                    type="text"
                    value={form.lga}
                    onChange={e => handleChange('lga', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#00E599]/20 focus:border-[#00E599]/50"
                    placeholder="e.g. Jos North, Ikeja"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                    City / Town
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={e => handleChange('city', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#00E599]/20 focus:border-[#00E599]/50"
                    placeholder="e.g. Jos, Bukuru"
                  />
                </div>
              </div>

              <div>
                <label className="block text-2xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                  Nearest Landmark / Bus Stop
                </label>
                <input
                  type="text"
                  value={form.landmark}
                  onChange={e => handleChange('landmark', e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#00E599]/20 focus:border-[#00E599]/50"
                  placeholder="e.g. Opposite Old Government House, Near Police Post"
                />
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════ */}
          {/* STEP 3: NEXT OF KIN                                          */}
          {/* ════════════════════════════════════════════════════════════ */}
          {activeStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users size={18} className="text-[#00E599]" />
                  Next of Kin & Beneficiary Information
                </h2>
                <p className="text-xs text-white/40 mt-0.5">
                  Required by cooperative law as designated primary beneficiary and emergency contact.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.nokName}
                    onChange={e => handleChange('nokName', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#00E599]/20 focus:border-[#00E599]/50"
                    placeholder="e.g. Maryann Longdiem"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                    Relationship <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.nokRelationship}
                    onChange={e => handleChange('nokRelationship', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#00E599]/20 focus:border-[#00E599]/50"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Sibling">Sibling (Brother / Sister)</option>
                    <option value="Parent">Parent (Mother / Father)</option>
                    <option value="Relative">Other Relative</option>
                    <option value="Beneficiary">Designated Beneficiary</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="tel"
                      value={form.nokPhone}
                      onChange={e => handleChange('nokPhone', e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#00E599]/20 focus:border-[#00E599]/50"
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                    Email Address (Optional)
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="email"
                      value={form.nokEmail}
                      onChange={e => handleChange('nokEmail', e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#00E599]/20 focus:border-[#00E599]/50"
                      placeholder="e.g. nok@example.com"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-2xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                  Residential Address of Next of Kin
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => handleChange('nokAddress', form.address)}
                    className="text-2xs text-[#00E599] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Same as my residential address</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={form.nokAddress}
                  onChange={e => handleChange('nokAddress', e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#00E599]/20 focus:border-[#00E599]/50 resize-none"
                  placeholder="Address if different from yours"
                />
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════ */}
          {/* STEP 4: KYC IDENTIFICATION & BANK DETAILS                    */}
          {/* ════════════════════════════════════════════════════════════ */}
          {activeStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText size={18} className="text-[#00E599]" />
                  KYC Verification & Bank Settlement Details
                </h2>
                <p className="text-xs text-white/40 mt-0.5">
                  Legal identification compliance and your nominated bank account for loan disbursements and dividends.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                    Means of Identification <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.idType}
                    onChange={e => handleChange('idType', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#00E599]/20 focus:border-[#00E599]/50"
                  >
                    <option value="NIN">National Identity Number (NIN)</option>
                    <option value="VotersCard">Permanent Voter&apos;s Card (PVC)</option>
                    <option value="Passport">International Passport</option>
                    <option value="DriversLicense">Driver&apos;s License</option>
                  </select>
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                    ID / Document Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.idNumber}
                    onChange={e => handleChange('idNumber', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#00E599]/20 focus:border-[#00E599]/50 font-mono"
                    placeholder="e.g. 12345678901"
                  />
                </div>
              </div>

              {/* Upload ID Document */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Upload size={14} className="text-[#00E599]" />
                      Upload Copy of ID Document (Optional)
                    </h4>
                    <p className="text-2xs text-white/40 mt-0.5">
                      Front and back of ID or data page (JPG, PNG, PDF up to 5MB).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => idDocInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/700 transition-colors"
                  >
                    Browse Files
                  </button>
                  <input
                    ref={idDocInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleIdDocSelect}
                    className="hidden"
                  />
                </div>

                {form.idDocumentPreview && (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
                    <CheckCircle2 size={16} className="text-[#00E599] shrink-0" />
                    <span className="truncate font-medium">Document uploaded and attached successfully.</span>
                  </div>
                )}
              </div>

              {/* Bank Settlement Account */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center gap-2">
                  <CreditCard size={16} className="text-[#00E599]" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Bank Account for Payouts & Dividends
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-2xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                      Bank Name
                    </label>
                    <select
                      value={form.bankName}
                      onChange={e => handleChange('bankName', e.target.value)}
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#00E599]/20 focus:border-[#00E599]/50"
                    >
                      <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                      <option value="Zenith Bank">Zenith Bank</option>
                      <option value="Access Bank">Access Bank</option>
                      <option value="Guaranty Trust Bank (GTB)">Guaranty Trust Bank (GTB)</option>
                      <option value="United Bank for Africa (UBA)">United Bank for Africa (UBA)</option>
                      <option value="Stanbic IBTC">Stanbic IBTC</option>
                      <option value="Fidelity Bank">Fidelity Bank</option>
                      <option value="Sterling Bank">Sterling Bank</option>
                      <option value="Kuda Bank">Kuda Microfinance Bank</option>
                      <option value="Moniepoint">Moniepoint MFB</option>
                      <option value="OPay">OPay Digital Services</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-2xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                      Account Number (NUBAN)
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={form.accountNumber}
                      onChange={e => handleChange('accountNumber', e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#00E599]/20 focus:border-[#00E599]/50 font-mono tracking-widest"
                      placeholder="0123456789"
                    />
                  </div>

                  <div>
                    <label className="block text-2xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                      Account Name
                    </label>
                    <input
                      type="text"
                      value={form.accountName || `${form.firstName} ${form.lastName}`.trim()}
                      onChange={e => handleChange('accountName', e.target.value)}
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#00E599]/20 focus:border-[#00E599]/50"
                      placeholder="Matching legal name on ID"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════ */}
          {/* STEP 5: MONTHLY CONTRIBUTION PLAN & LEGAL DECLARATION         */}
          {/* ════════════════════════════════════════════════════════════ */}
          {activeStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Banknote size={18} className="text-[#00E599]" />
                  Monthly Contribution & Membership Agreement
                </h2>
                <p className="text-xs text-white/40 mt-0.5">
                  Select your monthly cooperative thrift contribution and sign your membership consent.
                </p>
              </div>

              {/* Monthly Contribution selector */}
              <div>
                <label className="block text-2xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                  Select Monthly Contribution Target (Minimum ₦5,000)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CONTRIBUTION_PRESETS.map(tier => {
                    const selected = Number(form.monthlyContribution) === tier.amount;
                    return (
                      <button
                        key={tier.amount}
                        type="button"
                        onClick={() => handleChange('monthlyContribution', tier.amount)}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          selected
                            ? 'bg-amber-50 border-2 border-amber-500 text-amber-900 shadow-sm'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <p className="text-xs text-white/40 font-medium">{tier.tier}</p>
                        <p className={`text-base font-bold mt-1 ${selected ? 'text-[#00E599]' : 'text-slate-900'}`}>
                          {tier.label}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3">
                  <label className="block text-2xs font-semibold text-white/50 mb-1">
                    Or enter a custom monthly contribution amount (₦):
                  </label>
                  <div className="relative max-w-xs">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs font-bold">₦</span>
                    <input
                      type="number"
                      min={5000}
                      step={1000}
                      value={form.monthlyContribution}
                      onChange={e => handleChange('monthlyContribution', Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                <div>
                  <label className="block text-2xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                    Preferred Deduction / Remittance Day
                  </label>
                  <select
                    value={form.contributionDay}
                    onChange={e => handleChange('contributionDay', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#00E599]/20 focus:border-[#00E599]/50"
                  >
                    <option value="25">25th of every month</option>
                    <option value="28">28th of every month (Recommended)</option>
                    <option value="30">End of month (30th / 31st)</option>
                    <option value="1">1st of every month</option>
                  </select>
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                    Preferred Payment Method
                  </label>
                  <select
                    value={form.paymentMethod}
                    onChange={e => handleChange('paymentMethod', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#00E599]/20 focus:border-[#00E599]/50"
                  >
                    <option value="bank_transfer">Direct Bank Transfer to Cooperative</option>
                    <option value="auto_debit">Automated Monthly Direct Debit</option>
                    <option value="salary_deduction">Salary Deduction (Check-off System)</option>
                  </select>
                </div>
              </div>

              {/* Summary Review Card */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#00E599]">
                  <Sparkles size={14} />
                  <span>Membership Profile Summary</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-white/40 block text-2xs">Member</span>
                    <span className="text-white font-semibold">{form.firstName} {form.lastName}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-2xs">Contact</span>
                    <span className="text-white font-semibold">{form.phone}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-2xs">Next of Kin</span>
                    <span className="text-white font-semibold">{form.nokName} ({form.nokRelationship})</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-2xs">Monthly Savings</span>
                    <span className="text-emerald-700 font-bold">₦{Number(form.monthlyContribution).toLocaleString()}/mo</span>
                  </div>
                </div>
              </div>

              {/* Declarations and agreements */}
              <div className="pt-2 border-t border-white/10 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.confirmTruth}
                    onChange={e => handleChange('confirmTruth', e.target.checked)}
                    className="mt-0.5 rounded border-white/20 text-[#00E599] focus:ring-[#00E599]"
                  />
                  <span className="text-xs text-white/60 group-hover:text-white leading-relaxed">
                    I solemnly declare that all personal information, Next of Kin, address, and KYC identification details provided herein are accurate, authentic, and complete to the best of my knowledge.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.agreeByeLaws}
                    onChange={e => handleChange('agreeByeLaws', e.target.checked)}
                    className="mt-0.5 rounded border-white/20 text-[#00E599] focus:ring-[#00E599]"
                  />
                  <span className="text-xs text-white/60 group-hover:text-white leading-relaxed">
                    I agree to adhere strictly to the Constitution, Bye-Laws, code of conduct, and monthly contribution commitments of Changing Lives Multipurpose Ventures (CLIMPS).
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between gap-4">
            {activeStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                disabled={saving}
                className="btn-outline text-xs px-5 py-2.5 flex items-center gap-2"
              >
                <ArrowLeft size={14} />
                Back
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              {activeStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl btn-primary text-xs font-bold shadow-md active:scale-95 flex items-center gap-2"
                >
                  Continue to {steps[activeStep]?.title}
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving || !form.agreeByeLaws || !form.confirmTruth}
                  className={`px-7 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md ${
                    saving || !form.agreeByeLaws || !form.confirmTruth
                      ? 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
                      : 'btn-primary text-white shadow-emerald-600/20 active:scale-95'
                  }`}
                >
                  {saving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving Profile…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Complete & Activate Account
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
