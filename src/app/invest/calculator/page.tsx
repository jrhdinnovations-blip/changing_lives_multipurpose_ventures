'use client';
import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import LandingNav from '@/app/landing/components/LandingNav';
import LandingFooter from '@/app/landing/components/LandingFooter';
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
  AlertCircle,
  Calendar,
  Sparkles,
  LogIn,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

function InvestmentCalculatorInner() {
  const { user } = useAuth();
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
    <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col">
      <LandingNav />

      {/* Hero */}
      <div className="relative py-12 lg:py-16 overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1e] via-[#0d1e38] to-[#08213b] pointer-events-none" />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3.5 py-1 mb-4 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            <Calculator className="w-3.5 h-3.5 text-emerald-400" />
            Financial Projection Engine
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
            Investment Return Calculator
          </h1>
          <p className="text-white/70 text-base max-w-xl">
            Simulate potential earnings, agreed returns (3.5% monthly on Wealth Circle), and maturity dates across CLIMPS vehicles.
          </p>
        </div>
      </div>

      {/* Calculator Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Input Controls (7 cols) */}
          <div className="lg:col-span-7 bg-[#0d1527] rounded-3xl border border-white/10 p-6 sm:p-8 shadow-xl space-y-6">
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                1. Select Investment Vehicle
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-emerald-500 shadow-sm"
              >
                {INVESTMENT_PRODUCTS.map((p) => {
                  const isComingSoon = p.comingSoon || p.productStatus === 'coming_soon';
                  return (
                    <option key={p.id} value={p.id} className="bg-[#0d1527] text-white">
                      {p.name} {isComingSoon ? '⏳ [Coming Soon]' : ''} ({p.projectedReturnLabel} · {p.durationMonths} Mo)
                    </option>
                  );
                })}
              </select>
              <div className="mt-2.5 flex items-center justify-between text-xs text-white/50">
                <span>Min: <strong className="text-white">{formatNaira(selectedProduct.minimumInvestment)}</strong></span>
                <span>Category: <strong className="text-emerald-400">{selectedProduct.category}</strong></span>
              </div>
            </div>

            {/* Principal Amount */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-white">
                  2. Investment Principal Amount (₦)
                </label>
                <span className="text-xs font-bold text-emerald-400 font-tabular">
                  {formatNaira(amount)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-bold">₦</span>
                <input
                  type="number"
                  min={selectedProduct.minimumInvestment}
                  step={5000}
                  value={amount || ''}
                  onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-xl border border-white/15 bg-white/[0.04] pl-9 pr-4 py-3 text-lg font-bold font-tabular text-white focus:outline-none focus:border-emerald-500 shadow-sm"
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
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs'
                        : 'bg-white/[0.03] text-white/60 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {formatNairaCompact(amt)}
                  </button>
                ))}
              </div>

              {amount < selectedProduct.minimumInvestment && (
                <p className="text-xs text-amber-400 font-semibold mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  Amount is below the product minimum of {formatNaira(selectedProduct.minimumInvestment)}.
                </p>
              )}
            </div>

            {/* Duration Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-white">
                  3. Investment Duration
                </label>
                <span className="text-xs font-bold text-emerald-400 font-tabular">
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
                className="w-full accent-emerald-500 h-2 bg-white/10 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-white/40 mt-1 font-tabular">
                <span>3 Months</span>
                <span>12 Months</span>
                <span>24 Months</span>
                <span>36 Months</span>
              </div>
            </div>

            {/* Projected Rate Adjustment */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-white">
                  4. Projected Rate (% per annum)
                </label>
                <span className="text-xs font-bold text-emerald-400 font-tabular">
                  {customRate}% p.a.
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={50}
                step={0.5}
                value={customRate}
                onChange={(e) => setCustomRate(Number(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-white/10 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-white/40 mt-1 font-tabular">
                <span>5%</span>
                <span>20%</span>
                <span>35%</span>
                <span>50%</span>
              </div>
            </div>

            {/* Calculation Method Toggle */}
            <div className="pt-2 border-t border-white/10">
              <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">
                Yield Accrual Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCalcMethod('simple')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    calcMethod === 'simple'
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 font-bold shadow-sm'
                      : 'border-white/10 bg-white/[0.02] text-white/60 hover:text-white'
                  }`}
                >
                  <span className="font-bold text-white block">Simple Periodic Return</span>
                  <span className="text-[10px] text-white/50">Return paid out at maturity</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCalcMethod('compound')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    calcMethod === 'compound'
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 font-bold shadow-sm'
                      : 'border-white/10 bg-white/[0.02] text-white/60 hover:text-white'
                  }`}
                >
                  <span className="font-bold text-white block">Compounding Growth</span>
                  <span className="text-[10px] text-white/50">Returns reinvested annually</span>
                </button>
              </div>
            </div>
          </div>

          {/* Results Summary & Breakdown (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0d1527] rounded-3xl border border-white/10 p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                  Projection Breakdown
                </span>
                <span className="inline-flex items-center gap-1 text-2xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="w-3 h-3" />
                  Estimated Yield
                </span>
              </div>

              {/* Total Maturity Value */}
              <div>
                <p className="text-xs font-semibold text-white/50 mb-1">
                  Estimated Total Maturity Value
                </p>
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-tabular tracking-tight">
                  {formatNaira(results.maturityValue)}
                </div>
              </div>

              {/* Split Breakdown */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5 font-tabular">
                <div>
                  <span className="text-2xs uppercase font-semibold text-white/50 block">Initial Principal</span>
                  <span className="text-sm sm:text-base font-bold text-white">{formatNaira(results.principal)}</span>
                </div>
                <div>
                  <span className="text-2xs uppercase font-semibold text-white/50 block">Estimated Profit</span>
                  <span className="text-sm sm:text-base font-bold text-amber-400">+{formatNaira(results.projectedReturn)}</span>
                </div>
              </div>

              {/* Progress Visualizer */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-2xs font-bold text-white/60">
                  <span>Principal: {principalPct}%</span>
                  <span className="text-emerald-400">Profit: {returnPct}%</span>
                </div>
                <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden flex">
                  <div className="bg-white/40 h-full" style={{ width: `${principalPct}%` }} />
                  <div className="bg-emerald-400 h-full" style={{ width: `${returnPct}%` }} />
                </div>
              </div>

              {/* Action CTA */}
              {user ? (
                <Link
                  href={`/invest/now?product=${selectedProduct.id}&amount=${amount}`}
                  className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <span>Proceed to Invest with this Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href={`/login?redirect=${encodeURIComponent(`/invest/now?product=${selectedProduct.id}&amount=${amount}`)}`}
                  className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500/80 to-teal-600/80 text-white font-bold text-sm flex items-center justify-center gap-2 hover:from-emerald-500 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Invest with this Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            {/* Mandatory Disclaimer */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-white/70">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white mb-1">
                    Calculation Estimate Disclaimer
                  </h4>
                  <p className="text-[11px] leading-relaxed text-white/60">
                    This calculation is an estimate based on configured product parameters. For the CLIMPS Wealth Circle, the agreed return is 3.5% monthly with early liquidation subject to notice periods and administrative terms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

export default function InvestmentCalculatorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
          <div className="w-8 h-8 rounded-full border-3 border-emerald-400 border-t-transparent animate-spin" />
        </div>
      }
    >
      <InvestmentCalculatorInner />
    </Suspense>
  );
}
