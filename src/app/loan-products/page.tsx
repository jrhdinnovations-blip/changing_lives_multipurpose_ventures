'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
  bgGradient: string;
  borderColor: string;
  icon: React.ReactNode;
  popular?: boolean;
}

const loanProducts: LoanProduct[] = [
  {
    id: 'emergency-loan',
    name: 'Emergency Loan',
    tagline: 'Fast cash when it matters most.',
    description: 'Instant disbursement for urgent needs — medical bills, repairs, or unexpected expenses. Minimal documentation, same-day approval for active members.',
    minAmount: '₦10,000',
    maxAmount: '₦200,000',
    interestRate: '5% flat',
    duration: '1 – 3 months',
    repaymentFrequency: 'Monthly',
    eligibility: ['Active member for 3+ months', 'No outstanding default', 'Valid ID + BVN'],
    benefits: ['Same-day disbursement', 'No collateral required', 'Minimal documentation', 'Automatic approval for eligible members'],
    badge: 'Instant Access',
    badgeColor: 'bg-red-100 text-red-700',
    accentColor: 'text-red-600',
    bgGradient: 'from-red-50/80 to-white',
    borderColor: 'border-red-200',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    popular: true,
  },
  {
    id: 'personal-loan',
    name: 'Personal Loan',
    tagline: 'Your goals, your terms.',
    description: 'Flexible personal financing for home improvements, travel, weddings, or any personal project. Competitive rates with structured repayment plans.',
    minAmount: '₦50,000',
    maxAmount: '₦1,500,000',
    interestRate: '8% p.a.',
    duration: '3 – 24 months',
    repaymentFrequency: 'Monthly',
    eligibility: ['Active member for 6+ months', 'Minimum savings balance ₦20,000', 'Guarantor required above ₦500k'],
    benefits: ['No early repayment penalty', 'Flexible repayment schedule', 'Top-up facility available', 'Loan restructuring option'],
    badge: 'Most Popular',
    badgeColor: 'bg-blue-100 text-blue-700',
    accentColor: 'text-blue-600',
    bgGradient: 'from-blue-50/80 to-white',
    borderColor: 'border-blue-200',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: 'business-loan',
    name: 'Business Loan',
    tagline: 'Capital to grow your enterprise.',
    description: 'Purpose-built financing for SMEs and entrepreneurs. Fund inventory, equipment, expansion, or working capital with preferential rates for business savers.',
    minAmount: '₦100,000',
    maxAmount: '₦5,000,000',
    interestRate: '10% p.a.',
    duration: '6 – 36 months',
    repaymentFrequency: 'Monthly / Quarterly',
    eligibility: ['Business savings account holder', 'CAC registration (for ₦500k+)', 'Active member for 12+ months'],
    benefits: ['Preferential rate for business savers', 'Quarterly repayment option', 'Dedicated relationship manager', 'Business advisory support'],
    badge: 'SME Focused',
    badgeColor: 'bg-amber-100 text-amber-700',
    accentColor: 'text-amber-600',
    bgGradient: 'from-amber-50/80 to-white',
    borderColor: 'border-amber-200',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    id: 'salary-loan',
    name: 'Salary Loan',
    tagline: 'Advance on your earnings.',
    description: 'Salary-backed financing for employed members. Repayment is automatically deducted from monthly salary, making it stress-free and disciplined.',
    minAmount: '₦30,000',
    maxAmount: '₦3,000,000',
    interestRate: '6% p.a.',
    duration: '3 – 18 months',
    repaymentFrequency: 'Monthly (salary deduction)',
    eligibility: ['Confirmed employment letter', 'Salary domiciled with CLIMPS', 'Active member for 3+ months'],
    benefits: ['Auto salary deduction', 'Up to 3× net monthly salary', 'No guarantor for amounts ≤₦500k', 'Instant approval for eligible staff'],
    badge: 'Salary-Backed',
    badgeColor: 'bg-teal-100 text-teal-700',
    accentColor: 'text-teal-600',
    bgGradient: 'from-teal-50/80 to-white',
    borderColor: 'border-teal-200',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    id: 'special-loan',
    name: 'Special Loan',
    tagline: 'Tailored for life\'s big moments.',
    description: 'High-value financing for major life events — land purchase, housing, vehicle acquisition, or large-scale projects. Structured with extended tenure and flexible terms.',
    minAmount: '₦500,000',
    maxAmount: '₦10,000,000',
    interestRate: '9% p.a.',
    duration: '12 – 60 months',
    repaymentFrequency: 'Monthly',
    eligibility: ['Active member for 24+ months', 'Collateral or guarantor required', 'Minimum savings balance ₦100,000'],
    benefits: ['Extended 5-year tenure', 'Collateral-backed security', 'Moratorium period available', 'Loan insurance included'],
    badge: 'High Value',
    badgeColor: 'bg-purple-100 text-purple-700',
    accentColor: 'text-purple-600',
    bgGradient: 'from-purple-50/80 to-white',
    borderColor: 'border-purple-200',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    id: 'education-loan',
    name: 'Education Loan',
    tagline: 'Invest in knowledge, repay with growth.',
    description: 'Finance school fees, university tuition, professional certifications, or study abroad programs. Disbursed directly to institutions with student-friendly repayment.',
    minAmount: '₦20,000',
    maxAmount: '₦2,000,000',
    interestRate: '5% p.a.',
    duration: '3 – 24 months',
    repaymentFrequency: 'Monthly / Per Term',
    eligibility: ['Active member or parent/guardian', 'Admission letter or fee invoice', 'Guarantor for amounts above ₦500k'],
    benefits: ['Direct payment to institution', 'Per-term disbursement option', 'Grace period during studies', 'Reduced rate for returning borrowers'],
    badge: 'Education',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    accentColor: 'text-indigo-600',
    bgGradient: 'from-indigo-50/80 to-white',
    borderColor: 'border-indigo-200',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    ),
  },
];

