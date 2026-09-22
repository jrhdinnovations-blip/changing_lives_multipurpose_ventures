'use client';
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// ── Static product catalogue (mirrors savings-products page) ──────────────
const PRODUCTS = [
  { id: 'monthly-contribution', name: 'Monthly Cooperative Contribution', badge: 'Mandatory', badgeColor: 'bg-blue-100 text-blue-700', rate: '9% p.a.', min: 5000, isMandatory: true, description: 'Core cooperative contribution, required for all active members.' },
  { id: 'regular-savings', name: 'Regular Savings', badge: 'Flexible', badgeColor: 'bg-teal-100 text-teal-700', rate: '7% p.a.', min: 1000, isMandatory: false, description: 'Flexible voluntary savings with no lock-in period.' },
  { id: 'goal-savings', name: 'Goal Savings', badge: 'Goal-Based', badgeColor: 'bg-purple-100 text-purple-700', rate: '10% p.a.', min: 2000, isMandatory: false, description: 'Save toward a specific target: rent, school fees, or a dream.' },
  { id: 'emergency-savings', name: 'Emergency Savings', badge: 'Always Accessible', badgeColor: 'bg-red-100 text-red-700', rate: '8% p.a.', min: 3000, isMandatory: false, description: 'A dedicated safety net with instant, penalty-free access.' },
  { id: 'business-savings', name: 'Business Savings', badge: 'SME Focused', badgeColor: 'bg-amber-100 text-amber-700', rate: '11% p.a.', min: 10000, isMandatory: false, description: 'Build business capital and unlock preferential loan rates.' },
  { id: 'education-savings', name: 'Education Savings', badge: 'Education', badgeColor: 'bg-indigo-100 text-indigo-700', rate: '10.5% p.a.', min: 2500, isMandatory: false, description: 'Save for school fees, tuition, or professional certifications.' },
  { id: 'fixed-deposit', name: 'Fixed Deposit', badge: 'Highest Returns', badgeColor: 'bg-emerald-100 text-emerald-700', rate: '12% p.a.', min: 100000, isMandatory: false, description: 'Commit a lump sum for the highest guaranteed interest rate.' },
  { id: 'daily-thrift', name: 'Daily Thrift Savings', badge: 'Entry Level', badgeColor: 'bg-sky-100 text-sky-700', rate: '8% p.a.', min: 500, isMandatory: false, description: 'Save as little as ₦500/day — ideal for market traders and artisans.' },
];

type Freq = 'daily' | 'weekly' | 'monthly';

function fmt(n: number) {
  return '₦' + n.toLocaleString('en-NG');
}

