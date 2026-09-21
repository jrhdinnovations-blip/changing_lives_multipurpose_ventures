'use client';
import React, { useState, useCallback } from 'react';

type CalcTab = 'savings' | 'investment' | 'loan';

function formatNaira(val: number): string {
  return '₦' + Math.round(val).toLocaleString('en-NG');
}

function SavingsCalc() {
  const [monthly, setMonthly] = useState(20000);
  const [rate, setRate] = useState(10);
  const [years, setYears] = useState(3);

  const months = years * 12;
  const r = rate / 100 / 12;
  const futureValue = r === 0 ? monthly * months : monthly * ((Math.pow(1 + r, months) - 1) / r);
  const totalContributed = monthly * months;
  const interest = futureValue - totalContributed;

  return (
    <div className="space-y-6">
      <div>
        <label className="label-base">Monthly Contribution</label>
        <div className="flex items-center gap-3">
          <input type="range" min={1000} max={500000} step={1000} value={monthly} onChange={e => setMonthly(+e.target.value)} className="flex-1 accent-primary" />
          <span className="text-sm font-semibold text-primary w-28 text-right font-tabular">{formatNaira(monthly)}</span>
        </div>
      </div>
      <div>
        <label className="label-base">Annual Interest Rate: <span className="text-primary">{rate}%</span></label>
        <input type="range" min={5} max={18} step={0.5} value={rate} onChange={e => setRate(+e.target.value)} className="w-full accent-primary" />
      </div>
      <div>
        <label className="label-base">Duration: <span className="text-primary">{years} year{years > 1 ? 's' : ''}</span></label>
        <input type="range" min={1} max={10} step={1} value={years} onChange={e => setYears(+e.target.value)} className="w-full accent-primary" />
      </div>
      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
          <div className="text-xs text-blue-600 font-medium mb-1">Total Saved</div>
          <div className="text-lg font-bold text-blue-700 font-tabular">{formatNaira(totalContributed)}</div>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
          <div className="text-xs text-emerald-600 font-medium mb-1">Interest Earned</div>
          <div className="text-lg font-bold text-emerald-700 font-tabular">{formatNaira(interest)}</div>
        </div>
        <div className="bg-primary/5 rounded-xl p-4 text-center border border-primary/10">
          <div className="text-xs text-primary font-medium mb-1">Future Value</div>
          <div className="text-lg font-bold text-primary font-tabular">{formatNaira(futureValue)}</div>
        </div>
      </div>
    </div>
  );
}

