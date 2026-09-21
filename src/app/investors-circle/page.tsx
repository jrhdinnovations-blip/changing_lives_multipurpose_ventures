'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormData {
  // Terms
  termsAgreed: boolean | null;
  feeAgreed: boolean | null;
  // Investor info
  investorName: string;
  investorPhone: string;
  investorAddress: string;
  investorGender: string;
  investorEmail: string;
  // NOK
  nokName: string;
  nokAddress: string;
  nokPhone: string;
  // Investment
  investmentAmount: string;
  investmentDuration: string;
  investmentDurationMonths: number;
  // Bank
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
  { id: 6, label: 'Investment' },
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
  const { user, profile, isAdmin } = useAuth();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [settings, setSettings] = useState<Settings>({
    minAmount: 750000,
    processingFee: 3000,
    interestRate: 4,
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
          interestRate: Number(map['investors_circle_interest_rate'] || 4),
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
    setSubmitting(true);
    setSubmitError('');
    try {
      // Resolve member
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
        investment_duration_label: form.investmentDuration,
        investment_duration_months: form.investmentDurationMonths,
        investment_start_date: today.toISOString().split('T')[0],
        investment_maturity_date: maturityDate ? maturityDate.toISOString().split('T')[0] : null,
        indicative_monthly_return: monthlyReturn,
        indicative_total_return: totalReturn,
        indicative_maturity_value: maturityValue,
        account_name: form.accountName,
        account_number: form.accountNumber,
        bank_name: form.bankName,
        declared_role: 'investor',
        resolved_role: resolvedRole,
        app_status: 'submitted',
      };

      const { data, error } = await supabase
        .from('investor_circle_applications')
        .insert(payload)
        .select('id')
        .single();

      if (error) throw error;

      // Generate application number
      const year = new Date().getFullYear();
      const { count } = await supabase
        .from('investor_circle_applications')
        .select('*', { count: 'exact', head: true });
      const appNum = `ICA/${year}/${String(count || 1).padStart(5, '0')}`;
      setApplicationNumber(appNum);
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-500 mb-4">Your Investors Circle application has been received and is under review.</p>
          {applicationNumber && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
              <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide mb-1">Application Reference</p>
              <p className="text-xl font-bold text-emerald-700">{applicationNumber}</p>
            </div>
          )}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-amber-800 mb-1">Next Steps</p>
            <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
              <li>Admin review of your application</li>
              <li>Payment verification</li>
              <li>Letter of Agreement issued</li>
              <li>Investment activated</li>
            </ol>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Transfer Investment Amount To:</p>
            <p className="text-sm font-bold text-gray-900">{settings.coopAccountName}</p>
            <p className="text-sm text-gray-700">Account: <span className="font-mono font-semibold">{settings.coopAccountNumber}</span></p>
            <p className="text-sm text-gray-700">Bank: {settings.coopBankName}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/investors-circle/dashboard" className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors text-center">
              View Dashboard
            </Link>
            <Link href="/landing" className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors text-center">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <div className="text-center">
            <p className="text-xs text-emerald-600 font-semibold uppercase tracking-widest">CLIMPS</p>
            <p className="text-sm font-bold text-gray-900">Investors Circle</p>
          </div>
          <div className="text-xs text-gray-400">Step {step} of {STEPS.length}</div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-1 bg-emerald-500 transition-all duration-500"
            style={{ width: `${(step / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-1 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s) => (
            <div key={s.id} className="flex items-center gap-1">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                s.id === step ? 'bg-emerald-600 text-white' :
                s.id < step ? 'bg-emerald-100 text-emerald-700': 'bg-gray-100 text-gray-400'
              }`}>
                {s.id < step ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{s.id}</span>
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {s.id < STEPS.length && <div className="w-3 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        {/* ── STEP 1: Welcome ── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">WELCOME TO CLIMPS INVESTORS CIRCLE</h1>
              <p className="text-sm text-emerald-600 font-medium">Official Investment Onboarding</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 mb-6 text-sm text-gray-700 leading-relaxed space-y-3">
              <p>Please fill out the following information completely and accurately.</p>
              <p>By filling this form, it indicates that the investor has agreed to the Cooperatives Terms and Conditions as discussed.</p>
              <p>Changing Lives Multipurpose Cooperative lends money to its members and deserving members of the public on recommendation by a member who will serve as a guarantor.</p>
              <p>Both parties have the option to renegotiate the terms and conditions of your investment at the end of a Maturity Circle.</p>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { icon: '🔒', label: 'Secure', desc: 'Your data is protected' },
                { icon: '📋', label: 'Official', desc: 'Formal onboarding process' },
                { icon: '💼', label: 'Transparent', desc: 'Clear terms & conditions' },
              ].map(item => (
                <div key={item.label} className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <p className="text-xs font-semibold text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
            <button onClick={handleNext} className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
              Begin Application →
            </button>
          </div>
        )}

        {/* ── STEP 2: Terms ── */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">READ ME PLEASE</h2>
                <p className="text-xs text-amber-600 font-medium">Investment Withdrawal & Liquidation Terms</p>
              </div>
            </div>
            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-5 mb-6 text-sm text-gray-700 leading-relaxed space-y-3">
              <p>The Investor shall give the Cooperative not less than one (1) month's written notice of any intention to withdraw or liquidate, whether in part or in full, the invested sum.</p>
              <p>Where the Investor fails to provide the required notice and requests an early liquidation, the Cooperative may, at its sole discretion and subject to liquidity availability, approve the request.</p>
              <p>In such circumstances, the Investor shall forfeit any accrued but unpaid returns applicable to the notice period, and an early liquidation administrative charge of 1% of the amount withdrawn may be deducted to cover processing and associated costs.</p>
              <p>The principal investment shall, however, remain payable in accordance with the terms of this Agreement.</p>
            </div>
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-800 mb-3">Do you agree to the above terms and conditions?</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setField('termsAgreed', true)}
                  className={`py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                    form.termsAgreed === true
                      ? 'bg-emerald-600 border-emerald-600 text-white' :'border-gray-200 text-gray-700 hover:border-emerald-300'
                  }`}
                >
                  ✓ I AGREE
                </button>
                <button
                  onClick={() => setField('termsAgreed', false)}
                  className={`py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                    form.termsAgreed === false
                      ? 'bg-red-500 border-red-500 text-white' :'border-gray-200 text-gray-700 hover:border-red-300'
                  }`}
                >
                  ✗ I DISAGREE
                </button>
              </div>
              {errors.termsAgreed && <p className="text-red-500 text-xs mt-2">{errors.termsAgreed}</p>}
            </div>
            {form.termsAgreed === false && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-red-700 font-medium">You must agree to the applicable terms and conditions before proceeding.</p>
                <p className="text-xs text-red-500 mt-1">You cannot proceed with the investment application without agreeing to the terms.</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={handleBack} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">
                ← Back
              </button>
              <button
                onClick={handleNext}
                disabled={form.termsAgreed === false || form.termsAgreed === null}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Processing Fee ── */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Administrative / Processing Fee</h2>
                <p className="text-xs text-blue-600 font-medium">One-time application fee</p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-6 text-center">
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">Processing Fee</p>
              <p className="text-4xl font-bold text-blue-700">{formatNGN(settings.processingFee)}</p>
              <p className="text-xs text-gray-500 mt-2">This fee covers application processing and associated administrative costs.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm text-gray-600">
              <p className="font-medium text-gray-800 mb-1">Important Note:</p>
              <p>This processing fee is separate from your investment principal. It will not be deducted from your investment amount unless explicitly stated in your Letter of Agreement.</p>
            </div>
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-800 mb-3">Do you agree to pay the {formatNGN(settings.processingFee)} processing fee?</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setField('feeAgreed', true)}
                  className={`py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                    form.feeAgreed === true
                      ? 'bg-emerald-600 border-emerald-600 text-white' :'border-gray-200 text-gray-700 hover:border-emerald-300'
                  }`}
                >
                  ✓ I agree
                </button>
                <button
                  onClick={() => setField('feeAgreed', false)}
                  className={`py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                    form.feeAgreed === false
                      ? 'bg-red-500 border-red-500 text-white' :'border-gray-200 text-gray-700 hover:border-red-300'
                  }`}
                >
                  ✗ I disagree
                </button>
              </div>
              {errors.feeAgreed && <p className="text-red-500 text-xs mt-2">{errors.feeAgreed}</p>}
            </div>
            {form.feeAgreed === false && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-red-700 font-medium">You must agree to the processing fee to proceed with the application.</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={handleBack} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">
                ← Back
              </button>
              <button
                onClick={handleNext}
                disabled={form.feeAgreed === false || form.feeAgreed === null}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Investor Info ── */}
        {step === 4 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Investor Information</h2>
            <p className="text-sm text-gray-500 mb-6">Please provide your personal details accurately.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name of Investor <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.investorName}
                  onChange={e => setField('investorName', e.target.value)}
                  placeholder="Full legal name"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.investorName ? 'border-red-300' : 'border-gray-200'}`}
                />
                {errors.investorName && <p className="text-red-500 text-xs mt-1">{errors.investorName}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Investor's Phone Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  value={form.investorPhone}
                  onChange={e => setField('investorPhone', e.target.value)}
                  placeholder="Phone number"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.investorPhone ? 'border-red-300' : 'border-gray-200'}`}
                />
                {errors.investorPhone && <p className="text-red-500 text-xs mt-1">{errors.investorPhone}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address of Investor <span className="text-red-500">*</span></label>
                <textarea
                  value={form.investorAddress}
                  onChange={e => setField('investorAddress', e.target.value)}
                  placeholder="Residential/contact address"
                  rows={3}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none ${errors.investorAddress ? 'border-red-300' : 'border-gray-200'}`}
                />
                {errors.investorAddress && <p className="text-red-500 text-xs mt-1">{errors.investorAddress}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gender <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {GENDER_OPTIONS.map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setField('investorGender', g)}
                      className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                        form.investorGender === g
                          ? 'bg-emerald-600 border-emerald-600 text-white' :'border-gray-200 text-gray-700 hover:border-emerald-300'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                {errors.investorGender && <p className="text-red-500 text-xs mt-1">{errors.investorGender}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={form.investorEmail}
                  onChange={e => setField('investorEmail', e.target.value)}
                  placeholder="Email address"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.investorEmail ? 'border-red-300' : 'border-gray-200'}`}
                />
                {user?.email && (
                  <p className="text-xs text-emerald-600 mt-1">Auto-populated from your account. You may update if needed.</p>
                )}
                {errors.investorEmail && <p className="text-red-500 text-xs mt-1">{errors.investorEmail}</p>}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleBack} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">← Back</button>
              <button onClick={handleNext} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors">Continue →</button>
            </div>
          </div>
        )}

        {/* ── STEP 5: Next of Kin ── */}
        {step === 5 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1">NEXT OF KIN DETAILS</h2>
            <p className="text-sm text-gray-500 mb-6">Kindly provide us with the details of your Next of Kin (Name, Address and Phone number).</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Next of Kin Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.nokName}
                  onChange={e => setField('nokName', e.target.value)}
                  placeholder="Full name of next of kin"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.nokName ? 'border-red-300' : 'border-gray-200'}`}
                />
                {errors.nokName && <p className="text-red-500 text-xs mt-1">{errors.nokName}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Next of Kin Address <span className="text-red-500">*</span></label>
                <textarea
                  value={form.nokAddress}
                  onChange={e => setField('nokAddress', e.target.value)}
                  placeholder="Residential address of next of kin"
                  rows={3}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none ${errors.nokAddress ? 'border-red-300' : 'border-gray-200'}`}
                />
                {errors.nokAddress && <p className="text-red-500 text-xs mt-1">{errors.nokAddress}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Next of Kin Phone Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  value={form.nokPhone}
                  onChange={e => setField('nokPhone', e.target.value)}
                  placeholder="Phone number of next of kin"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.nokPhone ? 'border-red-300' : 'border-gray-200'}`}
                />
                {errors.nokPhone && <p className="text-red-500 text-xs mt-1">{errors.nokPhone}</p>}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleBack} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">← Back</button>
              <button onClick={handleNext} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors">Continue →</button>
            </div>
          </div>
        )}

        {/* ── STEP 6: Investment Details ── */}
        {step === 6 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Investment Details</h2>
            <p className="text-sm text-gray-500 mb-6">Enter your investment amount and select a duration.</p>

            {/* Tenure info */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-sm text-gray-700">
              <p className="font-semibold text-blue-800 mb-1">Investment Tenure</p>
              <p>All investments shall be for the agreed fixed tenure as stated in the Investment Form. The investment shall mature on the agreed maturity date, upon which the principal and applicable investment return shall become payable, subject to the terms of this Agreement.</p>
            </div>

            {/* Amount */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                AMOUNT TO BE INVESTED <span className="text-red-500">*</span>
                <span className="text-xs font-normal text-gray-400 ml-2">Minimum: {formatNGN(settings.minAmount)}</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₦</span>
                <input
                  type="number"
                  value={form.investmentAmount}
                  onChange={e => setField('investmentAmount', e.target.value)}
                  placeholder="750,000"
                  min={settings.minAmount}
                  className={`w-full border rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.investmentAmount ? 'border-red-300' : 'border-gray-200'}`}
                />
              </div>
              {errors.investmentAmount && <p className="text-red-500 text-xs mt-1">{errors.investmentAmount}</p>}
            </div>

            {/* Duration */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">DURATION OF INVESTMENT <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DURATION_OPTIONS.map(opt => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => {
                      setField('investmentDuration', opt.label);
                      setField('investmentDurationMonths', opt.months);
                    }}
                    className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                      form.investmentDuration === opt.label
                        ? 'bg-emerald-600 border-emerald-600 text-white' :'border-gray-200 text-gray-700 hover:border-emerald-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {errors.investmentDuration && <p className="text-red-500 text-xs mt-1">{errors.investmentDuration}</p>}
            </div>

            {/* Indicative calculations */}
            {amount >= settings.minAmount && form.investmentDurationMonths > 0 && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">MONTHLY INTEREST @ {settings.interestRate}% OF THE CAPITAL</span>
                  <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">Indicative</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Investment Amount</p>
                    <p className="font-bold text-gray-900">{formatNGN(amount)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Monthly Return (indicative)</p>
                    <p className="font-bold text-emerald-700">{formatNGN(monthlyReturn)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Duration</p>
                    <p className="font-bold text-gray-900">{form.investmentDuration}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Total Return (indicative)</p>
                    <p className="font-bold text-emerald-700">{formatNGN(totalReturn)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Start Date</p>
                    <p className="font-bold text-gray-900">{formatDate(today)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Maturity Date (indicative)</p>
                    <p className="font-bold text-gray-900">{maturityDate ? formatDate(maturityDate) : '—'}</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 mt-3">
                  <p className="text-xs text-gray-500 mb-0.5">Indicative Maturity Value</p>
                  <p className="text-lg font-bold text-emerald-700">{formatNGN(maturityValue)}</p>
                </div>
                <p className="text-xs text-amber-600 mt-3 italic">Kindly note that the final and applicable amount shall be accurately reflected in the executed Letter of Agreement. These figures are indicative only and not guaranteed.</p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={handleBack} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">← Back</button>
              <button onClick={handleNext} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors">Continue →</button>
            </div>
          </div>
        )}

        {/* ── STEP 7: Bank Details ── */}
        {step === 7 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1">ACCOUNT DETAILS</h2>
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6 flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm font-semibold text-red-700">KINDLY CHECK FOR ERRORS BEFORE SUBMISSION</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Investor's Account Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.accountName}
                  onChange={e => setField('accountName', e.target.value)}
                  placeholder="Account name as on bank records"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.accountName ? 'border-red-300' : 'border-gray-200'}`}
                />
                {errors.accountName && <p className="text-red-500 text-xs mt-1">{errors.accountName}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Account Number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.accountNumber}
                  onChange={e => setField('accountNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit account number"
                  maxLength={10}
                  className={`w-full border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.accountNumber ? 'border-red-300' : 'border-gray-200'}`}
                />
                {errors.accountNumber && <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bank Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.bankName}
                  onChange={e => setField('bankName', e.target.value)}
                  placeholder="Name of bank"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.bankName ? 'border-red-300' : 'border-gray-200'}`}
                />
                {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>}
              </div>
            </div>

            {/* Cooperative account */}
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-5">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">Our Account Details</p>
              <p className="text-sm font-bold text-gray-900">{settings.coopAccountName}</p>
              <p className="text-sm text-gray-700 mt-1">Account Number: <span className="font-mono font-semibold">{settings.coopAccountNumber}</span></p>
              <p className="text-sm text-gray-700">Bank: {settings.coopBankName}</p>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleBack} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">← Back</button>
              <button onClick={handleNext} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors">Review →</button>
            </div>
          </div>
        )}

        {/* ── STEP 8: Review ── */}
        {step === 8 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Review Your Application</h2>
            <p className="text-sm text-gray-500 mb-6">Please review all details before submitting.</p>

            <div className="space-y-4">
              {/* Agreements */}
              <div className="bg-emerald-50 rounded-xl p-4">
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">Agreements</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Terms & Conditions</span>
                  <span className="font-semibold text-emerald-700">✓ Agreed</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600">Processing Fee ({formatNGN(settings.processingFee)})</span>
                  <span className="font-semibold text-emerald-700">✓ Agreed</span>
                </div>
              </div>

              {/* Investor Info */}
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Investor Information</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><p className="text-gray-400 text-xs">Name</p><p className="font-medium text-gray-800">{form.investorName}</p></div>
                  <div><p className="text-gray-400 text-xs">Phone</p><p className="font-medium text-gray-800">{form.investorPhone}</p></div>
                  <div><p className="text-gray-400 text-xs">Gender</p><p className="font-medium text-gray-800">{form.investorGender}</p></div>
                  <div><p className="text-gray-400 text-xs">Email</p><p className="font-medium text-gray-800 truncate">{form.investorEmail}</p></div>
                  <div className="col-span-2"><p className="text-gray-400 text-xs">Address</p><p className="font-medium text-gray-800">{form.investorAddress}</p></div>
                </div>
              </div>

              {/* NOK */}
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Next of Kin</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><p className="text-gray-400 text-xs">Name</p><p className="font-medium text-gray-800">{form.nokName}</p></div>
                  <div><p className="text-gray-400 text-xs">Phone</p><p className="font-medium text-gray-800">{form.nokPhone}</p></div>
                  <div className="col-span-2"><p className="text-gray-400 text-xs">Address</p><p className="font-medium text-gray-800">{form.nokAddress}</p></div>
                </div>
              </div>

              {/* Investment */}
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Investment Details</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><p className="text-gray-400 text-xs">Amount</p><p className="font-bold text-emerald-700">{formatNGN(amount)}</p></div>
                  <div><p className="text-gray-400 text-xs">Duration</p><p className="font-medium text-gray-800">{form.investmentDuration}</p></div>
                  <div><p className="text-gray-400 text-xs">Monthly Return (indicative)</p><p className="font-medium text-emerald-600">{formatNGN(monthlyReturn)}</p></div>
                  <div><p className="text-gray-400 text-xs">Maturity Date (indicative)</p><p className="font-medium text-gray-800">{maturityDate ? formatDate(maturityDate) : '—'}</p></div>
                  <div className="col-span-2"><p className="text-gray-400 text-xs">Indicative Maturity Value</p><p className="font-bold text-emerald-700">{formatNGN(maturityValue)}</p></div>
                </div>
                <p className="text-xs text-amber-600 mt-2 italic">All return figures are indicative. Final amounts will be in the Letter of Agreement.</p>
              </div>

              {/* Bank */}
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Bank Details</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><p className="text-gray-400 text-xs">Account Name</p><p className="font-medium text-gray-800">{form.accountName}</p></div>
                  <div><p className="text-gray-400 text-xs">Bank</p><p className="font-medium text-gray-800">{form.bankName}</p></div>
                  <div><p className="text-gray-400 text-xs">Account Number</p><p className="font-mono font-medium text-gray-800">{'*'.repeat(6) + form.accountNumber.slice(-4)}</p></div>
                </div>
              </div>

              {/* Role */}
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Role</p>
                <p className="text-sm font-semibold text-gray-800 capitalize">{isAdmin ? 'Administrator' : 'Investor'}</p>
                {!user && <p className="text-xs text-gray-400 mt-1">Not signed in — role resolved as Investor</p>}
              </div>
            </div>

            {submitError && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={handleBack} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">← Back</button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
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
          </div>
        )}
      </div>
    </div>
  );
}
