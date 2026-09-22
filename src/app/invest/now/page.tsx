'use client';
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  INVESTMENT_PRODUCTS,
  InvestmentProductDetail,
  formatNaira,
  formatNairaCompact,
  calculateInvestmentReturn,
} from '@/lib/investmentsData';
import {
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Copy,
  Building,
  CreditCard,
  Wallet,
  Clock,
  Printer,
  FileCheck,
} from 'lucide-react';

function generateInvestmentReference(): string {
  const year = new Date().getFullYear();
  const randomSeq = Math.floor(10000 + Math.random() * 90000);
  return `INV/${year}/${randomSeq}`;
}

function InvestNowInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const productParam = searchParams.get('product') || INVESTMENT_PRODUCTS[0].id;
  const amountParam = Number(searchParams.get('amount')) || 0;

  const [authStatus, setAuthStatus] = useState<'loading' | 'guest' | 'loggedIn'>('loading');
  const [userProfile, setUserProfile] = useState<any>(null);

  const [step, setStep] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState(productParam);
  const selectedProduct = INVESTMENT_PRODUCTS.find((p) => p.id === selectedProductId) || INVESTMENT_PRODUCTS[0];

  const [amount, setAmount] = useState<number>(() => {
    return amountParam > 0 ? amountParam : selectedProduct.minimumInvestment;
  });

  const [termsAgreed, setTermsAgreed] = useState(false);
  const [riskAcknowledged, setRiskAcknowledged] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'savings_wallet' | 'card'>('bank_transfer');
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setAuthStatus('loggedIn');
        setUserProfile(data.user.user_metadata);
      } else {
        setAuthStatus('guest');
      }
    });
  }, []);

  const handleProductChange = (id: string) => {
    setSelectedProductId(id);
    const p = INVESTMENT_PRODUCTS.find((item) => item.id === id);
    if (p && amount < p.minimumInvestment) {
      setAmount(p.minimumInvestment);
    }
  };

  const returnEstimate = calculateInvestmentReturn(
    amount,
    selectedProduct.projectedReturnRate,
    selectedProduct.durationMonths,
    'simple'
  );

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const refNumber = generateInvestmentReference();
      // Simulate API / Supabase insert into investment_subscriptions
      await new Promise((res) => setTimeout(res, 1200));
      setSubmittedRef(refNumber);
    } catch {
      alert('Error submitting investment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Loading state
  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // Guest prompt
  if (authStatus === 'guest') {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href="/landing" className="flex items-center gap-2">
              <span className="font-bold text-lg text-primary">CLIMPS</span>
            </Link>
            <Link href="/investment-products" className="text-xs text-muted-foreground hover:text-foreground">
              ← Return to Opportunities
            </Link>
          </div>
        </header>

        <div className="max-w-md mx-auto py-20 px-4 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-5 text-primary">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground mb-2">Member Authentication Required</h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Investments are issued to verified cooperative members. Please sign in to your account or register to open your investment portfolio.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href={`/login?redirect=/invest/now?product=${selectedProductId}`} className="btn-primary flex-1 py-3 text-sm font-semibold text-center">
              Sign In to Continue
            </Link>
            <Link href="/register" className="btn-outline flex-1 py-3 text-sm font-semibold text-center">
              Register as Member
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Post-Submission Screen
  if (submittedRef) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto bg-card rounded-3xl border border-border p-6 sm:p-10 shadow-xl text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2">
            Investment Subscription Submitted!
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Your investment application has been logged and is pending payment verification.
          </p>

          {/* Reference Card */}
          <div className="bg-muted/50 rounded-2xl p-5 border border-border/80 mb-6 text-left">
            <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1">
              Investment Reference Code
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-mono font-extrabold text-primary">{submittedRef}</span>
              <button
                onClick={() => copyRef(submittedRef)}
                className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied!' : 'Copy Reference'}
              </button>
            </div>
          </div>

          {/* Transfer Instructions Box */}
          {paymentMethod === 'bank_transfer' && (
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 text-left text-xs mb-6 space-y-2">
              <h4 className="font-bold text-blue-900 flex items-center gap-1.5">
                <Building className="w-4 h-4" />
                Payment Transfer Details
              </h4>
              <p className="text-blue-900/90 leading-relaxed">
                Please transfer <strong>{formatNaira(amount)}</strong> to the designated CLIMPS Cooperative capital account:
              </p>
              <div className="bg-white rounded-xl p-3.5 border border-blue-200/80 font-mono space-y-1 text-blue-950">
                <div><strong>Bank Name:</strong> Zenith Bank PLC</div>
                <div><strong>Account Name:</strong> Changing Lives Multipurpose Ventures</div>
                <div><strong>Account Number:</strong> 1014882991</div>
                <div className="text-amber-700 font-bold pt-1">
                  <strong>Narration / Remarks:</strong> {submittedRef}
                </div>
              </div>
              <p className="text-[11px] text-blue-800">
                ⚠️ It is mandatory to include your reference <strong>{submittedRef}</strong> in the transfer remarks so the system can match your payment automatically.
              </p>
            </div>
          )}

          {/* Next Steps Stepper */}
          <div className="text-left bg-card rounded-2xl border border-border p-5 mb-8">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Activation Lifecycle
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[11px] shrink-0">1</div>
                <div>
                  <strong className="block text-foreground">Submitted</strong>
                  <span className="text-muted-foreground text-[11px]">Application logged</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[11px] shrink-0">2</div>
                <div>
                  <strong className="block text-foreground">Payment Verification</strong>
                  <span className="text-muted-foreground text-[11px]">Desk matches transfer</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px] shrink-0">3</div>
                <div>
                  <strong className="block text-foreground">Investment Activated</strong>
                  <span className="text-muted-foreground text-[11px]">Certificate generated</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/invest/portfolio" className="btn-primary py-3 px-6 text-sm font-semibold">
              Go to Investment Portfolio
            </Link>
            <Link href="/member-dashboard" className="btn-outline py-3 px-6 text-sm font-semibold">
              Return to Member Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Multi-step Checkout View
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2">
            <span className="font-extrabold text-lg text-primary tracking-tight">CLIMPS</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Logged in as:</span>
            <strong className="text-foreground">{userProfile?.full_name || 'Member'}</strong>
          </div>
        </div>
      </header>

      {/* Main Flow Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 lg:py-12">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-2">
            <span>Step {step} of 3</span>
            <span className="text-primary font-bold">
              {step === 1 ? 'Product & Amount' : step === 2 ? 'Terms & Disclosures' : 'Payment Method'}
            </span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Product & Amount */}
        {step === 1 && (
          <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-foreground mb-1">
                Select Investment & Amount
              </h1>
              <p className="text-xs text-muted-foreground">
                Choose an opportunity and specify how much you want to commit.
              </p>
            </div>

            {/* Product Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Investment Product
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
              >
                {INVESTMENT_PRODUCTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.projectedReturnLabel} ({p.durationLabel})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Investment Amount (₦)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₦</span>
                <input
                  type="number"
                  min={selectedProduct.minimumInvestment}
                  value={amount || ''}
                  onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-xl border border-input bg-card pl-9 pr-4 py-3 text-xl font-extrabold font-tabular text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Minimum: <strong>{formatNaira(selectedProduct.minimumInvestment)}</strong></span>
                {selectedProduct.maximumInvestment && (
                  <span>Maximum: <strong>{formatNaira(selectedProduct.maximumInvestment)}</strong></span>
                )}
              </div>
            </div>

            {/* Real-time Returns Preview Card */}
            <div className="bg-muted/40 rounded-2xl p-4 border border-border/80 space-y-2">
              <div className="text-xs font-bold text-foreground">Projected Returns Preview</div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block">Rate:</span>
                  <span className="font-bold text-emerald-600 font-tabular">{selectedProduct.projectedReturnLabel}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Duration:</span>
                  <span className="font-bold">{selectedProduct.durationMonths} Months</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Est. Return:</span>
                  <span className="font-bold text-emerald-600 font-tabular">+{formatNaira(returnEstimate.projectedReturn)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Maturity Value:</span>
                  <span className="font-bold text-foreground font-tabular">{formatNaira(returnEstimate.maturityValue)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={amount < selectedProduct.minimumInvestment}
              className="w-full btn-primary py-3 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Terms & Disclosures
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Terms & Risk Disclosures */}
        {step === 2 && (
          <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-foreground mb-1">
                Review Terms & Disclosures
              </h1>
              <p className="text-xs text-muted-foreground">
                Please acknowledge the investment disclosures and cooperative bye-laws before proceeding.
              </p>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 text-amber-900 text-xs space-y-3">
              <div className="font-bold flex items-center gap-1.5 text-amber-950">
                <AlertCircle className="w-4 h-4" />
                Statutory Notice on Projected Returns
              </div>
              <p className="leading-relaxed">
                Returns on this product are designated as <strong>Projected Return</strong> and reflect historical surplus averages and business estimates. 
                Unless specified as contractual fixed income, yields are not guaranteed. CLIMPS maintains rigorous fiduciary standards and risk management protocols.
              </p>
            </div>

            {/* Checkboxes */}
            <div className="space-y-4 pt-2">
              <label className="flex items-start gap-3 text-xs sm:text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={riskAcknowledged}
                  onChange={(e) => setRiskAcknowledged(e.target.checked)}
                  className="mt-1 w-4 h-4 text-primary rounded border-input focus:ring-primary"
                />
                <span>
                  I acknowledge that the return of <strong>{selectedProduct.projectedReturnLabel}</strong> is projected based on commercial performance and is not a guaranteed fixed deposit (unless explicitly specified in the term sheet).
                </span>
              </label>

              <label className="flex items-start gap-3 text-xs sm:text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 text-primary rounded border-input focus:ring-primary"
                />
                <span>
                  I have read, understood, and agreed to the CLIMPS Cooperative Investment Terms, tenure lock-in of <strong>{selectedProduct.durationMonths} months</strong>, and relevant statutory bye-laws.
                </span>
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-outline py-3 px-6 text-sm font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!termsAgreed || !riskAcknowledged}
                className="btn-primary flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Payment Method
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Payment Method & Submit */}
        {step === 3 && (
          <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-foreground mb-1">
                Select Payment Method
              </h1>
              <p className="text-xs text-muted-foreground">
                Total to subscribe: <strong className="text-primary">{formatNaira(amount)}</strong>
              </p>
            </div>

            {/* Payment Method Radio Cards */}
            <div className="space-y-3">
              {[
                {
                  id: 'bank_transfer',
                  name: 'Cooperative Direct Bank Transfer',
                  desc: 'Transfer directly to CLIMPS designated Zenith Bank account with generated narration.',
                  icon: Building,
                },
                {
                  id: 'savings_wallet',
                  name: 'Deduct from Cooperative Savings Wallet',
                  desc: 'Instant debit from your active CLIMPS regular savings account balance.',
                  icon: Wallet,
                },
                {
                  id: 'card',
                  name: 'Debit Card / Paystack',
                  desc: 'Pay instantly online with your Mastercard, Visa, or Verve card.',
                  icon: CreditCard,
                },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === opt.id
                      ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary'
                      : 'border-border bg-card hover:bg-muted/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="pay_method"
                    checked={paymentMethod === opt.id}
                    onChange={() => setPaymentMethod(opt.id as any)}
                    className="mt-1 w-4 h-4 text-primary"
                  />
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <opt.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-foreground block">{opt.name}</span>
                      <span className="text-xs text-muted-foreground leading-relaxed">{opt.desc}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* Summary Box */}
            <div className="bg-muted/40 rounded-2xl p-4 border border-border/80 text-xs space-y-1.5 font-tabular">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product:</span>
                <span className="font-bold text-foreground">{selectedProduct.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Commitment:</span>
                <span className="font-bold text-foreground">{formatNaira(amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Projected Return:</span>
                <span className="font-bold text-emerald-600">+{formatNaira(returnEstimate.projectedReturn)}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-outline py-3 px-6 text-sm font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Generating Reference…
                  </>
                ) : (
                  'Submit Investment Application'
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function InvestNowPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <InvestNowInner />
    </Suspense>
  );
}
