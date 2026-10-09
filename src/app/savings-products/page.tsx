'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Calendar,
  Wallet,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  HelpCircle,
  Calculator,
  ChevronDown,
} from 'lucide-react';
import LandingNav from '../landing/components/LandingNav';
import LandingFooter from '../landing/components/LandingFooter';
import { useAuth } from '@/contexts/AuthContext';

interface SavingsProduct {
  id: string;
  name: string;
  category: 'monthly_contribution' | 'regular_savings';
  tagline: string;
  description: string;
  minAmount: string;
  interestRate: string;
  duration: string;
  withdrawalRules: string;
  benefits: string[];
  badge: string;
  badgeColor: string;
  accentColor: string;
  isMandatory: boolean;
  actionUrl: string;
  actionLabel: string;
}

const savingsProducts: SavingsProduct[] = [
  {
    id: 'monthly-contribution',
    name: 'Monthly Cooperative Contribution',
    category: 'monthly_contribution',
    tagline: 'Disciplined. Rewarding. Core Cooperative Thrift.',
    description:
      'The foundation of your cooperative membership. Regular monthly dues build your personal cooperative equity, establish your creditworthiness, and unlock loan multiplier privileges of up to 300% with annual dividend profit shares.',
    minAmount: '₦5,000 / month (Max: ₦200,000 / month)',
    interestRate: '4.0% monthly (48% p.a.)',
    duration: 'At least 1 year (12 – 60 months)',
    withdrawalRules: 'Savings shall be for at least 1 year (12 months) or the member loses the interest. Early withdrawal prior to 1 year results in forfeiture of accrued interest.',
    benefits: [
      '4.0% monthly interest rate (48% p.a.)',
      'Must be maintained for at least 1 year or interest is forfeited',
      'Monthly savings commitment between ₦5,000 and ₦200,000',
      'Qualifies you for up to 3× loan multiplier credit',
      'Earns annual cooperative dividend profit-sharing',
      'Automatic salary or wallet auto-deduction option',
      'Official monthly statements and audit receipts',
    ],
    badge: 'Core Mandatory',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    accentColor: 'text-emerald-400',
    isMandatory: true,
    actionUrl: '/save/contributions',
    actionLabel: 'Manage Contributions',
  },
  {
    id: 'lock-your-funds',
    name: 'Lock Your Funds',
    category: 'regular_savings',
    tagline: 'Commit. Lock. Earn More. Minimum 6 months.',
    description:
      'A disciplined fixed-term savings plan for members who want to maximise returns by committing funds for a set period. Lock your deposit for a minimum of six months and earn premium interest — withdraw before the maturity date and ALL accrued interest is forfeited.',
    minAmount: '₦10,000 minimum deposit',
    interestRate: '7.0% p.a. (Credited at Maturity)',
    duration: 'Minimum 6 months (lock-up period)',
    withdrawalRules: '⚠️ Withdrawing before the maturity date results in forfeiture of ALL accrued interest. Principal is returned but no interest is paid on early exit.',
    benefits: [
      'Minimum 6-month lock-up period for maximum returns',
      'Premium 7.0% p.a. interest credited in full at maturity',
      'ALL interest is forfeited on early withdrawal — no exceptions',
      'Tenors available: 6, 9, 12, 18, or 24 months',
      'Automatic maturity alert via SMS & email before expiry',
      'Principal is fully secured and returned on early exit',
      'Eligible as collateral backing for loan applications',
    ],
    badge: 'Fixed Term • Locked',
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    accentColor: 'text-amber-400',
    isMandatory: false,
    actionUrl: '/save/regular',
    actionLabel: 'Open Lock Savings',
  },
];

