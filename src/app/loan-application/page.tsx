'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Lock, CreditCard } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LoanSettings {
  processingFeePercent: number;
  interestRatePercent: number;
  defaultFeePercentDaily: number;
  overdueThresholdDays: number;
  proratadays: number;
  loanDurations: number[];
  termsVersion: string;
  agreementVersion: string;
}

interface FormData {
  // Terms
  termsAgreed: boolean | null;
  interestAckAgreed: boolean | null;
  fullTermsAgreed: boolean | null;
  collateralTermsAgreed: boolean | null;
  // Applicant
  applicantName: string;
  applicantPhone: string;
  applicantAddress: string;
  applicantGender: string;
  applicantState: string;
  loanPurpose: string;
  loanPurposeCategory: string;
  // Loan
  loanAmount: string;
  loanDurationMonths: number;
  // Collateral
  collateralType: string;
  chequeNumber: string;
  chequeBank: string;
  assetDescription: string;
  assetValue: string;
  assetOwnership: string;
  // Guarantor
  guarantorName: string;
  guarantorPhone: string;
  guarantorAddress: string;
  // Bank
  accountName: string;
  accountNumber: string;
  bankName: string;
}

const STEPS = [
  { id: 1, label: 'Welcome' },
  { id: 2, label: 'Terms' },
  { id: 3, label: 'Interest Terms' },
  { id: 4, label: 'Full Agreement' },
  { id: 5, label: 'Applicant Info' },
  { id: 6, label: 'Loan Details' },
  { id: 7, label: 'Collateral' },
  { id: 8, label: 'Guarantor' },
  { id: 9, label: 'Bank Details' },
  { id: 10, label: 'Review' },
];

const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const NIGERIA_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara'
];
const LOAN_PURPOSES = ['Personal','Business','Emergency','Education','Medical','Working Capital','Other'];