type FilterType = 'all' | 'short-term' | 'long-term' | 'no-collateral';

const filters: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All Loans' },
  { id: 'short-term', label: 'Short Term (≤6 months)' },
  { id: 'long-term', label: 'Long Term (12+ months)' },
  { id: 'no-collateral', label: 'No Collateral' },
];

const filterMap: Record<FilterType, string[]> = {
  all: loanProducts.map((p) => p.id),
  'short-term': ['emergency-loan', 'personal-loan', 'salary-loan'],
  'long-term': ['business-loan', 'special-loan', 'personal-loan'],
  'no-collateral': ['emergency-loan', 'personal-loan', 'salary-loan', 'education-loan'],
};

function LoanCard({ product }: { product: LoanProduct }) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border-2 ${product.borderColor} bg-gradient-to-br ${product.bgGradient} p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group`}
    >
      {/* Top pick ribbon */}
      {product.popular && (
        <div className="absolute -top-px -right-px">
          <div className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl tracking-wide">
            ★ TOP PICK
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl bg-white border border-border flex items-center justify-center ${product.accentColor} shadow-sm`}>
          {product.icon}
        </div>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${product.badgeColor}`}>
          {product.badge}
        </span>
      </div>

      {/* Name & tagline */}
      <h3 className="text-lg font-bold text-foreground mb-0.5">{product.name}</h3>
      <p className={`text-xs font-semibold ${product.accentColor} mb-3`}>{product.tagline}</p>
      <p className="text-muted-foreground text-sm leading-relaxed mb-5">{product.description}</p>

      {/* Key metrics grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-white/80 rounded-xl p-3 text-center border border-white/90">
          <div className={`text-sm font-bold ${product.accentColor}`}>{product.interestRate}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Interest Rate</div>
        </div>
        <div className="bg-white/80 rounded-xl p-3 text-center border border-white/90">
          <div className="text-[11px] font-bold text-foreground leading-tight">{product.duration}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Duration</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-white/80 rounded-xl p-3 text-center border border-white/90">
          <div className="text-[11px] font-bold text-foreground leading-tight">{product.minAmount}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Min Amount</div>
        </div>
        <div className="bg-white/80 rounded-xl p-3 text-center border border-white/90">
          <div className="text-[11px] font-bold text-foreground leading-tight">{product.maxAmount}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Max Amount</div>
        </div>
      </div>

      {/* Repayment frequency */}
      <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-white/60 rounded-xl border border-white/80">
        <svg className={`w-4 h-4 flex-shrink-0 ${product.accentColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-xs text-muted-foreground">Repayment: <span className="font-semibold text-foreground">{product.repaymentFrequency}</span></span>
      </div>

      {/* Eligibility */}
      <div className="mb-4">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Eligibility</p>
        <ul className="space-y-1">
          {product.eligibility.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <svg className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${product.accentColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Benefits */}
      <div className="mb-5">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Key Benefits</p>
        <div className="flex flex-wrap gap-1.5">
          {product.benefits.map((b, i) => (
            <span key={i} className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/80 border border-border text-foreground`}>
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-auto">
        <Link
          href="/"
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150 active:scale-95 shadow-sm hover:shadow-md`}
          style={{ background: 'var(--color-primary)' }}
        >
          Apply for Loan
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

export default function LoanProductsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const visibleIds = filterMap[activeFilter];
  const visibleProducts = loanProducts.filter((p) => visibleIds.includes(p.id));

  return (
    <div className="min-h-screen bg-background">
      {/* Nav spacer */}
      <div className="h-16 lg:h-20" />

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-accent/80 py-16 lg:py-20">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full translate-y-1/2 -translate-x-1/4" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-white/90 text-xs font-semibold mb-5 backdrop-blur-sm">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              CLIMPS Loan Products
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
              Financing Built for<br />
              <span className="text-accent/90">Every Need</span>
            </h1>
            <p className="text-white/80 text-base lg:text-lg leading-relaxed mb-8">
              From emergency cash to business capital — access fair, transparent loans with competitive rates and flexible repayment plans designed for cooperative members.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-primary text-sm font-semibold hover:bg-white/90 transition-all active:scale-95 shadow-md"
              >
                Apply for a Loan
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/landing"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition-all active:scale-95 backdrop-blur-sm"
              >
                Check Eligibility
              </Link>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: '₦10K', label: 'Minimum Loan', sub: 'Emergency Loan' },
              { value: '5%', label: 'Lowest Rate', sub: 'p.a. flat' },
              { value: '60 mo', label: 'Max Tenure', sub: 'Special Loan' },
              { value: '24hrs', label: 'Avg Disbursement', sub: 'For eligible members' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-3 text-center">
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-white/80 text-xs font-semibold mt-0.5">{stat.label}</div>
                <div className="text-white/50 text-[10px] mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <section className="sticky top-16 lg:top-20 z-30 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  activeFilter === f.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
            <span className="flex-shrink-0 ml-auto text-xs text-muted-foreground whitespace-nowrap">
              {visibleProducts.length} product{visibleProducts.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </section>

      {/* Products grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleProducts.map((product) => (
            <LoanCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-t border-border py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
            Not sure which loan is right for you?
          </h2>
          <p className="text-muted-foreground text-base mb-8 leading-relaxed">
            Our loan advisors will assess your needs and recommend the best product with the most favourable terms for your situation.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all active:scale-95 shadow-md"
            >
              Apply for a Loan
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/landing"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-primary text-primary text-sm font-semibold hover:bg-primary/5 transition-all active:scale-95"
            >
              Talk to an Advisor
            </Link>
          </div>
        </div>
      </section>

      {/* Footer nav */}
      <footer className="border-t border-border bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Image
              src="/assets/images/WhatsApp_Image_2026-09-19_at_12.24.54-1789999920386.jpeg"
              alt="CLIMPS Cooperative Logo"
              width={32}
              height={32}
              className="rounded-lg object-cover"
            />
            <span className="font-bold text-base text-primary">CLIMPS</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/landing" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/savings-products" className="hover:text-foreground transition-colors">Savings</Link>
            <Link href="/loan-products" className="hover:text-foreground transition-colors font-semibold text-foreground">Loans</Link>
            <Link href="/" className="hover:text-foreground transition-colors">Sign In</Link>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 CLIMPS Cooperative. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
