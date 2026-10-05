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
          <label className="text-base text-slate-700 font-semibold">Monthly contribution</label>
          <span className="text-base font-black text-slate-900">{formatNaira(monthly)}</span>
        </div>
        <input
          type="range"
          min={5000}
          max={200000}
          step={5000}
          value={monthly}
          onChange={(e) => setMonthly(+e.target.value)}
          className="w-full h-1.5 accent-blue-600 bg-slate-200 rounded-full cursor-pointer"
        />
      </div>

      {/* Duration slider */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="text-base text-slate-700 font-semibold">Duration — {years} years</label>
          <span className="text-base font-black text-blue-600">{years}y</span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={years}
          onChange={(e) => setYears(+e.target.value)}
          className="w-full h-1.5 accent-blue-600 bg-slate-200 rounded-full cursor-pointer"
        />
      </div>

      {/* Results */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        {[
          { label: 'Contributed', value: formatNaira(totalContributed) },
          { label: 'Interest', value: formatNaira(interest) },
          { label: 'Total Value', value: formatNaira(futureValue) },
        ].map((r) => (
          <div key={r.label} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center">
            <div className="text-xs text-slate-500 font-semibold mb-1.5">{r.label}</div>
            <div className="text-lg font-black text-slate-900 font-tabular">{r.value}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link
        href="/save/start"
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition-all duration-150 active:scale-95 shadow-md shadow-blue-600/20 group"
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
          <label className="text-base text-slate-700 font-semibold">Subscribed Capital</label>
          <span className="text-base font-black text-slate-900">{formatNaira(principal)}</span>
        </div>
        <input
          type="range"
          min={50000}
          max={10000000}
          step={50000}
          value={principal}
          onChange={(e) => setPrincipal(+e.target.value)}
          className="w-full h-1.5 accent-emerald-600 bg-slate-200 rounded-full cursor-pointer"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="text-base text-slate-700 font-semibold">Tenure</label>
          <span className="text-base font-black text-emerald-600">{months} months</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[3, 6, 12, 24].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMonths(m)}
              className={`py-2 rounded-xl text-sm font-bold border transition-all ${
                months === m
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-500'
              }`}
            >
              {m}mo
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-2">
        {[
          { label: 'Principal', value: formatNaira(principal) },
          { label: 'Total Return', value: formatNaira(totalReturn) },
          { label: 'Maturity Value', value: formatNaira(futureValue) },
        ].map((r) => (
          <div key={r.label} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center">
            <div className="text-xs text-slate-500 font-semibold mb-1.5">{r.label}</div>
            <div className="text-lg font-black text-slate-900 font-tabular">{r.value}</div>
          </div>
        ))}
      </div>

      <Link
        href="/investors-circle"
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base transition-all duration-150 active:scale-95 shadow-md shadow-emerald-600/20 group"
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
          <label className="text-base text-slate-700 font-semibold">Loan Amount</label>
          <span className="text-base font-black text-slate-900">{formatNaira(amount)}</span>
        </div>
        <input
          type="range"
          min={50000}
          max={5000000}
          step={50000}
          value={amount}
          onChange={(e) => setAmount(+e.target.value)}
          className="w-full h-1.5 accent-red-600 bg-slate-200 rounded-full cursor-pointer"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="text-base text-slate-700 font-semibold">Repayment Tenure</label>
          <span className="text-base font-black text-red-600">{months} months</span>
        </div>
        <input
          type="range"
          min={1}
          max={24}
          step={1}
          value={months}
          onChange={(e) => setMonths(+e.target.value)}
          className="w-full h-1.5 accent-red-600 bg-slate-200 rounded-full cursor-pointer"
        />
      </div>

      <div className="grid grid-cols-3 gap-3 pt-2">
        {[
          { label: 'Monthly Payment', value: formatNaira(monthlyPayment) },
          { label: 'Total Interest', value: formatNaira(totalInterest) },
          { label: 'Total Repayment', value: formatNaira(totalRepayment) },
        ].map((r) => (
          <div key={r.label} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center">
            <div className="text-xs text-slate-500 font-semibold mb-1.5">{r.label}</div>
            <div className="text-lg font-black text-slate-900 font-tabular">{r.value}</div>
          </div>
        ))}
      </div>

      <Link
        href="/loan-application"
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-base transition-all duration-150 active:scale-95 shadow-md shadow-red-600/20 group"
      >
        Apply for 24h Loan
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

const TABS: { id: CalcTab; label: string; activeClass: string }[] = [
  { id: 'savings', label: 'Savings (Blue)', activeClass: 'bg-blue-600 text-white shadow-sm' },
  { id: 'investment', label: 'Wealth Circle (Green)', activeClass: 'bg-emerald-600 text-white shadow-sm' },
  { id: 'loan', label: 'Loan (Red)', activeClass: 'bg-red-600 text-white shadow-sm' },
];

export default function FinancialCalculators() {
  const [activeTab, setActiveTab] = useState<CalcTab>('savings');
  const { displayed, show } = useTabFade(activeTab);
  const { ref, visible } = useInView(0.1);

  return (
    <section id="calculators" ref={ref} className="py-12 sm:py-16 lg:py-20 bg-slate-50 overflow-hidden border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 lg:gap-16 items-start">
          {/* Left copy — slides in from left */}
          <div
            className="lg:w-[320px] flex-shrink-0"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(-50px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}
          >
            <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase mb-3">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span className="text-slate-800 font-extrabold ml-1">FINANCIAL CALCULATORS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-3 sm:mb-4">
              See your money<br className="hidden sm:inline" />
              {' '}grow before{' '}
              <span className="text-emerald-600">you commit.</span>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-semibold leading-relaxed">
              Adjust the sliders. Watch the numbers. Transparent interest rates with zero hidden charges.
            </p>
          </div>

          {/* Right calculator — slides in from right */}
          <div
            className="flex-1 min-w-0"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(50px)',
              transition: 'opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s',
            }}
          >
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-slate-200 bg-slate-50/80">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-4 text-sm sm:text-base font-bold transition-all duration-200 ${
                      activeTab === tab.id
                        ? tab.activeClass
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content with fade transition */}
              <div
                className="p-7 sm:p-9"
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
              <div className="px-7 sm:px-9 pb-5">
                <p className="text-xs text-slate-400 text-center font-medium">
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