function InvestmentCalc() {
  const [principal, setPrincipal] = useState(500000);
  const [rate, setRate] = useState(18);
  const [years, setYears] = useState(5);

  const futureValue = principal * Math.pow(1 + rate / 100, years);
  const totalReturn = futureValue - principal;
  const roi = ((totalReturn / principal) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <label className="label-base">Initial Investment</label>
        <div className="flex items-center gap-3">
          <input type="range" min={50000} max={10000000} step={50000} value={principal} onChange={e => setPrincipal(+e.target.value)} className="flex-1 accent-emerald-600" />
          <span className="text-sm font-semibold text-emerald-700 w-28 text-right font-tabular">{formatNaira(principal)}</span>
        </div>
      </div>
      <div>
        <label className="label-base">Annual Return Rate: <span className="text-emerald-600">{rate}%</span></label>
        <input type="range" min={10} max={30} step={0.5} value={rate} onChange={e => setRate(+e.target.value)} className="w-full accent-emerald-600" />
      </div>
      <div>
        <label className="label-base">Investment Period: <span className="text-emerald-600">{years} year{years > 1 ? 's' : ''}</span></label>
        <input type="range" min={1} max={15} step={1} value={years} onChange={e => setYears(+e.target.value)} className="w-full accent-emerald-600" />
      </div>
      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
          <div className="text-xs text-emerald-600 font-medium mb-1">Principal</div>
          <div className="text-lg font-bold text-emerald-700 font-tabular">{formatNaira(principal)}</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
          <div className="text-xs text-blue-600 font-medium mb-1">Total Return</div>
          <div className="text-lg font-bold text-blue-700 font-tabular">{formatNaira(totalReturn)}</div>
        </div>
        <div className="bg-primary/5 rounded-xl p-4 text-center border border-primary/10">
          <div className="text-xs text-primary font-medium mb-1">Portfolio Value</div>
          <div className="text-lg font-bold text-primary font-tabular">{formatNaira(futureValue)}</div>
        </div>
      </div>
      <div className="bg-emerald-600 rounded-xl p-3 text-center">
        <span className="text-white text-sm font-semibold">ROI: {roi}% over {years} year{years > 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}

function LoanCalc() {
  const [amount, setAmount] = useState(1000000);
  const [rate, setRate] = useState(10);
  const [months, setMonths] = useState(24);

  const r = rate / 100 / 12;
  const monthly = r === 0 ? amount / months : (amount * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  const totalRepayment = monthly * months;
  const totalInterest = totalRepayment - amount;

  return (
    <div className="space-y-6">
      <div>
        <label className="label-base">Loan Amount</label>
        <div className="flex items-center gap-3">
          <input type="range" min={50000} max={5000000} step={50000} value={amount} onChange={e => setAmount(+e.target.value)} className="flex-1 accent-amber-600" />
          <span className="text-sm font-semibold text-amber-700 w-28 text-right font-tabular">{formatNaira(amount)}</span>
        </div>
      </div>
      <div>
        <label className="label-base">Annual Interest Rate: <span className="text-amber-600">{rate}%</span></label>
        <input type="range" min={6} max={24} step={0.5} value={rate} onChange={e => setRate(+e.target.value)} className="w-full accent-amber-600" />
      </div>
      <div>
        <label className="label-base">Repayment Period: <span className="text-amber-600">{months} months</span></label>
        <input type="range" min={3} max={60} step={3} value={months} onChange={e => setMonths(+e.target.value)} className="w-full accent-amber-600" />
      </div>
      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
          <div className="text-xs text-amber-600 font-medium mb-1">Monthly Payment</div>
          <div className="text-lg font-bold text-amber-700 font-tabular">{formatNaira(monthly)}</div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
          <div className="text-xs text-red-500 font-medium mb-1">Total Interest</div>
          <div className="text-lg font-bold text-red-600 font-tabular">{formatNaira(totalInterest)}</div>
        </div>
        <div className="bg-primary/5 rounded-xl p-4 text-center border border-primary/10">
          <div className="text-xs text-primary font-medium mb-1">Total Repayment</div>
          <div className="text-lg font-bold text-primary font-tabular">{formatNaira(totalRepayment)}</div>
        </div>
      </div>
    </div>
  );
}

const TABS: { id: CalcTab; label: string; color: string; activeClass: string }[] = [
  { id: 'savings', label: 'Savings', color: 'text-blue-600', activeClass: 'bg-blue-600 text-white' },
  { id: 'investment', label: 'Investment', color: 'text-emerald-600', activeClass: 'bg-emerald-600 text-white' },
  { id: 'loan', label: 'Loan', color: 'text-amber-600', activeClass: 'bg-amber-600 text-white' },
];

export default function FinancialCalculators() {
  const [activeTab, setActiveTab] = useState<CalcTab>('savings');

  return (
    <section id="calculators" className="py-20 lg:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left text */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="inline-flex items-center gap-2 bg-secondary rounded-full px-4 py-1.5 mb-4">
              <span className="text-primary text-xs font-semibold uppercase tracking-widest">Calculators</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-4">
              Plan your<br />
              <span className="text-primary">financial journey</span><br />
              before you start.
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed mb-6">
              Use our interactive calculators to estimate returns, plan contributions, and understand your loan obligations before committing.
            </p>
            <div className="space-y-3">
              {[
                { label: 'Savings Calculator', desc: 'Project your savings growth' },
                { label: 'Investment Calculator', desc: 'Estimate portfolio returns' },
                { label: 'Loan Calculator', desc: 'Plan your repayments' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-muted/60">
                  <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-foreground">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calculator card */}
          <div className="flex-1 bg-card rounded-3xl border border-border shadow-card-lg overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-border bg-muted/30 p-1.5 gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab.id ? tab.activeClass : `${tab.color} hover:bg-muted`
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Calculator content */}
            <div className="p-6 sm:p-8">
              {activeTab === 'savings' && <SavingsCalc />}
              {activeTab === 'investment' && <InvestmentCalc />}
              {activeTab === 'loan' && <LoanCalc />}
            </div>

            {/* Footer */}
            <div className="px-6 sm:px-8 pb-6 pt-0">
              <p className="text-xs text-muted-foreground text-center">
                * Calculations are estimates for planning purposes. Actual returns may vary based on product terms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
