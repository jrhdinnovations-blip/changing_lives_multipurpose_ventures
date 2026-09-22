'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface SavingsProduct {
  id: string;
  name: string;
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
  bgGradient: string;
  borderColor: string;
  icon: React.ReactNode;
  popular?: boolean;
}

const savingsProducts: SavingsProduct[] = [
  {
    id: 'monthly-contribution',
    name: 'Monthly Contribution',
    tagline: 'Consistent. Disciplined. Rewarding.',
    description: 'Build wealth steadily with fixed monthly contributions. Ideal for salary earners who want a structured savings habit with guaranteed returns.',
    minAmount: '₦5,000 / month',
    interestRate: '9% p.a.',
    duration: '12 – 60 months',
    withdrawalRules: 'Withdraw after 12 months; early exit incurs 2% penalty',
    benefits: ['Auto-debit on salary day', 'Bonus 1% for 24+ month tenure', 'Monthly e-statement', 'Rollover on maturity'],
    badge: 'Most Popular',
    badgeColor: 'bg-blue-100 text-blue-700',
    accentColor: 'text-blue-600',
    bgGradient: 'from-blue-50/80 to-white',
    borderColor: 'border-blue-200',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    popular: true,
  },
  {
    id: 'regular-savings',
    name: 'Regular Savings',
    tagline: 'Save anytime. Grow always.',
    description: 'A flexible savings account with no fixed schedule. Deposit at your own pace — weekly, bi-weekly, or whenever you have surplus funds.',
    minAmount: '₦1,000 opening balance',
    interestRate: '7% p.a.',
    duration: 'No fixed term',
    withdrawalRules: 'Withdraw up to 2× per month; minimum balance ₦500',
    benefits: ['No lock-in period', 'Instant deposit via USSD/app', 'Interest credited quarterly', 'Free debit card'],
    badge: 'Flexible',
    badgeColor: 'bg-teal-100 text-teal-700',
    accentColor: 'text-teal-600',
    bgGradient: 'from-teal-50/80 to-white',
    borderColor: 'border-teal-200',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'goal-savings',
    name: 'Goal Savings',
    tagline: 'Name it. Plan it. Achieve it.',
    description: 'Set a specific financial target — rent, school fees, business capital, or a dream vacation — and save toward it with a visual progress tracker.',
    minAmount: '₦2,000 / month',
    interestRate: '10% p.a.',
    duration: '3 – 36 months',
    withdrawalRules: 'Full withdrawal on goal date; partial allowed after 50% reached',
    benefits: ['Custom goal name & target', 'Visual progress dashboard', 'Milestone push notifications', 'Penalty-free early completion'],
    badge: 'Goal-Based',
    badgeColor: 'bg-purple-100 text-purple-700',
    accentColor: 'text-purple-600',
    bgGradient: 'from-purple-50/80 to-white',
    borderColor: 'border-purple-200',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: 'emergency-savings',
    name: 'Emergency Savings',
    tagline: 'Ready when life isn\'t.',
    description: 'A dedicated safety net account that earns interest while staying accessible. Cover unexpected medical bills, repairs, or urgent needs without debt.',
    minAmount: '₦3,000 / month',
    interestRate: '8% p.a.',
    duration: 'Ongoing',
    withdrawalRules: 'Unlimited withdrawals; no penalty for emergency access',
    benefits: ['24/7 instant access', 'Linked to emergency debit card', 'No withdrawal penalty', 'Auto-replenish option'],
    badge: 'Always Accessible',
    badgeColor: 'bg-red-100 text-red-700',
    accentColor: 'text-red-600',
    bgGradient: 'from-red-50/80 to-white',
    borderColor: 'border-red-200',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    id: 'business-savings',
    name: 'Business Savings',
    tagline: 'Your business capital, growing.',
    description: 'Purpose-built for entrepreneurs and SME owners. Save business profits, build working capital reserves, and access preferential loan rates.',
    minAmount: '₦10,000 / month',
    interestRate: '11% p.a.',
    duration: '6 – 48 months',
    withdrawalRules: 'Quarterly withdrawal allowed; early exit requires 30-day notice',
    benefits: ['Preferential loan rate (−2%)', 'Business financial report', 'Dedicated relationship manager', 'Bulk transfer support'],
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
    id: 'education-savings',
    name: 'Education Savings',
    tagline: 'Invest in the future today.',
    description: 'Save for school fees, university tuition, or professional certifications. Funds are protected and earn above-average interest until the academic term.',
    minAmount: '₦2,500 / month',
    interestRate: '10.5% p.a.',
    duration: '6 – 60 months',
    withdrawalRules: 'Withdrawal tied to academic calendar; disbursed directly to institution',
    benefits: ['Academic calendar disbursement', 'Direct payment to institution', 'Bonus interest for 3+ years', 'Scholarship top-up program'],
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
  {
    id: 'fixed-deposit',
    name: 'Fixed Deposit',
    tagline: 'Lock in. Earn more.',
    description: 'Commit a lump sum for a fixed period and earn the highest guaranteed interest rate in our portfolio. Best for members with idle capital.',
    minAmount: '₦100,000 lump sum',
    interestRate: '12% p.a.',
    duration: '6 – 24 months',
    withdrawalRules: 'No withdrawal before maturity; early exit forfeits accrued interest',
    benefits: ['Highest guaranteed rate', 'Monthly interest payout option', 'Auto-rollover on maturity', 'Certificate of deposit issued'],
    badge: 'Highest Returns',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    accentColor: 'text-emerald-600',
    bgGradient: 'from-emerald-50/80 to-white',
    borderColor: 'border-emerald-200',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    id: 'daily-thrift',
    name: 'Daily Thrift Savings',
    tagline: 'Small drops. Big ocean.',
    description: 'Save as little as ₦500 per day and watch it compound over time. Perfect for market traders, artisans, and daily income earners.',
    minAmount: '₦500 / day',
    interestRate: '8% p.a.',
    duration: 'Flexible',
    withdrawalRules: 'Withdraw anytime after 90 days; no minimum balance required',
    benefits: ['Daily auto-debit via USSD', 'Withdraw after 90 days', 'Year-end bonus interest', 'Agent banking supported'],
    badge: 'Entry Level',
    badgeColor: 'bg-sky-100 text-sky-700',
    accentColor: 'text-sky-600',
    bgGradient: 'from-sky-50/80 to-white',
    borderColor: 'border-sky-200',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

type FilterType = 'all' | 'flexible' | 'fixed' | 'goal';

const filters: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All Products' },
  { id: 'flexible', label: 'Flexible Access' },
  { id: 'fixed', label: 'Fixed Term' },
  { id: 'goal', label: 'Goal-Based' },
];

const filterMap: Record<FilterType, string[]> = {
  all: savingsProducts.map((p) => p.id),
  flexible: ['regular-savings', 'emergency-savings', 'daily-thrift'],
  fixed: ['monthly-contribution', 'fixed-deposit', 'business-savings'],
  goal: ['goal-savings', 'education-savings', 'monthly-contribution'],
};

function ProductCard({ product }: { product: SavingsProduct }) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border-2 ${product.borderColor} bg-gradient-to-br ${product.bgGradient} p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group`}
    >
      {/* Popular ribbon */}
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
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white/80 rounded-xl p-3 text-center border border-white/90">
          <div className={`text-sm font-bold font-tabular ${product.accentColor}`}>{product.interestRate}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Interest Rate</div>
        </div>
        <div className="bg-white/80 rounded-xl p-3 text-center border border-white/90">
          <div className="text-[11px] font-bold text-foreground font-tabular leading-tight">{product.minAmount}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Min. Amount</div>
        </div>
        <div className="bg-white/80 rounded-xl p-3 text-center border border-white/90">
          <div className="text-[11px] font-bold text-foreground font-tabular leading-tight">{product.duration}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Duration</div>
        </div>
      </div>

      {/* Withdrawal rules */}
      <div className="flex items-start gap-2 bg-white/60 rounded-xl px-3 py-2.5 mb-4 border border-white/80">
        <svg className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{product.withdrawalRules}</p>
      </div>

      {/* Benefits */}
      <div className="mb-5 flex-1">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Key Benefits</p>
        <ul className="space-y-1.5">
          {product.benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-2 text-xs text-foreground">
              <svg className={`w-3.5 h-3.5 flex-shrink-0 ${product.accentColor}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <Link
        href={`/save/start?product=${product.id}`}
        className="w-full inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold rounded-xl px-5 py-2.5 text-sm transition-all duration-150 hover:bg-primary/90 active:scale-95 group-hover:shadow-md"
      >
        Start Saving
        <svg className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    </div>
  );
}

