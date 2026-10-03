'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { CreditCard, CheckCircle2, ShieldCheck, ArrowRight, Calculator, LogIn } from 'lucide-react';
import LandingNav from '../landing/components/LandingNav';
import LandingFooter from '../landing/components/LandingFooter';
import { useAuth } from '@/contexts/AuthContext';

interface LoanProduct {
  id: string;
  name: string;
  tagline: string;
  description: string;
  minAmount: string;
  maxAmount: string;
  interestRate: string;
  duration: string;
  repaymentFrequency: string;
  eligibility: string[];
  benefits: string[];
  badge: string;
  badgeColor: string;
  accentColor: string;
  popular?: boolean;
}

const loanProducts: LoanProduct[] = [
  {
    id: 'personal-loan',
    name: 'Personal Loan',
    tagline: 'Your goals, your terms.',
    description: 'Flexible personal financing for home improvements, capital projects, or personal goals. Competitive cooperative rate of 10% monthly with structured, transparent repayment schedules.',
    minAmount: '₦50,000',
    maxAmount: '₦1,500,000',
    interestRate: '10% monthly',
    duration: '3 – 24 months',
    repaymentFrequency: 'Monthly',
    eligibility: [
      'Active CLIMPS member for 6+ months',
      'Minimum savings balance ₦20,000',
      'Guarantor endorsement required for amounts above ₦500,000',
      'Consistent monthly contribution history',
    ],
    benefits: [
      'Fast review & transparent approval within 24–48 hours',
      'No early repayment penalties',
      'Flexible repayment tenure from 3 to 24 months',
      'Top-up facility available upon satisfactory repayment track',
    ],
    badge: 'Cooperative Loan',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    accentColor: 'text-emerald-400',
    popular: true,
  },
];

type FilterType = 'all';

const filters: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All Loans' },
];

const filterMap: Record<FilterType, string[]> = {
  all: ['personal-loan'],
};

