'use client';
import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LandingNav from '@/app/landing/components/LandingNav';
import LandingFooter from '@/app/landing/components/LandingFooter';

const PRODUCTS = [
  {
    id: 'monthly-contribution',
    name: 'Monthly Cooperative Contribution',
    badge: 'Core Savings',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    rate: '4% monthly (48% p.a.)',
    min: 5000,
    max: 200000,
    isMandatory: true,
    description: 'Core cooperative thrift contribution. Must be saved for at least 1 year or interest is forfeited. Min ₦5,000, Max ₦200,000 monthly.',
  },
  {
    id: 'lock-your-funds',
    name: 'Lock Your Funds',
    badge: 'Fixed Term • Locked',
    badgeColor: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    rate: '7.0% p.a. (Credited at Maturity)',
    min: 10000,
    max: 5000000,
    isMandatory: false,
    description: 'Fixed-term locked savings. Minimum 6-month lock-up. ALL interest is forfeited if withdrawn before maturity. Principal is returned in full on early exit. Tenors: 6, 9, 12, 18, or 24 months.',
  },
];

type Freq = 'daily' | 'weekly' | 'monthly';

function fmt(n: number) {
  return '₦' + n.toLocaleString('en-NG');
}

// ── Auth-gated inner component ─────────────────────────────────────────────
function StartSavingInner() {
  const searchParams = useSearchParams();
  const preselect = searchParams.get('product') ?? '';

  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(preselect || '');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<Freq>('monthly');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() + 1); d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const product = PRODUCTS.find((p) => p.id === selectedProduct);
  const parsedAmount = parseFloat(amount.replace(/,/g, '')) || 0;

  const handleSubmit = async () => {
    if (!user) {
      setError('You must sign in before submitting a savings instruction.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await new Promise((res) => setTimeout(res, 1200));
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="max-w-lg mx-auto py-20 px-4 text-center">
        <div className="w-8 h-8 rounded-full border-3 border-emerald-400 border-t-transparent animate-spin mx-auto" />
      </div>
    );
  }

  // Guest prompt (sign-in required)
  if (!user) {
    return (
      <div className="max-w-lg mx-auto py-20 px-4 text-center bg-[#0d1527] border border-white/10 rounded-2xl shadow-xl">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Sign in to Start Saving</h2>
        <p className="text-white/60 text-sm mb-8 leading-relaxed">
          You need a CLIMPS account to open a savings product. Sign in to your account to start building wealth.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/login?redirect=${encodeURIComponent(`/save/start${selectedProduct || preselect ? `?product=${selectedProduct || preselect}` : ''}`)}`}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-500/20 transition-all"
          >
            Sign In to Your Account
          </Link>
        </div>
        <p className="text-xs text-white/40 mt-6">
          Already exploring?{' '}
          <Link href="/save/calculator" className="text-emerald-400 font-semibold hover:underline">Try our savings calculator</Link>
        </p>
      </div>
    );
  }

  // Success screen
  if (submitted) {
    return (
      <div className="max-w-lg mx-auto py-16 px-6 text-center bg-[#0d1527] border border-white/10 rounded-2xl shadow-xl">
        <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-9 h-9 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Savings Instruction Submitted!</h2>
        <p className="text-white/70 text-sm mb-3 leading-relaxed">
          Your <strong className="text-white">{product?.name}</strong> savings instruction has been received. Our admin team will confirm your setup shortly.
        </p>
        <p className="text-xs text-white/50 mb-8">You will receive a notification once your savings account is activated.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/member-dashboard" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-500/20">
            Go to Dashboard
          </Link>
          <Link href="/savings-products" className="px-6 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white font-semibold text-sm hover:bg-white/[0.1]">
            View All Products
          </Link>
        </div>
      </div>
    );
  }

  const STEPS = ['Choose Product', 'Set Amount & Frequency', 'Review & Confirm'];

  return (
    <div className="max-w-2xl mx-auto py-4 px-4">
      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((label, i) => {
          const s = i + 1;
          const done = step > s;
          const active = step === s;
          return (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  done
                    ? 'bg-emerald-500 border-emerald-500 text-black'
                    : active
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-white/5 border-white/15 text-white/40'
                }`}>
                  {done ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  ) : s}
                </div>
                <p className={`text-[10px] mt-1 font-semibold hidden sm:block ${active ? 'text-emerald-400' : 'text-white/40'}`}>{label}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 transition-all ${done ? 'bg-emerald-500' : 'bg-white/10'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Step 1: Choose Product ── */}
      {step === 1 && (
        <div className="bg-[#0d1527] border border-white/10 rounded-2xl p-6 sm:p-7 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-1">Choose a Savings Product</h2>
          <p className="text-white/60 text-sm mb-6">Select the product that best matches your financial goals.</p>
          <div className="space-y-3">
            {PRODUCTS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProduct(p.id)}
                className={`w-full text-left rounded-xl border-2 px-5 py-4 transition-all ${
                  selectedProduct === p.id
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-white/10 hover:border-emerald-500/40 bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white text-sm sm:text-base">{p.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${p.badgeColor}`}>{p.badge}</span>
                    <span className="text-xs font-bold text-emerald-400">{p.rate}</span>
                  </div>
                </div>
                <p className="text-xs text-white/70 leading-relaxed mb-2">{p.description}</p>
                <p className="text-xs text-white/50">
                  Min: <strong className="text-white">{fmt(p.min)}</strong> · Max: <strong className="text-white">{fmt(p.max)}</strong> monthly
                </p>
                {selectedProduct === p.id && (
                  <div className="mt-2.5 flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Selected Product
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!selectedProduct}
              className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Amount & Frequency ── */}
      {step === 2 && product && (
        <div className="bg-[#0d1527] border border-white/10 rounded-2xl p-6 sm:p-7 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-1">Set Amount &amp; Frequency</h2>
          <p className="text-white/60 text-sm mb-6">Configure how much and how often you want to save.</p>

          <div className="bg-white/[0.03] rounded-xl border border-white/10 px-4 py-3 mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-white/50">Selected Product</p>
              <p className="font-bold text-white text-sm">{product.name}</p>
            </div>
            <button onClick={() => setStep(1)} className="text-xs text-emerald-400 font-semibold hover:underline">Change</button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-white block mb-2">Contribution Amount (₦)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50 font-bold text-sm">₦</span>
                <input
                  type="number"
                  min={product.min}
                  max={product.max}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Min. ${fmt(product.min)} - Max. ${fmt(product.max)}`}
                  className="w-full border border-white/15 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white/[0.04] text-white"
                />
              </div>
              {parsedAmount > 0 && parsedAmount < product.min && (
                <p className="text-xs text-red-400 mt-1">Minimum contribution is {fmt(product.min)} monthly</p>
              )}
              {parsedAmount > product.max && (
                <p className="text-xs text-red-400 mt-1">Maximum contribution is {fmt(product.max)} monthly</p>
              )}
            </div>

            {/* 1-Year Minimum Holding Period Rule */}
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5">
              <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-xs text-amber-200 leading-relaxed">
                <strong className="font-semibold text-amber-300 block mb-0.5">1-Year Minimum Savings Rule:</strong>
                Savings earning <strong>4% monthly interest</strong> shall be maintained for at least <strong>1 year</strong> or members lose the interest upon early withdrawal.
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-white block mb-2">Contribution Frequency</label>
              <div className="grid grid-cols-3 gap-3">
                {(['daily','weekly','monthly'] as Freq[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFrequency(f)}
                    className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                      frequency === f
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                        : 'bg-white/[0.04] text-white/60 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-white block mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-white/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white/[0.04] text-white"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button onClick={() => setStep(1)} className="px-6 py-2.5 rounded-xl border border-white/15 text-white/80 font-semibold text-sm hover:bg-white/[0.05]">← Back</button>
            <button
              onClick={() => setStep(3)}
              disabled={!parsedAmount || parsedAmount < product.min || parsedAmount > product.max}
              className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Review →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Review & Confirm ── */}
      {step === 3 && product && (
        <div className="bg-[#0d1527] border border-white/10 rounded-2xl p-6 sm:p-7 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-1">Review &amp; Confirm</h2>
          <p className="text-white/60 text-sm mb-6">Please review your savings instruction before submitting.</p>

          <div className="bg-white/[0.03] rounded-2xl border border-white/10 divide-y divide-white/5 mb-6">
            {[
              { label: 'Savings Product', value: product.name },
              { label: 'Amount', value: fmt(parsedAmount) },
              { label: 'Frequency', value: frequency.charAt(0).toUpperCase() + frequency.slice(1) },
              { label: 'Interest Rate', value: product.rate },
              { label: 'Minimum Period', value: '1 Year (required to retain interest)' },
              { label: 'Start Date', value: new Date(startDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center px-4 py-3.5">
                <span className="text-sm text-white/60">{row.label}</span>
                <span className="text-sm font-bold text-white text-right">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Retention Policy Banner */}
          <div className="mb-5 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200 leading-relaxed">
            <strong className="text-amber-300">Cooperative Savings Rule:</strong> Savings earning 4% monthly shall be maintained for at least 1 full year. Early liquidation or withdrawal before 1 year forfeits all accrued interest.
          </div>

          {/* Terms */}
          <label className="flex items-start gap-3 cursor-pointer mb-6">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 accent-emerald-500 w-4 h-4 flex-shrink-0"
            />
            <span className="text-xs text-white/70 leading-relaxed">
              I confirm that I have read and agree to the{' '}
              <span className="text-emerald-400 font-semibold">CLIMPS Savings Terms &amp; Conditions</span>, including the 1-year minimum savings requirement (or forfeiture of 4% monthly interest). I understand this is an instruction to save pending staff confirmation.
            </span>
          </label>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="px-6 py-2.5 rounded-xl border border-white/15 text-white/80 font-semibold text-sm hover:bg-white/[0.05]">← Back</button>
            <button
              onClick={handleSubmit}
              disabled={!termsAccepted || submitting}
              className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Submitting…</>
              ) : 'Submit Instruction'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StartSavingPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col">
      <LandingNav />

      {/* Hero */}
      <div className="relative py-12 lg:py-16 overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1e] via-[#0d1e38] to-[#08213b] pointer-events-none" />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-3">
            <Link href="/savings-products" className="text-white/60 text-sm hover:text-white transition-colors">Savings</Link>
            <svg className="w-3.5 h-3.5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-emerald-400 text-sm font-semibold">Start Saving</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">Start Saving Today</h1>
          <p className="text-white/70 text-base max-w-xl">Choose your savings product, set your monthly contribution, and submit your instruction in under 3 minutes.</p>
        </div>
      </div>

      {/* Main */}
      <main className="py-12 flex-1">
        <Suspense fallback={<div className="flex items-center justify-center h-40"><div className="w-8 h-8 rounded-full border-3 border-emerald-400 border-t-transparent animate-spin" /></div>}>
          <StartSavingInner />
        </Suspense>
      </main>

      <LandingFooter />
    </div>
  );
}
