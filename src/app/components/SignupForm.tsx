'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2, CheckCircle2, ChevronRight, ChevronLeft, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

interface SignupData {
  // Step 1 — Personal
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  dob: string;
  // Step 2 — Contact
  phone: string;
  email: string;
  address: string;
  state: string;
  lga: string;
  occupation: string;
  employer: string;
  // Step 3 — Next of Kin
  nokName: string;
  nokRelationship: string;
  nokPhone: string;
  nokAddress: string;
  // Step 4 — Account
  password: string;
  confirmPassword: string;
  idType: string;
  idNumber: string;
  agreeTerms: boolean;
}

const nigerianStates = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara',
];

const steps = [
  { id: 1, label: 'Personal Info' },
  { id: 2, label: 'Contact' },
  { id: 3, label: 'Next of Kin' },
  { id: 4, label: 'Account Setup' },
];

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const strength = checks.filter(Boolean).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-destructive', 'bg-warning', 'bg-blue-500', 'bg-accent'];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div
            key={`strength-bar-${i}`}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= strength ? colors[strength] : 'bg-white/[0.06]'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${strength <= 1 ? 'text-red-400' : strength === 2 ? 'text-warning' : strength === 3 ? 'text-blue-600' : 'text-blue-400'}`}>
        {labels[strength]} password
      </p>
    </div>
  );
}

export default function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [appRef, setAppRef] = useState('');
  const { signUp } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<SignupData>({ mode: 'onBlur' });

  const password = watch('password', '');

  const stepFields: Record<number, (keyof SignupData)[]> = {
    1: ['firstName', 'lastName', 'gender', 'dob'],
    2: ['phone', 'email', 'address', 'state', 'occupation'],
    3: ['nokName', 'nokRelationship', 'nokPhone'],
    4: ['password', 'confirmPassword', 'idType', 'idNumber', 'agreeTerms'],
  };

  const handleNext = async () => {
    const valid = await trigger(stepFields[step]);
    if (valid) setStep(s => s + 1);
  };

  const onSubmit = async (data: SignupData) => {
    setLoading(true);
    try {
      await signUp(data.email, data.password, {
        fullName: `${data.firstName} ${data.lastName}`.trim(),
      });
      const ref = `APP/2026/${Math.floor(100000 + Math.random() * 900000)}`;
      setAppRef(ref);
      setLoading(false);
      setSubmitted(true);
      toast.success('Registration submitted! Your application is under review.');
    } catch (error: any) {
      toast.error(error?.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8 slide-up">
        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-blue-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Application Submitted!</h3>
        <p className="text-sm text-white/50 mb-1">
          Your membership application has been received and is under review.
        </p>
        <p className="text-sm text-white/50 mb-6">
          You will receive a notification once approved. Your Member ID will be issued upon approval.
        </p>
        <div className="bg-white/[0.04]/50 rounded-2xl p-4 mb-6 text-left">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Application Reference</p>
          <p className="text-base font-bold text-emerald-400 font-tabular">{appRef}</p>
          <p className="text-xs text-white/50 mt-1">Save this reference for follow-up enquiries</p>
        </div>
        <button onClick={onSwitchToLogin} className="btn-primary w-full">
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="slide-up">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Create Account</h2>
        <p className="text-sm text-white/50 mt-1">Join CLIMPS cooperative today</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1.5 mb-7">
        {steps.map((s, idx) => (
          <React.Fragment key={`step-frag-${s.id}`}>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                step > s.id
                  ? 'bg-accent text-white'
                  : step === s.id
                  ? 'bg-emerald-500 text-white' :'bg-white/[0.06] text-white/50'
              }`}>
                {step > s.id ? <CheckCircle2 size={14} /> : s.id}
              </div>
              <span className={`text-2xs font-medium whitespace-nowrap hidden sm:block ${
                step === s.id ? 'text-emerald-400' : 'text-white/50'
              }`}>
                {s.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mb-4 transition-all duration-300 ${
                step > s.id ? 'bg-accent' : 'bg-white/[0.06]'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1 — Personal */}
        {step === 1 && (
          <div className="space-y-4 slide-up">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="label-base">First Name *</label>
                <input
                  id="firstName"
                  className={`input-base ${errors.firstName ? 'border-destructive' : ''}`}
                  placeholder="Adaeze"
                  {...register('firstName', { required: 'First name is required' })}
                />
                {errors.firstName && <p className="error-text">{errors.firstName.message}</p>}
              </div>
              <div>
                <label htmlFor="lastName" className="label-base">Last Name *</label>
                <input
                  id="lastName"
                  className={`input-base ${errors.lastName ? 'border-destructive' : ''}`}
                  placeholder="Okonkwo"
                  {...register('lastName', { required: 'Last name is required' })}
                />
                {errors.lastName && <p className="error-text">{errors.lastName.message}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="middleName" className="label-base">Middle Name</label>
              <input id="middleName" className="input-base" placeholder="Chisom" {...register('middleName')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="gender" className="label-base">Gender *</label>
                <select
                  id="gender"
                  className={`input-base ${errors.gender ? 'border-destructive' : ''}`}
                  {...register('gender', { required: 'Select gender' })}
                >
                  <option value="">Select…</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="prefer-not">Prefer not to say</option>
                </select>
                {errors.gender && <p className="error-text">{errors.gender.message}</p>}
              </div>
              <div>
                <label htmlFor="dob" className="label-base">Date of Birth *</label>
                <input
                  id="dob"
                  type="date"
                  className={`input-base ${errors.dob ? 'border-destructive' : ''}`}
                  {...register('dob', { required: 'Date of birth is required' })}
                />
                {errors.dob && <p className="error-text">{errors.dob.message}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Contact */}
        {step === 2 && (
          <div className="space-y-4 slide-up">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="phone" className="label-base">Phone Number *</label>
                <input
                  id="phone"
                  type="tel"
                  className={`input-base ${errors.phone ? 'border-destructive' : ''}`}
                  placeholder="08012345678"
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: { value: /^0[789][01]\d{8}$/, message: 'Enter a valid Nigerian phone number' },
                  })}
                />
                {errors.phone && <p className="error-text">{errors.phone.message}</p>}
              </div>
              <div>
                <label htmlFor="reg-email" className="label-base">Email Address *</label>
                <input
                  id="reg-email"
                  type="email"
                  className={`input-base ${errors.email ? 'border-destructive' : ''}`}
                  placeholder="you@email.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter valid email' },
                  })}
                />
                {errors.email && <p className="error-text">{errors.email.message}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="address" className="label-base">Residential Address *</label>
              <input
                id="address"
                className={`input-base ${errors.address ? 'border-destructive' : ''}`}
                placeholder="12 Adeola Odeku Street, Victoria Island"
                {...register('address', { required: 'Address is required' })}
              />
              {errors.address && <p className="error-text">{errors.address.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="state" className="label-base">State *</label>
                <select
                  id="state"
                  className={`input-base ${errors.state ? 'border-destructive' : ''}`}
                  {...register('state', { required: 'Select state' })}
                >
                  <option value="">Select state…</option>
                  {nigerianStates.map(s => (
                    <option key={`state-${s}`} value={s}>{s}</option>
                  ))}
                </select>
                {errors.state && <p className="error-text">{errors.state.message}</p>}
              </div>
              <div>
                <label htmlFor="lga" className="label-base">LGA</label>
                <input id="lga" className="input-base" placeholder="Eti-Osa" {...register('lga')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="occupation" className="label-base">Occupation *</label>
                <input
                  id="occupation"
                  className={`input-base ${errors.occupation ? 'border-destructive' : ''}`}
                  placeholder="Software Engineer"
                  {...register('occupation', { required: 'Occupation is required' })}
                />
                {errors.occupation && <p className="error-text">{errors.occupation.message}</p>}
              </div>
              <div>
                <label htmlFor="employer" className="label-base">Employer / Business</label>
                <input id="employer" className="input-base" placeholder="TechCorp Nigeria Ltd" {...register('employer')} />
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Next of Kin */}
        {step === 3 && (
          <div className="space-y-4 slide-up">
            <div className="bg-white/[0.04]/40 rounded-2xl p-3.5 mb-1">
              <p className="text-xs text-white/50">
                Your next of kin will be contacted in case of emergency or if your account requires succession processing.
              </p>
            </div>
            <div>
              <label htmlFor="nokName" className="label-base">Full Name *</label>
              <input
                id="nokName"
                className={`input-base ${errors.nokName ? 'border-destructive' : ''}`}
                placeholder="Emeka Okonkwo"
                {...register('nokName', { required: 'Next of kin name is required' })}
              />
              {errors.nokName && <p className="error-text">{errors.nokName.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="nokRelationship" className="label-base">Relationship *</label>
                <select
                  id="nokRelationship"
                  className={`input-base ${errors.nokRelationship ? 'border-destructive' : ''}`}
                  {...register('nokRelationship', { required: 'Select relationship' })}
                >
                  <option value="">Select…</option>
                  {['Spouse','Parent','Sibling','Child','Cousin','Uncle','Aunt','Friend','Other'].map(r => (
                    <option key={`rel-${r}`} value={r.toLowerCase()}>{r}</option>
                  ))}
                </select>
                {errors.nokRelationship && <p className="error-text">{errors.nokRelationship.message}</p>}
              </div>
              <div>
                <label htmlFor="nokPhone" className="label-base">Phone Number *</label>
                <input
                  id="nokPhone"
                  type="tel"
                  className={`input-base ${errors.nokPhone ? 'border-destructive' : ''}`}
                  placeholder="08098765432"
                  {...register('nokPhone', { required: 'Next of kin phone is required' })}
                />
                {errors.nokPhone && <p className="error-text">{errors.nokPhone.message}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="nokAddress" className="label-base">Address</label>
              <input id="nokAddress" className="input-base" placeholder="Same as applicant / different address" {...register('nokAddress')} />
            </div>
          </div>
        )}

        {/* Step 4 — Account Setup */}
        {step === 4 && (
          <div className="space-y-4 slide-up">
            <div>
              <label htmlFor="reg-password" className="label-base">Create Password *</label>
              <p className="helper-text mb-1.5">Min. 8 characters, include uppercase, number, and special character</p>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`input-base pr-11 ${errors.password ? 'border-destructive' : ''}`}
                  placeholder="Create a strong password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'At least 8 characters required' },
                    pattern: { value: /(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/, message: 'Include uppercase, number, and special character' },
                  })}
                />
                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors" aria-label="Toggle password visibility">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PasswordStrength password={password} />
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="label-base">Confirm Password *</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  className={`input-base pr-11 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                  placeholder="Repeat your password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: v => v === password || 'Passwords do not match',
                  })}
                />
                <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors" aria-label="Toggle confirm password visibility">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="error-text">{errors.confirmPassword.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="idType" className="label-base">ID Type *</label>
                <select
                  id="idType"
                  className={`input-base ${errors.idType ? 'border-destructive' : ''}`}
                  {...register('idType', { required: 'Select ID type' })}
                >
                  <option value="">Select…</option>
                  {['National ID (NIN)','Voter\'s Card','International Passport','Driver\'s Licence','BVN'].map(id => (
                    <option key={`id-type-${id}`} value={id}>{id}</option>
                  ))}
                </select>
                {errors.idType && <p className="error-text">{errors.idType.message}</p>}
              </div>
              <div>
                <label htmlFor="idNumber" className="label-base">ID Number *</label>
                <input
                  id="idNumber"
                  className={`input-base ${errors.idNumber ? 'border-destructive' : ''}`}
                  placeholder="12345678901"
                  {...register('idNumber', { required: 'ID number is required' })}
                />
                {errors.idNumber && <p className="error-text">{errors.idNumber.message}</p>}
              </div>
            </div>
            <div className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center hover:border-primary/40 transition-colors cursor-pointer">
              <Upload size={20} className="text-white/50 mx-auto mb-1.5" />
              <p className="text-sm font-medium text-white">Upload Supporting Documents</p>
              <p className="text-xs text-white/50 mt-0.5">Profile photo, ID scan, utility bill (max 5MB each)</p>
            </div>
            <div className="flex items-start gap-2.5">
              <input
                id="agreeTerms"
                type="checkbox"
                className="w-4 h-4 mt-0.5 rounded border-white/10 text-emerald-400 cursor-pointer"
                {...register('agreeTerms', { required: 'You must accept the terms to continue' })}
              />
              <label htmlFor="agreeTerms" className="text-sm text-white/50 cursor-pointer leading-relaxed">
                I agree to the{' '}
                <span className="font-semibold text-emerald-400">Terms & Conditions</span>,{' '}
                <span className="font-semibold text-emerald-400">Privacy Policy</span>, and{' '}
                <span className="font-semibold text-emerald-400">Membership Agreement</span> of CLIMPS.
              </label>
            </div>
            {errors.agreeTerms && <p className="error-text">{errors.agreeTerms.message}</p>}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="btn-outline flex items-center gap-2 flex-1"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          )}
          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary flex items-center justify-center gap-2 flex-1"
            >
              Next
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="btn-accent flex items-center justify-center gap-2 flex-1 h-11"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Submitting…
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}