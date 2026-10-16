'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

type CalcTab = 'savings' | 'investment' | 'loan';

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function useTabFade(activeTab: string) {
  const [displayed, setDisplayed] = useState(activeTab);
  const [show, setShow] = useState(true);
  useEffect(() => {
    setShow(false);
    const t = setTimeout(() => { setDisplayed(activeTab); setShow(true); }, 160);
    return () => clearTimeout(t);
  }, [activeTab]);
  return { displayed, show };
}

function formatNaira(val: number): string {
  return '₦' + Math.round(val).toLocaleString('en-NG');
}

function SavingsCalc() {
  const [monthly, setMonthly] = useState(25000);
  const [years, setYears] = useState(3);

  const months = years * 12;
  const monthlyRate = 0.04;
  const qualifiesForInterest = months >= 12;
  const totalContributed = monthly * months;
  const futureValue = qualifiesForInterest
    ? monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
    : totalContributed;
  const interest = futureValue - totalContributed;

  const percentPrincipal = Math.max(15, Math.min(85, Math.round((totalContributed / futureValue) * 100)));
  const percentInterest = 100 - percentPrincipal;

  const PRESETS = [10000, 25000, 50000, 100000, 200000];

  return (
    <div className="space-y-7">
      {/* Monthly contribution slider */}
      <div>
        <div className="flex justify-between items-center mb-2.5">
          <label className="text-sm sm:text-base text-slate-300 font-medium">Monthly Contribution</label>
          <span className="text-lg sm:text-xl font-black text-white font-tabular drop-shadow-sm">{formatNaira(monthly)}</span>
        </div>
        <input
          type="range"
          min={5000}
          max={200000}
          step={5000}
          value={monthly}
          onChange={(e) => setMonthly(+e.target.value)}
          className="w-full h-2.5 accent-blue-500 bg-white/10 rounded-full cursor-pointer transition-all"
        />
        
        {/* Quick preset chips */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
          <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase tracking-wider">Quick:</span>
          {PRESETS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setMonthly(amt)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                monthly === amt
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              ₦{amt >= 1000 ? `${amt / 1000}k` : amt}
            </button>
          ))}
        </div>
      </div>

      {/* Duration slider */}
      <div>
        <div className="flex justify-between items-center mb-2.5">
          <label className="text-sm sm:text-base text-slate-300 font-medium">Duration</label>
          <span className="text-lg sm:text-xl font-black text-blue-400 font-tabular">{years} {years === 1 ? 'Year' : 'Years'} ({months} months)</span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={years}
          onChange={(e) => setYears(+e.target.value)}
          className="w-full h-2.5 accent-blue-500 bg-white/10 rounded-full cursor-pointer transition-all"
        />
        <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-medium">
          <span>1 Year (Annual thrift)</span>
          <span>5 Years</span>
          <span>10 Years</span>
        </div>
      </div>

      {/* Dynamic Visual Growth Bar */}
      <div className="p-4 rounded-2xl bg-[#070D1E]/90 border border-white/10">
        <div className="flex justify-between items-center text-xs font-bold mb-2">
          <span className="text-blue-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Your Deposits ({percentPrincipal}%)
          </span>
          <span className="text-[#00E599] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00E599] animate-pulse" />
            Compound Interest ({percentInterest}%)
          </span>
        </div>
        
        {/* Dual dynamic bar */}
        <div className="h-3.5 w-full bg-white/10 rounded-full overflow-hidden flex shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300 ease-out"
            style={{ width: `${percentPrincipal}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-[#00E599] transition-all duration-300 ease-out"
            style={{ width: `${percentInterest}%` }}
          />
        </div>
      </div>

      {/* Results Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm transition-all hover:border-white/20">
          <div className="text-xs text-slate-400 font-medium mb-1">Total Saved</div>
          <div className="text-lg font-black text-white font-tabular">{formatNaira(totalContributed)}</div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center backdrop-blur-sm transition-all hover:border-emerald-500/50">
          <div className="text-xs text-emerald-300 font-medium mb-1">Growth Earned</div>
          <div className="text-lg font-black text-[#00E599] font-tabular">+{formatNaira(interest)}</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center backdrop-blur-sm transition-all hover:border-blue-500/50">
          <div className="text-xs text-blue-300 font-medium mb-1">Total Maturity Value</div>
          <div className="text-lg font-black text-white font-tabular">{formatNaira(futureValue)}</div>
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/save/start"
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base transition-all duration-200 active:scale-95 shadow-lg shadow-blue-600/30 group hover:shadow-blue-500/40"
      >
        Start Saving
        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

function InvestmentCalc() {
  const [principal, setPrincipal] = useState(500000);
  const [months, setMonths] = useState(12);

  const monthlyRate = 0.035;
  const monthlyReturn = principal * monthlyRate;
  const totalReturn = monthlyReturn * months;
  const futureValue = principal + totalReturn;

  const PRESETS = [250000, 500000, 1000000, 2500000, 5000000];

  return (
    <div className="space-y-7">
      <div>
        <div className="flex justify-between items-center mb-2.5">
          <label className="text-sm sm:text-base text-slate-300 font-medium">Subscribed Capital</label>
          <span className="text-lg sm:text-xl font-black text-white font-tabular">{formatNaira(principal)}</span>
        </div>
        <input
          type="range"
          min={50000}
          max={10000000}
          step={50000}
          value={principal}
          onChange={(e) => setPrincipal(+e.target.value)}
          className="w-full h-2.5 accent-[#00D084] bg-white/10 rounded-full cursor-pointer transition-all"
        />

        {/* Quick preset chips */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
          <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase tracking-wider">Quick:</span>
          {PRESETS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setPrincipal(amt)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                principal === amt
                  ? 'bg-[#00D084] text-slate-950 shadow-sm shadow-emerald-500/30'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              ₦{amt >= 1000000 ? `${(amt / 1000000).toFixed(1).replace('.0', '')}M` : `${amt / 1000}k`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2.5">
          <label className="text-sm sm:text-base text-slate-300 font-medium">Tenure</label>
          <span className="text-lg sm:text-xl font-black text-[#00E599] font-tabular">{months} months (3.5%/mo agreed return)</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[3, 6, 12, 24].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMonths(m)}
              className={`py-2.5 rounded-xl text-sm font-bold border transition-all duration-200 ${
                months === m
                  ? 'bg-[#00D084] text-slate-950 border-[#00D084] shadow-md shadow-emerald-500/20 scale-[1.02]'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:border-[#00D084]/50 hover:text-white'
              }`}
            >
              {m}mo
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Visual Growth Bar */}
      <div className="p-4 rounded-2xl bg-[#070D1E]/90 border border-white/10">
        <div className="flex justify-between items-center text-xs font-bold mb-2">
          <span className="text-slate-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Capital ({formatNaira(principal)})
          </span>
          <span className="text-[#00E599] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00E599] animate-pulse" />
            Total Return (+{formatNaira(totalReturn)})
          </span>
        </div>
        <div className="h-3.5 w-full bg-white/10 rounded-full overflow-hidden flex shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300 ease-out"
            style={{ width: `${Math.round((principal / futureValue) * 100)}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-teal-400 to-[#00E599] transition-all duration-300 ease-out"
            style={{ width: `${Math.round((totalReturn / futureValue) * 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
          <div className="text-xs text-slate-400 font-medium mb-1">Monthly Payout</div>
          <div className="text-lg font-black text-emerald-400 font-tabular">{formatNaira(monthlyReturn)}/mo</div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center backdrop-blur-sm">
          <div className="text-xs text-emerald-300 font-medium mb-1">Total Agreed Return</div>
          <div className="text-lg font-black text-[#00E599] font-tabular">+{formatNaira(totalReturn)}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
          <div className="text-xs text-slate-400 font-medium mb-1">Total Maturity Payout</div>
          <div className="text-lg font-black text-white font-tabular">{formatNaira(futureValue)}</div>
        </div>
      </div>

      <Link
        href="/investors-circle"
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#00D084] hover:bg-[#00E599] text-slate-950 font-black text-base transition-all duration-200 active:scale-95 shadow-lg shadow-emerald-500/25 group hover:shadow-emerald-500/40"
      >
        Join Wealth Circle
        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

function LoanCalc() {
  const [amount, setAmount] = useState(250000);
  const [months, setMonths] = useState(6);

  const monthlyRate = 0.10;
  const monthlyInterest = amount * monthlyRate;
  const totalInterest = monthlyInterest * months;
  const principalPerMonth = amount / months;
  const monthlyPayment = principalPerMonth + monthlyInterest;
  const totalRepayment = amount + totalInterest;

  const PRESETS = [50000, 100000, 250000, 500000, 1000000];

  return (
    <div className="space-y-7">
      <div>
        <div className="flex justify-between items-center mb-2.5">
          <label className="text-sm sm:text-base text-slate-300 font-medium">Loan Amount</label>
          <span className="text-lg sm:text-xl font-black text-white font-tabular">{formatNaira(amount)}</span>
        </div>
        <input
          type="range"
          min={50000}
          max={5000000}
          step={50000}
          value={amount}
          onChange={(e) => setAmount(+e.target.value)}
          className="w-full h-2.5 accent-rose-500 bg-white/10 rounded-full cursor-pointer transition-all"
        />

        {/* Quick preset chips */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
          <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase tracking-wider">Quick:</span>
          {PRESETS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setAmount(amt)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                amount === amt
                  ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/30'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              ₦{amt >= 1000000 ? `${(amt / 1000000).toFixed(1).replace('.0', '')}M` : `${amt / 1000}k`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2.5">
          <label className="text-sm sm:text-base text-slate-300 font-medium">Repayment Tenure</label>
          <span className="text-lg sm:text-xl font-black text-rose-400 font-tabular">{months} months</span>
        </div>
        <input
          type="range"
          min={1}
          max={24}
          step={1}
          value={months}
          onChange={(e) => setMonths(+e.target.value)}
          className="w-full h-2.5 accent-rose-500 bg-white/10 rounded-full cursor-pointer transition-all"
        />
        <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-medium">
          <span>1 month (Express emergency)</span>
          <span>12 months</span>
          <span>24 months</span>
        </div>
      </div>

      {/* Dynamic Visual Breakdown Bar */}
      <div className="p-4 rounded-2xl bg-[#070D1E]/90 border border-white/10">
        <div className="flex justify-between items-center text-xs font-bold mb-2">
          <span className="text-rose-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Principal Amount ({formatNaira(amount)})
          </span>
          <span className="text-amber-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Total Interest ({formatNaira(totalInterest)})
          </span>
        </div>
        <div className="h-3.5 w-full bg-white/10 rounded-full overflow-hidden flex shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-300 ease-out"
            style={{ width: `${Math.round((amount / totalRepayment) * 100)}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300 ease-out"
            style={{ width: `${Math.round((totalInterest / totalRepayment) * 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-center backdrop-blur-sm">
          <div className="text-xs text-rose-300 font-medium mb-1">Monthly Repayment</div>
          <div className="text-lg font-black text-white font-tabular">{formatNaira(monthlyPayment)}/mo</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
          <div className="text-xs text-slate-400 font-medium mb-1">Total Interest</div>
          <div className="text-lg font-black text-amber-300 font-tabular">{formatNaira(totalInterest)}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
          <div className="text-xs text-slate-400 font-medium mb-1">Total Repayment</div>
          <div className="text-lg font-black text-white font-tabular">{formatNaira(totalRepayment)}</div>
        </div>
      </div>

      <Link
        href="/loan-application"
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-base transition-all duration-200 active:scale-95 shadow-lg shadow-rose-600/30 group hover:shadow-rose-500/40"
      >
        Apply for 24h Loan
        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

const TABS: { id: CalcTab; label: string; activeClass: string }[] = [
  { id: 'savings', label: 'Thrift Savings', activeClass: 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' },
  { id: 'investment', label: 'Wealth Circle', activeClass: 'bg-[#00D084] text-slate-950 font-black shadow-lg shadow-emerald-500/20' },
  { id: 'loan', label: 'Quick Loans', activeClass: 'bg-rose-600 text-white shadow-lg shadow-rose-500/20' },
];

export default function FinancialCalculators() {
  const [activeTab, setActiveTab] = useState<CalcTab>('savings');
  const { displayed, show } = useTabFade(activeTab);
  const { ref, visible } = useInView(0.1);

  return (
    <section id="calculators" ref={ref} className="py-16 sm:py-20 lg:py-24 bg-[#050B17] relative overflow-hidden border-t border-white/10">
      {/* Subtle ambient light */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[450px] h-[450px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 lg:gap-16 items-start">
          {/* Left copy — slides in from left */}
          <div
            className="lg:w-[340px] flex-shrink-0"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(-40px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-widest uppercase mb-4">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="w-2 h-2 rounded-full bg-[#00E599]" />
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-slate-200 ml-1">FINANCIAL CALCULATORS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-4">
              See your money<br className="hidden sm:inline" />
              {' '}grow before{' '}
              <span className="text-[#00E599]">you commit.</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Adjust the sliders. Watch the numbers. Transparent interest rates with zero hidden charges.
            </p>
          </div>

          {/* Right calculator — slides in from right */}
          <div
            className="flex-1 min-w-0 w-full"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(40px)',
              transition: 'opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s',
            }}
          >
            <div className="bg-[#0D182E]/90 backdrop-blur-xl rounded-2xl border border-white/15 shadow-2xl overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-white/10 bg-[#070D1E]/80 p-1.5 gap-1.5">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-3 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                      activeTab === tab.id
                        ? tab.activeClass
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content with fade transition */}
              <div
                className="p-6 sm:p-8"
                style={{
                  opacity: show ? 1 : 0,
                  transform: show ? 'translateY(0)' : 'translateY(10px)',
                  transition: 'opacity 0.18s ease, transform 0.18s ease',
                }}
              >
                {displayed === 'savings' && <SavingsCalc />}
                {displayed === 'investment' && <InvestmentCalc />}
                {displayed === 'loan' && <LoanCalc />}
              </div>

              {/* Disclaimer */}
              <div className="px-6 sm:px-8 pb-5">
                <p className="text-xs text-slate-500 text-center font-medium">
                  * Estimates for planning purposes only. Actual returns subject to CLIMPS terms and product agreements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
