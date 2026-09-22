'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

const FREQ_LABELS: Record<Frequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

// Contributions per year for each frequency
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
  ratePercent: number
): { rows: YearRow[]; totalContributions: number; totalInterest: number; finalBalance: number } {
  const annualRate = ratePercent / 100;
  const monthlyRate = annualRate / 12;
  const contribsPerYear = FREQ_PER_YEAR[frequency];
  const contribPerMonth = (regularContrib * contribsPerYear) / 12;

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
      const interest = (balance + monthContrib / 2) * monthlyRate;
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

  return { rows, totalContributions, totalInterest, finalBalance: balance };
}

export default function SavingsCalculatorPage() {
  const [initialDeposit, setInitialDeposit] = useState(50000);
  const [regularContrib, setRegularContrib] = useState(10000);
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [periodMonths, setPeriodMonths] = useState(24);
  const [ratePercent, setRatePercent] = useState(9);

  const result = useMemo(
    () => calcProjection(initialDeposit, regularContrib, frequency, periodMonths, ratePercent),
    [initialDeposit, regularContrib, frequency, periodMonths, ratePercent]
  );

  const maxBalance = Math.max(...result.rows.map((r) => r.closingBalance), 1);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/landing" className="flex items-center gap-2.5">
              <Image
                src="/assets/images/WhatsApp_Image_2026-09-19_at_12.24.54-1789999920386.jpeg"
                alt="CLIMPS Logo"
                width={32}
                height={32}
                className="rounded-lg object-cover"
              />
              <span className="font-bold text-base text-primary tracking-tight">CLIMPS</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/savings-products" className="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">Savings Products</Link>
              <Link href="/save/calculator" className="px-4 py-2 rounded-lg text-sm font-semibold text-primary bg-secondary/50 transition-colors">Calculator</Link>
              <Link href="/save/start" className="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">Start Saving</Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
              <Link href="/register" className="btn-accent text-sm px-4 py-2">Become a Member</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="gradient-primary py-12 lg:py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/savings-products" className="text-white/60 text-sm hover:text-white/90 transition-colors">Savings</Link>
            <svg className="w-3.5 h-3.5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-white/90 text-sm font-medium">Calculator</span>
          </div>
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-white/90 text-xs font-semibold uppercase tracking-widest">Free Planning Tool</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
              Savings Calculator
            </h1>
            <p className="text-white/70 text-base leading-relaxed">
              See how your savings grow over time. Adjust your deposit amount, frequency, and rate to plan your financial future.
            </p>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">

          {/* — Inputs panel */}
          <aside className="lg:col-span-2">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm sticky top-24">
              <h2 className="text-base font-bold text-foreground mb-5 flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 4a2 2 0 100 4m0-4a2 2 0 110 4m6-4a2 2 0 100 4m0-4a2 2 0 110 4" />
                </svg>
                Adjust Variables
              </h2>

              <div className="space-y-5">
                {/* Initial deposit */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-sm font-semibold text-foreground">Initial Deposit</label>
                    <span className="text-sm font-bold text-primary font-tabular">{fmt(initialDeposit)}</span>
                  </div>
                  <input
                    type="range" min={0} max={5000000} step={5000}
                    value={initialDeposit}
                    onChange={(e) => setInitialDeposit(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>₦0</span><span>₦5,000,000</span>
                  </div>
                </div>

                {/* Regular contribution */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-sm font-semibold text-foreground">Regular Contribution</label>
                    <span className="text-sm font-bold text-primary font-tabular">{fmt(regularContrib)}</span>
                  </div>
                  <input
                    type="range" min={500} max={500000} step={500}
                    value={regularContrib}
                    onChange={(e) => setRegularContrib(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>₦500</span><span>₦500,000</span>
                  </div>
                </div>

                {/* Frequency */}
                <div>
                  <label className="text-sm font-semibold text-foreground block mb-2">Contribution Frequency</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['daily','weekly','monthly','yearly'] as Frequency[]).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFrequency(f)}
                        className={`py-2 rounded-xl text-sm font-semibold border transition-all ${
                          frequency === f
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-muted text-muted-foreground border-border hover:border-primary/40'
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
                    <label className="text-sm font-semibold text-foreground">Savings Period</label>
                    <span className="text-sm font-bold text-primary font-tabular">
                      {periodMonths >= 12
                        ? `${Math.floor(periodMonths / 12)}yr ${periodMonths % 12 > 0 ? `${periodMonths % 12}mo` : ''}`
                        : `${periodMonths} months`}
                    </span>
                  </div>
                  <input
                    type="range" min={3} max={120} step={1}
                    value={periodMonths}
                    onChange={(e) => setPeriodMonths(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>3 months</span><span>10 years</span>
                  </div>
                </div>

                {/* Interest rate */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-sm font-semibold text-foreground">Interest Rate (p.a.)</label>
                    <span className="text-sm font-bold text-primary font-tabular">{ratePercent}%</span>
                  </div>
                  <input
                    type="range" min={0} max={25} step={0.5}
                    value={ratePercent}
                    onChange={(e) => setRatePercent(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>0%</span><span>25%</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-border">
                <Link
                  href="/save/start"
                  className="w-full inline-flex items-center justify-center gap-2 bg-accent text-white font-semibold rounded-xl px-5 py-2.5 text-sm hover:bg-accent/90 transition-all active:scale-95"
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

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Contributions', value: fmt(result.totalContributions), color: 'text-primary', bg: 'bg-primary/5 border-primary/20' },
                { label: 'Estimated Interest', value: fmt(result.totalInterest), color: 'text-accent', bg: 'bg-accent/5 border-accent/20' },
                { label: 'Estimated Balance', value: fmt(result.finalBalance), color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
              ].map((card) => (
                <div key={card.label} className={`rounded-2xl border p-4 ${card.bg}`}>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">{card.label}</p>
                  <p className={`text-xl font-extrabold font-tabular ${card.color} leading-tight`}>{card.value}</p>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
              <h3 className="text-sm font-bold text-foreground mb-4">Balance Growth by Year</h3>
              <div className="flex items-end gap-2 h-40">
                {result.rows.map((row) => {
                  const contribH = Math.round((row.contributions / row.closingBalance) * 100 * (row.closingBalance / maxBalance));
                  const intH = Math.round((row.interest / row.closingBalance) * 100 * (row.closingBalance / maxBalance));
                  const totalH = Math.round((row.closingBalance / maxBalance) * 100);
                  const openH = totalH - contribH - intH;
                  return (
                    <div key={row.year} className="flex-1 flex flex-col items-center group">
                      <div className="w-full flex flex-col justify-end h-32 gap-0">
                        <div style={{ height: `${Math.max(openH, 0)}%` }} className="w-full bg-primary/20 rounded-t-sm" title={`Opening: ${fmt(row.openingBalance)}`} />
                        <div style={{ height: `${Math.max(contribH, 2)}%` }} className="w-full bg-primary/60" title={`Contributions: ${fmt(row.contributions)}`} />
                        <div style={{ height: `${Math.max(intH, 2)}%` }} className="w-full bg-accent rounded-b-sm" title={`Interest: ${fmt(row.interest)}`} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1.5">Yr {row.year}</p>
                    </div>
                  );
                })}
              </div>
              {/* Legend */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                {[
                  { color: 'bg-primary/20', label: 'Opening' },
                  { color: 'bg-primary/60', label: 'Contributions' },
                  { color: 'bg-accent', label: 'Interest Earned' },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
                    <span className="text-[10px] text-muted-foreground">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Year-by-year table */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Year-by-Year Projection</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">{result.rows.length} year{result.rows.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      {['Year', 'Opening Balance', 'Contributions', 'Interest', 'Closing Balance'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {result.rows.map((row, i) => (
                      <tr key={row.year} className={`${i % 2 === 0 ? '' : 'bg-muted/20'} hover:bg-secondary/30 transition-colors`}>
                        <td className="px-4 py-3 font-semibold text-foreground">Year {row.year}</td>
                        <td className="px-4 py-3 text-muted-foreground font-tabular">{fmt(row.openingBalance)}</td>
                        <td className="px-4 py-3 text-primary font-tabular">{fmt(row.contributions)}</td>
                        <td className="px-4 py-3 text-accent font-tabular">+{fmt(row.interest)}</td>
                        <td className="px-4 py-3 font-extrabold text-foreground font-tabular">{fmt(row.closingBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-primary/5 border-t-2 border-primary/20">
                      <td className="px-4 py-3 font-bold text-foreground" colSpan={2}>Totals</td>
                      <td className="px-4 py-3 font-bold text-primary font-tabular">{fmt(result.totalContributions)}</td>
                      <td className="px-4 py-3 font-bold text-accent font-tabular">+{fmt(result.totalInterest)}</td>
                      <td className="px-4 py-3 font-extrabold text-emerald-600 font-tabular">{fmt(result.finalBalance)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-amber-800 leading-relaxed">
                <strong>Disclaimer:</strong> Results shown are <em>projections only</em> based on the inputs provided. Actual returns may vary depending on the savings product selected, market conditions, and applicable terms. This calculator does not create any financial obligation or transaction.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-8 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/assets/images/WhatsApp_Image_2026-09-19_at_12.24.54-1789999920386.jpeg" alt="CLIMPS Logo" width={24} height={24} className="rounded object-cover" />
            <span className="text-sm font-semibold text-primary">CLIMPS Cooperative</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">© 2026 CLIMPS Multipurpose Cooperative Society. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/landing" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link href="/savings-products" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Savings Products</Link>
            <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