function LoanCard({ product, isAuthenticated }: { product: LoanProduct; isAuthenticated: boolean }) {
  return (
    <div className="relative flex flex-col rounded-3xl border border-white/10 bg-[#0d1527] p-8 lg:p-9 shadow-2xl transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/40 group overflow-hidden">
      {/* Top pick ribbon */}
      {product.popular && (
        <div className="absolute -top-px -right-px">
          <div className="bg-emerald-600 text-white text-[10px] font-extrabold px-3.5 py-1 rounded-bl-xl rounded-tr-3xl tracking-widest uppercase shadow-md">
            ★ EXCLUSIVE PRODUCT
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-sm">
          <CreditCard className="w-6 h-6" />
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${product.badgeColor}`}>
          {product.badge}
        </span>
      </div>

      {/* Name & tagline */}
      <h3 className="text-2xl font-bold text-white mb-1 tracking-tight">{product.name}</h3>
      <p className="text-xs font-semibold text-emerald-400 mb-3">{product.tagline}</p>
      <p className="text-white/70 text-sm leading-relaxed mb-6">{product.description}</p>

      {/* Key metrics grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white/[0.03] rounded-2xl p-3.5 text-center border border-white/10">
          <div className="text-base font-extrabold text-emerald-400 font-tabular">{product.interestRate}</div>
          <div className="text-[11px] text-white/50 mt-0.5 leading-tight">Interest Rate</div>
        </div>
        <div className="bg-white/[0.03] rounded-2xl p-3.5 text-center border border-white/10">
          <div className="text-base font-bold text-white font-tabular">{product.duration}</div>
          <div className="text-[11px] text-white/50 mt-0.5 leading-tight">Repayment Period</div>
        </div>
        <div className="bg-white/[0.03] rounded-2xl p-3.5 text-center border border-white/10">
          <div className="text-sm font-bold text-white font-tabular">{product.minAmount}</div>
          <div className="text-[11px] text-white/50 mt-0.5 leading-tight">Minimum Loan</div>
        </div>
        <div className="bg-white/[0.03] rounded-2xl p-3.5 text-center border border-white/10">
          <div className="text-sm font-bold text-white font-tabular">{product.maxAmount}</div>
          <div className="text-[11px] text-white/50 mt-0.5 leading-tight">Maximum Loan</div>
        </div>
      </div>

      {/* Eligibility */}
      <div className="mb-6">
        <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2.5">Eligibility Requirements</p>
        <div className="space-y-2">
          {product.eligibility.map((e, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-white/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <span>{e}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="mb-8">
        <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2.5">Key Benefits</p>
        <div className="flex flex-wrap gap-2">
          {product.benefits.map((b, i) => (
            <span
              key={i}
              className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-white/[0.04] border border-white/10 text-white/90"
            >
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-auto pt-4 border-t border-white/10">
        {isAuthenticated ? (
          <Link
            href="/loan-application"
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-950/40 transition-all duration-150 active:scale-95"
          >
            <span>Apply for Loan</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <Link
            href={`/login?redirect=${encodeURIComponent('/loan-application')}`}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white bg-emerald-600/70 hover:bg-emerald-600 shadow-lg shadow-emerald-950/40 transition-all duration-150 active:scale-95"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Apply</span>
          </Link>
        )}
      </div>
    </div>
  );
}

export default function LoanProductsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const { user } = useAuth();

  const visibleIds = filterMap[activeFilter];
  const visibleProducts = loanProducts.filter((p) => visibleIds.includes(p.id));

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white selection:bg-emerald-500/30 selection:text-emerald-200">
      <LandingNav />

      {/* Hero Banner */}
      <section className="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24 border-b border-white/10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-5 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4" />
              <span>CLIMPS Cooperative Loan Products</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight tracking-tight">
              Fair, Transparent Financing Built for <span className="text-emerald-400">Cooperative Members</span>
            </h1>
            <p className="text-white/70 text-base lg:text-lg leading-relaxed mb-8 max-w-2xl">
              Access responsible, structured personal loans with transparent terms, standard 10% monthly interest, and no hidden charges.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/loan-application"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
              >
                <span>Apply for a Loan</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/landing#calculators"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.04] border border-white/20 text-white text-sm font-semibold hover:bg-white/10 transition-all"
              >
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span>Loan Calculator</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {[
              { value: '₦50,000', label: 'Minimum Loan', sub: 'Personal Loan' },
              { value: '10% monthly', label: 'Cooperative Rate', sub: 'Transparent terms' },
              { value: '3 – 24 mo', label: 'Flexible Tenure', sub: 'Structured repayment' },
              { value: '24–48 hrs', label: 'Fast Review', sub: 'For verified members' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-[#0d1527] backdrop-blur-md border border-white/10 rounded-2xl px-5 py-4 text-center shadow-lg"
              >
                <div className="text-xl lg:text-2xl font-extrabold text-emerald-400 font-tabular">{stat.value}</div>
                <div className="text-white text-xs font-semibold mt-1">{stat.label}</div>
                <div className="text-white/40 text-[10px] mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <section className="sticky top-16 lg:top-20 z-30 bg-[#0a0f1e]/90 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center gap-2 overflow-x-auto">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                  activeFilter === f.id
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                    : 'bg-white/[0.04] text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {f.label}
              </button>
            ))}
            <span className="flex-shrink-0 ml-auto text-xs text-white/50">
              {visibleProducts.length} loan product available
            </span>
          </div>
        </div>
      </section>

      {/* Products grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleProducts.map((product) => (
            <LoanCard key={product.id} product={product} isAuthenticated={!!user} />
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gradient-to-br from-[#0a0f1e] via-[#0d2040] to-[#062c22] border-t border-white/10 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl lg:text-4xl font-extrabold text-white mb-3 tracking-tight">
            Ready to apply for your Personal Loan?
          </h2>
          <p className="text-white/70 text-sm sm:text-base mb-8 leading-relaxed max-w-xl mx-auto">
            Complete your online application in under 5 minutes. Transparent terms, zero surprise fees.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {user ? (
              <Link
                href="/loan-application"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-500 transition-all active:scale-95 shadow-lg shadow-emerald-950/50"
              >
                <span>Apply for a Loan Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href={`/login?redirect=${encodeURIComponent('/loan-application')}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600/70 text-white text-sm font-bold hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-950/50"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Apply</span>
              </Link>
            )}
            <Link
              href="/landing"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/20 bg-white/[0.04] text-white text-sm font-semibold hover:bg-white/10 transition-all"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
