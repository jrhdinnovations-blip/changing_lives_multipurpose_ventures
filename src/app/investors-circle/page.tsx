'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldCheck, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft, Lock, TrendingUp, Briefcase, LogIn } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormData {
  termsAgreed: boolean | null;
  feeAgreed: boolean | null;
  investorName: string;
  investorPhone: string;
  investorAddress: string;
  investorGender: string;
  investorEmail: string;
  nokName: string;
  nokAddress: string;
  nokPhone: string;
  investmentAmount: string;
  investmentDuration: string;
  investmentDurationMonths: number;
  accountName: string;
  accountNumber: string;
  bankName: string;
}

interface Settings {
  minAmount: number;
  processingFee: number;
  interestRate: number;
  coopAccountName: string;
  coopAccountNumber: string;
  coopBankName: string;
}

const DURATION_OPTIONS = [
  { label: '3 MONTHS', months: 3 },
  { label: '4 MONTHS', months: 4 },
  { label: '5 MONTHS', months: 5 },
  { label: '6–7 MONTHS', months: 6 },
  { label: '12 MONTHS', months: 12 },
];

const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];

const STEPS = [
  { id: 1, label: 'Welcome' },
  { id: 2, label: 'Terms' },
  { id: 3, label: 'Fee' },
  { id: 4, label: 'Investor Info' },
  { id: 5, label: 'Next of Kin' },
  { id: 6, label: 'Wealth Circle' },
  { id: 7, label: 'Bank Details' },
  { id: 8, label: 'Review' },
];

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