const faqs = [
  {
    q: 'What is the difference between Monthly Contribution and Lock Your Funds?',
    a: 'Monthly Contribution is the mandatory core cooperative thrift (minimum ₦5,000/mo, maximum ₦200,000/mo) that earns 4.0% monthly interest provided it is held for at least 1 year — early withdrawal forfeits all interest. "Lock Your Funds" is a voluntary fixed-term savings plan with a minimum 6-month lock-up. It earns 7.0% p.a. interest credited in full at maturity; withdrawing before maturity forfeits ALL accrued interest.',
  },
  {
    q: 'What happens if I withdraw my Monthly Contribution before 1 year?',
    a: 'As stipulated in the CLIMPS cooperative rules, savings must be maintained for at least 1 year. Early withdrawal prior to 1 year results in forfeiture of ALL accrued interest to ensure cooperative fund stability.',
  },
  {
    q: 'What happens if I withdraw from Lock Your Funds before the maturity date?',
    a: '⚠️ Withdrawing from the Lock Your Funds plan before your chosen maturity date (minimum 6 months) results in the forfeiture of ALL accrued interest for that period. Your principal deposit is returned in full, but no interest is paid. There are no exceptions to this rule — it exists to protect the fund and incentivise long-term commitment.',
  },
  {
    q: 'What tenors are available for Lock Your Funds?',
    a: 'You can lock your funds for 6, 9, 12, 18, or 24 months. The longer the lock-up period, the better the yield value. Interest is credited in full to your account only on the maturity date. You will receive an automatic maturity alert via SMS and email before expiry.',
  },
  {
    q: 'Can I use my locked savings as collateral for a loan?',
    a: 'Yes! Your locked savings balance can serve as collateral backing for a loan application, strengthening your creditworthiness within the cooperative system without breaking the lock-up.',
  },
];