function formatNGN(val: number) {
  return '₦' + val.toLocaleString('en-NG', { minimumFractionDigits: 0 });
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function formatDate(d: Date) {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function AgreementChoice({
  value,
  onChange,
  error,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all ${
            value === true
              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-md shadow-emerald-950/40'
              : 'border-white/15 bg-white/[0.04] text-white/80 hover:border-emerald-500/40'
          }`}
        >
          ✓ I AGREE
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all ${
            value === false
              ? 'border-red-500 bg-red-500/20 text-red-300 shadow-md'
              : 'border-white/15 bg-white/[0.04] text-white/80 hover:border-red-500/40'
          }`}
        >
          ✗ I DISAGREE
        </button>
      </div>
      {value === false && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-300">
          You must agree to the applicable terms and conditions before proceeding.
        </div>
      )}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

function FormField({
  label,
  required,
  error,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-white/90">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {hint && <p className="text-xs text-white/50">{hint}</p>}
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

function InputField({
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-4 py-3 rounded-xl border text-sm text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
        error ? 'border-red-400 bg-red-500/10' : 'border-white/15 bg-white/[0.05] placeholder-white/40 focus:border-emerald-500'
      }`}
    />
  );
}

function SelectField({
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  error?: string;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-full px-4 py-3 rounded-xl border text-sm text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
        error ? 'border-red-400 bg-red-500/10' : 'border-white/15 bg-[#0d1527] focus:border-emerald-500'
      }`}
    >
      {placeholder && <option value="" className="bg-[#0d1527] text-white">{placeholder}</option>}
      {options.map(o => (
        <option key={o} value={o} className="bg-[#0d1527] text-white">{o}</option>
      ))}
    </select>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LoanApplicationPage() {
  const { user, profile, isAdmin, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [settings, setSettings] = useState<LoanSettings>({
    processingFeePercent: 1,
    interestRatePercent: 10,
    defaultFeePercentDaily: 1,
    overdueThresholdDays: 15,
    proratadays: 14,
    loanDurations: [3, 4, 5, 6, 12, 24],
    termsVersion: 'v1.0',
    agreementVersion: 'v1.0',
  });

  const [form, setForm] = useState<FormData>({
    termsAgreed: null,
    interestAckAgreed: null,
    fullTermsAgreed: null,
    collateralTermsAgreed: null,
    applicantName: '',
    applicantPhone: '',
    applicantAddress: '',
    applicantGender: '',
    applicantState: '',
    loanPurpose: '',
    loanPurposeCategory: 'personal',
    loanAmount: '',
    loanDurationMonths: 3,
    collateralType: 'undated_cheque',
    chequeNumber: '',
    chequeBank: '',
    assetDescription: '',
    assetValue: '',
    assetOwnership: '',
    guarantorName: '',
    guarantorPhone: '',
    guarantorAddress: '',
    accountName: '',
    accountNumber: '',
    bankName: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [applicationNumber, setApplicationNumber] = useState('');

  // Load settings
  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'loan_processing_fee_percent',
          'loan_interest_rate_percent',
          'loan_default_fee_percent_daily',
          'loan_overdue_threshold_days',
          'loan_prorata_days',
          'loan_durations',
          'loan_terms_version',
          'loan_agreement_version',
        ]);
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((r: any) => { map[r.setting_key] = r.setting_value; });
        setSettings({
          processingFeePercent: Number(map['loan_processing_fee_percent'] || 1),
          interestRatePercent: Number(map['loan_interest_rate_percent'] || 10),
          defaultFeePercentDaily: Number(map['loan_default_fee_percent_daily'] || 1),
          overdueThresholdDays: Number(map['loan_overdue_threshold_days'] || 15),
          proratadays: Number(map['loan_prorata_days'] || 14),
          loanDurations: map['loan_durations']
            ? JSON.parse(map['loan_durations'])
            : [3, 4, 5, 6, 12, 24],
          termsVersion: map['loan_terms_version'] || 'v1.0',
          agreementVersion: map['loan_agreement_version'] || 'v1.0',
        });
      }
    }
    loadSettings();
  }, []);

  // Pre-fill user profile
  useEffect(() => {
    if (user?.email) {
      if (profile?.full_name && !form.applicantName) {
        setForm(f => ({ ...f, applicantName: profile.full_name }));
      }
      if (profile?.phone && !form.applicantPhone) {
        setForm(f => ({ ...f, applicantPhone: profile.phone }));
      }
    }
  }, [user, profile]);

  const setField = useCallback((key: keyof FormData, value: any) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  }, []);

  // Loan calculations
  const loanAmount = parseFloat(form.loanAmount.replace(/,/g, '')) || 0;
  const processingFee = (loanAmount * settings.processingFeePercent) / 100;
  const monthlyInterest = (loanAmount * settings.interestRatePercent) / 100;
  const totalInterest = monthlyInterest * form.loanDurationMonths;
  const totalRepayment = loanAmount + totalInterest;
  const today = new Date();
  const maturityDate = form.loanDurationMonths > 0 ? addMonths(today, form.loanDurationMonths) : null;

  function validateStep(s: number): boolean {
    const errs: Record<string, string> = {};
    if (s === 2) {
      if (form.termsAgreed === null) errs.termsAgreed = 'Please select I AGREE or I DISAGREE.';
    }
    if (s === 3) {
      if (form.interestAckAgreed === null) errs.interestAckAgreed = 'Please acknowledge interest terms.';
    }
    if (s === 4) {
      if (form.fullTermsAgreed === null) errs.fullTermsAgreed = 'Please acknowledge full agreement.';
    }
    if (s === 5) {
      if (!form.applicantName.trim()) errs.applicantName = 'Applicant name is required.';
      if (!form.applicantPhone.trim()) errs.applicantPhone = 'Phone number is required.';
      if (!form.applicantAddress.trim()) errs.applicantAddress = 'Address is required.';
      if (!form.applicantGender) errs.applicantGender = 'Gender is required.';
      if (!form.applicantState) errs.applicantState = 'State is required.';
      if (!form.loanPurpose) errs.loanPurpose = 'Purpose of loan is required.';
    }
    if (s === 6) {
      if (!form.loanAmount || loanAmount <= 0) errs.loanAmount = 'Please enter a valid loan amount.';
      if (loanAmount < 50000) errs.loanAmount = 'Minimum loan amount is ₦50,000.';
      if (!form.loanDurationMonths) errs.loanDurationMonths = 'Please select a duration.';
    }
    if (s === 7) {
      if (form.collateralTermsAgreed === null) errs.collateralTermsAgreed = 'Please acknowledge collateral terms.';
      if (form.collateralType === 'undated_cheque' || form.collateralType === 'both') {
        if (!form.chequeNumber.trim()) errs.chequeNumber = 'Cheque number is required.';
        if (!form.chequeBank.trim()) errs.chequeBank = 'Cheque bank is required.';
      }
      if (form.collateralType === 'asset' || form.collateralType === 'both') {
        if (!form.assetDescription.trim()) errs.assetDescription = 'Asset description is required.';
        if (!form.assetValue.trim()) errs.assetValue = 'Asset value is required.';
        if (!form.assetOwnership.trim()) errs.assetOwnership = 'Ownership info is required.';
      }
    }
    if (s === 8) {
      if (!form.guarantorName.trim()) errs.guarantorName = 'Guarantor name is required.';
      if (!form.guarantorPhone.trim()) errs.guarantorPhone = 'Guarantor phone is required.';
      if (!form.guarantorAddress.trim()) errs.guarantorAddress = 'Guarantor address is required.';
    }
    if (s === 9) {
      if (!form.accountName.trim()) errs.accountName = 'Account name is required.';
      if (!form.accountNumber.trim()) errs.accountNumber = 'Account number is required.';
      else if (!/^\d{10}$/.test(form.accountNumber.trim())) errs.accountNumber = 'Must be 10 digits.';
      if (!form.bankName.trim()) errs.bankName = 'Bank name is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (!validateStep(step)) return;
    if (step === 2 && form.termsAgreed === false) return;
    if (step === 3 && form.interestAckAgreed === false) return;
    if (step === 4 && form.fullTermsAgreed === false) return;
    if (step === 7 && form.collateralTermsAgreed === false) return;
    setStep(s => Math.min(STEPS.length, s + 1));
  }

  function handleBack() {
    setStep(s => Math.max(1, s - 1));
  }

  async function handleSubmit() {
    if (!validateStep(9)) return;
    if (!user) {
      setSubmitError('You must be signed in to submit a loan application.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      let memberId: string | null = null;
      let membershipNo: string | null = null;
      if (user?.email) {
        const { data: memberData } = await supabase
          .from('members')
          .select('id, membership_no')
          .ilike('email', user.email)
          .maybeSingle();
        if (memberData) {
          memberId = memberData.id;
          membershipNo = memberData.membership_no;
        }
      }

      const resolvedRole = isAdmin ? 'administrator' : 'member';
      const year = new Date().getFullYear();
      const rand = Math.floor(1000 + Math.random() * 9000);
      const appNum = `CLMV/LOAN/${year}/${rand}`;

      const notesMetadata = {
        applicant_address: form.applicantAddress,
        applicant_gender: form.applicantGender,
        applicant_state: form.applicantState,
        processing_fee_percent: settings.processingFeePercent,
        processing_fee_amount: processingFee,
        monthly_interest_rate_percent: settings.interestRatePercent,
        monthly_interest_amount: monthlyInterest,
        total_interest_amount: totalInterest,
        total_repayment_amount: totalRepayment,
        account_name: form.accountName,
        account_number: form.accountNumber,
        bank_name: form.bankName,
        collateral_type: form.collateralType,
        asset_description: form.assetDescription || null,
        asset_value: form.assetValue ? parseFloat(form.assetValue) : null,
        cheque_number: form.chequeNumber || null,
        cheque_bank: form.chequeBank || null,
        guarantor_name: form.guarantorName,
        guarantor_phone: form.guarantorPhone,
        guarantor_address: form.guarantorAddress,
        terms_agreed: form.termsAgreed === true,
        terms_agreed_at: new Date().toISOString(),
        terms_version: settings.termsVersion,
        interest_ack_agreed: form.interestAckAgreed === true,
        full_terms_agreed: form.fullTermsAgreed === true,
        collateral_terms_agreed: form.collateralTermsAgreed === true,
        agreement_version: settings.agreementVersion,
        resolved_role: resolvedRole,
      };

      const dbPayload = {
        applicant_name: form.applicantName,
        applicant_email: user?.email || '',
        applicant_phone: form.applicantPhone,
        membership_no: membershipNo,
        amount: loanAmount,
        purpose: form.loanPurpose,
        purpose_category: (form.loanPurposeCategory || 'personal').toLowerCase(),
        repayment_period_months: form.loanDurationMonths,
        app_no: appNum,
        status: 'pending',
        member_id: memberId,
        submitted_by_user_id: user.id,
        notes: JSON.stringify(notesMetadata),
      };

      let appId = 'app_' + Date.now();
      const { data: appData, error: appError } = await supabase
        .from('loan_applications')
        .insert(dbPayload)
        .select('id')
        .single();

      if (appError) {
        console.error('Supabase loan insert error:', appError);
        throw new Error(`Failed to submit loan application: ${appError.message}`);
      }

      if (appData?.id) {
        appId = appData.id;
      }

      // Cache locally for instant reflection across dashboards
      try {
        const cachedApp = {
          ...dbPayload,
          ...notesMetadata,
          id: appId,
          application_number: appNum,
          requested_amount: loanAmount,
          loan_amount: loanAmount,
          duration_months: form.loanDurationMonths,
          loan_duration_months: form.loanDurationMonths,
          app_status: 'pending',
          application_status: 'pending',
          created_at: new Date().toISOString(),
        };
        const existingApps = JSON.parse(localStorage.getItem('climps_loan_applications') || '[]');
        localStorage.setItem(
          'climps_loan_applications',
          JSON.stringify([cachedApp, ...existingApps.filter((a: any) => a.application_number !== appNum && a.app_no !== appNum)])
        );
      } catch {}

      // Dispatch email notification to Admin for new loan application
      try {
        await fetch('/api/notifications/loan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'loan_applied',
            data: {
              applicationId: appId,
              applicationNumber: appNum,
              applicantName: form.applicantName,
              applicantPhone: form.applicantPhone,
              applicantEmail: user?.email || '',
              loanAmount: loanAmount,
              loanDurationMonths: form.loanDurationMonths,
              loanPurpose: form.loanPurpose,
              monthlyInterestAmount: monthlyInterest,
              totalRepaymentAmount: totalRepayment,
              accountName: form.accountName,
              accountNumber: form.accountNumber,
              bankName: form.bankName,
              collateralType: form.collateralType,
              guarantorName: form.guarantorName,
              guarantorPhone: form.guarantorPhone,
            },
          }),
        });
      } catch (notifyErr) {
        console.warn('Loan notification to admin dispatched with fallback:', notifyErr);
      }

      setApplicationNumber(appNum);
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex flex-col justify-center items-center px-4 py-12 selection:bg-emerald-500/30 selection:text-emerald-200">
        <div className="max-w-md w-full bg-[#0d1527] border border-white/10 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-emerald-500/20">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Sign In Required</h2>
          <p className="text-white/60 text-sm mb-6 leading-relaxed">
            You must be signed in to submit a loan application. If you don't have an account, contact the cooperative administrator to get provisioned.
          </p>
          <div className="space-y-3">
            <Link
              href="/login?redirect=/loan-application"
              className="block w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-emerald-950/40"
            >
              Sign In to Continue
            </Link>
            <Link
              href="/landing"
              className="block w-full py-2.5 px-4 text-white/50 hover:text-white font-medium text-sm transition-colors"
            >
              Return to Landing Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4 selection:bg-emerald-500/30 selection:text-emerald-200">
        <div className="bg-[#0d1527] border border-white/10 rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Application Submitted!</h2>
          <p className="text-white/60 mb-5 text-sm">Your loan application has been received and is under review.</p>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-6">
            <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-1">Application Reference</p>
            <p className="text-xl font-bold text-white font-mono">{applicationNumber}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 mb-6 text-left text-sm text-white/80">
            <p className="font-semibold text-white mb-2">What happens next?</p>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-white/60">
              <li>Admin reviews your application</li>
              <li>Guarantor verification</li>
              <li>Collateral review</li>
              <li>Loan approval notification</li>
              <li>Processing fee settlement</li>
              <li>Disbursement to your bank account</li>
            </ol>
          </div>
          <div className="flex gap-3">
            <Link href="/member-dashboard" className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-md text-center">
              Go to Dashboard
            </Link>
            <Link href="/loan-dashboard" className="flex-1 py-3 px-4 rounded-xl border border-white/20 hover:bg-white/10 text-white font-semibold text-sm transition-all text-center">
              View Loan Status
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Header */}
      <div className="bg-[#0a0f1e]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-20 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Link href="/loan-products" className="text-sm text-white/60 hover:text-white flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <span className="text-xs font-medium text-white/40">Step {step} of {STEPS.length}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500 shadow-sm shadow-emerald-500/50"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* ── STEP 1: Welcome ── */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 backdrop-blur-md">
                <CreditCard className="w-4 h-4" />
                Loan Application
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 tracking-tight">
                CHANGING LIVES MULTIPURPOSE VENTURES
              </h1>
              <h2 className="text-base font-semibold text-emerald-400 mb-6">PERSONAL LOAN APPLICATION FORM</h2>
            </div>
            <div className="bg-[#0d1527] rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <p className="text-sm text-white/70 leading-relaxed">
                  Please fill out the following information completely and accurately. By completing this form, you indicate that you have read and agreed to the Terms and Conditions governing this transaction.
                </p>
              </div>
              <div className="border-t border-white/10 pt-4">
                <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">This application covers:</p>
                <div className="grid grid-cols-2 gap-2">
                  {['Loan Terms & Conditions','Interest Acknowledgement','Applicant Information','Loan Amount & Duration','Collateral Details','Guarantor Details','Bank Details','Review & Submit'].map(item => (
                    <div key={item} className="flex items-center gap-2 text-xs text-white/80">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 text-sm text-amber-200">
              <p className="font-semibold text-amber-300 mb-1">Important Notice</p>
              <p className="text-xs text-white/70 leading-relaxed">Changing Lives Multipurpose Ventures lends money to its members and deserving members of the public on recommendation by a member who will serve as a guarantor.</p>
            </div>
          </div>
        )}

        {/* ── STEP 2: Loan Terms & Conditions ── */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">19. LOAN TERMS & CONDITIONS</h2>
              <p className="text-sm text-white/50">Please read carefully before proceeding</p>
            </div>
            <div className="bg-[#0d1527] border border-white/10 rounded-3xl p-6 sm:p-7 space-y-4">
              <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">READ ME PLEASE</p>
              <div className="space-y-3 text-sm">
                <div className="bg-[#0a0f1e] rounded-xl p-4 border border-white/10">
                  <p className="font-semibold text-emerald-400 mb-1 text-xs">Processing & Administrative Fee</p>
                  <p className="text-xs leading-relaxed text-white/70">
                    WE CHARGE ONE PERCENT (1%) OF THE LOAN SUM UPFRONT AS PROCESSING AND ADMINISTRATIVE FEE RESPECTIVELY.
                  </p>
                </div>
                <div className="bg-[#0a0f1e] rounded-xl p-4 border border-white/10">
                  <p className="font-semibold text-emerald-400 mb-1 text-xs">Monthly Interest</p>
                  <p className="text-xs leading-relaxed text-white/70">
                    INTEREST (10% MONTHLY) MUST BE PAID MONTHLY. DEFAULT IN REPAYMENT OF THE INTEREST WILL ATTRACT THE DEFAULTING FEE OF ONE PERCENT (1%) OF INTEREST DAILY.
                  </p>
                </div>
                <div className="bg-[#0a0f1e] rounded-xl p-4 border border-white/10">
                  <p className="font-semibold text-emerald-400 mb-1 text-xs">Overdue Interest</p>
                  <p className="text-xs leading-relaxed text-white/70">
                    ANY INTEREST REMAINING UNPAID ON OR BEYOND FIFTEEN (15) DAYS SHALL BE CONSIDERED OVERDUE AND SHALL ATTRACT CHARGES APPLICABLE FOR THE FULL MONTH.
                  </p>
                </div>
                <div className="bg-[#0a0f1e] rounded-xl p-4 border border-white/10">
                  <p className="font-semibold text-emerald-400 mb-1 text-xs">Pro-Rata Calculation</p>
                  <p className="text-xs leading-relaxed text-white/70">
                    INTEREST PAYMENT MADE WITHIN THE FIRST 14 DAYS SHALL BE CALCULATED ON A PRO-RATA BASIS.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-[#0d1527] rounded-3xl border border-white/10 p-6 shadow-xl">
              <p className="text-sm font-semibold text-white mb-3">Do you agree to these terms?</p>
              <AgreementChoice
                value={form.termsAgreed}
                onChange={v => setField('termsAgreed', v)}
                error={errors.termsAgreed}
              />
            </div>
          </div>
        )}

        {/* ── STEP 3: Interest Payment Acknowledgement ── */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">21. INTEREST PAYMENT ACKNOWLEDGEMENT</h2>
              <p className="text-sm text-white/50">Mandatory acknowledgement required</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-6">
              <p className="text-sm text-emerald-200 leading-relaxed font-medium">
                "Interest shall be paid monthly as it falls due and shall not be accumulated or deferred for payment at the end of the loan tenure to avoid attracting 1% daily defaulting fee on the Interest."
              </p>
            </div>
            <div className="bg-[#0d1527] rounded-3xl border border-white/10 p-6 shadow-xl">
              <p className="text-sm font-semibold text-white mb-3">Do you acknowledge and agree?</p>
              <AgreementChoice
                value={form.interestAckAgreed}
                onChange={v => setField('interestAckAgreed', v)}
                error={errors.interestAckAgreed}
              />
            </div>
          </div>
        )}

        {/* ── STEP 4: Full Terms Acknowledgement ── */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">22. FULL TERMS ACKNOWLEDGEMENT</h2>
              <p className="text-sm text-white/50">Agreement version: {settings.agreementVersion}</p>
            </div>
            <div className="bg-[#0d1527] border border-white/10 rounded-3xl p-6 space-y-3">
              <p className="text-sm text-white/80 leading-relaxed">
                Kindly read and ensure you fully understand the Terms and Conditions before completing this form.
              </p>
              <p className="text-sm text-white/80 leading-relaxed">
                By completing and submitting this form, you acknowledge that you have read, <strong className="text-white">UNDERSTOOD</strong> and <strong className="text-white">AGREED</strong> to be bound by the Terms and Conditions governing this transaction.
              </p>
              <p className="text-sm text-white/80 leading-relaxed font-medium">
                By accepting this offer, you indicate that you <strong className="text-emerald-400">UNCONDITIONALLY</strong> accept the terms of this agreement, and you agree to abide by them.
              </p>
            </div>
            <div className="bg-[#0d1527] rounded-3xl border border-white/10 p-6 shadow-xl">
              <p className="text-sm font-semibold text-white mb-1">Do you agree to the full terms?</p>
              <p className="text-xs text-white/40 mb-3">Agreement recorded with date/time and applicant details</p>
              <AgreementChoice
                value={form.fullTermsAgreed}
                onChange={v => setField('fullTermsAgreed', v)}
                error={errors.fullTermsAgreed}
              />
            </div>
          </div>
        )}

        {/* ── STEP 5: Applicant Information ── */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">23. LOAN APPLICANT INFORMATION</h2>
              <p className="text-sm text-white/50">All fields are mandatory</p>
            </div>
            <div className="bg-[#0d1527] rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-7 space-y-4">
              <FormField label="Name of Applicant" required error={errors.applicantName}>
                <InputField
                  value={form.applicantName}
                  onChange={v => setField('applicantName', v)}
                  placeholder="Full legal name"
                  error={errors.applicantName}
                />
              </FormField>
              <FormField label="Applicant's Phone Number" required error={errors.applicantPhone}>
                <InputField
                  value={form.applicantPhone}
                  onChange={v => setField('applicantPhone', v)}
                  placeholder="e.g. 08012345678"
                  type="tel"
                  error={errors.applicantPhone}
                />
              </FormField>
              <FormField label="Applicant's Address" required error={errors.applicantAddress}>
                <textarea
                  value={form.applicantAddress}
                  onChange={e => setField('applicantAddress', e.target.value)}
                  placeholder="Full residential address"
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl border text-sm text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none ${
                    errors.applicantAddress ? 'border-red-400 bg-red-500/10' : 'border-white/15 bg-white/[0.05] placeholder-white/40 focus:border-emerald-500'
                  }`}
                />
                {errors.applicantAddress && <p className="text-red-400 text-xs mt-1">{errors.applicantAddress}</p>}
              </FormField>
              <FormField label="Gender" required error={errors.applicantGender}>
                <SelectField
                  value={form.applicantGender}
                  onChange={v => setField('applicantGender', v)}
                  options={GENDER_OPTIONS}
                  placeholder="Select gender"
                  error={errors.applicantGender}
                />
              </FormField>
              <FormField label="State of Domicile" required hint="Where you reside." error={errors.applicantState}>
                <SelectField
                  value={form.applicantState}
                  onChange={v => setField('applicantState', v)}
                  options={NIGERIA_STATES}
                  placeholder="Select state"
                  error={errors.applicantState}
                />
              </FormField>
              <FormField label="Purpose of Loan" required error={errors.loanPurpose}>
                <SelectField
                  value={form.loanPurpose}
                  onChange={v => setField('loanPurpose', v)}
                  options={LOAN_PURPOSES}
                  placeholder="Select purpose"
                  error={errors.loanPurpose}
                />
              </FormField>
            </div>
          </div>
        )}

        {/* ── STEP 6: Loan Details ── */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">24–26. LOAN DETAILS</h2>
              <p className="text-sm text-white/50">Enter loan amount (min ₦50,000) and select duration</p>
            </div>
            <div className="bg-[#0d1527] rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-7 space-y-5">
              <FormField label="Loan Amount Required (₦)" required error={errors.loanAmount}>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-semibold">₦</span>
                  <input
                    type="text"
                    value={form.loanAmount}
                    onChange={e => {
                      const raw = e.target.value.replace(/[^0-9]/g, '');
                      setField('loanAmount', raw ? Number(raw).toLocaleString() : '');
                    }}
                    placeholder="50,000"
                    className={`w-full pl-8 pr-4 py-3 rounded-xl border text-sm text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                      errors.loanAmount ? 'border-red-400 bg-red-500/10' : 'border-white/15 bg-white/[0.05] placeholder-white/40 focus:border-emerald-500'
                    }`}
                  />
                </div>
                {errors.loanAmount && <p className="text-red-400 text-xs mt-1">{errors.loanAmount}</p>}
              </FormField>

              <FormField label="Loan Duration" required error={errors.loanDurationMonths as string}>
                <div className="grid grid-cols-3 gap-2">
                  {settings.loanDurations.map(months => (
                    <button
                      key={months}
                      type="button"
                      onClick={() => setField('loanDurationMonths', months)}
                      className={`py-3 px-2 rounded-xl border-2 font-semibold text-sm transition-all ${
                        form.loanDurationMonths === months
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-md'
                          : 'border-white/15 bg-white/[0.04] text-white/80 hover:border-emerald-500/40'
                      }`}
                    >
                      {months} MONTH{months > 1 ? 'S' : ''}
                    </button>
                  ))}
                </div>
                {errors.loanDurationMonths && <p className="text-red-400 text-xs mt-1">{errors.loanDurationMonths}</p>}
              </FormField>

              {/* Live Calculations */}
              {loanAmount > 0 && form.loanDurationMonths > 0 && (
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3">
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Loan Summary</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Principal Amount</span>
                      <span className="font-semibold text-white">{formatNGN(loanAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Monthly Interest Rate</span>
                      <span className="font-semibold text-emerald-400">{settings.interestRatePercent}% monthly</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Processing Fee ({settings.processingFeePercent}%)</span>
                      <span className="font-semibold text-amber-300">{formatNGN(processingFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Monthly Interest Due</span>
                      <span className="font-semibold text-white">{formatNGN(monthlyInterest)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Duration</span>
                      <span className="font-semibold text-white">{form.loanDurationMonths} month{form.loanDurationMonths > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Total Interest</span>
                      <span className="font-semibold text-white">{formatNGN(totalInterest)}</span>
                    </div>
                    <div className="border-t border-white/10 pt-2 flex justify-between">
                      <span className="font-bold text-white">Total Repayment</span>
                      <span className="font-bold text-emerald-400 text-base">{formatNGN(totalRepayment)}</span>
                    </div>
                    {maturityDate && (
                      <div className="flex justify-between text-xs text-white/50">
                        <span>Estimated Maturity</span>
                        <span>{formatDate(maturityDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 7: Collateral ── */}
        {step === 7 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">27–28. COLLATERAL</h2>
              <p className="text-sm text-white/50">Undated cheque and assets equivalent to the loan requested</p>
            </div>

            <div className="bg-red-500/10 border-l-4 border-red-500 rounded-r-2xl p-4">
              <p className="text-xs font-bold text-red-300 uppercase tracking-wider mb-1">28. DEFAULT/COLLATERAL TERMS</p>
              <p className="text-sm text-red-200 font-medium leading-relaxed">
                "THE COOPERATIVE WILL SELL THE COLLATERAL OFFERED TO RECOVER ITS LOAN IF YOU DEFAULT IN PAYING YOUR LOAN AFTER 3 MONTHS."
              </p>
            </div>
            <div className="bg-[#0d1527] rounded-3xl border border-white/10 p-6 shadow-xl">
              <p className="text-sm font-semibold text-white mb-3">Do you acknowledge and agree to the collateral terms?</p>
              <AgreementChoice
                value={form.collateralTermsAgreed}
                onChange={v => setField('collateralTermsAgreed', v)}
                error={errors.collateralTermsAgreed}
              />
            </div>

            <div className="bg-[#0d1527] rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-7 space-y-4">
              <p className="text-sm font-semibold text-white">27. COLLATERAL OFFERED</p>
              <FormField label="Collateral Type" required>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'undated_cheque', label: 'Undated Cheque' },
                    { value: 'asset', label: 'Asset' },
                    { value: 'both', label: 'Both' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setField('collateralType', opt.value)}
                      className={`py-2.5 px-2 rounded-xl border-2 font-medium text-xs transition-all ${
                        form.collateralType === opt.value
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                          : 'border-white/15 bg-white/[0.04] text-white/80 hover:border-emerald-500/40'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </FormField>

              {(form.collateralType === 'undated_cheque' || form.collateralType === 'both') && (
                <div className="space-y-3 border-t border-white/10 pt-3">
                  <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Undated Cheque Details</p>
                  <FormField label="Cheque Number" required error={errors.chequeNumber}>
                    <InputField value={form.chequeNumber} onChange={v => setField('chequeNumber', v)} placeholder="Cheque number" error={errors.chequeNumber} />
                  </FormField>
                  <FormField label="Issuing Bank" required error={errors.chequeBank}>
                    <InputField value={form.chequeBank} onChange={v => setField('chequeBank', v)} placeholder="Bank name" error={errors.chequeBank} />
                  </FormField>
                </div>
              )}

              {(form.collateralType === 'asset' || form.collateralType === 'both') && (
                <div className="space-y-3 border-t border-white/10 pt-3">
                  <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Asset Details</p>
                  <FormField label="Asset Description" required error={errors.assetDescription}>
                    <textarea
                      value={form.assetDescription}
                      onChange={e => setField('assetDescription', e.target.value)}
                      placeholder="Describe the asset offered as collateral"
                      rows={2}
                      className={`w-full px-4 py-3 rounded-xl border text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none ${
                        errors.assetDescription ? 'border-red-400 bg-red-500/10' : 'border-white/15 bg-white/[0.05] placeholder-white/40 focus:border-emerald-500'
                      }`}
                    />
                    {errors.assetDescription && <p className="text-red-400 text-xs mt-1">{errors.assetDescription}</p>}
                  </FormField>
                  <FormField label="Asset Value (₦)" required error={errors.assetValue}>
                    <InputField value={form.assetValue} onChange={v => setField('assetValue', v)} placeholder="Estimated value" type="number" error={errors.assetValue} />
                  </FormField>
                  <FormField label="Ownership Information" required error={errors.assetOwnership}>
                    <InputField value={form.assetOwnership} onChange={v => setField('assetOwnership', v)} placeholder="Owner name and relationship" error={errors.assetOwnership} />
                  </FormField>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 8: Guarantor ── */}
        {step === 8 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">29. GUARANTOR'S DETAILS</h2>
              <p className="text-sm text-white/50">A guarantor is required for loan applications</p>
            </div>
            <div className="bg-[#0d1527] rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-7 space-y-4">
              <FormField label="Guarantor's Name" required error={errors.guarantorName}>
                <InputField value={form.guarantorName} onChange={v => setField('guarantorName', v)} placeholder="Full name of guarantor" error={errors.guarantorName} />
              </FormField>
              <FormField label="Guarantor's Phone Number" required error={errors.guarantorPhone}>
                <InputField value={form.guarantorPhone} onChange={v => setField('guarantorPhone', v)} placeholder="e.g. 08012345678" type="tel" error={errors.guarantorPhone} />
              </FormField>
              <FormField label="Guarantor's Address" required error={errors.guarantorAddress}>
                <textarea
                  value={form.guarantorAddress}
                  onChange={e => setField('guarantorAddress', e.target.value)}
                  placeholder="Full residential address of guarantor"
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl border text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none ${
                    errors.guarantorAddress ? 'border-red-400 bg-red-500/10' : 'border-white/15 bg-white/[0.05] placeholder-white/40 focus:border-emerald-500'
                  }`}
                />
                {errors.guarantorAddress && <p className="text-red-400 text-xs mt-1">{errors.guarantorAddress}</p>}
              </FormField>
            </div>
          </div>
        )}

        {/* ── STEP 9: Bank Details ── */}
        {step === 9 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">30. APPLICANT'S BANK DETAILS</h2>
              <p className="text-sm text-white/50">For loan disbursement</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs font-medium text-amber-200">
              Kindly verify your account details carefully before submission.
            </div>
            <div className="bg-[#0d1527] rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-7 space-y-4">
              <FormField label="Account Name" required error={errors.accountName}>
                <InputField value={form.accountName} onChange={v => setField('accountName', v)} placeholder="Account name as on bank records" error={errors.accountName} />
              </FormField>
              <FormField label="Account Number" required error={errors.accountNumber}>
                <InputField value={form.accountNumber} onChange={v => setField('accountNumber', v)} placeholder="10-digit account number" error={errors.accountNumber} />
              </FormField>
              <FormField label="Bank Name" required error={errors.bankName}>
                <InputField value={form.bankName} onChange={v => setField('bankName', v)} placeholder="Name of bank" error={errors.bankName} />
              </FormField>
            </div>
          </div>
        )}

        {/* ── STEP 10: Review ── */}
        {step === 10 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">32. REVIEW YOUR APPLICATION</h2>
              <p className="text-sm text-white/50">Please review all details before submitting</p>
            </div>

            <ReviewSection title="Applicant Information">
              <ReviewRow label="Name" value={form.applicantName} />
              <ReviewRow label="Phone" value={form.applicantPhone} />
              <ReviewRow label="Address" value={form.applicantAddress} />
              <ReviewRow label="Gender" value={form.applicantGender} />
              <ReviewRow label="State" value={form.applicantState} />
              <ReviewRow label="Loan Purpose" value={form.loanPurpose} />
            </ReviewSection>

            <ReviewSection title="Loan Details">
              <ReviewRow label="Loan Amount" value={formatNGN(loanAmount)} highlight />
              <ReviewRow label="Duration" value={`${form.loanDurationMonths} Month${form.loanDurationMonths > 1 ? 's' : ''}`} />
              <ReviewRow label="Interest Rate" value={`${settings.interestRatePercent}% monthly`} />
              <ReviewRow label="Processing Fee (1%)" value={formatNGN(processingFee)} />
              <ReviewRow label="Monthly Interest" value={formatNGN(monthlyInterest)} />
              <ReviewRow label="Total Interest" value={formatNGN(totalInterest)} />
              <ReviewRow label="Total Repayment" value={formatNGN(totalRepayment)} highlight />
            </ReviewSection>

            <ReviewSection title="Collateral">
              <ReviewRow label="Type" value={form.collateralType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} />
              {form.chequeNumber && <ReviewRow label="Cheque No." value={form.chequeNumber} />}
              {form.chequeBank && <ReviewRow label="Cheque Bank" value={form.chequeBank} />}
              {form.assetDescription && <ReviewRow label="Asset" value={form.assetDescription} />}
              {form.assetValue && <ReviewRow label="Asset Value" value={formatNGN(parseFloat(form.assetValue))} />}
            </ReviewSection>

            <ReviewSection title="Guarantor">
              <ReviewRow label="Name" value={form.guarantorName} />
              <ReviewRow label="Phone" value={form.guarantorPhone} />
              <ReviewRow label="Address" value={form.guarantorAddress} />
            </ReviewSection>

            <ReviewSection title="Bank Details">
              <ReviewRow label="Account Name" value={form.accountName} />
              <ReviewRow label="Account Number" value={`****${form.accountNumber.slice(-4)}`} />
              <ReviewRow label="Bank" value={form.bankName} />
            </ReviewSection>

            <ReviewSection title="Terms & Agreements">
              <ReviewRow label="Loan Terms" value={form.termsAgreed ? '✓ Agreed' : '✗ Not agreed'} />
              <ReviewRow label="Interest Acknowledgement" value={form.interestAckAgreed ? '✓ Agreed' : '✗ Not agreed'} />
              <ReviewRow label="Full Terms" value={form.fullTermsAgreed ? '✓ Agreed' : '✗ Not agreed'} />
              <ReviewRow label="Collateral Terms" value={form.collateralTermsAgreed ? '✓ Agreed' : '✗ Not agreed'} />
            </ReviewSection>

            {submitError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-sm text-red-400">
                {submitError}
              </div>
            )}
          </div>
        )}

        {/* ── Navigation Buttons ── */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 py-3.5 px-6 rounded-xl border border-white/20 bg-white/[0.04] text-white font-semibold text-sm hover:bg-white/10 transition-colors"
            >
              Back
            </button>
          )}
          {step < STEPS.length ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={
                (step === 2 && form.termsAgreed === false) ||
                (step === 3 && form.interestAckAgreed === false) ||
                (step === 4 && form.fullTermsAgreed === false) ||
                (step === 7 && form.collateralTermsAgreed === false)
              }
              className="flex-1 py-3.5 px-6 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-950/40"
            >
              {step === 1 ? 'Start Application' : 'Continue'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3.5 px-6 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </>
              ) : 'Confirm and Submit Loan Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Review Helpers ───────────────────────────────────────────────────────────
function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#0d1527] rounded-2xl border border-white/10 shadow-xl overflow-hidden">
      <div className="bg-white/[0.03] border-b border-white/10 px-5 py-3">
        <p className="text-xs font-bold text-white/50 uppercase tracking-wider">{title}</p>
      </div>
      <div className="p-5 space-y-2">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-sm text-white/50 shrink-0">{label}</span>
      <span className={`text-sm text-right ${highlight ? 'font-bold text-emerald-400' : 'font-medium text-white/90'}`}>
        {value || '—'}
      </span>
    </div>
  );
}