export default function InvestorsCirclePage() {
  const { user, profile, isAdmin, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [settings, setSettings] = useState<Settings>({
    minAmount: 750000,
    processingFee: 3000,
    interestRate: 3.5,
    coopAccountName: 'Changing Lives Multipurpose Cooperative Society',
    coopAccountNumber: '2044406437',
    coopBankName: 'First Bank',
  });

  const [form, setForm] = useState<FormData>({
    termsAgreed: null,
    feeAgreed: null,
    investorName: '',
    investorPhone: '',
    investorAddress: '',
    investorGender: '',
    investorEmail: '',
    nokName: '',
    nokAddress: '',
    nokPhone: '',
    investmentAmount: '',
    investmentDuration: '',
    investmentDurationMonths: 0,
    accountName: '',
    accountNumber: '',
    bankName: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [applicationNumber, setApplicationNumber] = useState('');

  // Load settings from Supabase
  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'investors_circle_min_amount',
          'investors_circle_processing_fee',
          'investors_circle_interest_rate',
          'investors_circle_coop_account_name',
          'investors_circle_coop_account_number',
          'investors_circle_coop_bank_name',
        ]);
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((r: any) => { map[r.setting_key] = r.setting_value; });
        setSettings({
          minAmount: Number(map['investors_circle_min_amount'] || 750000),
          processingFee: Number(map['investors_circle_processing_fee'] || 3000),
          interestRate: Number(map['investors_circle_interest_rate'] || 3.5),
          coopAccountName: map['investors_circle_coop_account_name'] || 'Changing Lives Multipurpose Cooperative Society',
          coopAccountNumber: map['investors_circle_coop_account_number'] || '2044406437',
          coopBankName: map['investors_circle_coop_bank_name'] || 'First Bank',
        });
      }
    }
    loadSettings();
  }, []);

  // Pre-populate email from auth
  useEffect(() => {
    if (user?.email && !form.investorEmail) {
      setForm(f => ({ ...f, investorEmail: user.email }));
    }
    if (profile?.full_name && !form.investorName) {
      setForm(f => ({ ...f, investorName: profile.full_name }));
    }
  }, [user, profile]);

  // Calculations
  const amount = parseFloat(form.investmentAmount.replace(/,/g, '')) || 0;
  const rate = settings.interestRate / 100;
  const monthlyReturn = amount * rate;
  const totalReturn = monthlyReturn * form.investmentDurationMonths;
  const maturityValue = amount + totalReturn;
  const today = new Date();
  const maturityDate = form.investmentDurationMonths > 0 ? addMonths(today, form.investmentDurationMonths) : null;

  const setField = useCallback((key: keyof FormData, value: any) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  }, []);

  function validateStep(s: number): boolean {
    const errs: Record<string, string> = {};
    if (s === 2) {
      if (form.termsAgreed === null) errs.termsAgreed = 'Please select I AGREE or I DISAGREE.';
    }
    if (s === 3) {
      if (form.feeAgreed === null) errs.feeAgreed = 'Please select I agree or I disagree.';
    }
    if (s === 4) {
      if (!form.investorName.trim()) errs.investorName = 'Full legal name is required.';
      if (!form.investorPhone.trim()) errs.investorPhone = 'Phone number is required.';
      if (!form.investorAddress.trim()) errs.investorAddress = 'Address is required.';
      if (!form.investorGender) errs.investorGender = 'Please select a gender.';
      if (!form.investorEmail.trim()) errs.investorEmail = 'Email is required.';
    }
    if (s === 5) {
      if (!form.nokName.trim()) errs.nokName = 'Next of kin name is required.';
      if (!form.nokAddress.trim()) errs.nokAddress = 'Next of kin address is required.';
      if (!form.nokPhone.trim()) errs.nokPhone = 'Next of kin phone is required.';
    }
    if (s === 6) {
      if (!form.investmentAmount || amount < settings.minAmount) {
        errs.investmentAmount = `Minimum investment amount is ${formatNGN(settings.minAmount)}.`;
      }
      if (!form.investmentDuration) errs.investmentDuration = 'Please select a duration.';
    }
    if (s === 7) {
      if (!form.accountName.trim()) errs.accountName = 'Account name is required.';
      if (!form.accountNumber.trim()) errs.accountNumber = 'Account number is required.';
      else if (!/^\d{10}$/.test(form.accountNumber.trim())) errs.accountNumber = 'Account number must be 10 digits.';
      if (!form.bankName.trim()) errs.bankName = 'Bank name is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (!validateStep(step)) return;
    if (step === 2 && form.termsAgreed === false) return;
    if (step === 3 && form.feeAgreed === false) return;
    setStep(s => s + 1);
  }

  function handleBack() {
    setStep(s => Math.max(1, s - 1));
  }

  async function handleSubmit() {
    if (!validateStep(7)) return;
    if (!user) {
      setSubmitError('You must be signed in to submit a Wealth Circle application.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      let memberId: string | null = null;
      if (user) {
        const { data: memberData } = await supabase
          .from('members')
          .select('id')
          .eq('user_id', user.id)
          .single();
        memberId = memberData?.id || null;
      }

      const resolvedRole = isAdmin ? 'administrator' : 'investor';

      const payload = {
        user_id: user?.id || null,
        member_id: memberId,
        terms_agreed: form.termsAgreed === true,
        terms_agreed_at: form.termsAgreed ? new Date().toISOString() : null,
        terms_version: 'v1.0',
        processing_fee_agreed: form.feeAgreed === true,
        processing_fee_amount: settings.processingFee,
        processing_fee_agreed_at: form.feeAgreed ? new Date().toISOString() : null,
        investor_name: form.investorName,
        investor_phone: form.investorPhone,
        investor_address: form.investorAddress,
        investor_gender: form.investorGender.toLowerCase().replace(/ /g, '_'),
        investor_email: form.investorEmail,
        nok_name: form.nokName,
        nok_address: form.nokAddress,
        nok_phone: form.nokPhone,
        investment_amount: amount,
        duration: form.investmentDuration,
        duration_months: form.investmentDurationMonths,
        monthly_return_rate: settings.interestRate,
        monthly_return_amount: monthlyReturn,
        total_return_amount: totalReturn,
        maturity_value: maturityValue,
        account_name: form.accountName,
        account_number: form.accountNumber,
        bank_name: form.bankName,
        status: 'pending_payment',
        role: resolvedRole,
      };

      const { data, error: insertError } = await supabase
        .from('investors_circle_applications')
        .insert(payload)
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      setApplicationNumber(data?.application_number || 'CWC-REF-PENDING');
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Submission failed. Please check your network and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4 selection:bg-emerald-500/30 selection:text-emerald-200">
        <div className="bg-[#0d1527] rounded-3xl shadow-2xl border border-white/10 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Sign In Required</h2>
          <p className="text-white/60 text-sm mb-6 leading-relaxed">
            You must be signed in with your cooperative account before submitting a Wealth Circle application.
          </p>
          <div className="space-y-3">
            <Link
              href="/login?redirect=/investors-circle"
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
        <div className="bg-[#0d1527] rounded-3xl shadow-2xl border border-white/10 p-8 max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Application Submitted!</h2>
          <p className="text-white/60 mb-5 text-sm">Your Wealth Circle application has been received and is under review.</p>
          {applicationNumber && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-6">
              <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-1">Application Reference</p>
              <p className="text-xl font-bold text-white font-mono">{applicationNumber}</p>
            </div>
          )}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 mb-6 text-left">
            <p className="text-sm font-semibold text-amber-300 mb-2">Next Steps</p>
            <ol className="text-xs text-white/70 space-y-1.5 list-decimal list-inside">
              <li>Admin review of your application</li>
              <li>Deposit transfer verification</li>
              <li>Letter of Agreement executed</li>
              <li>Wealth Circle investment activated at 3.5% monthly agreed return</li>
            </ol>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 mb-6 text-left text-xs">
            <p className="font-semibold text-white/50 uppercase tracking-wider mb-2">Transfer Capital To:</p>
            <p className="text-sm font-bold text-white">{settings.coopAccountName}</p>
            <p className="text-white/70 mt-1">Account: <span className="font-mono font-bold text-emerald-400">{settings.coopAccountNumber}</span></p>
            <p className="text-white/70">Bank: {settings.coopBankName}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/investors-circle/dashboard"
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-md shadow-emerald-950/40 text-center"
            >
              View Dashboard
            </Link>
            <Link
              href="/landing"
              className="flex-1 border border-white/20 hover:bg-white/10 text-white py-3 rounded-xl font-semibold text-sm transition-all text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Header */}
      <div className="bg-[#0a0f1e]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="text-center">
            <p className="text-xs text-emerald-400 font-semibold uppercase tracking-widest">CLIMPS</p>
            <p className="text-sm font-bold text-white">Wealth Circle (CWC)</p>
          </div>
          <div className="text-xs text-white/40">Step {step} of {STEPS.length}</div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-white/10">
          <div
            className="h-1 bg-emerald-500 transition-all duration-500 shadow-sm shadow-emerald-500/50"
            style={{ width: `${(step / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-1 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s) => (
            <div key={s.id} className="flex items-center gap-1">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  s.id === step
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                    : s.id < step
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/[0.04] text-white/40 border border-white/10'
                }`}
              >
                {s.id < step ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span>{s.id}</span>
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {s.id < STEPS.length && <div className="w-3 h-px bg-white/10" />}
            </div>
          ))}
        </div>

        {/* ── STEP 1: Welcome ── */}
        {step === 1 && (
          <div className="bg-[#0d1527] rounded-3xl shadow-2xl border border-white/10 p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-400">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">WELCOME TO CLIMPS WEALTH CIRCLE (CWC)</h1>
              <p className="text-sm text-emerald-400 font-medium">Structured Wealth-Building Programme</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 mb-6 text-sm text-white/80 leading-relaxed space-y-3">
              <p className="font-semibold text-emerald-300">
                CLIMPS Wealth Circle (CWC) is a structured wealth-building Circle for eligible CLIMPS members who satisfy the applicable membership and programme requirements.
              </p>
              <p>
                Provides members with structured wealth-building opportunities under clearly defined terms and conditions, featuring an <strong className="text-white">Agreed Return of 3.5% monthly</strong>.
              </p>
              <p>Please fill out the following information completely and accurately. By submitting this form, you agree to the cooperative terms and conditions governing the Wealth Circle Agreement.</p>
              <p>Both parties retain the option to renegotiate the terms and conditions of your investment at the end of a maturity tenure.</p>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: '🔒', label: 'Secure', desc: 'Cooperative asset-backed' },
                { icon: '📈', label: '3.5% Monthly', desc: 'Agreed monthly return' },
                { icon: '💼', label: 'Structured', desc: 'Clearly defined agreement' },
              ].map(item => (
                <div key={item.label} className="text-center p-4 bg-white/[0.03] border border-white/10 rounded-2xl">
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <p className="text-xs font-semibold text-white">{item.label}</p>
                  <p className="text-[11px] text-white/50">{item.desc}</p>
                </div>
              ))}
            </div>
            <button
              onClick={handleNext}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-950/40 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Begin Application</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── STEP 2: Terms ── */}
        {step === 2 && (
          <div className="bg-[#0d1527] rounded-3xl shadow-2xl border border-white/10 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">READ ME PLEASE</h2>
                <p className="text-xs text-amber-300 font-medium">1. Agreed Return, Withdrawal &amp; Liquidation Terms</p>
              </div>
            </div>
            <div className="bg-amber-500/10 border-l-4 border-amber-400 rounded-r-2xl p-5 mb-6 text-sm text-white/80 leading-relaxed space-y-3">
              <div className="bg-[#0a0f1e] rounded-xl p-4 border border-white/10">
                <p className="font-bold text-amber-300 text-sm mb-1">1. Agreed Return</p>
                <p className="text-xs leading-relaxed text-white/70">
                  Subscribed capital earns an <strong className="text-white">Agreed Return of 3.5% monthly</strong> under the clearly defined terms and conditions of the CLIMPS Wealth Circle (CWC) Programme.
                </p>
              </div>
              <div className="bg-[#0a0f1e] rounded-xl p-4 border border-white/10">
                <p className="font-bold text-amber-300 text-sm mb-1">Withdrawal and Liquidation</p>
                <p className="text-xs leading-relaxed text-white/70">
                  Requests for partial or full liquidation shall be subject to the applicable notice period and the terms contained in the Wealth Circle Agreement. Early liquidation may affect the return applicable and may attract an administrative charge where expressly provided for in the Agreement.
                </p>
              </div>
              <p>The Investor shall give the Cooperative not less than one (1) month's written notice of any intention to withdraw or liquidate, whether in part or in full, the invested sum.</p>
              <p>Where the Investor fails to provide the required notice and requests an early liquidation, the Cooperative may, at its sole discretion and subject to liquidity availability, approve the request.</p>
              <p>In such circumstances, the Investor shall forfeit any accrued but unpaid returns applicable to the notice period, and an early liquidation administrative charge of 1% of the amount withdrawn may be deducted to cover processing and associated costs.</p>
              <p>The principal investment shall, however, remain payable in accordance with the terms of this Agreement.</p>
            </div>
            <div className="mb-6">
              <p className="text-sm font-semibold text-white mb-3">Do you agree to the above terms and conditions?</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setField('termsAgreed', true)}
                  className={`py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                    form.termsAgreed === true
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                      : 'border-white/15 bg-white/[0.04] text-white/80 hover:border-emerald-500/50'
                  }`}
                >
                  ✓ I AGREE
                </button>
                <button
                  onClick={() => setField('termsAgreed', false)}
                  className={`py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                    form.termsAgreed === false
                      ? 'bg-red-600 border-red-500 text-white shadow-md'
                      : 'border-white/15 bg-white/[0.04] text-white/80 hover:border-red-500/50'
                  }`}
                >
                  ✗ I DISAGREE
                </button>
              </div>
              {errors.termsAgreed && <p className="text-red-400 text-xs mt-2">{errors.termsAgreed}</p>}
            </div>
            {form.termsAgreed === false && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-4">
                <p className="text-sm text-red-300 font-medium">You must agree to the applicable terms and conditions before proceeding.</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={handleBack} className="flex-1 border border-white/20 bg-white/[0.04] text-white py-3 rounded-xl font-semibold text-sm hover:bg-white/10 transition-colors">
                ← Back
              </button>
              <button
                onClick={handleNext}
                disabled={form.termsAgreed === false || form.termsAgreed === null}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-emerald-950/40"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Processing Fee ── */}
        {step === 3 && (
          <div className="bg-[#0d1527] rounded-3xl shadow-2xl border border-white/10 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Administrative / Processing Fee</h2>
                <p className="text-xs text-blue-400 font-medium">One-time application fee</p>
              </div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 mb-6 text-center">
              <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1">Processing Fee</p>
              <p className="text-4xl font-extrabold text-white font-tabular">{formatNGN(settings.processingFee)}</p>
              <p className="text-xs text-white/50 mt-2">This fee covers application verification and administrative costs.</p>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 mb-6 text-sm text-white/70">
              <p className="font-semibold text-white mb-1">Important Note:</p>
              <p>This processing fee is separate from your investment principal. It will not be deducted from your investment amount unless explicitly stated in your Letter of Agreement.</p>
            </div>
            <div className="mb-6">
              <p className="text-sm font-semibold text-white mb-3">Do you agree to pay the {formatNGN(settings.processingFee)} processing fee?</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setField('feeAgreed', true)}
                  className={`py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                    form.feeAgreed === true
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                      : 'border-white/15 bg-white/[0.04] text-white/80 hover:border-emerald-500/50'
                  }`}
                >
                  ✓ I agree
                </button>
                <button
                  onClick={() => setField('feeAgreed', false)}
                  className={`py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                    form.feeAgreed === false
                      ? 'bg-red-600 border-red-500 text-white shadow-md'
                      : 'border-white/15 bg-white/[0.04] text-white/80 hover:border-red-500/50'
                  }`}
                >
                  ✗ I disagree
                </button>
              </div>
              {errors.feeAgreed && <p className="text-red-400 text-xs mt-2">{errors.feeAgreed}</p>}
            </div>
            <div className="flex gap-3">
              <button onClick={handleBack} className="flex-1 border border-white/20 bg-white/[0.04] text-white py-3 rounded-xl font-semibold text-sm hover:bg-white/10 transition-colors">
                ← Back
              </button>
              <button
                onClick={handleNext}
                disabled={form.feeAgreed === false || form.feeAgreed === null}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-emerald-950/40"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Investor Info ── */}
        {step === 4 && (
          <div className="bg-[#0d1527] rounded-3xl shadow-2xl border border-white/10 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-1 tracking-tight">Investor Information</h2>
            <p className="text-sm text-white/50 mb-6">Please provide your personal details accurately.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-1.5">Name of Investor <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={form.investorName}
                  onChange={e => setField('investorName', e.target.value)}
                  placeholder="Full legal name"
                  className={`w-full border rounded-xl px-4 py-3 text-sm bg-white/[0.05] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${errors.investorName ? 'border-red-400' : 'border-white/15'}`}
                />
                {errors.investorName && <p className="text-red-400 text-xs mt-1">{errors.investorName}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-1.5">Investor's Phone Number <span className="text-red-400">*</span></label>
                <input
                  type="tel"
                  value={form.investorPhone}
                  onChange={e => setField('investorPhone', e.target.value)}
                  placeholder="Phone number"
                  className={`w-full border rounded-xl px-4 py-3 text-sm bg-white/[0.05] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${errors.investorPhone ? 'border-red-400' : 'border-white/15'}`}
                />
                {errors.investorPhone && <p className="text-red-400 text-xs mt-1">{errors.investorPhone}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-1.5">Address of Investor <span className="text-red-400">*</span></label>
                <textarea
                  value={form.investorAddress}
                  onChange={e => setField('investorAddress', e.target.value)}
                  placeholder="Residential/contact address"
                  rows={3}
                  className={`w-full border rounded-xl px-4 py-3 text-sm bg-white/[0.05] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none ${errors.investorAddress ? 'border-red-400' : 'border-white/15'}`}
                />
                {errors.investorAddress && <p className="text-red-400 text-xs mt-1">{errors.investorAddress}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-1.5">Gender <span className="text-red-400">*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {GENDER_OPTIONS.map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setField('investorGender', g)}
                      className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        form.investorGender === g
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'border-white/15 bg-white/[0.04] text-white/80 hover:border-emerald-500/40'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                {errors.investorGender && <p className="text-red-400 text-xs mt-1">{errors.investorGender}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-1.5">Email <span className="text-red-400">*</span></label>
                <input
                  type="email"
                  value={form.investorEmail}
                  onChange={e => setField('investorEmail', e.target.value)}
                  placeholder="Email address"
                  className={`w-full border rounded-xl px-4 py-3 text-sm bg-white/[0.05] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${errors.investorEmail ? 'border-red-400' : 'border-white/15'}`}
                />
                {errors.investorEmail && <p className="text-red-400 text-xs mt-1">{errors.investorEmail}</p>}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleBack} className="flex-1 border border-white/20 bg-white/[0.04] text-white py-3 rounded-xl font-semibold text-sm hover:bg-white/10 transition-colors">← Back</button>
              <button onClick={handleNext} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-950/40">Continue →</button>
            </div>
          </div>
        )}

        {/* ── STEP 5: Next of Kin ── */}
        {step === 5 && (
          <div className="bg-[#0d1527] rounded-3xl shadow-2xl border border-white/10 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-1 tracking-tight">NEXT OF KIN DETAILS</h2>
            <p className="text-sm text-white/50 mb-6">Kindly provide us with the details of your Next of Kin.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-1.5">Next of Kin Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={form.nokName}
                  onChange={e => setField('nokName', e.target.value)}
                  placeholder="Full name of next of kin"
                  className={`w-full border rounded-xl px-4 py-3 text-sm bg-white/[0.05] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${errors.nokName ? 'border-red-400' : 'border-white/15'}`}
                />
                {errors.nokName && <p className="text-red-400 text-xs mt-1">{errors.nokName}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-1.5">Next of Kin Address <span className="text-red-400">*</span></label>
                <textarea
                  value={form.nokAddress}
                  onChange={e => setField('nokAddress', e.target.value)}
                  placeholder="Residential address of next of kin"
                  rows={3}
                  className={`w-full border rounded-xl px-4 py-3 text-sm bg-white/[0.05] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none ${errors.nokAddress ? 'border-red-400' : 'border-white/15'}`}
                />
                {errors.nokAddress && <p className="text-red-400 text-xs mt-1">{errors.nokAddress}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-1.5">Next of Kin Phone Number <span className="text-red-400">*</span></label>
                <input
                  type="tel"
                  value={form.nokPhone}
                  onChange={e => setField('nokPhone', e.target.value)}
                  placeholder="Phone number of next of kin"
                  className={`w-full border rounded-xl px-4 py-3 text-sm bg-white/[0.05] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${errors.nokPhone ? 'border-red-400' : 'border-white/15'}`}
                />
                {errors.nokPhone && <p className="text-red-400 text-xs mt-1">{errors.nokPhone}</p>}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleBack} className="flex-1 border border-white/20 bg-white/[0.04] text-white py-3 rounded-xl font-semibold text-sm hover:bg-white/10 transition-colors">← Back</button>
              <button onClick={handleNext} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-950/40">Continue →</button>
            </div>
          </div>
        )}

        {/* ── STEP 6: Investment Details ── */}
        {step === 6 && (
          <div className="bg-[#0d1527] rounded-3xl shadow-2xl border border-white/10 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-1 tracking-tight">Investment Details</h2>
            <p className="text-sm text-white/50 mb-6">Enter your investment amount and select a duration.</p>

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-6 text-sm text-white/80">
              <p className="font-semibold text-emerald-300 mb-1">Agreed Return: 3.5% Monthly</p>
              <p className="text-xs text-white/70">All investments shall be for the agreed fixed tenure as stated. The investment shall mature on the agreed maturity date, upon which the principal and agreed return shall become payable subject to the Wealth Circle Agreement.</p>
            </div>

            {/* Amount */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-white/90 mb-1.5">
                AMOUNT TO BE INVESTED <span className="text-red-400">*</span>
                <span className="text-xs font-normal text-white/40 ml-2">Minimum: {formatNGN(settings.minAmount)}</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-semibold">₦</span>
                <input
                  type="number"
                  value={form.investmentAmount}
                  onChange={e => setField('investmentAmount', e.target.value)}
                  placeholder="750,000"
                  min={settings.minAmount}
                  className={`w-full border rounded-xl pl-8 pr-4 py-3 text-sm bg-white/[0.05] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${errors.investmentAmount ? 'border-red-400' : 'border-white/15'}`}
                />
              </div>
              {errors.investmentAmount && <p className="text-red-400 text-xs mt-1">{errors.investmentAmount}</p>}
            </div>

            {/* Duration */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-white/90 mb-2">DURATION OF INVESTMENT <span className="text-red-400">*</span></label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DURATION_OPTIONS.map(opt => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => {
                      setField('investmentDuration', opt.label);
                      setField('investmentDurationMonths', opt.months);
                    }}
                    className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                      form.investmentDuration === opt.label
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                        : 'border-white/15 bg-white/[0.04] text-white/80 hover:border-emerald-500/40'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {errors.investmentDuration && <p className="text-red-400 text-xs mt-1">{errors.investmentDuration}</p>}
            </div>

            {/* Indicative calculations */}
            {amount >= settings.minAmount && form.investmentDurationMonths > 0 && (
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">AGREED MONTHLY RETURN @ {settings.interestRate}%</span>
                  <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded-full">Calculated</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-[#0a0f1e] border border-white/10 rounded-xl p-3">
                    <p className="text-xs text-white/50 mb-0.5">Capital Amount</p>
                    <p className="font-bold text-white">{formatNGN(amount)}</p>
                  </div>
                  <div className="bg-[#0a0f1e] border border-white/10 rounded-xl p-3">
                    <p className="text-xs text-white/50 mb-0.5">Monthly Agreed Return</p>
                    <p className="font-bold text-emerald-400">{formatNGN(monthlyReturn)}</p>
                  </div>
                  <div className="bg-[#0a0f1e] border border-white/10 rounded-xl p-3">
                    <p className="text-xs text-white/50 mb-0.5">Duration</p>
                    <p className="font-bold text-white">{form.investmentDuration}</p>
                  </div>
                  <div className="bg-[#0a0f1e] border border-white/10 rounded-xl p-3">
                    <p className="text-xs text-white/50 mb-0.5">Total Return Accrued</p>
                    <p className="font-bold text-emerald-400">{formatNGN(totalReturn)}</p>
                  </div>
                  <div className="bg-[#0a0f1e] border border-white/10 rounded-xl p-3">
                    <p className="text-xs text-white/50 mb-0.5">Start Date</p>
                    <p className="font-bold text-white">{formatDate(today)}</p>
                  </div>
                  <div className="bg-[#0a0f1e] border border-white/10 rounded-xl p-3">
                    <p className="text-xs text-white/50 mb-0.5">Maturity Date</p>
                    <p className="font-bold text-white">{maturityDate ? formatDate(maturityDate) : '—'}</p>
                  </div>
                </div>
                <div className="bg-[#0a0f1e] border border-white/10 rounded-xl p-3 mt-3">
                  <p className="text-xs text-white/50 mb-0.5">Total Maturity Payout</p>
                  <p className="text-lg font-bold text-emerald-400">{formatNGN(maturityValue)}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={handleBack} className="flex-1 border border-white/20 bg-white/[0.04] text-white py-3 rounded-xl font-semibold text-sm hover:bg-white/10 transition-colors">← Back</button>
              <button onClick={handleNext} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-950/40">Continue →</button>
            </div>
          </div>
        )}

        {/* ── STEP 7: Bank Details ── */}
        {step === 7 && (
          <div className="bg-[#0d1527] rounded-3xl shadow-2xl border border-white/10 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-1 tracking-tight">ACCOUNT DETAILS</h2>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 mb-6 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <p className="text-xs font-semibold text-amber-300">KINDLY VERIFY YOUR ACCOUNT NUMBER CAREFULLY</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-1.5">Investor's Account Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={form.accountName}
                  onChange={e => setField('accountName', e.target.value)}
                  placeholder="Account name as on bank records"
                  className={`w-full border rounded-xl px-4 py-3 text-sm bg-white/[0.05] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${errors.accountName ? 'border-red-400' : 'border-white/15'}`}
                />
                {errors.accountName && <p className="text-red-400 text-xs mt-1">{errors.accountName}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-1.5">Account Number <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={form.accountNumber}
                  onChange={e => setField('accountNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit account number"
                  maxLength={10}
                  className={`w-full border rounded-xl px-4 py-3 text-sm font-mono bg-white/[0.05] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${errors.accountNumber ? 'border-red-400' : 'border-white/15'}`}
                />
                {errors.accountNumber && <p className="text-red-400 text-xs mt-1">{errors.accountNumber}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-1.5">Bank Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={form.bankName}
                  onChange={e => setField('bankName', e.target.value)}
                  placeholder="Name of bank"
                  className={`w-full border rounded-xl px-4 py-3 text-sm bg-white/[0.05] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${errors.bankName ? 'border-red-400' : 'border-white/15'}`}
                />
                {errors.bankName && <p className="text-red-400 text-xs mt-1">{errors.bankName}</p>}
              </div>
            </div>

            {/* Cooperative account */}
            <div className="mt-6 bg-white/[0.03] border border-white/10 rounded-2xl p-5">
              <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Our Official Cooperative Account</p>
              <p className="text-sm font-bold text-white">{settings.coopAccountName}</p>
              <p className="text-sm text-white/80 mt-1">Account Number: <span className="font-mono font-bold text-emerald-400">{settings.coopAccountNumber}</span></p>
              <p className="text-sm text-white/80">Bank: {settings.coopBankName}</p>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleBack} className="flex-1 border border-white/20 bg-white/[0.04] text-white py-3 rounded-xl font-semibold text-sm hover:bg-white/10 transition-colors">← Back</button>
              <button onClick={handleNext} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-950/40">Review →</button>
            </div>
          </div>
        )}

        {/* ── STEP 8: Review ── */}
        {step === 8 && (
          <div className="bg-[#0d1527] rounded-3xl shadow-2xl border border-white/10 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-1 tracking-tight">Review Your Application</h2>
            <p className="text-sm text-white/50 mb-6">Please review all details before submitting.</p>

            <div className="space-y-4">
              {/* Agreements */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Agreements</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Terms & Conditions</span>
                  <span className="font-semibold text-emerald-400">✓ Agreed</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-white/70">Processing Fee ({formatNGN(settings.processingFee)})</span>
                  <span className="font-semibold text-emerald-400">✓ Agreed</span>
                </div>
              </div>

              {/* Investor Info */}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Investor Information</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><p className="text-white/40 text-xs">Name</p><p className="font-medium text-white">{form.investorName}</p></div>
                  <div><p className="text-white/40 text-xs">Phone</p><p className="font-medium text-white">{form.investorPhone}</p></div>
                  <div><p className="text-white/40 text-xs">Gender</p><p className="font-medium text-white">{form.investorGender}</p></div>
                  <div><p className="text-white/40 text-xs">Email</p><p className="font-medium text-white truncate">{form.investorEmail}</p></div>
                  <div className="col-span-2"><p className="text-white/40 text-xs">Address</p><p className="font-medium text-white">{form.investorAddress}</p></div>
                </div>
              </div>

              {/* NOK */}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Next of Kin</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><p className="text-white/40 text-xs">Name</p><p className="font-medium text-white">{form.nokName}</p></div>
                  <div><p className="text-white/40 text-xs">Phone</p><p className="font-medium text-white">{form.nokPhone}</p></div>
                  <div className="col-span-2"><p className="text-white/40 text-xs">Address</p><p className="font-medium text-white">{form.nokAddress}</p></div>
                </div>
              </div>

              {/* Investment */}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Investment Details</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><p className="text-white/40 text-xs">Capital</p><p className="font-bold text-emerald-400">{formatNGN(amount)}</p></div>
                  <div><p className="text-white/40 text-xs">Duration</p><p className="font-medium text-white">{form.investmentDuration}</p></div>
                  <div><p className="text-white/40 text-xs">Monthly Return (3.5%)</p><p className="font-medium text-emerald-400">{formatNGN(monthlyReturn)}</p></div>
                  <div><p className="text-white/40 text-xs">Maturity Date</p><p className="font-medium text-white">{maturityDate ? formatDate(maturityDate) : '—'}</p></div>
                  <div className="col-span-2"><p className="text-white/40 text-xs">Maturity Value</p><p className="font-bold text-emerald-400">{formatNGN(maturityValue)}</p></div>
                </div>
              </div>

              {/* Bank */}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Payout Bank Details</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><p className="text-white/40 text-xs">Account Name</p><p className="font-medium text-white">{form.accountName}</p></div>
                  <div><p className="text-white/40 text-xs">Bank</p><p className="font-medium text-white">{form.bankName}</p></div>
                  <div><p className="text-white/40 text-xs">Account Number</p><p className="font-mono font-medium text-white">{'*'.repeat(6) + form.accountNumber.slice(-4)}</p></div>
                </div>
              </div>
            </div>

            {submitError && (
              <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
                <p className="text-sm text-red-400">{submitError}</p>
              </div>
            )}

            {!user ? (
              <div className="mt-6 bg-[#0a182f] border border-blue-500/30 rounded-2xl p-5 text-center space-y-3">
                <p className="text-sm text-white/80">
                  You must be signed in to submit your Wealth Circle application.
                </p>
                <div className="flex gap-3">
                  <button onClick={handleBack} className="flex-1 border border-white/20 bg-white/[0.04] text-white py-3 rounded-xl font-semibold text-sm hover:bg-white/10 transition-colors">← Back</button>
                  <Link
                    href={`/login?redirect=${encodeURIComponent('/investors-circle')}`}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 text-center flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Submit Application</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 mt-6">
                <button onClick={handleBack} className="flex-1 border border-white/20 bg-white/[0.04] text-white py-3 rounded-xl font-semibold text-sm hover:bg-white/10 transition-colors">← Back</button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-500 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
                >
                  {submitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Submitting...
                    </>
                  ) : 'Submit Application'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
