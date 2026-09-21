'use client';
import React, { useState } from 'react';
import Link from 'next/link';

type ProductCategory = 'savings' | 'investment' | 'loan';

const products = {
  savings: [
    {
      name: 'Daily Thrift Savings',
      tag: 'Most Popular',
      tagColor: 'bg-blue-100 text-blue-700',
      rate: '8% p.a.',
      rateLabel: 'Interest Rate',
      minAmount: '₦500/day',
      minLabel: 'Min. Contribution',
      duration: 'Flexible',
      durationLabel: 'Tenure',
      description: 'Save small amounts daily and watch them compound. Perfect for salary earners and traders.',
      features: ['Daily auto-debit available', 'Withdraw anytime after 90 days', 'Bonus interest at year-end'],
      color: 'border-blue-200 bg-gradient-to-br from-blue-50 to-white',
      badgeColor: 'bg-blue-600',
    },
    {
      name: 'Fixed Deposit Plan',
      tag: 'Highest Returns',
      tagColor: 'bg-emerald-100 text-emerald-700',
      rate: '12% p.a.',
      rateLabel: 'Interest Rate',
      minAmount: '₦100,000',
      minLabel: 'Min. Deposit',
      duration: '6–24 months',
      durationLabel: 'Lock-in Period',
      description: 'Lock in your funds for guaranteed high returns. Ideal for lump-sum savings.',
      features: ['Guaranteed fixed rate', 'Monthly interest payout option', 'Rollover on maturity'],
      color: 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white',
      badgeColor: 'bg-emerald-600',
    },
    {
      name: 'Target Savings Goal',
      tag: 'Goal-Based',
      tagColor: 'bg-purple-100 text-purple-700',
      rate: '10% p.a.',
      rateLabel: 'Interest Rate',
      minAmount: '₦2,000/month',
      minLabel: 'Min. Contribution',
      duration: '3–36 months',
      durationLabel: 'Goal Period',
      description: 'Set a savings target — school fees, rent, business capital — and we help you reach it.',
      features: ['Visual progress tracker', 'Milestone notifications', 'Penalty-free early exit'],
      color: 'border-purple-200 bg-gradient-to-br from-purple-50 to-white',
      badgeColor: 'bg-purple-600',
    },
  ],
  investment: [
    {
      name: 'Cooperative Shares',
      tag: 'Member Exclusive',
      tagColor: 'bg-emerald-100 text-emerald-700',
      rate: '15–20% p.a.',
      rateLabel: 'Annual Dividend',
      minAmount: '₦50,000',
      minLabel: 'Min. Investment',
      duration: 'Ongoing',
      durationLabel: 'Tenure',
      description: 'Own a stake in CLIMPS. Earn annual dividends proportional to your shareholding.',
      features: ['Voting rights at AGM', 'Annual dividend payout', 'Share value appreciation'],
      color: 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white',
      badgeColor: 'bg-emerald-600',
    },
    {
      name: 'Real Estate Fund',
      tag: 'High Growth',
      tagColor: 'bg-amber-100 text-amber-700',
      rate: '22% p.a.',
      rateLabel: 'Projected Return',
      minAmount: '₦500,000',
      minLabel: 'Min. Investment',
      duration: '24–60 months',
      durationLabel: 'Investment Period',
      description: 'Pool funds with other members to invest in prime Nigerian real estate projects.',
      features: ['Quarterly progress reports', 'Exit option after 24 months', 'Insured portfolio'],
      color: 'border-amber-200 bg-gradient-to-br from-amber-50 to-white',
      badgeColor: 'bg-amber-600',
    },
    {
      name: 'Agri-Business Fund',
      tag: 'Impact Investing',
      tagColor: 'bg-lime-100 text-lime-700',
      rate: '18% p.a.',
      rateLabel: 'Projected Return',
      minAmount: '₦100,000',
      minLabel: 'Min. Investment',
      duration: '12–24 months',
      durationLabel: 'Cycle',
      description: 'Invest in verified agricultural projects across Nigeria. Earn returns while supporting food security.',
      features: ['Seasonal harvest payouts', 'Government-backed projects', 'Impact report included'],
      color: 'border-lime-200 bg-gradient-to-br from-lime-50 to-white',
      badgeColor: 'bg-lime-600',
    },
  ],
  loan: [
    {
      name: 'Emergency Loan',
      tag: 'Fast Approval',
      tagColor: 'bg-red-100 text-red-700',
      rate: '8% p.a.',
      rateLabel: 'Interest Rate',
      minAmount: 'Up to ₦500,000',
      minLabel: 'Loan Limit',
      duration: '3–12 months',
      durationLabel: 'Repayment',
      description: 'Access funds within 24 hours for medical, family, or urgent personal needs.',
      features: ['No collateral required', 'Approval in 24 hours', 'Flexible repayment schedule'],
      color: 'border-red-200 bg-gradient-to-br from-red-50 to-white',
      badgeColor: 'bg-red-500',
    },
    {
      name: 'Business Capital Loan',
      tag: 'SME Focused',
      tagColor: 'bg-blue-100 text-blue-700',
      rate: '10% p.a.',
      rateLabel: 'Interest Rate',
      minAmount: 'Up to ₦5,000,000',
      minLabel: 'Loan Limit',
      duration: '6–36 months',
      durationLabel: 'Repayment',
      description: 'Grow your business with affordable capital. Designed for SMEs and entrepreneurs.',
      features: ['Business plan review support', 'Grace period available', 'Repeat borrower discounts'],
      color: 'border-blue-200 bg-gradient-to-br from-blue-50 to-white',
      badgeColor: 'bg-blue-600',
    },
    {
      name: 'Education Loan',
      tag: 'Zero Collateral',
      tagColor: 'bg-purple-100 text-purple-700',
      rate: '6% p.a.',
      rateLabel: 'Interest Rate',
      minAmount: 'Up to ₦2,000,000',
      minLabel: 'Loan Limit',
      duration: '12–48 months',
      durationLabel: 'Repayment',
      description: 'Fund school fees, professional certifications, or overseas education with our lowest-rate loan.',
      features: ['Disbursed directly to institution', 'Repayment starts after graduation', 'Subsidized for members 5+ years'],
      color: 'border-purple-200 bg-gradient-to-br from-purple-50 to-white',
      badgeColor: 'bg-purple-600',
    },
  ],
};

