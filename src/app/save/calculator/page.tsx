'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LandingNav from '@/app/landing/components/LandingNav';
import LandingFooter from '@/app/landing/components/LandingFooter';

type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

const FREQ_LABELS: Record<Frequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

const FREQ_PER_YEAR: Record<Frequency, number> = {
  daily: 365,
  weekly: 52,
  monthly: 12,
  yearly: 1,
};

interface YearRow {
  year: number;
  openingBalance: number;
  contributions: number;
  interest: number;
  closingBalance: number;
}

function fmt(n: number) {
  return '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calcProjection(
  initialDeposit: number,
  regularContrib: number,
  frequency: Frequency,
  periodMonths: number,
  ratePercent: number,
  requireOneYear: boolean = false
): { rows: YearRow[]; totalContributions: number; totalInterest: number; finalBalance: number; interestForfeited: boolean } {
  const annualRate = ratePercent / 100;
  const monthlyRate = annualRate / 12;
  const contribsPerYear = FREQ_PER_YEAR[frequency];
  const contribPerMonth = (regularContrib * contribsPerYear) / 12;
  const interestForfeited = requireOneYear && periodMonths < 12;

  let balance = initialDeposit;
  let totalContributions = initialDeposit;
  let totalInterest = 0;
  const rows: YearRow[] = [];

  const years = Math.ceil(periodMonths / 12);
  for (let yr = 1; yr <= years; yr++) {
    const opening = balance;
    const monthsThisYear = Math.min(12, periodMonths - (yr - 1) * 12);
    let yearContrib = 0;
    let yearInterest = 0;

    for (let m = 0; m < monthsThisYear; m++) {
      const monthContrib = contribPerMonth;
      const interest = interestForfeited ? 0 : (balance + monthContrib / 2) * monthlyRate;
      balance += monthContrib + interest;
      yearContrib += monthContrib;
      yearInterest += interest;
    }

    totalContributions += yearContrib;
    totalInterest += yearInterest;

    rows.push({
      year: yr,
      openingBalance: opening,
      contributions: yearContrib,
      interest: yearInterest,
      closingBalance: balance,
    });
  }

  return { rows, totalContributions, totalInterest, finalBalance: balance, interestForfeited };
}