export default function SavingsProductsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const visibleIds = filterMap[activeFilter];
  const visibleProducts = savingsProducts.filter((p) => visibleIds.includes(p.id));

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/landing" className="flex items-center gap-2.5">
              <Image
                src="/assets/images/WhatsApp_Image_2026-09-19_at_12.24.54-1789999920386.jpeg"
                alt="CLIMPS Cooperative Logo"
                width={32}
                height={32}
                className="rounded-lg object-cover"
              />
              <span className="font-bold text-base text-primary tracking-tight">CLIMPS</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="btn-accent text-sm px-4 py-2">
                Become a Member
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero banner */}
      <div className="gradient-primary py-14 lg:py-20 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/landing" className="text-white/60 text-sm hover:text-white/90 transition-colors">Home</Link>
            <svg className="w-3.5 h-3.5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white/90 text-sm font-medium">Savings Products</span>
          </div>

          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-white/90 text-xs font-semibold uppercase tracking-widest">8 Savings Products Available</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Save smarter with<br />
              <span className="text-accent">CLIMPS Cooperative.</span>
            </h1>
            <p className="text-white/70 text-base lg:text-lg leading-relaxed max-w-xl">
              From daily thrift to fixed deposits — every product is designed to grow your money safely, with transparent rates and zero hidden fees.
            </p>
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap gap-6 mt-10">
            {[
              { label: 'Average Interest Rate', value: '9.3% p.a.' },
              { label: 'Active Savers', value: '12,400+' },
              { label: 'Total Savings Managed', value: '₦4.2B+' },
              { label: 'Payout Reliability', value: '100%' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 border border-white/15 rounded-xl px-5 py-3">
                <div className="text-white font-bold text-lg font-tabular">{stat.value}</div>
                <div className="text-white/60 text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white border-b border-border sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-thin">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  activeFilter === f.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                }`}
              >
                {f.label}
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-md ${activeFilter === f.id ? 'bg-white/20 text-white' : 'bg-border text-muted-foreground'}`}>
                  {filterMap[f.id].length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {activeFilter === 'all' ? 'All Savings Products' : filters.find((f) => f.id === activeFilter)?.label}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {visibleProducts.length} product{visibleProducts.length !== 1 ? 's' : ''} available
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-xl px-3 py-2">
            <svg className="w-3.5 h-3.5 text-accent" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            NDIC insured · CBN regulated
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Bottom CTA banner */}
        <div className="mt-16 rounded-2xl gradient-primary p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white -translate-y-1/2 translate-x-1/4" />
          </div>
          <div className="relative text-center lg:text-left">
            <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">Not sure which product fits you?</h3>
            <p className="text-white/70 text-sm lg:text-base max-w-lg">
              Our financial advisors will help you pick the right savings plan based on your income, goals, and timeline — at no cost.
            </p>
          </div>
          <div className="relative flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link href="/save/start" className="inline-flex items-center justify-center gap-2 bg-accent text-white font-semibold rounded-xl px-6 py-3 text-sm hover:bg-accent/90 transition-all active:scale-95">
              Start Saving Now
            </Link>
            <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-semibold rounded-xl px-6 py-3 text-sm hover:bg-white/20 transition-all active:scale-95">
              Talk to an Advisor
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/assets/images/WhatsApp_Image_2026-09-19_at_12.24.54-1789999920386.jpeg"
              alt="CLIMPS Logo"
              width={24}
              height={24}
              className="rounded object-cover"
            />
            <span className="text-sm font-semibold text-primary">CLIMPS Cooperative</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            © 2026 CLIMPS Multipurpose Cooperative Society. Regulated by the CBN. All deposits are NDIC insured.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/landing" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
