'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

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
    tagline: 'Consistent. Disciplined. Rewarding.',
    minAmount: 5000,
    interestRate: '9% p.a.',
    duration: '12 – 60 months',
    durationMin: 12,
    durationMax: 60,
    badge: 'Most Popular',
    badgeColor: 'bg-blue-100 text-blue-700',
    accentColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    bgGradient: 'from-blue-50 to-white',
    eligibility: ['Active CLIMPS member', 'Valid BVN', 'Minimum ₦5,000/month'],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'regular-savings',
    name: 'Regular Savings',
    tagline: 'Save anytime. Grow always.',
    minAmount: 1000,
    interestRate: '7% p.a.',
    duration: 'No fixed term',
    durationMin: 1,
    durationMax: 120,
    badge: 'Flexible',
    badgeColor: 'bg-teal-100 text-teal-700',
    accentColor: 'text-teal-600',
    borderColor: 'border-teal-200',
    bgGradient: 'from-teal-50 to-white',
    eligibility: ['Active CLIMPS member', 'Opening balance ₦1,000', 'Valid ID'],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'goal-savings',
    name: 'Goal Savings',
    tagline: 'Name it. Plan it. Achieve it.',
    minAmount: 2000,
    interestRate: '10% p.a.',
    duration: '3 – 36 months',
    durationMin: 3,
    durationMax: 36,
    badge: 'Goal-Based',
    badgeColor: 'bg-purple-100 text-purple-700',
    accentColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    bgGradient: 'from-purple-50 to-white',
    eligibility: ['Active CLIMPS member', 'Minimum ₦2,000/month', 'Defined goal target'],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    id: 'fixed-deposit',
    name: 'Fixed Deposit',
    tagline: 'Lock in. Earn more.',
    minAmount: 50000,
    interestRate: '12% p.a.',
    duration: '6 – 24 months',
    durationMin: 6,
    durationMax: 24,
    badge: 'High Yield',
    badgeColor: 'bg-amber-100 text-amber-700',
    accentColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    bgGradient: 'from-amber-50 to-white',
    eligibility: ['Active CLIMPS member', 'Minimum ₦50,000 lump sum', 'No early withdrawal'],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
];

