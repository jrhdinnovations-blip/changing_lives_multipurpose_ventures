'use client';
import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  INVESTMENT_PRODUCTS,
  calculateInvestmentReturn,
  formatNaira,
  formatNairaCompact,
} from '@/lib/investmentsData';
import {
  Calculator,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Sparkles,
  PieChart,
  Banknote,
  ArrowLeft,
} from 'lucide-react';

function InvestmentCalculatorInner() {
  const searchParams = useSearchParams();
  const initialProductId = searchParams.get('product') || INVESTMENT_PRODUCTS[0].id;
  const initialAmountParam = Number(searchParams.get('amount')) || 100000;

  const [selectedProductId, setSelectedProductId] = useState(initialProductId);
  const selectedProduct = useMemo(
    () => INVESTMENT_PRODUCTS.find((p) => p.id === selectedProductId) || INVESTMENT_PRODUCTS[0],
    [selectedProductId]
  );

  const [amount, setAmount] = useState<number>(() => {
    return Math.max(initialAmountParam, selectedProduct.minimumInvestment);
  });

  const [durationMonths, setDurationMonths] = useState<number>(selectedProduct.durationMonths);
  const [customRate, setCustomRate] = useState<number>(selectedProduct.projectedReturnRate);
  const [calcMethod, setCalcMethod] = useState<'simple' | 'compound'>('simple');

  // When product changes, synchronize duration and rate
  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    const prod = INVESTMENT_PRODUCTS.find((p) => p.id === productId);
    if (prod) {
      setDurationMonths(prod.durationMonths);
      setCustomRate(prod.projectedReturnRate);
      if (amount < prod.minimumInvestment) {
        setAmount(prod.minimumInvestment);
      }
    }
  };

  const results = useMemo(() => {
    return calculateInvestmentReturn(amount, customRate, durationMonths, calcMethod);
  }, [amount, customRate, durationMonths, calcMethod]);

  const QUICK_AMOUNTS = [50000, 100000, 250000, 500000, 1000000, 5000000];

  const principalPct = Math.round((results.principal / results.maturityValue) * 100);
  const returnPct = 100 - principalPct;

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/landing" className="flex items-center gap-2.5">
              <Image
                src="/assets/images/WhatsApp_Image_2026-09-19_at_12.24.54-1789999920386.jpeg"
                alt="CLIMPS Cooperative Logo"
                width={32}
                height={32}
                className="rounded-lg object-cover"
              />
              <span className="font-bold text-base text-primary tracking-tight">CLIMPS</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/investment-products"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                View Investment Products
              </Link>
              <Link href="/login" className="text-xs font-semibold text-muted-foreground hover:text-foreground">
                Sign In
              </Link>
              <Link href="/register" className="btn-accent text-xs px-3.5 py-1.5">
                Join Cooperative
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="gradient-primary py-10 lg:py-14 text-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3.5 py-1 mb-4 text-xs font-semibold uppercase tracking-wider text-white">
            <Calculator className="w-3.5 h-3.5 text-accent" />
            Financial Projection Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
            Investment Return Calculator
          </h1>
          <p className="text-white/80 text-sm sm:text-base max-w-xl">
            Simulate potential earnings, compound growth, and maturity dates across CLIMPS cooperative investment vehicles.
          </p>
        </div>
      </div>

      {/* Calculator Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Input Controls (7 cols) */}
          <div className="lg:col-span-7 bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">
                1. Select Investment Vehicle
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
              >
                {INVESTMENT_PRODUCTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.projectedReturnLabel} · {p.durationMonths} Mo)
                  </option>
                ))}
              </select>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Min: <strong>{formatNaira(selectedProduct.minimumInvestment)}</strong></span>
                <span>Type: <strong className="text-emerald-600">{selectedProduct.category}</strong></span>
              </div>
            </div>

            {/* Principal Amount */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-foreground">
                  2. Investment Principal Amount (₦)
                </label>
                <span className="text-xs font-bold text-primary font-tabular">
                  {formatNaira(amount)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₦</span>
                <input
                  type="number"
                  min={selectedProduct.minimumInvestment}
                  step={5000}
                  value={amount || ''}
                  onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-xl border border-input bg-card pl-9 pr-4 py-3 text-lg font-bold font-tabular text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                />
              </div>

              {/* Quick Amount Chips */}
              <div className="flex flex-wrap gap-2 mt-3">
                {QUICK_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      amount === amt
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-muted/60 text-muted-foreground border-border hover:border-primary/40'
                    }`}
                  >
                    {formatNairaCompact(amt)}
                  </button>
                ))}
              </div>

              {amount < selectedProduct.minimumInvestment && (
                <p className="text-xs text-amber-600 font-semibold mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  Amount is below the product minimum of {formatNaira(selectedProduct.minimumInvestment)}.
                </p>
              )}
            </div>

            {/* Duration Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-foreground">
                  3. Investment Duration
                </label>
                <span className="text-xs font-bold text-primary font-tabular">
                  {durationMonths} Months ({Math.round((durationMonths / 12) * 10) / 10} Yrs)
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={36}
                step={3}
                value={durationMonths}
                onChange={(e) => setDurationMonths(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1 font-tabular">
                <span>3 Months</span>
                <span>12 Months</span>
                <span>24 Months</span>
                <span>36 Months</span>
              </div>
            </div>

            {/* Projected Rate Adjustment */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-foreground">
                  4. Projected Rate (% per annum)
                </label>
                <span className="text-xs font-bold text-emerald-600 font-tabular">
                  {customRate}% p.a.
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                step={0.5}
                value={customRate}
                onChange={(e) => setCustomRate(Number(e.target.value))}
                className="w-full accent-emerald-600 h-2 bg-muted rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1 font-tabular">
                <span>5%</span>
                <span>15%</span>
                <span>20%</span>
                <span>30%</span>
              </div>
            </div>

            {/* Method Toggle */}
            <div className="pt-2 border-t border-border">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                Interest Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCalcMethod('simple')}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                    calcMethod === 'simple'
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted'
                  }`}
                >
                  Simple Annual Return
                </button>
                <button
                  type="button"
                  onClick={() => setCalcMethod('compound')}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                    calcMethod === 'compound'
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted'
                  }`}
                >
                  Compound Growth (Rollover)
                </button>
              </div>
            </div>
          </div>

          {/* Output Results Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-bold uppercase tracking-widest text-white/70">
                  Estimated Summary
                </span>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {selectedProduct.isGuaranteed ? 'Guaranteed Rate' : 'Projected Rate'}
                </span>
              </div>

              {/* Total Maturity Value */}
              <div className="mb-6">
                <span className="text-xs text-white/70 block mb-1">Estimated Maturity Value</span>
                <div className="text-3xl sm:text-4xl font-extrabold text-accent font-tabular tracking-tight">
                  {formatNaira(results.maturityValue)}
                </div>
                <div className="text-xs text-white/60 mt-1">
                  Includes principal + projected returns
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="space-y-3 py-4 border-y border-white/10 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-white/70">Investment Principal:</span>
                  <span className="font-bold text-white font-tabular">{formatNaira(results.principal)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-white/70">Estimated Total Return:</span>
                  <span className="font-bold text-emerald-400 font-tabular">+{formatNaira(results.projectedReturn)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-white/70">Estimated Monthly Average:</span>
                  <span className="font-bold text-white font-tabular">+{formatNaira(results.monthlyReturn)}/mo</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-white/70">Projected Maturity Date:</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    {results.maturityDate}
                  </span>
                </div>
              </div>

              {/* Visual Breakdown Bar */}
              <div className="mt-5 mb-6">
                <div className="flex justify-between text-[11px] text-white/80 mb-1.5 font-tabular">
                  <span>Principal: {principalPct}%</span>
                  <span>Gain: {returnPct}%</span>
                </div>
                <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden flex">
                  <div className="bg-white h-full" style={{ width: `${principalPct}%` }} />
                  <div className="bg-emerald-400 h-full" style={{ width: `${returnPct}%` }} />
                </div>
              </div>

              {/* Action CTA */}
              <Link
                href={`/invest/now?product=${selectedProduct.id}&amount=${amount}`}
                className="w-full btn-accent text-center py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-lg"
              >
                Proceed to Invest with this Plan
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mandatory Disclaimer */}
            <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-5 text-amber-950">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900 mb-1">
                    Calculation Estimate Disclaimer
                  </h4>
                  <p className="text-[11px] leading-relaxed text-amber-900/90">
                    This calculation is an estimate based on configured product parameters and target historical yields. 
                    Unless explicitly provided under a contractual fixed income instrument, 
                    <strong> projected returns are not guaranteed</strong>. Actual payout amounts may vary depending on business cycle performance and agricultural or trading surplus.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function InvestmentCalculatorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <InvestmentCalculatorInner />
    </Suspense>
  );
}
