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
  const [monthly, setMonthly] = useState(20000);
  const [years, setYears] = useState(3);

  const months = years * 12;
  const monthlyRate = 0.04;
  const qualifiesForInterest = months >= 12;
  const totalContributed = monthly * months;
  const futureValue = qualifiesForInterest
    ? monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
    : totalContributed;
  const interest = futureValue - totalContributed;

  return (
    <div className="space-y-7">
      {/* Monthly contribution slider */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm sm:text-base text-slate-300 font-medium">Monthly contribution</label>
          <span className="text-base sm:text-lg font-black text-white font-tabular">{formatNaira(monthly)}</span>
        </div>
        <input
          type="range"
          min={5000}
          max={200000}
          step={5000}
          value={monthly}
          onChange={(e) => setMonthly(+e.target.value)}
          className="w-full h-2 accent-blue-500 bg-white/10 rounded-full cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-slate-500 mt-1.5 font-medium">
          <span>₦5,000</span>
          <span>₦200,000</span>
        </div>
      </div>

      {/* Duration slider */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm sm:text-base text-slate-300 font-medium">Duration — {years} years</label>
          <span className="text-base sm:text-lg font-black text-blue-400 font-tabular">{years}y</span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={years}
          onChange={(e) => setYears(+e.target.value)}
          className="w-full h-2 accent-blue-500 bg-white/10 rounded-full cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-slate-500 mt-1.5 font-medium">
          <span>1 year</span>
          <span>10 years</span>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        {[
          { label: 'Contributed', value: formatNaira(totalContributed) },
          { label: 'Interest', value: formatNaira(interest) },
          { label: 'Total Value', value: formatNaira(futureValue) },
        ].map((r) => (
          <div key={r.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
            <div className="text-xs text-slate-400 font-medium mb-1.5">{r.label}</div>
            <div className="text-lg font-black text-white font-tabular">{r.value}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link
        href="/save/start"
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base transition-all duration-150 active:scale-95 shadow-lg shadow-blue-600/30 group"
      >
        Start Saving
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
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

  return (
    <div className="space-y-7">
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm sm:text-base text-slate-300 font-medium">Subscribed Capital</label>
          <span className="text-base sm:text-lg font-black text-white font-tabular">{formatNaira(principal)}</span>
        </div>
        <input
          type="range"
          min={50000}
          max={10000000}
          step={50000}
          value={principal}
          onChange={(e) => setPrincipal(+e.target.value)}
          className="w-full h-2 accent-[#00D084] bg-white/10 rounded-full cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-slate-500 mt-1.5 font-medium">
          <span>₦50,000</span>
          <span>₦10,000,000</span>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm sm:text-base text-slate-300 font-medium">Tenure</label>
          <span className="text-base sm:text-lg font-black text-[#00E599] font-tabular">{months} months</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[3, 6, 12, 24].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMonths(m)}
              className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                months === m
                  ? 'bg-[#00D084] text-slate-950 border-[#00D084] shadow-md shadow-emerald-500/20'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:border-[#00D084]/50 hover:text-white'
              }`}
            >
              {m}mo
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        {[
          { label: 'Principal', value: formatNaira(principal) },
          { label: 'Total Return', value: formatNaira(totalReturn) },
          { label: 'Maturity Value', value: formatNaira(futureValue) },
        ].map((r) => (
          <div key={r.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
            <div className="text-xs text-slate-400 font-medium mb-1.5">{r.label}</div>
            <div className="text-lg font-black text-white font-tabular">{r.value}</div>
          </div>
        ))}
      </div>

      <Link
        href="/investors-circle"
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#00D084] hover:bg-[#00E599] text-slate-950 font-black text-base transition-all duration-150 active:scale-95 shadow-lg shadow-emerald-500/25 group"
      >
        Join Wealth Circle
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

function LoanCalc() {
  const [amount, setAmount] = useState(500000);
  const [months, setMonths] = useState(6);

  const monthlyRate = 0.10;
  const monthlyInterest = amount * monthlyRate;
  const totalInterest = monthlyInterest * months;
  const principalPerMonth = amount / months;
  const monthlyPayment = principalPerMonth + monthlyInterest;
  const totalRepayment = amount + totalInterest;

  return (
    <div className="space-y-7">
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm sm:text-base text-slate-300 font-medium">Loan Amount</label>
          <span className="text-base sm:text-lg font-black text-white font-tabular">{formatNaira(amount)}</span>
        </div>
        <input
          type="range"
          min={50000}
          max={5000000}
          step={50000}
          value={amount}
          onChange={(e) => setAmount(+e.target.value)}
          className="w-full h-2 accent-rose-500 bg-white/10 rounded-full cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-slate-500 mt-1.5 font-medium">
          <span>₦50,000</span>
          <span>₦5,000,000</span>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm sm:text-base text-slate-300 font-medium">Repayment Tenure</label>
          <span className="text-base sm:text-lg font-black text-rose-400 font-tabular">{months} months</span>
        </div>
        <input
          type="range"
          min={1}
          max={24}
          step={1}
          value={months}
          onChange={(e) => setMonths(+e.target.value)}
          className="w-full h-2 accent-rose-500 bg-white/10 rounded-full cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-slate-500 mt-1.5 font-medium">
          <span>1 month</span>
          <span>24 months</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        {[
          { label: 'Monthly Payment', value: formatNaira(monthlyPayment) },
          { label: 'Total Interest', value: formatNaira(totalInterest) },
          { label: 'Total Repayment', value: formatNaira(totalRepayment) },
        ].map((r) => (
          <div key={r.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
            <div className="text-xs text-slate-400 font-medium mb-1.5">{r.label}</div>
            <div className="text-lg font-black text-white font-tabular">{r.value}</div>
          </div>
        ))}
      </div>

      <Link
        href="/loan-application"
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-base transition-all duration-150 active:scale-95 shadow-lg shadow-rose-600/30 group"
      >
        Apply for 24h Loan
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
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
                  * Estimates for planning purposes only. Actual returns subject to cooperative bye-laws and product terms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