export default function SavingsCalculatorPage() {
  const { user } = useAuth();
  const [selectedPreset, setSelectedPreset] = useState<'monthly' | 'regular'>('monthly');
  const [initialDeposit, setInitialDeposit] = useState(0);
  const [regularContrib, setRegularContrib] = useState(20000);
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [periodMonths, setPeriodMonths] = useState(24);
  const [ratePercent, setRatePercent] = useState(48.0); // 4% monthly = 48% p.a.

  const isMonthly = selectedPreset === 'monthly';

  const selectPreset = (type: 'monthly' | 'regular') => {
    setSelectedPreset(type);
    if (type === 'monthly') {
      setInitialDeposit(0);
      setRegularContrib(20000);
      setFrequency('monthly');
      setRatePercent(48.0); // 4% monthly
    } else {
      setInitialDeposit(25000);
      setRegularContrib(15000);
      setFrequency('monthly');
      setRatePercent(7.0);
    }
  };

  const result = useMemo(
    () => calcProjection(initialDeposit, regularContrib, frequency, periodMonths, ratePercent, isMonthly),
    [initialDeposit, regularContrib, frequency, periodMonths, ratePercent, isMonthly]
  );

  const maxBalance = Math.max(...result.rows.map((r) => r.closingBalance), 1);

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
            <span className="text-emerald-400 text-sm font-semibold">Calculator</span>
          </div>
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3.5 py-1 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 text-xs font-semibold uppercase tracking-wider">Growth Estimator</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
              Savings Growth Calculator
            </h1>
            <p className="text-white/70 text-base leading-relaxed">
              Calculate projected returns for Regular Savings (4% monthly contribution) and Lock Your Funds (7.0% p.a. fixed-term, credited at maturity).
            </p>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">

          {/* — Inputs panel */}
          <aside className="lg:col-span-2">
            <div className="bg-[#0d1527] rounded-2xl border border-white/10 p-6 shadow-xl sticky top-24">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 4a2 2 0 100 4m0-4a2 2 0 110 4m6-4a2 2 0 100 4m0-4a2 2 0 110 4" />
                </svg>
                Select Product Preset
              </h2>

              {/* Product Presets */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => selectPreset('monthly')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    selectedPreset === 'monthly'
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 font-bold shadow-sm'
                      : 'border-white/10 bg-white/[0.02] text-white/60 hover:text-white hover:border-white/20'
                  }`}
                >
                  <span className="block text-[11px] font-semibold text-emerald-400 uppercase">Regular Savings</span>
                  <span className="font-bold text-xs block mt-0.5 text-white">Monthly Contribution</span>
                  <span className="text-[10px] text-white/50">4% monthly · min 1 yr</span>
                </button>

                <button
                  type="button"
                  onClick={() => selectPreset('regular')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    selectedPreset === 'regular'
                      ? 'border-teal-500 bg-teal-500/15 text-teal-300 font-bold shadow-sm'
                      : 'border-white/10 bg-white/[0.02] text-white/60 hover:text-white hover:border-white/20'
                  }`}
                >
                  <span className="block text-[11px] font-semibold text-amber-400 uppercase">Lock Your Funds</span>
                  <span className="font-bold text-xs block mt-0.5 text-white">Lock Your Funds</span>
                  <span className="text-[10px] text-white/50">7.0% p.a. at Maturity</span>
                </button>
              </div>

              <div className="space-y-5">
                {/* Initial deposit */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-sm font-semibold text-white">Initial Deposit</label>
                    <span className="text-sm font-bold text-emerald-400 font-tabular">{fmt(initialDeposit)}</span>
                  </div>
                  <input
                    type="range" min={0} max={5000000} step={5000}
                    value={initialDeposit}
                    onChange={(e) => setInitialDeposit(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-white/40 mt-1">
                    <span>₦0</span><span>₦5,000,000</span>
                  </div>
                </div>

                {/* Regular contribution */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-sm font-semibold text-white">Regular Contribution</label>
                    <span className="text-sm font-bold text-emerald-400 font-tabular">{fmt(regularContrib)}</span>
                  </div>
                  <input
                    type="range"
                    min={isMonthly ? 5000 : 500}
                    max={isMonthly ? 200000 : 500000}
                    step={isMonthly ? 5000 : 500}
                    value={regularContrib}
                    onChange={(e) => setRegularContrib(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-white/40 mt-1">
                    <span>{isMonthly ? 'Min ₦5,000' : '₦500'}</span>
                    <span>{isMonthly ? 'Max ₦200,000' : '₦500,000'}</span>
                  </div>
                </div>

                {/* Frequency */}
                <div>
                  <label className="text-sm font-semibold text-white block mb-2">Contribution Frequency</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['daily','weekly','monthly','yearly'] as Frequency[]).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFrequency(f)}
                        className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                          frequency === f
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                            : 'bg-white/[0.03] text-white/60 border-white/10 hover:border-white/20'
                        }`}
                      >
                        {FREQ_LABELS[f]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Period */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-sm font-semibold text-white">Savings Period</label>
                    <span className="text-sm font-bold text-emerald-400 font-tabular">
                      {periodMonths >= 12
                        ? `${Math.floor(periodMonths / 12)}yr ${periodMonths % 12 > 0 ? `${periodMonths % 12}mo` : ''}`
                        : `${periodMonths} months`}
                    </span>
                  </div>
                  <input
                    type="range" min={3} max={120} step={1}
                    value={periodMonths}
                    onChange={(e) => setPeriodMonths(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-white/40 mt-1">
                    <span>3 months</span><span>10 years</span>
                  </div>
                </div>

                {/* Interest rate */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-sm font-semibold text-white">Interest Rate (p.a.)</label>
                    <span className="text-sm font-bold text-emerald-400 font-tabular">{ratePercent}%</span>
                  </div>
                  <input
                    type="range" min={0} max={60} step={0.5}
                    value={ratePercent}
                    onChange={(e) => setRatePercent(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-white/40 mt-1">
                    <span>0%</span><span>60%</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-white/10">
                <Link
                  href="/save/start"
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl px-5 py-3 text-sm hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  Ready to Start Saving?
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </aside>

          {/* — Results panel */}
          <div className="lg:col-span-3 space-y-6">

            {/* Cooperative Policy Banner */}
            {isMonthly && (
              <div className={`rounded-2xl border p-4 text-xs leading-relaxed ${
                result.interestForfeited
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              }`}>
                <div className="flex items-center gap-2 font-bold mb-1">
                  <span>{result.interestForfeited ? '⚠️ 1-Year Tenure Rule Warning' : 'ℹ️ Savings Policy'}</span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-extrabold border border-emerald-500/30">4% Monthly</span>
                </div>
                <p className="text-white/80">
                  Monthly contributions earn <strong>4% monthly interest (48% p.a.)</strong> but must be maintained for <strong>at least 1 year (12 months)</strong>, otherwise accrued interest is forfeited. Minimum contribution: ₦5,000/mo, Maximum: ₦200,000/mo.
                </p>
                {result.interestForfeited && (
                  <p className="mt-2 text-amber-300 font-semibold">
                    Current selected duration is {periodMonths} month{periodMonths > 1 ? 's' : ''} (less than 1 year). In accordance with policy, early liquidation forfeits interest.
                  </p>
                )}
              </div>
            )}

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Contributions', value: fmt(result.totalContributions), color: 'text-white', bg: 'bg-[#0d1527] border-white/10' },
                { label: 'Estimated Interest', value: fmt(result.totalInterest), color: 'text-amber-400', bg: 'bg-[#0d1527] border-white/10' },
                { label: 'Estimated Balance', value: fmt(result.finalBalance), color: 'text-emerald-400', bg: 'bg-[#0d1527] border-emerald-500/30 shadow-lg shadow-emerald-500/5' },
              ].map((card) => (
                <div key={card.label} className={`rounded-2xl border p-5 ${card.bg}`}>
                  <p className="text-xs font-semibold text-white/50 mb-1">{card.label}</p>
                  <p className={`text-xl font-extrabold font-tabular ${card.color} leading-tight`}>{card.value}</p>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            <div className="bg-[#0d1527] rounded-2xl border border-white/10 p-6 shadow-xl">
              <h3 className="text-base font-bold text-white mb-4">Balance Growth by Year</h3>
              <div className="flex items-end gap-2 h-44 pt-4">
                {result.rows.map((row) => {
                  const contribH = Math.round((row.contributions / row.closingBalance) * 100 * (row.closingBalance / maxBalance));
                  const intH = Math.round((row.interest / row.closingBalance) * 100 * (row.closingBalance / maxBalance));
                  const totalH = Math.round((row.closingBalance / maxBalance) * 100);
                  const openH = totalH - contribH - intH;
                  return (
                    <div key={row.year} className="flex-1 flex flex-col items-center group">
                      <div className="w-full flex flex-col justify-end h-36 gap-0">
                        <div style={{ height: `${Math.max(openH, 0)}%` }} className="w-full bg-emerald-500/20 rounded-t-sm" title={`Opening: ${fmt(row.openingBalance)}`} />
                        <div style={{ height: `${Math.max(contribH, 2)}%` }} className="w-full bg-emerald-500/60" title={`Contributions: ${fmt(row.contributions)}`} />
                        <div style={{ height: `${Math.max(intH, 2)}%` }} className="w-full bg-teal-400 rounded-b-sm" title={`Interest: ${fmt(row.interest)}`} />
                      </div>
                      <p className="text-[10px] text-white/50 mt-2">Yr {row.year}</p>
                    </div>
                  );
                })}
              </div>
              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/10">
                {[
                  { color: 'bg-emerald-500/20', label: 'Opening' },
                  { color: 'bg-emerald-500/60', label: 'Contributions' },
                  { color: 'bg-teal-400', label: 'Interest Earned' },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
                    <span className="text-[11px] text-white/60">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Year-by-year table */}
            <div className="bg-[#0d1527] rounded-2xl border border-white/10 shadow-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Year-by-Year Projection</h3>
                <span className="text-xs text-white/60 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/5">{result.rows.length} year{result.rows.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/10">
                      {['Year', 'Opening Balance', 'Contributions', 'Interest', 'Closing Balance'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/50">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {result.rows.map((row, i) => (
                      <tr key={row.year} className={`${i % 2 === 0 ? '' : 'bg-white/[0.01]'} hover:bg-white/[0.03] transition-colors`}>
                        <td className="px-4 py-3 font-semibold text-white">Year {row.year}</td>
                        <td className="px-4 py-3 text-white/60 font-tabular">{fmt(row.openingBalance)}</td>
                        <td className="px-4 py-3 text-white font-tabular">{fmt(row.contributions)}</td>
                        <td className="px-4 py-3 text-amber-400 font-tabular font-medium">+{fmt(row.interest)}</td>
                        <td className="px-4 py-3 font-extrabold text-emerald-400 font-tabular">{fmt(row.closingBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-white/[0.03] border-t-2 border-emerald-500/20">
                      <td className="px-4 py-3 font-bold text-white" colSpan={2}>Totals</td>
                      <td className="px-4 py-3 font-bold text-white font-tabular">{fmt(result.totalContributions)}</td>
                      <td className="px-4 py-3 font-bold text-amber-400 font-tabular">+{fmt(result.totalInterest)}</td>
                      <td className="px-4 py-3 font-extrabold text-emerald-400 font-tabular">{fmt(result.finalBalance)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* CTA to Open Plan */}
            <div className="bg-[#0d1527] rounded-2xl border border-white/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div>
                <h4 className="text-base font-bold text-white">Ready to activate this savings plan?</h4>
                <p className="text-xs text-white/60 mt-0.5">
                  Sign in to your member account to open your {isMonthly ? 'Monthly Contribution' : 'Regular Savings'} savings account.
                </p>
              </div>
              <div className="shrink-0 w-full sm:w-auto">
                {user ? (
                  <Link
                    href={`/save/start?product=${isMonthly ? 'monthly-contribution' : 'regular-savings'}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                  >
                    <span>Open Account Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    href={`/login?redirect=${encodeURIComponent(`/save/start?product=${isMonthly ? 'monthly-contribution' : 'regular-savings'}`)}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                  >
                    <span>Sign In to Start Saving</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-3 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5">
              <svg className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-white/60 leading-relaxed">
                <strong className="text-white">Disclaimer:</strong> Results shown are <em>projections only</em> based on the inputs provided. Actual returns may vary depending on the savings product selected, market conditions, and applicable terms. This calculator does not create any financial obligation or transaction.
              </p>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
