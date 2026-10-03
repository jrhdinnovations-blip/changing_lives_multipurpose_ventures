'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import LandingNav from '@/app/landing/components/LandingNav';
import LandingFooter from '@/app/landing/components/LandingFooter';

// ─── Types ────────────────────────────────────────────────────────────────────
type ProductType = 'savings' | 'loan' | 'investment';

interface ProductOption {
  id: string;
  name: string;
  tagline: string;
  minAmount: number;
  maxAmount?: number;
  interestRate: string;
  duration: string;
  durationMin: number;
  durationMax: number;
  badge: string;
  badgeColor: string;
  accentColor: string;
  borderColor: string;
  bgGradient: string;
  eligibility: string[];
  icon: React.ReactNode;
}

interface EligibilityResult {
  eligible: boolean;
  score: number;
  checks: { label: string; pass: boolean; note: string }[];
  summary: string;
}

// ─── Product Data ─────────────────────────────────────────────────────────────
const savingsOptions: ProductOption[] = [
  {
    id: 'monthly-contribution',
    name: 'Monthly Contribution',
    tagline: 'Regular savings with 4% monthly interest — maintain for at least 1 year.',
    minAmount: 5000,
    maxAmount: 200000,
    interestRate: '4% monthly (48% p.a.)',
    duration: 'Min. 12 months (or interest forfeited)',
    durationMin: 12,
    durationMax: 60,
    badge: 'Regular Savings',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    accentColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    bgGradient: 'from-emerald-500/10 to-transparent',
    eligibility: ['Active CLIMPS member', '₦5,000–₦200,000 monthly', 'Must save for at least 1 year to retain interest'],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'lock-your-funds',
    name: 'Lock Your Funds',
    tagline: 'Fixed-term lock savings — minimum 6 months, all interest forfeited if withdrawn early.',
    minAmount: 10000,
    maxAmount: 5000000,
    interestRate: '7.0% p.a. (Credited at Maturity)',
    duration: 'Min. 6 months; Tenors: 6, 9, 12, 18, 24 months',
    durationMin: 6,
    durationMax: 24,
    badge: 'Lock Your Funds',
    badgeColor: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    accentColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    bgGradient: 'from-amber-500/10 to-transparent',
    eligibility: ['Active CLIMPS member', '₦10,000 minimum deposit', '⚠️ ALL interest forfeited if withdrawn before maturity date'],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
];

// Personal Loan ONLY
const loanOptions: ProductOption[] = [
  {
    id: 'personal-loan',
    name: 'Personal Loan',
    tagline: 'Simple, direct credit facility with 10% monthly interest.',
    minAmount: 50000,
    maxAmount: 1500000,
    interestRate: '10% monthly',
    duration: '1 – 12 months',
    durationMin: 1,
    durationMax: 12,
    badge: 'Sole Loan Product',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    accentColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    bgGradient: 'from-emerald-500/10 to-transparent',
    eligibility: ['Active member 3+ months', 'Min savings ₦20,000', '10% monthly interest agreement'],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

const investmentOptions: ProductOption[] = [
  {
    id: 'investors-circle',
    name: 'CLIMPS Wealth Circle (CWC)',
    tagline: 'Structured wealth-building circle with 3.5% monthly agreed return.',
    minAmount: 100000,
    maxAmount: 10000000,
    interestRate: '3.5% monthly agreed return',
    duration: '3 – 24 months',
    durationMin: 3,
    durationMax: 24,
    badge: 'Wealth Circle',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    accentColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    bgGradient: 'from-emerald-500/10 to-transparent',
    eligibility: ['Verified CLIMPS member', 'Minimum ₦100,000 subscription', 'Liquidation notice terms agreed'],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

const productsByType: Record<ProductType, ProductOption[]> = {
  savings: savingsOptions,
  loan: loanOptions,
  investment: investmentOptions,
};

// ─── Eligibility Engine ───────────────────────────────────────────────────────
function runEligibilityCheck(
  type: ProductType,
  product: ProductOption,
  amount: number,
  duration: number,
  memberMonths: number,
  hasSavings: boolean,
  hasDefault: boolean
): EligibilityResult {
  const checks: { label: string; pass: boolean; note: string }[] = [];

  // Amount check
  const minOk = amount >= product.minAmount;
  checks.push({
    label: 'Minimum amount',
    pass: minOk,
    note: minOk
      ? `₦${amount.toLocaleString()} meets the ₦${product.minAmount.toLocaleString()} minimum`
      : `Amount is below the ₦${product.minAmount.toLocaleString()} minimum`,
  });

  if (product.maxAmount) {
    const maxOk = amount <= product.maxAmount;
    checks.push({
      label: 'Maximum amount',
      pass: maxOk,
      note: maxOk
        ? `₦${amount.toLocaleString()} is within the ₦${product.maxAmount.toLocaleString()} limit`
        : `Amount exceeds the ₦${product.maxAmount.toLocaleString()} maximum`,
    });
  }

  // Duration check
  const durOk = duration >= product.durationMin && duration <= product.durationMax;
  checks.push({
    label: 'Duration range',
    pass: durOk,
    note: durOk
      ? `${duration} month(s) is within the allowed range`
      : `Duration must be between ${product.durationMin} and ${product.durationMax} months`,
  });

  // Membership tenure
  let requiredMonths = 0;
  if (product.id === 'personal-loan') requiredMonths = 3;
  else if (type === 'investment') requiredMonths = 1;

  if (requiredMonths > 0) {
    const tenureOk = memberMonths >= requiredMonths;
    checks.push({
      label: 'Membership tenure',
      pass: tenureOk,
      note: tenureOk
        ? `${memberMonths} months membership meets the ${requiredMonths}-month requirement`
        : `You need at least ${requiredMonths} months of active membership`,
    });
  }

  // Savings balance for loan
  if (type === 'loan') {
    checks.push({
      label: 'Savings balance',
      pass: hasSavings,
      note: hasSavings
        ? 'Minimum savings balance of ₦20,000 confirmed'
        : 'You need a minimum savings balance of ₦20,000',
    });
  }

  // No default check for loans
  if (type === 'loan') {
    checks.push({
      label: 'No outstanding default',
      pass: !hasDefault,
      note: !hasDefault
        ? 'No outstanding loan defaults on record'
        : 'Outstanding loan default detected — resolve before applying',
    });
  }

  const passed = checks.filter((c) => c.pass).length;
  const total = checks.length;
  const score = Math.round((passed / total) * 100);
  const eligible = passed === total;

  return {
    eligible,
    score,
    checks,
    summary: eligible
      ? 'You meet all eligibility criteria for this product.'
      : `${total - passed} requirement${total - passed > 1 ? 's' : ''} not met. Review the details below.`,
  };
}

// ─── Projection Calculator ────────────────────────────────────────────────────
function calcProjection(type: ProductType, product: ProductOption, amount: number, duration: number) {
  if (type === 'loan') {
    // Personal loan: 10% monthly flat interest
    const monthlyInterest = amount * 0.10;
    const totalInterest = monthlyInterest * duration;
    const totalRepayable = amount + totalInterest;
    const monthlyPayment = totalRepayable / duration;
    return {
      label: 'Monthly Repayment (Principal + 10% Int)',
      value: monthlyPayment,
      interest: totalInterest,
      monthly: monthlyPayment,
    };
  } else if (type === 'savings') {
    // 4% monthly interest (48% p.a.)
    const monthlyRate = 0.04;
    const totalContributed = amount * duration;
    // Simple sum of monthly contributions with interest
    const interest = totalContributed * monthlyRate * (duration / 2);
    const maturity = totalContributed + interest;
    return {
      label: 'Projected Total Savings (at 4% / mo)',
      value: maturity,
      interest,
      monthly: amount,
    };
  } else {
    // Wealth circle: 3.5% monthly agreed return
    const monthlyRate = 0.035;
    const totalReturns = amount * monthlyRate * duration;
    const maturity = amount + totalReturns;
    return {
      label: 'Total Payout (Principal + 3.5% / mo)',
      value: maturity,
      interest: totalReturns,
      monthly: amount * monthlyRate,
    };
  }
}

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepDot({ step, current, label }: { step: number; current: number; label: string }) {
  const done = current > step;
  const active = current === step;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
          done
            ? 'bg-emerald-500 text-black font-extrabold'
            : active
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400 ring-4 ring-emerald-500/20'
            : 'bg-white/5 border border-white/10 text-white/40'
        }`}
      >
        {done ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          step
        )}
      </div>
      <span className={`text-xs font-semibold hidden sm:block ${active ? 'text-emerald-400' : done ? 'text-emerald-300' : 'text-white/40'}`}>
        {label}
      </span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ApplyPage() {
  const [step, setStep] = useState(1);
  const [productType, setProductType] = useState<ProductType>('savings');
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('');
  const [memberMonths, setMemberMonths] = useState(6);
  const [hasSavings, setHasSavings] = useState(true);
  const [hasDefault, setHasDefault] = useState(false);
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [kycChecked, setKycChecked] = useState(false);

  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { setKycChecked(true); return; }
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('members')
          .select('kyc_completed')
          .eq('user_id', user.id)
          .maybeSingle();
        if (data && !data.kyc_completed) {
          router.replace('/onboarding');
          return;
        }
      } catch { /* allow public */ }
      setKycChecked(true);
    })();
  }, [user, loading, router]);

  const products = productsByType[productType];

  useEffect(() => {
    setSelectedProduct(null);
    setAmount('');
    setDuration('');
    setEligibility(null);
  }, [productType]);

  const runCheck = useCallback(() => {
    if (!selectedProduct || !amount || !duration) return;
    const amt = parseFloat(amount.replace(/,/g, ''));
    const dur = parseInt(duration);
    if (isNaN(amt) || isNaN(dur) || amt <= 0 || dur <= 0) return;

    setChecking(true);
    setTimeout(() => {
      const result = runEligibilityCheck(productType, selectedProduct, amt, dur, memberMonths, hasSavings, hasDefault);
      setEligibility(result);
      setChecking(false);
    }, 400);
  }, [selectedProduct, amount, duration, productType, memberMonths, hasSavings, hasDefault]);

  useEffect(() => {
    const timer = setTimeout(runCheck, 300);
    return () => clearTimeout(timer);
  }, [runCheck]);

  const amountNum = parseFloat(amount.replace(/,/g, '')) || 0;
  const durationNum = parseInt(duration) || 0;
  const projection = selectedProduct && amountNum > 0 && durationNum > 0
    ? calcProjection(productType, selectedProduct, amountNum, durationNum)
    : null;

  const typeConfig = {
    savings: {
      label: 'Savings',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      gradient: 'from-emerald-600 to-teal-700',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    loan: {
      label: 'Personal Loan',
      color: 'text-teal-400',
      bg: 'bg-teal-500/10',
      border: 'border-teal-500/30',
      gradient: 'from-teal-600 to-emerald-700',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    investment: {
      label: 'Wealth Circle',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      gradient: 'from-emerald-600 to-teal-800',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
  };

  const tc = typeConfig[productType];

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col justify-between">
        <LandingNav />
        <div className="max-w-md w-full mx-auto my-auto p-8 rounded-3xl bg-[#0d1527] border border-white/10 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Application Submitted!</h2>
          <p className="text-white/70 mb-3 text-sm">
            Your <strong className="text-white">{selectedProduct?.name}</strong> application for{' '}
            <strong className="text-emerald-400">₦{amountNum.toLocaleString()}</strong> has been received.
          </p>
          <p className="text-xs text-white/50 mb-8">
            Reference: <span className="font-mono font-bold text-emerald-400">CLIMPS-{Date.now().toString().slice(-8)}</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/landing" className="px-5 py-2.5 rounded-xl border border-white/15 text-white text-sm font-semibold hover:bg-white/[0.05]">Back to Home</Link>
            <button
              onClick={() => { setSubmitted(false); setStep(1); setSelectedProduct(null); setAmount(''); setDuration(''); setEligibility(null); }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-500/20"
            >
              New Application
            </button>
          </div>
        </div>
        <LandingFooter />
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!selectedProduct || !eligibility) return;
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent('/apply')}`);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      let memberId: string | null = null;
      if (user) {
        const { data: memberData } = await supabase
          .from('members')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        memberId = memberData?.id ?? null;
      }

      const { error } = await supabase.from('applications').insert({
        user_id: user?.id ?? null,
        member_id: memberId,
        product_type: productType,
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        amount: amountNum,
        duration_months: durationNum,
        eligibility_score: eligibility.score,
        is_eligible: eligibility.eligible,
        application_status: 'pending',
        submitted_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Application submission error:', error.message);
        setSubmitError('Failed to submit application. Please try again.');
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error('Unexpected error:', err?.message);
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col justify-between">
      <LandingNav />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 lg:py-14 flex-1 w-full">
        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Application Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">Product Application</h1>
          <p className="text-white/60 text-sm">Select your cooperative product, configure your parameters, and check eligibility in real time.</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-0 mb-10">
          <StepDot step={1} current={step} label="Product Type" />
          <div className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${step > 1 ? 'bg-emerald-500' : 'bg-white/10'}`} />
          <StepDot step={2} current={step} label="Select Product" />
          <div className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${step > 2 ? 'bg-emerald-500' : 'bg-white/10'}`} />
          <StepDot step={3} current={step} label="Amount & Duration" />
          <div className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${step > 3 ? 'bg-emerald-500' : 'bg-white/10'}`} />
          <StepDot step={4} current={step} label="Review & Submit" />
        </div>

        {/* ── STEP 1: Product Type ── */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-6">What would you like to apply for?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {(Object.keys(typeConfig) as ProductType[]).map((type) => {
                const cfg = typeConfig[type];
                const isActive = productType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setProductType(type)}
                    className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-200 group ${
                      isActive
                        ? `border-emerald-500 bg-[#0d1527] text-white shadow-xl shadow-emerald-500/10 scale-[1.02]`
                        : `border-white/10 bg-[#0d1527]/60 hover:border-emerald-500/40 text-white/80`
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                      isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.04] text-white/60'
                    }`}>
                      {cfg.icon}
                    </div>
                    <div className="text-xl font-bold mb-1 text-white">{cfg.label}</div>
                    <div className="text-xs text-white/60 leading-relaxed">
                      {type === 'savings' && 'Disciplined savings with 4% monthly interest (48% p.a., 1 yr min)'}
                      {type === 'loan' && 'Personal Loan facility at 10% monthly interest'}
                      {type === 'investment' && 'CLIMPS Wealth Circle with 3.5% monthly agreed return'}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Select Product ── */}
        {step === 2 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-8 h-8 rounded-lg ${tc.bg} flex items-center justify-center`}>
                <span className={tc.color}>{tc.icon}</span>
              </div>
              <h2 className="text-lg font-bold text-white">Choose a {tc.label} Product</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {products.map((product) => {
                const isSelected = selectedProduct?.id === product.id;
                return (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`p-6 rounded-2xl border-2 text-left transition-all duration-200 bg-[#0d1527] ${
                      isSelected
                        ? `border-emerald-500 shadow-xl shadow-emerald-500/10`
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-emerald-400">
                        {product.icon}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${product.badgeColor}`}>
                          {product.badge}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-black">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="font-bold text-white text-base mb-1">{product.name}</div>
                    <div className="text-xs text-white/60 mb-4">{product.tagline}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5">
                        <div className="text-2xs text-white/40">Min. Amount</div>
                        <div className="text-xs font-bold text-white mt-0.5">₦{product.minAmount.toLocaleString()}</div>
                      </div>
                      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5">
                        <div className="text-2xs text-white/40">Rate</div>
                        <div className="text-xs font-bold text-emerald-400 mt-0.5">{product.interestRate}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="px-6 py-2.5 rounded-xl border border-white/15 text-white text-sm font-semibold hover:bg-white/[0.05]">
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedProduct}
                className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Amount & Duration ── */}
        {step === 3 && selectedProduct && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Form */}
              <div className="lg:col-span-3 space-y-6 bg-[#0d1527] border border-white/10 rounded-2xl p-6 sm:p-7 shadow-xl">
                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    {selectedProduct.icon}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{selectedProduct.name}</div>
                    <div className="text-xs text-white/50">{selectedProduct.interestRate} · {selectedProduct.duration}</div>
                  </div>
                  <button onClick={() => setStep(2)} className="ml-auto text-xs text-emerald-400 hover:underline">Change</button>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    {productType === 'savings' ? 'Monthly Contribution Amount' : productType === 'loan' ? 'Loan Amount Requested' : 'Investment Amount'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-bold text-sm">₦</span>
                    <input
                      type="text"
                      value={amount}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, '');
                        setAmount(raw ? parseInt(raw).toLocaleString() : '');
                      }}
                      placeholder={`Min. ₦${selectedProduct.minAmount.toLocaleString()}`}
                      className="w-full border border-white/15 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 bg-white/[0.04] text-white"
                    />
                  </div>
                  {selectedProduct.maxAmount && (
                    <p className="text-xs text-white/50 mt-1">Range: ₦{selectedProduct.minAmount.toLocaleString()} – ₦{selectedProduct.maxAmount.toLocaleString()}</p>
                  )}
                  {!selectedProduct.maxAmount && (
                    <p className="text-xs text-white/50 mt-1">Minimum: ₦{selectedProduct.minAmount.toLocaleString()}</p>
                  )}
                </div>

                {/* Duration Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-bold text-white">Duration (months)</label>
                    <span className="text-sm font-bold text-emerald-400">{duration || selectedProduct.durationMin} mo</span>
                  </div>
                  <input
                    type="range"
                    min={selectedProduct.durationMin}
                    max={selectedProduct.durationMax}
                    value={duration || selectedProduct.durationMin}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-emerald-500"
                  />
                  <div className="flex justify-between text-xs text-white/40 mt-1">
                    <span>{selectedProduct.durationMin} mo</span>
                    <span>{selectedProduct.durationMax} mo</span>
                  </div>
                </div>

                {/* Eligibility Context Inputs */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Eligibility Verification Context
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1.5">How long have you been a CLIMPS member?</label>
                    <select
                      value={memberMonths}
                      onChange={(e) => setMemberMonths(parseInt(e.target.value))}
                      className="w-full border border-white/15 rounded-xl px-4 py-2.5 text-sm bg-white/[0.04] text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value={0} className="bg-[#0d1527]">Less than 1 month</option>
                      <option value={1} className="bg-[#0d1527]">1–2 months</option>
                      <option value={3} className="bg-[#0d1527]">3–5 months</option>
                      <option value={6} className="bg-[#0d1527]">6–11 months</option>
                      <option value={12} className="bg-[#0d1527]">12–23 months</option>
                      <option value={24} className="bg-[#0d1527]">24+ months</option>
                    </select>
                  </div>
                  {productType === 'loan' && (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-white">Savings balance ≥ ₦20,000?</div>
                          <div className="text-xs text-white/50">Required for Personal Loan</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setHasSavings(!hasSavings)}
                          className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${hasSavings ? 'bg-emerald-500' : 'bg-white/20'}`}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${hasSavings ? 'translate-x-5' : ''}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-white">Any outstanding loan default?</div>
                          <div className="text-xs text-white/50">Must be free of arrears</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setHasDefault(!hasDefault)}
                          className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${hasDefault ? 'bg-red-500' : 'bg-white/20'}`}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${hasDefault ? 'translate-x-5' : ''}`} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Live Projection Panel */}
              <div className="lg:col-span-2 space-y-4">
                {projection && (
                  <div className="p-6 rounded-2xl border border-white/10 bg-[#0d1527] shadow-xl space-y-4">
                    <div className="text-xs font-bold text-white/50 uppercase tracking-wider">Live Projection</div>
                    <div>
                      <div className="text-xs text-white/50">{projection.label}</div>
                      <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                        ₦{Math.round(projection.value).toLocaleString()}
                      </div>
                    </div>
                    <div className="h-px bg-white/10" />
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-white/40">Principal / Base</div>
                        <div className="text-sm font-bold text-white mt-0.5">₦{amountNum.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-white/40">
                          {productType === 'loan' ? 'Total Interest (10%/mo)' : 'Estimated Gain'}
                        </div>
                        <div className={`text-sm font-bold mt-0.5 ${productType === 'loan' ? 'text-amber-400' : 'text-emerald-400'}`}>
                          ₦{Math.round(projection.interest).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-white/40">Duration</div>
                        <div className="text-sm font-bold text-white mt-0.5">{durationNum} months</div>
                      </div>
                      <div>
                        <div className="text-white/40">Rate</div>
                        <div className="text-sm font-bold text-emerald-400 mt-0.5">{selectedProduct.interestRate}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Eligibility requirements */}
                <div className="p-5 rounded-2xl bg-[#0d1527] border border-white/10 shadow-xl">
                  <div className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Requirements</div>
                  <ul className="space-y-2.5">
                    {selectedProduct.eligibility.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-white/80">
                        <svg className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(2)} className="px-6 py-2.5 rounded-xl border border-white/15 text-white text-sm font-semibold hover:bg-white/[0.05]">
                ← Back
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!amount || !duration}
                className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Check Eligibility →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Eligibility & Submit ── */}
        {step === 4 && selectedProduct && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Eligibility Panel */}
              <div className="lg:col-span-3 space-y-5">
                <h2 className="text-lg font-bold text-white">Eligibility Assessment</h2>

                {checking ? (
                  <div className="p-8 rounded-2xl border border-white/10 bg-[#0d1527] flex flex-col items-center gap-4 text-center">
                    <div className="w-10 h-10 rounded-full border-3 border-emerald-400 border-t-transparent animate-spin" />
                    <p className="text-sm text-white/60">Running eligibility evaluation…</p>
                  </div>
                ) : eligibility ? (
                  <div className="space-y-4">
                    {/* Score Banner */}
                    <div className="p-5 rounded-2xl border border-white/10 bg-[#0d1527] shadow-xl">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-extrabold ${
                          eligibility.eligible ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        }`}>
                          {eligibility.score}%
                        </div>
                        <div>
                          <div className={`font-bold text-base ${
                            eligibility.eligible ? 'text-emerald-400' : 'text-amber-400'
                          }`}>
                            {eligibility.eligible ? '✓ Fully Eligible' : '⚠ Action Required'}
                          </div>
                          <div className="text-xs text-white/60 mt-0.5">{eligibility.summary}</div>
                        </div>
                      </div>
                      <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            eligibility.eligible ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${eligibility.score}%` }}
                        />
                      </div>
                    </div>

                    {/* Check Items */}
                    <div className="space-y-2">
                      {eligibility.checks.map((check, i) => (
                        <div
                          key={i}
                          className={`flex items-start gap-3 p-4 rounded-xl border ${
                            check.pass ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                            check.pass ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white'
                          }`}>
                            {check.pass ? '✓' : '✕'}
                          </div>
                          <div>
                            <div className={`text-xs font-bold ${check.pass ? 'text-emerald-400' : 'text-red-400'}`}>{check.label}</div>
                            <div className="text-2xs text-white/60 mt-0.5">{check.note}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Application Summary */}
                <div className="p-5 rounded-2xl bg-[#0d1527] border border-white/10 shadow-xl space-y-3">
                  <div className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Application Summary</div>
                  {[
                    { label: 'Category', value: tc.label },
                    { label: 'Selected Facility', value: selectedProduct.name },
                    { label: 'Amount', value: `₦${amountNum.toLocaleString()}` },
                    { label: 'Tenure', value: `${durationNum} months` },
                    { label: 'Rate Terms', value: selectedProduct.interestRate },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0">
                      <span className="text-white/50">{label}</span>
                      <span className="font-bold text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Actions */}
              <div className="lg:col-span-2 space-y-4">
                {projection && (
                  <div className="p-6 rounded-2xl border border-white/10 bg-[#0d1527] shadow-xl space-y-3">
                    <div className="text-xs font-bold text-white/50 uppercase tracking-wider">Final Projection</div>
                    <div>
                      <div className="text-xs text-white/50">{projection.label}</div>
                      <div className="text-2xl font-bold text-emerald-400 mt-1">
                        ₦{Math.round(projection.value).toLocaleString()}
                      </div>
                    </div>
                    <div className="h-px bg-white/10" />
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-white/40">Principal</div>
                        <div className="font-bold text-white mt-0.5">₦{amountNum.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-white/40">{productType === 'loan' ? 'Total Interest' : 'Projected Gain'}</div>
                        <div className={`font-bold mt-0.5 ${productType === 'loan' ? 'text-amber-400' : 'text-emerald-400'}`}>
                          ₦{Math.round(projection.interest).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!user && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>You must be signed in with your CLIMPS account to submit this application.</span>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white/60 leading-relaxed">
                  By submitting this application, you confirm that you agree to CLIMPS Cooperative&apos;s rules and policies.
                </div>

                <div className="space-y-3">
                  {user ? (
                    <button
                      onClick={handleSubmit}
                      disabled={!eligibility?.eligible || submitting}
                      className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Submitting…' : eligibility?.eligible ? 'Submit Application' : 'Resolve Issues to Submit'}
                    </button>
                  ) : (
                    <Link
                      href={`/login?redirect=${encodeURIComponent('/apply')}`}
                      className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                      <span>Sign In to Submit Application</span>
                    </Link>
                  )}
                  {submitError && (
                    <p className="text-xs text-red-400 text-center">{submitError}</p>
                  )}
                  <button onClick={() => setStep(3)} className="w-full py-2.5 rounded-xl border border-white/15 text-white/70 text-xs font-semibold hover:text-white hover:bg-white/[0.05]">
                    ← Back to Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <LandingFooter />
    </div>
  );
}