export default function SavingsProductsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=' + encodeURIComponent('/savings-products'));
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white selection:bg-emerald-500/30 selection:text-emerald-200">
      <LandingNav />

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24 border-b border-white/10">
        {/* Decorative background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 -right-32 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Changing Lives Multipurpose Ventures • Savings</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Streamlined Savings Built for <span className="text-emerald-400">Sustainable Growth</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Two powerful pillars: <strong className="text-white">Monthly Contribution (4% monthly)</strong> to build your cooperative equity and credit, and <strong className="text-white">Lock Your Funds</strong> — a fixed-term plan with premium returns and zero early-withdrawal interest.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {user ? (
              <Link
                href="/save/contributions"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
              >
                <span>My Savings Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/login?redirect=/savings-products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
              >
                <span>Sign In to Subscribe</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            <Link
              href="/save/calculator"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 bg-white/[0.04] hover:bg-white/10 text-white font-semibold text-sm transition-all"
            >
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>Savings Calculator</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Product Cards Section ── */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">Our Two Savings Products</h2>
          <p className="text-sm text-white/60 mt-2 max-w-xl mx-auto">
            Transparent terms, competitive returns, and member-first cooperative governance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {savingsProducts.map((p) => (
            <div
              key={p.id}
              className="rounded-3xl border border-white/10 bg-[#0d1527] p-8 lg:p-9 shadow-xl shadow-black/30 flex flex-col justify-between transition-all hover:border-emerald-500/40 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.03] rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/[0.06] transition-all" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${p.badgeColor}`}>
                    {p.badge}
                  </span>
                  <span className="text-base font-bold text-emerald-400 font-tabular">{p.interestRate}</span>
                </div>

                <h3 className="text-2xl font-bold text-white tracking-tight">{p.name}</h3>
                <p className="text-xs font-semibold text-emerald-400/90 mt-1 mb-4">{p.tagline}</p>
                <p className="text-sm text-white/70 leading-relaxed mb-6">{p.description}</p>

                {/* Key Specs Bento */}
                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10 mb-6 text-xs">
                  <div>
                    <span className="text-white/40 block text-[11px] uppercase tracking-wider">Commitment Range</span>
                    <span className="font-bold text-white text-sm mt-0.5 block">{p.minAmount}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[11px] uppercase tracking-wider">Tenor / Horizon</span>
                    <span className="font-bold text-white text-sm mt-0.5 block">{p.duration}</span>
                  </div>
                  <div className="col-span-2 pt-2.5 border-t border-white/10">
                    <span className="text-white/40 block text-[11px] uppercase tracking-wider">Withdrawal Terms</span>
                    <span className="font-medium text-white/80 mt-0.5 block">{p.withdrawalRules}</span>
                  </div>
                </div>

                {/* Benefits List */}
                <div className="space-y-2.5 mb-8">
                  <span className="text-xs font-bold text-white/60 uppercase tracking-wider block">Key Features & Privileges</span>
                  {p.benefits.map((b, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-white/80">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                <Link
                  href={user ? p.actionUrl : `/login?redirect=${encodeURIComponent(p.actionUrl)}`}
                  className="w-full text-center py-3 rounded-xl font-semibold text-sm transition-all shadow-lg flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40 active:scale-95"
                >
                  <span>{user ? p.actionLabel : 'Sign In to Subscribe'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Side-by-Side Comparison Matrix ── */}
      <section className="py-16 bg-[#070b16] border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Direct Feature Comparison</h2>
            <p className="text-xs sm:text-sm text-white/60 mt-2">
              Side-by-side breakdown of the two CLIMPS savings accounts.
            </p>
          </div>

          <div className="bg-[#0d1527] rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-white/60 font-semibold">
                    <th className="py-4 px-6 w-1/3">Feature / Parameter</th>
                    <th className="py-4 px-6 w-1/3 text-emerald-400 font-bold">Monthly Cooperative Contribution</th>
                    <th className="py-4 px-6 w-1/3 text-amber-400 font-bold">Lock Your Funds (Fixed Term)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  <tr>
                    <td className="py-3.5 px-6 font-semibold text-white">Membership Status</td>
                    <td className="py-3.5 px-6 text-white/80 font-medium">Mandatory for all active members</td>
                    <td className="py-3.5 px-6 text-white/80 font-medium">Voluntary fixed-term plan for any member</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-6 font-semibold text-white">Deposit Range</td>
                    <td className="py-3.5 px-6 text-white/80">₦5,000 – ₦200,000 monthly</td>
                    <td className="py-3.5 px-6 text-white/80">₦10,000 minimum deposit; any amount</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-6 font-semibold text-white">Interest / Return Rate</td>
                    <td className="py-3.5 px-6 text-emerald-400 font-bold">4.0% monthly (48% p.a.) + Surplus Dividends</td>
                    <td className="py-3.5 px-6 text-amber-400 font-bold">7.0% p.a. — Credited at Maturity</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-6 font-semibold text-white">Minimum Tenure</td>
                    <td className="py-3.5 px-6 text-amber-300 font-semibold">At least 1 year (or forfeit interest)</td>
                    <td className="py-3.5 px-6 text-amber-300 font-semibold">Minimum 6 months (6, 9, 12, 18, or 24)</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-6 font-semibold text-white">Withdrawal Policy</td>
                    <td className="py-3.5 px-6 text-white/80">1 year minimum tenor requirement</td>
                    <td className="py-3.5 px-6 text-red-400 font-semibold">⚠️ ALL interest forfeited if withdrawn before maturity</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-6 font-semibold text-white">Loan Multiplier Eligibility</td>
                    <td className="py-3.5 px-6 text-emerald-400 font-bold">Eligible for up to 3× loan credit</td>
                    <td className="py-3.5 px-6 text-amber-400 font-semibold">✅ Eligible as loan collateral backing</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-6 font-semibold text-white">Annual AGM Voting Rights</td>
                    <td className="py-3.5 px-6 text-emerald-400 font-semibold">Yes (Full member voting privilege)</td>
                    <td className="py-3.5 px-6 text-white/60">Requires active monthly contribution</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQs ── */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
          <p className="text-xs sm:text-sm text-white/60 mt-1">Everything you need to know about CLIMPS savings accounts.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="border border-white/10 rounded-2xl bg-[#0d1527] overflow-hidden transition-all">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full p-4 sm:p-5 text-left font-semibold text-sm sm:text-base text-white flex items-center justify-between gap-3 hover:bg-white/[0.02]"
              >
                <span>{f.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-white/50 transition-transform duration-200 ${
                    openFaq === i ? 'rotate-180 text-emerald-400' : ''
                  }`}
                />
              </button>
              {openFaq === i && (
                <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-white/70 leading-relaxed border-t border-white/10 pt-3">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-16 bg-gradient-to-br from-[#0a0f1e] via-[#0d2040] to-[#062c22] border-t border-white/10 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">Ready to Start Building Your Financial Freedom?</h3>
          <p className="text-white/75 text-sm sm:text-base mt-3 max-w-xl mx-auto leading-relaxed">
            Start your Monthly Contribution (4% monthly) to build cooperative equity, or lock your funds for 6+ months to earn premium interest at maturity.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {user ? (
              <Link
                href="/save/start"
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 transition-all active:scale-95"
              >
                Open a Savings Account
              </Link>
            ) : (
              <Link
                href={`/login?redirect=${encodeURIComponent('/save/start')}`}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 transition-all active:scale-95"
              >
                Sign In to Start Saving
              </Link>
            )}
            <Link
              href="/save/calculator"
              className="px-6 py-3 rounded-xl border border-white/20 hover:border-white/40 bg-white/[0.04] text-white font-semibold text-sm transition-all"
            >
              Savings Calculator
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