// ── Auth-gated inner component ─────────────────────────────────────────────
function StartSavingInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselect = searchParams.get('product') ?? '';

  const [authStatus, setAuthStatus] = useState<'loading' | 'guest' | 'loggedIn'>('loading');
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

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setAuthStatus(data.user ? 'loggedIn' : 'guest');
    });
  }, []);

  const product = PRODUCTS.find((p) => p.id === selectedProduct);
  const parsedAmount = parseFloat(amount.replace(/,/g, '')) || 0;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      // In production: insert into savings_accounts or savings_enrollments table
      await new Promise((res) => setTimeout(res, 1200));
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading
  if (authStatus === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // Guest prompt
  if (authStatus === 'guest') {
    return (
      <div className="max-w-lg mx-auto py-20 px-4 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-9 h-9 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Sign in to Start Saving</h2>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          You need a CLIMPS account to open a savings product. Sign in to an existing account or create a new one — it only takes a few minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login" className="btn-primary px-8 py-3 text-sm font-semibold">
            Sign In
          </Link>
          <Link href="/register" className="btn-outline px-8 py-3 text-sm font-semibold">
            Create Account
          </Link>
        </div>
        <p className="text-xs text-muted-foreground mt-6">
          Already exploring?{' '}
          <Link href="/save/calculator" className="text-primary font-semibold hover:underline">Try our savings calculator</Link>
        </p>
      </div>
    );
  }

  // Success screen
  if (submitted) {
    return (
      <div className="max-w-lg mx-auto py-20 px-4 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-once">
          <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Savings Instruction Submitted!</h2>
        <p className="text-muted-foreground text-sm mb-2 leading-relaxed">
          Your <strong>{product?.name}</strong> savings instruction has been received. A staff member will confirm your account setup within 1–2 business days.
        </p>
        <p className="text-xs text-muted-foreground mb-8">You will receive a notification once your savings account is activated.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/member-dashboard" className="btn-primary px-6 py-2.5 text-sm">Go to Dashboard</Link>
          <Link href="/savings-products" className="btn-outline px-6 py-2.5 text-sm">View All Products</Link>
        </div>
      </div>
    );
  }

  const STEPS = ['Choose Product', 'Set Amount & Frequency', 'Review & Confirm'];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((label, i) => {
          const s = i + 1;
          const done = step > s;
          const active = step === s;
          return (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${done ? 'bg-primary border-primary text-white' : active ? 'bg-white border-primary text-primary' : 'bg-muted border-border text-muted-foreground'}`}>
                  {done ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  ) : s}
                </div>
                <p className={`text-[10px] mt-1 font-semibold hidden sm:block ${active ? 'text-primary' : 'text-muted-foreground'}`}>{label}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 transition-all ${done ? 'bg-primary' : 'bg-border'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Step 1: Choose Product ── */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">Choose a Savings Product</h2>
          <p className="text-muted-foreground text-sm mb-6">Select the product that best matches your financial goals.</p>
          <div className="space-y-3">
            {PRODUCTS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProduct(p.id)}
                className={`w-full text-left rounded-xl border-2 px-4 py-4 transition-all ${selectedProduct === p.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 bg-card'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-foreground text-sm">{p.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${p.badgeColor}`}>{p.badge}</span>
                    <span className="text-xs font-bold text-primary">{p.rate}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.description}</p>
                <p className="text-xs text-muted-foreground mt-1">Min: <strong className="text-foreground">{fmt(p.min)}</strong></p>
                {selectedProduct === p.id && (
                  <div className="mt-2 flex items-center gap-1 text-primary text-xs font-semibold">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Selected
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!selectedProduct}
              className="btn-primary px-8 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Amount & Frequency ── */}
      {step === 2 && product && (
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">Set Amount &amp; Frequency</h2>
          <p className="text-muted-foreground text-sm mb-6">Configure how much and how often you want to save.</p>

          <div className="bg-secondary/40 rounded-xl border border-border px-4 py-3 mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Selected Product</p>
              <p className="font-bold text-foreground text-sm">{product.name}</p>
            </div>
            <button onClick={() => setStep(1)} className="text-xs text-primary font-semibold hover:underline">Change</button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">Contribution Amount (₦)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">₦</span>
                <input
                  type="number"
                  min={product.min}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Min. ${fmt(product.min)}`}
                  className="w-full border border-border rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-card"
                />
              </div>
              {parsedAmount > 0 && parsedAmount < product.min && (
                <p className="text-xs text-destructive mt-1">Minimum contribution is {fmt(product.min)}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">Contribution Frequency</label>
              <div className="grid grid-cols-3 gap-3">
                {(['daily','weekly','monthly'] as Freq[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFrequency(f)}
                    className={`py-3 rounded-xl text-sm font-semibold border transition-all ${frequency === f ? 'bg-primary text-white border-primary shadow-sm' : 'bg-muted text-muted-foreground border-border hover:border-primary/40'}`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-card"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button onClick={() => setStep(1)} className="btn-outline px-6 py-2.5 text-sm">← Back</button>
            <button
              onClick={() => setStep(3)}
              disabled={!parsedAmount || parsedAmount < product.min}
              className="btn-primary px-8 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Review →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Review & Confirm ── */}
      {step === 3 && product && (
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">Review &amp; Confirm</h2>
          <p className="text-muted-foreground text-sm mb-6">Please review your savings instruction before submitting.</p>

          <div className="bg-card rounded-2xl border border-border divide-y divide-border mb-6">
            {[
              { label: 'Savings Product', value: product.name },
              { label: 'Amount', value: fmt(parsedAmount) },
              { label: 'Frequency', value: frequency.charAt(0).toUpperCase() + frequency.slice(1) },
              { label: 'Interest Rate', value: product.rate },
              { label: 'Start Date', value: new Date(startDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center px-4 py-3.5">
                <span className="text-sm text-muted-foreground">{row.label}</span>
                <span className="text-sm font-bold text-foreground">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Terms */}
          <label className="flex items-start gap-3 cursor-pointer mb-6">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 accent-primary w-4 h-4 flex-shrink-0"
            />
            <span className="text-xs text-muted-foreground leading-relaxed">
              I confirm that I have read and agree to the{' '}
              <span className="text-primary font-semibold">CLIMPS Savings Terms &amp; Conditions</span>. I understand that this is an instruction to save and my account will be set up pending staff confirmation.
            </span>
          </label>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="btn-outline px-6 py-2.5 text-sm">← Back</button>
            <button
              onClick={handleSubmit}
              disabled={!termsAccepted || submitting}
              className="btn-accent px-8 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/landing" className="flex items-center gap-2.5">
              <Image src="/assets/images/WhatsApp_Image_2026-09-19_at_12.24.54-1789999920386.jpeg" alt="CLIMPS Logo" width={32} height={32} className="rounded-lg object-cover" />
              <span className="font-bold text-base text-primary tracking-tight">CLIMPS</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/savings-products" className="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted">Savings Products</Link>
              <Link href="/save/calculator" className="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted">Calculator</Link>
              <Link href="/save/start" className="px-4 py-2 rounded-lg text-sm font-semibold text-primary bg-secondary/50">Start Saving</Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-semibold text-muted-foreground hover:text-foreground">Sign In</Link>
              <Link href="/register" className="btn-accent text-sm px-4 py-2">Become a Member</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="gradient-primary py-10 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-3">
            <Link href="/savings-products" className="text-white/60 text-sm hover:text-white/90">Savings</Link>
            <svg className="w-3.5 h-3.5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-white/90 text-sm font-medium">Start Saving</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Start Saving Today</h1>
          <p className="text-white/70 text-sm max-w-xl">Choose your savings product, set your amount, and submit your instruction in under 3 minutes.</p>
        </div>
      </div>

      {/* Main */}
      <main className="py-10">
        <Suspense fallback={<div className="flex items-center justify-center h-40"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>}>
          <StartSavingInner />
        </Suspense>
      </main>

      <footer className="border-t border-border bg-white py-6 mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-sm font-semibold text-primary">CLIMPS Cooperative</span>
          <p className="text-xs text-muted-foreground">© 2026 CLIMPS Multipurpose Cooperative Society. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/savings-products" className="text-xs text-muted-foreground hover:text-foreground">Products</Link>
            <Link href="/save/calculator" className="text-xs text-muted-foreground hover:text-foreground">Calculator</Link>
            <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