const TABS: { id: ProductCategory; label: string; icon: React.ReactNode }[] = [
  {
    id: 'savings',
    label: 'Savings Products',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'investment',
    label: 'Investment Products',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    id: 'loan',
    label: 'Loan Products',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

export default function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState<ProductCategory>('savings');
  const currentProducts = products[activeTab];

  return (
    <section id="products" className="py-20 lg:py-28 bg-muted/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white border border-border rounded-full px-4 py-1.5 mb-4">
            <span className="text-primary text-xs font-semibold uppercase tracking-widest">Featured Products</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Products built for<br />
            <span className="text-primary">every financial goal.</span>
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            From daily savings to long-term investments and accessible loans — find the right product for where you are today.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white border border-border text-muted-foreground hover:text-foreground hover:border-primary/30'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Product cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {currentProducts.map((product, idx) => (
            <div
              key={product.name}
              className={`relative rounded-2xl border-2 p-6 flex flex-col ${product.color} transition-all duration-200 hover:-translate-y-1 hover:shadow-lg`}
            >
              {/* Tag */}
              <div className="flex items-start justify-between mb-4">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${product.tagColor}`}>
                  {product.tag}
                </span>
                {idx === 0 && (
                  <div className={`w-2 h-2 rounded-full ${product.badgeColor} animate-pulse`} />
                )}
              </div>

              <h3 className="text-lg font-bold text-foreground mb-2">{product.name}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-5">{product.description}</p>

              {/* Key metrics */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                <div className="bg-white/70 rounded-xl p-3 text-center border border-white">
                  <div className="text-base font-bold text-foreground font-tabular">{product.rate}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{product.rateLabel}</div>
                </div>
                <div className="bg-white/70 rounded-xl p-3 text-center border border-white">
                  <div className="text-xs font-bold text-foreground font-tabular leading-tight">{product.minAmount}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{product.minLabel}</div>
                </div>
                <div className="bg-white/70 rounded-xl p-3 text-center border border-white">
                  <div className="text-xs font-bold text-foreground font-tabular leading-tight">{product.duration}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{product.durationLabel}</div>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-1.5 mb-6 flex-1">
                {product.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                    <svg className="w-3.5 h-3.5 text-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/"
                className={`w-full text-center py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-150 active:scale-95 ${product.badgeColor} hover:opacity-90`}
              >
                Get Started →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