const loanOptions: ProductOption[] = [
  {
    id: 'emergency-loan',
    name: 'Emergency Loan',
    tagline: 'Fast cash when it matters most.',
    minAmount: 10000,
    maxAmount: 200000,
    interestRate: '5% flat',
    duration: '1 – 3 months',
    durationMin: 1,
    durationMax: 3,
    badge: 'Instant Access',
    badgeColor: 'bg-red-100 text-red-700',
    accentColor: 'text-red-600',
    borderColor: 'border-red-200',
    bgGradient: 'from-red-50 to-white',
    eligibility: ['Active member 3+ months', 'No outstanding default', 'Valid ID + BVN'],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: 'personal-loan',
    name: 'Personal Loan',
    tagline: 'Your goals, your terms.',
    minAmount: 50000,
    maxAmount: 1500000,
    interestRate: '8% p.a.',
    duration: '3 – 24 months',
    durationMin: 3,
    durationMax: 24,
    badge: 'Most Popular',
    badgeColor: 'bg-blue-100 text-blue-700',
    accentColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    bgGradient: 'from-blue-50 to-white',
    eligibility: ['Active member 6+ months', 'Min savings ₦20,000', 'Guarantor above ₦500k'],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: 'business-loan',
    name: 'Business Loan',
    tagline: 'Capital to grow your enterprise.',
    minAmount: 100000,
    maxAmount: 5000000,
    interestRate: '10% p.a.',
    duration: '6 – 36 months',
    durationMin: 6,
    durationMax: 36,
    badge: 'SME Focused',
    badgeColor: 'bg-orange-100 text-orange-700',
    accentColor: 'text-orange-600',
    borderColor: 'border-orange-200',
    bgGradient: 'from-orange-50 to-white',
    eligibility: ['Active member 12+ months', 'Business registration docs', 'Collateral may be required'],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    id: 'salary-loan',
    name: 'Salary Advance',
    tagline: 'Bridge the gap before payday.',
    minAmount: 20000,
    maxAmount: 500000,
    interestRate: '4% flat',
    duration: '1 – 6 months',
    durationMin: 1,
    durationMax: 6,
    badge: 'Salary Earners',
    badgeColor: 'bg-green-100 text-green-700',
    accentColor: 'text-green-600',
    borderColor: 'border-green-200',
    bgGradient: 'from-green-50 to-white',
    eligibility: ['Confirmed employment', 'Salary domiciled with CLIMPS', 'Min 3 months salary history'],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
];

const investmentOptions: ProductOption[] = [
  {
    id: 'cooperative-shares',
    name: 'Cooperative Shares',
    tagline: 'Own a piece. Earn dividends.',
    minAmount: 10000,
    interestRate: '14–18% p.a.',
    duration: 'Ongoing (annual)',
    durationMin: 12,
    durationMax: 120,
    badge: 'Member Exclusive',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    accentColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    bgGradient: 'from-emerald-50 to-white',
    eligibility: ['Active CLIMPS member', 'Minimum ₦10,000 investment', 'Annual dividend payout'],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: 'fixed-investment',
    name: 'Fixed Investment Plan',
    tagline: 'Lock in. Earn guaranteed returns.',
    minAmount: 50000,
    interestRate: '15% p.a.',
    duration: '6 – 24 months',
    durationMin: 6,
    durationMax: 24,
    badge: 'Guaranteed',
    badgeColor: 'bg-blue-100 text-blue-700',
    accentColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    bgGradient: 'from-blue-50 to-white',
    eligibility: ['Active CLIMPS member', 'Minimum ₦50,000 lump sum', 'No early withdrawal'],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    id: 'real-estate-fund',
    name: 'Real Estate Fund',
    tagline: 'Property wealth. Shared access.',
    minAmount: 100000,
    interestRate: '20–25% p.a.',
    duration: '12 – 36 months',
    durationMin: 12,
    durationMax: 36,
    badge: 'High Yield',
    badgeColor: 'bg-amber-100 text-amber-700',
    accentColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    bgGradient: 'from-amber-50 to-white',
    eligibility: ['Active member 6+ months', 'Minimum ₦100,000', 'Risk acknowledgement required'],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'agri-investment',
    name: 'Agricultural Investment',
    tagline: 'Farm the future. Harvest returns.',
    minAmount: 25000,
    interestRate: '18–22% p.a.',
    duration: '6 – 18 months',
    durationMin: 6,
    durationMax: 18,
    badge: 'Seasonal',
    badgeColor: 'bg-lime-100 text-lime-700',
    accentColor: 'text-lime-600',
    borderColor: 'border-lime-200',
    bgGradient: 'from-lime-50 to-white',
    eligibility: ['Active CLIMPS member', 'Minimum ₦25,000', 'Seasonal cycle commitment'],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
  if (product.id === 'emergency-loan') requiredMonths = 3;
  else if (product.id === 'personal-loan') requiredMonths = 6;
  else if (product.id === 'business-loan') requiredMonths = 12;
  else if (type === 'investment' && product.id === 'real-estate-fund') requiredMonths = 6;

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

  // Savings balance for personal loan
  if (product.id === 'personal-loan') {
    checks.push({
      label: 'Savings balance',
      pass: hasSavings,
      note: hasSavings
        ? 'Minimum savings balance of ₦20,000 confirmed' :'You need a minimum savings balance of ₦20,000',
    });
  }

  // No default check for loans
  if (type === 'loan') {
    checks.push({
      label: 'No outstanding default',
      pass: !hasDefault,
      note: !hasDefault
        ? 'No outstanding loan defaults on record' :'Outstanding loan default detected — resolve before applying',
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
      : `${total - passed} eligibility requirement${total - passed > 1 ? 's' : ''} not met. Review the details below.`,
  };
}

// ─── Projection Calculator ────────────────────────────────────────────────────
function calcProjection(type: ProductType, product: ProductOption, amount: number, duration: number) {
  const rateStr = product.interestRate.replace(/[^0-9.–-]/g, '');
  const parts = rateStr.split(/[–-]/);
  const rate = parseFloat(parts[parts.length - 1]) / 100;

  if (type === 'savings') {
    const maturity = amount * Math.pow(1 + rate / 12, duration);
    const interest = maturity - amount;
    return { label: 'Projected Maturity Value', value: maturity, interest, monthly: amount };
  } else if (type === 'loan') {
    const monthly = (amount * (rate / 12)) / (1 - Math.pow(1 + rate / 12, -duration));
    const total = monthly * duration;
    const interest = total - amount;
    return { label: 'Monthly Repayment', value: monthly, interest, monthly };
  } else {
    const returns = amount * rate * (duration / 12);
    const maturity = amount + returns;
    return { label: 'Projected Returns', value: returns, interest: returns, monthly: maturity };
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
            ? 'bg-accent text-white'
            : active
            ? 'bg-primary text-white ring-4 ring-primary/20' :'bg-muted text-muted-foreground'
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
      <span className={`text-xs font-medium hidden sm:block ${active ? 'text-primary' : done ? 'text-accent' : 'text-muted-foreground'}`}>
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

  // KYC gate: authenticated members must complete KYC before applying
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
      } catch { /* no member row — allow public access */ }
      setKycChecked(true);
    })();
  }, [user, loading]);

  const products = productsByType[productType];

  // Reset product when type changes
  useEffect(() => {
    setSelectedProduct(null);
    setAmount('');
    setDuration('');
    setEligibility(null);
  }, [productType]);

  // Real-time eligibility check
  const runCheck = useCallback(() => {
    if (!selectedProduct || !amount || !duration) return;
    const amt = parseFloat(amount.replace(/,/g, ''));
    const dur = parseInt(duration);
    if (isNaN(amt) || isNaN(dur) || amt <= 0 || dur <= 0) return;

    setChecking(true);
    // Simulate async check
    setTimeout(() => {
      const result = runEligibilityCheck(productType, selectedProduct, amt, dur, memberMonths, hasSavings, hasDefault);
      setEligibility(result);
      setChecking(false);
    }, 600);
  }, [selectedProduct, amount, duration, productType, memberMonths, hasSavings, hasDefault]);

  useEffect(() => {
    const timer = setTimeout(runCheck, 400);
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
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      activeBg: 'bg-blue-600',
      gradient: 'from-blue-600 to-blue-700',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    loan: {
      label: 'Loan',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      activeBg: 'bg-orange-600',
      gradient: 'from-orange-600 to-orange-700',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    investment: {
      label: 'Investment',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      activeBg: 'bg-emerald-600',
      gradient: 'from-emerald-600 to-emerald-700',
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Application Submitted!</h2>
          <p className="text-muted-foreground mb-2">
            Your <strong>{selectedProduct?.name}</strong> application for{' '}
            <strong>₦{amountNum.toLocaleString()}</strong> has been received.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Reference: <span className="font-mono font-semibold text-primary">CLIMPS-{Date.now().toString().slice(-8)}</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/landing" className="btn-outline">Back to Home</Link>
            <button
              onClick={() => { setSubmitted(false); setStep(1); setSelectedProduct(null); setAmount(''); setDuration(''); setEligibility(null); }}
              className="btn-primary"
            >
              New Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!selectedProduct || !eligibility) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const supabase = createClient();

      // Get current user (may be null for public/unauthenticated visitors)
      const { data: { user } } = await supabase.auth.getUser();

      // Try to find member record if user is logged in
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2.5">
            <Image
              src="/assets/images/WhatsApp_Image_2026-09-19_at_12.24.54-1789999920386.jpeg"
              alt="CLIMPS Cooperative Logo"
              width={32}
              height={32}
              className="rounded-lg object-cover"
            />
            <span className="font-bold text-primary text-base">CLIMPS</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">Already a member?</span>
            <Link href="/" className="btn-outline text-sm py-2 px-4">Sign In</Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Product Application</h1>
          <p className="text-muted-foreground">Select a product, enter your details, and check your eligibility in real time.</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-0 mb-10">
          <StepDot step={1} current={step} label="Product Type" />
          <div className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${step > 1 ? 'bg-accent' : 'bg-border'}`} />
          <StepDot step={2} current={step} label="Select Product" />
          <div className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${step > 2 ? 'bg-accent' : 'bg-border'}`} />
          <StepDot step={3} current={step} label="Amount & Duration" />
          <div className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${step > 3 ? 'bg-accent' : 'bg-border'}`} />
          <StepDot step={4} current={step} label="Eligibility & Submit" />
        </div>

        {/* ── STEP 1: Product Type ── */}
        {step === 1 && (
          <div className="fade-in">
            <h2 className="text-lg font-semibold text-foreground mb-6">What would you like to do?</h2>
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
                        ? `border-current ${cfg.color} bg-gradient-to-br ${cfg.gradient} text-white shadow-lg scale-[1.02]`
                        : `border-border bg-card hover:border-current ${cfg.color} hover:shadow-md`
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                      isActive ? 'bg-white/20' : `${cfg.bg}`
                    }`}>
                      <span className={isActive ? 'text-white' : cfg.color}>{cfg.icon}</span>
                    </div>
                    <div className={`text-xl font-bold mb-1 ${isActive ? 'text-white' : 'text-foreground'}`}>{cfg.label}</div>
                    <div className={`text-sm ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
                      {type === 'savings' && 'Grow your money with competitive interest rates'}
                      {type === 'loan' && 'Access funds for personal or business needs'}
                      {type === 'investment' && 'Earn higher returns on your capital'}
                    </div>
                    {isActive && (
                      <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-white/30 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end">
              <button onClick={() => setStep(2)} className="btn-primary px-8">
                Continue
                <svg className="w-4 h-4 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Select Product ── */}
        {step === 2 && (
          <div className="fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-8 h-8 rounded-lg ${tc.bg} flex items-center justify-center`}>
                <span className={tc.color}>{tc.icon}</span>
              </div>
              <h2 className="text-lg font-semibold text-foreground">Choose a {tc.label} Product</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {products.map((product) => {
                const isSelected = selectedProduct?.id === product.id;
                return (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 bg-gradient-to-br ${product.bgGradient} ${
                      isSelected
                        ? `${product.borderColor} shadow-md`
                        : 'border-border hover:border-current hover:shadow-sm'
                    } ${product.accentColor}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center ${product.accentColor}`}>
                        {product.icon}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${product.badgeColor}`}>
                          {product.badge}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="font-semibold text-foreground mb-0.5">{product.name}</div>
                    <div className="text-xs text-muted-foreground mb-3">{product.tagline}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white/60 rounded-lg p-2">
                        <div className="text-xs text-muted-foreground">Min. Amount</div>
                        <div className={`text-sm font-semibold ${product.accentColor}`}>₦{product.minAmount.toLocaleString()}</div>
                      </div>
                      <div className="bg-white/60 rounded-lg p-2">
                        <div className="text-xs text-muted-foreground">Rate</div>
                        <div className={`text-sm font-semibold ${product.accentColor}`}>{product.interestRate}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="btn-outline">
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedProduct}
                className="btn-primary px-8 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
                <svg className="w-4 h-4 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Amount & Duration ── */}
        {step === 3 && selectedProduct && (
          <div className="fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Form */}
              <div className="lg:col-span-3 space-y-6">
                <div className={`p-4 rounded-2xl border ${selectedProduct.borderColor} bg-gradient-to-br ${selectedProduct.bgGradient} flex items-center gap-3`}>
                  <div className={`w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center ${selectedProduct.accentColor}`}>
                    {selectedProduct.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">{selectedProduct.name}</div>
                    <div className="text-xs text-muted-foreground">{selectedProduct.interestRate} · {selectedProduct.duration}</div>
                  </div>
                  <button onClick={() => setStep(2)} className="ml-auto text-xs text-muted-foreground hover:text-foreground underline">Change</button>
                </div>

                {/* Amount */}
                <div>
                  <label className="label-base">
                    {productType === 'savings' ? 'Monthly Contribution Amount' : productType === 'loan' ? 'Loan Amount Requested' : 'Investment Amount'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">₦</span>
                    <input
                      type="text"
                      value={amount}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, '');
                        setAmount(raw ? parseInt(raw).toLocaleString() : '');
                      }}
                      placeholder={`Min. ₦${selectedProduct.minAmount.toLocaleString()}`}
                      className="input-base pl-8"
                    />
                  </div>
                  {selectedProduct.maxAmount && (
                    <p className="helper-text">Range: ₦{selectedProduct.minAmount.toLocaleString()} – ₦{selectedProduct.maxAmount.toLocaleString()}</p>
                  )}
                  {!selectedProduct.maxAmount && (
                    <p className="helper-text">Minimum: ₦{selectedProduct.minAmount.toLocaleString()}</p>
                  )}
                </div>

                {/* Duration Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="label-base mb-0">Duration (months)</label>
                    <span className={`text-sm font-bold ${selectedProduct.accentColor}`}>{duration || selectedProduct.durationMin} mo</span>
                  </div>
                  <input
                    type="range"
                    min={selectedProduct.durationMin}
                    max={selectedProduct.durationMax}
                    value={duration || selectedProduct.durationMin}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-muted accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{selectedProduct.durationMin} mo</span>
                    <span>{selectedProduct.durationMax} mo</span>
                  </div>
                  <div className="mt-2">
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      min={selectedProduct.durationMin}
                      max={selectedProduct.durationMax}
                      placeholder={`${selectedProduct.durationMin}–${selectedProduct.durationMax}`}
                      className="input-base w-32 text-center"
                    />
                  </div>
                </div>

                {/* Eligibility Context Inputs */}
                <div className="p-4 rounded-2xl bg-muted/50 border border-border space-y-4">
                  <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Eligibility Context
                  </div>
                  <div>
                    <label className="label-base">How long have you been a CLIMPS member?</label>
                    <select
                      value={memberMonths}
                      onChange={(e) => setMemberMonths(parseInt(e.target.value))}
                      className="input-base"
                    >
                      <option value={0}>Less than 1 month</option>
                      <option value={1}>1–2 months</option>
                      <option value={3}>3–5 months</option>
                      <option value={6}>6–11 months</option>
                      <option value={12}>12–23 months</option>
                      <option value={24}>24+ months</option>
                    </select>
                  </div>
                  {productType === 'loan' && (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-foreground">Savings balance ≥ ₦20,000?</div>
                          <div className="text-xs text-muted-foreground">Required for some loan products</div>
                        </div>
                        <button
                          onClick={() => setHasSavings(!hasSavings)}
                          className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${hasSavings ? 'bg-accent' : 'bg-muted'}`}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${hasSavings ? 'translate-x-5' : ''}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-foreground">Any outstanding loan default?</div>
                          <div className="text-xs text-muted-foreground">Affects all loan applications</div>
                        </div>
                        <button
                          onClick={() => setHasDefault(!hasDefault)}
                          className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${hasDefault ? 'bg-destructive' : 'bg-muted'}`}
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
                  <div className={`p-5 rounded-2xl border ${selectedProduct.borderColor} bg-gradient-to-br ${selectedProduct.bgGradient}`}>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Live Projection</div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-muted-foreground">{projection.label}</div>
                        <div className={`text-2xl font-bold ${selectedProduct.accentColor}`}>
                          ₦{Math.round(projection.value).toLocaleString()}
                        </div>
                      </div>
                      <div className="h-px bg-border" />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-muted-foreground">Principal</div>
                          <div className="text-sm font-semibold text-foreground">₦{amountNum.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            {productType === 'loan' ? 'Total Interest' : 'Projected Gain'}
                          </div>
                          <div className={`text-sm font-semibold ${productType === 'loan' ? 'text-orange-600' : 'text-accent'}`}>
                            ₦{Math.round(projection.interest).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Duration</div>
                          <div className="text-sm font-semibold text-foreground">{durationNum} months</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Rate</div>
                          <div className="text-sm font-semibold text-foreground">{selectedProduct.interestRate}</div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
                      * Projections are estimates only and not guaranteed returns.
                    </p>
                  </div>
                )}

                {/* Eligibility requirements */}
                <div className="p-4 rounded-2xl bg-card border border-border">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Requirements</div>
                  <ul className="space-y-2">
                    {selectedProduct.eligibility.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <svg className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <button onClick={() => setStep(2)} className="btn-outline">
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!amount || !duration}
                className="btn-primary px-8 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Check Eligibility
                <svg className="w-4 h-4 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Eligibility & Submit ── */}
        {step === 4 && selectedProduct && (
          <div className="fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Eligibility Panel */}
              <div className="lg:col-span-3 space-y-5">
                <h2 className="text-lg font-semibold text-foreground">Eligibility Check</h2>

                {checking ? (
                  <div className="p-8 rounded-2xl border border-border bg-card flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Running eligibility check…</p>
                  </div>
                ) : eligibility ? (
                  <div className="space-y-4">
                    {/* Score Banner */}
                    <div className={`p-5 rounded-2xl border-2 ${
                      eligibility.eligible
                        ? 'border-accent bg-accent/5'
                        : eligibility.score >= 60
                        ? 'border-warning bg-warning/5' :'border-destructive bg-destructive/5'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold ${
                          eligibility.eligible ? 'bg-accent text-white' : eligibility.score >= 60 ? 'bg-warning text-white' : 'bg-destructive text-white'
                        }`}>
                          {eligibility.score}%
                        </div>
                        <div>
                          <div className={`font-bold text-base ${
                            eligibility.eligible ? 'text-accent' : eligibility.score >= 60 ? 'text-warning' : 'text-destructive'
                          }`}>
                            {eligibility.eligible ? '✓ Eligible' : eligibility.score >= 60 ? '⚠ Partially Eligible' : '✗ Not Eligible'}
                          </div>
                          <div className="text-sm text-muted-foreground">{eligibility.summary}</div>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-4 h-2 bg-white/60 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            eligibility.eligible ? 'bg-accent' : eligibility.score >= 60 ? 'bg-warning' : 'bg-destructive'
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
                            check.pass ? 'bg-accent/5 border-accent/20' : 'bg-destructive/5 border-destructive/20'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            check.pass ? 'bg-accent' : 'bg-destructive'
                          }`}>
                            {check.pass ? (
                              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <div className={`text-sm font-semibold ${check.pass ? 'text-accent' : 'text-destructive'}`}>{check.label}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{check.note}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl border border-border bg-card text-center text-muted-foreground text-sm">
                    Enter amount and duration to run eligibility check.
                  </div>
                )}

                {/* Application Summary */}
                <div className="p-5 rounded-2xl bg-card border border-border">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Application Summary</div>
                  <div className="space-y-3">
                    {[
                      { label: 'Product Type', value: tc.label },
                      { label: 'Product', value: selectedProduct.name },
                      { label: 'Amount', value: `₦${amountNum.toLocaleString()}` },
                      { label: 'Duration', value: `${durationNum} months` },
                      { label: 'Interest Rate', value: selectedProduct.interestRate },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-semibold text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Projection + Actions */}
              <div className="lg:col-span-2 space-y-4">
                {projection && (
                  <div className={`p-5 rounded-2xl border ${selectedProduct.borderColor} bg-gradient-to-br ${selectedProduct.bgGradient}`}>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Final Projection</div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-muted-foreground">{projection.label}</div>
                        <div className={`text-2xl font-bold ${selectedProduct.accentColor}`}>
                          ₦{Math.round(projection.value).toLocaleString()}
                        </div>
                      </div>
                      <div className="h-px bg-border" />
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-xs text-muted-foreground">Principal</div>
                          <div className="font-semibold">₦{amountNum.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">{productType === 'loan' ? 'Total Interest' : 'Gain'}</div>
                          <div className={`font-semibold ${productType === 'loan' ? 'text-orange-600' : 'text-accent'}`}>
                            ₦{Math.round(projection.interest).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-muted/50 border border-border text-xs text-muted-foreground leading-relaxed">
                  By submitting this application, you confirm that the information provided is accurate and agree to CLIMPS Cooperative's terms and conditions.
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleSubmit}
                    disabled={!eligibility?.eligible || submitting}
                    className="w-full btn-accent py-3 text-base disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Submitting…
                      </span>
                    ) : eligibility?.eligible ? 'Submit Application' : 'Resolve Issues to Submit'}
                  </button>
                  {submitError && (
                    <p className="text-sm text-destructive text-center">{submitError}</p>
                  )}
                  {!eligibility?.eligible && eligibility && (
                    <button
                      onClick={() => setStep(3)}
                      className="w-full btn-outline py-2.5"
                    >
                      Adjust Details
                    </button>
                  )}
                  <button onClick={() => setStep(3)} className="w-full btn-ghost text-sm">
                    <svg className="w-4 h-4 mr-1.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
